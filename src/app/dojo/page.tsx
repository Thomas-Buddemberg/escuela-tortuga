"use client";

import Card from "@/components/Card";
import { useMemo, useState } from "react";
import { usePlayer } from "@/lib/store/hooks";
import { EXERCISES } from "@/lib/game/exercises";
import ExerciseImage from "@/components/ExerciseImage";

export default function DojoPage() {
  const { player, settings, loading } = usePlayer();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return EXERCISES
      .slice()
      .sort((a, b) => a.minKi - b.minKi)
      .filter((e) => (query ? e.name.toLowerCase().includes(query) : true));
  }, [q]);

  if (loading || !player || !settings) {
    return (
      <div className="space-y-4">
        <Card title="Cargando dojo..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card title="Dojo de ejercicios" right={<div className="text-xs text-white/60">KI: {player.kiTotal}</div>}>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar ejercicio..."
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/25"
          />
        </div>
      </Card>

      <Card title="Catálogo">
        <div className="space-y-2">
          {list.map((e) => {
            const unlocked = player.kiTotal >= e.minKi;
            const spec = e.reps ? `${e.sets}×${e.reps} reps` : `${e.sets}×${e.timeSec ?? 0}s`;
            return (
              <div
                key={e.id}
                className={[
                  "rounded-2xl border p-3",
                  unlocked ? "border-white/10 bg-black/20" : "border-white/10 bg-black/10 opacity-70"
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <ExerciseImage name={e.name} />
                    <div>
                      <div className="text-sm font-semibold">{e.name}</div>
                      <div className="text-xs text-white/60">
                        {spec} • descanso {e.restSec}s • min KI {e.minKi}
                      </div>
                      {e.description ? (
                        <div className="mt-1 text-xs text-white/70">
                          {e.description}
                        </div>
                      ) : null}
                      <div className="mt-1 text-[11px] text-white/55">
                        Tags: {e.tags.join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs">
                    {unlocked ? (
                      <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/12 px-2 py-1 text-emerald-100">
                        Activo
                      </span>
                    ) : (
                      <span className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-white/60">
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
