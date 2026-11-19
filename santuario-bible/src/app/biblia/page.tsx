import type { Metadata } from "next";
import Link from "next/link";
import { BibleSearch } from "@/components/bible/BibleSearch";
import { BibleHeader } from "@/components/bible/BibleHeader";
import { BIBLE_BOOKS, BIBLE_VERSION_EN, BIBLE_VERSION_ES } from "@/data/bible/books";

export const metadata: Metadata = {
  title: "La Biblia completa · Reina-Valera 1909 | Santuario",
  description:
    "Lee los 66 libros de la Biblia en la Reina-Valera 1909, con la King James Version opcional. Texto literal y verificable con huella SHA-256, y búsqueda por palabra.",
  alternates: { canonical: "/biblia" },
};

const GROUPS = [
  { title: "Ley (Torá)", filter: (c: string) => c === "TORAH" },
  { title: "Antiguo Testamento · Profetas y Escritos", filter: (c: string) => c === "OT_PROPHETS_WRITINGS" },
  { title: "Nuevo Testamento", filter: (c: string) => c === "NT" },
];

export default function BibleIndexPage() {
  return (
    <div className="text-sanct-text">
      <BibleHeader />
      <main className="mx-auto max-w-3xl space-y-14 px-6 pb-24 pt-8">
        <header className="space-y-4">
          <h1 className="scripture text-4xl leading-tight sm:text-5xl">La Biblia completa</h1>
          <p className="leading-relaxed text-sanct-muted">
            Los 66 libros en la {BIBLE_VERSION_ES}, con la {BIBLE_VERSION_EN} opcional en cada capítulo. El texto se copia literal de ediciones de dominio público y cada versículo
            tiene una huella SHA-256 que puedes comprobar en tu navegador.
          </p>
          <p className="rounded-2xl border border-sanct-border px-5 py-4 text-sm leading-relaxed text-sanct-muted">
            <strong className="font-medium text-sanct-text">Transparencia:</strong> aún no incluimos los libros deuterocanónicos, porque no contamos con una edición en español de dominio público que podamos verificar.
            En 18 versículos la edición en español los numera dentro de otro versículo; en esos casos se muestra la King James con un aviso.
          </p>
        </header>

        <BibleSearch />

        {GROUPS.map((g) => (
          <section key={g.title} aria-label={g.title} className="space-y-5">
            <h2 className="scripture text-2xl">{g.title}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {BIBLE_BOOKS.filter((b) => g.filter(b.testamentCategory)).map((b) => (
                <li key={b.osis}>
                  <Link
                    href={`/biblia/${b.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-sanct-border px-5 py-3 transition hover:bg-sanct-surface"
                  >
                    <span>{b.nameEs}</span>
                    <span className="text-xs text-sanct-muted">{b.chapters} cap.</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
