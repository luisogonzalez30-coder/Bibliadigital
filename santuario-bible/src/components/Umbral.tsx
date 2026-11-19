import { Flame, ImageIcon, BookOpen, HandHeart } from "lucide-react";
import type { CanonicalVerse } from "@/types/bible";

interface UmbralProps {
  /** Saludo y fecha ya calculados en cliente (null mientras monta, para evitar hydration mismatch). */
  greeting: string | null;
  dateLabel: string | null;
  activeStreak: number;
  readToday: boolean;
  /** Versículo verificado del día; null mientras se verifica el catálogo. */
  verse: CanonicalVerse | null;
  showParallelEnglish: boolean;
  onStories: () => void;
  onEnter: () => void;
  onPostal: (verse: CanonicalVerse) => void;
  onCompanions: () => void;
}

/** Vista de altar: halo de luz, saludo, racha y un único versículo del día. */
export function Umbral({
  greeting,
  dateLabel,
  activeStreak,
  readToday,
  verse,
  showParallelEnglish,
  onStories,
  onEnter,
  onPostal,
  onCompanions,
}: UmbralProps) {
  return (
    <section aria-label="El Umbral Sagrado" className="relative flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-4 text-center">
      <div className="halo" aria-hidden />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10">
        <header className="fade-in fade-in-1 space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-sanct-muted">{greeting ?? " "}</p>
          <p className="text-sm text-sanct-muted">{dateLabel ?? " "}</p>
        </header>

        <p
          className="fade-in fade-in-1 inline-flex items-center gap-2 rounded-full border border-sanct-border px-4 py-1.5 text-sm text-sanct-muted"
          aria-label={`Racha de Luz: ${activeStreak} ${activeStreak === 1 ? "día" : "días"}`}
        >
          <Flame size={16} strokeWidth={1.5} aria-hidden className="text-sanct-accent" />
          <span className="tabular-nums text-sanct-text">{activeStreak}</span>
          <span>Racha de Luz · {readToday ? "hoy leído" : "hoy pendiente"}</span>
        </p>

        <figure className="fade-in fade-in-2 min-h-[12rem] space-y-6">
          {verse ? (
            <>
              <blockquote
                lang="es"
                className="scripture glow-gold text-balance text-3xl leading-[1.55] sm:text-4xl sm:leading-[1.5]"
              >
                {verse.textEs}
              </blockquote>
              {showParallelEnglish && (
                <blockquote lang="en" className="scripture mx-auto max-w-xl text-balance text-lg italic leading-relaxed text-sanct-muted">
                  {verse.textEn}
                </blockquote>
              )}
              <figcaption className="text-sm tracking-wide text-sanct-accent">
                {verse.bookNameEs} {verse.chapter}:{verse.verseNumber} · {verse.versionEs}
                {showParallelEnglish ? ` / ${verse.versionEn}` : ""}
              </figcaption>
            </>
          ) : (
            <p className="text-sm text-sanct-muted">Verificando textos…</p>
          )}
        </figure>

        <div className="fade-in fade-in-3 flex w-full max-w-sm flex-col items-stretch gap-3">
          <button
            type="button"
            onClick={onStories}
            disabled={!verse}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sanct-accent px-6 py-3.5 text-sm font-medium text-sanct-bg transition hover:opacity-90 disabled:opacity-50"
          >
            <BookOpen size={16} aria-hidden /> Lectura Diaria (Stories)
          </button>
          <button
            type="button"
            onClick={onEnter}
            className="rounded-full border border-sanct-accent/50 px-6 py-3.5 text-sm text-sanct-text transition hover:bg-sanct-surface"
          >
            Entrar al Santuario
          </button>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => verse && onPostal(verse)}
              disabled={!verse}
              className="inline-flex items-center justify-center gap-2 py-2 text-sm text-sanct-muted transition hover:text-sanct-text disabled:opacity-50"
            >
              <ImageIcon size={16} strokeWidth={1.5} aria-hidden /> Crear postal
            </button>
            <button
              type="button"
              onClick={onCompanions}
              className="inline-flex items-center justify-center gap-2 py-2 text-sm text-sanct-muted transition hover:text-sanct-text"
            >
              <HandHeart size={16} strokeWidth={1.5} aria-hidden /> Compañeros de Fe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
