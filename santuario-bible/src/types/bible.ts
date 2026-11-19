/**
 * Tradiciones religiosas soportadas en el MVP para Chile, LATAM y USA.
 * - catholic: Canon de 73 libros (incluye Deuterocanónicos).
 * - protestant: Canon de 66 libros.
 * - torah: Pentateuco / Tanaj (Tradición Hebrea).
 * - universal: Acceso abierto a los 73 libros sin filtro denominacional.
 */
export type TraditionSlug = 'catholic' | 'protestant' | 'torah' | 'universal';

/**
 * Estados emocionales de la Brújula del Alma.
 */
export type EmotionSlug = 'ansiedad' | 'gratitud' | 'duelo' | 'cansancio' | 'sabiduria';

/**
 * Categoría canónica del libro para filtrado estricto.
 */
export type TestamentCategory = 'TORAH' | 'OT_PROPHETS_WRITINGS' | 'DEUTEROCANONICAL' | 'NT';

/**
 * Estructura inmutable de un versículo 100% real y verificado.
 */
export interface CanonicalVerse {
  readonly id: string;
  readonly bookOsis: string;
  readonly bookNameEs: string;
  readonly bookNameEn: string;
  readonly chapter: number;
  readonly verseNumber: string; // Soporta versículo único ("1") o rango ("1-4")
  readonly testamentCategory: TestamentCategory;
  readonly textEs: string;
  readonly textEn: string;
  readonly versionEs: string;
  readonly versionEn: string;
  readonly allowedTraditions: readonly TraditionSlug[];
  readonly emotionTags: readonly EmotionSlug[];
  readonly sha256Hash: string;
}

/**
 * Metadatos de cada tradición para el selector del Santuario.
 */
export interface TraditionMetadata {
  readonly slug: TraditionSlug;
  readonly labelEs: string;
  readonly labelEn: string;
  readonly bookCount: number;
  readonly descriptionEs: string;
}

/**
 * Estado persistente del usuario en el Santuario.
 */
export interface UserSanctuaryState {
  tradition: TraditionSlug;
  showParallelEnglish: boolean;
  darkMode: boolean;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null; // Formato YYYY-MM-DD
  bookmarkedVerseIds: string[];
  /** true una vez completada la bienvenida (fe, nombre y necesidad). Se guarda solo en el dispositivo. */
  onboarded?: boolean;
  /** Religión o creencia elegida en la bienvenida (id de FAITH_CHOICES). Solo en el dispositivo; la tradición (canon) es la que filtra el contenido. */
  faithId?: string;
  /** Nombre con el que la app saluda. Solo en el dispositivo; nunca se envía a la nube. */
  displayName?: string;
  /** Lo que la persona dijo que la trae hoy (Brújula del Alma); null si solo quiere leer. */
  focusEmotion?: EmotionSlug | null;
}

/**
 * Lo que se lee de la nube para un usuario autenticado (vacío si no hay datos o sesión).
 */
export interface CloudSnapshot {
  profile: Pick<
    UserSanctuaryState,
    'tradition' | 'currentStreak' | 'longestStreak' | 'lastReadDate'
  > | null;
  bookmarkedVerseIds: string[];
}
