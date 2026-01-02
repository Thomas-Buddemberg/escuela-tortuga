import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Navbar from "./Navbar";
const AudioPlayer = dynamic(() => import("./AudioPlayer"), { ssr: false });

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-4">
        {children}
      </main>
      <AudioPlayer />
    </div>
  );
}