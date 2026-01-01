export function todayISO(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseISODate(iso: string): Date {
  // Interpreta YYYY-MM-DD como fecha local (no UTC) para evitar sorpresas.
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDaysISO(iso: string, delta: number): string {
  const dt = parseISODate(iso);
  dt.setDate(dt.getDate() + delta);
  return todayISO(dt);
}

export function isYesterdayISO(candidateISO: string, todayISOValue: string): boolean {
  return candidateISO === addDaysISO(todayISOValue, -1);
}
