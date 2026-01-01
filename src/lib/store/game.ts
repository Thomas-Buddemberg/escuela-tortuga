"use client";

import { db, seedIfNeeded } from "@/lib/db/db";
import type { KiActionLog, KiActionType, PlayerState, SettingsState, WorkoutLog } from "@/lib/game/models";
import { ACTION_KI, isCappedAction } from "@/lib/game/rules";
import { isYesterdayISO } from "@/lib/date";

/**
 * Abre DB y crea seed si falta.
 */
export async function ensureDbReady(): Promise<void> {
  await db.open();
  await seedIfNeeded();
}

async function getPlayerOrThrow(): Promise<PlayerState> {
  const p = await db.player.get("player");
  if (!p) throw new Error("Player no inicializado");
  return p;
}

async function getSettingsOrThrow(): Promise<SettingsState> {
  const s = await db.settings.get("settings");
  if (!s) throw new Error("Settings no inicializado");
  return s;
}

export async function ensureDailyReset(todayISO: string): Promise<void> {
  await db.transaction("rw", db.player, async () => {
    const p = await getPlayerOrThrow();
    if (p.lastDailyResetISO !== todayISO) {
      const now = new Date().toISOString();
      await db.player.put({
        ...p,
        kiToday: 0,
        lastDailyResetISO: todayISO,
        updatedAtISO: now
      });
    }
  });
}

async function alreadyClaimedToday(todayISO: string, type: KiActionType): Promise<boolean> {
  const count = await db.actions.where({ dateISO: todayISO, type }).count();
  return count > 0;
}

export async function claimActionOncePerDay(params: {
  todayISO: string;
  type: KiActionType;
  note?: string;
}): Promise<{ kiAdded: number; capped: boolean; message: string }> {
  const { todayISO, type, note } = params;
  const base = ACTION_KI[type] ?? 0;

  if (await alreadyClaimedToday(todayISO, type)) {
    return { kiAdded: 0, capped: false, message: "Ya reclamaste esta acción hoy." };
  }

  return await db.transaction("rw", db.player, db.settings, db.actions, async () => {
    const [p, s] = await Promise.all([getPlayerOrThrow(), getSettingsOrThrow()]);
    const now = new Date().toISOString();

    // Aplica cap diario (solo a acciones normales)
    let kiDelta = base;
    let capped = false;

    if (isCappedAction(type)) {
      const remaining = Math.max(0, s.dailyKiCap - p.kiToday);
      if (remaining <= 0) {
        kiDelta = 0;
        capped = true;
      } else if (kiDelta > remaining) {
        kiDelta = remaining;
        capped = true;
      }
    }

    const nextPlayer: PlayerState = {
      ...p,
      kiTotal: p.kiTotal + kiDelta,
      kiToday: p.kiToday + kiDelta,
      updatedAtISO: now
    };

    await db.player.put(nextPlayer);

    const log: KiActionLog = {
      dateISO: todayISO,
      type,
      kiDelta,
      createdAtISO: now,
      note
    };

    await db.actions.add(log);

    const message =
      kiDelta > 0
        ? `+${kiDelta} KI (${type.replaceAll("_", " ")})`
        : capped
        ? "Cap diario alcanzado. Hoy ya hiciste suficiente 🐢"
        : "Acción registrada.";

    return { kiAdded: kiDelta, capped, message };
  });
}

/**
 * Completa workout (modo full/quick):
 * - Otorga KI (una vez por día por tipo workout)
 * - Actualiza streak (solo si es el primer entrenamiento del día)
 * - Da bonus cada 7 días de streak
 * - Registra workout log
 */
