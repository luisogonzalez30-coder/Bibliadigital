import { NextResponse } from "next/server";
import { BIBLE_BOOKS } from "@/data/bible/books";
import rawIndex from "@/data/bible/search-index.json";
import { normalizeText } from "@/services/problemAdvisor";

/** Índice de búsqueda: sólo texto en español (Reina-Valera 1909). Se normaliza una vez por instancia. */
interface SearchIndex {
  b: string[];
  v: [number, number, number, string][];
}
const index = rawIndex as unknown as SearchIndex;

let normalized: string[] | null = null;
function getNormalized(): string[] {
  if (!normalized) normalized = index.v.map((row) => ` ${normalizeText(row[3])} `);
  return normalized;
}

const MAX_RESULTS = 40;

export async function POST(request: Request) {
  let q = "";
  try {
    const body = (await request.json()) as { q?: unknown };
    q = typeof body.q === "string" ? body.q : "";
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const query = normalizeText(q.slice(0, 80));
  if (query.length < 3) return NextResponse.json({ error: "Escribe al menos 3 letras" }, { status: 400 });

  const words = query.split(" ").filter(Boolean);
  const phrase = ` ${query} `;
  const texts = getNormalized();
  const phraseHits: number[] = [];
  const wordHits: number[] = [];
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i] as string;
    if (t.includes(phrase)) phraseHits.push(i);
    else if (words.length > 1 && words.every((w) => t.includes(w))) wordHits.push(i);
    else if (words.length === 1 && t.includes(query)) wordHits.push(i);
  }
  const ordered = [...phraseHits, ...wordHits];
  const results = ordered.slice(0, MAX_RESULTS).map((i) => {
    const [bookIdx, chapter, verse, text] = index.v[i] as [number, number, number, string];
    const book = BIBLE_BOOKS[bookIdx];
    return {
      ref: `${book?.nameEs ?? ""} ${chapter}:${verse}`,
      href: `/biblia/${book?.slug ?? ""}/${chapter}#v${verse}`,
      text,
    };
  });
  return NextResponse.json({ total: ordered.length, results }, { headers: { "Cache-Control": "no-store" } });
}
