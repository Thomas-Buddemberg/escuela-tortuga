import type { TransformationKey } from "./models";

export interface Transformation {
  key: TransformationKey;
  name: string;
  minKi: number;
  emoji: string;
}

export const TRANSFORMATIONS: Transformation[] = [
  { key: "normal", name: "Normal", minKi: 0, emoji: "🙂" },
  { key: "kaioken", name: "Kaioken", minKi: 100, emoji: "🔥" },
  { key: "kaioken10", name: "Kaioken ×10", minKi: 300, emoji: "🔥🔥" },
  { key: "ssj", name: "Súper Saiyan", minKi: 600, emoji: "💛" },
  { key: "ssj2", name: "Súper Saiyan 2", minKi: 1000, emoji: "⚡" },
  { key: "ssj3", name: "Súper Saiyan 3", minKi: 1500, emoji: "🔥" },
  { key: "ssj4", name: "Súper Saiyan 4", minKi: 2200, emoji: "🦍" },
  { key: "god", name: "Súper Saiyan Dios", minKi: 3000, emoji: "🔴" },
  { key: "blue", name: "Súper Saiyan Dios SS", minKi: 4000, emoji: "🔵" },
  { key: "blue_kaioken", name: "Dios SS + Kaioken", minKi: 5500, emoji: "🔵🔥" },
  { key: "ui", name: "Ultra Instinto", minKi: 7000, emoji: "⚪" },
  { key: "mui", name: "Ultra Instinto Dominado", minKi: 9000, emoji: "⚪✨" }
];

export function getTransformation(kiTotal: number): Transformation {
  // Devuelve la forma más alta alcanzada
  let current = TRANSFORMATIONS[0]!;
  for (const t of TRANSFORMATIONS) {
    if (kiTotal >= t.minKi) current = t;
  }
  return current;
}

export function getNextTransformation(kiTotal: number): Transformation | null {
  for (const t of TRANSFORMATIONS) {
    if (kiTotal < t.minKi) return t;
  }
  return null;
}

export function unlockedTransformations(kiTotal: number): Transformation[] {
  return TRANSFORMATIONS.filter((t) => kiTotal >= t.minKi);
}
