export default function Card({
  title,
  children,
  right
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-soft">
      {(title || right) ? (
        <header className="mb-3 flex items-start justify-between gap-4">
          {title ? <h2 className="text-sm font-semibold text-white/90">{title}</h2> : <div />}
          {right}
        </header>
      ) : null}
      {children}
    </section>
  );
}
