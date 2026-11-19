import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Santuario Bíblico · Lectura Bíblica Diaria",
    short_name: "Santuario",
    description: "Palabra diaria: la Biblia completa, íntegra y verificada.",
    start_url: "/santuario",
    scope: "/",
    display: "standalone",
    background_color: "#1C1917",
    theme_color: "#1C1917",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
