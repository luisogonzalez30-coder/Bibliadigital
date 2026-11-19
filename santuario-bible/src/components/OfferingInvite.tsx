interface OfferingInviteProps {
  onAccept: () => void;
  onDismiss: () => void;
}

/** Invitación breve y opcional tras completar la lectura del día. No bloquea nada. */
export function OfferingInvite({ onAccept, onDismiss }: OfferingInviteProps) {
  return (
    <aside
      role="status"
      className="fade-in fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md flex-col gap-3 rounded-3xl border border-sanct-border bg-sanct-bg p-5 text-center shadow-lg"
    >
      <p className="leading-relaxed">
        Tu luz de hoy está encendida. Si esta lectura te acompañó, puedes ayudar a mantener Santuario.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-sanct-accent px-5 py-2.5 text-sm font-medium text-sanct-bg transition hover:opacity-90"
        >
          Aportar
        </button>
        <button type="button" onClick={onDismiss} className="px-3 py-2 text-sm text-sanct-muted hover:text-sanct-text">
          Ahora no
        </button>
      </div>
    </aside>
  );
}
