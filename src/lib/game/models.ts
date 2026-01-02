export type TransformationKey =
  | "normal"
  | "kaioken"
  | "kaioken10"
  | "ssj"
  | "ssj2"
  | "ssj3"
  | "ssj4"
  | "god"
  | "blue"
  | "blue_kaioken"
  | "ui"
  | "mui";

export type KiActionType =
  | "workout_quick"
  | "workout_full"
  | "capsule_30"
  | "capsule_60"
  | "walk"
  | "mobility"
  | "sleep"
  | "food"
  | "streak_bonus"
  | "manual_adjust";

export interface PlayerState {
  id: "player";
  kiTotal: number;         // progreso permanente
  kiToday: number;         // se resetea diariamente
  streak: number;          // días seguidos entrenando (workout)
  lastDailyResetISO: string;
  lastTrainingISO?: string;
  createdAtISO: string;
  updatedAtISO: string;
}

export interface SettingsState {
  id: "settings";
  dailyKiCap: number; // cap por acciones del día
  difficulty: "easy" | "normal" | "hard";
  reduceMotion: boolean;
}

export interface KiActionLog {
  id?: number;
  dateISO: string;
  type: KiActionType;
  kiDelta: number;
  createdAtISO: string;
  note?: string;
}

export interface QuestDefinition {
  questId: string;
  title: string;
  description: string;
  rewardKi: number;
  // Acción asociada (para que el reward venga del mismo mecanismo de KI)
  actionType?: KiActionType;
}

export interface QuestCompletion {
  id?: number;
  dateISO: string;
  questId: string;
  completedAtISO: string;
  meta?: Record<string, unknown>;
}

export interface WorkoutPlan {
  dateISO: string;
  templateId: string;
  name: string;
  estimatedMinutes: number;
  transformation: TransformationKey;
  notes: string[];
  blocks: WorkoutBlock[];
}

export interface WorkoutBlock {
  name: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  timeSec?: number;
  restSec: number;
  tips?: string[];
  description?: string; // instrucciones breves para el Dojo
  minKi: number;
  tags: string[];
}

export interface WorkoutLog {
  id?: number;
  dateISO: string;
  templateId: string;
  completedAtISO: string;
  durationSec?: number;
  mode: "quick" | "full" | "capsule_30" | "capsule_60";
}
