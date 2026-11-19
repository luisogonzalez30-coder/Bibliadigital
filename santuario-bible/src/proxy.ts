import { NextResponse, type NextRequest } from "next/server";
import { BIBLE_BOOKS } from "@/data/bible/books";
import { EMOTION_PAGES } from "@/data/emotionPages";
import { READING_PLANS } from "@/data/readingPlans";

/**
 * Las páginas dinámicas sólo existen para contenido real (libros y capítulos, planes, emociones). Con
 * cacheComponents no se puede usar `dynamicParams = false`, así que aquí se valida la ruta y se responde un
 * 404 REAL (no una página «no encontrada» con estado 200, que Google trataría como contenido).
 */
function isValid(parts: string[]): boolean {
  const [section, a, b, ...extra] = parts;
  if (extra.length > 0) return false;
  switch (section) {
    case "biblia": {
      if (!a) return true;
      const book = BIBLE_BOOKS.find((x) => x.slug === a);
      if (!book) return false;
      if (!b) return true;
      return /^[1-9]\d{0,2}$/.test(b) && Number(b) <= book.chapters;
    }
    case "planes":
      return !b && (!a || READING_PLANS.some((p) => p.id === a));
    case "versiculos":
      return !!a && !b && EMOTION_PAGES.some((e) => e.slug === a);
    default:
      return true;
  }
}

export function proxy(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  if (isValid(parts)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/pagina-no-encontrada", request.url), { status: 404 });
}

export const config = { matcher: ["/biblia/:path+", "/planes/:path+", "/versiculos/:path+"] };
