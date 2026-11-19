import { NextResponse, type NextRequest } from "next/server";
import { BIBLE_BOOKS } from "@/data/bible/books";

/**
 * Las páginas de la Biblia sólo existen para libros y capítulos reales. Con cacheComponents no se puede
 * usar `dynamicParams = false`, así que aquí se valida la ruta y se responde un 404 REAL (no una página
 * "no encontrada" con estado 200, que Google trataría como contenido).
 */
export function proxy(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean); // ["biblia", libro?, capitulo?]
  const [, slug, chapter, ...extra] = parts;
  let valid = extra.length === 0;
  if (valid && slug) {
    const book = BIBLE_BOOKS.find((b) => b.slug === slug);
    valid = book !== undefined;
    if (book && chapter) {
      valid = /^[1-9]\d{0,2}$/.test(chapter) && Number(chapter) <= book.chapters;
    }
  }
  if (valid) return NextResponse.next();
  return NextResponse.rewrite(new URL("/biblia-no-encontrada", request.url), { status: 404 });
}

export const config = { matcher: "/biblia/:path+" };
