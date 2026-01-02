import type { KiActionType, SettingsState } from "./models";

export const ACTION_KI: Record<KiActionType, number> = {
  workout_quick: 10,
  workout_full: 20,
  capsule_30: 20,
  capsule_60: 40,
  walk: 5,
  mobility: 5,
  sleep: 5,
  food: 5,
  streak_bonus: 25,
  manual_adjust: 0
};

export function difficultyMultiplier(difficulty: SettingsState["difficulty"]): number {
  if (difficulty === "easy") return 0.85;
  if (difficulty === "hard") return 1.15;
  return 1.0;
}

/**
 * Se aplica un cap diario SOLO a acciones normales (no a bonus).
 * Si quieres una economía aún más estricta, cámbialo aquí.
 */
export function isCappedAction(type: KiActionType): boolean {
  return type !== "streak_bonus";
}
