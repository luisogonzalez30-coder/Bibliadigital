import { Bookmark, ImageIcon } from "lucide-react";
import type { CanonicalVerse } from "@/types/bible";

interface VerseCardProps {
  verse: CanonicalVerse;
  showParallelEnglish: boolean;
  bookmarked: boolean;
  onToggleBookmark: (verseId: string) => void;
  onCreatePostal: (verse: CanonicalVerse) => void;
}

export function VerseCard({ verse, showParallelEnglish, bookmarked, onToggleBookmark, onCreatePostal }: VerseCardProps) {
  return (
    <article className="space-y-4 rounded-2xl bg-sanct-surface p-6">
      <p lang="es" className="scripture text-xl leading-relaxed">
        {verse.textEs}
      </p>
      {showParallelEnglish && (
        <p
          lang="en"
          className="scripture border-l-2 border-sanct-accent pl-4 text-base italic leading-relaxed text-sanct-muted"
        >
          {verse.textEn}
        </p>
      )}
      <footer className="flex items-center justify-between gap-4 text-sm text-sanct-accent">
        <span>
          {verse.bookNameEs} {verse.chapter}:{verse.verseNumber} · {verse.versionEs}
          {showParallelEnglish ? ` / ${verse.versionEn}` : ""}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCreatePostal(verse)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs hover:bg-sanct-bg"
          >
            <ImageIcon size={16} aria-hidden /> Crear postal
          </button>
          <button
            type="button"
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Quitar de favoritos" : "Guardar en favoritos"}
            onClick={() => onToggleBookmark(verse.id)}
            className="rounded-full p-1.5 hover:bg-sanct-bg"
          >
            <Bookmark size={18} aria-hidden fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </span>
      </footer>
    </article>
  );
}
