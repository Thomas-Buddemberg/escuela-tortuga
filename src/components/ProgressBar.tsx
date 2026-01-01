export default function ProgressBar({
  value,
  max,
  label
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="space-y-1">
      {label ? <div className="text-xs text-white/70">{label}</div> : null}
      <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/30">
        <div className="h-full bg-white/70" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-white/55">
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
