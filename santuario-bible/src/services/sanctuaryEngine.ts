import {
  CanonicalVerse,
  EmotionSlug,
  TraditionSlug,
  UserSanctuaryState,
} from '@/types/bible';
import { CANONICAL_VERSES } from '@/data/canonicalSeed';

const STORAGE_KEY = 'santuario_user_state_v1';

export const DEFAULT_USER_STATE: UserSanctuaryState = {
  tradition: 'universal',
  showParallelEnglish: false,
  darkMode: false,
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  bookmarkedVerseIds: [],
};

/**
 * Filtra el catálogo de versículos respetando estrictamente la tradición religiosa activa.
 */
export function getVersesByTradition(
  tradition: TraditionSlug,
  source: readonly CanonicalVerse[] = CANONICAL_VERSES
): CanonicalVerse[] {
  return source.filter((verse) => verse.allowedTraditions.includes(tradition));
}

/**
 * Devuelve los pasajes correspondientes a una emoción en la Brújula del Alma,
 * garantizando que pertenezcan al canon de la tradición del usuario.
 */
export function getVersesByEmotion(
  tradition: TraditionSlug,
  emotion: EmotionSlug,
  source: readonly CanonicalVerse[] = CANONICAL_VERSES
): CanonicalVerse[] {
  return getVersesByTradition(tradition, source).filter((verse) =>
    verse.emotionTags.includes(emotion)
  );
}

/** Hash FNV-1a de 32 bits para sembrar la selección diaria de forma determinista. */
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fecha local en formato YYYY-MM-DD. */
export function toLocalIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Selecciona de forma determinista 4 versículos para el Modo Stories Diario (2 min)
 * según la fecha actual y la tradición elegida.
 */
export function getDailyStoriesVerses(
  tradition: TraditionSlug,
  dateIsoString?: string,
  source: readonly CanonicalVerse[] = CANONICAL_VERSES
): CanonicalVerse[] {
  const pool = getVersesByTradition(tradition, source);
  if (pool.length <= 4) {
    return [...pool];
  }

  const today = dateIsoString ?? toLocalIsoDate();
  const ordered = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  const start = hashString(`${tradition}|${today}`) % ordered.length;

  return Array.from({ length: 4 }, (_, i) => ordered[(start + i) % ordered.length]);
}

/* ───────────── Racha de Luz ───────────── */

function previousDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toLocalIsoDate(new Date(y, m - 1, d - 1));
}

/**
 * Registra el cierre de la lectura diaria. Idempotente dentro del mismo día;
 * la racha continúa si la última lectura fue ayer y se reinicia en otro caso.
 */
export function registerDailyReading(
  state: UserSanctuaryState,
  todayIso: string = toLocalIsoDate()
): UserSanctuaryState {
  if (state.lastReadDate === todayIso) return state;

  const continues = state.lastReadDate === previousDay(todayIso);
  const currentStreak = continues ? state.currentStreak + 1 : 1;
  return {
    ...state,
    currentStreak,
    longestStreak: Math.max(state.longestStreak, currentStreak),
    lastReadDate: todayIso,
  };
}

/** Racha vigente para mostrar: 0 si ya se rompió (última lectura anterior a ayer). */
export function getActiveStreak(
  state: UserSanctuaryState,
  todayIso: string = toLocalIsoDate()
): number {
  if (state.lastReadDate === todayIso || state.lastReadDate === previousDay(todayIso)) {
    return state.currentStreak;
  }
  return 0;
}

/* ───────────── Integridad (Regla de Oro) ───────────── */

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Verifica que el texto no fue alterado: sha256(textEs + "|" + textEn) === sha256Hash. */
export async function verifyVerseIntegrity(verse: CanonicalVerse): Promise<boolean> {
  return (await sha256Hex(`${verse.textEs}|${verse.textEn}`)) === verse.sha256Hash;
}

/** Devuelve sólo los versículos íntegros; uno alterado se descarta, nunca se corrige. */
export async function filterVerifiedVerses(
  source: readonly CanonicalVerse[] = CANONICAL_VERSES
): Promise<CanonicalVerse[]> {
  const checks = await Promise.all(source.map(verifyVerseIntegrity));
  return source.filter((_, i) => checks[i]);
}

/* ───────────── Persistencia (localStorage) ───────────── */

export function loadUserState(): UserSanctuaryState {
  if (typeof window === 'undefined') return DEFAULT_USER_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_STATE;
    return { ...DEFAULT_USER_STATE, ...(JSON.parse(raw) as Partial<UserSanctuaryState>) };
  } catch {
    return DEFAULT_USER_STATE;
  }
}

export function saveUserState(state: UserSanctuaryState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* cuota excedida o modo privado: se ignora */
  }
}
