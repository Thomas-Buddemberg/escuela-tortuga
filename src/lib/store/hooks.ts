"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import type { KiActionLog, PlayerState, QuestCompletion, SettingsState, WorkoutLog } from "@/lib/game/models";

export function usePlayer() {
  const player = useLiveQuery(async () => db.player.get("player"), []);
  const settings = useLiveQuery(async () => db.settings.get("settings"), []);
  return { player, settings, loading: !player || !settings };
}

export function useTodayCompletions(dateISO: string) {
  const questCompletions = useLiveQuery(async () => db.quests.where({ dateISO }).toArray(), [dateISO]);
  const actions = useLiveQuery(async () => db.actions.where({ dateISO }).toArray(), [dateISO]);
  const workouts = useLiveQuery(async () => db.workouts.where({ dateISO }).toArray(), [dateISO]);
  return { questCompletions: questCompletions ?? [], actions: actions ?? [], workouts: workouts ?? [] };
}

export function useRecentActions(limit: number = 30) {
  const actions = useLiveQuery(async () => {
    const all = await db.actions.orderBy("createdAtISO").reverse().limit(limit).toArray();
    return all;
  }, [limit]);
  return actions ?? [];
}

export function useAllActions() {
  const actions = useLiveQuery(async () => {
    // Ordenado por fecha del día para facilitar cálculos por día
    return await db.actions.orderBy("dateISO").toArray();
  }, []);
  return actions ?? [];
}

export function useWorkouts(limit: number = 30) {
  const workouts = useLiveQuery(async () => {
    const all = await db.workouts.orderBy("completedAtISO").reverse().limit(limit).toArray();
    return all;
  }, [limit]);
  return workouts ?? [];
}
