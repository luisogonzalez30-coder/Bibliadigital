import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BibleHeader } from "@/components/bible/BibleHeader";
import { InstallAppButton } from "@/components/landing/InstallAppButton";
import { BIBLE_BOOKS } from "@/data/bible/books";
import { STORIES, getStory } from "@/data/stories";
import { getChapter } from "@/lib/bible";

export function generateStaticParams() {
  return STORIES.map((s) => ({ historia: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ historia: string }> }): Promise<Metadata> {
  const { historia } = await params;
  const s = getStory(historia);
  if (!s) return {};
  return {
    title: `${s.title} (${s.reference}) | Santuario Bíblico`,
    description: s.description,
    alternates: { canonical: `/historias/${s.id}` },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ historia: string }> }) {
  const { historia } = await params;
  const story = getStory(historia);
  if (!story) notFound();

  const readBook = BIBLE_BOOKS.find((b) => b.osis === story.readOsis);
  const next = story.nextId ? getStory(story.nextId) : undefined;

  const blocks = story.passages.flatMap((p) => {
    const book = BIBLE_BOOKS.find((b) => b.osis === p.osis);
    const chapter = book ? getChapter(book, p.chapter) : null;
    if (!book || !chapter) return [];
    return p.verses.flatMap((n) => {
      const v = chapter.find((x) => x.n === n);
      if (!v || !v.es) return [];
      return [{ key: `${p.osis}.${p.chapter}.${n}`, text: v.es, label: `${book.nameEs} ${p.chapter}:${n} · Reina-Valera 1909`, href: `/biblia/${book.slug}/${p.chapter}#v${n}` }];
    });
  });

  return (
    <div className="text-sanct-text">
      <BibleHeader />
      <main className="mx-auto max-w-3xl space-y-10 px-6 pb-24 pt-8">
        <nav aria-label="Ruta" className="text-sm text-sanct-muted">
          <Link href="/historias" className="hover:text-sanct-text">Historias</Link> / {story.title}
        </nav>
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-sanct-accent">
            Historia {story.order} de {STORIES.length} · {story.reference}
          </p>
          <h1 className="scripture text-4xl leading-tight sm:text-5xl">{story.title}</h1>
          <p className="leading-relaxed text-sanct-muted">{story.intro}</p>
        </header>

        <ul className="space-y-6">
          {blocks.map((b) => (
            <li key={b.key} className="space-y-3 rounded-3xl border border-sanct-border bg-sanct-surface p-7">
              <blockquote lang="es" className="scripture text-xl leading-[1.7]">
                {b.text}
              </blockquote>
              <p className="text-sm text-sanct-accent">{b.label}</p>
              <Link href={b.href} className="text-sm text-sanct-muted underline underline-offset-4 hover:text-sanct-text">
                Leer en el capítulo
              </Link>
            </li>
          ))}
        </ul>

        <section aria-label="Sigue en Santuario Bíblico" className="space-y-4 rounded-3xl border border-sanct-border p-7">
          <h2 className="scripture text-2xl">Sigue leyendo en Santuario Bíblico</h2>
          <p className="text-sm leading-relaxed text-sanct-muted">
            La Biblia completa, un versículo al día y tu Racha de Luz. Gratis, sin cuenta y sin publicidad.
          </p>
          <div className="flex flex-wrap gap-3">
            {readBook && (
              <Link href={`/biblia/${readBook.slug}/${story.readChapter}`} className="rounded-full bg-sanct-accent px-6 py-3 text-sm font-medium text-sanct-bg transition hover:opacity-90">
                Leer {readBook.nameEs} {story.readChapter}
              </Link>
            )}
            <InstallAppButton fallbackHref="/#instalar" className="inline-flex items-center gap-2 rounded-full border border-sanct-border px-6 py-3 text-sm transition hover:bg-sanct-surface" />
            <Link href="/planes" className="rounded-full border border-sanct-border px-6 py-3 text-sm transition hover:bg-sanct-surface">
              Plan de lectura de 7 días
            </Link>
          </div>
        </section>

        {next && (
          <Link href={`/historias/${next.id}`} className="block space-y-1 rounded-3xl border border-sanct-border p-7 transition hover:bg-sanct-surface">
            <p className="text-xs uppercase tracking-widest text-sanct-muted">Siguiente historia</p>
            <p className="scripture text-2xl">{next.title}</p>
            <p className="text-sm text-sanct-muted">{next.reference}</p>
          </Link>
        )}

        <p className="text-xs leading-relaxed text-sanct-muted">
          Los versículos son el texto literal de la Reina-Valera 1909 (dominio público). La introducción y los enlaces son de Santuario Bíblico y no son Escritura.
        </p>
      </main>
    </div>
  );
}
