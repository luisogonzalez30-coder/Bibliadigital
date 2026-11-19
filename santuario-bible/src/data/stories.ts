/**
 * Historias de la serie de videos «Historias en 1 minuto». Cada una muestra los versículos EXACTOS del video,
 * leídos literalmente de la Biblia completa (RV1909). Los textos editoriales (intro, siguiente) son de Santuario.
 */
export interface StoryPassage {
  readonly osis: string;
  readonly chapter: number;
  readonly verses: readonly number[];
}

export interface StoryPage {
  readonly id: string;
  /** Orden en la serie (1 de 3). */
  readonly order: number;
  readonly title: string;
  readonly reference: string;
  readonly description: string;
  readonly intro: string;
  /** Capítulo para «Leer el capítulo completo». */
  readonly readOsis: string;
  readonly readChapter: number;
  readonly passages: readonly StoryPassage[];
  readonly nextId: string | null;
}

export const STORIES: readonly StoryPage[] = [
  {
    id: 'david-y-goliat',
    order: 1,
    title: 'David y Goliat',
    reference: '1 Samuel 17',
    description: 'La historia de David y Goliat leída tal como está escrita en 1 Samuel 17, Reina-Valera 1909, con el texto literal.',
    intro: 'Estos son los versículos del video, tal como están en la Reina-Valera 1909. Léelos con calma y sigue con el capítulo completo.',
    readOsis: '1SA',
    readChapter: 17,
    passages: [{ osis: '1SA', chapter: 17, verses: [4, 45, 49, 50] }],
    nextId: 'jose-y-sus-hermanos',
  },
  {
    id: 'jose-y-sus-hermanos',
    order: 2,
    title: 'José y sus hermanos',
    reference: 'Génesis 37, 39, 45 y 50',
    description: 'La historia de José en cuatro momentos (Génesis 37, 39, 45 y 50), con el texto literal de la Reina-Valera 1909.',
    intro: 'Cuatro momentos de la vida de José, con los versículos exactos del video. Cada uno enlaza con su capítulo completo.',
    readOsis: 'GEN',
    readChapter: 37,
    passages: [
      { osis: 'GEN', chapter: 37, verses: [3, 28] },
      { osis: 'GEN', chapter: 39, verses: [2] },
      { osis: 'GEN', chapter: 45, verses: [7] },
      { osis: 'GEN', chapter: 50, verses: [20] },
    ],
    nextId: 'daniel-y-los-leones',
  },
  {
    id: 'daniel-y-los-leones',
    order: 3,
    title: 'Daniel y los leones',
    reference: 'Daniel 6',
    description: 'La noche de Daniel en el foso de los leones, con el texto literal de Daniel 6 (Reina-Valera 1909).',
    intro: 'Los versículos del video sobre Daniel 6, exactos y verificables. Después puedes empezar un plan de lectura de 7 días.',
    readOsis: 'DAN',
    readChapter: 6,
    passages: [{ osis: 'DAN', chapter: 6, verses: [16, 21, 22, 23] }],
    nextId: null,
  },
];

export function getStory(id: string): StoryPage | undefined {
  return STORIES.find((s) => s.id === id);
}
