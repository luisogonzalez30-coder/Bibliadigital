import { useId } from "react";

/**
 * Monograma de Santuario Bíblico: «S» serif (Playfair Display) dentro de un doble aro dorado con un destello.
 * Mantener la geometría en sincronía con scripts/build-brand-assets.mjs (íconos de la app y tarjeta social).
 */
export function BrandMark({ className = "h-9 w-9", title }: { className?: string; title?: string }) {
  const uid = useId().replace(/:/g, "");
  const gold = `gold-${uid}`;
  const spark = `spark-${uid}`;
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a07a3a" />
          <stop offset="0.4" stopColor="#f0dba8" />
          <stop offset="0.7" stopColor="#c9a25b" />
          <stop offset="1" stopColor="#8f6b34" />
        </linearGradient>
        <linearGradient id={spark} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#f6e7bd" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff6dc" stopOpacity="0.95" />
          <stop offset="1" stopColor="#f6e7bd" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${gold})`} strokeWidth="2.2" />
      <circle cx="50" cy="50" r="41" fill="none" stroke={`url(#${gold})`} strokeWidth="0.7" opacity="0.6" />
      <text x="50" y="69" textAnchor="middle" fontFamily="var(--font-playfair), 'Playfair Display', Georgia, serif" fontWeight="600" fontSize="64" fill={`url(#${gold})`}>
        S
      </text>
      {/* destello */}
      <path d="M52 52 L92 12" stroke={`url(#${spark})`} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M74 13 L75.3 19.7 L82 21 L75.3 22.3 L74 29 L72.7 22.3 L66 21 L72.7 19.7 Z" fill="#fff3cf" opacity="0.95" />
    </svg>
  );
}
