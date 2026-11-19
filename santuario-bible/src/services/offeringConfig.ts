/**
 * Aporte voluntario: configuración por entorno, montos ancla y preferencias locales.
 * Nada aquí lanza errores: sin URL configurada la app sigue funcionando y el aporte muestra un aviso amable.
 * Nota: Next.js sólo inyecta NEXT_PUBLIC_* con acceso literal, por eso no se usa process.env[...].
 */

/** Moneda de los montos (peso chileno, sin decimales). */
export const OFFERING_CURRENCY = 'CLP';

/** Montos ancla de selección rápida. El del medio es el sugerido por defecto. */
export const OFFERING_ANCHORS: readonly number[] = [1000, 3000, 10000];
export const DEFAULT_OFFERING_AMOUNT = 3000;
export const MIN_OFFERING_AMOUNT = 500;
export const MAX_OFFERING_AMOUNT = 1_000_000;

const DEFAULT_LABEL = 'Aportar';
const MAX_LABEL_LENGTH = 40;
const AMOUNT_TOKEN = '{amount}';
const STORAGE_KEY = 'santuario_offering_v1';
const SNOOZE_DAYS = 7;

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

/** Plantilla de URL validada (https/http), o null si falta o es inválida. */
function getUrlTemplate(): string | null {
  const raw = process.env.NEXT_PUBLIC_OFFERING_URL?.trim();
  if (!raw) return null;
  return isHttpUrl(raw.split(AMOUNT_TOKEN).join('1')) ? raw : null;
}

export function isOfferingConfigured(): boolean {
  return getUrlTemplate() !== null;
}

/**
 * true si la URL incluye {amount}: sólo entonces el monto elegido en la app viaja al medio de pago.
 * Con un enlace de monto libre (sin {amount}) la persona escribe el monto al pagar y los montos de la app son una guía.
 */
export function offeringUrlCarriesAmount(): boolean {
  const template = getUrlTemplate();
  return template !== null && template.includes(AMOUNT_TOKEN);
}

/** Texto del botón principal: NEXT_PUBLIC_OFFERING_LABEL o "Aportar". */
export function getOfferingLabel(): string {
  const label = process.env.NEXT_PUBLIC_OFFERING_LABEL?.trim();
  return label ? label.slice(0, MAX_LABEL_LENGTH) : DEFAULT_LABEL;
}

/** "$3.000" (es-CL). */
export function formatOfferingAmount(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: OFFERING_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isValidOfferingAmount(amount: number | null): amount is number {
  return (
    amount !== null &&
    Number.isInteger(amount) &&
    amount >= MIN_OFFERING_AMOUNT &&
    amount <= MAX_OFFERING_AMOUNT
  );
}

/** Interpreta lo que escribe la persona ("5.000", "$ 5000"). Sólo enteros: devuelve null si no es válido. */
export function parseOfferingAmount(input: string): number | null {
  const digits = input.replace(/[^0-9]/g, '');
  if (!digits || digits.length > 9) return null;
  const n = Number(digits);
  return isValidOfferingAmount(n) ? n : null;
}

/** URL final del aporte: sustituye {amount} si existe; null si no hay URL válida o el monto no lo es. */
export function buildOfferingUrl(amount: number): string | null {
  const template = getUrlTemplate();
  if (!template || !isValidOfferingAmount(amount)) return null;
  const url = template.split(AMOUNT_TOKEN).join(String(amount));
  return isHttpUrl(url) ? url : null;
}

/* ───────────── Preferencias locales (último monto y frecuencia de invitaciones) ───────────── */

export interface OfferingPrefs {
  /** Último monto elegido. */
  amount?: number;
  /** Último día (YYYY-MM-DD) en que se mostró la invitación tras la lectura. */
  lastInviteDate?: string;
  /** No volver a invitar hasta después de este día (YYYY-MM-DD). */
  snoozeUntil?: string;
}

export function loadOfferingPrefs(): OfferingPrefs {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<OfferingPrefs>;
    return {
      amount: isValidOfferingAmount(parsed.amount ?? null) ? parsed.amount : undefined,
      lastInviteDate: typeof parsed.lastInviteDate === 'string' ? parsed.lastInviteDate : undefined,
      snoozeUntil: typeof parsed.snoozeUntil === 'string' ? parsed.snoozeUntil : undefined,
    };
  } catch {
    return {};
  }
}

export function saveOfferingPrefs(patch: Partial<OfferingPrefs>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loadOfferingPrefs(), ...patch }));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

/** Suma días a una fecha local YYYY-MM-DD. */
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d + days);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/**
 * Invitación tras completar la lectura: sólo si el aporte está configurado,
 * como máximo una vez al día y respetando el "Ahora no" durante 7 días.
 */
export function shouldInviteToday(prefs: OfferingPrefs, todayIso: string): boolean {
  if (!isOfferingConfigured()) return false;
  if (prefs.lastInviteDate === todayIso) return false;
  if (prefs.snoozeUntil && todayIso <= prefs.snoozeUntil) return false;
  return true;
}

export function snoozeUntilFrom(todayIso: string): string {
  return addDaysIso(todayIso, SNOOZE_DAYS);
}
