"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { verifyVerseIntegrity } from "@/services/sanctuaryEngine";
import type { CanonicalVerse } from "@/types/bible";

type Result = { kind: "ok" | "bad"; hash: string } | null;

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Demostración en vivo: recalcula la huella SHA-256 del versículo en el navegador de la persona. */
export function VerifyVerse({ verse }: { verse: CanonicalVerse }) {
  const [result, setResult] = useState<Result>(null);
  const [altered, setAltered] = useState(false);
  const [busy, setBusy] = useState(false);

  // Cambio deliberado de una palabra, para mostrar qué pasa si alguien altera el texto.
  const alteredText = verse.textEs.replace("Fíate", "Confía");
  const shownText = altered ? alteredText : verse.textEs;

  const run = async (useAltered: boolean) => {
    setBusy(true);
    setAltered(useAltered);
    try {
      const candidate = useAltered ? { ...verse, textEs: alteredText } : verse;
      const intact = await verifyVerseIntegrity(candidate);
      const hash = await sha256Hex(`${candidate.textEs}|${candidate.textEn}`);
      setResult({ kind: intact ? "ok" : "bad", hash });
    } catch {
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-sanct-border bg-sanct-surface p-6 sm:p-8">
      <figure className="space-y-3">
        <blockquote lang="es" className="scripture text-2xl leading-relaxed">
          “{shownText}”
        </blockquote>
        <figcaption className="text-sm text-sanct-accent">
          {verse.bookNameEs} {verse.chapter}:{verse.verseNumber} · {verse.versionEs}
        </figcaption>
      </figure>

      <div className="space-y-1 text-xs text-sanct-muted">
        <p>Huella guardada (SHA-256):</p>
        <p className="break-all font-mono text-sanct-text">{verse.sha256Hash}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(false)}
          className="rounded-full bg-sanct-accent px-6 py-3 text-sm font-medium text-sanct-bg transition hover:opacity-90 disabled:opacity-50"
        >
          Verificar ahora
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(true)}
          className="rounded-full border border-sanct-border px-6 py-3 text-sm text-sanct-text transition hover:bg-sanct-bg disabled:opacity-50"
        >
          Cambiar una palabra y verificar
        </button>
      </div>

      <div aria-live="polite" className="min-h-[4.5rem] text-sm">
        {result?.kind === "ok" && (
          <div className="space-y-1">
            <p className="flex items-center gap-2 font-medium text-sanct-text">
              <CheckCircle2 size={18} aria-hidden className="text-sanct-accent" /> Íntegro: la huella recalculada coincide.
            </p>
            <p className="break-all font-mono text-xs text-sanct-muted">{result.hash}</p>
          </div>
        )}
        {result?.kind === "bad" && (
          <div className="space-y-1">
            <p className="flex items-center gap-2 font-medium text-sanct-text">
              <ShieldAlert size={18} aria-hidden className="text-sanct-accent" /> Alterado: no coincide. Santuario descartaría este texto.
            </p>
            <p className="break-all font-mono text-xs text-sanct-muted">{result.hash}</p>
          </div>
        )}
        {!result && <p className="text-sanct-muted">Pulsa un botón: el cálculo ocurre en tu navegador, sin enviar nada.</p>}
      </div>
    </div>
  );
}
