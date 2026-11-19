"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminOverview, type AdminOverview } from "@/services/adminStats";
import { onCloudAuthChange, signInWithMagicLink, signOutCloudUser } from "@/services/supabaseRepository";
import { isSupabaseConfigured } from "@/services/supabaseReady";

type View =
  | { phase: "loading" }
  | { phase: "login" }
  | { phase: "forbidden"; email: string }
  | { phase: "unavailable" }
  | { phase: "ok"; email: string; data: AdminOverview };

const pct = (returned: number, base: number) => (base === 0 ? "—" : `${Math.round((returned / base) * 100)} %`);

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-sanct-border p-4">
      <p className="text-xs uppercase tracking-wide text-sanct-muted">{label}</p>
      <p className="scripture mt-1 text-3xl">{value.toLocaleString("es-CL")}</p>
      {hint && <p className="mt-1 text-xs text-sanct-muted">{hint}</p>}
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  return (
    <form
      className="max-w-sm space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        setStatus((await signInWithMagicLink(email)) ? "sent" : "error");
      }}
    >
      <p className="text-sm text-sanct-muted">Inicia sesión con el correo autorizado. Te enviaremos un enlace de acceso.</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Correo electrónico"
        placeholder="tu@correo.com"
        className="w-full rounded-lg bg-sanct-surface px-3 py-2 text-sm"
      />
      <button type="submit" disabled={status === "sending"} className="rounded-lg bg-sanct-surface px-4 py-2 text-sm disabled:opacity-50">
        {status === "sending" ? "Enviando…" : "Enviar enlace"}
      </button>
      <p aria-live="polite" className="text-xs text-sanct-muted">
        {status === "sent" && "Revisa tu correo y vuelve a esta página."}
        {status === "error" && "No se pudo enviar el enlace."}
      </p>
    </form>
  );
}

