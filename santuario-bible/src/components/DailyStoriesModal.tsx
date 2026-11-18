"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, X } from "lucide-react";
import { getDailyStoriesVerses } from "@/services/sanctuaryEngine";
import type { CanonicalVerse, TraditionSlug } from "@/types/bible";

interface DailyStoriesModalProps {
  tradition: TraditionSlug;
  /** Fecha local YYYY-MM-DD que siembra la selección diaria. */
  todayIso: string;
  /** Catálogo ya verificado con filterVerifiedVerses. */
  verifiedVerses: readonly CanonicalVerse[];
  showParallelEnglish: boolean;
  onClose: () => void;
  /** Registra la lectura diaria (racha) y cierra. */
  onComplete: () => void;
}

export function DailyStoriesModal({
  tradition,
  todayIso,
  verifiedVerses,
  showParallelEnglish,
  onClose,
  onComplete,
}: DailyStoriesModalProps) {
  const slides = useMemo(
    () => getDailyStoriesVerses(tradition, todayIso, verifiedVerses),
    [tradition, todayIso, verifiedVerses],
  );
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const isLast = index === total - 1;
  const current = slides[index];

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, Math.max(total - 1, 0))), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lectura diaria"
      className="dark fixed inset-0 z-50 flex flex-col bg-sanct-bg px-6 py-6 text-sanct-text"
    >
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <div className="flex gap-1.5" aria-hidden>
          {slides.map((v, i) => (
            <div key={v.id} className="h-1 flex-1 rounded-full bg-sanct-muted/30">
              <div
                className={`h-full rounded-full bg-sanct-accent transition-all ${i <= index ? "w-full" : "w-0"}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-sanct-muted">
          <span aria-live="polite">{total > 0 ? `${index + 1} / ${total}` : "0 / 0"}</span>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 hover:bg-sanct-surface">
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-6 overflow-y-auto py-8">
          {current ? (
            <>
              <p lang="es" className="scripture text-2xl leading-relaxed sm:text-3xl">
                {current.textEs}
              </p>
              {showParallelEnglish && (
                <p lang="en" className="scripture border-l-2 border-sanct-accent pl-4 text-lg italic leading-relaxed text-sanct-muted">
                  {current.textEn}
                </p>
              )}
              <p className="text-sm text-sanct-accent">
                {current.bookNameEs} {current.chapter}:{current.verseNumber} · {current.versionEs}
                {showParallelEnglish ? ` / ${current.versionEn}` : ""}
              </p>
            </>
          ) : (
            <p className="text-center text-sanct-muted">No hay láminas verificadas para esta tradición.</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="inline-flex items-center gap-1 rounded-xl bg-sanct-surface px-4 py-2.5 text-sm disabled:opacity-40"
          >
            <ChevronLeft size={16} aria-hidden /> Anterior
          </button>
          {isLast && total > 0 ? (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-2 rounded-xl bg-sanct-accent px-5 py-2.5 text-sm font-medium text-sanct-bg"
            >
              <Flame size={16} aria-hidden /> Completar lectura · Iluminar racha
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              disabled={total === 0}
              className="inline-flex items-center gap-1 rounded-xl bg-sanct-surface px-4 py-2.5 text-sm disabled:opacity-40"
            >
              Siguiente <ChevronRight size={16} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
