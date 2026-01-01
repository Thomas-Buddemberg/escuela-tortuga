import type { SettingsState, WorkoutBlock, WorkoutExercise, WorkoutPlan } from "./models";
import { getTransformation } from "./transformations";
import { difficultyMultiplier } from "./rules";
import { pickBestExercise } from "./exercises";

/**
 * Plantillas por 'tier' (minKi).
 * Nota: Las prescripciones base vienen de EXERCISES y se ajustan por dificultad.
 */
interface WorkoutTemplate {
  id: string;
  name: string;
  minKi: number;
  estimatedMinutes: number;
  type: "full" | "splitA" | "splitB";
  notes: string[];
}

export const TEMPLATES: WorkoutTemplate[] = [
  { id: "turtle_basic", name: "Escuela de la Tortuga — Base", minKi: 0, estimatedMinutes: 18, type: "full", notes: ["Técnica > velocidad", "Deja 1–2 reps en reserva"] },
  { id: "turtle_kaioken", name: "Kaioken — Volumen controlado", minKi: 100, estimatedMinutes: 22, type: "full", notes: ["Respira y controla ritmo", "Descansos completos"] },
  { id: "turtle_kaioken10", name: "Kaioken ×10 — Intensidad", minKi: 300, estimatedMinutes: 26, type: "full", notes: ["Mantén forma estricta", "Si duele (articulación), baja variante"] },
  { id: "turtle_ssj_A", name: "Súper Saiyan — Día A (Empuje + core)", minKi: 600, estimatedMinutes: 28, type: "splitA", notes: ["Sube volumen de push", "Core sólido"] },
  { id: "turtle_ssj_B", name: "Súper Saiyan — Día B (Piernas + core)", minKi: 600, estimatedMinutes: 28, type: "splitB", notes: ["Piernas y estabilidad", "Control de rodillas"] },
  { id: "turtle_ssj2_A", name: "SSJ2 — Potencia (A)", minKi: 1000, estimatedMinutes: 32, type: "splitA", notes: ["Explosividad con control", "No busques fallo"] },
  { id: "turtle_ssj2_B", name: "SSJ2 — Potencia (B)", minKi: 1000, estimatedMinutes: 32, type: "splitB", notes: ["Saltos moderados", "Recuperación completa"] },
  { id: "turtle_ssj3", name: "SSJ3 — Resistencia", minKi: 1500, estimatedMinutes: 34, type: "full", notes: ["Circuitos", "Ritmo constante"] },
  { id: "turtle_ssj4", name: "SSJ4 — Fuerza total", minKi: 2200, estimatedMinutes: 36, type: "full", notes: ["Control corporal", "Calienta bien"] },
  { id: "turtle_god", name: "Saiyan Dios — Precisión", minKi: 3000, estimatedMinutes: 30, type: "full", notes: ["Menos pero mejor", "Reps perfectas"] },
  { id: "turtle_blue", name: "Dios SS — Explosivo", minKi: 4000, estimatedMinutes: 34, type: "full", notes: ["Explosividad + técnica", "Descanso suficiente"] },
  { id: "turtle_blue_kaioken", name: "Dios SS + Kaioken — Alternado", minKi: 5500, estimatedMinutes: 36, type: "full", notes: ["Autoregulación", "Si estás agotado: modo corto"] },
  { id: "turtle_ui", name: "Ultra Instinto — Fluidez", minKi: 7000, estimatedMinutes: 34, type: "full", notes: ["Fluye", "Movimiento limpio"] },
  { id: "turtle_mui", name: "UI Dominado — Maestría", minKi: 9000, estimatedMinutes: 36, type: "full", notes: ["Consistencia", "Detalles y respiración"] }
];

function pickTemplateId(kiTotal: number, dateISO: string): WorkoutTemplate {
  // elige la más alta desbloqueada
  const unlocked = TEMPLATES.filter((t) => kiTotal >= t.minKi).sort((a, b) => b.minKi - a.minKi);
  const best = unlocked[0] ?? TEMPLATES[0]!;
  // si el template es split, alterna A/B por paridad del día (simple)
  if (best.type === "splitA" || best.type === "splitB") {
    const day = Number(dateISO.slice(-2)); // dd
    const wantA = day % 2 === 0;
    const prefix = best.id.includes("_A") || best.id.includes("_B") ? best.id.slice(0, -2) : best.id;
    const alt = unlocked.find((t) => t.id.startsWith(prefix) && (wantA ? t.type === "splitA" : t.type === "splitB"));
    return alt ?? best;
  }
  return best;
}

