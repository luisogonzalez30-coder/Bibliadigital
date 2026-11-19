#!/usr/bin/env node
/* Renderiza un video SVG de Santuario a MP4 (1080x1920, 30 fps) sin servicios de pago.
 * Uso:  node video/render.mjs <historia> [--out dir] [--fps 30] [--stills 1.5,8,20] [--audio-only] [--voice] [--voice-name es-CL-LorenzoNeural] [--rate -8%]
 * Requiere: playwright (con Chromium) y ffmpeg. El texto bíblico se lee literal de src/data/bible/*.json. */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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
const useVoice = args.includes("--voice");
const voiceName = opt("voice-name", "es-CL-LorenzoNeural");
const voiceRate = opt("rate", "-3%");
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

/** Narración con Azure Voz (neuronal): una llamada por página de subtítulos; se cachea por texto+voz+velocidad. */
async function synth(text) {
  const key = createHash("sha1").update(`${voiceName}|${voiceRate}|${text}`).digest("hex").slice(0, 16);
  const file = path.join(outDir, ".tts", `${key}.mp3`);
  if (existsSync(file)) return file;
  mkdirSync(path.dirname(file), { recursive: true });
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lang = voiceName.split("-").slice(0, 2).join("-");
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}"><voice name="${voiceName}"><prosody rate="${voiceRate}">${esc}</prosody></voice></speak>`;
  // curl respeta HTTPS_PROXY y las credenciales del entorno (fetch de Node no); reintenta si el servicio limita la tasa (429)
  let code = "";
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = spawnSync(
      "curl",
      ["-sS", "-m", "60", "-X", "POST", process.env.TTS_URL ?? "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1", "-H", "Content-Type: application/ssml+xml", "-H", "X-Microsoft-OutputFormat: audio-24khz-96kbitrate-mono-mp3", "-H", "User-Agent: santuario-video", "--data-binary", "@-", "-o", file, "-w", "%{http_code}"],
      { input: ssml },
    );
    code = r.stdout.toString().trim();
    if (code === "200") break;
    if (code !== "429" && code !== "503") break;
    await new Promise((res) => setTimeout(res, 4000 * attempt));
  }
  if (code !== "200") {
    const body = existsSync(file) ? readFileSync(file, "utf8").slice(0, 200) : "";
    if (existsSync(file)) rmSync(file);
    throw new Error(`Azure TTS ${code}: ${body}`);
  }
  return file;
}
const mp3Duration = (f) => Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).stdout.toString().trim());

let voiceClips = null;
let totalFinal = total;
if (useVoice) {
  const pages = await page.evaluate(() => window.__video.pagesText());
  const files = [];
  let chars = 0;
  for (const p of pages) {
    files.push(await synth(p.text));
    chars += p.text.length;
  }
  const { total: t2, starts } = await page.evaluate((d) => window.__video.retime(d), files.map(mp3Duration));
  totalFinal = t2;
  voiceClips = files.map((f, i) => ({ f, at: starts[i] }));
  console.log(`Voz ${voiceName}: ${pages.length} frases, ${chars} caracteres · duración final ${t2.toFixed(1)} s`);
}

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
const mix = `${notes.map((_, i) => `[n${i}]`).join("")}amix=inputs=${notes.length}:normalize=0,volume=0.45,lowpass=f=1400,aecho=0.8:0.9:700|1100:0.35|0.25,afade=t=in:d=2,afade=t=out:st=${(totalFinal - 2.5).toFixed(1)}:d=2.5`;
const padRun = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...notes.flatMap((f) => ["-f", "lavfi", "-t", String(totalFinal + 2), "-i", `sine=frequency=${f}`]), "-filter_complex", notes.map((_, i) => `[${i}:a]tremolo=f=${(0.12 + i * 0.04).toFixed(2)}:d=0.5[n${i}]`).join(";") + ";" + mix, pad]);
if (padRun.status !== 0) throw new Error(padRun.stderr.toString());

const silent = path.join(outDir, `.${story}-silent.mp4`);
if (!(audioOnly && !useVoice && existsSync(silent))) {
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", silent], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => {
    ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`))));
  });
  const n = Math.round(totalFinal * fps);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate((x) => window.__video.setFrame(x), i / fps);
    const buf = await page.screenshot({ type: "jpeg", quality: 92, timeout: 120000 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 150 === 0) console.log(`  ${i}/${n} (${Math.round((Date.now() - t0) / 1000)} s)`);
  }
  ff.stdin.end();
  await done;
}
await browser.close();

const final = path.join(outDir, useVoice ? `${story}-voz.mp4` : `${story}.mp4`);
let mux;
if (useVoice) {
  // pista de voz: cada frase se coloca en su instante exacto; luego se mezcla con el colchón ambiental (bajo) y se normaliza
  const inputs = voiceClips.flatMap((c) => ["-i", c.f]);
  const delays = voiceClips.map((c, i) => `[${i}:a]adelay=${Math.round(c.at * 1000)}:all=1[v${i}]`).join(";");
  const voiceMix = `${delays};${voiceClips.map((_, i) => `[v${i}]`).join("")}amix=inputs=${voiceClips.length}:normalize=0:dropout_transition=0,apad=whole_dur=${totalFinal.toFixed(2)}[voice]`;
  const full = `${voiceMix};[${voiceClips.length + 1}:a]volume=0.35[pad];[voice][pad]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
  mux = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-i", silent, "-i", pad, "-filter_complex", full, "-map", `${voiceClips.length}:v`, "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", final]);
} else {
  mux = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", pad, "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", final]);
}
if (mux.status !== 0) throw new Error(mux.stderr.toString());
console.log("Listo:", final);
