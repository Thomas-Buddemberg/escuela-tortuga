import type { ReactNode } from "react";
import dynamic from "next/dynamic";
const AudioPlayer = dynamic(() => import("./AudioPlayer"), { ssr: false });

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <AudioPlayer />
    </div>
  );
}