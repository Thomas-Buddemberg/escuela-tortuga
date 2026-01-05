"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Toast from "@/components/Toast";

import { todayISO } from "@/lib/date";
import { usePlayer } from "@/lib/store/hooks";
import { generateWorkoutPlan } from "@/lib/game/workouts";
import { completeWorkout } from "@/lib/store/game";
import { db } from "@/lib/db/db";
import { completeQuest } from "@/lib/store/quests";
import { formatSeconds, cn } from "@/lib/ui";
import ExerciseImage from "@/components/ExerciseImage";

type Mode = "quick" | "full";

export default function WorkoutPage() {
  const dateISO = todayISO();
  const { player, settings, loading } = usePlayer();

  const [mode, setMode] = useState<Mode>("full");
  const [toast, setToast] = useState<string | null>(null);

  const [started, setStarted] = useState(false);
  const [startAtMs, setStartAtMs] = useState<number | null>(null);
  const [offsetSec, setOffsetSec] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const WORKOUT_SESSION_KEY = "workoutSessionV1";

  const plan = useMemo(() => {
    if (!player || !settings) return null;
    return generateWorkoutPlan(player.kiTotal, settings, dateISO);
  }, [player, settings, dateISO]);

  const [done, setDone] = useState<Record<string, number>>({}); // exerciseId -> sets done

  useEffect(() => {
    // Restaurar sesión del entrenamiento si existe para la fecha actual
    try {
      const raw = localStorage.getItem(WORKOUT_SESSION_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.dateISO === dateISO) {
          setStarted(!!d.started);
          setStartAtMs(typeof d.startAtMs === "number" ? d.startAtMs : null);
          setOffsetSec(typeof d.offsetSec === "number" ? d.offsetSec : 0);
        } else {
          localStorage.removeItem(WORKOUT_SESSION_KEY);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateISO]);

  useEffect(() => {
    // Persistir sesión
    try {
      localStorage.setItem(
        WORKOUT_SESSION_KEY,
        JSON.stringify({ dateISO, started, startAtMs, offsetSec })
      );
    } catch {}
  }, [dateISO, started, startAtMs, offsetSec]);

  useEffect(() => {
    if (!started) {
      setElapsedSec(offsetSec);
      return;
    }
    const compute = () => {
      const now = Date.now();
      const base = (startAtMs ? Math.floor((now - startAtMs) / 1000) : 0) + offsetSec;
      setElapsedSec(base);
    };
    compute();
    const id = window.setInterval(compute, 1000);
    return () => window.clearInterval(id);
  }, [started, startAtMs, offsetSec]);

  function toggleStart() {
    if (!started) {
      setStarted(true);
      setStartAtMs(Date.now());
    } else {
      const now = Date.now();
      const elapsed = (startAtMs ? Math.floor((now - startAtMs) / 1000) : 0) + offsetSec;
      setOffsetSec(elapsed);
      setStartAtMs(null);
      setStarted(false);
    }
  }

  function bump(exId: string, maxSets: number, delta: number) {
    setDone((prev) => {
      const cur = prev[exId] ?? 0;
      const next = Math.max(0, Math.min(maxSets, cur + delta));
      return { ...prev, [exId]: next };
    });
  }

  async function finalize() {
    if (!plan) return;

    // Registra main quest (sin KI propio)
    await completeQuest({ dateISO, questId: "main_workout" });

    const res = await completeWorkout({
      todayISO: dateISO,
      templateId: plan.templateId,
      mode,
      durationSec: elapsedSec
    });

    setToast(res.message);

    // Limpia estado del runner
    setStarted(false);
    setStartAtMs(null);
    setOffsetSec(0);
    setElapsedSec(0);
    setDone({});
    try { localStorage.removeItem(WORKOUT_SESSION_KEY); } catch {}
  }

  async function quickResetSession() {
    setStarted(false);
    setStartAtMs(null);
    setOffsetSec(0);
    setElapsedSec(0);
    setDone({});
    try { localStorage.removeItem(WORKOUT_SESSION_KEY); } catch {}
    setToast("Sesión reiniciada.");
  }

  async function markMobilityQuest() {
    await completeQuest({ dateISO, questId: "side_walk_or_mobility", actionOverride: "mobility" });
    setToast("Movilidad marcada ✅");
  }

  if (loading || !player || !settings || !plan) {
    return (
      <div className="space-y-4">
        <Card title="Cargando entrenamiento...">
          <p className="text-sm text-white/70">Buscando la rutina adecuada según tu KI 🐢</p>
        </Card>
      </div>
    );
  }

  const allExercises = plan.blocks.flatMap((b) => b.exercises);
  const totalSets = allExercises.reduce((acc, e) => acc + (e.sets ?? 0), 0);
  const doneSets = allExercises.reduce((acc, e) => acc + Math.min(e.sets, done[e.id] ?? 0), 0);

  return (
    <div className="space-y-4">
      {toast ? <Toast message={toast} kind="success" onClose={() => setToast(null)} /> : null}

      <Card title="Entrenamiento del día" right={<div className="text-xs text-white/60">Plantilla: {plan.templateId}</div>}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{plan.name}</div>
            <div className="text-xs text-white/60">
              Estimado {plan.estimatedMinutes} min • Forma: <span className="font-semibold">{plan.transformation}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={cn("rounded-xl border px-3 py-2 text-sm", mode === "full" ? "border-white/25 bg-white/10" : "border-white/10 bg-black/20 text-white/70")}
              onClick={() => setMode("full")}
            >
              Completo (+20 KI)
            </button>
            <button
              className={cn("rounded-xl border px-3 py-2 text-sm", mode === "quick" ? "border-white/25 bg-white/10" : "border-white/10 bg-black/20 text-white/70")}
              onClick={() => setMode("quick")}
            >
              Corto (+10 KI)
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm">
              <span className="text-white/70">Tiempo:</span> <span className="font-semibold">{formatSeconds(elapsedSec)}</span>
              <span className="text-white/50"> • </span>
              <span className="text-white/70">Progreso sets:</span> <span className="font-semibold">{doneSets}/{totalSets}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={toggleStart}>
                {started ? "Pausar" : "Iniciar"}
              </Button>
              <Button variant="ghost" onClick={quickResetSession}>
                Reiniciar
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={markMobilityQuest}>Marcar movilidad (Side Quest)</Button>
        </div>
      </Card>

      <Card title="Rutina">
        <div className="space-y-4">
          {plan.notes.length ? (
            <ul className="list-disc space-y-1 pl-5 text-xs text-white/65">
              {plan.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}

          {plan.blocks.map((block) => (
            <div key={block.name} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-sm font-semibold">{block.name}</div>
              <div className="mt-2 space-y-2">
                {block.exercises.map((ex) => {
                  const doneCount = done[ex.id] ?? 0;
                  const label = ex.reps ? `${ex.sets}×${ex.reps} reps` : `${ex.sets}×${ex.timeSec ?? 0}s`;
                  return (
                    <div key={ex.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <ExerciseImage name={ex.name} />
                          <div>
                            <div className="text-sm font-semibold">{ex.name}</div>
                            <div className="text-xs text-white/60">
                              {label} • descanso {ex.restSec}s
                            </div>
                            {ex.tips?.length ? (
                              <ul className="mt-1 list-disc pl-5 text-[11px] text-white/55">
                                {ex.tips.map((t) => (
                                  <li key={t}>{t}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm hover:bg-white/10"
                            onClick={() => bump(ex.id, ex.sets, -1)}
                          >
                            -
                          </button>
                          <div className="min-w-[42px] text-center text-sm font-semibold">
                            {doneCount}/{ex.sets}
                          </div>
                          <button
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm hover:bg-white/10"
                            onClick={() => bump(ex.id, ex.sets, +1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="primary" onClick={finalize}>Finalizar entrenamiento</Button>
          <Button
            variant="ghost"
            onClick={async () => {
              // debug helper: ver logs en consola (no visible para usuario final)
              const a = await db.actions.where({ dateISO }).toArray();
              console.log("Actions today:", a);
              setToast("Logs listos (ver consola).");
            }}
          >
            Debug
          </Button>
        </div>
      </Card>
    </div>
  );
}
