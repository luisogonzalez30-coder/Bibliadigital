import type { CanonicalVerse } from "@/types/bible";

interface VerseCardProps {
  verse: CanonicalVerse;
  showParallelEnglish: boolean;
}

export function VerseCard({ verse, showParallelEnglish }: VerseCardProps) {
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
      <footer className="text-sm text-sanct-accent">
        {verse.bookNameEs} {verse.chapter}:{verse.verseNumber} · {verse.versionEs}
        {showParallelEnglish ? ` / ${verse.versionEn}` : ""}
      </footer>
    </article>
  );
}
