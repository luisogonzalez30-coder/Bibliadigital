"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, X } from "lucide-react";
import {
  OFFERING_ANCHORS,
  DEFAULT_OFFERING_AMOUNT,
  MIN_OFFERING_AMOUNT,
  buildOfferingUrl,
  formatOfferingAmount,
  getOfferingLabel,
  isOfferingConfigured,
  offeringUrlCarriesAmount,
  loadOfferingPrefs,
  parseOfferingAmount,
  saveOfferingPrefs,
} from "@/services/offeringConfig";

interface VoluntaryOfferingModalProps {
  onClose: () => void;
}

interface Selection {
  /** Ancla elegida o "custom". */
  chosen: number | "custom";
  custom: string;
}

/** Recuerda el último monto: si fue un ancla se marca; si no, se rellena "otro monto". */
function initialSelection(): Selection {
  const saved = loadOfferingPrefs().amount;
  if (saved === undefined) return { chosen: DEFAULT_OFFERING_AMOUNT, custom: "" };
  if (OFFERING_ANCHORS.includes(saved)) return { chosen: saved, custom: "" };
  return { chosen: "custom", custom: String(saved) };
}

/** Aporte voluntario: cálido, sin culpa y sin bloquear nada. Se monta sólo cuando está abierto. */
export function VoluntaryOfferingModal({ onClose }: VoluntaryOfferingModalProps) {
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const dialogRef = useRef<HTMLDivElement>(null);
  const configured = isOfferingConfigured();
  // Enlace de monto libre: el monto se escribe al pagar; los de la app son sólo una referencia.
  const freeAmount = configured && !offeringUrlCarriesAmount();

  const amount = selection.chosen === "custom" ? parseOfferingAmount(selection.custom) : selection.chosen;
  const url = amount !== null ? buildOfferingUrl(amount) : null;

  useEffect(() => {
    dialogRef.current?.focus();
    // En captura y deteniendo la propagación: Escape cierra sólo este modal (p. ej. si se abrió desde la postal).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const chooseAnchor = (value: number) => {
    setSelection({ chosen: value, custom: "" });
    saveOfferingPrefs({ amount: value });
  };

  const changeCustom = (value: string) => {
    setSelection({ chosen: "custom", custom: value });
    const parsed = parseOfferingAmount(value);
    if (parsed !== null) saveOfferingPrefs({ amount: parsed });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offering-title"
        className="relative w-full max-w-md space-y-6 rounded-3xl border border-sanct-border bg-sanct-bg p-8 text-sanct-text outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-2 text-sanct-muted hover:bg-sanct-surface"
        >
          <X size={18} aria-hidden />
        </button>

        <div className="space-y-4 text-center">
          <Heart size={28} strokeWidth={1.25} aria-hidden className="mx-auto text-sanct-accent" />
          <h2 id="offering-title" className="scripture text-2xl">
            Aporte voluntario
          </h2>
          <p className="leading-relaxed text-sanct-muted">
            La lectura diaria, la Brújula del Alma y las postales de Santuario Bíblico son y seguirán siendo libres para todos.
          </p>
          <p className="leading-relaxed text-sanct-muted">
            Si esta compañía te hace bien, tu aporte voluntario ayuda a mantener la plataforma viva y a sumar más pasajes
            verificados.
          </p>
        </div>

        <div role="group" aria-label="Monto del aporte" className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {OFFERING_ANCHORS.map((value) => {
              const active = selection.chosen === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseAnchor(value)}
                  className={`rounded-2xl border px-2 py-3 text-sm tabular-nums transition ${
                    active
                      ? "border-sanct-accent/70 bg-sanct-surface text-sanct-accent"
                      : "border-sanct-border text-sanct-muted hover:bg-sanct-surface hover:text-sanct-text"
                  }`}
                >
                  {formatOfferingAmount(value)}
                </button>
              );
            })}
          </div>
          {freeAmount && (
            <p className="text-center text-xs text-sanct-muted">Montos de referencia: elegirás o escribirás el monto al pagar.</p>
          )}
          {!freeAmount && (
            <label className="block">
              <span className="sr-only">Otro monto en pesos chilenos</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={selection.custom}
                onFocus={() => setSelection((s) => ({ ...s, chosen: "custom" }))}
                onChange={(e) => changeCustom(e.target.value)}
                placeholder="Otro monto (CLP)"
                aria-invalid={selection.chosen === "custom" && selection.custom !== "" && amount === null}
                className="w-full rounded-2xl border border-sanct-border bg-transparent px-4 py-3 text-center text-sm tabular-nums text-sanct-text placeholder:text-sanct-muted focus:border-sanct-accent/60 focus:outline-none"
              />
            </label>
          )}
          {!freeAmount && selection.chosen === "custom" && selection.custom !== "" && amount === null && (
            <p role="status" className="text-center text-xs text-sanct-muted">
              Escribe un monto entero desde {formatOfferingAmount(MIN_OFFERING_AMOUNT)}.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {configured && url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => amount !== null && saveOfferingPrefs({ amount })}
              className="block rounded-full bg-sanct-accent px-6 py-3.5 text-center text-sm font-medium text-sanct-bg transition hover:opacity-90"
            >
              {freeAmount ? getOfferingLabel() : `${getOfferingLabel()} · ${amount !== null ? formatOfferingAmount(amount) : ""}`}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full rounded-full bg-sanct-accent px-6 py-3.5 text-sm font-medium text-sanct-bg opacity-50"
            >
              {getOfferingLabel()}
              {amount !== null ? ` · ${formatOfferingAmount(amount)}` : ""}
            </button>
          )}

          {!configured && (
            <p role="status" className="text-center text-sm text-sanct-muted">
              El aporte aún se está preparando. Pronto podrás hacerlo desde aquí; gracias por tu intención.
            </p>
          )}
          <p className="text-center text-xs text-sanct-muted">
            Sin presión: cualquier monto, o ninguno, es bienvenido. Se abre en una pestaña nueva.
          </p>
        </div>
      </div>
    </div>
  );
}
