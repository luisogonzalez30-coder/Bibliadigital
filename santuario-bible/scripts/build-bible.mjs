/**
 * Genera la Biblia completa verificable a partir de dos ediciones de dominio público:
 *   - Español: Reina-Valera 1909 (SpaRV)    - Inglés: King James Version (KJV)
 * Fuente: https://github.com/scrollmapper/bible_databases (formats/json/SpaRV.json y KJV.json)
 *
 * Uso:  node scripts/build-bible.mjs <SpaRV.json> <KJV.json>
 *
 * Reglas (Regla de Oro): el texto se copia LITERAL de la fuente; sólo se normalizan espacios
 * (varios espacios/saltos → uno). Cada versículo guarda sha256(textoEs + "|" + textoEn), el mismo
 * esquema que el catálogo curado y la tabla `verses` de Supabase. No se resume ni se corrige nada.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const [esPath, enPath] = process.argv.slice(2);
if (!esPath || !enPath) {
  console.error("Uso: node scripts/build-bible.mjs <SpaRV.json> <KJV.json>");
  process.exit(1);
}

// [OSIS, nombre ES, nombre EN] en el orden canónico de la fuente (66 libros).
const BOOKS = [
  ["GEN", "Génesis", "Genesis"], ["EXO", "Éxodo", "Exodus"], ["LEV", "Levítico", "Leviticus"], ["NUM", "Números", "Numbers"],
  ["DEU", "Deuteronomio", "Deuteronomy"], ["JOS", "Josué", "Joshua"], ["JDG", "Jueces", "Judges"], ["RUT", "Rut", "Ruth"],
  ["1SA", "1 Samuel", "1 Samuel"], ["2SA", "2 Samuel", "2 Samuel"], ["1KI", "1 Reyes", "1 Kings"], ["2KI", "2 Reyes", "2 Kings"],
  ["1CH", "1 Crónicas", "1 Chronicles"], ["2CH", "2 Crónicas", "2 Chronicles"], ["EZR", "Esdras", "Ezra"], ["NEH", "Nehemías", "Nehemiah"],
  ["EST", "Ester", "Esther"], ["JOB", "Job", "Job"], ["PSA", "Salmos", "Psalms"], ["PRO", "Proverbios", "Proverbs"],
  ["ECC", "Eclesiastés", "Ecclesiastes"], ["SNG", "Cantares", "Song of Solomon"], ["ISA", "Isaías", "Isaiah"], ["JER", "Jeremías", "Jeremiah"],
  ["LAM", "Lamentaciones", "Lamentations"], ["EZK", "Ezequiel", "Ezekiel"], ["DAN", "Daniel", "Daniel"], ["HOS", "Oseas", "Hosea"],
  ["JOL", "Joel", "Joel"], ["AMO", "Amós", "Amos"], ["OBA", "Abdías", "Obadiah"], ["JON", "Jonás", "Jonah"],
  ["MIC", "Miqueas", "Micah"], ["NAM", "Nahúm", "Nahum"], ["HAB", "Habacuc", "Habakkuk"], ["ZEP", "Sofonías", "Zephaniah"],
  ["HAG", "Hageo", "Haggai"], ["ZEC", "Zacarías", "Zechariah"], ["MAL", "Malaquías", "Malachi"], ["MAT", "Mateo", "Matthew"],
  ["MRK", "Marcos", "Mark"], ["LUK", "Lucas", "Luke"], ["JHN", "Juan", "John"], ["ACT", "Hechos", "Acts"],
  ["ROM", "Romanos", "Romans"], ["1CO", "1 Corintios", "1 Corinthians"], ["2CO", "2 Corintios", "2 Corinthians"], ["GAL", "Gálatas", "Galatians"],
  ["EPH", "Efesios", "Ephesians"], ["PHP", "Filipenses", "Philippians"], ["COL", "Colosenses", "Colossians"], ["1TH", "1 Tesalonicenses", "1 Thessalonians"],
  ["2TH", "2 Tesalonicenses", "2 Thessalonians"], ["1TI", "1 Timoteo", "1 Timothy"], ["2TI", "2 Timoteo", "2 Timothy"], ["TIT", "Tito", "Titus"],
  ["PHM", "Filemón", "Philemon"], ["HEB", "Hebreos", "Hebrews"], ["JAS", "Santiago", "James"], ["1PE", "1 Pedro", "1 Peter"],
  ["2PE", "2 Pedro", "2 Peter"], ["1JN", "1 Juan", "1 John"], ["2JN", "2 Juan", "2 John"], ["3JN", "3 Juan", "3 John"],
  ["JUD", "Judas", "Jude"], ["REV", "Apocalipsis", "Revelation"],
];

const clean = (t) => t.replace(/\s+/g, " ").trim();
const sha = (t) => createHash("sha256").update(t, "utf8").digest("hex");
const slugOf = (name) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const categoryOf = (i) => (i < 5 ? "TORAH" : i < 39 ? "OT_PROPHETS_WRITINGS" : "NT");

const es = JSON.parse(readFileSync(esPath, "utf8"));
const en = JSON.parse(readFileSync(enPath, "utf8"));
if (es.books.length !== 66 || en.books.length !== 66) throw new Error("Se esperaban 66 libros en cada edición");

const OUT = new URL("../src/data/bible/", import.meta.url);
mkdirSync(OUT, { recursive: true });
const manifest = {};
const index = { b: BOOKS.map((b) => b[0]), v: [] };
const metaRows = [];
let total = 0;
const gapsEs = [];
const gapsEn = [];

BOOKS.forEach(([osis, nameEs, nameEn], i) => {
  const be = es.books[i], bn = en.books[i];
  if (be.chapters.length !== bn.chapters.length) throw new Error(`Capítulos distintos en ${osis}`);
  const chapters = be.chapters.map((ce, ci) => {
    const cn = bn.chapters[ci];
    if (ce.chapter !== cn.chapter || ce.verses.length !== cn.verses.length) throw new Error(`Estructura distinta en ${osis} ${ce.chapter}`);
    return ce.verses.map((ve, vi) => {
      const vn = cn.verses[vi];
      if (ve.verse !== vn.verse) throw new Error(`Versículo distinto en ${osis} ${ce.chapter}:${ve.verse}`);
      const textEs = clean(ve.text), textEn = clean(vn.text);
      if (!textEs && !textEn) throw new Error(`Texto vacío en ${osis} ${ce.chapter}:${ve.verse}`);
      // La edición española numera estos pasajes dentro de otro versículo: se deja vacío (nunca se inventa ni se mueve texto).
      if (!textEs) gapsEs.push(`${osis} ${ce.chapter}:${ve.verse}`);
      if (!textEn) gapsEn.push(`${osis} ${ce.chapter}:${ve.verse}`);
      total++;
      index.v.push([i, ce.chapter, ve.verse, textEs]);
      return [ve.verse, textEs, textEn, sha(`${textEs}|${textEn}`)];
    });
  });
  const json = JSON.stringify({ o: osis, c: chapters });
  writeFileSync(new URL(`${osis}.json`, OUT), json);
  manifest[osis] = { verses: chapters.reduce((n, c) => n + c.length, 0), sha256: sha(json) };
  metaRows.push({ osis, slug: slugOf(nameEs), nameEs, nameEn, testamentCategory: categoryOf(i), chapters: chapters.length });
});

writeFileSync(new URL("search-index.json", OUT), JSON.stringify(index));
writeFileSync(new URL("manifest.json", OUT), JSON.stringify({ source: "scrollmapper/bible_databases · SpaRV (Reina-Valera 1909) + KJV", totalVerses: total, emptyInSpanishEdition: gapsEs, emptyInEnglishEdition: gapsEn, books: manifest }, null, 1));
writeFileSync(
  new URL("books.ts", OUT),
  `// ARCHIVO GENERADO por scripts/build-bible.mjs — NO EDITAR A MANO.\n` +
    `import type { TestamentCategory } from '@/types/bible';\n\n` +
    `export interface BibleBook {\n  readonly osis: string;\n  readonly slug: string;\n  readonly nameEs: string;\n  readonly nameEn: string;\n  readonly testamentCategory: TestamentCategory;\n  readonly chapters: number;\n}\n\n` +
    `export const BIBLE_VERSION_ES = 'Reina-Valera 1909';\nexport const BIBLE_VERSION_EN = 'King James Version';\n\n` +
    `export const BIBLE_BOOKS: readonly BibleBook[] = ${JSON.stringify(metaRows, null, 2)};\n`
);
console.log(`Generados 66 libros · ${total} versículos con huella SHA-256 · vacíos en español: ${gapsEs.length}, en inglés: ${gapsEn.length}.`);
