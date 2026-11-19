"use client";

import Link from "next/link";
import { useState } from "react";
import { ImageIcon, ShieldCheck, ShieldAlert } from "lucide-react";
import { PostalStudioModal } from "@/components/PostalStudioModal";
import type { ReaderVerse } from "@/lib/bible";
import type { CanonicalVerse, TestamentCategory } from "@/types/bible";

interface NavLink {
  href: string;
  label: string;
}

interface ChapterReaderProps {
  osis: string;
  nameEs: string;
  nameEn: string;
  category: TestamentCategory;
  chapter: number;
  verses: readonly ReaderVerse[];
  versionEs: string;
  versionEn: string;
  prev: NavLink | null;
  next: NavLink | null;
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Lector de un capítulo: texto literal, espejo en inglés, verificación SHA-256 y postal por versículo. */
export function ChapterReader({ osis, nameEs, nameEn, category, chapter, verses, versionEs, versionEn, prev, next }: ChapterReaderProps) {
  const [showEn, setShowEn] = useState(false);
  const [check, setCheck] = useState<{ ok: number; bad: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [postalVerse, setPostalVerse] = useState<CanonicalVerse | null>(null);

  const verify = async () => {
    setBusy(true);
    try {
      let ok = 0;
      let bad = 0;
      for (const v of verses) {
        if ((await sha256Hex(`${v.es}|${v.en}`)) === v.h) ok++;
        else bad++;
      }
      setCheck({ ok, bad });
    } catch {
      setCheck(null);
    } finally {
      setBusy(false);
    }
  };

  const toCanonical = (v: ReaderVerse): CanonicalVerse => ({
    id: `${osis}.${chapter}.${v.n}`,
    bookOsis: osis,
    bookNameEs: nameEs,
    bookNameEn: nameEn,
    chapter,
    verseNumber: String(v.n),
    testamentCategory: category,
    textEs: v.es,
    textEn: v.en,
    versionEs,
    versionEn,
    allowedTraditions: ["catholic", "protestant", "torah", "universal"],
    emotionTags: [],
    sha256Hash: v.h,
  });

  return (
    <section aria-label={`${nameEs} ${chapter}`} className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          aria-pressed={showEn}
          onClick={() => setShowEn((s) => !s)}
          className={`rounded-full border px-4 py-2 transition ${showEn ? "border-sanct-accent/70 bg-sanct-surface text-sanct-accent" : "border-sanct-border text-sanct-muted hover:bg-sanct-surface"}`}
        >
          Mostrar en inglés ({versionEn})
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void verify()}
          className="inline-flex items-center gap-2 rounded-full border border-sanct-border px-4 py-2 text-sanct-muted transition hover:bg-sanct-surface disabled:opacity-50"
        >
          <ShieldCheck size={16} strokeWidth={1.5} aria-hidden /> Verificar capítulo
        </button>
      </div>

      <div aria-live="polite" className="min-h-6 text-sm">
        {check && check.bad === 0 && (
          <p className="flex items-center gap-2 text-sanct-text">
            <ShieldCheck size={16} aria-hidden className="text-sanct-accent" /> Íntegro: {check.ok} de {check.ok} versículos coinciden con su huella SHA-256.
          </p>
        )}
        {check && check.bad > 0 && (
          <p className="flex items-center gap-2 text-sanct-text">
            <ShieldAlert size={16} aria-hidden className="text-sanct-accent" /> {check.bad} versículo(s) no coinciden con su huella.
          </p>
        )}
      </div>

      <div className="space-y-5">
        {verses.map((v) => (
          <div key={v.n} id={`v${v.n}`} className="group scroll-mt-24 space-y-1.5">
            <p className="scripture text-xl leading-[1.8]">
              <a href={`#v${v.n}`} className="mr-2 align-super text-xs text-sanct-accent no-underline">
                {v.n}
              </a>
              {v.es ? (
                <span lang="es">{v.es}</span>
              ) : (
                <span lang="en" className="italic text-sanct-muted">
                  {v.en}
                </span>
              )}
              {v.es && (
                <button
                  type="button"
                  aria-label={`Crear postal del versículo ${v.n}`}
                  onClick={() => setPostalVerse(toCanonical(v))}
                  className="ml-2 inline-flex align-middle text-sanct-muted opacity-60 transition hover:text-sanct-accent hover:opacity-100 focus:opacity-100"
                >
                  <ImageIcon size={14} strokeWidth={1.5} aria-hidden />
                </button>
              )}
            </p>
            {!v.es && (
              <p className="text-xs text-sanct-muted">En la {versionEs} este pasaje está numerado dentro de otro versículo; aquí se muestra la {versionEn}.</p>
            )}
            {v.es && showEn && (
              <p lang="en" className="scripture border-l border-sanct-accent/50 pl-4 text-base italic leading-relaxed text-sanct-muted">
                {v.en}
              </p>
            )}
          </div>
        ))}
      </div>

      <nav aria-label="Capítulos" className="flex items-center justify-between gap-4 border-t border-sanct-border pt-6 text-sm">
        {prev ? (
          <Link href={prev.href} className="text-sanct-muted transition hover:text-sanct-text">
            ← {prev.label}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.href} className="text-sanct-muted transition hover:text-sanct-text">
            {next.label} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <PostalStudioModal verse={postalVerse} showParallelEnglish={showEn} onClose={() => setPostalVerse(null)} />
    </section>
  );
}
