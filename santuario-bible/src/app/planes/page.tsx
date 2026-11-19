import type { Metadata } from "next";
import Link from "next/link";
import { BibleHeader } from "@/components/bible/BibleHeader";
import { READING_PLANS } from "@/data/readingPlans";

export const metadata: Metadata = {
  title: "Planes de lectura bíblica de 7 días | Santuario",
  description: "Planes de lectura de 7 días para la ansiedad, el cansancio y la gratitud: un capítulo al día con una pregunta para reflexionar.",
  alternates: { canonical: "/planes" },
};

export default function PlansIndexPage() {
  return (
    <div className="text-sanct-text">
      <BibleHeader />
      <main className="mx-auto max-w-3xl space-y-10 px-6 pb-24 pt-8">
        <header className="space-y-4">
          <h1 className="scripture text-4xl leading-tight sm:text-5xl">Planes de lectura</h1>
          <p className="leading-relaxed text-sanct-muted">
            Una semana, un capítulo al día. Cada plan usa la Biblia completa de Santuario y una pregunta breve para reflexionar. Tu progreso se guarda solo en tu dispositivo.
          </p>
        </header>
        <ul className="space-y-4">
          {READING_PLANS.map((p) => (
            <li key={p.id}>
              <Link href={`/planes/${p.id}`} className="block space-y-2 rounded-3xl border border-sanct-border p-7 transition hover:bg-sanct-surface">
                <h2 className="scripture text-2xl">{p.title}</h2>
                <p className="text-sm leading-relaxed text-sanct-muted">{p.intro}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
