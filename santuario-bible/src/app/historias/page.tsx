import type { Metadata } from "next";
import Link from "next/link";
import { BibleHeader } from "@/components/bible/BibleHeader";
import { STORIES } from "@/data/stories";

export const metadata: Metadata = {
  title: "Historias bíblicas en 1 minuto | Santuario",
  description: "Historias de la Biblia con el texto literal de la Reina-Valera 1909: David y Goliat, José y sus hermanos, Daniel y los leones.",
  alternates: { canonical: "/historias" },
};

export default function StoriesIndexPage() {
  return (
    <div className="text-sanct-text">
      <BibleHeader />
      <main className="mx-auto max-w-3xl space-y-10 px-6 pb-24 pt-8">
        <header className="space-y-4">
          <h1 className="scripture text-4xl leading-tight sm:text-5xl">Historias en 1 minuto</h1>
          <p className="leading-relaxed text-sanct-muted">
            Relatos de la Biblia con el texto exacto de la Reina-Valera 1909. Aquí están los versículos de cada video, con el capítulo completo a un toque.
          </p>
        </header>
        <ul className="space-y-4">
          {STORIES.map((s) => (
            <li key={s.id}>
              <Link href={`/historias/${s.id}`} className="block space-y-2 rounded-3xl border border-sanct-border p-7 transition hover:bg-sanct-surface">
                <p className="text-xs uppercase tracking-widest text-sanct-accent">
                  {s.order} de {STORIES.length} · {s.reference}
                </p>
                <h2 className="scripture text-2xl">{s.title}</h2>
                <p className="text-sm leading-relaxed text-sanct-muted">{s.intro}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
