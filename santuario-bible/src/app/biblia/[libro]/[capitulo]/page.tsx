import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BibleHeader } from "@/components/bible/BibleHeader";
import { ChapterReader } from "@/components/bible/ChapterReader";
import { BIBLE_VERSION_EN, BIBLE_VERSION_ES } from "@/data/bible/books";
import { allChapterParams, getBookBySlug, getChapter, neighbours } from "@/lib/bible";

export function generateStaticParams() {
  return allChapterParams();
}

type Params = Promise<{ libro: string; capitulo: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { libro, capitulo } = await params;
  const book = getBookBySlug(libro);
  const chapter = Number(capitulo);
  const verses = book ? getChapter(book, chapter) : null;
  if (!book || !verses) return {};
  const first = verses.find((v) => v.es)?.es ?? verses[0]?.en ?? "";
  const excerpt = first.length > 120 ? `${first.slice(0, 117)}…` : first;
  return {
    title: `${book.nameEs} ${chapter} · ${BIBLE_VERSION_ES} | Santuario Bíblico`,
    description: `${book.nameEs} ${chapter} en la ${BIBLE_VERSION_ES}: «${excerpt}» Texto literal y verificable.`,
    alternates: { canonical: `/biblia/${book.slug}/${chapter}` },
  };
}

export default async function ChapterPage({ params }: { params: Params }) {
  const { libro, capitulo } = await params;
  const book = getBookBySlug(libro);
  const chapter = Number(capitulo);
  const verses = book ? getChapter(book, chapter) : null;
  if (!book || !verses) notFound();
  const { prev, next } = neighbours(book, chapter);

  return (
    <div className="text-sanct-text">
      <BibleHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-6 pb-24 pt-8">
        <nav aria-label="Ruta" className="text-sm text-sanct-muted">
          <Link href="/biblia" className="hover:text-sanct-text">La Biblia</Link> /{" "}
          <Link href={`/biblia/${book.slug}`} className="hover:text-sanct-text">{book.nameEs}</Link> / {chapter}
        </nav>
        <header className="space-y-2">
          <h1 className="scripture text-4xl leading-tight sm:text-5xl">
            {book.nameEs} {chapter}
          </h1>
          <p className="text-sm text-sanct-muted">{BIBLE_VERSION_ES}</p>
        </header>
        <ChapterReader
          osis={book.osis}
          nameEs={book.nameEs}
          nameEn={book.nameEn}
          category={book.testamentCategory}
          chapter={chapter}
          verses={verses}
          versionEs={BIBLE_VERSION_ES}
          versionEn={BIBLE_VERSION_EN}
          prev={prev}
          next={next}
        />
      </main>
    </div>
  );
}
