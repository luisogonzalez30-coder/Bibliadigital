"use client";

import { useState } from "react";
import { sanitizeDisplayName } from "@/services/sanctuaryEngine";

interface NameFieldProps {
  value: string;
  onCommit: (name: string) => void;
}

/** Nombre para el saludo: se confirma al salir del campo (así se pueden escribir espacios, p. ej. «Ana María»). */
export function NameField({ value, onCommit }: NameFieldProps) {
  const [draft, setDraft] = useState(value);
  const commit = () => {
    const clean = sanitizeDisplayName(draft);
    setDraft(clean);
    if (clean !== value) onCommit(clean);
  };
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-widest text-sanct-muted">Tu nombre</span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        maxLength={40}
        autoComplete="given-name"
        placeholder="Cómo quieres que te salude"
        className="w-full rounded-2xl border border-sanct-border bg-transparent px-4 py-3 text-sm placeholder:text-sanct-muted focus:border-sanct-accent/70 focus:outline-none"
      />
      <span className="block text-xs text-sanct-muted">Se guarda solo en este dispositivo.</span>
    </label>
  );
}
