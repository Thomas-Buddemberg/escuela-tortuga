"use client";

import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import StatPill from "@/components/StatPill";
import LineChart from "@/components/LineChart";

import { useMemo } from "react";
import { usePlayer, useAllActions, useWorkouts } from "@/lib/store/hooks";
import { TRANSFORMATIONS, getTransformation } from "@/lib/game/transformations";
import { progressToNext } from "@/lib/game/progression";
import { addDaysISO, parseISODate, todayISO } from "@/lib/date";


export default function ProgressPage() {
  const { player, settings, loading } = usePlayer();
  const actions = useAllActions();
  const recentWorkouts = useWorkouts(30);

  const current = useMemo(() => (player ? getTransformation(player.kiTotal) : null), [player]);
  const prog = useMemo(() => (player ? progressToNext(player.kiTotal) : null), [player]);

  // Serie continua histórica por día (incluye días con 0 KI)
  const today = todayISO();
  const byDateSum = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of actions) {
      const cur = m.get(a.dateISO) ?? 0;
      m.set(a.dateISO, cur + (a.kiDelta ?? 0));
    }
    return m;
  }, [actions]);

  const daysAsc = useMemo(() => {
    if (actions.length === 0) return [] as string[];
    let first = actions[0]?.dateISO ?? today;
    if (!first || first > today) first = today;
    const arr: string[] = [];
    let cursor = first;
    while (cursor <= today) {
      arr.push(cursor);
      cursor = addDaysISO(cursor, 1);
    }
    return arr;
  }, [actions, today]);

  const dailySeries = useMemo(() => {
    return daysAsc.map((d) => ({
      dateISO: d,
      y: byDateSum.get(d) ?? 0,
      x: parseISODate(d).getTime(),
    }));
  }, [daysAsc, byDateSum]);

  const cumulativeSeries = useMemo(() => {
    let acc = 0;
    return dailySeries.map((p) => {
      acc += p.y;
      return { x: p.x, y: acc, dateISO: p.dateISO } as any;
    });
  }, [dailySeries]);

  if (loading || !player || !settings || !current || !prog) {
    return (
      <div className="space-y-4">
        <Card title="Cargando progreso..." />
      </div>
    );
  }


  return (
    <div className="space-y-4">
      <Card title="Resumen">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="KI total" value={String(player.kiTotal)} />
          <StatPill label="Forma actual" value={`${current.emoji} ${current.name}`} />
          <StatPill label="Streak" value={`${player.streak} días`} />
          <StatPill label="Cap diario" value={`${settings.dailyKiCap} KI`} />
        </div>

        <div className="mt-4">
          {prog.nextName ? (
            <ProgressBar
              value={player.kiTotal - (TRANSFORMATIONS.find((t) => t.key === current.key)?.minKi ?? 0)}
              max={(prog.nextKi ?? player.kiTotal) - (TRANSFORMATIONS.find((t) => t.key === current.key)?.minKi ?? 0)}
              label={`Hacia ${prog.nextName}`}
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm">
              Estás en la forma máxima. Ahora el juego es la constancia 🐢✨
            </div>
          )}
        </div>
      </Card>

      <Card title="Escalera de transformaciones">
        <div className="space-y-2">
          {TRANSFORMATIONS.map((t) => {
            const unlocked = player.kiTotal >= t.minKi;
            const isCurrent = t.key === current.key;
            return (
              <div
                key={t.key}
                className={[
                  "flex items-center justify-between rounded-2xl border p-3",
                  isCurrent ? "border-white/25 bg-white/10" : "border-white/10 bg-black/20"
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-[11px] text-white/55">Desde KI {t.minKi}</div>
                  </div>
                </div>
                <div className="text-xs">
                  {unlocked ? (
                    <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/12 px-2 py-1 text-emerald-100">
                      Desbloqueada
                    </span>
                  ) : (
                    <span className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-white/60">
                      Bloqueada
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="KI diario (histórico)">
        <div className="space-y-2">
          {dailySeries.length === 0 || dailySeries.every((p) => p.y === 0) ? (
            <div className="text-sm text-white/70">Aún no hay historial suficiente para graficar. ¡Empieza a sumar KI! 🐢</div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <LineChart
                data={dailySeries.map((p, i) => ({ x: i, y: p.y }))}
                height={180}
                stroke="#8bd5ff"
                fill="#8bd5ff22"
                className="w-full"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/55">
                <span>{daysAsc[0]}</span>
                <span>{daysAsc[daysAsc.length - 1]}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="KI acumulado (histórico)">
        <div className="space-y-2">
          {cumulativeSeries.length === 0 || cumulativeSeries.every((p) => p.y === 0) ? (
            <div className="text-sm text-white/70">Aún no hay historial suficiente para graficar.</div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <LineChart
                data={cumulativeSeries.map((p, i) => ({ x: i, y: p.y }))}
                height={180}
                stroke="#87e2a5"
                fill="#87e2a522"
                className="w-full"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/55">
                <span>{daysAsc[0]}</span>
                <span>{daysAsc[daysAsc.length - 1]}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="Entrenamientos recientes">
        <div className="space-y-2">
          {recentWorkouts.length === 0 ? (
            <div className="text-sm text-white/70">Aún no hay entrenamientos guardados.</div>
          ) : (
            recentWorkouts.map((w) => (
              <div key={String(w.id)} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{w.dateISO}</div>
                    <div className="text-[11px] text-white/55">Plantilla {w.templateId}</div>
                  </div>
                  <div className="text-xs text-white/60">
                    Modo: {w.mode === "capsule_30" ? "Orgullo 30m" : w.mode === "capsule_60" ? "Orgullo 60m" : w.mode}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
