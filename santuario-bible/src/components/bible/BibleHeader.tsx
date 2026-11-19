import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

/** Cabecera simple de las páginas de la Biblia. */
export function BibleHeader() {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-5">
      <Link href="/" aria-label="Santuario Bíblico, inicio">
        <BrandLogo />
      </Link>
      <nav aria-label="Biblia" className="flex items-center gap-2 text-sm">
        <Link href="/biblia" className="whitespace-nowrap rounded-full px-3 py-2 text-sanct-muted transition hover:text-sanct-text sm:px-4">
          La Biblia
        </Link>
        <Link href="/santuario" className="rounded-full bg-sanct-accent px-5 py-2.5 font-medium text-sanct-bg transition hover:opacity-90">
          Entrar
        </Link>
      </nav>
    </header>
  );
}
