export default function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="text-[11px] text-white/55">{label}</div>
      <div className="text-sm font-semibold text-white/90">{value}</div>
    </div>
  );
}
