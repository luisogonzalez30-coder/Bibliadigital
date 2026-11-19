/* José y sus hermanos — Génesis 37, 39, 45 y 50. El arte es nuestro; el texto sale literal de la Biblia RV1909. */
(() => {
  window.STORIES = window.STORIES || {};
  const COAT = ["#c0392b", "#e0a526", "#2e7d5b", "#2f6fb0", "#8e44ad", "#e67e22", "#d84a8a", "#3aa6a0"];

  function desert(g, H_, { sky, sunX, sunY, sunColor, hills: hc, ground, stars = 40 }) {
    const { sky: skyF, stars: starsF, orb, hills, groundLine, el, W } = H_;
    skyF(g, sky);
    const st = starsF(g, stars, 5, 520);
    const sun = orb(g, sunX, sunY, 74, sunColor, "#ffd89a", 4);
    hills(g, { y: 800, amp: 38, freq: 0.0055, phase: 2, color: hc[0], seed: 3 });
    hills(g, { y: 890, amp: 30, freq: 0.0075, phase: 0.5, color: hc[1], seed: 9 });
    groundLine(g, 985, ground);
    el("rect", { x: -40, y: 985, width: W + 80, height: 14, fill: "#00000022" }, g);
    return { st, sun };
  }

  const shots = [];

  /* 1 — Génesis 37:3 — la túnica de colores */
  shots.push({
    verses: ["GEN.37.3"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, lerp, figure, orb } = H_;
      const cam = grp(g);
      const d = desert(cam, H_, {
        sky: ["#1c1f3f", "#5b476a", "#d98f62", "#f3c37d"],
        sunX: 820, sunY: 800, sunColor: "#fff0c2",
        hills: ["#4b3a55", "#392c43"], ground: "#2c2229",
      });
      // tiendas
      [[90, 1], [250, 0.8]].forEach(([x, k]) => el("path", { d: `M ${x} 985 L ${x + 90 * k} ${985 - 120 * k} L ${x + 180 * k} 985 Z`, fill: "#241a24" }, cam));
      const jac = figure(cam, { robe: "#6f6a78", skin: "#2b1d16", sleeve: "#6f6a78", hood: "#e9e4d8", scale: 1.5 });
      el("line", { x1: -64, y1: 10, x2: -64, y2: -330, stroke: "#5a3b1f", "stroke-width": 9, "stroke-linecap": "round" }, jac.root);
      const jos = figure(cam, { robe: "#8a6a4a", skin: "#3a261a", sleeve: "#8a6a4a", scale: 1.15, stripes: COAT });
      const glow = orb(cam, 0, 0, 40, "#ffe2a0", "#ffd27a", 5);
      return (u, t) => {
        const k = ease(seg(u, 0.1, 0.5));
        jac.place(390, 985, 1, 1);
        jac.arms(-60 - k * 10, -55 + Math.sin(t * 2) * 2);
        jac.sway(t, 0.6);
        jos.place(lerp(820, 640, ease(seg(u, 0, 0.35))), 985 - Math.abs(Math.sin(t * 3)) * 3, 1, -1);
        jos.arms(10 + Math.sin(t * 3) * 3, k > 0.5 ? -150 : -10);
        jos.sway(t, 1.1);
        glow.core.setAttribute("opacity", 0);
        glow.halo.setAttribute("cx", 640);
        glow.halo.setAttribute("cy", 640);
        glow.halo.setAttribute("r", 40 * (2 + k * 2.2));
        glow.halo.setAttribute("opacity", k);
        d.st(t);
        cam.setAttribute("transform", `translate(540,700) scale(${1.02 + u * 0.05}) translate(-540,-700)`);
      };
    },
  });

  /* 2 — Génesis 37:28 — vendido por veinte piezas de plata */
  shots.push({
    verses: ["GEN.37.28"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, lerp, clamp, figure, camel, clip, orb } = H_;
      const cam = grp(g);
      const d = desert(cam, H_, {
        sky: ["#2a2142", "#7a4a5a", "#e48a52", "#f7c06a"],
        sunX: 300, sunY: 760, sunColor: "#ffe7b0",
        hills: ["#5a3f4a", "#43303c"], ground: "#33241f",
      });
      // cisterna
      const pit = grp(cam, { transform: "translate(250,985)" });
      el("ellipse", { cx: 0, cy: 18, rx: 150, ry: 34, fill: "#1a110d" }, pit);
      const pitFront = grp(cam, { transform: "translate(250,985)" });
      el("path", { d: "M -170 18 Q -170 -22 0 -22 Q 170 -22 170 18 Q 170 50 0 50 Q -170 50 -170 18 Z M -128 18 Q -128 40 0 40 Q 128 40 128 18 Q 128 -6 0 -6 Q -128 -6 -128 18 Z", fill: "#6b5a4a", "fill-rule": "evenodd" }, pitFront);
      const joseG = grp(cam);
      clip(joseG, 0, 0, 1080, 1000);
      const jos = figure(joseG, { robe: "#8a6a4a", skin: "#3a261a", sleeve: "#8a6a4a", scale: 0.9, stripes: COAT });
      const bros = [0, 1].map((i) => figure(cam, { robe: i ? "#4a3f5a" : "#5a4a3a", skin: "#2b1d16", scale: 1.05, hood: i ? "#2e2438" : "#3d2e22" }));
      const rope = el("line", { stroke: "#b69a6a", "stroke-width": 5, "stroke-linecap": "round" }, cam);
      // caravana
      const car = grp(cam);
      const camels = [0, 1].map((i) => camel(car, { color: i ? "#7a5632" : "#6b4a2b" }));
      const merch = figure(car, { robe: "#a8472e", skin: "#2b1d16", scale: 0.85, hood: "#e8dcc2" });
      const coins = [0, 1, 2, 3, 4, 5, 6, 7].map(() => el("circle", { r: 13, fill: "#e9e4d8", stroke: "#a89f8a", "stroke-width": 3, opacity: 0 }, cam));
      return (u, t) => {
        const rise = ease(seg(u, 0.05, 0.4));
        jos.place(250, 985 + 330 - rise * 330 + 40, 1, 1);
        jos.arms(-20 - rise * 30, 20);
        bros.forEach((b, i) => {
          b.place(430 + i * 90, 985, 1, -1);
          b.arms(-50 + Math.sin(t * 3 + i) * 6, -60);
          b.sway(t, 0.7);
        });
        rope.setAttribute("x1", 250);
        rope.setAttribute("y1", 985 + 40 - rise * 330 + 330 - 200);
        rope.setAttribute("x2", 410);
        rope.setAttribute("y2", 985 - 150);
        // caravana cruza
        const cx = lerp(1250, -380, ease(seg(u, 0.35, 1)));
        camels.forEach((c, i) => {
          c.g.setAttribute("transform", `translate(${cx + i * 240},${985 + Math.sin(t * 4 + i) * 2}) scale(-1,1)`);
          c.legs.forEach((l, j) => l.setAttribute("transform", `translate(${[-48, -26, 28, 50][j]},20) rotate(${Math.sin(t * 4 + j * 1.6) * 14})`));
        });
        merch.place(cx + 520, 985, 1, -1);
        merch.arms(8, -12);
        // monedas
        coins.forEach((c, i) => {
          const k = clamp((u - 0.55 - i * 0.02) / 0.25);
          c.setAttribute("cx", 470 + i * 26 + Math.sin(i * 2.1) * 20);
          c.setAttribute("cy", 985 - 180 + k * 190 - Math.sin(k * Math.PI) * 120);
          c.setAttribute("opacity", k > 0 && k < 1 ? 1 : k >= 1 ? 0.95 : 0);
        });
        d.st(t);
        cam.setAttribute("transform", `translate(540,700) scale(${1.03 + u * 0.03}) translate(-540,-700)`);
      };
    },
  });

  /* 3 — Génesis 39:2 — Jehová con José en Egipto */
  shots.push({
    verses: ["GEN.39.2"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, figure, palm, rays, orb, gradient, W } = H_;
      const cam = grp(g);
      H_.sky(cam, ["#1d2b52", "#6a6a8a", "#f0b56e", "#ffe2a0"]);
      const st = H_.stars(cam, 30, 12, 420);
      orb(cam, 540, 700, 90, "#fff3cf", "#ffd89a", 4.2);
      const pyr = (x, w, h, c1, c2) => {
        el("path", { d: `M ${x} 900 L ${x + w / 2} ${900 - h} L ${x + w} 900 Z`, fill: c1 }, cam);
        el("path", { d: `M ${x + w / 2} ${900 - h} L ${x + w} 900 L ${x + w / 2 + 20} 900 Z`, fill: c2 }, cam);
      };
      pyr(60, 420, 330, "#c9925a", "#a0703f");
      pyr(420, 520, 400, "#d9a366", "#b07c48");
      H_.groundLine(cam, 900, "#caa06a");
      el("rect", { x: 0, y: 960, width: W, height: 60, fill: gradient([[0, "#2f6a7a", 0.9], [1, "#1f4d5e", 0.9]]) }, cam);
      const p1 = palm(cam, 130, 975, 0.9);
      const p2 = palm(cam, 950, 975, 1.05);
      const beam = el("path", { d: "M 340 0 L 740 0 L 650 1000 L 430 1000 Z", fill: gradient([[0, "#fff1c2", 0.0], [0.5, "#fff1c2", 0.3], [1, "#fff1c2", 0.12]]) }, cam);
      const halo = orb(cam, 540, 700, 60, "#ffe9b0", "#ffd27a", 5);
      const jos = figure(cam, { robe: "#f1ead8", skin: "#3a261a", sleeve: "#f1ead8", scale: 1.3, band: "#c9a25b" });
      el("rect", { x: -32, y: -300, width: 64, height: 36, rx: 8, fill: "#1a1411" }, jos.body);
      return (u, t) => {
        jos.place(540, 1010, 1, 1);
        jos.arms(-30 - ease(seg(u, 0.1, 0.5)) * 110, 30 + ease(seg(u, 0.1, 0.5)) * -110 * -1);
        jos.arms(40 + ease(seg(u, 0.1, 0.5)) * 100, -40 - ease(seg(u, 0.1, 0.5)) * 100);
        jos.sway(t, 0.8);
        [p1, p2].forEach((p, pi) => p.fronds.forEach((f, i) => f.setAttribute("transform", `translate(2,-240) rotate(${[-70, -35, 0, 35, 70][i] + Math.sin(t * 1.5 + i + pi) * 4})`)));
        beam.setAttribute("opacity", 0.5 + 0.5 * ease(seg(u, 0, 0.4)) + Math.sin(t * 1.4) * 0.1);
        halo.halo.setAttribute("cy", 700);
        st(t);
        cam.setAttribute("transform", `translate(540,760) scale(${1.02 + u * 0.04}) translate(-540,-760)`);
      };
    },
  });

  /* 4 — Génesis 45:7 — Dios me envió delante de vosotros */
  shots.push({
    verses: ["GEN.45.7"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, lerp, figure, orb, hills, groundLine } = H_;
      const cam = grp(g);
      H_.sky(cam, ["#27345e", "#8a6f7a", "#f1b86f", "#fde3a1"]);
      const st = H_.stars(cam, 24, 8, 380);
      orb(cam, 540, 720, 80, "#fff3cf", "#ffd89a", 4.4);
      hills(cam, { y: 850, amp: 26, freq: 0.006, phase: 1, color: "#8a6a3a", seed: 3 });
      groundLine(cam, 960, "#6e5230");
      // trigo
      const wheat = grp(cam);
      const stalks = [];
      for (let i = 0; i < 46; i++) {
        const x = (i / 45) * 1120 - 20;
        const y = 975 + (i % 3) * 14;
        const sg = grp(wheat, { transform: `translate(${x},${y})` });
        el("line", { x1: 0, y1: 0, x2: 0, y2: -150 - (i % 4) * 14, stroke: "#c9a04a", "stroke-width": 5 }, sg);
        [0, 1, 2, 3].forEach((j) => {
          el("ellipse", { cx: j % 2 ? 7 : -7, cy: -150 - (i % 4) * 14 - j * 16, rx: 5, ry: 11, fill: "#e6bd5a" }, sg);
        });
        stalks.push(sg);
      }
      const jos = figure(cam, { robe: "#f1ead8", skin: "#3a261a", sleeve: "#f1ead8", scale: 1.35, band: "#c9a25b", crown: "#c9a25b" });
      el("path", { d: "M -34 -228 Q 0 -196 34 -228 L 28 -214 Q 0 -184 -28 -214 Z", fill: "#c9a25b" }, jos.body);
      const bros = [0, 1, 2].map((i) => figure(cam, { robe: ["#5a4a3a", "#4a3f5a", "#3a4a4a"][i], skin: "#2b1d16", scale: 0.9 }));
      return (u, t) => {
        jos.place(640, 1000, 1, -1);
        jos.arms(-20 - ease(seg(u, 0, 0.4)) * 70, -90 - ease(seg(u, 0.1, 0.5)) * 20);
        jos.arms(60 + ease(seg(u, 0.1, 0.5)) * 30, -60 - ease(seg(u, 0.1, 0.5)) * 30);
        jos.sway(t, 0.7);
        bros.forEach((b, i) => {
          const bow = ease(seg(u, 0.35 + i * 0.1, 0.7 + i * 0.1));
          b.place(220 + i * 110, 1005 + bow * 10, 1, 1, bow * 18);
          b.arms(20 + bow * 30, -20 - bow * 30);
        });
        stalks.forEach((s, i) => {
          const x = (i / 45) * 1120 - 20;
          s.setAttribute("transform", `translate(${x},${975 + (i % 3) * 14}) rotate(${Math.sin(t * 1.6 + i * 0.5) * 3})`);
        });
        st(t);
        cam.setAttribute("transform", `translate(540,800) scale(${1.03 + u * 0.04}) translate(-540,-800)`);
      };
    },
  });

  /* 5 — Génesis 50:20 — Dios lo encaminó a bien */
  shots.push({
    verses: ["GEN.50.20"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, seg, figure, rays, bird, orb, hills, groundLine } = H_;
      const cam = grp(g);
      H_.sky(cam, ["#2f4272", "#b88a86", "#f6c47e", "#ffeab8"]);
      const sun = orb(cam, 540, 660, 90, "#fffbea", "#ffe1a0", 4.6);
      const rg = rays(cam, 540, 660, 18, 1500, "#fff1c8", 0.12);
      hills(cam, { y: 860, amp: 24, freq: 0.006, phase: 0.5, color: "#7a5a54", seed: 6 });
      groundLine(cam, 985, "#4a3430");
      const bro = figure(cam, { robe: "#5a4a3a", skin: "#2b1d16", scale: 1.3, hood: "#3d2e22" });
      const jos = figure(cam, { robe: "#c9a25b", skin: "#3a261a", sleeve: "#b8924a", scale: 1.3, stripes: COAT.slice(0, 1).concat(["#c9a25b"]) });
      const jos2 = figure(cam, { robe: "#e9d5a0", skin: "#3a261a", sleeve: "#d9c38a", scale: 1.3, band: "#c9a25b", crown: "#c9a25b" });
      const birds = [0, 1, 2, 3, 4].map(() => bird(cam, "#4a3340"));
      return (u, t) => {
        const emb = ease(seg(u, 0.15, 0.6));
        bro.place(440 + emb * 40, 1000 + (1 - emb) * 6, 1, 1, (1 - emb) * 8);
        bro.arms(30 - emb * 140, -30 + emb * 40);
        jos2.place(660 - emb * 40, 1000, 1, -1);
        jos2.arms(30 - emb * 140, -30 + emb * 40);
        jos.place(-400, 1000);
        bro.sway(t, 0.5);
        jos2.sway(t, 0.5);
        rg.setAttribute("transform", `rotate(${t * 2.5},540,660)`);
        rg.setAttribute("opacity", 0.4 + 0.6 * ease(seg(u, 0.1, 0.6)));
        sun.halo.setAttribute("r", 90 * (4 + ease(seg(u, 0, 0.7)) * 1.6));
        birds.forEach((b, i) => {
          b.g.setAttribute("transform", `translate(${160 + i * 190 + Math.sin(t * 0.8 + i) * 20},${230 + i * 38 + Math.sin(t * 1.1 + i) * 14}) scale(${0.9 + i * 0.1})`);
          b.flap(t, i);
        });
        cam.setAttribute("transform", `translate(540,760) scale(${1.1 - u * 0.05}) translate(-540,-760)`);
      };
    },
  });

  window.STORIES.jose = {
    kicker: "Historias en 60 segundos · 2 de 3",
    title: "José y sus\nhermanos",
    subtitle: "Génesis 37, 39, 45 y 50",
    next: { kicker: "Mañana", title: "Daniel y\nlos leones" },
    shots,
  };
})();
