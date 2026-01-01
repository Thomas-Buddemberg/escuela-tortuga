"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<Variant, string> = {
    primary: "bg-white text-black hover:opacity-90",
    secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
    ghost: "bg-transparent text-white/80 hover:bg-white/10 hover:text-white",
    danger: "bg-red-500/20 text-red-200 hover:bg-red-500/25 border border-red-500/25"
  };

  return <button className={[base, styles[variant], className].join(" ")} {...props} />;
}
