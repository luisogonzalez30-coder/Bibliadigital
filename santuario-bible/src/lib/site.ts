/** URL pública del sitio (para metadatos, sitemap y robots). Configurable con NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://smartassistusa.online").replace(/\/+$/, "");
