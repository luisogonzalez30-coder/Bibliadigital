/**
 * Agrega al catálogo curado (src/data/canonicalSeed.ts) pasajes elegidos por referencia, copiando su texto
 * LITERAL desde la Biblia completa ya verificada (src/data/bible/*.json). No escribe ni edita ningún texto.
 * Es idempotente: omite los ids que ya existen. Uso: node scripts/add-curated-verses.mjs
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const ALL = ["catholic", "protestant", "torah", "universal"];
const NT = ["catholic", "protestant", "universal"];
// [OSIS, capítulo, desde, hasta, emociones]
const REFS = [
  // Paz (ansiedad)
  ["ISA", 41, 10, 10, ["ansiedad", "cansancio"]], ["JOS", 1, 9, 9, ["ansiedad", "cansancio"]], ["JHN", 14, 27, 27, ["ansiedad"]],
  ["1PE", 5, 7, 7, ["ansiedad"]], ["MAT", 6, 34, 34, ["ansiedad"]], ["PSA", 55, 22, 22, ["ansiedad", "cansancio"]],
  ["ISA", 26, 3, 3, ["ansiedad"]], ["JHN", 16, 33, 33, ["ansiedad", "duelo"]], ["2TI", 1, 7, 7, ["ansiedad", "cansancio"]],
  ["PSA", 56, 3, 3, ["ansiedad"]], ["EXO", 14, 14, 14, ["ansiedad", "cansancio"]],
  // Fuerza (cansancio)
  ["PHP", 4, 13, 13, ["cansancio"]], ["GAL", 6, 9, 9, ["cansancio"]], 
  ["PSA", 121, 2, 2, ["cansancio", "ansiedad"]], ["2CO", 12, 9, 9, ["cansancio"]],
  // Gratitud
  ["PSA", 118, 24, 24, ["gratitud"]], ["1TH", 5, 18, 18, ["gratitud"]], ["PSA", 136, 1, 1, ["gratitud"]],
  ["PSA", 103, 2, 2, ["gratitud"]], ["1CH", 16, 34, 34, ["gratitud"]], ["COL", 3, 15, 15, ["gratitud", "ansiedad"]],
  // Consuelo (duelo)
  ["PSA", 34, 18, 18, ["duelo"]], ["MAT", 5, 4, 4, ["duelo"]], ["REV", 21, 4, 4, ["duelo"]],
  ["PSA", 30, 5, 5, ["duelo"]], ["2CO", 1, 3, 4, ["duelo"]], ["LAM", 3, 22, 23, ["duelo", "gratitud"]],
  ["PSA", 147, 3, 3, ["duelo"]], ["ISA", 43, 2, 2, ["duelo", "ansiedad"]],
  // Guía (sabiduría)
  ["JAS", 1, 5, 5, ["sabiduria"]], ["PSA", 119, 105, 105, ["sabiduria"]], ["PRO", 16, 3, 3, ["sabiduria"]],
  ["PSA", 32, 8, 8, ["sabiduria"]], ["JER", 29, 11, 11, ["sabiduria", "ansiedad"]], ["ECC", 3, 1, 1, ["sabiduria"]],
  ["PRO", 2, 6, 6, ["sabiduria"]], ["ISA", 30, 21, 21, ["sabiduria"]],
];

const { BIBLE_BOOKS } = await import("../src/data/bible/books.ts").catch(async () => {
  // Node no carga .ts: se lee el listado generado como JSON.
  const src = readFileSync(new URL("../src/data/bible/books.ts", import.meta.url), "utf8");
  const json = src.slice(src.indexOf("BIBLE_BOOKS: readonly BibleBook[] = ") + "BIBLE_BOOKS: readonly BibleBook[] = ".length).replace(/;\s*$/, "");
  return { BIBLE_BOOKS: JSON.parse(json) };
});

const seedUrl = new URL("../src/data/canonicalSeed.ts", import.meta.url);
let ts = readFileSync(seedUrl, "utf8");
const sha = (t) => createHash("sha256").update(t, "utf8").digest("hex");
const j = (v) => JSON.stringify(v);
const cache = new Map();
const load = (osis) => cache.get(osis) ?? (cache.set(osis, JSON.parse(readFileSync(new URL(`../src/data/bible/${osis}.json`, import.meta.url), "utf8")).c), cache.get(osis));

let added = 0;
const blocks = [];
for (const [osis, ch, a, b, emo] of REFS) {
  const id = `${osis}.${ch}.${a}${b > a ? "-" + b : ""}`;
  if (ts.includes(`id: "${id}"`)) continue;
  const book = BIBLE_BOOKS.find((x) => x.osis === osis);
  const rows = load(osis)[ch - 1].filter((r) => r[0] >= a && r[0] <= b);
  if (rows.length !== b - a + 1) throw new Error("faltan versos " + id);
  const textEs = rows.map((r) => r[1]).join(" "), textEn = rows.map((r) => r[2]).join(" ");
  if (!textEs || !textEn) throw new Error("texto vacío " + id);
  const cat = book.testamentCategory;
  const e = {
    id, bookOsis: osis, bookNameEs: book.nameEs, bookNameEn: book.nameEn, chapter: ch, verseNumber: b > a ? `${a}-${b}` : `${a}`,
    testamentCategory: cat, textEs, textEn, versionEs: "Reina-Valera 1909", versionEn: "King James Version",
    allowedTraditions: cat === "NT" ? NT : ALL, emotionTags: emo, sha256Hash: sha(`${textEs}|${textEn}`),
  };
  blocks.push("  {\n" + Object.entries(e).map(([k, v]) => `    ${k}: ${j(v)},`).join("\n") + "\n  },\n");
  added++;
}
if (added) {
  const end = ts.lastIndexOf("];");
  ts = ts.slice(0, end) + blocks.join("") + ts.slice(end);
  writeFileSync(seedUrl, ts);
}
console.log(`Agregados ${added} pasajes curados (omitidos los que ya existían).`);
