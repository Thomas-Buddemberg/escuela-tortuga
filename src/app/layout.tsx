import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import ClientBootstrap from "@/components/ClientBootstrap";

export const metadata: Metadata = {
  title: "Turtle Ki",
  description: "Escuela de la Tortuga: hábitos + entrenamiento diario con KI, misiones y transformaciones.",
  applicationName: "Turtle Ki",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/icon-192.png" }]
  },
  themeColor: "#0b0f1a"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ClientBootstrap />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
