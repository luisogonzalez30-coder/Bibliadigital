import type { EmotionSlug, TraditionSlug } from '@/types/bible';

/** Respuestas de la pregunta «¿Con qué fe quieres leer?». Cada una se traduce a una tradición del catálogo. */
export interface FaithChoice {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly tradition: TraditionSlug;
}

export const FAITH_CHOICES: readonly FaithChoice[] = [
  { id: 'catolica', label: 'Católica', hint: 'Biblia de 73 libros, con los deuterocanónicos', tradition: 'catholic' },
  { id: 'evangelica', label: 'Evangélica o protestante', hint: 'Biblia de 66 libros', tradition: 'protestant' },
  { id: 'judia', label: 'Judía', hint: 'Torá y Tanaj', tradition: 'torah' },
  { id: 'creyente', label: 'Creo en Dios, sin una religión en particular', hint: 'Acceso abierto a todos los textos', tradition: 'universal' },
  { id: 'buscando', label: 'Aún estoy buscando', hint: 'Empieza por lo universal; puedes cambiarlo cuando quieras', tradition: 'universal' },
];

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

/** Opción preseleccionada según la tradición ya guardada (las dos de «universal» se distinguen por quien responde). */
export function faithChoiceForTradition(tradition: TraditionSlug): string | null {
  const hit = FAITH_CHOICES.find((c) => c.tradition === tradition && c.tradition !== 'universal');
  return hit ? hit.id : null;
}
