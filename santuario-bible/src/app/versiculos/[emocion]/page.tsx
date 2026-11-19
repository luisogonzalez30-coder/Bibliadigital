import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BibleHeader } from "@/components/bible/BibleHeader";
import { BIBLE_BOOKS } from "@/data/bible/books";
import { CANONICAL_VERSES } from "@/data/canonicalSeed";
import { EMOTION_PAGES, getEmotionPage } from "@/data/emotionPages";
import { CRISIS_RESOURCES } from "@/services/problemAdvisor";

export function generateStaticParams() {
  return EMOTION_PAGES.map((p) => ({ emocion: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ emocion: string }> }): Promise<Metadata> {
  const { emocion } = await params;
  const page = getEmotionPage(emocion);
  if (!page) return {};
  return {
    title: `${page.title} | Santuario`,
    description: page.description,
    alternates: { canonical: `/versiculos/${page.slug}` },
  };
}

export default async function EmotionVersesPage({ params }: { params: Promise<{ emocion: string }> }) {
  const { emocion } = await params;
  const page = getEmotionPage(emocion);
  if (!page) notFound();
  const verses = CANONICAL_VERSES.filter((v) => v.emotionTags.includes(page.slug));

  return (
    <div className="text-sanct-text">
      <BibleHeader />
      <main className="mx-auto max-w-3xl space-y-10 px-6 pb-24 pt-8">
        <header className="space-y-4">
          <h1 className="scripture text-4xl leading-tight sm:text-5xl">{page.h1}</h1>
          <p className="leading-relaxed text-sanct-muted">{page.intro}</p>
        </header>

        <ul className="space-y-6">
          {verses.map((v) => {
            const book = BIBLE_BOOKS.find((b) => b.osis === v.bookOsis);
            const first = v.verseNumber.split("-")[0];
            return (
              <li key={v.id} className="space-y-3 rounded-3xl border border-sanct-border bg-sanct-surface p-7">
                <blockquote lang="es" className="scripture text-xl leading-[1.7]">
                  {v.textEs}
                </blockquote>
                <p className="text-sm text-sanct-accent">
                  {v.bookNameEs} {v.chapter}:{v.verseNumber} · {v.versionEs}
                </p>
                {book && (
                  <Link href={`/biblia/${book.slug}/${v.chapter}#v${first}`} className="text-sm text-sanct-muted underline underline-offset-4 hover:text-sanct-text">
                    Leer el capítulo completo
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {page.care && (
          <aside role="note" className="space-y-2 rounded-3xl border border-sanct-accent/50 p-7 text-sm">
            <p className="text-base font-medium">Si estás pasando por un momento muy difícil</p>
            <p className="leading-relaxed text-sanct-muted">
              Estos textos acompañan, pero no reemplazan la ayuda de una persona. Busca a alguien de confianza o a un profesional.
            </p>
            <ul className="space-y-1 text-sanct-muted">
              {CRISIS_RESOURCES.selfHarm.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="text-xs text-sanct-muted">Verifica siempre el número vigente de tu país.</p>
          </aside>
        )}

        <section className="space-y-4 rounded-3xl border border-sanct-border p-7">
          <h2 className="scripture text-2xl">Lleva esto a tu día</h2>
          <p className="leading-relaxed text-sanct-muted">
            En Santuario puedes recibir un versículo cada día, escribir lo que vives y convertir un pasaje en una postal para compartir.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/santuario" className="rounded-full bg-sanct-accent px-6 py-3 font-medium text-sanct-bg transition hover:opacity-90">
              Entrar al Santuario
            </Link>
            <Link href="/planes" className="rounded-full border border-sanct-border px-6 py-3 transition hover:bg-sanct-surface">
              Planes de lectura
            </Link>
          </div>
        </section>

        <nav aria-label="Otras emociones" className="flex flex-wrap gap-2 text-sm">
          {EMOTION_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
            <Link key={p.slug} href={`/versiculos/${p.slug}`} className="rounded-full border border-sanct-border px-4 py-2 text-sanct-muted transition hover:bg-sanct-surface hover:text-sanct-text">
              {p.title}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
