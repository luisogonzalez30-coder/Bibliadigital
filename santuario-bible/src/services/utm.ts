/**
 * Etiquetas utm de «primer contacto»: de qué video o campaña llegó el dispositivo. Se guardan en el dispositivo
 * (no son datos personales) y viajan con los eventos anónimos. Sólo se aceptan [a-z0-9_-] para que no se pueda
 * colar texto libre ni datos personales.
 */
export interface Utm {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
}

const UTM_KEY = "santuario_utm_v1";
const LIMITS = { source: 40, medium: 40, campaign: 60, content: 60 } as const;
const PARAMS: Record<keyof Utm, string> = { source: "utm_source", medium: "utm_medium", campaign: "utm_campaign", content: "utm_content" };

export function cleanUtm(value: string | null, max: number): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return v.length > 0 && v.length <= max && /^[a-z0-9_-]+$/.test(v) ? v : null;
}

/** Lee la URL y devuelve las etiquetas válidas, o null si no hay ninguna. */
export function parseUtm(search: string): Utm | null {
  const q = new URLSearchParams(search);
  const out: Utm = {
    source: cleanUtm(q.get(PARAMS.source), LIMITS.source),
    medium: cleanUtm(q.get(PARAMS.medium), LIMITS.medium),
    campaign: cleanUtm(q.get(PARAMS.campaign), LIMITS.campaign),
    content: cleanUtm(q.get(PARAMS.content), LIMITS.content),
  };
  return out.source || out.medium || out.campaign || out.content ? out : null;
}

export function readStoredUtm(): Utm | null {
  try {
    const raw = window.localStorage.getItem(UTM_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Record<keyof Utm, unknown>>;
    const out: Utm = {
      source: cleanUtm(typeof p.source === "string" ? p.source : null, LIMITS.source),
      medium: cleanUtm(typeof p.medium === "string" ? p.medium : null, LIMITS.medium),
      campaign: cleanUtm(typeof p.campaign === "string" ? p.campaign : null, LIMITS.campaign),
      content: cleanUtm(typeof p.content === "string" ? p.content : null, LIMITS.content),
    };
    return out.source || out.medium || out.campaign || out.content ? out : null;
  } catch {
    return null;
  }
}

/** Guarda el primer contacto (si aún no hay uno). No hace nada si las estadísticas están desactivadas (lo decide quien llama). */
export function captureUtm(search: string): void {
  try {
    if (window.localStorage.getItem(UTM_KEY)) return;
    const found = parseUtm(search);
    if (found) window.localStorage.setItem(UTM_KEY, JSON.stringify(found));
  } catch {
    /* almacenamiento bloqueado: se ignora */
  }
}

export function clearStoredUtm(): void {
  try {
    window.localStorage.removeItem(UTM_KEY);
  } catch {
    /* se ignora */
  }
}
