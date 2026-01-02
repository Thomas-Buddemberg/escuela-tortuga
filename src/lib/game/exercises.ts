import type { WorkoutExercise } from "./models";

export const EXERCISES: WorkoutExercise[] = [
  // Push (básicos)
  { id: "pushup_knee", name: "Flexiones con rodillas", sets: 3, reps: 8, restSec: 60, minKi: 0, tags: ["push"], description: "Manos bajo hombros, cuerpo en línea. Apoya rodillas y baja hasta 90° en codos." },
  { id: "pushup", name: "Flexiones", sets: 3, reps: 8, restSec: 60, minKi: 50, tags: ["push"], description: "Plancha firme, baja pecho cerca del piso y empuja fuerte sin colapsar la cadera." },
  { id: "pushup_slow", name: "Flexiones lentas (3s bajada)", sets: 4, reps: 10, restSec: 75, minKi: 300, tags: ["push"], description: "3 segundos bajando, 1s pausa suave, sube controlado. Mantén hombros lejos de orejas." },
  { id: "pushup_decline", name: "Flexiones declinadas", sets: 4, reps: 10, restSec: 90, minKi: 600, tags: ["push"], description: "Pies elevados en banco/sillón. Core activo, baja en control y empuja explosivo." },
  { id: "dips_chair", name: "Fondos en silla/banco", sets: 3, reps: 10, restSec: 75, minKi: 250, tags: ["push", "triceps"], description: "Manos en el borde, cuerpo cerca del banco, baja hasta 90° en codos y sube extendiendo." },

  // Legs (básicos)
  { id: "squat", name: "Sentadillas aire", sets: 3, reps: 15, restSec: 60, minKi: 0, tags: ["legs"], description: "Pies al ancho de hombros, baja cadera bajo paralela si puedes, rodillas siguen puntas." },
  { id: "squat_pause", name: "Sentadilla con pausa (1s abajo)", sets: 4, reps: 15, restSec: 75, minKi: 100, tags: ["legs"], description: "Misma técnica que la sentadilla, mantén 1s al fondo con tronco estable y sube sólido." },
  { id: "lunge", name: "Zancadas", sets: 3, reps: 10, restSec: 75, minKi: 100, tags: ["legs"], description: "Paso largo, rodilla trasera hacia el suelo, tronco alto. Alterna piernas." },
  { id: "split_squat", name: "Split squat (estático)", sets: 4, reps: 10, restSec: 90, minKi: 600, tags: ["legs"], description: "Pie adelantado fijo, baja en eje vertical, empuja con el medio del pie delantero." },
  { id: "jump_squat", name: "Sentadillas con salto", sets: 4, reps: 12, restSec: 90, minKi: 1000, tags: ["legs", "power"], description: "Aterriza suave con rodillas alineadas. Enfócate en calidad y control de impacto." },

  // Core (básicos)
  { id: "plank", name: "Plancha", sets: 3, timeSec: 20, restSec: 45, minKi: 0, tags: ["core"], description: "Codos bajo hombros, glúteos apretados, costillas hacia adentro. Sin arquear lumbar." },
  { id: "plank_30", name: "Plancha 30s", sets: 3, timeSec: 30, restSec: 45, minKi: 100, tags: ["core"], description: "Versión extendida de plancha. Respira controlado sin perder tensión." },
  { id: "side_plank", name: "Plancha lateral", sets: 3, timeSec: 25, restSec: 45, minKi: 600, tags: ["core"], description: "Codo bajo hombro, cadera elevada, línea recta de tobillos a hombros." },
  { id: "hollow", name: "Hollow hold", sets: 3, timeSec: 30, restSec: 45, minKi: 300, tags: ["core"], description: "Zona lumbar pegada al suelo, omóplatos del piso, piernas y brazos estirados." },
  { id: "mountain_climbers", name: "Mountain climbers", sets: 3, timeSec: 30, restSec: 45, minKi: 600, tags: ["conditioning", "core"], description: "Plancha alta, lleva rodillas al pecho sin subir cadera. Ritmo constante." },

  // Conditioning (básicos)
  { id: "burpees", name: "Burpees", sets: 4, reps: 8, restSec: 90, minKi: 1000, tags: ["conditioning"], description: "Pecho al piso, salta al volver. Mantén técnica sólida más que velocidad al principio." },
  { id: "bear_crawl", name: "Bear crawl (ida y vuelta)", sets: 4, timeSec: 25, restSec: 75, minKi: 1500, tags: ["conditioning"], description: "Caderas bajas, manos bajo hombros, rodillas cerca del piso. Avanza coordinado." },

  // Avanzados — SSJ4 (2200 KI)
  { id: "pike_push_elev", name: "Pike push-up (pies elevados)", sets: 4, reps: 8, restSec: 90, minKi: 2200, tags: ["push", "shoulders"], description: "Caderas altas, cabeza baja entre manos, baja controlado hasta casi tocar el piso." },
  { id: "shrimp_squat", name: "Shrimp squat asistido", sets: 4, reps: 6, restSec: 90, minKi: 2200, tags: ["legs", "balance"], description: "Sujeta el pie trasero y baja en una pierna ayudándote de un soporte para equilibrio." },
  { id: "hang_knee_raise", name: "Elevaciones de rodillas colgado", sets: 4, reps: 10, restSec: 60, minKi: 2200, tags: ["core", "pull"], description: "Cuelga de barra y eleva rodillas al pecho sin balanceo excesivo." },

  // Avanzados — Dios (3000 KI)
  { id: "hs_hold_wall", name: "Handstand hold (a pared)", sets: 4, timeSec: 30, restSec: 60, minKi: 3000, tags: ["shoulders", "balance", "core"], description: "Apoya talones en pared, empuja el suelo, glúteos y abdomen firmes, mirada entre manos." },
  { id: "nordic_assisted", name: "Nordic curl asistido", sets: 4, reps: 6, restSec: 120, minKi: 3000, tags: ["legs", "posterior_chain"], description: "Rodillas acolchadas, desciende lento desde rodillas manteniendo cadera extendida. Usa apoyo si hace falta." },
  { id: "pullup", name: "Dominadas", sets: 4, reps: 5, restSec: 120, minKi: 3000, tags: ["pull"], description: "Agarre al ancho de hombros, pecho a la barra, baja completo sin balanceo." },

  // Avanzados — Azul (4000 KI)
  { id: "hs_pushup_wall", name: "Handstand push-up (pared)", sets: 4, reps: 5, restSec: 120, minKi: 4000, tags: ["push", "shoulders"], description: "Desde handstand en pared, baja controlado hasta cabeza al cojín y empuja a bloqueo." },
  { id: "pistol_box", name: "Pistol squat a caja", sets: 4, reps: 6, restSec: 120, minKi: 4000, tags: ["legs", "balance"], description: "Sentadilla a una pierna a una caja/banquito, controla la bajada y la rodilla alineada." },
  { id: "toes_to_bar", name: "Toes-to-bar", sets: 4, reps: 6, restSec: 90, minKi: 4000, tags: ["core", "pull"], description: "Cuelga estable y lleva puntas de pies a la barra con control, evita columpio excesivo." },

  // Avanzados — Azul Kaioken (5500 KI)
  { id: "dips_bar", name: "Fondos en barra/aneas", sets: 4, reps: 8, restSec: 120, minKi: 5500, tags: ["push", "triceps"], description: "Bloquea codos arriba, baja profundo sin colapsar hombros y empuja fuerte a extensión." },
  { id: "dragon_flag_neg", name: "Dragon flag (negativas)", sets: 4, reps: 5, restSec: 120, minKi: 5500, tags: ["core"], description: "Sujeta banca desde atrás, cuerpo en bloque, desciende lento manteniendo tensión total." },
  { id: "shrimp_squat_full", name: "Shrimp squat (completo)", sets: 4, reps: 6, restSec: 120, minKi: 5500, tags: ["legs", "balance"], description: "Sin asistencia: toca rodilla trasera al piso y sube estable, torso alto." },

  // Avanzados — Ultra Instinto (7000 KI)
  { id: "oa_pushup_assisted", name: "Flexión a una mano (asistida)", sets: 4, reps: 5, restSec: 120, minKi: 7000, tags: ["push"], description: "Apoya mano libre sobre caja/pared para asistencia, cadera y hombros cuadrados." },
  { id: "pistol_squat", name: "Pistol squat", sets: 4, reps: 5, restSec: 120, minKi: 7000, tags: ["legs", "balance"], description: "Baja controlado a una pierna sin colapsar arco del pie, mirada al frente." },
  { id: "front_lever_tuck", name: "Front lever (tuck)", sets: 5, timeSec: 12, restSec: 90, minKi: 7000, tags: ["core", "pull"], description: "Cuelga en barra/anillas, piernas recogidas, hombros extendidos (depresión escapular)." },

  // Avanzados — UI Dominado (9000 KI)
  { id: "oa_pushup", name: "Flexión a una mano", sets: 5, reps: 3, restSec: 150, minKi: 9000, tags: ["push"], description: "Pies abiertos, baja en control a una mano manteniendo línea corporal y rotación neutra." },
  { id: "hs_pushup_free", name: "Handstand push-up libre", sets: 5, reps: 3, restSec: 150, minKi: 9000, tags: ["push", "shoulders", "balance"], description: "HSPU sin pared: controla equilibrio, baja vertical y empuja con bloque sólido." },
  { id: "front_lever_adv_tuck", name: "Front lever (tuck avanzado)", sets: 5, timeSec: 10, restSec: 120, minKi: 9000, tags: ["core", "pull"], description: "Mayor palanca que tuck: mantén codos extendidos y hombros en depresión sin balanceo." }
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
