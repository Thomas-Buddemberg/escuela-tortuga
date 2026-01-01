"use client";

import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import StatPill from "@/components/StatPill";

import { useMemo } from "react";
import { usePlayer, useRecentActions, useWorkouts } from "@/lib/store/hooks";
import { TRANSFORMATIONS, getTransformation } from "@/lib/game/transformations";
import { progressToNext } from "@/lib/game/progression";

function groupByDate(actions: any[]) {
  const map = new Map<string, number>();
  for (const a of actions) {
    const prev = map.get(a.dateISO) ?? 0;
    map.set(a.dateISO, prev + (a.kiDelta ?? 0));
  }
  return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export default function ProgressPage() {
  const { player, settings, loading } = usePlayer();
  const recentActions = useRecentActions(60);
  const recentWorkouts = useWorkouts(30);

  const current = useMemo(() => (player ? getTransformation(player.kiTotal) : null), [player]);
  const prog = useMemo(() => (player ? progressToNext(player.kiTotal) : null), [player]);

  if (loading || !player || !settings || !current || !prog) {
    return (
      <div className="space-y-4">
        <Card title="Cargando progreso..." />
      </div>
    );
  }

  const daily = groupByDate(recentActions).slice(0, 14);

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

      <Card title="KI ganado (últimos 14 días)">
        <div className="space-y-2">
          {daily.length === 0 ? (
            <div className="text-sm text-white/70">Aún no hay historial. Entrena o completa misiones 🐢</div>
          ) : (
            daily.map(([dateISO, ki]) => (
              <div key={dateISO} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="text-xs text-white/60">{dateISO}</div>
                <div className="text-sm font-semibold">+{ki} KI</div>
              </div>
            ))
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
                  <div className="text-xs text-white/60">Modo: {w.mode}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
