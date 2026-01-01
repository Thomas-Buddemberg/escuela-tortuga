"use client";

import { useEffect, useState } from "react";

/**
 * Toast minimalista por prop. Para no meter librerías.
 */
export default function Toast({
  message,
  kind = "info",
  onClose,
  durationMs = 2600
}: {
  message: string;
  kind?: "info" | "success" | "warning";
  onClose: () => void;
  durationMs?: number;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setOpen(false);
      onClose();
    }, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onClose]);

  if (!open) return null;

  const styles =
    kind === "success"
      ? "border-emerald-500/25 bg-emerald-500/12 text-emerald-100"
      : kind === "warning"
      ? "border-amber-500/25 bg-amber-500/12 text-amber-100"
      : "border-white/10 bg-white/6 text-white/90";

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-3xl px-4">
      <div className={`rounded-2xl border p-3 shadow-soft ${styles}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm">{message}</div>
          <button
            className="rounded-lg px-2 py-1 text-xs text-white/70 hover:bg-white/10"
            onClick={() => {
              setOpen(false);
              onClose();
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
