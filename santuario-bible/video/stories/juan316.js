/* «Las luces de la ciudad» — Juan 3:16 (RV1909, literal). Narración y personajes: ficción de Santuario Bíblico. */
(() => {
  window.STORIES = window.STORIES || {};
  const K = () => window.KIT;
  const LOOK = { skin: K().SKINS.medio, hair: { style: "ponytail", color: "#1f1524", hi: "#4a3a66" }, brow: "#1f1524", shirt: ["#58b8c8", "#3a93a6"], collar: "#2e7a8a", blush: "#ee7a6a" };

  function balcony(g, H_) {
    const { el, grp, gradient, rng } = H_;
    el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#171a48"], [0.5, "#3a3a7a"], [1, "#7a5a8a"]]) }, g);
    const r = rng(7);
    const stars = [];
    for (let i = 0; i < 40; i++) stars.push(el("circle", { cx: r() * 1080, cy: r() * 520, r: 1.5 + r() * 2.2, fill: "#fff", opacity: 0.6 }, g));
    el("circle", { cx: 860, cy: 220, r: 46, fill: "#fff4cf" }, g);
    el("circle", { cx: 860, cy: 220, r: 110, fill: gradient([[0, "#fff4cf", 0.35], [1, "#fff4cf", 0]], { radial: true }) }, g);
    // ciudad: edificios con ventanas encendidas
    const city = grp(g);
    const wins = [];
    const rr = rng(11);
    let x = -20;
    while (x < 1100) {
      const w = 90 + rr() * 90; const h = 220 + rr() * 330;
      el("rect", { x, y: 900 - h, width: w, height: h + 40, fill: "#14143a" }, city);
      for (let yy = 900 - h + 24; yy < 880; yy += 46) for (let xx = x + 14; xx < x + w - 24; xx += 34) if (rr() > 0.55) wins.push(el("rect", { x: xx, y: yy, width: 16, height: 22, fill: "#ffd98a", opacity: 0.55 + rr() * 0.4 }, city));
      x += w + 8;
    }
    el("rect", { y: 920, width: 1080, height: 1000, fill: gradient([[0, "#3a3550"], [1, "#221d33"]]) }, g);
    const props = grp(g, { transform: "translate(162,60) scale(0.7)" });
    // baranda
    el("rect", { x: -200, y: 1290, width: 1500, height: 24, fill: "#8a8aa8" }, props);
    for (let i = 0; i < 12; i++) el("rect", { x: -180 + i * 130, y: 1314, width: 12, height: 260, fill: "#6e6e90" }, props);
    const glow = el("circle", { cx: 540, cy: 1000, r: 600, fill: gradient([[0, "#ffd9a0", 0], [1, "#ffd9a0", 0]], { radial: true }) }, props);
    const dawn = el("rect", { x: -400, y: 0, width: 1800, height: 1700, fill: gradient([[0, "#ffd9a0", 0], [1, "#ffd9a0", 0.3]], { x1: 0, y1: 1, x2: 0, y2: 0 }), opacity: 0 }, props);
    return { props, wins, stars, dawn };
  }

  const wide = (lines, w0, w1, lift0, lift1, id, phone) => ({
    lines,
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, lerp } = H_;
      const cam = grp(g);
      const b = balcony(cam, H_);
      const d = K().seated(b.props, H_, { skin: LOOK.skin, hair: { style: "ponytail", color: "#1f1524" }, shirt: ["#58b8c8", "#3a93a6"], pants: ["#3a3a5a", "#46466a"] });
      const ph = H_.grp(b.props, { transform: "translate(560,1340)" });
      el("rect", { width: 56, height: 96, rx: 10, fill: "#1b1b2c" }, ph);
      const scr = el("rect", { x: 5, y: 6, width: 46, height: 84, rx: 7, fill: "#9ad0ff" }, ph);
      const pg = el("circle", { cx: 560, cy: 1300, r: 150, fill: H_.gradient([[0, "#9ad0ff", 0.4], [1, "#9ad0ff", 0]], { radial: true }) }, b.props);
      K().grain(g, H_, id);
      return (u, t) => {
        b.wins.forEach((w, i) => w.setAttribute("opacity", 0.45 + 0.4 * Math.abs(Math.sin(t * 0.7 + i))));
        b.dawn.setAttribute("opacity", lerp(w0, w1, ease(u)));
        scr.setAttribute("opacity", phone ? 1 : 0.2);
        pg.setAttribute("opacity", phone ? 0.9 : 0);
        d.set({ lift: lerp(lift0, lift1, ease(seg(u, 0.3, 1))), breathe: Math.sin(t * 1.5) });
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
        f.set({ worry: o.worry[0] + (o.worry[1] - o.worry[0]) * k, lid: Math.max(blink, o.lid ? o.lid * Math.sin(Math.min(1, u * 1.2) * Math.PI) : 0), look: [o.look[0] + (o.look[2] - o.look[0]) * k, o.look[1] + (o.look[3] - o.look[1]) * k], mouth: o.mouth[0] + (o.mouth[1] - o.mouth[0]) * k, tear: o.tear ? ease(seg(u, 0.35, 1)) : 0, droop: o.droop[0] + (o.droop[1] - o.droop[0]) * k, tilt: o.tilt, warm: o.warm ? k : 0 });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 1.3) * 4})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1.02 + u * 0.07}) translate(-540,-900)`);
      };
    },
  });

  window.STORIES.juan316 = {
    kicker: "Juan 3:16",
    title: "Las luces\nde la ciudad",
    subtitle: "Historias de hoy",
    titleDur: 1.6, endDur: 3.2, lead: 0.3, tail: 0.4,
    next: { kicker: "Más palabras de amor", title: "Versículos\npara el corazón" },
    shots: [
      wide(["Lucía vive en una ciudad enorme y, aun así, se siente invisible."], 0, 0, 0, 0, 51, true),
      close({ lines: ["Mira las luces y se pregunta si a alguien le importa."], bg: [[0, "#1f2255"], [0.6, "#4a4482"], [1, "#7a5a8a"]], glow: "#9ad0ff", glowA: 0.3, worry: [0.65, 0.85], look: [0.5, 0.5, -0.4, 0.6], mouth: [-0.5, -0.7], droop: [0.25, 0.35], tilt: 3, tear: true, id: 52 }),
      wide(["Entonces recuerda una de las frases más conocidas de la Biblia."], 0, 0.7, 0, 0.9, 53, false),
      close({ verses: ["JHN.3.16"], bg: [[0, "#5a6fb8"], [0.55, "#d79a85"], [1, "#f6c487"]], glow: "#fff0c0", glowA: 0.95, worry: [0.5, 0.05], look: [0.1, 0.2, 0, -0.1], mouth: [-0.3, 1], droop: [0.2, 0.03], tilt: 0, warm: true, id: 54 }),
    ],
  };
})();
