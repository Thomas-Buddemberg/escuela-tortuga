"use client";

import React, { useMemo, useState } from "react";

export default function ExerciseImage({ name, size = 40, className = "" }: { name: string; size?: number; className?: string }) {
  const candidates = useMemo(() => {
    const baseNames = [
      name,
      name.toLowerCase(),
      name.replace(/\s+/g, "_"),
      name.replace(/\s+/g, "-")
    ];
    const uniqueNames = Array.from(new Set(baseNames));
    const exts = [".png", ".jpg", ".jpeg", ".webp"];
    const paths: string[] = [];
    for (const n of uniqueNames) {
      for (const ext of exts) paths.push(`/assets/${encodeURIComponent(n)}${ext}`);
    }
    return paths;
  }, [name]);

  const [idx, setIdx] = useState(0);
  const [hidden, setHidden] = useState(false);

  if (hidden || candidates.length === 0) return null;

  return (
    <img
      src={candidates[Math.min(idx, candidates.length - 1)]}
      alt={name}
      width={size}
      height={size}
      className={[
        "flex-shrink-0 rounded-lg border border-white/10 bg-black/30 object-cover",
        className
      ].join(" ")}
      loading="lazy"
      onError={() => {
        if (idx < candidates.length - 1) setIdx(idx + 1);
        else setHidden(true);
      }}
    />
  );
}
