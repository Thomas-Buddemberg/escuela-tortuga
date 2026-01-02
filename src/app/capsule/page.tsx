"use client";

import Card from "@/components/Card";
import Button from "@/components/Button";
import Toast from "@/components/Toast";

import { useEffect, useState } from "react";
import { usePlayer } from "@/lib/store/hooks";
import { todayISO } from "@/lib/date";
import { completeCapsuleWorkout } from "@/lib/store/game";
import { completeQuest } from "@/lib/store/quests";
import { cn, formatSeconds } from "@/lib/ui";

/**
 * Rutinas con máquinas de gimnasio
 *  - 30 minutos (+20 KI)
 *  - 60 minutos (+40 KI)
 */

type Variant = "capsule_30" | "capsule_60";

function useCountdown(variant: Variant, active: boolean) {
  const base = variant === "capsule_60" ? 3600 : 1800; // 60 min o 30 min
  const [remaining, setRemaining] = useState<number>(base);

  // Reset al cambiar variante
  useEffect(() => {
    setRemaining(base);
  }, [variant]);

  // Tick hacia abajo
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const reset = () => setRemaining(base);
  return { remaining, base, reset };
}

function CapsulePlan({ variant }: { variant: Variant }) {
  const is60 = variant === "capsule_60";
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="text-sm font-semibold">Calentamiento (5–8 min)</div>
        <ul className="mt-1 list-disc pl-5 text-xs text-white/65">
          <li>5' caminata o bici suave</li>
          <li>Movilidad: hombros, caderas y tobillos</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="text-sm font-semibold">Fuerza en máquinas</div>
        <div className="mt-2 space-y-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Chest press (máquina)</div>
            <div className="text-xs text-white/60">{is60 ? "4×10–12 reps" : "3×10–12 reps"} • descanso 60–90s</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Lat pulldown</div>
            <div className="text-xs text-white/60">{is60 ? "4×8–10 reps" : "3×8–10 reps"} • descanso 60–90s</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Prensa de piernas</div>
            <div className="text-xs text-white/60">{is60 ? "4×10–12 reps" : "3×10–12 reps"} • descanso 90s</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Remo sentado (cable/máquina)</div>
            <div className="text-xs text-white/60">{is60 ? "3–4×10–12 reps" : "3×10–12 reps"} • descanso 60–90s</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Extensión de piernas</div>
            <div className="text-xs text-white/60">{is60 ? "3–4×12–15 reps" : "3×12–15 reps"} • descanso 60–75s</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Curl femoral (máquina)</div>
            <div className="text-xs text-white/60">{is60 ? "3–4×10–12 reps" : "3×10–12 reps"} • descanso 60–75s</div>
          </div>
          {is60 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold">Press hombro (máquina)</div>
              <div className="text-xs text-white/60">3×10–12 reps • descanso 60–75s</div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="text-sm font-semibold">Core + gemelos</div>
        <div className="mt-2 space-y-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Crunch en cable o máquina</div>
            <div className="text-xs text-white/60">{is60 ? "3–4×12–15 reps" : "3×12–15 reps"} • descanso 45–60s</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold">Elevación de talones (máquina gemelos)</div>
            <div className="text-xs text-white/60">{is60 ? "4×12–15 reps" : "3×12–15 reps"} • descanso 60s</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="text-sm font-semibold">Vuelta a la calma (3–5 min)</div>
        <ul className="mt-1 list-disc pl-5 text-xs text-white/65">
          <li>Caminar suave + estirar cuádriceps, isquios, pecho y dorsales</li>
        </ul>
      </div>
    </div>
  );
}

export default function CapsulePage() {
  const { player, settings, loading } = usePlayer();
  const [variant, setVariant] = useState<Variant>("capsule_30");
  const [started, setStarted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { remaining, base, reset } = useCountdown(variant, started);

  const dateISO = todayISO();

  if (loading || !player || !settings) {
    return (
      <div className="space-y-4">
        <Card title="Cargando Orgullo Saiyajin..." />
      </div>
    );
  }

  async function finalize() {
    // Marca main quest
    await completeQuest({ dateISO, questId: "main_workout" });

    const res = await completeCapsuleWorkout({
      todayISO: dateISO,
      templateId: variant === "capsule_60" ? "capsule_gym_60" : "capsule_gym_30",
      variant,
      durationSec: Math.max(0, base - remaining)
    });

    setToast(res.message);
    setStarted(false);
    reset();
  }

  // Notificar fin de tiempo
  useEffect(() => {
    if (started && remaining === 0) {
      setStarted(false);
      setToast("Tiempo cumplido ✅");
    }
  }, [started, remaining]);

  return (
    <div className="space-y-4">
      {toast ? <Toast message={toast} kind="success" onClose={() => setToast(null)} /> : null}

      <Card title="Orgullo Saiyajin" right={<div className="text-xs text-white/60">{variant === "capsule_60" ? "+40 KI" : "+20 KI"}</div>}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-white/70">Rutinas de máquinas de gimnasio</div>
          <div className="flex items-center gap-2">
            <button
              className={cn("rounded-xl border px-3 py-2 text-sm", variant === "capsule_30" ? "border-white/25 bg-white/10" : "border-white/10 bg-black/20 text-white/70")}
              onClick={() => setVariant("capsule_30")}
            >
              30 min (+20 KI)
            </button>
            <button
              className={cn("rounded-xl border px-3 py-2 text-sm", variant === "capsule_60" ? "border-white/25 bg-white/10" : "border-white/10 bg-black/20 text-white/70")}
              onClick={() => setVariant("capsule_60")}
            >
              1 hora (+40 KI)
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm">
              <span className="text-white/70">Tiempo restante:</span> <span className="font-semibold">{formatSeconds(remaining)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStarted((s) => !s)}>
                {started ? "Pausar" : "Iniciar"}
              </Button>
              <Button variant="ghost" onClick={() => { setStarted(false); reset(); }}>
                Reiniciar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Plan sugerido">
        <CapsulePlan variant={variant} />

        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={finalize}>
            Finalizar entrenamiento
          </Button>
        </div>
      </Card>
    </div>
  );
}
