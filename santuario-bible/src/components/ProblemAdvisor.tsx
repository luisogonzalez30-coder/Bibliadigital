"use client";

import { useCallback, useMemo, useState } from "react";
import { LifeBuoy, Mic, Square } from "lucide-react";
import { EMOTIONS_METADATA } from "@/data/canonicalSeed";
import { getVersesByEmotion } from "@/services/sanctuaryEngine";
import {
  ADVICE,
  ADVICE_DISCLAIMER,
  CRISIS_RESOURCES,
  analyzeProblem,
  type ProblemAnalysis,
} from "@/services/problemAdvisor";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import type { CanonicalVerse, EmotionSlug, TraditionSlug } from "@/types/bible";
import { VerseCard } from "./VerseCard";

const MAX_LENGTH = 1000;

interface ProblemAdvisorProps {
  tradition: TraditionSlug;
  /** Catálogo ya verificado con filterVerifiedVerses. */
  verifiedVerses: readonly CanonicalVerse[];
  showParallelEnglish: boolean;
  bookmarkedIds: readonly string[];
  onToggleBookmark: (verseId: string) => void;
  onCreatePostal: (verse: CanonicalVerse) => void;
}

export function ProblemAdvisor({
  tradition,
  verifiedVerses,
  showParallelEnglish,
  bookmarkedIds,
  onToggleBookmark,
  onCreatePostal,
}: ProblemAdvisorProps) {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<ProblemAnalysis | null>(null);
  const [offset, setOffset] = useState(0);
  const dictation = useSpeechDictation();

  const emotion = analysis?.emotion ?? null;
  const emotionMeta = EMOTIONS_METADATA.find((e) => e.slug === emotion) ?? null;

  const pool = useMemo(
    () => (emotion ? getVersesByEmotion(tradition, emotion, verifiedVerses) : []),
    [tradition, emotion, verifiedVerses],
  );
  const verse = analysis && pool.length > 0 ? (pool[(analysis.seed + offset) % pool.length] ?? null) : null;

  const submit = useCallback(() => {
    if (text.trim().length < 3) return;
    dictation.stop();
    setAnalysis(analyzeProblem(text));
    setOffset(0);
  }, [text, dictation]);

  const pickEmotion = useCallback((slug: EmotionSlug) => {
    setAnalysis((prev) => ({ emotion: slug, crisis: prev?.crisis ?? [], seed: prev?.seed ?? 0 }));
    setOffset(0);
  }, []);

  const toggleMic = useCallback(() => {
    if (dictation.listening) dictation.stop();
    else dictation.start((chunk) => setText((t) => (`${t} ${chunk}`.trim()).slice(0, MAX_LENGTH)));
  }, [dictation]);

  const clear = useCallback(() => {
    dictation.stop();
    setText("");
    setAnalysis(null);
    setOffset(0);
  }, [dictation]);

  return (
    <section aria-labelledby="advisor-title" className="space-y-6">
      <div className="space-y-2">
        <h2 id="advisor-title" className="scripture text-2xl">
          Describe tu problema
        </h2>
        <p className="text-sm text-sanct-muted">
          Cuéntanos qué estás viviendo, escribiendo o hablando. Buscaremos un versículo para ti y una reflexión breve.
        </p>
      </div>

      <div className="space-y-3">
        <label htmlFor="advisor-text" className="sr-only">
          Describe tu problema
        </label>
        <textarea
          id="advisor-text"
          value={text}
          maxLength={MAX_LENGTH}
          rows={4}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe aquí lo que te preocupa…"
          className="w-full resize-y rounded-2xl border border-sanct-border bg-transparent p-4 text-base leading-relaxed text-sanct-text placeholder:text-sanct-muted focus:border-sanct-accent/60 focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={text.trim().length < 3}
            className="rounded-full bg-sanct-accent px-6 py-3 text-sm font-medium text-sanct-bg transition hover:opacity-90 disabled:opacity-50"
          >
            Buscar versículo
          </button>
          {dictation.supported && (
            <button
              type="button"
              onClick={toggleMic}
              aria-pressed={dictation.listening}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm transition ${
                dictation.listening
                  ? "border-sanct-accent text-sanct-accent motion-safe:animate-pulse"
                  : "border-sanct-border text-sanct-text hover:bg-sanct-surface"
              }`}
            >
              {dictation.listening ? <Square size={14} aria-hidden /> : <Mic size={16} strokeWidth={1.5} aria-hidden />}
              {dictation.listening ? "Escuchando… toca para detener" : "Hablar (audio)"}
            </button>
          )}
          {(text || analysis) && (
            <button type="button" onClick={clear} className="text-sm text-sanct-muted underline underline-offset-4">
              Limpiar
            </button>
          )}
        </div>

        {dictation.error && (
          <p role="status" className="text-sm text-sanct-muted">
            {dictation.error}
          </p>
        )}
        <p className="text-xs text-sanct-muted">
          Tu texto se analiza en tu dispositivo: no se guarda ni se envía.
          {dictation.supported
            ? " El dictado por voz lo procesa el servicio de voz de tu navegador."
            : " Tu navegador no permite dictado en la app; puedes usar el micrófono de tu teclado."}
        </p>
      </div>

      {analysis && (
        <div aria-live="polite" className="space-y-6">
          {analysis.crisis.map((kind) => {
            const r = CRISIS_RESOURCES[kind];
            return (
              <div key={kind} role="alert" className="space-y-3 rounded-3xl border border-sanct-accent/60 p-6">
                <p className="flex items-center gap-2 font-medium">
                  <LifeBuoy size={18} strokeWidth={1.5} aria-hidden className="text-sanct-accent" /> {r.title}
                </p>
                <ul className="space-y-1.5 text-sm text-sanct-muted">
                  {r.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="text-xs text-sanct-muted">Verifica el número vigente de tu país.</p>
              </div>
            );
          })}

          {emotion && emotionMeta ? (
            <>
              <p className="text-sm text-sanct-muted">
                Lo que describes se acerca a <span className="text-sanct-accent">{emotionMeta.labelEs}</span>.
              </p>

              {verse ? (
                <div className="space-y-3">
                  <VerseCard
                    verse={verse}
                    showParallelEnglish={showParallelEnglish}
                    bookmarked={bookmarkedIds.includes(verse.id)}
                    onToggleBookmark={onToggleBookmark}
                    onCreatePostal={onCreatePostal}
                  />
                  {pool.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setOffset((o) => o + 1)}
                      className="text-sm text-sanct-muted underline underline-offset-4"
                    >
                      Otro versículo
                    </button>
                  )}
                </div>
              ) : (
                <p className="rounded-2xl border border-sanct-border px-5 py-4 text-sm text-sanct-muted">
                  Aún no hay pasajes cargados para esta combinación de tradición y emoción en el catálogo local.
                </p>
              )}

              <aside className="space-y-3 rounded-3xl border border-sanct-border p-6">
                <p className="text-xs uppercase tracking-widest text-sanct-muted">Reflexión · no es Escritura</p>
                <p className="leading-relaxed">{ADVICE[emotion].reflection}</p>
                <p className="leading-relaxed">
                  <span className="text-sanct-accent">Un paso para hoy: </span>
                  {ADVICE[emotion].step}
                </p>
                <p className="text-xs text-sanct-muted">{ADVICE_DISCLAIMER}</p>
              </aside>
            </>
          ) : (
            <div className="space-y-4 rounded-3xl border border-sanct-border p-6">
              <p className="text-sm text-sanct-muted">
                No logré identificar con claridad lo que describes. Cuéntalo con otras palabras, o elige cómo te sientes:
              </p>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS_METADATA.map((e) => (
                  <button
                    key={e.slug}
                    type="button"
                    onClick={() => pickEmotion(e.slug)}
                    className="rounded-full border border-sanct-border px-4 py-2 text-sm text-sanct-muted transition hover:bg-sanct-surface hover:text-sanct-text"
                  >
                    {e.labelEs}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
