/**
 * Recordatorio diario como evento de calendario recurrente (.ics o enlace de Google Calendar).
 * Sin servidor ni cuentas: el aviso lo gestiona el calendario de la persona.
 */
const pad = (n: number) => String(n).padStart(2, '0');

function localStamp(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function utcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** Escapa texto según RFC 5545 (coma, punto y coma, barra invertida y saltos de línea). */
function esc(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

export interface ReminderOptions {
  hour: number;
  minute: number;
  /** Fecha de referencia: el evento empieza hoy si la hora aún no pasó, o mañana. */
  now: Date;
  /** URL de la app (https://dominio/santuario). */
  appUrl: string;
}

const SUMMARY = 'Santuario · Tu lectura de hoy';
const DESCRIPTION = 'Tu versículo del día te espera.';

export function firstOccurrence({ hour, minute, now }: Pick<ReminderOptions, 'hour' | 'minute' | 'now'>): Date {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 1);
  return start;
}

export function buildDailyReminderIcs(opts: ReminderOptions): string {
  const start = firstOccurrence(opts);
  const host = new URL(opts.appUrl).host;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Santuario//Recordatorio diario//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:recordatorio-diario@${host}`,
    `DTSTAMP:${utcStamp(opts.now)}`,
    `DTSTART:${localStamp(start)}`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    `SUMMARY:${esc(SUMMARY)}`,
    `DESCRIPTION:${esc(`${DESCRIPTION} ${opts.appUrl}`)}`,
    `URL:${opts.appUrl}`,
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(SUMMARY)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}

/** Enlace «Añadir a Google Calendar» con repetición diaria. */
export function buildGoogleCalendarUrl(opts: ReminderOptions): string {
  const start = firstOccurrence(opts);
  const end = new Date(start.getTime() + 10 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: SUMMARY,
    details: `${DESCRIPTION} ${opts.appUrl}`,
    dates: `${localStamp(start)}/${localStamp(end)}`,
    recur: 'RRULE:FREQ=DAILY',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
