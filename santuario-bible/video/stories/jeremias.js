/* «La caja de Matías» — Jeremías 29:11 (RV1909, literal). Narración y personajes: ficción de Santuario Bíblico. */
(() => {
  window.STORIES = window.STORIES || {};
  const K = () => window.KIT;
  const LOOK = { skin: K().SKINS.moreno, hair: { style: "beard", color: "#1d1a2e", hi: "#4a4470" }, brow: "#1d1a2e", stubble: true, shirt: ["#6f8fd8", "#4d6bb0"], collar: "#3d5590" };

  function apartment(g, H_, p) {
    // p: 0 (noche) .. 1 (amanecer)
    const { el, grp, gradient, lerp } = H_;
    const wall = el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#3b4468"], [0.55, "#6f6f9a"], [1, "#a47e8e"]]) }, g);
    el("rect", { y: 921, width: 1080, height: 1000, fill: gradient([[0, "#a9764a"], [1, "#5e3a24"]]) }, g);
    for (let i = 0; i < 14; i++) el("line", { x1: 0, y1: 950 + i * 60, x2: 1080, y2: 950 + i * 60, stroke: "#3b2314", "stroke-opacity": 0.3, "stroke-width": 3 }, g);
    const props = grp(g, { transform: "translate(162,60) scale(0.7)" });
    // ventana con cielo que amanece
    const win = grp(props, { transform: "translate(70,260)" });
    const skyG = K().vgrad(H_, "#1d2455", "#3a3c7a");
    const cp = el("clipPath", { id: "winclip" }, H_.getDefs());
    el("rect", { width: 330, height: 420, rx: 10 }, cp);
    const inner = grp(win, { "clip-path": "url(#winclip)" });
    const sky = el("rect", { width: 330, height: 420, rx: 10, fill: skyG.fill }, inner);
    const sun = el("circle", { cx: 165, cy: 360, r: 60, fill: "#ffe6a8" }, inner);
    el("path", { d: "M0 400 L40 330 L60 330 L60 280 L110 280 L110 345 L150 345 L150 300 L200 300 L200 360 L250 360 L250 320 L330 320 L330 420 L0 420 Z", fill: "#1a1a3a", opacity: 0.85 }, inner);
    el("rect", { width: 330, height: 420, rx: 10, fill: "none", stroke: "#e6d9bc", "stroke-width": 16 }, win);
    el("line", { x1: 165, y1: 0, x2: 165, y2: 420, stroke: "#e6d9bc", "stroke-width": 12 }, win);
    const beam = el("path", { d: "M70 680 L400 680 L860 1500 L-80 1500 Z", fill: gradient([[0, "#ffd9a0", 0.55], [1, "#ffd9a0", 0]], { x1: 0, y1: 0, x2: 0, y2: 1 }) }, props);
    // mesa con la caja
    el("rect", { x: 40, y: 1200, width: 500, height: 40, rx: 8, fill: "#7a4a2a" }, props);
    el("rect", { x: 80, y: 1240, width: 36, height: 340, fill: "#6a3e22" }, props);
    el("rect", { x: 460, y: 1240, width: 36, height: 340, fill: "#6a3e22" }, props);
    const box = grp(props, { transform: "translate(110,1020)" });
    el("path", { d: "M0 60 L330 60 L310 180 L20 180 Z", fill: "#c89a5c" }, box);
    el("path", { d: "M0 60 L-20 20 L120 20 L120 60 Z", fill: "#d9b070" }, box);
    el("path", { d: "M330 60 L350 20 L210 20 L210 60 Z", fill: "#d9b070" }, box);
    el("path", { d: "M80 62 Q100 -40 130 20 Q160 -60 190 30 Q210 -30 230 60 Z", fill: "#3f9a5c" }, box); // planta
    el("rect", { x: 230, y: 20, width: 60, height: 50, rx: 8, fill: "#f1e2c4" }, box); // taza
    el("path", { d: "M10 70 L300 70", stroke: "#a87a3e", "stroke-width": 4 }, box);
    el("path", { d: "M40 60 L52 -10 L66 60 Z", fill: "#c0392b" }, box); // corbata
    return { sky, sun, beam, set(pp) {
      const top = ["#1d2455", "#3a3c7a"]; const dawnTop = ["#5a6fb8", "#f3a96c"];
      skyG.set(K().mix(top[0], dawnTop[0], pp), K().mix(top[1], dawnTop[1], pp));
      sun.setAttribute("cy", 460 - pp * 140); sun.setAttribute("opacity", 0.3 + pp * 0.7);
      beam.setAttribute("opacity", pp);
    }, props };
  }
  function lerpC(a, b, t) {
    const pa = a.match(/\w\w/g).map((x) => parseInt(x, 16)); const pb = b.match(/\w\w/g).map((x) => parseInt(x, 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  const shots = [];
  const wideShot = (lines, p0, p1, lift0, lift1, id) => ({
    lines,
    build(g, { helpers: H_ }) {
      const { grp, ease, seg, lerp } = H_;
      const cam = grp(g);
      const a = apartment(cam, H_, 0);
      const d = K().seated(a.props, H_, { skin: LOOK.skin, hair: { style: "short", color: "#1d1a2e" }, shirt: ["#6f8fd8", "#4d6bb0"], pants: ["#33384f", "#3d4260"] });
      K().grain(g, H_, id);
      return (u, t) => {
        a.set(lerp(p0, p1, ease(u)));
        d.set({ lift: lerp(lift0, lift1, ease(seg(u, 0.3, 1))), breathe: Math.sin(t * 1.6) });
        cam.setAttribute("transform", `translate(540,700) scale(${1 + u * 0.06}) translate(-540,-700)`);
      };
    },
  });
  shots.push(wideShot(["Matías guardó seis años de trabajo en una caja de cartón."], 0, 0.1, 0, 0, 21));
  shots.push({
    lines: ["Hoy lo despidieron, y el futuro le parece un cuarto vacío."],
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#363f66"], [0.6, "#5f5f8c"], [1, "#8d6f85"]]) }, cam);
      el("circle", { cx: 900, cy: 900, r: 520, fill: gradient([[0, "#ffd58a", 0.25], [1, "#ffd58a", 0]], { radial: true }) }, cam);
      const f = K().face(cam, H_, LOOK);
      K().grain(g, H_, 22);
      return (u, t) => {
        const blink = Math.max(0, 1 - Math.abs(((t * 0.45) % 1) - 0.5) * 40);
        f.set({ worry: 0.6 + 0.25 * ease(seg(u, 0.1, 0.7)), lid: blink, look: [0.4 + Math.sin(t * 0.8) * 0.5, 0.55], mouth: -0.55, droop: 0.25, tilt: 2 });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 1.4) * 4})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1 + u * 0.08}) translate(-540,-900)`);
      };
    },
  });
  shots.push(wideShot(["Pero al amanecer, recuerda unas palabras."], 0.1, 1, 0, 0.9, 23));
  shots.push({
    verses: ["JER.29.11"],
    build(g, { helpers: H_ }) {
      const { grp, el, gradient, ease, seg } = H_;
      const cam = grp(g);
      el("rect", { width: 1080, height: 1920, fill: gradient([[0, "#5a6fb8"], [0.55, "#d79a85"], [1, "#f6c487"]]) }, cam);
      el("circle", { cx: 900, cy: 1000, r: 760, fill: gradient([[0, "#fff0c0", 0.95], [1, "#fff0c0", 0]], { radial: true }) }, cam);
      const f = K().face(cam, H_, LOOK);
      K().grain(g, H_, 24);
      return (u, t) => {
        const relief = ease(seg(u, 0.1, 0.85));
        const blink = Math.max(0, 1 - Math.abs(((t * 0.4 + 0.3) % 1) - 0.5) * 40);
        f.set({ worry: 0.7 - 0.65 * relief, lid: blink, look: [0.3 - relief * 0.7, 0.2 - relief * 0.4], mouth: -0.5 + 1.3 * relief, droop: 0.22 - 0.16 * relief, warm: 0, tilt: 2 - relief * 3 });
        f.root.setAttribute("transform", `translate(0,${Math.sin(t * 1.3) * 5})`);
        cam.setAttribute("transform", `translate(540,900) scale(${1.07 - u * 0.03}) translate(-540,-900)`);
      };
    },
  });

  window.STORIES.jeremias = {
    kicker: "Jeremías 29:11",
    title: "La caja\nde Matías",
    subtitle: "Historias de hoy",
    titleDur: 1.6, endDur: 3.2, lead: 0.3, tail: 0.4,
    next: { kicker: "Más palabras de paz", title: "Versículos\npara la esperanza" },
    shots,
  };
})();
