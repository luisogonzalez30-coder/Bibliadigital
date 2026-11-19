/**
 * Planes de lectura de 7 días. Cada día es un capítulo REAL de la Biblia (enlazado a /biblia) con un enfoque
 * y una pregunta de reflexión escritos por Santuario Bíblico: no son Escritura ni se atribuyen a nadie.
 */
export interface PlanDay {
  readonly day: number;
  readonly osis: string;
  readonly chapter: number;
  /** Versículo desde el que conviene empezar (ancla opcional). */
  readonly fromVerse?: number;
  readonly focus: string;
  readonly reflection: string;
}

export interface ReadingPlan {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly intro: string;
  readonly days: readonly PlanDay[];
}

export const READING_PLANS: readonly ReadingPlan[] = [
  {
    id: 'paz-7-dias',
    title: '7 días de paz para la ansiedad',
    description: 'Plan de lectura bíblica de 7 días para la ansiedad: un capítulo al día con una pregunta para reflexionar.',
    intro: 'Una semana, un capítulo al día. Lee despacio, sin apuro, y responde la pregunta con una sola frase, aunque sea solo para ti.',
    days: [
      { day: 1, osis: 'PSA', chapter: 23, focus: 'Alguien que cuida', reflection: '¿Qué parte de tu día necesitas dejar hoy en manos de otro?' },
      { day: 2, osis: 'PSA', chapter: 27, focus: 'La luz frente al miedo', reflection: '¿Qué temor te ocupa hoy? Nómbralo en una frase.' },
      { day: 3, osis: 'PSA', chapter: 46, focus: 'Un refugio en la tormenta', reflection: '¿Dónde puedes buscar calma esta semana?' },
      { day: 4, osis: 'MAT', chapter: 6, fromVerse: 25, focus: 'No cargar con el mañana', reflection: '¿Qué preocupación puedes dejar para mañana, sin culpa?' },
      { day: 5, osis: 'PSA', chapter: 91, focus: 'Bajo amparo', reflection: '¿De qué necesitas sentirte protegido hoy?' },
      { day: 6, osis: 'PSA', chapter: 121, focus: 'De dónde viene la ayuda', reflection: '¿A quién puedes pedir una ayuda concreta hoy?' },
      { day: 7, osis: 'PHP', chapter: 4, fromVerse: 6, focus: 'Una paz que guarda', reflection: '¿Qué le dirías hoy, con gratitud, a lo que te inquieta?' },
    ],
  },
  {
    id: 'fuerza-7-dias',
    title: '7 días de fuerza para el cansancio',
    description: 'Plan de lectura bíblica de 7 días para el cansancio y el agotamiento: un capítulo al día con una pregunta para reflexionar.',
    intro: 'Una semana para recuperar fuerzas sin exigirte más. Un capítulo al día y una pregunta breve.',
    days: [
      { day: 1, osis: 'ISA', chapter: 40, fromVerse: 28, focus: 'Fuerzas que se renuevan', reflection: '¿Qué te está agotando más de lo que reconoces?' },
      { day: 2, osis: 'MAT', chapter: 11, fromVerse: 28, focus: 'Descanso para los cargados', reflection: '¿Qué carga podrías compartir o soltar esta semana?' },
      { day: 3, osis: 'PSA', chapter: 62, focus: 'Descansar en lo firme', reflection: '¿En qué te apoyas cuando te falla la energía?' },
      { day: 4, osis: 'PSA', chapter: 127, fromVerse: 1, focus: 'Descansar también es confiar', reflection: '¿Qué harías hoy si no tuvieras que demostrar nada?' },
      { day: 5, osis: '2CO', chapter: 12, fromVerse: 9, focus: 'Fuerza en la debilidad', reflection: '¿Qué límite tuyo podrías aceptar hoy con tranquilidad?' },
      { day: 6, osis: 'GAL', chapter: 6, fromVerse: 9, focus: 'No te canses de lo bueno', reflection: '¿Qué pequeño bien puedes sostener sin agotarte?' },
      { day: 7, osis: 'PSA', chapter: 55, fromVerse: 22, focus: 'Echar la carga', reflection: '¿Qué carga entregas hoy, aunque sea por un rato?' },
    ],
  },
  {
    id: 'gratitud-7-dias',
    title: '7 días de gratitud',
    description: 'Plan de lectura bíblica de 7 días de gratitud: un capítulo al día con una pregunta para reflexionar.',
    intro: 'Siete días para entrenar la mirada agradecida. Después de leer, anota una cosa concreta por la que dar gracias.',
    days: [
      { day: 1, osis: 'PSA', chapter: 100, focus: 'Entrar con gracias', reflection: '¿Por qué cosa sencilla de hoy puedes dar gracias?' },
      { day: 2, osis: 'PSA', chapter: 103, fromVerse: 1, focus: 'No olvidar lo recibido', reflection: '¿Qué bien recibido estás dando por hecho?' },
      { day: 3, osis: 'PSA', chapter: 136, fromVerse: 1, focus: 'Una misericordia que permanece', reflection: '¿Qué ha permanecido contigo en los años difíciles?' },
      { day: 4, osis: 'COL', chapter: 3, fromVerse: 15, focus: 'Una paz agradecida', reflection: '¿A quién le debes un gracias que aún no dijiste?' },
      { day: 5, osis: '1TH', chapter: 5, fromVerse: 16, focus: 'Gracias en todo', reflection: '¿Qué puedes agradecer incluso en un día imperfecto?' },
      { day: 6, osis: 'PSA', chapter: 118, fromVerse: 24, focus: 'Este día', reflection: '¿Qué de este día vale la pena celebrar?' },
      { day: 7, osis: 'PSA', chapter: 107, fromVerse: 1, focus: 'Contar los favores', reflection: 'Escribe tres favores que recibiste este año.' },
    ],
  },
];

export function getPlan(id: string): ReadingPlan | undefined {
  return READING_PLANS.find((p) => p.id === id);
}