export function AdminDashboard() {
  const [view, setView] = useState<View>(() => (isSupabaseConfigured() ? { phase: "loading" } : { phase: "unavailable" }));

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onCloudAuthChange((email) => {
      if (!email) {
        if (!cancelled) setView({ phase: "login" });
        return;
      }
      void fetchAdminOverview(30).then((res) => {
        if (cancelled) return;
        if (res.status === "ok") setView({ phase: "ok", email, data: res.data });
        else if (res.status === "forbidden") setView({ phase: "forbidden", email });
        else setView({ phase: "unavailable" });
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const maxDau = view.phase === "ok" ? Math.max(1, ...view.data.dau.map((d) => d.devices)) : 1;

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-6 py-12 text-sanct-text">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-sanct-muted hover:text-sanct-text">
          ← Inicio
        </Link>
        <h1 className="scripture text-4xl">Panel de uso</h1>
      </header>

      {view.phase === "loading" && <p className="text-sm text-sanct-muted">Cargando…</p>}
      {view.phase === "unavailable" && (
        <p className="text-sm text-sanct-muted">Panel no disponible: falta configurar Supabase o aplicar la migración 02_analitica.sql.</p>
      )}
      {view.phase === "login" && <LoginForm />}
      {view.phase === "forbidden" && (
        <div className="space-y-3 text-sm text-sanct-muted">
          <p>
            La cuenta <span className="text-sanct-text">{view.email}</span> no tiene acceso al panel.
          </p>
          <button type="button" className="underline underline-offset-4" onClick={() => void signOutCloudUser()}>
            Cerrar sesión
          </button>
        </div>
      )}

      {view.phase === "ok" && (
        <>
          <section aria-label="Resumen" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Activos hoy" value={view.data.totals.dau_today} />
            <Stat label="Activos 7 días" value={view.data.totals.wau} />
            <Stat label="Activos 30 días" value={view.data.totals.mau} />
            <Stat label="Dispositivos totales" value={view.data.totals.devices} />
            <Stat label="Instalaciones" value={view.data.totals.installs} hint="Evento «appinstalled» (no iPhone)" />
            <Stat label="Abren como app" value={view.data.totals.standalone_devices} hint="Incluye iPhone" />
            <Stat label="Cuentas registradas" value={view.data.totals.registered} />
          </section>

          <section aria-label="Activos por día" className="space-y-3">
            <h2 className="scripture text-2xl">Activos por día ({view.data.days} días)</h2>
            <div className="flex h-32 items-end gap-1" role="img" aria-label="Dispositivos activos por día">
              {view.data.dau.map((d) => (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.devices}`}
                  className="flex-1 rounded-t bg-sanct-accent"
                  style={{ height: `${Math.max(2, (d.devices / maxDau) * 100)}%` }}
                />
              ))}
            </div>
          </section>

          <section aria-label="Retención" className="space-y-3">
            <h2 className="scripture text-2xl">Retención</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-sanct-muted">
                <tr>
                  <th className="py-2">Día</th>
                  <th>Volvieron</th>
                  <th>Base</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {view.data.retention.map((r) => (
                  <tr key={r.day} className="border-t border-sanct-border">
                    <td className="py-2">D{r.day}</td>
                    <td>{r.returned}</td>
                    <td>{r.base}</td>
                    <td>{pct(r.returned, r.base)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-sanct-muted">Porcentaje de dispositivos que abrieron la app exactamente N días después de su primera visita.</p>
          </section>

          <section aria-label="Lo más leído" className="space-y-3">
            <h2 className="scripture text-2xl">Lo más leído</h2>
            <ul className="space-y-1 text-sm">
              {view.data.top_paths.length === 0 && <li className="text-sanct-muted">Aún sin lecturas.</li>}
              {view.data.top_paths.map((p) => (
                <li key={p.path} className="flex justify-between border-t border-sanct-border py-2">
                  <span>{p.path}</span>
                  <span className="text-sanct-muted">{p.views}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Origen" className="space-y-3">
            <h2 className="scripture text-2xl">Origen (utm)</h2>
            {(view.data.sources ?? []).length === 0 ? (
              <p className="text-sm text-sanct-muted">Aún sin visitas con utm. Usa enlaces como /historias/david-y-goliat?utm_source=tiktok&amp;utm_campaign=historias&amp;utm_content=voz-hombre</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-sanct-muted">
                    <tr>
                      <th className="py-2">Fuente</th>
                      <th>Campaña</th>
                      <th>Contenido</th>
                      <th>Dispositivos</th>
                      <th>Instalaciones</th>
                      <th>Lecturas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(view.data.sources ?? []).map((s) => (
                      <tr key={`${s.source}-${s.campaign}-${s.content}`} className="border-t border-sanct-border">
                        <td className="py-2 pr-3">{s.source}</td>
                        <td className="pr-3">{s.campaign}</td>
                        <td className="pr-3">{s.content}</td>
                        <td>{s.devices}</td>
                        <td>{s.installs}</td>
                        <td>{s.reads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-label="Cuentas" className="space-y-3">
            <h2 className="scripture text-2xl">Quién lee (cuentas con correo)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-sanct-muted">
                  <tr>
                    <th className="py-2">Correo</th>
                    <th>Última lectura</th>
                    <th>Racha</th>
                    <th>Mejor</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {view.data.users.map((u) => (
                    <tr key={`${u.email}-${u.created_at}`} className="border-t border-sanct-border">
                      <td className="py-2 pr-3">{u.email ?? "—"}</td>
                      <td>{u.last_read_date ?? "—"}</td>
                      <td>{u.current_streak ?? 0}</td>
                      <td>{u.longest_streak ?? 0}</td>
                      <td>{u.created_at.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sanct-muted">
              Solo aparecen quienes iniciaron sesión con su correo. El resto se cuenta de forma anónima.
            </p>
          </section>

          <button type="button" className="text-sm underline underline-offset-4" onClick={() => void signOutCloudUser()}>
            Cerrar sesión ({view.email})
          </button>
        </>
      )}
    </main>
  );
}
