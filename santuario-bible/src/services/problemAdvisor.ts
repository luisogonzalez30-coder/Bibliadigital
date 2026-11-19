import type { EmotionSlug } from '@/types/bible';

/**
 * "Describe tu problema": clasificación local y determinista del texto de una persona.
 * - No usa servidores ni IA: el texto nunca sale del dispositivo.
 * - No genera versículos: sólo decide qué EMOCIÓN buscar; el pasaje sale del catálogo verificado.
 * - Los consejos son reflexiones fijas (no Escritura) y deben mostrarse rotuladas como tales.
 */

export type CrisisKind = 'selfHarm' | 'violence';

export interface ProblemAnalysis {
  /** Emoción detectada, o null si el texto no coincide con ninguna. */
  emotion: EmotionSlug | null;
  /** Señales de riesgo: prevalecen sobre cualquier otro resultado. */
  crisis: readonly CrisisKind[];
  /** Semilla estable (mismo texto → mismo versículo). */
  seed: number;
}

/** Minúsculas, sin tildes ni signos, con espacios simples. */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim();
}

/** Raíces/frases por emoción. Las frases pesan más que una raíz suelta. */
const LEXICON: Record<EmotionSlug, { stems: readonly string[]; phrases: readonly string[] }> = {
  ansiedad: {
    stems: ['ansie', 'angusti', 'preocup', 'nervio', 'estres', 'miedo', 'temor', 'panico', 'agobi', 'inquiet', 'insomnio', 'incertidumbre', 'asustad', 'pavor'],
    phrases: ['no puedo dormir', 'no paro de pensar', 'tengo miedo', 'me angustia', 'que va a pasar'],
  },
  cansancio: {
    stems: ['cansad', 'cansanci', 'agotad', 'agotamiento', 'agobiad', 'abrumad', 'burnout', 'desanim', 'exhaust', 'sin fuerzas', 'rendirme'],
    phrases: ['no puedo mas', 'ya no tengo fuerzas', 'estoy al limite', 'quiero rendirme', 'me siento sin energia'],
  },
  duelo: {
    stems: ['murio', 'fallec', 'luto', 'duelo', 'triste', 'llor', 'soledad', 'abandon', 'ruptura', 'separacion', 'divorcio', 'extrano', 'desconsol', 'dolor', 'perdi', 'perdida', 'depresi'],
    phrases: ['me siento solo', 'me siento sola', 'se fue', 'ya no esta', 'me dejo', 'me rompieron el corazon'],
  },
  sabiduria: {
    stems: ['decidir', 'decision', 'confundid', 'confusion', 'dudas', 'rumbo', 'elegir', 'proposito', 'discernir', 'consejo', 'encrucijada', 'direccion'],
    phrases: ['no se que hacer', 'no se que decidir', 'que camino tomar', 'necesito guia', 'necesito claridad', 'cambio de trabajo'],
  },
  gratitud: {
    stems: ['gracias', 'agradec', 'bendecid', 'bendicion', 'feliz', 'alegr', 'milagro', 'logre', 'celebr'],
    phrases: ['quiero agradecer', 'estoy agradecid', 'doy gracias'],
  },
};

/** Orden de desempate: primero lo que más suele motivar una consulta. */
const ORDER: readonly EmotionSlug[] = ['ansiedad', 'duelo', 'cansancio', 'sabiduria', 'gratitud'];

