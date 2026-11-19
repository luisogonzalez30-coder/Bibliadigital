import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BibleHeader } from "@/components/bible/BibleHeader";
import { BIBLE_BOOKS, BIBLE_VERSION_ES } from "@/data/bible/books";
import { getBookBySlug } from "@/lib/bible";

export function generateStaticParams() {
  return BIBLE_BOOKS.map((b) => ({ libro: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ libro: string }> }): Promise<Metadata> {
  const { libro } = await params;
  const book = getBookBySlug(libro);
  if (!book) return {};
  return {
    title: `${book.nameEs} · ${BIBLE_VERSION_ES} | Santuario Bíblico`,
    description: `Lee ${book.nameEs} (${book.chapters} capítulos) en la ${BIBLE_VERSION_ES}. Texto literal y verificable.`,
    alternates: { canonical: `/biblia/${book.slug}` },
  };
}

export default async function BookPage({ params }: { params: Promise<{ libro: string }> }) {
  const { libro } = await params;
  const book = getBookBySlug(libro);
  if (!book) notFound();
  return (
    <div className="text-sanct-text">
      <BibleHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-6 pb-24 pt-8">
        <nav aria-label="Ruta" className="text-sm text-sanct-muted">
          <Link href="/biblia" className="hover:text-sanct-text">La Biblia</Link> / {book.nameEs}
        </nav>
        <h1 className="scripture text-4xl leading-tight sm:text-5xl">{book.nameEs}</h1>
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
            <li key={c}>
              <Link
                href={`/biblia/${book.slug}/${c}`}
                className="flex aspect-square items-center justify-center rounded-xl border border-sanct-border text-sm tabular-nums transition hover:bg-sanct-surface"
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
