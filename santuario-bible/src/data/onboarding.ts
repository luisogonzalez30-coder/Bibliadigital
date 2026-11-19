import type { EmotionSlug, TraditionSlug } from '@/types/bible';

/**
 * Religiones y creencias de la pregunta «¿Con qué fe quieres leer?».
 * Santuario Bíblico solo tiene la Biblia (Reina-Valera 1909 y King James), así que cada opción se traduce a uno de los
 * cuatro cánones del catálogo. A las tradiciones cuyos textos sagrados NO están en el catálogo se les dice con claridad
 * que se muestran pasajes universales de la Biblia: nunca se inventan ni se presentan textos de otra tradición.
 */
export type FaithGroup = 'cristianas' | 'judia' | 'otras' | 'sin';

export interface FaithChoice {
  readonly id: string;
  readonly group: FaithGroup;
  readonly label: string;
  readonly hint: string;
  /** Canon del catálogo con el que se filtra el contenido. */
  readonly tradition: TraditionSlug;
  /** true si los textos sagrados de esta tradición no están en el catálogo (se muestran pasajes universales). */
  readonly ownTextsMissing?: boolean;
  /** Aviso honesto que se muestra al elegirla, si el canon del catálogo no coincide del todo. */
  readonly note?: string;
}

export const FAITH_GROUPS: readonly { readonly id: FaithGroup; readonly title: string }[] = [
  { id: 'cristianas', title: 'Cristianas' },
  { id: 'judia', title: 'Judía' },
  { id: 'otras', title: 'Otras tradiciones' },
  { id: 'sin', title: 'Sin una religión en particular' },
];

const OWN_TEXTS_NOTE =
  'Santuario Bíblico es una Biblia y todavía no tiene los textos sagrados de tu tradición. Te mostramos pasajes universales de la Biblia, con respeto; puedes cambiarlo cuando quieras en Ajustes.';

export const FAITH_CHOICES: readonly FaithChoice[] = [
  { id: 'catolica', group: 'cristianas', label: 'Católica', hint: 'Biblia de 73 libros', tradition: 'catholic' },
  { id: 'evangelica', group: 'cristianas', label: 'Evangélica o pentecostal', hint: 'Biblia de 66 libros', tradition: 'protestant' },
  {
    id: 'protestante',
    group: 'cristianas',
    label: 'Protestante histórica',
    hint: 'Luterana, anglicana, presbiteriana, metodista, bautista…',
    tradition: 'protestant',
  },
  {
    id: 'ortodoxa',
    group: 'cristianas',
    label: 'Ortodoxa',
    hint: 'Biblia de 73 libros',
    tradition: 'catholic',
    note: 'Mostramos el canon de 73 libros; el canon ortodoxo incluye algunos libros más que todavía no están en Santuario Bíblico.',
  },
  { id: 'adventista', group: 'cristianas', label: 'Adventista del Séptimo Día', hint: 'Biblia de 66 libros', tradition: 'protestant' },
  {
    id: 'testigos',
    group: 'cristianas',
    label: 'Testigos de Jehová',
    hint: 'Biblia de 66 libros',
    tradition: 'protestant',
    note: 'Usamos la Reina-Valera 1909, no la Traducción del Nuevo Mundo.',
  },
  {
    id: 'sud',
    group: 'cristianas',
    label: 'Santos de los Últimos Días',
    hint: 'La Biblia (66 libros)',
    tradition: 'protestant',
    note: 'Mostramos la Biblia; no incluye los otros libros de tu iglesia.',
  },
  { id: 'judia', group: 'judia', label: 'Judía', hint: 'Torá y Tanaj', tradition: 'torah' },
  { id: 'musulmana', group: 'otras', label: 'Musulmana', hint: 'Pasajes universales de la Biblia', tradition: 'universal', ownTextsMissing: true, note: OWN_TEXTS_NOTE },
  { id: 'budista', group: 'otras', label: 'Budista', hint: 'Pasajes universales de la Biblia', tradition: 'universal', ownTextsMissing: true, note: OWN_TEXTS_NOTE },
  { id: 'espiritista', group: 'otras', label: 'Espiritista', hint: 'Pasajes universales de la Biblia', tradition: 'universal', ownTextsMissing: true, note: OWN_TEXTS_NOTE },
  {
    id: 'afro',
    group: 'otras',
    label: 'Umbanda, Candomblé o Santería',
    hint: 'Pasajes universales de la Biblia',
    tradition: 'universal',
    ownTextsMissing: true,
    note: OWN_TEXTS_NOTE,
  },
  {
    id: 'indigena',
    group: 'otras',
    label: 'Espiritualidad indígena o ancestral',
    hint: 'Pasajes universales de la Biblia',
    tradition: 'universal',
    ownTextsMissing: true,
    note: OWN_TEXTS_NOTE,
  },
  { id: 'otra', group: 'otras', label: 'Otra religión o espiritualidad', hint: 'Pasajes universales de la Biblia', tradition: 'universal', ownTextsMissing: true, note: OWN_TEXTS_NOTE },
  { id: 'creyente', group: 'sin', label: 'Creo en Dios, sin una religión en particular', hint: 'Acceso abierto a todos los textos', tradition: 'universal' },
  { id: 'agnostico', group: 'sin', label: 'No tengo religión o no estoy seguro de creer', hint: 'Lectura universal, sin presión', tradition: 'universal' },
  { id: 'buscando', group: 'sin', label: 'Aún estoy buscando', hint: 'Empieza por lo universal; puedes cambiarlo cuando quieras', tradition: 'universal' },
];

export function getFaithChoice(id: string | null | undefined): FaithChoice | undefined {
  return id ? FAITH_CHOICES.find((c) => c.id === id) : undefined;
}

export function isFaithId(value: unknown): value is string {
  return typeof value === 'string' && FAITH_CHOICES.some((c) => c.id === value);
}

/** Texto para «Tu tradición: …» en el inicio. */
export function faithDisplayLabel(id: string | null | undefined, fallback: string): string {
  const c = getFaithChoice(id);
  if (!c) return fallback;
  return c.ownTextsMissing ? `${c.label} · pasajes universales` : c.label;
}

/** Opción preseleccionada: la fe guardada o, si solo hay canon, la opción más cercana (nunca una de «universal»). */
export function initialFaithId(faithId: string | null | undefined, tradition: TraditionSlug): string | null {
  if (getFaithChoice(faithId)) return faithId ?? null;
  const hit = FAITH_CHOICES.find((c) => c.tradition === tradition && c.tradition !== 'universal');
  return hit ? hit.id : null;
}

/** Respuestas de «¿Qué te trae hoy?»; se enlazan con la Brújula del Alma. */
export interface NeedChoice {
  readonly id: string;
  readonly label: string;
  readonly emotion: EmotionSlug | null;
}

export const NEED_CHOICES: readonly NeedChoice[] = [
  { id: 'paz', label: 'Paz', emotion: 'ansiedad' },
  { id: 'fuerza', label: 'Fuerza', emotion: 'cansancio' },
  { id: 'gratitud', label: 'Gratitud', emotion: 'gratitud' },
  { id: 'consuelo', label: 'Consuelo', emotion: 'duelo' },
  { id: 'guia', label: 'Guía', emotion: 'sabiduria' },
  { id: 'leer', label: 'Solo quiero leer', emotion: null },
];
