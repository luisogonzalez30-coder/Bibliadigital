import { BrandMark } from "@/components/brand/BrandMark";

interface BrandLogoProps {
  /** horizontal: marca a la izquierda (cabeceras). stacked: marca arriba, centrado (pie, bienvenida). */
  variant?: "horizontal" | "stacked";
  /** Muestra «PALABRA DIARIA» bajo el nombre. */
  tagline?: boolean;
  className?: string;
}

/** Marca + nombre en dorado. El texto del DOM es «Santuario Bíblico» (se muestra en mayúsculas con CSS). */
export function BrandLogo({ variant = "horizontal", tagline = false, className = "" }: BrandLogoProps) {
  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-3 text-center ${className}`}>
        <BrandMark className="h-20 w-20" />
        <span className="scripture gold-text text-2xl font-semibold uppercase tracking-[0.16em]">Santuario Bíblico</span>
        {tagline && <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-sanct-accent">Palabra diaria</span>}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <BrandMark className="h-7 w-7 shrink-0 sm:h-9 sm:w-9" />
      <span className="flex flex-col leading-none">
        <span className="scripture gold-text whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.1em] sm:text-base sm:tracking-[0.16em]">Santuario Bíblico</span>
        {tagline && <span className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.4em] text-sanct-accent sm:block">Palabra diaria</span>}
      </span>
    </span>
  );
}
