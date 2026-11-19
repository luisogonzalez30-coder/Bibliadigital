import type { EmotionSlug } from '@/types/bible';

/** Textos de las páginas «Versículos para…». Son textos editoriales de Santuario (no Escritura). */
export interface EmotionPage {
  readonly slug: EmotionSlug;
  readonly label: string;
  readonly h1: string;
  readonly title: string;
  readonly description: string;
  readonly intro: string;
  /** Si es true, la página incluye el aviso de bienestar con recursos de ayuda. */
  readonly care: boolean;
}

export const EMOTION_PAGES: readonly EmotionPage[] = [
  {
    slug: 'ansiedad',
    label: 'Paz',
    h1: 'Versículos para la ansiedad',
    title: 'Versículos para la ansiedad y la paz',
    description: 'Versículos de la Biblia para calmar la ansiedad y encontrar paz, en la Reina-Valera 1909. Texto literal y verificable.',
    intro: 'Cuando la mente no se detiene, un texto breve leído despacio puede ayudar a bajar el ritmo. Estos pasajes hablan de confianza, de no cargar solo con el mañana y de paz.',
    care: true,
  },
  {
    slug: 'cansancio',
    label: 'Fuerza',
    h1: 'Versículos de fuerza para cuando estás cansado',
    title: 'Versículos de fuerza para el cansancio',
    description: 'Versículos de la Biblia para recuperar fuerzas cuando estás agotado, en la Reina-Valera 1909. Texto literal y verificable.',
    intro: 'El cansancio no es debilidad de fe. Estos pasajes recuerdan que no tienes que sostener todo con tus propias fuerzas y que el descanso también es una forma de confianza.',
    care: false,
  },
  {
    slug: 'gratitud',
    label: 'Gratitud',
    h1: 'Versículos de gratitud',
    title: 'Versículos de gratitud y acción de gracias',
    description: 'Versículos de la Biblia para dar gracias, en la Reina-Valera 1909. Texto literal y verificable.',
    intro: 'Agradecer entrena la mirada para ver lo que ya te sostiene. Estos pasajes invitan a dar gracias en lo grande y en lo cotidiano.',
    care: false,
  },
  {
    slug: 'duelo',
    label: 'Consuelo',
    h1: 'Versículos de consuelo para el duelo y la tristeza',
    title: 'Versículos de consuelo para el duelo y la tristeza',
    description: 'Versículos de la Biblia para consolar en el duelo y la tristeza, en la Reina-Valera 1909. Texto literal y verificable.',
    intro: 'El dolor de una pérdida no se apura ni se explica: se acompaña. Estos pasajes hablan de consuelo y de no estar solo en el sufrimiento.',
    care: true,
  },
  {
    slug: 'sabiduria',
    label: 'Guía',
    h1: 'Versículos para pedir sabiduría y guía',
    title: 'Versículos para pedir sabiduría y guía',
    description: 'Versículos de la Biblia para decidir con claridad y pedir sabiduría, en la Reina-Valera 1909. Texto literal y verificable.',
    intro: 'Cuando hay dudas, la claridad rara vez llega de golpe. Estos pasajes hablan de pedir guía, de caminar paso a paso y de escuchar buenos consejos.',
    care: false,
  },
];

export function getEmotionPage(slug: string): EmotionPage | undefined {
  return EMOTION_PAGES.find((p) => p.slug === slug);
}
