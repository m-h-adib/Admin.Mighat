export type SearchParams = Record<string, string | string[] | undefined>;

export function readParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return typeof value === "string" && value !== "" ? value : undefined;
}

export function readOption<T extends string>(
  params: SearchParams,
  key: string,
  options: readonly T[],
): T | undefined {
  const value = readParam(params, key);
  return options.includes(value as T) ? (value as T) : undefined;
}

export function readPage(params: SearchParams): number {
  const page = Number(readParam(params, "page"));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function toQueryString(params: SearchParams, omit: string[] = []) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value && !omit.includes(key)) search.set(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
