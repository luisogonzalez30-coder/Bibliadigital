/* «Las tres de la mañana» — piloto de historia moderna en SVG.
 * La narración (lines) es de Santuario Bíblico y es ficción; las palabras de Jesús NO se inventan: se muestran solo como
 * Escritura literal (Mateo 11:28, RV1909, leída del catálogo). Jesús aparece únicamente como luz, sin rostro. */
(() => {
  window.STORIES = window.STORIES || {};

  const SKIN_A = "#f2ad6b";
  const SKIN_B = "#d9793f";
  const HAIR = "#2c2250";

  function grain(g, H_, id) {
    const { el, getDefs } = H_;
    const defs = getDefs();
    const f = el("filter", { id: `gr${id}`, x: 0, y: 0, width: "100%", height: "100%" }, defs);
    el("feTurbulence", { type: "fractalNoise", baseFrequency: 0.85, numOctaves: 2, seed: 5 + id }, f);
    el("feColorMatrix", { type: "matrix", values: "0 0 0 0 0.16  0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 0.95 -0.3" }, f);
    const pat = el("pattern", { id: `gp${id}`, width: 300, height: 300, patternUnits: "userSpaceOnUse" }, defs);
    el("rect", { width: 300, height: 300, filter: `url(#gr${id})` }, pat);
    el("rect", { width: 1080, height: 1920, fill: `url(#gp${id})`, opacity: 0.55, style: "mix-blend-mode:multiply" }, g);
    el("rect", { width: 1080, height: 1920, fill: H_.gradient([[0.5, "#160c20", 0], [1, "#160c20", 0.6]], { radial: true, cx: 0.5, cy: 0.45, r: 0.8 }) }, g);
  }

  /* ───────── Diego en primer plano: cara con expresiones ───────── */
  function faceRig(parent, H_) {
    const { el, grp, gradient, lerp, clamp } = H_;
    const skin = gradient([[0, SKIN_A], [1, SKIN_B]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    const shirt = gradient([[0, "#f2b83a"], [1, "#d88f1c"]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    const root = grp(parent);
    // cuerpo y cuello
    el("path", { d: "M40 1920 L90 1500 Q200 1370 540 1390 Q880 1370 990 1500 L1040 1920 Z", fill: shirt }, root);
    el("path", { d: "M430 1395 L540 1570 L650 1395 Q540 1345 430 1395 Z", fill: "#c97d12" }, root);
    el("rect", { x: 470, y: 1120, width: 140, height: 300, fill: "#d77b3d" }, root);
    const head = grp(root);
    // orejas y cabeza
    el("ellipse", { cx: 190, cy: 860, rx: 62, ry: 102, fill: "#df8847" }, head);
    el("ellipse", { cx: 890, cy: 860, rx: 62, ry: 102, fill: "#df8847" }, head);
    el("ellipse", { cx: 540, cy: 820, rx: 360, ry: 440, fill: skin }, head);
    el("path", { d: "M720 420 Q940 570 905 910 Q870 1180 620 1245 Q865 1050 832 760 Q812 560 720 420 Z", fill: "#b8581f", opacity: 0.32 }, head);
    // pelo
    el("path", { d: "M180 700 Q150 330 420 310 Q760 280 900 640 Q820 470 640 470 Q380 470 300 650 Q250 700 180 700 Z", fill: HAIR }, head);
    el("path", { d: "M230 470 L190 330 L330 420 L360 270 L460 400 L560 250 L610 400 L760 280 L760 440 Z", fill: HAIR }, head);
    el("path", { d: "M300 440 Q330 380 420 380", stroke: "#463a80", "stroke-width": 8, fill: "none", opacity: 0.6, "stroke-linecap": "round" }, head);
    // ojos
    const eyes = [400, 680].map((cx) => {
      const g = grp(head);
      const cp = el("clipPath", { id: `eye${cx}${Math.round(Math.random() * 1e6)}` }, H_.getDefs());
      el("ellipse", { cx, cy: 740, rx: 75, ry: 70 }, cp);
      el("ellipse", { cx, cy: 740, rx: 75, ry: 70, fill: "#fffaf0" }, g);
      const inner = grp(g, { "clip-path": `url(#${cp.getAttribute("id")})` });
      const pupil = el("circle", { cx, cy: 745, r: 40, fill: "#241a3a" }, inner);
      const shine = el("circle", { cx: cx - 14, cy: 731, r: 13, fill: "#fff" }, inner);
      const lid = el("path", { fill: SKIN_A }, inner);
      const lash = el("path", { stroke: "#241a3a", "stroke-width": 10, fill: "none", "stroke-linecap": "round" }, g);
      return { cx, pupil, shine, lid, lash };
    });
    // ojeras, nariz, mejillas, pecas
    el("path", { d: "M335 815 Q400 850 465 815", stroke: "#b8581f", "stroke-width": 9, fill: "none", opacity: 0.55 }, head);
    el("path", { d: "M615 815 Q680 850 745 815", stroke: "#b8581f", "stroke-width": 9, fill: "none", opacity: 0.55 }, head);
    el("path", { d: "M548 770 Q500 905 562 935 Q602 940 612 908", stroke: "#b8581f", "stroke-width": 12, fill: "none", "stroke-linecap": "round", opacity: 0.75 }, head);
    el("circle", { cx: 300, cy: 935, r: 62, fill: "#e8553a", opacity: 0.28 }, head);
    el("circle", { cx: 790, cy: 935, r: 62, fill: "#e8553a", opacity: 0.28 }, head);
    [[620, 862], [652, 884], [692, 864], [420, 884], [462, 898], [350, 880]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 5, fill: "#a94a1c", opacity: 0.7 }, head));
    // cejas y boca
    const browL = el("path", { stroke: HAIR, "stroke-width": 32, fill: "none", "stroke-linecap": "round" }, head);
    const browR = el("path", { stroke: HAIR, "stroke-width": 32, fill: "none", "stroke-linecap": "round" }, head);
    const mouth = el("path", { stroke: "#7a2e1a", "stroke-width": 16, fill: "none", "stroke-linecap": "round" }, head);
    const tear = el("path", { d: "M0 0 Q-14 26 0 40 Q14 26 0 0 Z", fill: "#bfe4ff", opacity: 0 }, head);
    const glow = el("path", { d: "M205 520 Q145 760 205 1000", stroke: "#ffd58a", "stroke-width": 36, fill: "none", opacity: 0, "stroke-linecap": "round", filter: "blur(14px)" }, head);

    return {
      root,
      /* worry 0..1 (cejas), lid 0 abierto..1 cerrado, look [x,y], mouth -1 (pena)..1 (alivio), tear 0..1, tilt grados, warm 0..1 (luz dorada) */
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
          const cover = clamp(Math.max(lid, droop)); // 0..1 de la altura del ojo
          const yb = 670 + cover * 140; // borde inferior del párpado
          e.lid.setAttribute("d", `M${e.cx - 90} 640 L${e.cx + 90} 640 L${e.cx + 90} ${yb} Q${e.cx} ${yb + (cover > 0.5 ? 18 : 28)} ${e.cx - 90} ${yb} Z`);
          e.lash.setAttribute("d", `M${e.cx - 76} ${yb} Q${e.cx} ${yb + (cover > 0.5 ? 18 : 28)} ${e.cx + 76} ${yb}`);
          e.lash.setAttribute("opacity", cover > 0.04 ? 0.9 : 0);
        });
        mouth.setAttribute("d", `M452 1058 Q${540} ${1058 + 58 * m} 628 1058`);
        tear.setAttribute("opacity", tr > 0 ? Math.min(1, tr * 3) * (1 - Math.max(0, tr - 0.85) * 6) : 0);
        tear.setAttribute("transform", `translate(${352},${815 + tr * 150})`);
        glow.setAttribute("opacity", warm * 0.8);
        head.setAttribute("transform", `rotate(${tilt},540,1250)`);
      },
    };
  }

  /* ───────── Habitación nocturna (plano general) ───────── */
  function room(g, H_) {
    const { el, grp, gradient } = H_;
    // fondo a pantalla completa (el suelo empieza donde terminan las patas de la cama, ya escalado)
    el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#4f3580"], [0.5, "#8d5aa3"], [1, "#b86f8a"]]) }, g);
    el("rect", { y: 921, width: 1080, height: 1000, fill: gradient([[0, "#c98146"], [1, "#7e4128"]]) }, g);
    for (let i = 0; i < 14; i++) el("line", { x1: 0, y1: 950 + i * 60, x2: 1080, y2: 950 + i * 60, stroke: "#6e3a22", "stroke-opacity": 0.35, "stroke-width": 3 }, g);
    // utilería y personaje a escala 0,7 para que la escena quepa sobre los subtítulos
    const props = grp(g, { transform: "translate(162,60) scale(0.7)" });
    const win = grp(props, { transform: "translate(660,300)" });
    el("rect", { width: 300, height: 380, rx: 10, fill: "#1d2a5c" }, win);
    el("circle", { cx: 210, cy: 100, r: 42, fill: "#fff4cf" }, win);
    el("circle", { cx: 210, cy: 100, r: 84, fill: gradient([[0, "#fff4cf", 0.5], [1, "#fff4cf", 0]], { radial: true }) }, win);
    [[60, 60], [110, 230], [250, 260], [80, 150]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 3, fill: "#fff" }, win));
    el("rect", { width: 300, height: 380, rx: 10, fill: "none", stroke: "#e9d8b5", "stroke-width": 16 }, win);
    el("line", { x1: 150, y1: 0, x2: 150, y2: 380, stroke: "#e9d8b5", "stroke-width": 12 }, win);
    el("line", { x1: 0, y1: 190, x2: 300, y2: 190, stroke: "#e9d8b5", "stroke-width": 12 }, win);
    const clock = grp(props, { transform: "translate(420,330)" });
    el("circle", { r: 78, fill: "#f3e7cf", stroke: "#6b4a2a", "stroke-width": 12 }, clock);
    for (let i = 0; i < 12; i++) el("line", { x1: 0, y1: -60, x2: 0, y2: -68, stroke: "#6b4a2a", "stroke-width": 5, transform: `rotate(${i * 30})` }, clock);
    el("line", { x1: 0, y1: 0, x2: 0, y2: -40, stroke: "#2a1d12", "stroke-width": 9, "stroke-linecap": "round", transform: "rotate(93)" }, clock);
    el("line", { x1: 0, y1: 0, x2: 0, y2: -58, stroke: "#2a1d12", "stroke-width": 6, "stroke-linecap": "round", transform: "rotate(42)" }, clock);
    el("circle", { r: 7, fill: "#2a1d12" }, clock);
    el("rect", { x: 330, y: 1130, width: 200, height: 290, rx: 10, fill: "#e4a13a" }, props);
    el("rect", { x: 330, y: 1130, width: 200, height: 40, fill: "#f2b955" }, props);
    el("rect", { x: 355, y: 1250, width: 150, height: 70, rx: 6, fill: "#c88620" }, props);
    const glow = el("circle", { cx: 430, cy: 1010, r: 280, fill: gradient([[0, "#ffd58a", 0.85], [1, "#ffd58a", 0]], { radial: true }) }, props);
    el("path", { d: "M380 1130 L405 990 L455 990 L480 1130 Z", fill: "#f6dba0" }, props);
    el("rect", { x: 423, y: 1040, width: 14, height: 90, fill: "#8a5a2a" }, props);
    el("rect", { x: 560, y: 1200, width: 620, height: 440, rx: 30, fill: gradient([[0, "#4a52b0"], [1, "#2f357f"]], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, props);
    el("rect", { x: 560, y: 1168, width: 620, height: 70, rx: 30, fill: "#eadfcf" }, props);
    el("ellipse", { cx: 980, cy: 1150, rx: 150, ry: 60, fill: "#f3ead9" }, props);
    return { glow, props };
  }

  /* ───────── Diego sentado de perfil, hundido ───────── */
  function sitting(g, H_) {
    const { el, grp, gradient } = H_;
    const root = grp(g);
    const skin = gradient([[0, SKIN_A], [1, SKIN_B]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    const shirt = gradient([[0, "#f2b83a"], [1, "#d88f1c"]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    // piernas (de perfil, mirando a la izquierda)
    el("path", { d: "M830 1250 Q700 1235 560 1290 L545 1385 Q690 1340 840 1352 Z", fill: "#2b3070" }, root);
    el("path", { d: "M560 1290 L520 1530 L610 1535 L640 1330 Z", fill: "#353b82" }, root);
    el("path", { d: "M480 1525 Q470 1480 520 1520 L640 1525 Q665 1555 640 1580 L470 1580 Q440 1560 480 1525 Z", fill: "#6e4023" }, root);
    const torso = grp(root);
    el("path", { d: "M820 1240 Q880 1100 800 980 Q740 900 690 975 Q650 1080 700 1200 Q730 1260 820 1260 Z", fill: shirt }, torso);
    // brazo: codo sobre la rodilla, antebrazo colgando
    el("path", { d: "M760 1000 Q700 1120 650 1240", stroke: "#d88f1c", "stroke-width": 70, fill: "none", "stroke-linecap": "round" }, torso);
    el("path", { d: "M650 1240 Q600 1320 585 1385", stroke: "#e49a2c", "stroke-width": 58, fill: "none", "stroke-linecap": "round" }, torso);
    el("circle", { cx: 582, cy: 1405, r: 38, fill: "#e08a4a" }, torso);
    const head = grp(torso);
    el("ellipse", { cx: 0, cy: 0, rx: 98, ry: 112, fill: skin }, head);
    el("path", { d: "M-102 -10 Q-110 -150 14 -152 Q122 -146 104 -24 Q60 -92 -22 -84 Q-72 -72 -102 -10 Z", fill: HAIR }, head);
    el("path", { d: "M-70 -112 L-104 -172 L-42 -138 L-32 -194 L12 -142 L52 -184 L62 -128 Z", fill: HAIR }, head);
    el("ellipse", { cx: 62, cy: 10, rx: 22, ry: 34, fill: "#df8847" }, head);
    el("path", { d: "M-96 12 Q-126 30 -100 52", fill: SKIN_B }, head);
    el("path", { d: "M-70 -16 Q-52 -6 -34 -16", stroke: "#241a3a", "stroke-width": 7, fill: "none", "stroke-linecap": "round" }, head);
    el("path", { d: "M-78 -40 Q-52 -52 -26 -38", stroke: HAIR, "stroke-width": 11, fill: "none", "stroke-linecap": "round" }, head);
    el("path", { d: "M-70 58 Q-48 66 -28 56", stroke: "#7a2e1a", "stroke-width": 7, fill: "none", "stroke-linecap": "round" }, head);
    return {
      root,
      set({ lift = 0, breathe = 0 }) {
        // lift 0 (cabeza gacha) .. 1 (levanta la cabeza)
        const rot = -22 + lift * 32; // cabeza gacha (cara hacia abajo-izquierda) → se levanta
        head.setAttribute("transform", `translate(${690 - lift * 8},${960 - lift * 40}) rotate(${rot})`);
        torso.setAttribute("transform", `translate(0,${breathe * 5}) rotate(${-lift * 3},800,1250)`);
      },
    };
  }

  /* ───────── Presencia de luz en la puerta (sin rostro) ───────── */
  function presence(g, H_) {
    const { el, grp, gradient } = H_;
    const root = grp(g, { opacity: 0 });
    el("rect", { x: 30, y: 640, width: 320, height: 900, fill: "#2a1a38", opacity: 0.55 }, root);
    el("path", { d: "M30 1540 L560 1760 L620 1500 L350 1520 Z", fill: gradient([[0, "#fff0c0", 0.8], [1, "#fff0c0", 0]], { x1: 0, y1: 0, x2: 1, y2: 0 }), opacity: 0.7 }, root);
    el("rect", { x: 30, y: 640, width: 320, height: 900, fill: gradient([[0, "#ffe9b0", 0.95], [1, "#ffe9b0", 0.1]], { x1: 0, y1: 0, x2: 1, y2: 0 }) }, root);
    const fig = grp(root, { filter: "blur(5px)" });
    el("circle", { cx: 190, cy: 830, r: 62, fill: "#fffaf0", opacity: 0.95 }, fig);
    el("path", { d: "M130 900 Q90 1150 70 1500 L310 1500 Q290 1150 250 900 Z", fill: "#fffaf0", opacity: 0.92 }, fig);
    el("path", { d: "M250 920 Q330 1040 340 1180", stroke: "#fffaf0", "stroke-width": 44, fill: "none", "stroke-linecap": "round", opacity: 0.9 }, fig);
    el("ellipse", { cx: 190, cy: 1100, rx: 260, ry: 620, fill: "#fff0c0", opacity: 0.35, filter: "blur(40px)" }, root);
    el("rect", { x: 30, y: 640, width: 320, height: 900, fill: "none", stroke: "#e9d8b5", "stroke-width": 22 }, root);
    return root;
  }

  const shots = [];

  /* 1 — plano general: las tres de la mañana */
  shots.push({
    lines: ["Son las tres de la mañana. Diego lleva horas sin poder dormir."],
    build(g, { helpers: H_ }) {
      const { grp, ease, seg } = H_;
      const cam = grp(g);
      const r = room(cam, H_);
      const d = sitting(r.props, H_);
      grain(g, H_, 1);
      return (u, t) => {
        d.set({ lift: 0, breathe: Math.sin(t * 1.6) });
        r.glow.setAttribute("opacity", 0.85 + Math.sin(t * 7) * 0.05);
        cam.setAttribute("transform", `translate(540,700) scale(${1.0 + u * 0.07}) translate(-540,-700)`);
      };
    },
  });

  /* 2 — primer plano: todo le pesa */
  shots.push({
    lines: ["Las cuentas, el trabajo, la familia… todo le pesa a la vez."],
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#4f3580"], [0.6, "#8d5aa3"], [1, "#b86f8a"]]) }, cam);
      el("circle", { cx: 150, cy: 1250, r: 540, fill: gradient([[0, "#ffd58a", 0.7], [1, "#ffd58a", 0]], { radial: true }) }, cam);
      const f = faceRig(cam, H_);
      grain(g, H_, 2);
      return (u, t) => {
        const blink = Math.max(0, 1 - Math.abs(((t * 0.5) % 1) - 0.5) * 40); // parpadeo cada ~2 s
        f.set({ worry: 0.55 + 0.3 * ease(seg(u, 0.1, 0.7)), lid: blink, look: [Math.sin(t * 0.9) * 0.9, 0.3 + Math.sin(t * 1.3) * 0.25], mouth: -0.5, tilt: Math.sin(t * 1.1) * 1.2, droop: 0.15 });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 1.6) * 5})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1.0 + u * 0.08}) translate(-540,-900)`);
      };
    },
  });

  /* 3 — primer plano: cansancio, ojos que se cierran, una lágrima */
  shots.push({
    lines: ["Hace tiempo que no recuerda cómo es descansar."],
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#43306f"], [0.6, "#7a4c93"], [1, "#a8607c"]]) }, cam);
      el("circle", { cx: 150, cy: 1250, r: 520, fill: gradient([[0, "#ffd58a", 0.5], [1, "#ffd58a", 0]], { radial: true }) }, cam);
      const f = faceRig(cam, H_);
      grain(g, H_, 3);
      return (u, t) => {
        const close = ease(seg(u, 0.25, 0.75));
        f.set({ worry: 0.85, lid: close * 0.85, look: [0, 0.6], mouth: -0.8, tear: ease(seg(u, 0.55, 1)), tilt: 3 + close * 4, droop: 0.2 });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 1.4) * 4 + close * 14})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1.06 + u * 0.06}) translate(-540,-900)`);
      };
    },
  });

  /* 4 — plano general: aparece una luz en la puerta */
  shots.push({
    lines: ["Y entonces, en el silencio, recuerda unas palabras que alguna vez leyó."],
    build(g, { helpers: H_ }) {
      const { grp, ease, seg } = H_;
      const cam = grp(g);
      const r = room(cam, H_);
      const p = presence(r.props, H_);
      const d = sitting(r.props, H_);
      grain(g, H_, 4);
      return (u, t) => {
        const a = ease(seg(u, 0.25, 0.7));
        p.setAttribute("opacity", a);
        d.set({ lift: ease(seg(u, 0.5, 0.95)), breathe: Math.sin(t * 1.6) });
        r.glow.setAttribute("opacity", 0.85 + Math.sin(t * 7) * 0.05);
        cam.setAttribute("transform", `translate(540,700) scale(${1.07 - u * 0.05}) translate(-540,-700)`);
      };
    },
  });

  /* 5 — primer plano: alivio, con la Escritura literal */
  shots.push({
    verses: ["MAT.11.28"],
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#5a3d86"], [0.55, "#b2778f"], [1, "#f0b878"]]) }, cam);
      el("circle", { cx: 150, cy: 1100, r: 700, fill: gradient([[0, "#fff0c0", 0.95], [1, "#fff0c0", 0]], { radial: true }) }, cam);
      const f = faceRig(cam, H_);
      grain(g, H_, 5);
      return (u, t) => {
        const relief = ease(seg(u, 0.1, 0.85));
        const blink = Math.max(0, 1 - Math.abs(((t * 0.4 + 0.3) % 1) - 0.5) * 40);
        f.set({ worry: 0.8 - 0.7 * relief, lid: blink * 0.9, look: [-0.5 + relief * 0.1, -0.1], mouth: -0.7 + 1.5 * relief, tear: 0, tilt: 3 - relief * 6, warm: relief, droop: 0.28 - 0.2 * relief });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 1.3) * 5})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1.08 - u * 0.03}) translate(-540,-900)`);
      };
    },
  });

  window.STORIES.noche = {
    kicker: "Historias de hoy · Piloto",
    title: "Las tres\nde la mañana",
    subtitle: "Una noche de cansancio",
    next: { kicker: "Más palabras de paz", title: "Versículos\npara el cansancio" },
    shots,
  };
})();
