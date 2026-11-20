/* Kit de personajes SVG de Santuario Bíblico: caras con expresión, personaje sentado de perfil y grano de papel.
 * Se carga antes de cada historia (render.mjs). Todas las funciones reciben H_ (los helpers del motor). */
(() => {
  const SKINS = {
    medio: ["#f2ad6b", "#d9793f"],
    claro: ["#f6c79a", "#e2a06c"],
    moreno: ["#c98354", "#a35f35"],
    nina: ["#f7c9a0", "#e6a373"],
    mayor: ["#e9b58a", "#c98a5c"],
  };

  function grain(g, H_, id) {
    const { el, getDefs } = H_;
    const defs = getDefs();
    const f = el("filter", { id: `gr${id}`, x: 0, y: 0, width: "100%", height: "100%" }, defs);
    el("feTurbulence", { type: "fractalNoise", baseFrequency: 0.85, numOctaves: 2, seed: 5 + id }, f);
    el("feColorMatrix", { type: "matrix", values: "0 0 0 0 0.16  0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 0.95 -0.3" }, f);
    const pat = el("pattern", { id: `gp${id}`, width: 300, height: 300, patternUnits: "userSpaceOnUse" }, defs);
    el("rect", { width: 300, height: 300, filter: `url(#gr${id})` }, pat);
    el("rect", { width: 1080, height: 1920, fill: `url(#gp${id})`, opacity: 0.5, style: "mix-blend-mode:multiply" }, g);
    el("rect", { width: 1080, height: 1920, fill: H_.gradient([[0.5, "#160c20", 0], [1, "#160c20", 0.6]], { radial: true, cx: 0.5, cy: 0.45, r: 0.8 }) }, g);
  }

  /* Cabellos de frente (cara de frente). Devuelven {back, front} como listas de [d, fill]. */
  function hairFront(style, color, hi) {
    const cap = `M180 700 Q150 330 420 310 Q760 280 900 640 Q820 470 640 470 Q380 470 300 650 Q250 700 180 700 Z`;
    switch (style) {
      case "short":
        return { back: [], front: [[cap, color], ["M230 470 L190 330 L330 420 L360 270 L460 400 L560 250 L610 400 L760 280 L760 440 Z", color]], shine: "M300 440 Q330 380 420 380" };
      case "beard":
        return { back: [], front: [[cap, color], ["M230 470 L210 360 L340 430 L380 300 L480 410 L560 290 L620 410 L760 320 L760 440 Z", color]], shine: "M300 440 Q330 380 420 380" };
      case "long":
        return {
          back: [["M165 640 Q105 1100 250 1390 L430 1340 L440 720 Z", color], ["M915 640 Q975 1100 830 1390 L650 1340 L640 720 Z", color]],
          front: [["M175 720 Q140 320 540 300 Q940 320 905 720 Q870 520 720 470 Q620 610 540 530 Q450 610 360 470 Q210 520 175 720 Z", color]],
          shine: "M300 450 Q380 380 480 400",
        };
      case "ponytail":
        return {
          back: [["M860 470 Q1030 520 1010 900 Q990 1040 925 960 Q945 760 850 640 Z", color]],
          front: [["M175 720 Q145 320 540 300 Q935 320 905 700 Q840 500 650 470 Q480 520 360 600 Q250 700 175 720 Z", color]],
          shine: "M310 450 Q390 390 500 400",
        };
      case "bun":
        return {
          back: [],
          front: [["M190 690 Q170 360 540 335 Q910 360 890 690 Q850 520 700 485 Q540 545 380 485 Q230 520 190 690 Z", color], ["M455 270 A85 85 0 1 1 625 270 A85 85 0 1 1 455 270 Z", color]],
          shine: "M310 470 Q400 410 520 420",
        };
      case "pigtails":
        return {
          back: [["M60 520 Q-40 640 70 830 Q170 900 210 760 Q210 600 150 500 Z", color], ["M1020 520 Q1120 640 1010 830 Q910 900 870 760 Q870 600 930 500 Z", color]],
          front: [["M180 720 Q150 340 540 320 Q930 340 900 720 Q850 520 700 480 Q540 580 380 480 Q230 520 180 720 Z", color], ["M120 610 A38 38 0 1 1 196 610 A38 38 0 1 1 120 610 Z", "#e0457b"], ["M884 610 A38 38 0 1 1 960 610 A38 38 0 1 1 884 610 Z", "#e0457b"]],
          shine: "M320 450 Q400 400 520 410",
        };
      default:
        return { back: [], front: [[cap, color]], shine: "" };
    }
  }

  /* Cara de frente con expresiones. opts: skin, blush, hair {style,color,hi}, brow, shirt [a,b], collar, glasses, stubble, wrinkles, child, body. */
  function face(parent, H_, opts = {}) {
    const { el, grp, gradient, lerp, clamp } = H_;
    const skinPair = opts.skin ?? SKINS.medio;
    const skin = gradient([[0, skinPair[0]], [1, skinPair[1]]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    const hairC = opts.hair?.color ?? "#2c2250";
    const browC = opts.brow ?? hairC;
    const child = !!opts.child;
    const root = grp(parent);
    if (opts.body !== false) {
      const sh = opts.shirt ?? ["#f2b83a", "#d88f1c"];
      const shirt = gradient([[0, sh[0]], [1, sh[1]]], { x1: 0, y1: 0, x2: 1, y2: 1 });
      const hf0 = hairFront(opts.hair?.style ?? "short", hairC, opts.hair?.hi);
      hf0.back.forEach(([d, f]) => el("path", { d, fill: f }, root));
      el("path", { d: "M40 1920 L90 1500 Q200 1370 540 1390 Q880 1370 990 1500 L1040 1920 Z", fill: shirt }, root);
      el("path", { d: "M430 1395 L540 1570 L650 1395 Q540 1345 430 1395 Z", fill: opts.collar ?? "#c97d12" }, root);
      el("rect", { x: 470, y: 1120, width: 140, height: 300, fill: skinPair[1] }, root);
    }
    const head = grp(root);
    const hf = hairFront(opts.hair?.style ?? "short", hairC, opts.hair?.hi);
    if (opts.body === false) hf.back.forEach(([d, f]) => el("path", { d, fill: f }, head));
    const ear = child ? skinPair[1] : "#df8847";
    el("ellipse", { cx: 190, cy: 860, rx: 62, ry: 102, fill: ear }, head);
    el("ellipse", { cx: 890, cy: 860, rx: 62, ry: 102, fill: ear }, head);
    el("ellipse", { cx: 540, cy: 820, rx: child ? 350 : 360, ry: child ? 410 : 440, fill: skin }, head);
    el("path", { d: "M720 420 Q940 570 905 910 Q870 1180 620 1245 Q865 1050 832 760 Q812 560 720 420 Z", fill: "#b8581f", opacity: 0.28 }, head);
    hf.front.forEach(([d, f]) => el("path", { d, fill: f }, head));
    if (hf.shine) el("path", { d: hf.shine, stroke: opts.hair?.hi ?? "#463a80", "stroke-width": 8, fill: "none", opacity: 0.6, "stroke-linecap": "round" }, head);

    const eyeR = child ? 1.18 : 1;
    const eyes = [400, 680].map((cx) => {
      const g = grp(head);
      const cid = `eye${cx}${Math.round(Math.random() * 1e6)}`;
      const cp = el("clipPath", { id: cid }, H_.getDefs());
      el("ellipse", { cx, cy: 740, rx: 75 * eyeR, ry: 70 * eyeR }, cp);
      el("ellipse", { cx, cy: 740, rx: 75 * eyeR, ry: 70 * eyeR, fill: "#fffaf0" }, g);
      const inner = grp(g, { "clip-path": `url(#${cid})` });
      const pupil = el("circle", { cx, cy: 745, r: 40 * eyeR, fill: opts.eyeColor ?? "#241a3a" }, inner);
      const shine = el("circle", { cx: cx - 14, cy: 731, r: 13 * eyeR, fill: "#fff" }, inner);
      const lid = el("path", { fill: skinPair[0] }, inner);
      const lash = el("path", { stroke: "#241a3a", "stroke-width": 10, fill: "none", "stroke-linecap": "round" }, g);
      return { cx, pupil, shine, lid, lash };
    });
    if (opts.glasses) {
      [400, 680].forEach((cx) => el("circle", { cx, cy: 740, r: 100, fill: "#ffffff", "fill-opacity": 0.1, stroke: "#3a2a2a", "stroke-width": 11 }, head));
      el("path", { d: "M500 735 Q540 705 580 735", stroke: "#3a2a2a", "stroke-width": 11, fill: "none" }, head);
      el("path", { d: "M300 735 L215 720 M780 735 L865 720", stroke: "#3a2a2a", "stroke-width": 10, fill: "none" }, head);
    }
    const dark = skinPair[1];
    el("path", { d: "M335 815 Q400 850 465 815", stroke: "#b8581f", "stroke-width": 9, fill: "none", opacity: child ? 0.25 : 0.55 }, head);
    el("path", { d: "M615 815 Q680 850 745 815", stroke: "#b8581f", "stroke-width": 9, fill: "none", opacity: child ? 0.25 : 0.55 }, head);
    el("path", { d: "M548 770 Q510 890 562 925 Q600 930 610 902", stroke: "#b8581f", "stroke-width": child ? 9 : 12, fill: "none", "stroke-linecap": "round", opacity: 0.7 }, head);
    el("circle", { cx: 300, cy: 935, r: child ? 78 : 62, fill: opts.blush ?? "#e8553a", opacity: child ? 0.32 : 0.26 }, head);
    el("circle", { cx: 790, cy: 935, r: child ? 78 : 62, fill: opts.blush ?? "#e8553a", opacity: child ? 0.32 : 0.26 }, head);
    if (!opts.noFreckles) [[620, 862], [652, 884], [692, 864], [420, 884], [462, 898], [350, 880]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 5, fill: "#a94a1c", opacity: 0.6 }, head));
    if (opts.stubble) {
      el("path", { d: "M250 900 Q300 1180 540 1230 Q780 1180 830 900 Q760 1050 540 1090 Q320 1050 250 900 Z", fill: "#2c2250", opacity: 0.1 }, head);
      for (let i = 0; i < 40; i++) el("circle", { cx: 330 + ((i * 71) % 420), cy: 1010 + ((i * 53) % 190), r: 3, fill: "#2c2250", opacity: 0.28 }, head);
    }
    if (opts.wrinkles) {
      ["M330 530 Q540 495 750 530", "M350 575 Q540 545 730 575"].forEach((d) => el("path", { d, stroke: dark, "stroke-width": 8, fill: "none", opacity: 0.35, "stroke-linecap": "round" }, head));
      ["M262 760 L225 740 M262 790 L222 790", "M818 760 L855 740 M818 790 L858 790"].forEach((d) => el("path", { d, stroke: dark, "stroke-width": 7, fill: "none", opacity: 0.4, "stroke-linecap": "round" }, head));
      el("path", { d: "M395 930 Q370 1000 410 1050 M685 930 Q710 1000 670 1050", stroke: dark, "stroke-width": 7, fill: "none", opacity: 0.35, "stroke-linecap": "round" }, head);
    }
    const browL = el("path", { stroke: browC, "stroke-width": child ? 24 : 32, fill: "none", "stroke-linecap": "round" }, head);
    const browR = el("path", { stroke: browC, "stroke-width": child ? 24 : 32, fill: "none", "stroke-linecap": "round" }, head);
    const mouth = el("path", { stroke: "#7a2e1a", "stroke-width": 16, fill: "none", "stroke-linecap": "round" }, head);
    const tear = el("path", { d: "M0 0 Q-14 26 0 40 Q14 26 0 0 Z", fill: "#bfe4ff", opacity: 0 }, head);
    const glow = el("path", { d: "M205 520 Q145 760 205 1000", stroke: "#ffd58a", "stroke-width": 36, fill: "none", opacity: 0, "stroke-linecap": "round", filter: "blur(14px)" }, head);

    return {
      root,
      set({ worry = 0.5, lid = 0, look = [0, 0], mouth: m = -0.4, tear: tr = 0, tilt = 0, warm = 0, droop = 0.15 }) {
        const w = clamp(worry);
        const oy = lerp(628, 668, w);
        const iy = lerp(618, 560, w);
        const cy = lerp(588, 572, w);
        browL.setAttribute("d", `M300 ${oy} Q385 ${cy} 472 ${iy}`);
        browR.setAttribute("d", `M780 ${oy} Q695 ${cy} 608 ${iy}`);
        eyes.forEach((e) => {
          e.pupil.setAttribute("cx", e.cx + look[0] * 30);
          e.pupil.setAttribute("cy", 745 + look[1] * 26);
          e.shine.setAttribute("cx", e.cx - 14 + look[0] * 30);
          e.shine.setAttribute("cy", 731 + look[1] * 26);
          const cover = clamp(Math.max(lid, droop));
          const yb = 660 + cover * 160;
          e.lid.setAttribute("d", `M${e.cx - 100} 600 L${e.cx + 100} 600 L${e.cx + 100} ${yb} Q${e.cx} ${yb + (cover > 0.5 ? 18 : 28)} ${e.cx - 100} ${yb} Z`);
          e.lash.setAttribute("d", `M${e.cx - 76} ${yb} Q${e.cx} ${yb + (cover > 0.5 ? 18 : 28)} ${e.cx + 76} ${yb}`);
          e.lash.setAttribute("opacity", cover > 0.04 ? 0.9 : 0);
        });
        mouth.setAttribute("d", `M452 1058 Q540 ${1058 + 58 * m} 628 1058`);
        tear.setAttribute("opacity", tr > 0 ? Math.min(1, tr * 3) * (1 - Math.max(0, tr - 0.85) * 6) : 0);
        tear.setAttribute("transform", `translate(352,${815 + tr * 150})`);
        glow.setAttribute("opacity", warm * 0.8);
        head.setAttribute("transform", `rotate(${tilt},540,1250)`);
      },
    };
  }

  /* Persona sentada de perfil (mira a la izquierda). opts: skin, hair {style: short|long|bun|ponytail, color}, shirt [a,b], pants, shoe. */
  function seated(parent, H_, opts = {}) {
    const { el, grp, gradient } = H_;
    const skinPair = opts.skin ?? SKINS.medio;
    const skin = gradient([[0, skinPair[0]], [1, skinPair[1]]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    const sh = opts.shirt ?? ["#f2b83a", "#d88f1c"];
    const shirt = gradient([[0, sh[0]], [1, sh[1]]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    const hairC = opts.hair?.color ?? "#2c2250";
    const pants = opts.pants ?? ["#2b3070", "#353b82"];
    const root = grp(parent);
    el("path", { d: "M830 1250 Q700 1235 560 1290 L545 1385 Q690 1340 840 1352 Z", fill: pants[0] }, root);
    el("path", { d: "M560 1290 L520 1530 L610 1535 L640 1330 Z", fill: pants[1] }, root);
    el("path", { d: "M480 1525 Q470 1480 520 1520 L640 1525 Q665 1555 640 1580 L470 1580 Q440 1560 480 1525 Z", fill: opts.shoe ?? "#6e4023" }, root);
    const torso = grp(root);
    el("path", { d: "M820 1240 Q880 1100 800 980 Q740 900 690 975 Q650 1080 700 1200 Q730 1260 820 1260 Z", fill: shirt }, torso);
    el("path", { d: "M760 1000 Q700 1120 650 1240", stroke: sh[1], "stroke-width": 70, fill: "none", "stroke-linecap": "round" }, torso);
    el("path", { d: "M650 1240 Q600 1320 585 1385", stroke: sh[0], "stroke-width": 58, fill: "none", "stroke-linecap": "round" }, torso);
    el("circle", { cx: 582, cy: 1405, r: 38, fill: skinPair[1] }, torso);
    const head = grp(torso);
    const style = opts.hair?.style ?? "short";
    if (style === "long" || style === "ponytail") el("path", { d: style === "long" ? "M20 -110 Q150 -20 120 190 L30 170 Q60 40 0 -60 Z" : "M30 -120 Q170 -60 150 70 Q120 120 90 70 Q110 -10 40 -70 Z", fill: hairC }, head);
    el("ellipse", { cx: 0, cy: 0, rx: 98, ry: 112, fill: skin }, head);
    if (style === "short") {
      el("path", { d: "M-102 -10 Q-110 -150 14 -152 Q122 -146 104 -24 Q60 -92 -22 -84 Q-72 -72 -102 -10 Z", fill: hairC }, head);
      el("path", { d: "M-70 -112 L-104 -172 L-42 -138 L-32 -194 L12 -142 L52 -184 L62 -128 Z", fill: hairC }, head);
    } else if (style === "bun") {
      el("path", { d: "M-104 -10 Q-112 -150 10 -154 Q122 -148 106 -24 Q60 -92 -22 -86 Q-72 -74 -104 -10 Z", fill: hairC }, head);
      el("circle", { cx: 40, cy: -150, r: 44, fill: hairC }, head);
    } else {
      el("path", { d: "M-104 -10 Q-114 -156 10 -158 Q126 -150 108 -20 Q64 -96 -22 -90 Q-74 -78 -104 -10 Z", fill: hairC }, head);
    }
    el("ellipse", { cx: 62, cy: 10, rx: 22, ry: 34, fill: skinPair[1] }, head);
    el("path", { d: "M-96 12 Q-126 30 -100 52", fill: skinPair[1] }, head);
    el("path", { d: "M-70 -16 Q-52 -6 -34 -16", stroke: "#241a3a", "stroke-width": 7, fill: "none", "stroke-linecap": "round" }, head);
    el("path", { d: "M-78 -40 Q-52 -52 -26 -38", stroke: hairC, "stroke-width": 11, fill: "none", "stroke-linecap": "round" }, head);
    el("path", { d: "M-70 58 Q-48 66 -28 56", stroke: "#7a2e1a", "stroke-width": 7, fill: "none", "stroke-linecap": "round" }, head);
    if (opts.glasses) el("path", { d: "M-84 -8 L-40 -8 M-84 -8 L-60 -22", stroke: "#3a2a2a", "stroke-width": 6, fill: "none" }, head);
    return {
      root,
      set({ lift = 0, breathe = 0 }) {
        const rot = -22 + lift * 32;
        head.setAttribute("transform", `translate(${690 - lift * 8},${960 - lift * 40}) rotate(${rot})`);
        torso.setAttribute("transform", `translate(0,${breathe * 5}) rotate(${-lift * 3},800,1250)`);
      },
    };
  }

  /* Degradado vertical cuyos colores se pueden cambiar cada fotograma sin crear nodos nuevos. */
  let vgUid = 0;
  function vgrad(H_, a, b) {
    const { el, getDefs } = H_;
    const id = `vg${++vgUid}`;
    const lg = el("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, getDefs());
    const s0 = el("stop", { offset: 0, "stop-color": a }, lg);
    const s1 = el("stop", { offset: 1, "stop-color": b }, lg);
    return {
      fill: `url(#${id})`,
      set(x, y) {
        s0.setAttribute("stop-color", x);
        s1.setAttribute("stop-color", y);
      },
    };
  }
  function mix(a, b, t) {
    const pa = a.match(/\w\w/g).map((x) => parseInt(x, 16));
    const pb = b.match(/\w\w/g).map((x) => parseInt(x, 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  window.KIT = { SKINS, grain, face, seated, vgrad, mix };
})();
