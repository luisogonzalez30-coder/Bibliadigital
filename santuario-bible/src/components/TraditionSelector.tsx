import { Check } from "lucide-react";
import { TRADITIONS_METADATA } from "@/data/canonicalSeed";
import type { TraditionSlug } from "@/types/bible";

interface TraditionSelectorProps {
  value: TraditionSlug;
  onChange: (slug: TraditionSlug) => void;
}

export function TraditionSelector({ value, onChange }: TraditionSelectorProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-xs uppercase tracking-widest text-sanct-muted">
        Tradición religiosa
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {TRADITIONS_METADATA.map((t) => {
          const active = t.slug === value;
          return (
            <button
              key={t.slug}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(t.slug)}
              className={`flex items-start justify-between gap-2 rounded-xl border px-4 py-3 text-left transition ${
                active
                  ? "border-sanct-accent bg-sanct-surface"
                  : "border-transparent bg-sanct-surface/60 hover:bg-sanct-surface"
              }`}
            >
              <span>
                <span className="block text-sm font-medium">{t.labelEs}</span>
                <span className="block text-xs text-sanct-muted">
                  {t.descriptionEs} · {t.bookCount} libros
                </span>
              </span>
              {active && <Check size={16} aria-hidden className="mt-0.5 shrink-0 text-sanct-accent" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
