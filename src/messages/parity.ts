import type fa from "./fa.json";
import type en from "./en.json";

type DeepKeys<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : K | `${K}.${DeepKeys<T[K]>}` }[keyof T &
      string];

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;

export const enMatchesFa: Same<DeepKeys<typeof en>, DeepKeys<typeof fa>> = true;
