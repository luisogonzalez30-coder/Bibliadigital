#!/usr/bin/env node
/* Comprueba que el texto mostrado en cada video es EXACTAMENTE el versículo del catálogo (sin palabras añadidas, quitadas ni cambiadas). */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const BOOKS = { "1SA": "1 Samuel", GEN: "Génesis", DAN: "Daniel" };
const norm = (s) => s.replace(/\s+/g, " ").trim();
let bad = 0;
const browser = await chromium.launch();
for (const story of ["david", "jose", "daniel"]) {
  const src = readFileSync(path.join(here, "stories", `${story}.js`), "utf8");
  const keys = [...new Set([...src.matchAll(/"([A-Z0-9]{3}\.\d+\.\d+)"/g)].map((m) => m[1]))];
  const VERSES = {};
  for (const k of keys) {
    const [o, c, v] = k.split(".");
    const row = JSON.parse(readFileSync(path.join(root, "src/data/bible", `${o}.json`), "utf8")).c[c - 1].find((x) => x[0] === +v);
    VERSES[k] = { es: row[1], label: `${BOOKS[o]} ${c}:${v} · RV 1909` };
  }
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("about:blank");
  await page.addScriptTag({ content: `window.VERSES=${JSON.stringify(VERSES)};` });
  await page.addScriptTag({ path: path.join(here, "engine.js") });
  await page.addScriptTag({ path: path.join(here, "stories", `${story}.js`) });
  await page.evaluate((s) => window.__video.ready(window.STORIES[s]), story);
  const pages = await page.evaluate(() => window.__video.pagesText());
  for (const k of keys) {
    const shown = norm(pages.filter((p) => p.ref === VERSES[k].label).map((p) => p.text).join(" "));
    const ok = shown === norm(VERSES[k].es);
    if (!ok) bad++;
    console.log(`${ok ? "OK " : "DIF"} ${story} ${k} (${shown.split(" ").length} palabras)`);
  }
  await page.close();
}
await browser.close();
if (bad) { console.error(`${bad} versículo(s) no coinciden`); process.exit(1); }
console.log("Texto en pantalla idéntico al catálogo en todos los versículos.");
