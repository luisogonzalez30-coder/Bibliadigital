"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import type { CanonicalVerse } from "@/types/bible";

const WIDTH = 1080;
const HEIGHT = 1920;
const MARGIN = 120;
const SEAL = "Escritura 100% Verificada · Santuario Bíblico";

type PostalStyle = "parchment" | "night" | "amber";

interface Palette {
  label: string;
  bgFrom: string;
  bgTo: string;
  text: string;
  muted: string;
  accent: string;
}

const PALETTES: Record<PostalStyle, Palette> = {
  parchment: { label: "Pergamino", bgFrom: "#FAF6F0", bgTo: "#F3ECE1", text: "#1C1917", muted: "#57534E", accent: "#D97706" },
  night: { label: "Noche", bgFrom: "#0C0A09", bgTo: "#1C1917", text: "#F5F5F4", muted: "#A8A29E", accent: "#F59E0B" },
  amber: { label: "Ámbar", bgFrom: "#FBBF24", bgTo: "#D97706", text: "#1C1917", muted: "#44403C", accent: "#1C1917" },
};

interface PostalStudioModalProps {
  verse: CanonicalVerse | null;
  showParallelEnglish: boolean;
  onClose: () => void;
  /** Si se define, tras descargar se sugiere (sin bloquear) el aporte voluntario. */
  onOffer?: () => void;
}

/** Divide el texto por palabras para que cada línea quepa en maxWidth con la fuente actual del contexto. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

interface Block {
  lines: string[];
  font: string;
  lineHeight: number;
}

function drawPostal(
  canvas: HTMLCanvasElement,
  verse: CanonicalVerse,
  parallel: boolean,
  style: PostalStyle,
  serif: string,
  sans: string,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const p = PALETTES[style];
  const maxWidth = WIDTH - MARGIN * 2;

  const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bg.addColorStop(0, p.bgFrom);
  bg.addColorStop(1, p.bgTo);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Zonas fijas: ornamento superior, cuerpo, referencia y pie.
  const bodyTop = 330;
  const refBlockHeight = 130;
  const footerY = HEIGHT - 130;
  const bodyBottom = footerY - 90 - refBlockHeight;
  const bodyHeight = bodyBottom - bodyTop;
  const gap = 56;

  // Reduce el tamaño de letra hasta que todo el texto (sin recortar) quepa en la zona del cuerpo.
  let size = 66;
  let blocks: Block[] = [];
  let total = 0;
  for (; size >= 22; size -= 2) {
    blocks = [];
    const esFont = `${size}px ${serif}`;
    ctx.font = esFont;
    blocks.push({ lines: wrapText(ctx, verse.textEs, maxWidth), font: esFont, lineHeight: size * 1.4 });
    if (parallel) {
      const enSize = Math.round(size * 0.78);
      const enFont = `italic ${enSize}px ${serif}`;
      ctx.font = enFont;
      blocks.push({ lines: wrapText(ctx, verse.textEn, maxWidth), font: enFont, lineHeight: enSize * 1.4 });
    }
    total = blocks.reduce((h, b) => h + b.lines.length * b.lineHeight, 0) + gap * (blocks.length - 1);
    if (total <= bodyHeight) break;
  }

  // Ornamento
  ctx.fillStyle = p.accent;
  ctx.fillRect(WIDTH / 2 - 50, 230, 100, 5);

  // Cuerpo centrado verticalmente en su zona
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let y = bodyTop + Math.max(0, (bodyHeight - total) / 2);
  blocks.forEach((block, bi) => {
    ctx.font = block.font;
    ctx.fillStyle = bi === 0 ? p.text : p.muted;
    block.lines.forEach((line) => {
      ctx.fillText(line, WIDTH / 2, y);
      y += block.lineHeight;
    });
    y += gap;
  });

  // Referencia y versión
  const refY = bodyBottom + 60;
  ctx.fillStyle = p.accent;
  ctx.font = `600 44px ${sans}`;
  ctx.fillText(`${verse.bookNameEs} ${verse.chapter}:${verse.verseNumber}`, WIDTH / 2, refY);
  ctx.fillStyle = p.muted;
  ctx.font = `32px ${sans}`;
  const versions = parallel ? `${verse.versionEs} / ${verse.versionEn}` : verse.versionEs;
  ctx.fillText(versions, WIDTH / 2, refY + 64);

  // Sello
  ctx.fillStyle = p.muted;
  ctx.font = `28px ${sans}`;
  ctx.fillText(SEAL, WIDTH / 2, footerY);
}

export function PostalStudioModal({ verse, showParallelEnglish, onClose: onCloseProp, onOffer }: PostalStudioModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [style, setStyle] = useState<PostalStyle>("parchment");
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const onClose = useCallback(() => {
    setDownloadedId(null);
    onCloseProp();
  }, [onCloseProp]);
  const open = verse !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!verse || !canvas) return;
    let alive = true;
    const root = getComputedStyle(document.documentElement);
    const serif = root.getPropertyValue("--font-playfair").trim() || "Georgia, serif";
    const sans = root.getPropertyValue("--font-inter").trim() || "system-ui, sans-serif";
    void Promise.all([
      document.fonts.load(`40px ${serif}`),
      document.fonts.load(`italic 40px ${serif}`),
      document.fonts.load(`600 40px ${sans}`),
    ])
      .catch(() => undefined)
      .then(() => {
        if (alive) drawPostal(canvas, verse, showParallelEnglish, style, serif, sans);
      });
    return () => {
      alive = false;
    };
  }, [verse, showParallelEnglish, style]);

  const download = useCallback(() => {
    if (!verse) return;
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `santuario-${verse.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadedId(verse.id);
    }, "image/png");
  }, [verse]);

  if (!verse) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Estudio de postal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="flex max-h-full w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-2xl bg-sanct-bg p-4 text-sanct-text">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-sanct-muted">Estudio de postal · 9:16</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-1.5 hover:bg-sanct-surface">
            <X size={20} aria-hidden />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="mx-auto max-h-[58vh] w-auto rounded-lg shadow"
        />

        <div role="group" aria-label="Estilo de la postal" className="grid grid-cols-3 gap-2">
          {(Object.keys(PALETTES) as PostalStyle[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={style === key}
              onClick={() => setStyle(key)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                style === key ? "border-sanct-accent bg-sanct-surface" : "border-transparent bg-sanct-surface/60"
              }`}
            >
              {PALETTES[key].label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={download}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sanct-accent px-4 py-3 text-sm font-medium text-sanct-bg"
        >
          <Download size={16} aria-hidden /> Descargar PNG
        </button>

        {onOffer && downloadedId === verse.id && (
          <p role="status" className="text-center text-xs text-sanct-muted">
            ¿Te acompañó esta postal? Santuario Bíblico sigue libre para todos.{" "}
            <button type="button" onClick={onOffer} className="text-sanct-accent underline underline-offset-4">
              Aportar
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
