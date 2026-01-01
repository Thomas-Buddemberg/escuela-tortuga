import type { WorkoutExercise } from "./models";

export const EXERCISES: WorkoutExercise[] = [
  // Push
  { id: "pushup_knee", name: "Flexiones con rodillas", sets: 3, reps: 8, restSec: 60, minKi: 0, tags: ["push"] },
  { id: "pushup", name: "Flexiones", sets: 3, reps: 8, restSec: 60, minKi: 50, tags: ["push"] },
  { id: "pushup_slow", name: "Flexiones lentas (3s bajada)", sets: 4, reps: 10, restSec: 75, minKi: 300, tags: ["push"] },
  { id: "pushup_decline", name: "Flexiones declinadas", sets: 4, reps: 10, restSec: 90, minKi: 600, tags: ["push"] },
  { id: "dips_chair", name: "Fondos en silla/banco", sets: 3, reps: 10, restSec: 75, minKi: 250, tags: ["push", "triceps"] },

  // Legs
  { id: "squat", name: "Sentadillas aire", sets: 3, reps: 15, restSec: 60, minKi: 0, tags: ["legs"] },
  { id: "squat_pause", name: "Sentadilla con pausa (1s abajo)", sets: 4, reps: 15, restSec: 75, minKi: 100, tags: ["legs"] },
  { id: "lunge", name: "Zancadas", sets: 3, reps: 10, restSec: 75, minKi: 100, tags: ["legs"] },
  { id: "split_squat", name: "Split squat (estático)", sets: 4, reps: 10, restSec: 90, minKi: 600, tags: ["legs"] },
  { id: "jump_squat", name: "Sentadillas con salto", sets: 4, reps: 12, restSec: 90, minKi: 1000, tags: ["legs", "power"] },

  // Core
  { id: "plank", name: "Plancha", sets: 3, timeSec: 20, restSec: 45, minKi: 0, tags: ["core"] },
  { id: "plank_30", name: "Plancha", sets: 3, timeSec: 30, restSec: 45, minKi: 100, tags: ["core"] },
  { id: "side_plank", name: "Plancha lateral", sets: 3, timeSec: 25, restSec: 45, minKi: 600, tags: ["core"] },
  { id: "hollow", name: "Hollow hold", sets: 3, timeSec: 30, restSec: 45, minKi: 300, tags: ["core"] },
  { id: "mountain_climbers", name: "Mountain climbers", sets: 3, timeSec: 30, restSec: 45, minKi: 600, tags: ["conditioning", "core"] },

  // Conditioning
  { id: "burpees", name: "Burpees", sets: 4, reps: 8, restSec: 90, minKi: 1000, tags: ["conditioning"] },
  { id: "bear_crawl", name: "Bear crawl (ida y vuelta)", sets: 4, timeSec: 25, restSec: 75, minKi: 1500, tags: ["conditioning"] }
];

/**
 * Devuelve el ejercicio más apropiado según KI y un conjunto de IDs candidatos.
 * Usa el más alto desbloqueado (minKi más alto <= kiTotal).
 */
export function pickBestExercise(kiTotal: number, candidates: string[]): WorkoutExercise {
  const pool = EXERCISES.filter((e) => candidates.includes(e.id));
  if (pool.length === 0) throw new Error("No candidates for exercise pick");
  const unlocked = pool.filter((e) => kiTotal >= e.minKi);
  if (unlocked.length === 0) {
    // si ninguno está desbloqueado, vuelve al de menor minKi
    return pool.sort((a, b) => a.minKi - b.minKi)[0]!;
  }
  return unlocked.sort((a, b) => b.minKi - a.minKi)[0]!;
}
