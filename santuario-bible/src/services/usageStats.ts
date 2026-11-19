import { getBrowserSupabaseClient } from "@/services/supabaseClient";

export type UsageEvent = "open" | "install" | "read";

const DEVICE_KEY = "santuario_device_v1";
const OPTOUT_KEY = "santuario_stats_off";
const DAY_KEY = "santuario_open_day_v1";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const listeners = new Set<() => void>();

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* almacenamiento bloqueado: se ignora */
  }
}

/** Respeta «No rastrear» del navegador y el interruptor de Ajustes. */
export function isStatsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (navigator.doNotTrack === "1") return false;
  return readStorage(OPTOUT_KEY) !== "1";
}

export function setStatsEnabled(enabled: boolean): void {
  writeStorage(OPTOUT_KEY, enabled ? null : "1");
  if (!enabled) {
    // Al desactivar se olvida el identificador del dispositivo.
    writeStorage(DEVICE_KEY, null);
    writeStorage(DAY_KEY, null);
  }
  listeners.forEach((l) => l());
}

export function subscribeStats(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getDeviceId(): string | null {
  const existing = readStorage(DEVICE_KEY);
  if (existing && UUID_RE.test(existing)) return existing;
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") return null;
  const created = crypto.randomUUID();
  writeStorage(DEVICE_KEY, created);
  return created;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Fecha local YYYY-MM-DD para limitar «open» a uno por día y dispositivo. */
function localDay(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Registra un evento anónimo (ID aleatorio por dispositivo, sin datos personales).
 * Nunca lanza ni bloquea la interfaz; sin Supabase configurado no hace nada.
 */
export function trackEvent(event: UsageEvent, path: string | null): void {
  if (!isStatsEnabled()) return;
  const client = getBrowserSupabaseClient();
  const deviceId = getDeviceId();
  if (!client || !deviceId) return;

  if (event === "open") {
    const today = localDay();
    if (readStorage(DAY_KEY) === today) return;
    writeStorage(DAY_KEY, today);
  }

  void Promise.resolve(
    client.from("app_events").insert({
      device_id: deviceId,
      event,
      path: path ? path.slice(0, 120) : null,
      standalone: isStandalone(),
    })
  ).catch(() => {});
}
