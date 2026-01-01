"use client";

import { useEffect } from "react";
import { ensureDbReady, ensureDailyReset } from "@/lib/store/game";
import { todayISO } from "@/lib/date";

/**
 * Se ejecuta una sola vez en el cliente:
 * - Abre DB y crea seed si falta
 * - Aplica reset diario (KI diario)
 */
export default function ClientBootstrap() {
  useEffect(() => {
    const run = async () => {
      await ensureDbReady();
      await ensureDailyReset(todayISO());
    };
    run().catch((e) => {
      // En un MVP, simplemente dejamos log para debug.
      console.error("Bootstrap error:", e);
    });
  }, []);

  return null;
}
