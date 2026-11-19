"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ImageIcon, X } from "lucide-react";
import { getCompanionVerse, orderCompanions, type FaithCompanion } from "@/data/faithCompanions";
import type { CanonicalVerse, TraditionSlug } from "@/types/bible";

interface FaithCompanionsModalProps {
  tradition: TraditionSlug;
  /** Catálogo ya verificado con filterVerifiedVerses. */
  verifiedVerses: readonly CanonicalVerse[];
  showParallelEnglish: boolean;
  /** true mientras otro modal (p. ej. la postal) está encima: Escape no debe cerrar éste. */
  suspendEscape?: boolean;
  onClose: () => void;
  onReadInSanctuary: (verse: CanonicalVerse, companion: FaithCompanion) => void;
  onCreatePostal: (verse: CanonicalVerse) => void;
}

function CompanionButton({
  companion,
  active,
  featured,
  onSelect,
}: {
  companion: FaithCompanion;
  active: boolean;
  featured?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? "border-sanct-accent/70 bg-sanct-surface"
          : featured
            ? "border-sanct-accent/40 hover:bg-sanct-surface"
            : "border-sanct-border hover:bg-sanct-surface"
      }`}
    >
      <span className="block font-medium">{companion.name}</span>
      <span className="block text-xs text-sanct-muted">{companion.intention}</span>
    </button>
  );
}

/** Compañeros de Fe y Oración: reseña real, pasaje verificado y guía de oración personal. */
export function FaithCompanionsModal({
  tradition,
  verifiedVerses,
  showParallelEnglish,
  suspendEscape = false,
  onClose,
  onReadInSanctuary,
  onCreatePostal,
}: FaithCompanionsModalProps) {
  const ordered = useMemo(() => orderCompanions(tradition), [tradition]);
  const isCatholic = tradition === "catholic";
  const catholicFigures = ordered.filter((c) => c.traditionAffinity === "catholic");
  const transversal = ordered.filter((c) => c.traditionAffinity !== "catholic");

  const [selectedId, setSelectedId] = useState<string>(() => ordered[0]?.id ?? "");
  const selected = ordered.find((c) => c.id === selectedId) ?? ordered[0];
  const verse = selected ? getCompanionVerse(selected, verifiedVerses) : null;

  const dialogRef = useRef<HTMLDivElement>(null);
  const escapeBlocked = useRef(suspendEscape);
  useEffect(() => {
    escapeBlocked.current = suspendEscape;
  }, [suspendEscape]);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !escapeBlocked.current) onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  if (!selected) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="companions-title"
        className="relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-sanct-border bg-sanct-bg text-sanct-text outline-none sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-sanct-border px-6 py-5">
          <div className="space-y-1">
            <h2 id="companions-title" className="scripture text-2xl">
              Compañeros de Fe y Oración
            </h2>
            <p className="text-sm text-sanct-muted">
              Cada figura se une a un pasaje real de la Escritura. Santuario Bíblico no pone palabras en boca de nadie.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-sanct-muted hover:bg-sanct-surface">
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="space-y-8 overflow-y-auto px-6 py-6">
          {isCatholic ? (
            <>
              <section aria-label="Tradición católica" className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-sanct-muted">Tradición católica</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {catholicFigures.map((c) => (
                    <CompanionButton key={c.id} companion={c} active={c.id === selected.id} onSelect={() => setSelectedId(c.id)} />
                  ))}
                </div>
              </section>
              <section aria-label="Camino transversal" className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-sanct-muted">Camino transversal · todas las tradiciones</h3>
                {transversal.map((c) => (
                  <CompanionButton key={c.id} companion={c} active={c.id === selected.id} onSelect={() => setSelectedId(c.id)} />
                ))}
              </section>
            </>
          ) : (
            <>
              <section aria-label="Camino transversal" className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-sanct-accent">Camino transversal · para todas las tradiciones</h3>
                {transversal.map((c) => (
                  <CompanionButton featured key={c.id} companion={c} active={c.id === selected.id} onSelect={() => setSelectedId(c.id)} />
                ))}
              </section>
              <details className="group rounded-2xl border border-sanct-border px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm text-sanct-muted">
                  <span>Explorar figuras históricas de la tradición católica</span>
                  <span aria-hidden className="text-sanct-accent transition group-open:rotate-45">+</span>
                </summary>
                <div className="mt-4 space-y-3">
                  <p className="text-xs leading-relaxed text-sanct-muted">
                    Son figuras veneradas en la tradición católica. Se ofrecen como referencia histórica y espiritual, sin ninguna
                    imposición: puedes explorarlas o dejarlas.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {catholicFigures.map((c) => (
                      <CompanionButton key={c.id} companion={c} active={c.id === selected.id} onSelect={() => setSelectedId(c.id)} />
                    ))}
                  </div>
                </div>
              </details>
            </>
          )}

          <article aria-live="polite" className="space-y-6 rounded-3xl border border-sanct-border bg-sanct-surface p-6 sm:p-8">
            <header className="space-y-1">
              <h3 className="scripture text-3xl">{selected.name}</h3>
              <p className="text-sm text-sanct-muted">{selected.title}</p>
              <p className="pt-1 text-sm text-sanct-accent">Intención: {selected.intention}</p>
            </header>

            <p className="leading-relaxed text-sanct-muted">{selected.historicalNote}</p>

            {verse ? (
              <figure className="space-y-4 border-l border-sanct-accent/60 pl-5">
                <blockquote lang="es" className="scripture text-xl leading-[1.7]">
                  {verse.textEs}
                </blockquote>
                {showParallelEnglish && (
                  <blockquote lang="en" className="scripture text-base italic leading-relaxed text-sanct-muted">
                    {verse.textEn}
                  </blockquote>
                )}
                <figcaption className="text-sm text-sanct-accent">
                  {verse.bookNameEs} {verse.chapter}:{verse.verseNumber} · {verse.versionEs}
                  {showParallelEnglish ? ` / ${verse.versionEn}` : ""}
                </figcaption>
              </figure>
            ) : (
              <p role="status" className="rounded-2xl border border-sanct-border px-5 py-4 text-sm text-sanct-muted">
                Este pasaje no pasó la verificación de integridad, por eso no se muestra.
              </p>
            )}

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-sanct-muted">Para tu oración personal</p>
              <p className="leading-relaxed">{selected.prayerPrompt}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!verse}
                onClick={() => verse && onReadInSanctuary(verse, selected)}
                className="inline-flex items-center gap-2 rounded-full bg-sanct-accent px-6 py-3 text-sm font-medium text-sanct-bg transition hover:opacity-90 disabled:opacity-50"
              >
                <BookOpen size={16} aria-hidden /> Leer en el Santuario
              </button>
              <button
                type="button"
                disabled={!verse}
                onClick={() => verse && onCreatePostal(verse)}
                className="inline-flex items-center gap-2 rounded-full border border-sanct-border px-6 py-3 text-sm text-sanct-text transition hover:bg-sanct-bg disabled:opacity-50"
              >
                <ImageIcon size={16} strokeWidth={1.5} aria-hidden /> Crear postal
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