export async function completeWorkout(params: {
  todayISO: string;
  templateId: string;
  mode: "quick" | "full";
  durationSec?: number;
}): Promise<{ kiAdded: number; streak: number; bonusKi: number; message: string }> {
  const { todayISO, templateId, mode, durationSec } = params;
  const type: KiActionType = mode === "full" ? "workout_full" : "workout_quick";

  // si ya se reclamó workout de ese tipo hoy, no lo repite
  if (await alreadyClaimedToday(todayISO, type)) {
    // registramos igual el workout (por historial), pero sin KI
    await db.workouts.add({
      dateISO: todayISO,
      templateId,
      completedAtISO: new Date().toISOString(),
      durationSec,
      mode
    } as WorkoutLog);

    const p = await getPlayerOrThrow();
    return { kiAdded: 0, streak: p.streak, bonusKi: 0, message: "Workout guardado. El KI del workout ya fue reclamado hoy." };
  }

  return await db.transaction("rw", db.player, db.settings, db.actions, db.workouts, async () => {
    const [p, s] = await Promise.all([getPlayerOrThrow(), getSettingsOrThrow()]);
    const now = new Date().toISOString();

    // KI del workout con cap
    const base = ACTION_KI[type] ?? 0;
    let kiDelta = base;
    let capped = false;

    const remaining = Math.max(0, s.dailyKiCap - p.kiToday);
    if (remaining <= 0) {
      kiDelta = 0;
      capped = true;
    } else if (kiDelta > remaining) {
      kiDelta = remaining;
      capped = true;
    }

    // Streak update (solo si no entrenaste hoy todavía)
    let nextStreak = p.streak;
    let bonusKi = 0;

    const trainedTodayAlready = p.lastTrainingISO === todayISO;

    if (!trainedTodayAlready) {
      if (p.lastTrainingISO && isYesterdayISO(p.lastTrainingISO, todayISO)) nextStreak = p.streak + 1;
      else nextStreak = 1; // reinicia

      // bonus cada 7
      if (nextStreak > 0 && nextStreak % 7 === 0) {
        bonusKi = ACTION_KI["streak_bonus"] ?? 0;
      }
    }

    const nextPlayer: PlayerState = {
      ...p,
      kiTotal: p.kiTotal + kiDelta + bonusKi,
      kiToday: p.kiToday + kiDelta + bonusKi,
      streak: nextStreak,
      lastTrainingISO: todayISO,
      updatedAtISO: now
    };

    await db.player.put(nextPlayer);

    await db.actions.add({
      dateISO: todayISO,
      type,
      kiDelta,
      createdAtISO: now,
      note: templateId
    });

    if (bonusKi > 0) {
      await db.actions.add({
        dateISO: todayISO,
        type: "streak_bonus",
        kiDelta: bonusKi,
        createdAtISO: now,
        note: `streak=${nextStreak}`
      });
    }

    await db.workouts.add({
      dateISO: todayISO,
      templateId,
      completedAtISO: now,
      durationSec,
      mode
    } as WorkoutLog);

    const message = kiDelta > 0
      ? `Entrenamiento completado: +${kiDelta} KI${bonusKi ? ` +${bonusKi} KI bonus` : ""} ✅`
      : capped
      ? `Entrenamiento guardado. Cap diario alcanzado; hoy no se suma más KI 🐢`
      : `Entrenamiento guardado.`;

    return { kiAdded: kiDelta, streak: nextStreak, bonusKi, message };
  });
}

export async function setDailyKiCap(cap: number): Promise<void> {
  await db.transaction("rw", db.settings, async () => {
    const s = await getSettingsOrThrow();
    await db.settings.put({ ...s, dailyKiCap: Math.max(10, Math.min(200, Math.round(cap))) });
  });
}

export async function setDifficulty(difficulty: SettingsState["difficulty"]): Promise<void> {
  await db.transaction("rw", db.settings, async () => {
    const s = await getSettingsOrThrow();
    await db.settings.put({ ...s, difficulty });
  });
}

export async function setReduceMotion(reduceMotion: boolean): Promise<void> {
  await db.transaction("rw", db.settings, async () => {
    const s = await getSettingsOrThrow();
    await db.settings.put({ ...s, reduceMotion });
  });
}
