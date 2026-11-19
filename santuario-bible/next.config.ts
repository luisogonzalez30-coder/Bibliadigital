import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // El service worker debe revalidarse siempre para que las actualizaciones se detecten.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  // Enlaces cortos para las biografías de redes: llevan a /historias con el origen ya etiquetado (utm).
  async redirects() {
    const to = (source: string) => `/historias?utm_source=${source}&utm_medium=bio&utm_campaign=perfil`;
    return [
      { source: "/ig", destination: to("instagram"), permanent: false },
      { source: "/tiktok", destination: to("tiktok"), permanent: false },
      { source: "/yt", destination: to("youtube"), permanent: false },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
