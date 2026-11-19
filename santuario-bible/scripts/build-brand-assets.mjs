#!/usr/bin/env node
/* Genera los íconos de la app, el favicon y la tarjeta social con la identidad de Santuario Bíblico.
 * Mantener la geometría del monograma en sincronía con src/components/brand/BrandMark.tsx.
 * Uso: node scripts/build-brand-assets.mjs   (requiere playwright con Chromium e ImageMagick) */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import os from "node:os";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fonts = path.join(root, "video", "fonts");
const icons = path.join(root, "public", "icons");
mkdirSync(icons, { recursive: true });

const MARK = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a07a3a"/><stop offset="0.4" stop-color="#f0dba8"/><stop offset="0.7" stop-color="#c9a25b"/><stop offset="1" stop-color="#8f6b34"/></linearGradient>
    <linearGradient id="s" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f6e7bd" stop-opacity="0"/><stop offset="0.5" stop-color="#fff6dc" stop-opacity="0.95"/><stop offset="1" stop-color="#f6e7bd" stop-opacity="0"/></linearGradient>
  </defs>
  <circle cx="50" cy="50" r="46" fill="none" stroke="url(#g)" stroke-width="2.2"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="url(#g)" stroke-width="0.7" opacity="0.6"/>
  <text x="50" y="69" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-weight="600" font-size="64" fill="url(#g)">S</text>
  <path d="M52 52 L92 12" stroke="url(#s)" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M74 13 L75.3 19.7 L82 21 L75.3 22.3 L74 29 L72.7 22.3 L66 21 L72.7 19.7 Z" fill="#fff3cf" opacity="0.95"/>
</svg>`;

const FONT_CSS = `@font-face{font-family:"Playfair Display";font-weight:600;src:url("file://${fonts}/PlayfairDisplay-SemiBold.ttf")}
@font-face{font-family:"Playfair Display";font-weight:500;font-style:italic;src:url("file://${fonts}/PlayfairDisplay-MediumItalic.ttf")}`;
const BG = "radial-gradient(70% 70% at 50% 38%, #2f2923 0%, #1c1917 70%)";

const page_ = (w, h, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}
html,body{margin:0;width:${w}px;height:${h}px;background:#1c1917;overflow:hidden}
.bg{width:${w}px;height:${h}px;background:${BG};display:flex;align-items:center;justify-content:center;flex-direction:column}
</style></head><body>${body}</body></html>`;

/** Ícono cuadrado: el monograma ocupa `ratio` del lado (maskable: 60 % para quedar en la zona segura). */
const iconHtml = (size, ratio) => page_(size, size, `<div class="bg"><div style="width:${Math.round(size * ratio)}px;height:${Math.round(size * ratio)}px">${MARK}</div></div>`);

const socialHtml = page_(
  1200,
  630,
  `<div class="bg" style="gap:26px">
    <div style="width:220px;height:220px">${MARK}</div>
    <div style="font-family:'Playfair Display',serif;font-weight:600;font-size:64px;letter-spacing:0.16em;text-transform:uppercase;background:linear-gradient(135deg,#c9a25b,#f1dcaa 45%,#d4b06a 70%,#b8924a);-webkit-background-clip:text;color:transparent">Santuario Bíblico</div>
    <div style="font-family:Inter,sans-serif;font-weight:500;font-size:24px;letter-spacing:0.42em;text-transform:uppercase;color:#d4b06a">Palabra diaria</div>
    <div style="font-family:Inter,sans-serif;font-size:22px;color:#b8ada0;margin-top:8px">La Biblia completa · Reina-Valera 1909 · texto íntegro y verificado</div>
  </div>`,
);

const browser = await chromium.launch();
async function shot(html, w, h, file) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  // Desde about:blank no se pueden cargar fuentes file://: se abre como archivo.
  const tmp = path.join(os.tmpdir(), `santuario-brand-${process.pid}.html`);
  writeFileSync(tmp, html);
  await page.goto(`file://${tmp}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: file, type: "png" });
  await page.close();
  console.log("→", path.relative(root, file));
}
await shot(iconHtml(192, 0.8), 192, 192, path.join(icons, "icon-192.png"));
await shot(iconHtml(512, 0.8), 512, 512, path.join(icons, "icon-512.png"));
await shot(iconHtml(512, 0.58), 512, 512, path.join(icons, "icon-maskable-512.png"));
await shot(iconHtml(180, 0.8), 180, 180, path.join(icons, "apple-touch-icon.png"));
await shot(iconHtml(256, 0.9), 256, 256, path.join(icons, ".favicon-256.png"));
await shot(socialHtml, 1200, 630, path.join(root, "public", "og.png"));
await browser.close();

// favicon.ico (16/32/48 px) con ImageMagick (ffmpeg genera un .ico que Next no puede leer)
const ico = path.join(root, "src", "app", "favicon.ico");
const r = spawnSync("convert", [path.join(icons, ".favicon-256.png"), "-define", "icon:auto-resize=48,32,16", ico]);
if (r.status !== 0) throw new Error(r.stderr.toString());
rmSync(path.join(icons, ".favicon-256.png"));
console.log("→ src/app/favicon.ico");
