"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatSeconds } from "@/lib/ui";

export default function BackgroundTimerIndicator({ className }: { className?: string }) {
  const [endAtMs, setEndAtMs] = useState<number | null>(null);
  const [variant, setVariant] = useState<"capsule_30" | "capsule_60" | null>(null);
  const [remaining, setRemaining] = useState<number>(0);

  // Leer estado inicial desde localStorage
  useEffect(() => {
    const read = () => {
      try {
        const k30 = localStorage.getItem("capsuleTimerV1_capsule_30");
        const k60 = localStorage.getItem("capsuleTimerV1_capsule_60");
        const parse = (raw: string | null) => {
          if (!raw) return null as null | { endAtMs: number; remaining: number };
          const d = JSON.parse(raw);
          const e = typeof d?.endAtMs === "number" ? d.endAtMs : null;
          const r = typeof d?.remaining === "number" ? d.remaining : 0;
          return e ? { endAtMs: e, remaining: r } : null;
        };
        const s30 = parse(k30);
        const s60 = parse(k60);
        const now = Date.now();
        const active: Array<{ v: "capsule_30" | "capsule_60"; e: number; r: number }> = [];
        if (s30 && s30.endAtMs > now) active.push({ v: "capsule_30", e: s30.endAtMs, r: s30.remaining });
        if (s60 && s60.endAtMs > now) active.push({ v: "capsule_60", e: s60.endAtMs, r: s60.remaining });
        if (active.length === 0) {
          setVariant(null);
          setEndAtMs(null);
          setRemaining(0);
        } else {
          // Si hay dos, toma el que termina más pronto
          active.sort((a, b) => a.e - b.e);
          setVariant(active[0].v);
          setEndAtMs(active[0].e);
          setRemaining(Math.max(0, Math.floor((active[0].e - now) / 1000)));
        }
      } catch {
        setVariant(null);
        setEndAtMs(null);
        setRemaining(0);
      }
    };

    read();

    // Actualizar cada segundo
    const id = window.setInterval(() => {
      if (!endAtMs) {
        // Releer por si se inició desde otra vista
        read();
        return;
      }
      const now = Date.now();
      const r = Math.max(0, Math.floor((endAtMs - now) / 1000));
      setRemaining(r);
      if (r <= 0) {
        setVariant(null);
        setEndAtMs(null);
      }
    }, 1000);

    // También escuchar cambios desde otras pestañas
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("capsuleTimerV1_capsule_")) read();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", onStorage);
    };
  }, [endAtMs]);

  const label = useMemo(() => {
    if (!variant) return null;
    const tag = variant === "capsule_60" ? "1h" : "30m";
    return `Orgullo ${tag}: ${formatSeconds(remaining)}`;
  }, [variant, remaining]);

  if (!variant) return null;

  return (
    <Link
      href="/orgullo"
      className={[
        "inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100 hover:bg-emerald-400/15",
        className ?? ""
      ].join(" ")}
      title="Temporizador activo — ver Orgullo Saiyajin"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
      {label}
    </Link>
  );
}
