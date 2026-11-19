/* Daniel y los leones — Daniel 6. El arte es nuestro; el texto sale literal de la Biblia RV1909. */
(() => {
  window.STORIES = window.STORIES || {};

  function torch(parent, H_, x, y) {
    const { grp, el } = H_;
    const g = grp(parent, { transform: `translate(${x},${y})` });
    const halo = el("circle", { cx: 0, cy: -150, r: 150, fill: H_.gradient([[0, "#ffb347", 0.5], [1, "#ffb347", 0]], { radial: true }) }, g);
    el("rect", { x: -7, y: -110, width: 14, height: 120, rx: 4, fill: "#3b2a1a" }, g);
    const flame = el("path", { d: "M 0 -118 Q 22 -150 4 -196 Q -2 -170 -22 -150 Q -18 -128 0 -118 Z", fill: "#ffb347" }, g);
    const core = el("path", { d: "M 0 -122 Q 10 -142 2 -166 Q -2 -150 -12 -142 Q -8 -128 0 -122 Z", fill: "#fff0b0" }, g);
    return (t, ph = 0) => {
      const k = 1 + Math.sin(t * 11 + ph) * 0.07 + Math.sin(t * 17 + ph * 2) * 0.04;
      flame.setAttribute("transform", `translate(0,-118) scale(${1 / k},${k}) translate(0,118)`);
      core.setAttribute("transform", `translate(0,-122) scale(${k},${k}) translate(0,122)`);
      halo.setAttribute("opacity", 0.8 + Math.sin(t * 9 + ph) * 0.15);
    };
  }

  function arch(parent, H_, x, w, h, color) {
    const { el } = H_;
    el("path", { d: `M ${x} 985 L ${x} ${985 - h} Q ${x + w / 2} ${985 - h - w * 0.55} ${x + w} ${985 - h} L ${x + w} 985 L ${x + w - 40} 985 L ${x + w - 40} ${985 - h} Q ${x + w / 2} ${985 - h - w * 0.4} ${x + 40} ${985 - h} L ${x + 40} 985 Z`, fill: color }, parent);
  }

  const shots = [];

  /* 1 — Daniel 6:16 — el foso */
  shots.push({
    verses: ["DAN.6.16"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, lerp, figure, lion, clip, stars, sky, groundLine, gradient, orb } = H_;
      const cam = grp(g);
      sky(cam, ["#0f1030", "#2b2149", "#51325a", "#7a4560"]);
      const st = stars(cam, 50, 4, 600);
      orb(cam, 800, 300, 46, "#e8e2c8", "#aab4ff", 3.6);
      // palacio
      const pal = grp(cam, { opacity: 0.95 });
      [60, 300, 540].forEach((x) => arch(pal, H_, x, 200, 330, "#2a2038"));
      el("rect", { x: 0, y: 700, width: 760, height: 285, fill: "#1b1428" }, pal);
      [100, 340, 580].forEach((x) => el("rect", { x, y: 770, width: 120, height: 215, fill: "#0b0814" }, pal));
      groundLine(cam, 985, "#2a2030");
      // foso
      el("ellipse", { cx: 700, cy: 1010, rx: 200, ry: 46, fill: "#07050a" }, cam);
      const eyes = [0, 1, 2].map((i) => {
        const e = grp(cam, { transform: `translate(${620 + i * 70},${1010 + (i % 2) * 8})` });
        el("circle", { cx: -9, cy: 0, r: 5, fill: "#ffd24a" }, e);
        el("circle", { cx: 9, cy: 0, r: 5, fill: "#ffd24a" }, e);
        return e;
      });
      const dG = grp(cam);
      clip(dG, 0, 0, 1080, 1004);
      const dan = figure(dG, { robe: "#d8d1c0", skin: "#3a261a", sleeve: "#d8d1c0", scale: 1.1, band: "#8a6a3a" });
      const rope = el("line", { stroke: "#b69a6a", "stroke-width": 6, "stroke-linecap": "round" }, cam);
      el("path", { d: "M 500 1012 Q 500 960 700 962 Q 900 960 900 1012 Q 900 1050 700 1052 Q 500 1050 500 1012 Z M 530 1012 Q 530 1036 700 1038 Q 870 1036 870 1012 Q 870 982 700 982 Q 530 982 530 1012 Z", fill: "#5a4a58", "fill-rule": "evenodd" }, cam);
      const sol = [0, 1].map((i) => figure(cam, { robe: i ? "#3a4a6a" : "#4a3a5a", skin: "#2b1d16", scale: 1.1, hood: "#8a8f99" }));
      const king = figure(cam, { robe: "#6b2f7a", skin: "#3a261a", sleeve: "#6b2f7a", scale: 1.25, crown: "#e0b64a", band: "#e0b64a" });
      const t1 = torch(cam, H_, 520, 985);
      const t2 = torch(cam, H_, 940, 985);
      return (u, t) => {
        const down = ease(seg(u, 0.2, 0.85));
        dan.place(700, 940 + down * 380, 1, 1);
        dan.arms(35, -35);
        rope.setAttribute("x1", 700);
        rope.setAttribute("y1", 700 + down * 380);
        rope.setAttribute("x2", 400);
        rope.setAttribute("y2", 800);
        sol.forEach((s, i) => {
          s.place(340 + i * 90, 985, 1, 1);
          s.arms(-55 + Math.sin(t * 2 + i) * 4, -70);
          s.sway(t, 0.8);
        });
        king.place(1000, 985, 1, -1);
        king.arms(20, -30);
        king.sway(t, 0.6);
        eyes.forEach((e, i) => e.setAttribute("opacity", 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + i * 1.7)) * ease(seg(u, 0.1, 0.5))));
        t1(t, 0);
        t2(t, 1.7);
        st(t);
        cam.setAttribute("transform", `translate(540,760) scale(${1.02 + u * 0.05}) translate(-540,-760)`);
      };
    },
  });

  /* 2 — Daniel 6:21-22 — el ángel cierra la boca de los leones */
  shots.push({
    verses: ["DAN.6.21", "DAN.6.22"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, lion, figure, angel, gradient, rng, orb } = H_;
      const cam = grp(g);
      H_.sky(cam, ["#0c0a12", "#1a1424", "#2a1d2a"]);
      // roca de la cueva
      const r = rng(5);
      const rock = (pts, c) => el("path", { d: `M ${pts.map((p) => p.join(" ")).join(" L ")} Z`, fill: c }, cam);
      rock([[0, 0], [260, 0], [200, 300], [120, 600], [160, 985], [0, 985]], "#1c1620");
      rock([[1080, 0], [820, 0], [880, 300], [960, 600], [920, 985], [1080, 985]], "#1c1620");
      rock([[0, 0], [1080, 0], [1080, 140], [800, 220], [540, 170], [280, 230], [0, 140]], "#150f19");
      el("rect", { x: 0, y: 985, width: 1080, height: 400, fill: "#2a2028" }, cam);
      const beam = el("path", { d: "M 400 120 L 680 120 L 800 985 L 280 985 Z", fill: gradient([[0, "#fff1c2", 0.5], [1, "#fff1c2", 0.08]]) }, cam);
      const motes = [];
      for (let i = 0; i < 22; i++) motes.push(el("circle", { r: 2 + r() * 3, fill: "#fff1c2", opacity: 0.7 }, cam));
      const lions = [
        { x: 210, flip: 1, s: 1.15 },
        { x: 880, flip: -1, s: 1.15 },
        { x: 120, flip: 1, s: 0.8 },
      ].map((o) => {
        const l = lion(cam, { color: "#7a5326", mane: "#4a2f14" });
        return { ...o, l };
      });
      const dan = figure(cam, { robe: "#d8d1c0", skin: "#3a261a", sleeve: "#d8d1c0", scale: 1.5, band: "#8a6a3a" });
      const ang = angel(cam);
      const halo = orb(cam, 540, 380, 60, "#fff8dc", "#ffe39a", 5);
      return (u, t) => {
        const a = ease(seg(u, 0.1, 0.45));
        dan.place(540, 1010, 1, 1);
        dan.arms(-20 - a * 105, 20 + a * 105 * -1);
        dan.arms(150 * a + 10, -150 * a - 10);
        dan.sway(t, 0.6);
        lions.forEach((o, i) => {
          o.l.g.setAttribute("transform", `translate(${o.x},${1010}) scale(${o.flip * o.s},${o.s * (1 + Math.sin(t * 1.6 + i) * 0.015)})`);
        });
        ang.g.setAttribute("transform", `translate(540,${540 - Math.sin(t * 1.3) * 12}) scale(1.35)`);
        ang.g.setAttribute("opacity", a);
        ang.wings.setAttribute("transform", `scale(1,${1 + Math.sin(t * 2) * 0.03})`);
        halo.halo.setAttribute("opacity", a);
        halo.core.setAttribute("opacity", 0);
        beam.setAttribute("opacity", a * (0.85 + Math.sin(t * 1.2) * 0.1));
        motes.forEach((m, i) => {
          m.setAttribute("cx", 380 + ((i * 53 + t * 18) % 320));
          m.setAttribute("cy", 985 - ((i * 97 + t * 40) % 800));
          m.setAttribute("opacity", a * 0.7);
        });
        cam.setAttribute("transform", `translate(540,720) scale(${1.0 + u * 0.05}) translate(-540,-720)`);
      };
    },
  });

  /* 3 — Daniel 6:23 — sacado del foso */
  shots.push({
    verses: ["DAN.6.23"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, lerp, figure, clip, rays, orb, bird, hills, groundLine, stars, sky } = H_;
      const cam = grp(g);
      sky(cam, ["#2c3e72", "#b88e92", "#f7c681", "#ffeab6"]);
      const sun = orb(cam, 540, 620, 90, "#fffbea", "#ffe1a0", 4.6);
      const rg = rays(cam, 540, 620, 18, 1500, "#fff1c8", 0.12);
      hills(cam, { y: 840, amp: 26, freq: 0.006, phase: 1.2, color: "#8a6a66", seed: 8 });
      groundLine(cam, 985, "#54403a");
      el("ellipse", { cx: 540, cy: 1010, rx: 200, ry: 46, fill: "#120d12" }, cam);
      const dG = grp(cam);
      clip(dG, 0, 0, 1080, 1006);
      const dan = figure(dG, { robe: "#f1ead8", skin: "#3a261a", sleeve: "#f1ead8", scale: 1.2, band: "#8a6a3a" });
      el("path", { d: "M 340 1012 Q 340 960 540 962 Q 740 960 740 1012 Q 740 1050 540 1052 Q 340 1050 340 1012 Z M 370 1012 Q 370 1036 540 1038 Q 710 1036 710 1012 Q 710 982 540 982 Q 370 982 370 1012 Z", fill: "#7a6a68", "fill-rule": "evenodd" }, cam);
      const rope = el("line", { stroke: "#b69a6a", "stroke-width": 6, "stroke-linecap": "round" }, cam);
      const sol = [0, 1].map((i) => figure(cam, { robe: i ? "#3a4a6a" : "#4a3a5a", skin: "#2b1d16", scale: 1.0, hood: "#8a8f99" }));
      const king = figure(cam, { robe: "#6b2f7a", skin: "#3a261a", sleeve: "#6b2f7a", scale: 1.25, crown: "#e0b64a", band: "#e0b64a" });
      const birds = [0, 1, 2, 3].map(() => bird(cam, "#4a3340"));
      return (u, t) => {
        const up = ease(seg(u, 0.1, 0.6));
        dan.place(540, 1010 + 330 - up * 330, 1, 1);
        dan.arms(150 * ease(seg(u, 0.5, 0.8)), -150 * ease(seg(u, 0.5, 0.8)));
        rope.setAttribute("x1", 540);
        rope.setAttribute("y1", 1010 + 330 - up * 330 - 300);
        rope.setAttribute("x2", 260);
        rope.setAttribute("y2", 800);
        sol.forEach((s, i) => {
          s.place(190 + i * 90, 985, 1, 1);
          s.arms(-50 + Math.sin(t * 3 + i) * 7, -60);
          s.sway(t, 0.8);
        });
        const joy = ease(seg(u, 0.35, 0.7));
        king.place(900, 985 - Math.abs(Math.sin(t * 4)) * 14 * joy, 1, -1);
        king.arms(150 * joy, -150 * joy);
        rg.setAttribute("transform", `rotate(${t * 2.5},540,620)`);
        rg.setAttribute("opacity", 0.4 + 0.6 * ease(seg(u, 0, 0.6)));
        sun.halo.setAttribute("r", 90 * (4 + ease(seg(u, 0, 0.7)) * 1.4));
        birds.forEach((b, i) => {
          b.g.setAttribute("transform", `translate(${150 + i * 230 + Math.sin(t * 0.8 + i) * 20},${240 + i * 44 + Math.sin(t * 1.1 + i) * 14}) scale(${0.9 + i * 0.1})`);
          b.flap(t, i);
        });
        cam.setAttribute("transform", `translate(540,760) scale(${1.1 - u * 0.05}) translate(-540,-760)`);
      };
    },
  });

  window.STORIES.daniel = {
    kicker: "Historias en 60 segundos · 3 de 3",
    title: "Daniel y\nlos leones",
    subtitle: "Daniel 6",
    next: { kicker: "Esta semana", title: "Tu plan de\nlectura" },
    shots,
  };
})();
