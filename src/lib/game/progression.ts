import { getNextTransformation, getTransformation } from "./transformations";

export function progressToNext(kiTotal: number): { currentName: string; nextName: string | null; currentKi: number; nextKi: number | null; remaining: number | null; } {
  const current = getTransformation(kiTotal);
  const next = getNextTransformation(kiTotal);
  return {
    currentName: `${current.emoji} ${current.name}`,
    nextName: next ? `${next.emoji} ${next.name}` : null,
    currentKi: kiTotal,
    nextKi: next?.minKi ?? null,
    remaining: next ? Math.max(0, next.minKi - kiTotal) : null
  };
}
