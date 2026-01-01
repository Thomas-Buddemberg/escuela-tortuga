"use client";

import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import StatPill from "@/components/StatPill";
import Button from "@/components/Button";
import Toast from "@/components/Toast";

import { useMemo, useState } from "react";
import { todayISO } from "@/lib/date";
import { usePlayer, useTodayCompletions } from "@/lib/store/hooks";
import { progressToNext } from "@/lib/game/progression";
import { getTransformation } from "@/lib/game/transformations";
import { getDailyQuestDefs, completeQuest } from "@/lib/store/quests";
import { claimActionOncePerDay } from "@/lib/store/game";
import Link from "next/link";

export default function HomePage() {
  const dateISO = todayISO();
  const { player, settings, loading } = usePlayer();
  const { questCompletions, actions, workouts } = useTodayCompletions(dateISO);

  const [toast, setToast] = useState<{ msg: string; kind?: "info" | "success" | "warning" } | null>(null);

  const transformation = useMemo(() => (player ? getTransformation(player.kiTotal) : null), [player]);
  const prog = useMemo(() => (player ? progressToNext(player.kiTotal) : null), [player]);
  const dailyQuests = getDailyQuestDefs();

  const completedQuestIds = new Set(questCompletions.map((q) => q.questId));

  const kiToday = player?.kiToday ?? 0;
  const dailyCap = settings?.dailyKiCap ?? 50;

  const workoutsToday = workouts.length;

  async function onQuickAction(type: "walk" | "mobility") {
    const res = await claimActionOncePerDay({ todayISO: dateISO, type, note: "quick_action" });
    setToast({ msg: res.message, kind: res.kiAdded > 0 ? "success" : (res.capped ? "warning" : "info") });
  }

  async function onCompleteQuest(questId: string, override?: "walk" | "mobility") {
    const res = await completeQuest({ dateISO, questId, actionOverride: override });
    setToast({ msg: res.message, kind: res.kiAdded > 0 ? "success" : "info" });
  }

  if (loading || !player || !settings || !transformation || !prog) {
    return (
      <div className="space-y-4">
        <Card title="Cargando...">
          <p className="text-sm text-white/70">Preparando tu dojo 🐢</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast ? <Toast message={toast.msg} kind={toast.kind} onClose={() => setToast(null)} /> : null}

      <Card
        title="Estado del guerrero"
        right={
          <div className="text-xs text-white/60">
            Hoy: <span className="font-semibold text-white/85">{dateISO}</span>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="KI total" value={String(player.kiTotal)} />
          <StatPill label="Forma" value={`${transformation.emoji} ${transformation.name}`} />
          <StatPill label="Streak" value={`${player.streak} días`} />
          <StatPill label="Entrenos hoy" value={`${workoutsToday}`} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ProgressBar
            value={Math.min(kiToday, dailyCap)}
            max={dailyCap}
            label={`KI hoy (cap ${dailyCap})`}
          />
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/60">Progreso a la siguiente transformación</div>
            {prog.nextName ? (
              <div className="mt-1 text-sm">
                <span className="font-semibold">{prog.nextName}</span>{" "}
                <span className="text-white/60">
                  en {prog.remaining} KI (meta: {prog.nextKi})
                </span>
              </div>
            ) : (
              <div className="mt-1 text-sm font-semibold">Máxima transformación alcanzada 🐢✨</div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/workout">
            <Button variant="primary">Entrenar ahora</Button>
          </Link>
          <Button variant="secondary" onClick={() => onQuickAction("walk")}>+ Caminata (5 KI)</Button>
          <Button variant="secondary" onClick={() => onQuickAction("mobility")}>+ Movilidad (5 KI)</Button>
        </div>
      </Card>

      <Card title="Misiones del día">
        <div className="space-y-3">
          {dailyQuests.map((q) => {
            const done = completedQuestIds.has(q.questId);
            const isSide = q.questId === "side_walk_or_mobility";
            const isMain = q.questId === "main_workout";
            return (
              <div key={q.questId} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{q.title}</div>
                    <div className="text-xs text-white/65">{q.description}</div>
                  </div>
                  <div className="text-xs text-white/60">
                    {isMain ? "KI según modo" : `+${q.rewardKi} KI`}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {done ? (
                    <span className="rounded-xl bg-emerald-500/15 px-3 py-2 text-xs text-emerald-100 border border-emerald-500/20">
                      Completada ✅
                    </span>
                  ) : isMain ? (
                    <Link href="/workout">
                      <Button variant="secondary">Ir a entrenar</Button>
                    </Link>
                  ) : isSide ? (
                    <>
                      <Button variant="secondary" onClick={() => onCompleteQuest(q.questId, "walk")}>
                        Marcar caminata
                      </Button>
                      <Button variant="secondary" onClick={() => onCompleteQuest(q.questId, "mobility")}>
                        Marcar movilidad
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" onClick={() => onCompleteQuest(q.questId)}>
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Resumen de hoy">
        <div className="text-sm text-white/80">
          Acciones registradas: <span className="font-semibold">{actions.length}</span>
        </div>
        <div className="mt-2 space-y-1 text-xs text-white/60">
          {actions.length === 0 ? (
            <p>Sin acciones todavía. Haz una misión o entrena 🐢</p>
          ) : (
            actions
              .slice()
              .sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1))
              .map((a) => (
                <div key={String(a.id)} className="flex justify-between gap-2">
                  <span className="truncate">{a.type.replaceAll("_", " ")}</span>
                  <span className="font-semibold text-white/80">+{a.kiDelta}</span>
                </div>
              ))
          )}
        </div>
      </Card>
    </div>
  );
}
