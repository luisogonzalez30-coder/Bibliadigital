/* «El silencio de Doña Rosa» — Salmo 23:4 (RV1909, literal). Narración y personajes: ficción de Santuario Bíblico. */
(() => {
  window.STORIES = window.STORIES || {};
  const K = () => window.KIT;
  const LOOK = { skin: K().SKINS.mayor, hair: { style: "bun", color: "#cfc9d6", hi: "#f0edf5" }, brow: "#8c8696", glasses: true, wrinkles: true, noFreckles: true, shirt: ["#b9a3e0", "#8f78c4"], collar: "#7a63b0", blush: "#e58a8a" };

  function livingRoom(g, H_) {
    const { el, grp, gradient } = H_;
    el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#4a3a5e"], [0.55, "#7a5a72"], [1, "#a86f6a"]]) }, g);
    el("rect", { y: 921, width: 1080, height: 1000, fill: gradient([[0, "#9a6a46"], [1, "#573621"]]) }, g);
    const rug = el("ellipse", { cx: 540, cy: 1130, rx: 460, ry: 80, fill: "#7a3a4a", opacity: 0.55 }, g);
    const props = grp(g, { transform: "translate(162,60) scale(0.7)" });
    // mesita con retrato y vela
    el("rect", { x: 70, y: 1180, width: 300, height: 36, rx: 8, fill: "#7a4a2a" }, props);
    el("rect", { x: 110, y: 1216, width: 30, height: 360, fill: "#6a3e22" }, props);
    el("rect", { x: 300, y: 1216, width: 30, height: 360, fill: "#6a3e22" }, props);
    const frame = grp(props, { transform: "translate(90,980)" });
    el("rect", { width: 150, height: 200, rx: 8, fill: "#c8a15a" }, frame);
    el("rect", { x: 14, y: 14, width: 122, height: 172, fill: "#e9dcc4" }, frame);
    el("circle", { cx: 75, cy: 80, r: 34, fill: "#d9a27a" }, frame);
    el("path", { d: "M30 186 Q75 110 120 186 Z", fill: "#5a6fa0" }, frame);
    el("path", { d: "M44 52 Q75 20 106 52 Q100 40 75 36 Q50 40 44 52 Z", fill: "#cfc9d6" }, frame);
    const candle = grp(props, { transform: "translate(280,1080)" });
    el("rect", { x: -18, y: 0, width: 36, height: 100, rx: 6, fill: "#f3ead9" }, candle);
    const flame = el("path", { d: "M0 -8 Q16 -38 0 -66 Q-16 -38 0 -8 Z", fill: "#ffcf6a" }, candle);
    const glow = el("circle", { cx: 280, cy: 1040, r: 300, fill: gradient([[0, "#ffd58a", 0.7], [1, "#ffd58a", 0]], { radial: true }) }, props);
    // sillón
    el("path", { d: "M560 1060 Q540 1400 600 1580 L1060 1580 L1080 1100 Q1060 1000 980 1000 L700 1000 Q580 1000 560 1060 Z", fill: "#7a4a66" }, props);
    // ventana
    const win = grp(props, { transform: "translate(470,230)" });
    el("rect", { width: 300, height: 380, rx: 10, fill: "#1a2255" }, win);
    el("circle", { cx: 210, cy: 90, r: 36, fill: "#fff4cf" }, win);
    el("rect", { width: 300, height: 380, rx: 10, fill: "none", stroke: "#d9c9a6", "stroke-width": 16 }, win);
    el("line", { x1: 150, y1: 0, x2: 150, y2: 380, stroke: "#d9c9a6", "stroke-width": 12 }, win);
    const light = el("rect", { x: -400, y: 0, width: 1800, height: 1700, fill: gradient([[0, "#fff0c0", 0], [1, "#fff0c0", 0.32]], { x1: 0, y1: 1, x2: 0, y2: 0 }), opacity: 0 }, props);
    return { props, flame, glow, light };
  }

  const wide = (lines, light0, light1, lift0, lift1, id, withBible) => ({
    lines,
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, lerp } = H_;
      const cam = grp(g);
      const r = livingRoom(cam, H_);
      const d = K().seated(r.props, H_, { skin: LOOK.skin, hair: { style: "bun", color: "#cfc9d6" }, shirt: ["#b9a3e0", "#8f78c4"], pants: ["#4a4560", "#575270"], shoe: "#4a3a30", glasses: true });
      if (withBible) { const b = H_.grp(r.props, { transform: "translate(520,1330) rotate(-14)" }); el("rect", { width: 150, height: 110, rx: 8, fill: "#4a2c1e" }, b); el("rect", { x: 10, y: 10, width: 130, height: 90, rx: 4, fill: "#f1e4c8" }, b); el("path", { d: "M75 10 L75 100", stroke: "#4a2c1e", "stroke-width": 4 }, b); }
      K().grain(g, H_, id);
      return (u, t) => {
        r.flame.setAttribute("transform", `scale(${1 + Math.sin(t * 9) * 0.06},${1 + Math.sin(t * 11) * 0.09})`);
        r.glow.setAttribute("opacity", 0.8 + Math.sin(t * 8) * 0.06);
        r.light.setAttribute("opacity", lerp(light0, light1, ease(u)));
        d.set({ lift: lerp(lift0, lift1, ease(seg(u, 0.3, 1))), breathe: Math.sin(t * 1.4) });
        cam.setAttribute("transform", `translate(540,700) scale(${1 + u * 0.06}) translate(-540,-700)`);
      };
    },
  });
  const close = (o) => ({
    ...(o.verses ? { verses: o.verses } : { lines: o.lines }),
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      el("rect", { width: 1080, height: 1920, fill: gradient(o.bg) }, cam);
      el("circle", { cx: 150, cy: 1100, r: 640, fill: gradient([[0, o.glow, o.glowA], [1, o.glow, 0]], { radial: true }) }, cam);
      const f = K().face(cam, H_, LOOK);
      K().grain(g, H_, o.id);
      return (u, t) => {
        const k = ease(seg(u, 0.15, 0.85));
        const blink = Math.max(0, 1 - Math.abs(((t * 0.4) % 1) - 0.5) * 40);
        f.set({ worry: o.worry[0] + (o.worry[1] - o.worry[0]) * k, lid: Math.max(blink, o.lid ? o.lid * Math.sin(Math.min(1, u * 1.2) * Math.PI) : 0), look: [o.look[0] + (o.look[2] - o.look[0]) * k, o.look[1] + (o.look[3] - o.look[1]) * k], mouth: o.mouth[0] + (o.mouth[1] - o.mouth[0]) * k, tear: o.tear ? ease(seg(u, 0.3, 1)) : 0, droop: o.droop[0] + (o.droop[1] - o.droop[0]) * k, tilt: o.tilt, warm: o.warm ? k : 0 });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 1.3) * 4})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1.02 + u * 0.07}) translate(-540,-900)`);
      };
    },
  });

  window.STORIES.salmo23 = {
    kicker: "Salmo 23:4",
    title: "El silencio de\nDoña Rosa",
    subtitle: "Historias de hoy",
    titleDur: 1.6, endDur: 3.2, lead: 0.3, tail: 0.4,
    next: { kicker: "Más palabras de consuelo", title: "Versículos\npara el duelo" },
    shots: [
      wide(["Doña Rosa lleva un año sin su compañero de toda la vida."], 0, 0, 0, 0, 41, false),
      close({ lines: ["Esta noche la casa está en silencio, y la tristeza pesa."], bg: [[0, "#3e3454"], [0.6, "#6a4f6e"], [1, "#9a6a6e"]], glow: "#ffd58a", glowA: 0.4, worry: [0.7, 0.85], look: [0.3, 0.6, -0.2, 0.7], mouth: [-0.55, -0.75], droop: [0.3, 0.4], tilt: 2, tear: true, id: 42 }),
      wide(["Abre su Biblia y encuentra unas palabras que conoce de memoria."], 0, 0.6, 0, 0.8, 43, true),
      close({ verses: ["PSA.23.4"], bg: [[0, "#6a5a9a"], [0.55, "#d79a8a"], [1, "#f6c487"]], glow: "#fff0c0", glowA: 0.95, worry: [0.55, 0.05], look: [0.1, 0.2, 0, -0.1], mouth: [-0.4, 0.9], droop: [0.25, 0.05], tilt: 1, warm: true, id: 44 }),
    ],
  };
})();
