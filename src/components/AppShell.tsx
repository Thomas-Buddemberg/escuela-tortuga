import Navbar from "@/components/Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        {children}
      </main>
      <footer className="mx-auto max-w-3xl px-4 pb-8 text-xs text-white/55">
        <p>
          Turtle Ki es una herramienta de hábito. Ajusta intensidades y cuida técnica. Si tienes dolor o condición médica,
          consulta a un profesional.
        </p>
      </footer>
    </div>
  );
}
