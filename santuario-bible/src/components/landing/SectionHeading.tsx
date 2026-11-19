import type { ReactNode } from "react";

interface SectionHeadingProps {
  number: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
}

/** Cabecera de sección numerada: "/ 01 — NUESTRO CAMINO" + título serif. */
export function SectionHeading({ number, label, title, intro, id }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-5">
      <p className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-sanct-accent">
        <span aria-hidden className="h-px w-8 bg-sanct-accent/60" />
        {number} — {label}
      </p>
      <h2 id={id} className="scripture text-4xl leading-tight sm:text-5xl">
        {title}
      </h2>
      {intro && <p className="text-lg leading-relaxed text-sanct-muted">{intro}</p>}
    </div>
  );
}
