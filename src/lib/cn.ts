import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["2xs", "caption", "body", "lead", "display"],
      radius: ["xs", "sm", "md", "box", "card-lg", "panel", "btn", "btn-sm"],
      shadow: ["card", "lift", "lift-dark", "header", "pop"],
      container: ["content", "admin"],
      ease: ["miqat"],
      leading: ["prose", "loose"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
