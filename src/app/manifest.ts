import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Turtle Ki",
    short_name: "TurtleKi",
    description: "Entrenamiento gamificado estilo Escuela de la Tortuga. KI, misiones y transformaciones.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f1a",
    theme_color: "#0b0f1a",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
