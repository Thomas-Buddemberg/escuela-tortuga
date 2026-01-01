import type { QuestDefinition } from "./models";

export const DAILY_QUESTS: QuestDefinition[] = [
  {
    questId: "main_workout",
    title: "Main Quest: Entrenamiento",
    description: "Completa el entrenamiento del día (modo completo o corto).",
    rewardKi: 0 // el KI viene del action workout_*
  },
  {
    questId: "side_walk_or_mobility",
    title: "Side Quest: Movimiento suave",
    description: "Haz una caminata de 20–30 min o movilidad 8–12 min.",
    rewardKi: 5,
    actionType: "walk"
  },
  {
    questId: "discipline_sleep",
    title: "Discipline Quest: Descanso",
    description: "Dormí bien (autodeclarado).",
    rewardKi: 5,
    actionType: "sleep"
  },
  {
    questId: "discipline_food",
    title: "Discipline Quest: Alimentación",
    description: "Comí decente hoy (autodeclarado).",
    rewardKi: 5,
    actionType: "food"
  }
];
