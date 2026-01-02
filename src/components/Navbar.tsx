"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Inicio" },
  { href: "/workout", label: "Entrenar" },
  { href: "/capsule", label: "Orgullo Saiyajin" },
  { href: "/progress", label: "Progreso" },
  { href: "/dojo", label: "Dojo" },
  { href: "/settings", label: "Ajustes" }
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0f1a]/70 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 shadow-soft">
            🐢
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Turtle Ki</div>
            <div className="text-[11px] text-white/60">Escuela de la Tortuga</div>
          </div>
        </Link>

        <nav className="hidden gap-1 sm:flex">
          {tabs.map((t) => {
            const active = isActive(pathname, t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={[
                  "rounded-xl px-3 py-2 text-sm transition",
                  active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                ].join(" ")}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden">
        <div className="fixed bottom-3 left-0 right-0 z-50">
          <div className="mx-auto flex max-w-3xl justify-between gap-1 px-3">
            <div className="flex w-full justify-between rounded-2xl border border-white/10 bg-[#0b0f1a]/70 p-1 backdrop-blur shadow-soft">
              {tabs.map((t) => {
                const active = isActive(pathname, t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={[
                      "flex-1 rounded-xl px-2 py-2 text-center text-xs transition",
                      active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                    ].join(" ")}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
