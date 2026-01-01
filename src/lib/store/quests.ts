"use client";

import { db } from "@/lib/db/db";
import type { QuestDefinition } from "@/lib/game/models";
import { DAILY_QUESTS } from "@/lib/game/quests";
import { claimActionOncePerDay } from "@/lib/store/game";

/**
 * Obtiene definiciones de quests del día.
 * (En MVP son fijas; si quieres rotación por semana, se puede extender.)
 */
export function getDailyQuestDefs(): QuestDefinition[] {
  return DAILY_QUESTS;
}

export async function isQuestCompleted(dateISO: string, questId: string): Promise<boolean> {
  const c = await db.quests.where({ dateISO, questId }).count();
  return c > 0;
}

export async function completeQuest(params: {
  dateISO: string;
  questId: string;
  // Para side quest "walk_or_mobility", el usuario elige cuál hizo.
  actionOverride?: "walk" | "mobility";
}): Promise<{ kiAdded: number; message: string }> {
  const { dateISO, questId, actionOverride } = params;

  if (await isQuestCompleted(dateISO, questId)) {
    return { kiAdded: 0, message: "Quest ya completada hoy." };
  }

  const def = DAILY_QUESTS.find((q) => q.questId === questId);
  if (!def) throw new Error("Quest desconocida");

  // Registrar completion
  await db.quests.add({
    dateISO,
    questId,
    completedAtISO: new Date().toISOString(),
    meta: actionOverride ? { actionOverride } : undefined
  });

  // Si la quest tiene acción asociada, reclama KI por esa acción una vez por día
  let kiAdded = 0;
  if (questId === "side_walk_or_mobility") {
    // Usa override: walk o mobility
    const type = actionOverride ?? "walk";
    const res = await claimActionOncePerDay({ todayISO: dateISO, type, note: `quest:${questId}` });
    kiAdded = res.kiAdded;
    return { kiAdded, message: res.message };
  }

  if (def.actionType) {
    const res = await claimActionOncePerDay({ todayISO: dateISO, type: def.actionType, note: `quest:${questId}` });
    kiAdded = res.kiAdded;
    return { kiAdded, message: res.message };
  }

  // main_workout no da KI aquí (lo da completeWorkout)
  return { kiAdded: 0, message: "Quest registrada." };
}
