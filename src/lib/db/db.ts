"use client";

import Dexie, { Table } from "dexie";
import type { KiActionLog, PlayerState, QuestCompletion, SettingsState, WorkoutLog } from "@/lib/game/models";
import { todayISO } from "@/lib/date";

export class TurtleKiDB extends Dexie {
  player!: Table<PlayerState, string>;
  settings!: Table<SettingsState, string>;
  actions!: Table<KiActionLog, number>;
  quests!: Table<QuestCompletion, number>;
  workouts!: Table<WorkoutLog, number>;

  constructor() {
    super("turtleKiDB");

    this.version(1).stores({
      player: "id",
      settings: "id",
      actions: "++id, dateISO, type, createdAtISO",
      quests: "++id, dateISO, questId, completedAtISO",
      workouts: "++id, dateISO, templateId, completedAtISO"
    });
  }
}

export const db = new TurtleKiDB();

export async function seedIfNeeded(): Promise<void> {
  // Dexie abre automáticamente, pero hacemos seed explícito.
  const [player, settings] = await Promise.all([db.player.get("player"), db.settings.get("settings")]);

  const now = new Date().toISOString();
  const today = todayISO();

  if (!player) {
    const p: PlayerState = {
      id: "player",
      kiTotal: 0,
      kiToday: 0,
      streak: 0,
      lastDailyResetISO: today,
      lastTrainingISO: undefined,
      createdAtISO: now,
      updatedAtISO: now
    };
    await db.player.put(p);
  }

  if (!settings) {
    const s: SettingsState = {
      id: "settings",
      dailyKiCap: 50,
      difficulty: "normal",
      reduceMotion: false
    };
    await db.settings.put(s);
  }
}

export async function hardResetAll(): Promise<void> {
  await db.transaction("rw", db.player, db.settings, db.actions, db.quests, db.workouts, async () => {
    await Promise.all([
      db.player.clear(),
      db.settings.clear(),
      db.actions.clear(),
      db.quests.clear(),
      db.workouts.clear()
    ]);
  });
  await seedIfNeeded();
}

export async function exportAllData(): Promise<Record<string, unknown>> {
  const [player, settings, actions, quests, workouts] = await Promise.all([
    db.player.get("player"),
    db.settings.get("settings"),
    db.actions.toArray(),
    db.quests.toArray(),
    db.workouts.toArray()
  ]);

  return { exportedAtISO: new Date().toISOString(), player, settings, actions, quests, workouts };
}

export async function importAllData(payload: any): Promise<void> {
  if (!payload || typeof payload !== "object") throw new Error("Payload inválido");

  await db.transaction("rw", db.player, db.settings, db.actions, db.quests, db.workouts, async () => {
    await Promise.all([
      db.player.clear(),
      db.settings.clear(),
      db.actions.clear(),
      db.quests.clear(),
      db.workouts.clear()
    ]);

    if (payload.player) await db.player.put(payload.player);
    if (payload.settings) await db.settings.put(payload.settings);

    if (Array.isArray(payload.actions) && payload.actions.length) await db.actions.bulkAdd(payload.actions);
    if (Array.isArray(payload.quests) && payload.quests.length) await db.quests.bulkAdd(payload.quests);
    if (Array.isArray(payload.workouts) && payload.workouts.length) await db.workouts.bulkAdd(payload.workouts);
  });

  await seedIfNeeded();
}
