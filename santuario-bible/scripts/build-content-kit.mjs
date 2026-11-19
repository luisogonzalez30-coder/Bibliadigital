/**
 * Genera docs/contenido-30-dias.md: 30 ideas de video corto (TikTok / Reels / Shorts) con el versículo
 * copiado LITERAL desde la Biblia completa de la app (src/data/bible/*.json). Los ganchos, textos y hashtags
 * son copy de marketing; el texto bíblico nunca se escribe a mano. Uso: node scripts/build-content-kit.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const BOOKS = JSON.parse(
  readFileSync(new URL("../src/data/bible/books.ts", import.meta.url), "utf8")
    .split("BIBLE_BOOKS: readonly BibleBook[] = ")[1]
    .replace(/;\s*$/, ""),
);
const cache = new Map();
const chapterOf = (osis, ch) => (cache.get(osis) ?? (cache.set(osis, JSON.parse(readFileSync(new URL(`../src/data/bible/${osis}.json`, import.meta.url), "utf8")).c), cache.get(osis)))[ch - 1];
function verse(osis, ch, a, b = a) {
  const rows = chapterOf(osis, ch).filter((r) => r[0] >= a && r[0] <= b);
  if (rows.length !== b - a + 1 || rows.some((r) => !r[1])) throw new Error(`pasaje inválido ${osis} ${ch}:${a}-${b}`);
  const book = BOOKS.find((x) => x.osis === osis);
  return { ref: `${book.nameEs} ${ch}:${a}${b > a ? "-" + b : ""}`, text: rows.map((r) => r[1]).join(" "), slug: book.slug };
}

// [tema, gancho (primeros 2 s), formato, osis, cap, desde, hasta, texto en pantalla, caption, hashtags extra]
const DAYS = [
  ["Consuelo", "Si hoy te duele el alma, quédate 15 segundos.", "Texto sobre fondo calmado + música suave", "PSA", 34, 18, 18, "Para el corazón roto", "No tienes que estar bien hoy. Guárdalo para cuando lo necesites.", "#consuelo #duelo"],
  ["Miedo", "Lo que más temes no tiene la última palabra.", "Lectura en voz baja, plano cerrado", "ISA", 41, 10, 10, "Para cuando tienes miedo", "Léelo despacio, dos veces.", "#miedo #fe"],
  ["Cansancio", "¿Cansado de cargar con todo tú solo?", "Pregunta a cámara + texto", "MAT", 11, 28, 28, "Para el cansancio", "Descansar también es confiar.", "#cansancio #descanso"],
  ["Valentía", "Hoy necesitas valentía, no motivación.", "Texto en movimiento", "JOS", 1, 9, 9, "Para empezar con valentía", "Compártelo con alguien que empieza algo nuevo.", "#valentia #motivacion"],
  ["Ansiedad", "Si no puedes dormir por pensar demasiado, mira esto.", "Texto sobre fondo nocturno", "PHP", 4, 6, 7, "Para la ansiedad de la noche", "Respira lento y léelo una vez más.", "#ansiedad #paz"],
  ["Ayuda", "¿Necesitas ayuda y no sabes a quién pedírsela?", "Pregunta a cámara + texto", "PSA", 121, 2, 2, "Para pedir ayuda", "Pide ayuda hoy: a Dios y a una persona real.", "#ayuda #esperanza"],
  ["Paz", "Esta paz no se parece a la del mundo.", "Postal animada", "JHN", 14, 27, 27, "Para la paz", "Guárdalo en tu pantalla de bloqueo.", "#paz #calma"],
  ["Decisiones", "Antes de decidir, lee esto.", "Texto en pantalla, 3 pasos", "PRO", 3, 5, 6, "Para decidir con claridad", "Si tienes una decisión pendiente, escríbela debajo.", "#decisiones #sabiduria"],
  ["Preocupación", "Entrega la preocupación que no puedes resolver hoy.", "Lectura en voz baja", "1PE", 5, 7, 7, "Para soltar la preocupación", "Una carga menos, aunque sea por esta noche.", "#preocupacion #oracion"],
  ["Esperanza", "Cuando nada tiene sentido, lee esto.", "Texto sobre fondo amanecer", "ROM", 8, 28, 28, "Para la esperanza", "No todo se entiende hoy. Todo se sostiene.", "#esperanza #fe"],
  ["Mañana", "Deja el mañana para mañana.", "Texto en movimiento", "MAT", 6, 34, 34, "Para dejar de adelantarte", "Hoy ya tiene suficiente. Respira.", "#ansiedad #presente"],
  ["Quietud", "Pausa. Cuarenta segundos de silencio.", "Pantalla casi vacía + temporizador", "PSA", 46, 10, 10, "Para detenerte", "Un minuto sin pantalla también es oración.", "#silencio #pausa"],
  ["Fuerzas", "Si ya no te quedan fuerzas, esto es para ti.", "Postal animada", "ISA", 40, 31, 31, "Para recuperar fuerzas", "Fuerzas nuevas no es lo mismo que más esfuerzo.", "#fuerza #renovacion"],
  ["Ánimo", "No es cobardía lo que sientes.", "Lectura en voz baja", "2TI", 1, 7, 7, "Para el ánimo", "Si hoy te cuesta, esto te recuerda lo que sí tienes.", "#animo #fe"],
  ["Sabiduría", "¿Te falta claridad? Pídela.", "Pregunta a cámara + texto", "JAS", 1, 5, 5, "Para pedir sabiduría", "Pedir guía no es debilidad.", "#sabiduria #guia"],
  ["Perseverar", "No te canses de hacer lo correcto.", "Texto en movimiento", "GAL", 6, 9, 9, "Para no rendirte", "El cansancio no es el final del camino.", "#perseverancia #constancia"],
  ["Gratitud", "Este día es un regalo. Dilo en voz alta.", "Texto sobre fondo luminoso", "PSA", 118, 24, 24, "Para dar gracias", "Cuéntanos una cosa por la que das gracias hoy.", "#gratitud #agradecimiento"],
  ["Gracias", "Da gracias aunque hoy no sea un buen día.", "Lectura en voz baja", "1TH", 5, 18, 18, "Para agradecer en todo", "Gracias no es negar el dolor: es no quedarte solo en él.", "#gratitud #fe"],
  ["Nuevo comienzo", "Cada mañana empieza de nuevo.", "Postal animada amanecer", "LAM", 3, 22, 23, "Para volver a empezar", "Hoy también cuenta. Empieza pequeño.", "#nuevocomienzo #misericordia"],
  ["Propósito", "¿Sientes que tu vida no va a ninguna parte?", "Pregunta a cámara + texto", "JER", 29, 11, 11, "Para el propósito", "Estar perdido hoy no significa estarlo para siempre.", "#proposito #futuro"],
  ["Lágrimas", "Llorar no es debilidad.", "Texto sobre fondo gris suave", "MAT", 5, 4, 4, "Para quien llora", "Si hoy lloras, no estás roto: estás vivo.", "#consuelo #lagrimas"],
  ["Esperanza futura", "Un día no habrá más dolor.", "Texto en movimiento", "REV", 21, 4, 4, "Para quien perdió a alguien", "Un abrazo a quien está de duelo. Compártelo con quien lo necesite.", "#duelo #esperanza"],
  ["Carga", "Echa aquí lo que no puedes llevar.", "Lectura en voz baja", "PSA", 55, 22, 22, "Para entregar la carga", "Hoy no tienes que resolverlo todo.", "#carga #oracion"],
  ["Debilidad", "Tu límite no es un fracaso.", "Texto sobre fondo calmado", "2CO", 12, 9, 9, "Para aceptar tus límites", "Está bien necesitar ayuda.", "#limites #gracia"],
  ["Acompañado", "No estás atravesando esto solo.", "Postal animada", "ISA", 43, 2, 2, "Para no sentirte solo", "Compártelo con alguien que esté pasando por algo difícil.", "#compania #fe"],
  ["Esfuerzo", "Sé fuerte y no tengas miedo.", "Texto en movimiento", "DEU", 31, 6, 6, "Para dar el siguiente paso", "El siguiente paso, no todo el camino.", "#fortaleza #coraje"],
  ["Guía", "Tu camino se ve más claro con luz.", "Postal animada", "PSA", 119, 105, 105, "Para el camino", "Una luz pequeña basta para el siguiente paso.", "#guia #luz"],
  ["Tiempos", "Todo tiene su tiempo. También esto.", "Texto sobre fondo atardecer", "ECC", 3, 1, 1, "Para esperar", "Esperar también es avanzar.", "#paciencia #tiempos"],
  ["Ánimo en la prueba", "Si hoy hay problemas, mira esto.", "Lectura en voz baja", "JHN", 16, 33, 33, "Para las pruebas", "Guárdalo para la próxima semana difícil.", "#pruebas #paz"],
  ["Alegría", "La tristeza dura una noche. Mira lo que sigue.", "Texto sobre fondo amanecer", "PSA", 30, 5, 5, "Para la alegría que vuelve", "Si hoy lloras, esto también pasará.", "#alegria #esperanza"],
];

const RHYTHM = `## Ritmo recomendado
- **1 video al día** (15–25 s) durante 30 días; mismo horario (por ejemplo 7:30 y 20:30 hora de Chile) para entrenar a la audiencia.
- **Primeros 2 segundos:** el gancho de cada día, en pantalla y en voz. Es lo que decide si el video se ve o se salta.
- **Siempre muestra la referencia** (libro, capítulo y versículo) y la edición (Reina-Valera 1909). Es parte de la confianza.
- **Un solo llamado a la acción:** «Link en la bio para recibir tu versículo cada día». Sin presión, sin urgencia falsa.
- **Fija un comentario con ayuda** en los videos de ansiedad y duelo (por ejemplo el *4141 en Chile; verifica el número vigente).
- **Reutiliza:** el mismo video en TikTok, Reels y Shorts; la postal 9:16 de la app sirve como imagen para historias.

## Qué medir cada semana
| Métrica | Para qué sirve |
|---|---|
| Guardados y compartidos | Indican que el contenido toca; pesan más que los «me gusta». |
| Retención a los 3 s y a los 10 s | Dice si el gancho funciona. |
| Visitas al perfil y clics al enlace | El puente real hacia la app. |
| Visitas a /santuario y /biblia en la analítica | Qué temas traen gente de verdad. |

Repite el formato de los 5 videos con más guardados y descarta el de menor retención. Con 30 días tendrás datos para decidir.

## Reglas de contenido
1. El texto bíblico sale **solo** de este documento (generado desde la Biblia de la app); no lo reescribas ni lo resumas.
2. No prometas sanidad, resultados ni «bendiciones» a cambio de nada. No atribuyas frases a santos.
3. No uses el sufrimiento de la gente como gancho de venta.
`;

let md = `# Contenido de 30 días · Santuario\n\n> Generado por \`scripts/build-content-kit.mjs\`. Los versículos se copian **literalmente** de la Biblia completa de la app (Reina-Valera 1909). Los ganchos, textos en pantalla y captions son copy de marketing editable.\n\n${RHYTHM}\n## Calendario\n\n`;
DAYS.forEach(([tema, gancho, formato, osis, ch, a, b, pantalla, caption, tags], i) => {
  const v = verse(osis, ch, a, b);
  md += `### Día ${i + 1} · ${tema}\n- **Formato:** ${formato}\n- **Gancho (0–2 s):** «${gancho}»\n- **Texto en pantalla (título):** ${pantalla}\n- **Versículo:** ${v.ref} (Reina-Valera 1909)\n\n  > ${v.text}\n\n- **Caption:** ${caption} Link en la bio.\n- **Hashtags:** ${[...new Set(["#versiculododia", "#biblia", "#fe", ...tags.split(" ")])].join(" ")}\n- **Enlace al capítulo:** /biblia/${v.slug}/${ch}#v${a}\n\n`;
});
writeFileSync(new URL("../docs/contenido-30-dias.md", import.meta.url), md);
console.log(`Generados ${DAYS.length} días de contenido.`);
