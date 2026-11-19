"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { TRADITIONS_METADATA } from "@/data/canonicalSeed";
import { FAITH_CHOICES, FAITH_GROUPS, NEED_CHOICES, faithDisplayLabel, initialFaithId } from "@/data/onboarding";
import { getWelcomeVerse, sanitizeDisplayName } from "@/services/sanctuaryEngine";
import type { CanonicalVerse, EmotionSlug, TraditionSlug } from "@/types/bible";

export interface OnboardingResult {
  tradition: TraditionSlug;
  faithId: string;
  displayName: string;
  focusEmotion: EmotionSlug | null;
}

interface OnboardingProps {
  /** Valores ya guardados (para preseleccionar si la persona vuelve a ver la bienvenida). */
  initial: { tradition: TraditionSlug; faithId: string | undefined; displayName: string; focusEmotion: EmotionSlug | null };
  /** Catálogo verificado (null mientras se verifica). */
  verified: readonly CanonicalVerse[] | null;
  today: string | null;
  onFinish: (result: OnboardingResult) => void;
}

type Step = 0 | 1 | 2 | 3;

const TITLES = ["¿Con qué fe quieres leer?", "¿Cómo te llamas?", "¿Qué te trae hoy?", ""] as const;

/** Bienvenida de primera vez: fe → nombre → necesidad → primer versículo ya filtrado. Todo queda en el dispositivo. */
export function Onboarding({ initial, verified, today, onFinish }: OnboardingProps) {
  const [step, setStep] = useState<Step>(0);
  const [faithId, setFaithId] = useState<string | null>(() => initialFaithId(initial.faithId, initial.tradition));
  const [name, setName] = useState(initial.displayName);
  const [needId, setNeedId] = useState<string | null>(() => (initial.focusEmotion ? (NEED_CHOICES.find((n) => n.emotion === initial.focusEmotion)?.id ?? null) : null));
  const titleRef = useRef<HTMLHeadingElement>(null);

  const faith = FAITH_CHOICES.find((c) => c.id === faithId) ?? null;
  const need = NEED_CHOICES.find((n) => n.id === needId) ?? null;
  const tradition: TraditionSlug = faith?.tradition ?? "universal";
  const cleanName = sanitizeDisplayName(name);

  const needEmotion = need?.emotion ?? null;
  // Cálculo barato y determinista: lo memoiza el compilador de React.
  const verse = step === 3 && verified && today ? getWelcomeVerse(tradition, needEmotion, today, verified) : null;
  const traditionLabel = faithDisplayLabel(faith?.id, TRADITIONS_METADATA.find((t) => t.slug === tradition)?.labelEs ?? "Universal");

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [step]);

  const next = () => setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  const back = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  const finish = () => onFinish({ tradition, faithId: faith?.id ?? "buscando", displayName: cleanName, focusEmotion: need?.emotion ?? null });

  return (
    <section aria-label="Bienvenida" className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button type="button" onClick={back} className="inline-flex items-center gap-2 rounded-full py-2 pr-3 text-sm text-sanct-muted transition hover:text-sanct-text">
            <ArrowLeft size={16} aria-hidden /> Atrás
          </button>
        ) : (
          <span className="scripture text-xl">Santuario Bíblico</span>
        )}
        {step < 3 && (
          <p className="text-xs uppercase tracking-widest text-sanct-muted" aria-live="polite">
            Paso {step + 1} de 3
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-8 py-10">
        {step === 0 && (
          <>
            <header className="space-y-3">
              <h1 ref={titleRef} tabIndex={-1} className="scripture text-4xl leading-tight outline-none">{TITLES[0]}</h1>
              <p className="leading-relaxed text-sanct-muted">Así te mostramos desde el primer momento los textos de tu tradición. Puedes cambiarla cuando quieras en Ajustes.</p>
            </header>
            <div className="space-y-7" role="radiogroup" aria-label="Tu fe">
              {FAITH_GROUPS.map((g) => (
                <fieldset key={g.id} className="space-y-3">
                  <legend className="mb-1 text-xs uppercase tracking-widest text-sanct-muted">{g.title}</legend>
                  {FAITH_CHOICES.filter((c) => c.group === g.id).map((c) => {
                    const active = c.id === faithId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setFaithId(c.id)}
                        className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-5 py-4 text-left transition ${active ? "border-sanct-accent/70 bg-sanct-surface" : "border-sanct-border hover:bg-sanct-surface"}`}
                      >
                        <span>
                          <span className="block font-medium">{c.label}</span>
                          <span className="block text-sm text-sanct-muted">{c.hint}</span>
                        </span>
                        {active && <Check size={18} aria-hidden className="mt-0.5 shrink-0 text-sanct-accent" />}
                      </button>
                    );
                  })}
                </fieldset>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <header className="space-y-3">
              <h1 ref={titleRef} tabIndex={-1} className="scripture text-4xl leading-tight outline-none">{TITLES[1]}</h1>
              <p className="leading-relaxed text-sanct-muted">Para saludarte por tu nombre. Es opcional y se guarda solo en tu dispositivo.</p>
            </header>
            <label className="block space-y-2">
              <span className="sr-only">Tu nombre</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                autoComplete="given-name"
                placeholder="Tu nombre"
                className="w-full rounded-2xl border border-sanct-border bg-sanct-surface px-5 py-4 text-lg placeholder:text-sanct-muted focus:border-sanct-accent/70 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") next();
                }}
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <header className="space-y-3">
              <h1 ref={titleRef} tabIndex={-1} className="scripture text-4xl leading-tight outline-none">{TITLES[2]}</h1>
              <p className="leading-relaxed text-sanct-muted">Elige lo que más se parezca a hoy. Si es algo más específico, después puedes contarlo en «Describe tu problema».</p>
            </header>
            <fieldset className="flex flex-wrap gap-3">
              <legend className="sr-only">Lo que te trae hoy</legend>
              {NEED_CHOICES.map((n) => {
                const active = n.id === needId;
                return (
                  <button
                    key={n.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setNeedId(n.id)}
                    className={`rounded-full border px-6 py-3 text-sm transition ${active ? "border-sanct-accent/70 bg-sanct-surface" : "border-sanct-border hover:bg-sanct-surface"}`}
                  >
                    {n.label}
                  </button>
                );
              })}
            </fieldset>
          </>
        )}

        {step === 3 && (
          <>
            <header className="space-y-3">
              <h1 ref={titleRef} tabIndex={-1} className="scripture text-4xl leading-tight outline-none">
                {cleanName ? `${cleanName}, este es tu primer versículo` : "Este es tu primer versículo"}
              </h1>
              <p className="text-sm text-sanct-muted">
                Tradición: <span className="text-sanct-text">{traditionLabel}</span> · Puedes cambiarla en Ajustes.
              </p>
            </header>
            {faith?.note && (
              <p role="note" className="rounded-2xl border border-sanct-border px-4 py-3 text-sm leading-relaxed text-sanct-muted">
                {faith.note}
              </p>
            )}
            <figure className="space-y-4 rounded-3xl border border-sanct-border bg-sanct-surface p-7">
              {verse ? (
                <>
                  <blockquote lang="es" className="scripture text-balance text-2xl leading-[1.6]">{verse.textEs}</blockquote>
                  <figcaption className="text-sm text-sanct-accent">
                    {verse.bookNameEs} {verse.chapter}:{verse.verseNumber} · {verse.versionEs}
                  </figcaption>
                </>
              ) : (
                <p className="text-sm text-sanct-muted">Verificando textos…</p>
              )}
            </figure>
          </>
        )}
      </div>

      <div className="sticky bottom-0 space-y-3 bg-sanct-bg pb-2 pt-3">
        {step === 0 && (
          <button type="button" disabled={!faith} onClick={next} className="w-full rounded-full bg-sanct-accent px-6 py-4 text-sm font-medium text-sanct-bg transition hover:opacity-90 disabled:opacity-40">
            Continuar
          </button>
        )}
        {step === 1 && (
          <>
            <button type="button" onClick={next} className="w-full rounded-full bg-sanct-accent px-6 py-4 text-sm font-medium text-sanct-bg transition hover:opacity-90">
              Continuar
            </button>
            <button type="button" onClick={() => { setName(""); next(); }} className="w-full py-2 text-sm text-sanct-muted transition hover:text-sanct-text">
              Omitir
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <button type="button" disabled={!need} onClick={next} className="w-full rounded-full bg-sanct-accent px-6 py-4 text-sm font-medium text-sanct-bg transition hover:opacity-90 disabled:opacity-40">
              Continuar
            </button>
            <button type="button" onClick={() => { setNeedId(null); next(); }} className="w-full py-2 text-sm text-sanct-muted transition hover:text-sanct-text">
              Omitir
            </button>
          </>
        )}
        {step === 3 && (
          <button type="button" disabled={!verse} onClick={finish} className="w-full rounded-full bg-sanct-accent px-6 py-4 text-sm font-medium text-sanct-bg transition hover:opacity-90 disabled:opacity-40">
            Entrar a mi Santuario
          </button>
        )}
        <p className="text-center text-xs text-sanct-muted">Tu fe y tu nombre se guardan solo en este dispositivo.</p>
      </div>
    </section>
  );
}
