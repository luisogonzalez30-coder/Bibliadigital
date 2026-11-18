import { Info } from "lucide-react";

export function DeuterocanonNotice() {
  return (
    <aside
      role="note"
      className="flex gap-3 rounded-xl border border-sanct-muted/30 px-4 py-3 text-sm text-sanct-muted"
    >
      <Info size={16} aria-hidden className="mt-0.5 shrink-0" />
      <p>
        Los textos deuterocanónicos verificados de Torres Amat (Sabiduría 7:26-27, Eclesiástico 2:10-11 y
        Tobías 12:15) están pendientes de una fuente accesible. Los pasajes ya verificados se muestran
        completos y sin cambios.
      </p>
    </aside>
  );
}