function scaleExercise(e: WorkoutExercise, mult: number): WorkoutExercise {
  const out: WorkoutExercise = { ...e };
  // Escala reps o tiempo ligeramente; sets se mantiene para estabilidad.
  if (typeof out.reps === "number") out.reps = Math.max(1, Math.round(out.reps * mult));
  if (typeof out.timeSec === "number") out.timeSec = Math.max(10, Math.round(out.timeSec * mult));
  return out;
}

export function generateWorkoutPlan(kiTotal: number, settings: SettingsState, dateISO: string): WorkoutPlan {
  const t = pickTemplateId(kiTotal, dateISO);
  const transformation = getTransformation(kiTotal).key;
  const mult = difficultyMultiplier(settings.difficulty);

  // Selección inteligente por KI: candidates por categoría
  const push = pickBestExercise(kiTotal, ["pushup_knee", "pushup", "pushup_slow", "pushup_decline"]);
  const legs = pickBestExercise(kiTotal, ["squat", "squat_pause", "lunge", "split_squat", "jump_squat"]);
  const core = pickBestExercise(kiTotal, ["plank", "plank_30", "hollow", "side_plank", "mountain_climbers"]);
  const triceps = pickBestExercise(kiTotal, ["dips_chair", "pushup"]);

  // Conditioning por tier
  const conditioning = pickBestExercise(kiTotal, ["mountain_climbers", "burpees", "bear_crawl"]);

  const warmup: WorkoutBlock = {
    name: "Calentamiento (3–5 min)",
    exercises: [
      { id: "warm_mobility", name: "Movilidad general (cuello, hombros, cadera)", sets: 1, timeSec: 180, restSec: 0, minKi: 0, tags: ["warmup"] },
      { id: "warm_activation", name: "Activación (sentadilla suave + brazos)", sets: 1, timeSec: 120, restSec: 0, minKi: 0, tags: ["warmup"] }
    ]
  };

  const mainFull: WorkoutBlock[] = [
    { name: "Bloque A (Fuerza)", exercises: [scaleExercise(push, mult), scaleExercise(legs, mult)] },
    { name: "Bloque B (Accesorios)", exercises: [scaleExercise(triceps, mult), scaleExercise(core, mult)] }
  ];

  const splitA: WorkoutBlock[] = [
    { name: "Bloque A (Empuje)", exercises: [scaleExercise(push, mult), scaleExercise(triceps, mult)] },
    { name: "Bloque B (Core)", exercises: [scaleExercise(core, mult)] }
  ];

  const splitB: WorkoutBlock[] = [
    { name: "Bloque A (Piernas)", exercises: [scaleExercise(legs, mult)] },
    { name: "Bloque B (Core + estabilidad)", exercises: [scaleExercise(core, mult)] }
  ];

  const finisher: WorkoutBlock = {
    name: "Finisher (opcional, 3–6 min)",
    exercises: [scaleExercise(conditioning, mult)]
  };

  const cooldown: WorkoutBlock = {
    name: "Vuelta a la calma (2–4 min)",
    exercises: [
      { id: "cool_breath", name: "Respiración nasal + caminar suave", sets: 1, timeSec: 120, restSec: 0, minKi: 0, tags: ["cooldown"] },
      { id: "cool_stretch", name: "Estiramiento suave (piernas/pecho)", sets: 1, timeSec: 120, restSec: 0, minKi: 0, tags: ["cooldown"] }
    ]
  };

  let blocks: WorkoutBlock[] = [warmup];

  if (t.type === "splitA") blocks = blocks.concat(splitA);
  else if (t.type === "splitB") blocks = blocks.concat(splitB);
  else blocks = blocks.concat(mainFull);

  // A partir de SSJ2 en adelante, finisher recomendado. Antes, opcional pero suave.
  blocks.push(finisher, cooldown);

  return {
    dateISO,
    templateId: t.id,
    name: t.name,
    estimatedMinutes: t.estimatedMinutes,
    transformation,
    notes: t.notes,
    blocks
  };
}
