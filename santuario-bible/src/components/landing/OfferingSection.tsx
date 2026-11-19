"use client";

import { useCallback, useState } from "react";
import { Heart } from "lucide-react";
import { VoluntaryOfferingModal } from "@/components/VoluntaryOfferingModal";

/** Invitación serena al aporte voluntario. La página la muestra sólo si el pago está configurado. */
export function OfferingSection() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-sanct-accent/60 px-7 py-3.5 text-sm text-sanct-text transition hover:bg-sanct-surface"
      >
        <Heart size={16} strokeWidth={1.5} aria-hidden className="text-sanct-accent" /> Aportar
      </button>
      {open && <VoluntaryOfferingModal onClose={close} />}
    </>
  );
}
