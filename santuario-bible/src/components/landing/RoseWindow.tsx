/** Rosetón de luz en SVG (geometría sagrada neutral). Decorativo: sin imágenes externas. */
export function RoseWindow({ className = "" }: { className?: string }) {
  const rays = Array.from({ length: 24 }, (_, i) => i * 15);
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg
      viewBox="-100 -100 200 200"
      aria-hidden
      focusable="false"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      <circle r="96" />
      <circle r="88" strokeOpacity="0.6" />
      <circle r="52" />
      <circle r="14" />
      {rays.map((deg) => (
        <line key={deg} x1="0" y1="14" x2="0" y2="96" transform={`rotate(${deg})`} strokeOpacity={deg % 30 === 0 ? 0.9 : 0.35} />
      ))}
      {petals.map((deg) => (
        <ellipse key={deg} cx="0" cy="-70" rx="11" ry="18" transform={`rotate(${deg})`} />
      ))}
      {petals.map((deg) => (
        <circle key={`d${deg}`} cx="0" cy="-92" r="1.6" fill="currentColor" transform={`rotate(${deg + 15})`} />
      ))}
    </svg>
  );
}
