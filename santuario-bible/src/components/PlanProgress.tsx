"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import { Check } from "lucide-react";

export interface PlanDayView {
  day: number;
  href: string;
  reference: string;
  focus: string;
  reflection: string;
}

const KEY = "santuario_plans_v1";
const listeners = new Set<() => void>();

function read(): Record<string, number[]> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
  } catch {
    return {};
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Instantánea estable (cadena) para useSyncExternalStore: el servidor siempre ve «sin progreso». */
const snapshot = () => window.localStorage.getItem(KEY) ?? "";
const serverSnapshot = () => "";

/** Progreso de un plan guardado sólo en este dispositivo (localStorage). */
export function PlanProgress({ planId, days }: { planId: string; days: readonly PlanDayView[] }) {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const done = new Set<number>(raw ? ((JSON.parse(raw) as Record<string, number[]>)[planId] ?? []) : []);

  const write = useCallback(
    (next: number[]) => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ ...read(), [planId]: next }));
      } catch {
        /* almacenamiento no disponible */
      }
      listeners.forEach((l) => l());
    },
    [planId],
  );

  const toggle = (day: number) => write(done.has(day) ? [...done].filter((d) => d !== day) : [...done, day].sort((a, b) => a - b));
  const completed = days.filter((d) => done.has(d.day)).length;

  return (
    <section aria-label="Plan de lectura" className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-sanct-muted" aria-live="polite">
          {completed} de {days.length} días completados · se guarda solo en este dispositivo
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-sanct-surface" aria-hidden>
          <div className="h-full rounded-full bg-sanct-accent transition-all" style={{ width: `${(completed / days.length) * 100}%` }} />
        </div>
      </div>

      <ol className="space-y-4">
        {days.map((d) => {
          const isDone = done.has(d.day);
          return (
            <li key={d.day} className={`space-y-3 rounded-3xl border p-6 transition ${isDone ? "border-sanct-accent/50 bg-sanct-surface" : "border-sanct-border"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-sanct-accent">Día {d.day}</p>
                  <h3 className="scripture text-2xl">{d.focus}</h3>
                </div>
                <button
                  type="button"
                  aria-pressed={isDone}
                  aria-label={isDone ? `Desmarcar el día ${d.day}` : `Marcar el día ${d.day} como leído`}
                  onClick={() => toggle(d.day)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${isDone ? "border-sanct-accent bg-sanct-accent text-sanct-bg" : "border-sanct-border text-transparent hover:text-sanct-muted"}`}
                >
                  <Check size={16} aria-hidden />
                </button>
              </div>
              <p className="text-sm text-sanct-muted">
                Lectura:{" "}
                <Link href={d.href} className="text-sanct-text underline underline-offset-4 hover:text-sanct-accent">
                  {d.reference}
                </Link>
              </p>
              <p className="leading-relaxed">
                <span className="text-sanct-accent">Para reflexionar: </span>
                {d.reflection}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
