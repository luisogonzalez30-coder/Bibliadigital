/* «La noche de Sofía» — Isaías 41:10 (RV1909, literal). Narración y personajes: ficción de Santuario Bíblico. */
(() => {
  window.STORIES = window.STORIES || {};
  const K = () => window.KIT;
  const PIG = { style: "pigtails", color: "#3a2418", hi: "#6a4630" };
  const CHILD = { skin: K().SKINS.nina, hair: PIG, child: true, shirt: ["#f08cb4", "#d96a98"], collar: "#c4547f", blush: "#ee6a6a", brow: "#3a2418", noFreckles: true };

  /* habitación infantil de noche: pared, ventana con luna y rama, luz piloto */
  function bedroom(g, H_, { shadows = 1 } = {}) {
    const { el, grp, gradient } = H_;
    el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#2c2a63"], [0.55, "#4a3f86"], [1, "#6b4f92"]]) }, g);
    el("rect", { y: 960, width: 1080, height: 960, fill: gradient([[0, "#8a5a3a"], [1, "#4a2c1e"]]) }, g);
    for (let i = 0; i < 12; i++) el("line", { x1: 0, y1: 990 + i * 60, x2: 1080, y2: 990 + i * 60, stroke: "#32190f", "stroke-opacity": 0.35, "stroke-width": 3 }, g);
    const win = grp(g, { transform: "translate(660,190)" });
    el("rect", { width: 300, height: 380, rx: 10, fill: "#16205a" }, win);
    el("circle", { cx: 80, cy: 110, r: 42, fill: "#fff4cf" }, win);
    el("circle", { cx: 80, cy: 110, r: 90, fill: gradient([[0, "#fff4cf", 0.45], [1, "#fff4cf", 0]], { radial: true }) }, win);
    el("path", { d: "M300 330 Q230 290 170 250 M230 292 Q200 230 215 175 M170 250 Q120 235 85 190", stroke: "#0b0e30", "stroke-width": 11, fill: "none", "stroke-linecap": "round" }, win);
    el("rect", { width: 300, height: 380, rx: 10, fill: "none", stroke: "#d9c9a6", "stroke-width": 16 }, win);
    el("line", { x1: 150, y1: 0, x2: 150, y2: 380, stroke: "#d9c9a6", "stroke-width": 12 }, win);
    // sombras que se mueven en la pared (rama y armario)
    const sh = grp(g, { opacity: 0.55 * shadows });
    const branch = grp(sh, { transform: "translate(120,260)" });
    el("path", { d: "M-100 340 Q40 280 120 160 M40 270 Q10 190 40 110 M95 190 Q170 180 215 120 M0 300 Q-60 240 -50 170", stroke: "#150f33", "stroke-width": 26, fill: "none", "stroke-linecap": "round" }, branch);
    el("path", { d: "M120 160 l22 -50 M40 110 l-14 -48 M215 120 l44 -20 M-50 170 l-34 -26", stroke: "#150f33", "stroke-width": 16, fill: "none", "stroke-linecap": "round" }, branch);
    const closet = el("path", { d: "M-20 1040 L-20 560 Q60 520 150 560 L170 1040 Z", fill: "#150f33", opacity: 0.55 }, sh);
    return { sway: (t) => { branch.setAttribute("transform", `translate(120,260) rotate(${Math.sin(t * 0.9) * 3.2},0,340)`); closet.setAttribute("opacity", 0.45 + Math.sin(t * 0.6) * 0.08); }, shadows: sh };
  }

  function bed(g, H_, face) {
    const { el, grp, gradient } = H_;
    // cabecera y almohada
    el("rect", { x: 130, y: 820, width: 820, height: 560, rx: 40, fill: "#5a3f80" }, g);
    el("ellipse", { cx: 540, cy: 990, rx: 330, ry: 120, fill: "#f3ead9" }, g);
    const ch = grp(g, { transform: "translate(346,500) scale(0.36)" });
    face(ch);
    // manta
    el("path", { d: "M120 1150 Q250 960 540 970 Q830 960 960 1150 L1010 1500 L70 1500 Z", fill: gradient([[0, "#e0457b"], [1, "#a9285a"]], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, g);
    for (let i = 0; i < 6; i++) el("circle", { cx: 230 + i * 125, cy: 1230 + (i % 2) * 70, r: 20, fill: "#ffd0e0", opacity: 0.6 }, g);
    // manos agarrando la manta
    el("ellipse", { cx: 410, cy: 985, rx: 46, ry: 34, fill: "#f5bd93" }, g);
    el("ellipse", { cx: 670, cy: 985, rx: 46, ry: 34, fill: "#f5bd93" }, g);
    // osito
    const bear = grp(g, { transform: "translate(830,1130)" });
    el("circle", { cx: 0, cy: 0, r: 70, fill: "#b8814a" }, bear);
    el("circle", { cx: -48, cy: -60, r: 26, fill: "#b8814a" }, bear);
    el("circle", { cx: 48, cy: -60, r: 26, fill: "#b8814a" }, bear);
    el("circle", { cx: -22, cy: -8, r: 7, fill: "#2a1a10" }, bear);
    el("circle", { cx: 22, cy: -8, r: 7, fill: "#2a1a10" }, bear);
    el("ellipse", { cx: 0, cy: 18, rx: 24, ry: 16, fill: "#e2b98a" }, bear);
  }

  function nightlight(g, H_) {
    const { el, gradient } = H_;
    el("circle", { cx: 160, cy: 1040, r: 190, fill: gradient([[0, "#ffd58a", 0.5], [1, "#ffd58a", 0]], { radial: true }) }, g);
    el("path", { d: "M160 1005 l9 20 l22 3 l-16 16 l4 22 l-19 -10 l-19 10 l4 -22 l-16 -16 l22 -3 Z", fill: "#ffe39a" }, g);
  }

  const shots = [];

  shots.push({
    lines: ["Sofía tiene seis años, y la oscuridad le parece enorme."],
    build(g, { helpers: H_ }) {
      const { grp, ease, seg } = H_;
      const cam = grp(g);
      const r = bedroom(cam, H_);
      let f;
      bed(cam, H_, (p) => (f = K().face(p, H_, { ...CHILD, body: false })));
      nightlight(cam, H_);
      K().grain(g, H_, 11);
      return (u, t) => {
        r.sway(t);
        const blink = Math.max(0, 1 - Math.abs(((t * 0.45) % 1) - 0.5) * 40);
        f.set({ worry: 0.8, lid: blink, look: [Math.sin(t * 1.1) * 0.9, -0.2], mouth: -0.35, droop: 0 });
        cam.setAttribute("transform", `translate(540,900) scale(${1 + u * 0.06}) translate(-540,-900)`);
      };
    },
  });

  shots.push({
    lines: ["Cada sombra se mueve… y su corazón late fuerte."],
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#242357"], [0.6, "#43377c"], [1, "#6b4f92"]]) }, cam);
      const blobs = [0, 1, 2].map((i) => el("ellipse", { cx: 200 + i * 340, cy: 700, rx: 170, ry: 260, fill: "#110c2a", opacity: 0.35 }, cam));
      const f = K().face(cam, H_, CHILD);
      K().grain(g, H_, 12);
      return (u, t) => {
        blobs.forEach((b, i) => b.setAttribute("cx", 200 + i * 340 + Math.sin(t * 0.7 + i * 2) * 60));
        const blink = Math.max(0, 1 - Math.abs(((t * 0.5 + 0.2) % 1) - 0.5) * 40);
        f.set({ worry: 0.9, lid: blink, look: [Math.sin(t * 1.6) * 1.0, -0.15], mouth: -0.2 - Math.abs(Math.sin(t * 5)) * 0.15, droop: 0, tilt: Math.sin(t * 2) * 1.2 });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 7) * 3})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1.02 + u * 0.08}) translate(-540,-900)`);
      };
    },
  });

  shots.push({
    lines: ["Recuerda unas palabras que le leyó su abuela."],
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      const r = bedroom(cam, H_);
      let f;
      bed(cam, H_, (p) => (f = K().face(p, H_, { ...CHILD, body: false })));
      nightlight(cam, H_);
      // puerta del pasillo que se abre con luz cálida
      const door = grp(cam);
      const beam = el("path", { fill: gradient([[0, "#ffe9b0", 0.9], [1, "#ffe9b0", 0]], { x1: 0, y1: 0, x2: 1, y2: 0 }) }, door);
      const slit = el("rect", { x: 0, y: 380, width: 60, height: 620, fill: "#fff3cf" }, door);
      el("rect", { x: -10, y: 370, width: 90, height: 640, fill: "none", stroke: "#e9d8b5", "stroke-width": 18 }, door);
      K().grain(g, H_, 13);
      return (u, t) => {
        const a = ease(seg(u, 0.15, 0.8));
        const w = 60 + a * 150;
        slit.setAttribute("width", w);
        beam.setAttribute("d", `M0 400 L${w} 380 L${w + 560} 1180 L0 1240 Z`);
        beam.setAttribute("opacity", 0.25 + a * 0.75);
        r.sway(t);
        r.shadows.setAttribute("opacity", 0.55 * (1 - a * 0.85));
        const blink = Math.max(0, 1 - Math.abs(((t * 0.45) % 1) - 0.5) * 40);
        f.set({ worry: 0.8 - a * 0.55, lid: blink, look: [-0.8 * a, 0], mouth: -0.3 + a * 0.5, droop: 0.05 + a * 0.12 });
        cam.setAttribute("transform", `translate(540,900) scale(${1.06 - u * 0.04}) translate(-540,-900)`);
      };
    },
  });

  shots.push({
    verses: ["ISA.41.10"],
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#5a4290"], [0.55, "#c98a9a"], [1, "#f6c487"]]) }, cam);
      el("circle", { cx: 120, cy: 1100, r: 760, fill: gradient([[0, "#fff0c0", 0.95], [1, "#fff0c0", 0]], { radial: true }) }, cam);
      const f = K().face(cam, H_, CHILD);
      K().grain(g, H_, 14);
      return (u, t) => {
        const relief = ease(seg(u, 0.1, 0.8));
        const blink = Math.max(0, 1 - Math.abs(((t * 0.4 + 0.3) % 1) - 0.5) * 40);
        f.set({ worry: 0.6 - 0.55 * relief, lid: blink, look: [-0.4 + relief * 0.4, 0.1], mouth: -0.4 + 1.3 * relief, droop: 0.15 - 0.1 * relief, warm: relief, tilt: 2 - relief * 3 });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 1.3) * 5})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1.07 - u * 0.03}) translate(-540,-900)`);
      };
    },
  });

  window.STORIES.isaias = {
    kicker: "Isaías 41:10",
    title: "La noche\nde Sofía",
    subtitle: "Historias de hoy",
    titleDur: 1.6,
    endDur: 3.2,
    lead: 0.3,
    tail: 0.4,
    next: { kicker: "Más palabras de paz", title: "Versículos\npara el miedo" },
    shots,
  };
})();
