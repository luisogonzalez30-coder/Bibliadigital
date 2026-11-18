import { CheckCircle2, Flame } from "lucide-react";

interface StreakPanelProps {
  activeStreak: number;
  longestStreak: number;
  readToday: boolean;
  onMarkRead: () => void;
}

export function StreakPanel({ activeStreak, longestStreak, readToday, onMarkRead }: StreakPanelProps) {
  return (
    <section aria-labelledby="streak-title" className="rounded-2xl bg-sanct-surface p-5">
      <h2 id="streak-title" className="mb-4 text-xs uppercase tracking-widest text-sanct-muted">
        Racha de Luz
      </h2>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sanct-accent">
          <Flame size={28} aria-hidden />
          <span className="text-3xl font-semibold tabular-nums">{activeStreak}</span>
        </div>
        <dl className="text-sm text-sanct-muted">
          <div className="flex gap-2">
            <dt>Mejor racha:</dt>
            <dd className="tabular-nums text-sanct-text">{longestStreak}</dd>
          </div>
          <div className="flex gap-2">
            <dt>Hoy:</dt>
            <dd className="text-sanct-text">{readToday ? "Leído" : "Pendiente"}</dd>
          </div>
        </dl>
      </div>
      <button
        type="button"
        onClick={onMarkRead}
        disabled={readToday}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sanct-accent px-4 py-2 text-sm font-medium text-sanct-bg disabled:opacity-50"
      >
        {readToday && <CheckCircle2 size={16} aria-hidden />}
        {readToday ? "Lectura de hoy completada" : "Marcar lectura de hoy"}
      </button>
    </section>
  );
}
