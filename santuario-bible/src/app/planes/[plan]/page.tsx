import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BibleHeader } from "@/components/bible/BibleHeader";
import { PlanProgress } from "@/components/PlanProgress";
import { BIBLE_BOOKS } from "@/data/bible/books";
import { READING_PLANS, getPlan } from "@/data/readingPlans";

export function generateStaticParams() {
  return READING_PLANS.map((p) => ({ plan: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ plan: string }> }): Promise<Metadata> {
  const { plan } = await params;
  const p = getPlan(plan);
  if (!p) return {};
  return { title: `${p.title} | Santuario Bíblico`, description: p.description, alternates: { canonical: `/planes/${p.id}` } };
}

export default async function PlanPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params;
  const p = getPlan(plan);
  if (!p) notFound();

  const days = p.days.map((d) => {
    const book = BIBLE_BOOKS.find((b) => b.osis === d.osis);
    return {
      day: d.day,
      href: `/biblia/${book?.slug ?? ""}/${d.chapter}${d.fromVerse ? `#v${d.fromVerse}` : ""}`,
      reference: `${book?.nameEs ?? d.osis} ${d.chapter}${d.fromVerse ? ` (desde el versículo ${d.fromVerse})` : ""}`,
      focus: d.focus,
      reflection: d.reflection,
    };
  });

  return (
    <div className="text-sanct-text">
      <BibleHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-6 pb-24 pt-8">
        <nav aria-label="Ruta" className="text-sm text-sanct-muted">
          <Link href="/planes" className="hover:text-sanct-text">Planes de lectura</Link> / {p.title}
        </nav>
        <header className="space-y-4">
          <h1 className="scripture text-4xl leading-tight sm:text-5xl">{p.title}</h1>
          <p className="leading-relaxed text-sanct-muted">{p.intro}</p>
        </header>
        <PlanProgress planId={p.id} days={days} />
        <p className="text-xs leading-relaxed text-sanct-muted">
          Las preguntas son de Santuario Bíblico y no son Escritura. Si estás pasando por un momento muy difícil, busca también a una persona de confianza o a un profesional.
        </p>
      </main>
    </div>
  );
}
