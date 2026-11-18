interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl bg-sanct-surface px-4 py-3 text-left text-sm"
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-sanct-accent" : "bg-sanct-muted/40"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-sanct-bg transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
