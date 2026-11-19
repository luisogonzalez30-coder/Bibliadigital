import Link from "next/link";

/** Cabecera simple de las páginas de la Biblia. */
export function BibleHeader() {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-5">
      <Link href="/" className="scripture whitespace-nowrap text-lg sm:text-xl">
        Santuario Bíblico
      </Link>
      <nav aria-label="Biblia" className="flex items-center gap-2 text-sm">
        <Link href="/biblia" className="rounded-full px-4 py-2 text-sanct-muted transition hover:text-sanct-text">
          La Biblia
        </Link>
        <Link href="/santuario" className="rounded-full bg-sanct-accent px-5 py-2.5 font-medium text-sanct-bg transition hover:opacity-90">
          Entrar
        </Link>
      </nav>
    </header>
  );
}
