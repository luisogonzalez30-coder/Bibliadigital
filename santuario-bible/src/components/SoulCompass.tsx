"use client";

import { useState } from "react";
import { Lamp, CloudRain, Moon, Sprout, Wind, X, type LucideIcon } from "lucide-react";
import { EMOTIONS_METADATA } from "@/data/canonicalSeed";
import { getVersesByEmotion } from "@/services/sanctuaryEngine";
import type { CanonicalVerse, EmotionSlug, TraditionSlug } from "@/types/bible";
import { VerseCard } from "./VerseCard";

const ICONS: Record<string, LucideIcon> = { Wind, Sprout, CloudRain, Moon, Lamp };

interface SoulCompassProps {
  tradition: TraditionSlug;
  /** Catálogo ya verificado con filterVerifiedVerses. */
  verifiedVerses: readonly CanonicalVerse[];
  showParallelEnglish: boolean;
  bookmarkedIds: readonly string[];
  onToggleBookmark: (verseId: string) => void;
  onCreatePostal: (verse: CanonicalVerse) => void;
}

export function SoulCompass({
  tradition,
  verifiedVerses,
  showParallelEnglish,
  bookmarkedIds,
  onToggleBookmark,
  onCreatePostal,
}: SoulCompassProps) {
  const [emotion, setEmotion] = useState<EmotionSlug | null>(null);
  const selected = EMOTIONS_METADATA.find((e) => e.slug === emotion) ?? null;
  const results = emotion ? getVersesByEmotion(tradition, emotion, verifiedVerses) : [];

  return (
    <section aria-labelledby="compass-title" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 id="compass-title" className="text-xs uppercase tracking-widest text-sanct-muted">
          Brújula del Alma · ¿Cómo estás hoy?
        </h2>
        {emotion && (
          <button
            type="button"
            onClick={() => setEmotion(null)}
            className="inline-flex items-center gap-1 text-xs text-sanct-muted hover:text-sanct-text"
          >
            <X size={14} aria-hidden /> Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {EMOTIONS_METADATA.map((e) => {
          const Icon = ICONS[e.icon] ?? Lamp;
          const active = e.slug === emotion;
          return (
            <button
              key={e.slug}
              type="button"
              aria-pressed={active}
              onClick={() => setEmotion(active ? null : e.slug)}
              className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-5 text-sm transition ${
                active
                  ? "border-sanct-accent/60 bg-sanct-surface text-sanct-accent"
                  : "border-sanct-border bg-transparent text-sanct-muted hover:bg-sanct-surface hover:text-sanct-text"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} aria-hidden />
              {e.labelEs}
            </button>
          );
        })}
      </div>

      {selected && (
        <div aria-live="polite" className="space-y-6">
          <p className="text-center text-sm italic text-sanct-muted">{selected.subtitleEs}</p>
          {results.length > 0 ? (
            results.map((v) => (
              <VerseCard
                key={v.id}
                verse={v}
                showParallelEnglish={showParallelEnglish}
                bookmarked={bookmarkedIds.includes(v.id)}
                onToggleBookmark={onToggleBookmark}
                onCreatePostal={onCreatePostal}
              />
            ))
          ) : (
            <p className="rounded-2xl border border-sanct-border px-5 py-4 text-sm text-sanct-muted">
              Aún no hay pasajes cargados para esta combinación de tradición y emoción en el catálogo local.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
