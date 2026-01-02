"use client";

import Card from "@/components/Card";
import Button from "@/components/Button";
import Toast from "@/components/Toast";

import { useState } from "react";
import { usePlayer } from "@/lib/store/hooks";
import { setDailyKiCap, setDifficulty, setReduceMotion } from "@/lib/store/game";
import { exportAllData, hardResetAll, importAllData } from "@/lib/db/db";
import pkg from "../../../package.json";

export default function SettingsPage() {
  const { player, settings, loading } = usePlayer();
  const [toast, setToast] = useState<string | null>(null);

  const [importBusy, setImportBusy] = useState(false);

  if (loading || !player || !settings) {
    return (
      <div className="space-y-4">
        <Card title="Cargando ajustes..." />
      </div>
    );
  }

  async function downloadExport() {
    const payload = await exportAllData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turtle-ki-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setToast("Export descargado ✅");
  }

  async function onImport(file: File) {
    setImportBusy(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await importAllData(payload);
      setToast("Import completado ✅ (recarga si no ves cambios)");
    } catch (e: any) {
      console.error(e);
      setToast("Error importando. Archivo inválido.");
    } finally {
      setImportBusy(false);
    }
  }

  async function resetAll() {
    const ok = confirm("Esto borrará TODO tu progreso en este dispositivo. ¿Seguro?");
    if (!ok) return;
    await hardResetAll();
    setToast("Datos reiniciados ✅");
  }

  return (
    <div className="space-y-4">
      {toast ? <Toast message={toast} kind="info" onClose={() => setToast(null)} /> : null}

      <Card title="Economía de KI">
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-sm font-semibold">Cap diario</div>
            <div className="text-xs text-white/60">
              Límite de KI que puedes ganar por acciones normales en un día. (Los bonus de streak pueden excederlo)
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={20}
                max={80}
                step={5}
                value={settings.dailyKiCap}
                onChange={(e) => setDailyKiCap(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-16 text-right text-sm font-semibold">{settings.dailyKiCap}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-sm font-semibold">Dificultad</div>
            <div className="text-xs text-white/60">Ajusta reps/tiempos del entrenamiento generado.</div>
            <div className="mt-2">
              <select
                value={settings.difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/25"
              >
                <option value="easy">Fácil (−15%)</option>
                <option value="normal">Normal</option>
                <option value="hard">Difícil (+15%)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <label className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Reducir animaciones</div>
                <div className="text-xs text-white/60">Preferencia de accesibilidad.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
              />
            </label>
          </div>
        </div>
      </Card>

      <Card title="Backup (Export/Import)">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={downloadExport}>Exportar JSON</Button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
            <span>{importBusy ? "Importando..." : "Importar JSON"}</span>
            <input
              type="file"
              accept="application/json"
              className="hidden"
              disabled={importBusy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
              }}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-white/60">
          Tip: exporta antes de limpiar caché del navegador o cambiar de dispositivo.
        </p>
      </Card>

      <Card title="Peligro">
        <div className="space-y-3">
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3">
            <div className="text-sm font-semibold text-red-100">Reiniciar datos</div>
            <div className="text-xs text-red-100/80">
              Borra progreso local en este dispositivo (KI, streak, historial).
            </div>
            <div className="mt-3">
              <Button variant="danger" onClick={resetAll}>Borrar todo</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Acerca de">
        <div className="text-sm">
          Versión de la app: v{pkg.version}
        </div>
      </Card>
    </div>
  );
}
