"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { buildDailyReminderIcs, buildGoogleCalendarUrl } from "@/services/reminderIcs";

/** Recordatorio diario en tu calendario: sin cuentas ni servidores; el aviso lo da tu propio calendario. */
export function DailyReminder() {
  const [time, setTime] = useState("07:00");

  const options = () => {
    const [h, m] = time.split(":").map(Number);
    return { hour: h ?? 7, minute: m ?? 0, now: new Date(), appUrl: `${window.location.origin}/santuario` };
  };

  const downloadIcs = () => {
    const blob = new Blob([buildDailyReminderIcs(options())], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "santuario-recordatorio-diario.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section aria-labelledby="reminder-title" className="space-y-3 rounded-2xl border border-sanct-border p-4">
      <h3 id="reminder-title" className="flex items-center gap-2 text-sm font-medium">
        <CalendarPlus size={16} strokeWidth={1.5} aria-hidden className="text-sanct-accent" /> Recordatorio diario
      </h3>
      <p className="text-xs leading-relaxed text-sanct-muted">
        Añade un aviso diario a tu calendario para leer tu versículo. No necesita cuenta: lo gestiona tu propio calendario.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="reminder-time" className="sr-only">
          Hora del recordatorio
        </label>
        <input
          id="reminder-time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value || "07:00")}
          className="rounded-lg border border-sanct-border bg-transparent px-3 py-2 text-sm text-sanct-text"
        />
        <button type="button" onClick={downloadIcs} className="rounded-full bg-sanct-accent px-4 py-2 text-xs font-medium text-sanct-bg transition hover:opacity-90">
          Descargar (.ics)
        </button>
        <a
          href={typeof window === "undefined" ? "#" : buildGoogleCalendarUrl(options())}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-sanct-border px-4 py-2 text-xs transition hover:bg-sanct-surface"
        >
          Google Calendar
        </a>
      </div>
    </section>
  );
}
