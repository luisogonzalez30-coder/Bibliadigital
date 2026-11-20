/* «Examen de madrugada» — Filipenses 4:13 (RV1909, literal). Narración y personajes: ficción de Santuario Bíblico. */
(() => {
  window.STORIES = window.STORIES || {};
  const K = () => window.KIT;
  const LOOK = { skin: K().SKINS.claro, hair: { style: "long", color: "#3b2418", hi: "#6a4630" }, brow: "#3b2418", glasses: true, shirt: ["#8fd3a8", "#5fae80"], collar: "#4a9468", blush: "#ee7a6a" };

  function study(g, H_, p) {
    const { el, grp, gradient } = H_;
    el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#2f3a63"], [0.55, "#5c5a8a"], [1, "#8a6a86"]]) }, g);
    el("rect", { y: 921, width: 1080, height: 1000, fill: gradient([[0, "#9c7048"], [1, "#573621"]]) }, g);
    const props = grp(g, { transform: "translate(162,60) scale(0.7)" });
    // ventana nocturna → amanecer
    const win = grp(props, { transform: "translate(660,260)" });
    const skyG = K().vgrad(H_, "#16205a", "#1a2a6a");
    el("rect", { width: 300, height: 380, rx: 10, fill: skyG.fill }, win);
    el("circle", { cx: 80, cy: 90, r: 38, fill: "#fff4cf" }, win);
    el("rect", { width: 300, height: 380, rx: 10, fill: "none", stroke: "#e6d9bc", "stroke-width": 16 }, win);
    el("line", { x1: 150, y1: 0, x2: 150, y2: 380, stroke: "#e6d9bc", "stroke-width": 12 }, win);
    // reloj 2:00
    const clock = grp(props, { transform: "translate(420,300)" });
    el("circle", { r: 70, fill: "#f3e7cf", stroke: "#6b4a2a", "stroke-width": 12 }, clock);
    el("line", { x1: 0, y1: 0, x2: 0, y2: -36, stroke: "#2a1d12", "stroke-width": 9, "stroke-linecap": "round", transform: "rotate(60)" }, clock);
    el("line", { x1: 0, y1: 0, x2: 0, y2: -52, stroke: "#2a1d12", "stroke-width": 6, "stroke-linecap": "round" }, clock);
    el("circle", { r: 6, fill: "#2a1d12" }, clock);
    // escritorio, libros, laptop, lámpara
    el("rect", { x: 30, y: 1210, width: 560, height: 38, rx: 8, fill: "#7a4a2a" }, props);
    el("rect", { x: 70, y: 1248, width: 34, height: 330, fill: "#6a3e22" }, props);
    el("rect", { x: 500, y: 1248, width: 34, height: 330, fill: "#6a3e22" }, props);
    [["#c0392b", 0], ["#2e7d9a", 1], ["#e0a526", 2]].forEach(([c, i]) => el("rect", { x: 90 + i * 12, y: 1130 - i * 40, width: 190 - i * 14, height: 40, rx: 4, fill: c }, props));
    el("path", { d: "M300 1210 L520 1210 L500 1090 L320 1090 Z", fill: "#cfd3dc" }, props);
    el("rect", { x: 330, y: 1100, width: 160, height: 100, fill: "#2b3d66" }, props);
    const lampGlow = el("circle", { cx: 150, cy: 960, r: 320, fill: gradient([[0, "#ffd58a", 0.85], [1, "#ffd58a", 0]], { radial: true }) }, props);
    el("path", { d: "M100 1210 L150 1050 L190 1080 L170 1210 Z M150 1050 L110 930 L230 930 L190 1080 Z", fill: "#e8b64a" }, props);
    const dawn = el("rect", { x: -400, y: 0, width: 1800, height: 1700, fill: gradient([[0, "#ffd9a0", 0.0], [1, "#ffd9a0", 0.35]], { x1: 0, y1: 1, x2: 0, y2: 0 }) }, props);
    return { props, lampGlow, set(pp) {
      skyG.set(K().mix("#16205a", "#6a83c8", pp), K().mix("#1a2a6a", "#f4b27a", pp));
      dawn.setAttribute("opacity", pp);
    } };
  }
  function mix(a, b, t) {
    const pa = a.match(/\w\w/g).map((x) => parseInt(x, 16)); const pb = b.match(/\w\w/g).map((x) => parseInt(x, 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  const wide = (lines, p0, p1, l0, l1, id) => ({
    lines,
    build(g, { helpers: H_ }) {
      const { grp, ease, seg, lerp } = H_;
      const cam = grp(g);
      const s = study(cam, H_, 0);
      const d = K().seated(s.props, H_, { skin: LOOK.skin, hair: { style: "long", color: "#3b2418" }, shirt: ["#8fd3a8", "#5fae80"], pants: ["#3a3f5a", "#464c6c"], glasses: true });
      K().grain(g, H_, id);
      return (u, t) => {
        s.set(lerp(p0, p1, ease(u)));
        s.lampGlow.setAttribute("opacity", 0.85 + Math.sin(t * 6) * 0.04);
        d.set({ lift: lerp(l0, l1, ease(seg(u, 0.25, 1))), breathe: Math.sin(t * 1.5) });
        cam.setAttribute("transform", `translate(540,700) scale(${1 + u * 0.06}) translate(-540,-700)`);
      };
    },
  });
  const close = (opts) => ({
    ...(opts.verses ? { verses: opts.verses } : { lines: opts.lines }),
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      el("rect", { width: 1080, height: 1920, fill: gradient(opts.bg) }, cam);
      el("circle", { cx: 150, cy: 1150, r: 620, fill: gradient([[0, opts.glow, opts.glowA], [1, opts.glow, 0]], { radial: true }) }, cam);
      const f = K().face(cam, H_, LOOK);
      K().grain(g, H_, opts.id);
      return (u, t) => {
        const blink = Math.max(0, 1 - Math.abs(((t * 0.42) % 1) - 0.5) * 40);
        const k = ease(seg(u, 0.15, 0.85));
        f.set({ worry: opts.worry[0] + (opts.worry[1] - opts.worry[0]) * k, lid: Math.max(blink, opts.lid ? opts.lid * Math.sin(Math.min(1, u * 1.2) * Math.PI) : 0), look: [opts.look[0] + (opts.look[2] - opts.look[0]) * k, opts.look[1] + (opts.look[3] - opts.look[1]) * k], mouth: opts.mouth[0] + (opts.mouth[1] - opts.mouth[0]) * k, droop: opts.droop[0] + (opts.droop[1] - opts.droop[0]) * k, tilt: opts.tilt, warm: opts.warm ? k : 0 });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 1.4) * 4})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1.02 + u * 0.07}) translate(-540,-900)`);
      };
    },
  });

  const shots = [
    wide(["Son las dos de la mañana, y Camila lleva horas estudiando."], 0, 0, 0, 0, 31),
    close({ lines: ["Mañana es su examen más importante, y ya no le quedan fuerzas."], bg: [[0, "#2f3a63"], [0.6, "#5c5a8a"], [1, "#8a6a86"]], glow: "#ffd58a", glowA: 0.45, worry: [0.65, 0.85], look: [0.2, 0.5, -0.3, 0.6], mouth: [-0.5, -0.7], droop: [0.3, 0.35], tilt: 3, lid: 0.4, id: 32 }),
    close({ lines: ["Respira hondo… y recuerda algo que le decía su mamá."], bg: [[0, "#34406c"], [0.6, "#6a679a"], [1, "#a47e92"]], glow: "#ffd58a", glowA: 0.5, worry: [0.8, 0.4], look: [-0.3, 0.2, 0.2, -0.2], mouth: [-0.6, -0.1], droop: [0.3, 0.15], tilt: 2, lid: 0.7, id: 33 }),
    close({ verses: ["PHP.4.13"], bg: [[0, "#5a6fb8"], [0.55, "#d79a85"], [1, "#f6c487"]], glow: "#fff0c0", glowA: 0.95, worry: [0.45, 0.05], look: [0.2, 0.1, 0, -0.1], mouth: [-0.2, 1], droop: [0.15, 0.02], tilt: 0, warm: true, id: 34 }),
    wide(["Se endereza, sonríe… y vuelve al libro."], 0.7, 1, 0.8, 0, 35),
  ];

  window.STORIES.filipenses = {
    kicker: "Filipenses 4:13",
    title: "Examen de\nmadrugada",
    subtitle: "Historias de hoy",
    titleDur: 1.6, endDur: 3.2, lead: 0.3, tail: 0.4,
    next: { kicker: "Más palabras de fuerza", title: "Versículos\npara el cansancio" },
    shots,
  };
})();