const CRISIS_PHRASES: Record<CrisisKind, readonly string[]> = {
  selfHarm: [
    'suicid', 'quitarme la vida', 'quiero morir', 'quiero morirme', 'no quiero vivir', 'no quiero seguir viviendo',
    'acabar con mi vida', 'terminar con mi vida', 'hacerme dano', 'matarme', 'autolesion', 'cortarme las venas',
    'mejor estar muerto', 'mejor estar muerta', 'desaparecer para siempre',
  ],
  violence: [
    'me pega', 'me golpea', 'me golpeo', 'me maltrata', 'violencia intrafamiliar', 'violencia domestica',
    'abuso sexual', 'abusa de mi', 'abusaron de mi', 'me amenaza de muerte', 'me violo', 'me violaron',
  ],
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function analyzeProblem(text: string): ProblemAnalysis {
  const norm = normalizeText(text);
  const padded = ` ${norm} `;

  const crisis = (Object.keys(CRISIS_PHRASES) as CrisisKind[]).filter((kind) =>
    CRISIS_PHRASES[kind].some((p) => padded.includes(p))
  );

  let best: EmotionSlug | null = null;
  let bestScore = 0;
  for (const emotion of ORDER) {
    const { stems, phrases } = LEXICON[emotion];
    let score = 0;
    for (const p of phrases) if (padded.includes(p)) score += 2;
    for (const s of stems) if (padded.includes(s)) score += 1;
    if (score > bestScore) {
      best = emotion;
      bestScore = score;
    }
  }

  // Ante una señal de riesgo sin otra emoción clara, se ofrece consuelo.
  const emotion = best ?? (crisis.length > 0 ? 'duelo' : null);
  return { emotion, crisis, seed: hashString(norm) };
}

/** Reflexión breve por emoción. NO es Escritura: la interfaz la rotula como tal. */
export const ADVICE: Record<EmotionSlug, { reflection: string; step: string }> = {
  ansiedad: {
    reflection:
      'La ansiedad suele hablar del mañana como si ya hubiera llegado. Hoy no necesitas resolver todo el camino, solo dar el siguiente paso con calma.',
    step: 'Respira lento tres veces y anota qué sí depende de ti hoy. Lo demás, entrégalo en oración y descansa de él.',
  },
  cansancio: {
    reflection:
      'El cansancio no es falta de fe: suele ser señal de que estás cargando más de lo que debías cargar a solas. Descansar también es un acto de confianza.',
    step: 'Elige una sola cosa que puedas soltar o pedir ayuda para hacerla hoy, y regálate un descanso real, sin pantallas.',
  },
  gratitud: {
    reflection:
      'Agradecer entrena la mirada para reconocer lo que ya te está sosteniendo, incluso en días imperfectos.',
    step: 'Anota tres cosas concretas de hoy y agradécele a alguien en voz alta o por mensaje.',
  },
  duelo: {
    reflection:
      'El dolor de una pérdida no se apura ni se explica: se acompaña. No tienes que estar bien hoy, y llorar no te hace más débil.',
    step: 'Permítete sentirlo sin justificarte y busca a una persona de confianza para no atravesarlo en soledad.',
  },
  sabiduria: {
    reflection:
      'Cuando hay dudas, la claridad rara vez llega de golpe: llega paso a paso, con calma y buenos consejeros.',
    step: 'Escribe tus opciones con lo bueno y lo difícil de cada una, y conversa la decisión con alguien sabio de tu confianza antes de decidir.',
  },
};

export const ADVICE_DISCLAIMER =
  'Esta reflexión es orientación general. No reemplaza la ayuda profesional ni la guía de tu líder espiritual.';

export interface CrisisResource {
  kind: CrisisKind;
  title: string;
  lines: readonly string[];
}

/** Recursos de ayuda. Verifica siempre el número vigente de tu país. */
export const CRISIS_RESOURCES: Record<CrisisKind, CrisisResource> = {
  selfHarm: {
    kind: 'selfHarm',
    title: 'No estás solo ni sola. Hablar con alguien ahora puede ayudar.',
    lines: [
      'Chile: *4141 (Línea de Prevención del Suicidio) o Salud Responde 600 360 7777.',
      'Estados Unidos: llama o escribe al 988.',
      'Si estás en peligro inmediato, llama al número de emergencias de tu país.',
    ],
  },
  violence: {
    kind: 'violence',
    title: 'Tu seguridad es lo primero. Hay personas que pueden ayudarte.',
    lines: [
      'Chile: 1455 (orientación en violencia contra las mujeres) o 133 (Carabineros).',
      'Estados Unidos: 1-800-799-7233 (Línea Nacional contra la Violencia Doméstica).',
      'Si estás en peligro inmediato, llama al número de emergencias de tu país.',
    ],
  },
};
