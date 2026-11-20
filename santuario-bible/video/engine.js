/* Motor de video SVG de Santuario (se ejecuta en el navegador; ver render.mjs).
 * Todo el texto bíblico llega de window.VERSES (leído literal de src/data/bible). Aquí nunca se escribe un versículo. */
(() => {
  const W = 1080;
  const H = 1920;
  const NS = "http://www.w3.org/2000/svg";
  const GOLD = "#C9A25B";
  const PARCH = "#FAF6F0";
  const NIGHT = "#0C0A09";

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - (1 - t) * (1 - t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, String(attrs[k]));
    if (parent) parent.appendChild(n);
    return n;
  }
  const grp = (parent, attrs) => el("g", attrs, parent);

  let defs;
  let gid = 0;
  function gradient(stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, radial = false, cx = 0.5, cy = 0.5, r = 0.5 } = {}) {
    const id = `g${++gid}`;
    const g = radial
      ? el("radialGradient", { id, cx, cy, r }, defs)
      : el("linearGradient", { id, x1, y1, x2, y2 }, defs);
    stops.forEach(([o, c, a = 1]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a }, g));
    return `url(#${id})`;
  }

  /* ───────── helpers de arte ───────── */
  function sky(g, colors, h = H) {
    const n = colors.length - 1;
    return el("rect", { x: 0, y: 0, width: W, height: h, fill: gradient(colors.map((c, i) => [i / n, c])) }, g);
  }

  function stars(g, count, seed, ymax = 700, color = PARCH) {
    const r = rng(seed);
    const items = [];
    for (let i = 0; i < count; i++) {
      const c = el("circle", { cx: r() * W, cy: r() * ymax, r: 1.2 + r() * 2.4, fill: color }, g);
      items.push({ c, ph: r() * 6.28, sp: 0.6 + r() * 1.4, base: 0.3 + r() * 0.6 });
    }
    return (t) => items.forEach((s) => s.c.setAttribute("opacity", s.base * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph))));
  }

  function orb(g, x, y, r, color, glowColor = color, glow = 3.2) {
    const halo = el("circle", { cx: x, cy: y, r: r * glow, fill: gradient([[0, glowColor, 0.55], [1, glowColor, 0]], { radial: true }) }, g);
    const core = el("circle", { cx: x, cy: y, r, fill: color }, g);
    return { halo, core };
  }

  function hills(g, { y, amp, freq, phase = 0, color, seed = 1, bottom = H }) {
    const r = rng(seed);
    const a2 = r() * 6;
    let d = `M -40 ${bottom} `;
    for (let x = -40; x <= W + 40; x += 20) {
      const yy = y + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + a2) * amp * 0.35;
      d += `L ${x} ${yy.toFixed(1)} `;
    }
    d += `L ${W + 40} ${bottom} Z`;
    return el("path", { d, fill: color }, g);
  }

  function groundLine(g, y, color, bottom = H) {
    return el("rect", { x: -40, y, width: W + 80, height: bottom - y, fill: color }, g);
  }

  /* Figura plana sin rostro. Origen en los pies, mira a la derecha. */
  function figure(parent, o = {}) {
    const { robe = "#3a2a20", skin = "#1d1612", head = skin, sleeve = robe, scale = 1, hood = null, band = null, stripes = null, crown = null } = o;
    const root = grp(parent);
    const body = grp(root);
    el("path", { d: "M -30 -232 Q -46 -120 -60 0 L 60 0 Q 46 -120 30 -232 Z", fill: robe }, body);
    el("ellipse", { cx: 0, cy: -228, rx: 40, ry: 17, fill: robe }, body);
    if (stripes) {
      const cid = `cp${++gid}`;
      const cp = el("clipPath", { id: cid }, defs);
      el("path", { d: "M -30 -232 Q -46 -120 -60 0 L 60 0 Q 46 -120 30 -232 Z" }, cp);
      el("ellipse", { cx: 0, cy: -228, rx: 40, ry: 17 }, cp);
      const sg = grp(body, { "clip-path": `url(#${cid})` });
      const n = stripes.length;
      stripes.forEach((c, i) => el("rect", { x: -62 + (124 / n) * i, y: -250, width: 124 / n + 0.6, height: 252, fill: c }, sg));
    }
    if (crown) el("path", { d: "M -28 -292 L -20 -326 L -8 -300 L 0 -332 L 8 -300 L 20 -326 L 28 -292 Z", fill: crown }, body);
    el("rect", { x: -9, y: -252, width: 18, height: 26, fill: skin }, body);
    el("circle", { cx: 0, cy: -272, r: 30, fill: head }, body);
    if (hood) el("path", { d: "M -34 -268 Q -30 -312 0 -314 Q 32 -312 34 -268 Q 20 -286 0 -284 Q -22 -286 -34 -268 Z", fill: hood }, body);
    if (band) el("rect", { x: -31, y: -176, width: 62, height: 14, fill: band, opacity: 0.9 }, body);
    const mkArm = (side) => {
      const a = grp(root, { transform: `translate(${side * 36},-222)` });
      el("line", { x1: 0, y1: 0, x2: 0, y2: 104, stroke: sleeve, "stroke-width": 24, "stroke-linecap": "round" }, a);
      el("circle", { cx: 0, cy: 106, r: 12, fill: skin }, a);
      return a;
    };
    const armL = mkArm(-1);
    const armR = mkArm(1);
    const api = {
      root,
      body,
      armL,
      armR,
      place(x, y, s = 1, flip = 1, rot = 0) {
        root.setAttribute("transform", `translate(${x},${y}) rotate(${rot}) scale(${scale * s * flip},${scale * s})`);
      },
      arms(l, r) {
        armL.setAttribute("transform", `translate(-36,-222) rotate(${l})`);
        armR.setAttribute("transform", `translate(36,-222) rotate(${r})`);
      },
      sway(t, amt = 1.5) {
        body.setAttribute("transform", `skewX(${Math.sin(t * 2) * amt})`);
      },
    };
    api.place(0, 0);
    api.arms(8, -8);
    return api;
  }

  function lion(parent, { color = "#7a5326", mane = "#4a2f14" } = {}) {
    const g = grp(parent);
    const legs = [];
    [-62, -30, 34, 66].forEach((x) => legs.push(el("rect", { x: x - 11, y: -4, width: 22, height: 62, rx: 10, fill: color }, g)));
    el("path", { d: "M -92 -34 Q -118 -78 -96 -118 Q -80 -90 -78 -60 Z", fill: mane }, g);
    el("ellipse", { cx: 0, cy: -8, rx: 100, ry: 46, fill: color }, g);
    el("circle", { cx: 98, cy: -44, r: 56, fill: mane }, g);
    el("circle", { cx: 106, cy: -38, r: 36, fill: color }, g);
    el("circle", { cx: 84, cy: -84, r: 13, fill: color }, g);
    el("circle", { cx: 128, cy: -84, r: 13, fill: color }, g);
    el("ellipse", { cx: 130, cy: -28, rx: 17, ry: 12, fill: "#2b1b0d" }, g);
    el("circle", { cx: 114, cy: -50, r: 4.5, fill: "#f3d98b" }, g);
    return { g, legs };
  }

  function camel(parent, { color = "#6b4a2b" } = {}) {
    const g = grp(parent);
    const legs = [];
    [-48, -26, 28, 50].forEach((x, i) => {
      const l = grp(g, { transform: `translate(${x},20)` });
      el("line", { x1: 0, y1: 0, x2: 0, y2: 78, stroke: i % 2 ? "#563a22" : color, "stroke-width": 13, "stroke-linecap": "round" }, l);
      legs.push(l);
    });
    el("ellipse", { cx: 0, cy: 8, rx: 82, ry: 36, fill: color }, g);
    el("ellipse", { cx: -6, cy: -32, rx: 26, ry: 30, fill: color }, g);
    el("path", { d: "M 56 0 Q 84 -22 80 -86 L 98 -88 Q 104 -20 74 18 Z", fill: color }, g);
    el("ellipse", { cx: 108, cy: -92, rx: 28, ry: 15, fill: color }, g);
    el("path", { d: "M -80 -4 Q -100 20 -92 46", stroke: color, "stroke-width": 8, fill: "none", "stroke-linecap": "round" }, g);
    return { g, legs };
  }

  function angel(parent, { robe = "#fff3d4", wing = "#ffe9b0" } = {}) {
    const g = grp(parent);
    const wings = grp(g);
    ["-1", "1"].forEach((s) => {
      const w = grp(wings, { transform: `scale(${s},1)` });
      el("path", { d: "M 20 -210 Q 150 -330 250 -230 Q 210 -190 190 -160 Q 150 -190 120 -140 Q 90 -150 70 -100 Q 40 -120 20 -60 Z", fill: wing, opacity: 0.94 }, w);
    });
    const f = figure(g, { robe, skin: "#fff7e2", sleeve: robe });
    return { g, wings, f };
  }

  function palm(parent, x, y, s = 1, color = "#1d3a28") {
    const g = grp(parent, { transform: `translate(${x},${y}) scale(${s})` });
    el("path", { d: "M -8 0 Q 14 -120 -4 -240 L 8 -240 Q 28 -120 10 0 Z", fill: "#4a3320" }, g);
    const fronds = [];
    [-70, -35, 0, 35, 70].forEach((a) => {
      const fr = grp(g, { transform: `translate(2,-240) rotate(${a})` });
      el("path", { d: "M 0 0 Q 10 -70 4 -140 Q -16 -70 0 0 Z", fill: color }, fr);
      fronds.push(fr);
    });
    return { g, fronds };
  }

  function rays(parent, x, y, n, len, color, op = 0.18) {
    const g = grp(parent);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const w = 0.07;
      el("path", { d: `M ${x} ${y} L ${x + Math.cos(a - w) * len} ${y + Math.sin(a - w) * len} L ${x + Math.cos(a + w) * len} ${y + Math.sin(a + w) * len} Z`, fill: color, opacity: op }, g);
    }
    return g;
  }

  /* Recorta un grupo a un rectángulo (para figuras que salen de un foso). */
  function clip(g, x, y, w, h) {
    const cid = `cp${++gid}`;
    const cp = el("clipPath", { id: cid }, defs);
    el("rect", { x, y, width: w, height: h }, cp);
    g.setAttribute("clip-path", `url(#${cid})`);
  }

  function bird(parent, color = "#2b2230") {
    const g = grp(parent);
    const l = el("path", { d: "M 0 0 Q -18 -16 -40 -6 Q -20 -4 0 6 Z", fill: color }, g);
    const r = el("path", { d: "M 0 0 Q 18 -16 40 -6 Q 20 -4 0 6 Z", fill: color }, g);
    return { g, flap(t, ph = 0) { const k = Math.sin(t * 9 + ph); l.setAttribute("transform", `scale(1,${0.4 + 0.6 * k})`); r.setAttribute("transform", `scale(1,${0.4 + 0.6 * k})`); } };
  }

  function vignette(parent, h = H) {
    el("rect", { x: 0, y: 0, width: W, height: h, fill: gradient([[0, NIGHT, 0], [0.7, NIGHT, 0.12], [1, NIGHT, 0.55]], { radial: true, cx: 0.5, cy: 0.42, r: 0.75 }) }, parent);
  }

  /* ───────── texto: paginación literal y subtítulos ───────── */
  const measureCtx = document.createElement("canvas").getContext("2d");
  function wrapWords(words, font, maxW) {
    measureCtx.font = font;
    const lines = [];
    let cur = [];
    let curW = 0;
    const space = measureCtx.measureText(" ").width;
    words.forEach((w) => {
      const ww = measureCtx.measureText(w).width;
      if (cur.length && curW + space + ww > maxW) {
        lines.push(cur);
        cur = [];
        curW = 0;
      }
      curW += (cur.length ? space : 0) + ww;
      cur.push(w);
    });
    if (cur.length) lines.push(cur);
    return lines;
  }

  /* Divide el versículo en páginas sin alterar ni una palabra; prefiere cortar tras puntuación. */
  function paginate(text, maxWords = 14) {
    const words = text.split(/\s+/).filter(Boolean);
    const n = Math.max(1, Math.ceil(words.length / maxWords));
    const breaks = [];
    for (let i = 1; i < n; i++) {
      let b = Math.round((i * words.length) / n);
      for (let d = 0; d <= 3; d++) {
        const cand = [b - d, b + d].find((c) => c > (breaks[breaks.length - 1] ?? 0) && c < words.length && /[,;:.?!¿¡]$/.test(words[c - 1]));
        if (cand) {
          b = cand;
          break;
        }
      }
      breaks.push(b);
    }
    const pages = [];
    let prev = 0;
    [...breaks, words.length].forEach((b) => {
      pages.push(words.slice(prev, b));
      prev = b;
    });
    return pages.filter((p) => p.length);
  }

  /* ───────── línea de tiempo ───────── */
  const WPS = 2.95; // palabras por segundo (lectura cómoda en pantalla)
  function buildTimeline(story) {
    const items = [];
    let t = 0;
    const push = (kind, dur, extra) => {
      items.push({ kind, start: t, dur, ...extra });
      t += dur;
    };
    push("title", story.titleDur ?? 2.6, {});
    story.shots.forEach((shot, index) => {
      // «verses»: Escritura literal (con referencia). «lines»: narración propia de Santuario (sin referencia, nunca Escritura).
      const verses = (shot.verses ?? []).map((k) => ({ key: k, ...window.VERSES[k] }));
      (shot.lines ?? []).forEach((txt, li) => verses.push({ key: `line${index}.${li}`, es: txt, label: null }));
      const pages = [];
      let words = 0;
      verses.forEach((v) => {
        paginate(v.es).forEach((p) => {
          pages.push({ words: p, ref: v.label, gid: v.key });
          words += p.length;
        });
      });
      const dur = words / WPS + 1.4;
      let pt = 0.5;
      const readable = dur - 1.0;
      pages.forEach((p) => {
        p.start = pt;
        p.dur = (p.words.length / words) * (readable - 0.4);
        pt += p.dur;
      });
      push("shot", dur, { shot, pages, index });
    });
    push("end", story.endDur ?? 4.2, {});
    return { items, total: t };
  }

  /* ───────── escena ───────── */
  const FONT_SERIF = '600 54px "Playfair Display", "DejaVu Serif", serif';
  let svg;
  let layers;
  let tl;
  let story;
  const shotCtl = [];

  function setup(st) {
    story = st;
    document.body.style.margin = "0";
    svg = el("svg", { xmlns: NS, width: W, height: H, viewBox: `0 0 ${W} ${H}` }, document.body);
    defs = el("defs", null, svg);
    el("rect", { width: W, height: H, fill: NIGHT }, svg);
    layers = { shots: grp(svg), ui: grp(svg) };
    tl = buildTimeline(st);

    tl.items.forEach((it) => {
      if (it.kind !== "shot") return;
      const g = grp(layers.shots, { display: "none" });
      const artG = grp(g);
      const update = it.shot.build(artG, { W, H, helpers: H_ });
      // panel inferior para subtítulos
      el("rect", { x: 0, y: 1130, width: W, height: 790, fill: gradient([[0, NIGHT, 0], [0.38, NIGHT, 0.78], [1, NIGHT, 0.94]]) }, g);
      const cap = grp(g);
      it.ctl = { g, update, cap };
      shotCtl.push(it);
    });

    // tarjetas
    it_title(layers.ui);
    it_end(layers.ui);
    // marca discreta
    const brand = grp(layers.ui);
    const bt = el("text", { x: 540, y: 120, "text-anchor": "middle", fill: GOLD, "font-family": "Inter, sans-serif", "font-size": 30, "letter-spacing": 8, "font-weight": 600 }, brand);
    bt.textContent = "SANTUARIO BÍBLICO";
    layers.brand = brand;
  }

  let titleG;
  let endG;
  function it_title(parent) {
    titleG = grp(parent);
    const bgFill = gradient([[0, "#0C0A09"], [0.55, "#1a130d"], [1, "#2b1d10"]]);
    el("rect", { width: W, height: H, fill: bgFill }, titleG);
    const o = orb(titleG, 540, 760, 70, "#f3d98b", "#C9A25B", 4.5);
    titleG.__orb = o;
    titleG.__stars = stars(titleG, 70, 9, 900);
    rays(titleG, 540, 760, 14, 900, "#C9A25B", 0.07);
    const kicker = el("text", { x: 540, y: 1010, "text-anchor": "middle", fill: GOLD, "font-family": "Inter, sans-serif", "font-size": 34, "letter-spacing": 10, "font-weight": 600 }, titleG);
    kicker.textContent = story.kicker.toUpperCase();
    titleG.__kicker = kicker;
    const lines = story.title.split("\n");
    titleG.__title = lines.map((ln, i) => {
      const t = el("text", { x: 540, y: 1150 + i * 120, "text-anchor": "middle", fill: PARCH, "font-family": '"Playfair Display", serif', "font-size": 112, "font-weight": 600 }, titleG);
      t.textContent = ln;
      return t;
    });
    const sub = el("text", { x: 540, y: 1150 + lines.length * 120 + 30, "text-anchor": "middle", fill: "#d8cdb9", "font-family": "Inter, sans-serif", "font-size": 36 }, titleG);
    sub.textContent = story.subtitle;
    titleG.__sub = sub;
  }

  function it_end(parent) {
    endG = grp(parent);
    el("rect", { width: W, height: H, fill: gradient([[0, "#0C0A09"], [1, "#24180d"]]) }, endG);
    endG.__stars = stars(endG, 60, 21, 1200);
    orb(endG, 540, 520, 54, "#f3d98b", "#C9A25B", 4.2);
    const mk = (y, txt, size, fill, family, weight = 600, ls = 0, style = "normal") => {
      const t = el("text", { x: 540, y, "text-anchor": "middle", fill, "font-family": family, "font-size": size, "font-weight": weight, "letter-spacing": ls, "font-style": style }, endG);
      t.textContent = txt;
      return t;
    };
    endG.__a = mk(800, story.next.kicker.toUpperCase(), 34, GOLD, "Inter, sans-serif", 600, 8);
    endG.__b = story.next.title.split("\n").map((ln, i) => mk(920 + i * 100, ln, 84, PARCH, '"Playfair Display", serif'));
    const base = 920 + story.next.title.split("\n").length * 100 + 40;
    endG.__c = mk(base + 60, "Lee la historia completa en Santuario Bíblico", 40, "#e8dfcf", "Inter, sans-serif", 500);
    endG.__d = mk(base + 120, "Link en la bio", 40, GOLD, "Inter, sans-serif", 600, 2);
    endG.__h = mk(base + 190, "@santuariobiblico", 44, "#f3d98b", "Inter, sans-serif", 600, 1);
    endG.__e = mk(1640, "Biblia Reina-Valera 1909 · texto íntegro y verificado", 28, "#a99f8d", "Inter, sans-serif", 400);
  }

  function drawCaption(it, lt) {
    const cap = it.ctl.cap;
    const page = it.pages.find((p) => lt >= p.start && lt < p.start + p.dur) || (lt >= it.pages[it.pages.length - 1].start ? it.pages[it.pages.length - 1] : null);
    if (cap.__page === page) {
      // sólo actualizar color de palabras
    } else {
      cap.__page = page;
      while (cap.firstChild) cap.removeChild(cap.firstChild);
      cap.__words = [];
      if (page) {
        const lines = wrapWords(page.words, FONT_SERIF, 900);
        const lineH = 78;
        const blockH = lines.length * lineH;
        const y0 = 1440;
        let idx = 0;
        lines.forEach((ln, li) => {
          const t = el("text", { x: 540, y: y0 + li * lineH, "text-anchor": "middle", "font-family": '"Playfair Display", "DejaVu Serif", serif', "font-size": 54, "font-weight": 600, style: "white-space:pre" }, cap);
          ln.forEach((w, wi) => {
            const ts = el("tspan", { fill: "rgba(250,246,240,0.42)" }, t);
            ts.textContent = wi < ln.length - 1 ? w + " " : w;
            cap.__words.push(ts);
            idx++;
          });
        });
        if (page.ref) {
        const ref = el("text", { x: 540, y: 1340, "text-anchor": "middle", fill: GOLD, "font-family": "Inter, sans-serif", "font-size": 28, "letter-spacing": 6, "font-weight": 600 }, cap);
        ref.textContent = page.ref.toUpperCase();
        cap.__ref = ref;
        }
      }
    }
    if (page && cap.__words) {
      const local = clamp((lt - page.start) / Math.max(0.01, page.dur), 0, 1.2);
      const n = cap.__words.length;
      cap.__words.forEach((w, i) => {
        const on = local * 1.0 * n >= i + 0.2;
        w.setAttribute("fill", on ? PARCH : "rgba(250,246,240,0.38)");
      });
      const a = clamp((lt - page.start) / 0.3);
      cap.setAttribute("opacity", ease(a));
      cap.setAttribute("transform", `translate(0,${(1 - ease(a)) * 18})`);
    } else {
      cap.setAttribute("opacity", 0);
    }
  }

  function setFrame(t) {
    t = Math.min(t, tl.total - 0.001);
    const it = tl.items.find((i) => t >= i.start && t < i.start + i.dur);
    const lt = t - it.start;
    titleG.setAttribute("display", it.kind === "title" ? "inline" : "none");
    endG.setAttribute("display", it.kind === "end" ? "inline" : "none");
    layers.brand.setAttribute("opacity", it.kind === "shot" ? 0.85 : 0);
    shotCtl.forEach((s) => s.ctl.g.setAttribute("display", s === it ? "inline" : "none"));

    if (it.kind === "title") {
      const a = ease(seg(lt, 0, 0.8));
      const out = 1 - ease(seg(lt, it.dur - 0.5, it.dur));
      titleG.setAttribute("opacity", a * out);
      titleG.__stars(t);
      titleG.__kicker.setAttribute("opacity", ease(seg(lt, 0.3, 1.1)));
      titleG.__title.forEach((tt, i) => {
        const k = ease(seg(lt, 0.5 + i * 0.2, 1.4 + i * 0.2));
        tt.setAttribute("opacity", k);
        tt.setAttribute("transform", `translate(0,${(1 - k) * 30})`);
      });
      titleG.__sub.setAttribute("opacity", ease(seg(lt, 1.3, 2.0)));
    } else if (it.kind === "end") {
      const a = ease(seg(lt, 0, 0.6));
      endG.setAttribute("opacity", a);
      endG.__stars(t);
      [endG.__a, ...endG.__b, endG.__c, endG.__d, endG.__h, endG.__e].forEach((n, i) => n.setAttribute("opacity", ease(seg(lt, 0.3 + i * 0.25, 0.9 + i * 0.25))));
    } else {
      const g = it.ctl.g;
      const inA = ease(seg(lt, 0, 0.55));
      const outA = 1 - ease(seg(lt, it.dur - 0.45, it.dur));
      g.setAttribute("opacity", inA * outA);
      it.ctl.update(lt / it.dur, lt, it.dur);
      drawCaption(it, lt);
    }
  }

  /* Re-ajusta la línea de tiempo a la duración real de la voz (segundos por página, en orden).
   * Devuelve el inicio absoluto de cada página para colocar el audio. */
  function retime(durs) {
    let k = 0;
    let t = 0;
    const starts = [];
    tl.items.forEach((it) => {
      it.start = t;
      if (it.kind === "shot") {
        let pt = story.lead ?? 0.4;
        it.pages.forEach((p) => {
          const d = durs[k++];
          p.start = pt;
          p.dur = d + 0.1;
          starts.push(it.start + pt);
          pt += p.dur;
        });
        it.dur = pt + (story.tail ?? 0.55);
      }
      t += it.dur;
    });
    tl.total = t;
    window.__total = t;
    return { total: t, starts };
  }

  const H_ = { getDefs: () => defs, el, grp, gradient, sky, stars, orb, hills, groundLine, figure, lion, camel, angel, palm, rays, vignette, clip, bird, clamp, ease, easeOut, lerp, seg, rng, GOLD, PARCH, NIGHT, W, H };

  window.__video = {
    ready: async (st) => {
      await document.fonts.load('600 54px "Playfair Display"');
      await document.fonts.ready;
      setup(st);
      window.__total = tl.total;
      return tl.total;
    },
    setFrame,
    retime,
    pagesText: () => tl.items.filter((i) => i.kind === "shot").flatMap((i) => i.pages.map((p) => ({ ref: p.ref, gid: p.gid, text: p.words.join(" ") }))),
    info: () => tl.items.map((i) => ({ kind: i.kind, start: +i.start.toFixed(2), dur: +i.dur.toFixed(2) })),
  };
})();
