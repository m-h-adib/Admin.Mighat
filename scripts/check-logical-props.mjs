#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("../src", import.meta.url).pathname;
const forbidden = new RegExp(
  String.raw`(?<![\w:-])-?(?:` +
    [
      String.raw`m[lr]-`,
      String.raw`p[lr]-`,
      String.raw`(?:left|right)-`,
      String.raw`text-(?:left|right)\b`,
      String.raw`border-[lr](?:-|\b)`,
      String.raw`rounded-(?:[lr]|[tb][lr])(?:-|\b)`,
      String.raw`scroll-[mp][lr]-`,
      String.raw`float-(?:left|right)\b`,
      String.raw`clear-(?:left|right)\b`,
    ].join("|") +
    ")",
  "g",
);

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (/\.(tsx?|css)$/.test(entry.name)) yield path;
  }
}

const problems = [];
for await (const file of files(root)) {
  const lines = (await readFile(file, "utf8")).split("\n");
  lines.forEach((line, index) => {
    for (const literal of line.match(/(["'`])(?:(?!\1).)*\1/g) ?? []) {
      for (const match of literal.matchAll(forbidden)) {
        problems.push(
          `${relative(process.cwd(), file)}:${index + 1}  "${match[0]}"  in ${literal.trim()}`,
        );
      }
    }
  });
}

if (problems.length) {
  console.error(
    `Physical left/right utilities found (use logical ones):\n  ${problems.join("\n  ")}`,
  );
  process.exit(1);
}
console.log("✓ logical properties only");
