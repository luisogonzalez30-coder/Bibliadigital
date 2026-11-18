"use client";

import { useState } from "react";
import { Cloud, CloudOff } from "lucide-react";
import { isSupabaseConfigured } from "@/services/supabaseReady";

interface CloudSyncPanelProps {
  /** Correo de la sesión activa, o null si no hay sesión. */
  email: string | null;
  onSendMagicLink: (email: string) => Promise<boolean>;
  onSignOut: () => Promise<boolean>;
}

type Status = "idle" | "sending" | "sent" | "error";

export function CloudSyncPanel({ email, onSendMagicLink, onSignOut }: CloudSyncPanelProps) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  if (!isSupabaseConfigured()) {
    return (
      <aside role="note" className="flex gap-3 rounded-xl px-4 py-3 text-xs text-sanct-muted">
        <CloudOff size={14} aria-hidden className="mt-0.5 shrink-0" />
        <p>Modo local activo: tu tradición, racha y favoritos se guardan solo en este dispositivo.</p>
      </aside>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "sending") return;
    setStatus("sending");
    setStatus((await onSendMagicLink(input)) ? "sent" : "error");
  };

  return (
    <section aria-label="Sincronización en la nube" className="rounded-xl px-4 py-3 text-xs text-sanct-muted">
      <div className="flex items-start gap-3">
        <Cloud size={14} aria-hidden className="mt-0.5 shrink-0" />
        {email ? (
          <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
            <p>
              Sincronizado como <span className="text-sanct-text">{email}</span>
            </p>
            <button type="button" onClick={() => void onSignOut()} className="underline underline-offset-4">
              Cerrar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex-1 space-y-2">
            <p>Opcional: inicia sesión con tu correo para respaldar tu progreso. Puedes seguir usando la app sin cuenta.</p>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setStatus("idle");
                }}
                placeholder="tu@correo.com"
                aria-label="Correo electrónico"
                className="min-w-0 flex-1 rounded-lg bg-sanct-surface px-3 py-2 text-sanct-text placeholder:text-sanct-muted"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-lg bg-sanct-surface px-3 py-2 text-sanct-text disabled:opacity-50"
              >
                {status === "sending" ? "Enviando…" : "Enviar enlace"}
              </button>
            </div>
            <p aria-live="polite">
              {status === "sent" && "Revisa tu correo: te enviamos un enlace de acceso."}
              {status === "error" && "No se pudo enviar el enlace. Inténtalo de nuevo."}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
