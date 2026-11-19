"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Panel lateral con los controles secundarios; se cierra con Escape y bloquea el scroll del fondo. */
export function SettingsSheet({ open, onClose, children }: SettingsSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Ajustes y respaldo" className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Cerrar ajustes" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative flex h-full w-full max-w-md flex-col gap-8 overflow-y-auto border-l border-sanct-border bg-sanct-bg p-6 text-sanct-text">
        <div className="flex items-center justify-between">
          <h2 className="scripture text-2xl">Ajustes y respaldo</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 hover:bg-sanct-surface">
            <X size={20} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
