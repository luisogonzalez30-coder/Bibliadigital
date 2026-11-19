#!/usr/bin/env node
/* Renderiza un video SVG de Santuario a MP4 (1080x1920, 30 fps) sin servicios de pago.
 * Uso:  node video/render.mjs <historia> [--out dir] [--fps 30] [--stills 1.5,8,20] [--audio-only]
 * Requiere: playwright (con Chromium) y ffmpeg. El texto bíblico se lee literal de src/data/bible/*.json. */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const args = process.argv.slice(2);
const story = args.find((a) => !a.startsWith("--"));
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
if (!story) {
  console.error("Falta el nombre de la historia (david | jose | daniel).");
  process.exit(1);
}
const outDir = path.resolve(opt("out", path.join(root, "video", "out")));
const fps = Number(opt("fps", 30));
const audioOnly = args.includes("--audio-only");
const stills = opt("stills", "")
  .split(",")
  .filter(Boolean)
  .map(Number);
mkdirSync(outDir, { recursive: true });

const BOOKS = { "1SA": "1 Samuel", GEN: "Génesis", DAN: "Daniel" };
const SOURCE = "RV 1909";

/** Lee un versículo literal del catálogo verificado. Falla si falta o está vacío (no se inventa ni se rellena). */
function readVerse(key) {
  const [osis, ch, v] = key.split(".");
  const file = path.join(root, "src", "data", "bible", `${osis}.json`);
  const data = JSON.parse(readFileSync(file, "utf8"));
  const row = data.c[Number(ch) - 1]?.find((x) => x[0] === Number(v));
  if (!row || !row[1]) throw new Error(`Versículo ausente o vacío en español: ${key}`);
  return { es: row[1], label: `${BOOKS[osis] ?? osis} ${ch}:${v} · ${SOURCE}` };
}

const storyFile = path.join(here, "stories", `${story}.js`);
if (!existsSync(storyFile)) throw new Error(`No existe ${storyFile}`);
const storySrc = readFileSync(storyFile, "utf8");
const keys = [...new Set([...storySrc.matchAll(/"([A-Z0-9]{3}\.\d+\.\d+)"/g)].map((m) => m[1]))];
const VERSES = Object.fromEntries(keys.map((k) => [k, readVerse(k)]));

const fonts = path.join(here, "fonts");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Playfair Display";font-weight:600;font-style:normal;src:url("file://${fonts}/PlayfairDisplay-SemiBold.ttf")}
@font-face{font-family:"Playfair Display";font-weight:500;font-style:italic;src:url("file://${fonts}/PlayfairDisplay-MediumItalic.ttf")}
html,body{margin:0;background:#0C0A09;overflow:hidden}
</style></head><body></body></html>`;
const htmlPath = path.join(outDir, `.${story}.html`);
writeFileSync(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("pageerror:", e.message));
await page.goto(`file://${htmlPath}`);
await page.addScriptTag({ content: `window.VERSES=${JSON.stringify(VERSES)};` });
await page.addScriptTag({ path: path.join(here, "engine.js") });
await page.addScriptTag({ path: storyFile });
const total = await page.evaluate(async (s) => window.__video.ready(window.STORIES[s]), story);
console.log(`Duración: ${total.toFixed(1)} s · ${Math.round(total * fps)} fotogramas`);
console.log(JSON.stringify(await page.evaluate(() => window.__video.info())));

if (stills.length) {
  for (const t of stills) {
    await page.evaluate((x) => window.__video.setFrame(x), t);
    const f = path.join(outDir, `${story}-still-${String(t).replace(".", "_")}.png`);
    await page.screenshot({ path: f });
    console.log("still", f);
  }
  await browser.close();
  process.exit(0);
}

// ── audio ambiental propio (síntesis con ffmpeg, sin derechos de terceros)
const PADS = { david: [146.83, 220.0, 293.66, 349.23], jose: [130.81, 196.0, 261.63, 329.63], daniel: [110.0, 164.81, 220.0, 261.63] };
const notes = PADS[story] ?? PADS.david;
const pad = path.join(outDir, `.${story}-pad.wav`);
const mix = `${notes.map((_, i) => `[n${i}]`).join("")}amix=inputs=${notes.length}:normalize=0,volume=0.45,lowpass=f=1400,aecho=0.8:0.9:700|1100:0.35|0.25,afade=t=in:d=2,afade=t=out:st=${(total - 2.5).toFixed(1)}:d=2.5`;
const padRun = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...notes.flatMap((f) => ["-f", "lavfi", "-t", String(total + 2), "-i", `sine=frequency=${f}`]), "-filter_complex", notes.map((_, i) => `[${i}:a]tremolo=f=${(0.12 + i * 0.04).toFixed(2)}:d=0.5[n${i}]`).join(";") + ";" + mix, pad]);
if (padRun.status !== 0) throw new Error(padRun.stderr.toString());

const silent = path.join(outDir, `.${story}-silent.mp4`);
if (!(audioOnly && existsSync(silent))) {
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", silent], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => {
    ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`))));
  });
  const n = Math.round(total * fps);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate((x) => window.__video.setFrame(x), i / fps);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 150 === 0) console.log(`  ${i}/${n} (${Math.round((Date.now() - t0) / 1000)} s)`);
  }
  ff.stdin.end();
  await done;
}
await browser.close();

const final = path.join(outDir, `${story}.mp4`);
const mux = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", pad, "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", final]);
if (mux.status !== 0) throw new Error(mux.stderr.toString());
console.log("Listo:", final);
