"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

interface Hit {
  ref: string;
  href: string;
  text: string;
}

interface SearchResponse {
  total: number;
  results: Hit[];
}

/** Búsqueda en la Reina-Valera 1909. La consulta se envía por POST al servidor; no se guarda. */
export function BibleSearch() {
  const [q, setQ] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [asked, setAsked] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (query.length < 3) return;
    setState("loading");
    try {
      const res = await fetch("/api/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query }),
      });
      if (!res.ok) throw new Error("bad status");
      setData((await res.json()) as SearchResponse);
      setAsked(query);
      setState("idle");
    } catch {
      setData(null);
      setState("error");
    }
  };

  return (
    <section aria-labelledby="buscar-title" className="space-y-5">
      <h2 id="buscar-title" className="scripture text-2xl">
        Buscar en la Biblia
      </h2>
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="bible-q" className="sr-only">
          Palabra o frase
        </label>
        <input
          id="bible-q"
          type="search"
          value={q}
          maxLength={80}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Por ejemplo: pastor, esperanza, «no temas»"
          className="min-w-0 flex-1 rounded-full border border-sanct-border bg-transparent px-5 py-3 text-sm text-sanct-text placeholder:text-sanct-muted focus:border-sanct-accent/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={q.trim().length < 3 || state === "loading"}
          className="inline-flex items-center gap-2 rounded-full bg-sanct-accent px-5 py-3 text-sm font-medium text-sanct-bg transition hover:opacity-90 disabled:opacity-50"
        >
          <Search size={16} aria-hidden /> Buscar
        </button>
      </form>
      <p className="text-xs text-sanct-muted">Busca en la Reina-Valera 1909. La palabra se envía a nuestro servidor para encontrar resultados y no se guarda.</p>

      <div aria-live="polite" className="space-y-4">
        {state === "error" && <p className="text-sm text-sanct-muted">No se pudo buscar ahora. Inténtalo de nuevo.</p>}
        {data && data.total === 0 && <p className="text-sm text-sanct-muted">Sin resultados para «{asked}».</p>}
        {data && data.total > 0 && (
          <>
            <p className="text-sm text-sanct-muted">
              {data.total} resultado{data.total === 1 ? "" : "s"} para «{asked}»{data.total > data.results.length ? `; se muestran los primeros ${data.results.length}` : ""}.
            </p>
            <ul className="space-y-4">
              {data.results.map((r) => (
                <li key={r.href} className="rounded-2xl border border-sanct-border p-5">
                  <Link href={r.href} className="text-sm text-sanct-accent underline-offset-4 hover:underline">
                    {r.ref}
                  </Link>
                  <p lang="es" className="scripture mt-2 text-lg leading-relaxed">
                    {r.text}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
