import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Santuario · Lectura Bíblica Diaria",
    short_name: "Santuario",
    description: "Lectura diaria de las Escrituras, íntegra y verificada.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FAF6F0",
    theme_color: "#1C1917",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
