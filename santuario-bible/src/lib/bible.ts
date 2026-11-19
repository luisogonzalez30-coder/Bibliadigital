/**
 * Acceso a la Biblia completa (servidor, en tiempo de compilación).
 * Los datos los genera scripts/build-bible.mjs desde Reina-Valera 1909 + KJV (dominio público).
 * Cada versículo: [número, textoEs, textoEn, sha256(textoEs + "|" + textoEn)].
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { BIBLE_BOOKS, type BibleBook } from "@/data/bible/books";

export type RawVerse = readonly [number, string, string, string];

export interface ReaderVerse {
  n: number;
  es: string;
  en: string;
  h: string;
}

const cache = new Map<string, RawVerse[][]>();

function loadBook(osis: string): RawVerse[][] {
  const hit = cache.get(osis);
  if (hit) return hit;
  const file = path.join(process.cwd(), "src", "data", "bible", `${osis}.json`);
  const parsed = JSON.parse(readFileSync(file, "utf8")) as { o: string; c: RawVerse[][] };
  cache.set(osis, parsed.c);
  return parsed.c;
}

export function getBookBySlug(slug: string): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.slug === slug);
}

export function getChapter(book: BibleBook, chapter: number): ReaderVerse[] | null {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) return null;
  const rows = loadBook(book.osis)[chapter - 1];
  if (!rows) return null;
  return rows.map(([n, es, en, h]) => ({ n, es, en, h }));
}

export function allChapterParams(): { libro: string; capitulo: string }[] {
  return BIBLE_BOOKS.flatMap((b) => Array.from({ length: b.chapters }, (_, i) => ({ libro: b.slug, capitulo: String(i + 1) })));
}

/** Capítulo anterior y siguiente (cruzando libros). */
export function neighbours(book: BibleBook, chapter: number): { prev: { href: string; label: string } | null; next: { href: string; label: string } | null } {
  const idx = BIBLE_BOOKS.findIndex((b) => b.osis === book.osis);
  const link = (b: BibleBook, c: number) => ({ href: `/biblia/${b.slug}/${c}`, label: `${b.nameEs} ${c}` });
  let prev = null;
  let next = null;
  if (chapter > 1) prev = link(book, chapter - 1);
  else if (idx > 0) {
    const pb = BIBLE_BOOKS[idx - 1] as BibleBook;
    prev = link(pb, pb.chapters);
  }
  if (chapter < book.chapters) next = link(book, chapter + 1);
  else if (idx < BIBLE_BOOKS.length - 1) next = link(BIBLE_BOOKS[idx + 1] as BibleBook, 1);
  return { prev, next };
}
