/** URL pública del sitio (para metadatos, sitemap y robots). Configurable con NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://smartassistusa.online").replace(/\/+$/, "");

/** Nombre público de la marca y su cuenta en redes (Instagram: @santuariobiblico). */
export const SITE_NAME = "Santuario Bíblico";
export const SOCIAL_HANDLE = "santuariobiblico";
