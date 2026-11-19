import type { CanonicalVerse, TraditionSlug } from '@/types/bible';

/**
 * Compañeros de Fe y Oración.
 *
 * Reglas (Regla de Oro):
 * - Nada de lo que aquí se escribe se pone en boca de una figura: no hay frases atribuidas, chats simulados
 *   ni oraciones "de" ningún santo. Sólo hay (1) una reseña sobria en tercera persona, (2) un pasaje REAL
 *   del catálogo verificado, enlazado por `verseId`, y (3) una guía para la oración personal de quien lee.
 * - El pasaje se elige por afinidad temática con la intención; no se afirma que la figura lo haya leído o dicho.
 * - El texto bíblico nunca vive aquí: se obtiene siempre de `CANONICAL_VERSES` y sólo se muestra si su
 *   huella SHA-256 coincide (ver `getCompanionVerse`).
 */
export interface FaithCompanion {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  /** Tradición con la que la figura tiene afinidad: 'catholic' o el camino transversal 'universal'. */
  readonly traditionAffinity: TraditionSlug;
  readonly intention: string;
  /** Reseña histórica/espiritual sobria, en tercera persona. */
  readonly historicalNote: string;
  /** Id de un versículo de `CANONICAL_VERSES`. */
  readonly verseId: string;
  /** Guía breve de intención personal para meditar ante el pasaje (nunca una oración atribuida a la figura). */
  readonly prayerPrompt: string;
}

export const FAITH_COMPANIONS: readonly FaithCompanion[] = [
  {
    id: 'francisco-de-asis',
    name: 'San Francisco de Asís',
    title: 'Fundador de la Orden de los Frailes Menores',
    traditionAffinity: 'catholic',
    intention: 'Paz, creación y sencillez',
    historicalNote:
      'Nació en Asís (Italia) hacia 1181 y murió en 1226. Hijo de un comerciante, dejó una vida acomodada para vivir en pobreza y fundó la Orden de los Frailes Menores. Es recordado por su sencillez y por su cercanía a la creación. Fue canonizado en 1228.',
    verseId: 'MAT.6.26',
    prayerPrompt:
      'Lee el pasaje despacio y luego en silencio. Mira a tu alrededor: ¿qué de lo que hoy te rodea puedes recibir con gratitud, sin querer más? Nombra una preocupación y pregúntate qué parte de ella puedes soltar hoy.',
  },
  {
    id: 'teresa-de-jesus',
    name: 'Santa Teresa de Jesús',
    title: 'Carmelita, reformadora y Doctora de la Iglesia',
    traditionAffinity: 'catholic',
    intention: 'Oración interior y serenidad',
    historicalNote:
      'Nació en Ávila (España) en 1515 y murió en 1582. Carmelita, impulsó la reforma de su orden con la fundación de comunidades de Carmelitas Descalzas y dejó escritos sobre la vida de oración, entre ellos «Camino de perfección» y «Las moradas». Fue canonizada en 1622 y declarada Doctora de la Iglesia en 1970.',
    verseId: 'MAT.6.6',
    prayerPrompt:
      'Busca un lugar tranquilo y deja a un lado lo que te distrae. Lee el pasaje y quédate unos minutos en silencio, sin pedir nada. Después, con tus propias palabras, di lo que llevas dentro, tal como es.',
  },
  {
    id: 'judas-tadeo',
    name: 'San Judas Tadeo',
    title: 'Apóstol',
    traditionAffinity: 'catholic',
    intention: 'Causas difíciles y esperanza firme',
    historicalNote:
      'La tradición cristiana lo identifica con el apóstol Judas «de Santiago» (Lucas 6:16), también llamado Tadeo, y le atribuye la Carta de Judas del Nuevo Testamento. No debe confundirse con Judas Iscariote. La devoción popular lo invoca en las causas difíciles.',
    verseId: 'ROM.15.13',
    prayerPrompt:
      'Piensa en una situación que hoy parece sin salida. Léela junto al pasaje y escribe, en una frase, qué esperarías si confiaras. ¿Qué paso pequeño y concreto puedes dar hoy, sin esperar a que todo se resuelva?',
  },
  {
    id: 'miguel-arcangel',
    name: 'San Miguel Arcángel',
    title: 'Ángel mencionado en la Escritura',
    traditionAffinity: 'catholic',
    intention: 'Fortaleza y amparo espiritual',
    historicalNote:
      'Es una figura bíblica, no un personaje con biografía histórica: aparece nombrado en el libro de Daniel (10:13 y 12:1), en la Carta de Judas (v. 9) y en el Apocalipsis (12:7). Su nombre significa «¿Quién como Dios?». La tradición cristiana lo venera como protector.',
    verseId: 'PSA.91.1-2',
    prayerPrompt:
      'Imagina un lugar seguro donde puedas descansar. Lee el pasaje e identifica de qué necesitas amparo hoy. Respira despacio y repite en silencio una sola palabra del pasaje que te dé firmeza.',
  },
  {
    id: 'clara-de-asis',
    name: 'Santa Clara de Asís',
    title: 'Fundadora de las Hermanas Pobres (clarisas)',
    traditionAffinity: 'catholic',
    intention: 'Luz interior y confianza',
    historicalNote:
      'Nació en Asís hacia 1193-1194 y murió en 1253. Inspirada por Francisco, dejó la casa de su familia y fundó en San Damián una comunidad de vida contemplativa y pobreza, origen de las clarisas. Fue canonizada en 1255.',
    verseId: 'PSA.27.1',
    prayerPrompt:
      'Lee el pasaje y pregúntate: ¿qué temor me ocupa hoy? Ponlo frente a la palabra «luz» y quédate en silencio un momento. Anota una cosa en la que hoy puedes confiar.',
  },
  {
    id: 'testigos-de-la-palabra',
    name: 'Testigos de la Palabra',
    title: 'Camino transversal para todas las tradiciones',
    traditionAffinity: 'universal',
    intention: 'Sabiduría, guía y confianza en la Escritura',
    historicalNote:
      'No es una persona, sino un camino abierto a toda tradición: acercarse a la Escritura con atención y dejar que el texto, leído despacio, sea quien guíe. Personas de distintas tradiciones han leído y meditado estos pasajes a lo largo de los siglos.',
    verseId: 'PRO.3.5-6',
    prayerPrompt:
      'Lee el pasaje dos veces: una para entenderlo y otra para escucharlo. ¿Qué decisión tienes pendiente? Escribe qué parte confías a la Escritura y qué parte te toca hacer a ti.',
  },
];

/**
 * Orden de presentación según la tradición activa:
 * - Católica: primero las figuras católicas y después el camino transversal.
 * - Cualquier otra: primero el camino transversal; las figuras católicas quedan disponibles para explorar.
 */
export function orderCompanions(tradition: TraditionSlug): FaithCompanion[] {
  const catholic = FAITH_COMPANIONS.filter((c) => c.traditionAffinity === 'catholic');
  const transversal = FAITH_COMPANIONS.filter((c) => c.traditionAffinity !== 'catholic');
  return tradition === 'catholic' ? [...catholic, ...transversal] : [...transversal, ...catholic];
}

/**
 * Pasaje real de un compañero, tomado del catálogo ya verificado (filterVerifiedVerses).
 * Devuelve null si no existe o no pasó la verificación: nunca se sustituye por otro texto.
 */
export function getCompanionVerse(
  companion: FaithCompanion,
  verifiedVerses: readonly CanonicalVerse[]
): CanonicalVerse | null {
  return verifiedVerses.find((v) => v.id === companion.verseId) ?? null;
}
