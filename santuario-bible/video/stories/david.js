/* David y Goliat — 1 Samuel 17. El arte es nuestro; el texto sale literal de la Biblia RV1909. */
(() => {
  window.STORIES = window.STORIES || {};

  const BRONZE = "#8a5a2b";
  const BRONZE_D = "#5e3b1c";

  function valley(g, H_, { skyColors, sunX, sunY, sunColor, hillColors, ground, rayOp = 0 }) {
    const { W, sky, orb, hills, groundLine, stars, rng, el, grp, rays } = H_;
    sky(g, skyColors);
    const st = stars(g, 40, 3, 500);
    const sun = orb(g, sunX, sunY, 80, sunColor, "#ffd89a", 4);
    const rayG = rayOp ? rays(g, sunX, sunY, 16, 1500, "#fff0c2", rayOp) : null;
    const h1 = hills(g, { y: 820, amp: 36, freq: 0.006, phase: 1, color: hillColors[0], seed: 4 });
    const h2 = hills(g, { y: 900, amp: 28, freq: 0.008, phase: 3, color: hillColors[1], seed: 7 });
    // campamentos lejanos
    const camp = grp(g);
    const r = rng(11);
    for (let i = 0; i < 6; i++) {
      const x = 40 + i * 62 + r() * 20;
      el("path", { d: `M ${x} 900 L ${x + 26} 862 L ${x + 52} 900 Z`, fill: hillColors[1], opacity: 0.9 }, camp);
    }
    for (let i = 0; i < 5; i++) {
      const x = 780 + i * 56 + r() * 16;
      el("path", { d: `M ${x} 900 L ${x + 26} 868 L ${x + 52} 900 Z`, fill: hillColors[1], opacity: 0.9 }, camp);
    }
    groundLine(g, 985, ground);
    el("rect", { x: -40, y: 985, width: W + 80, height: 14, fill: "#00000022" }, g);
    return { st, sun, h1, h2, rayG, sunX, sunY };
  }

  function goliath(parent, H_) {
    const { el, grp, figure } = H_;
    const f = figure(parent, { robe: "#4a2a1c", skin: "#2a1a12", sleeve: "#4a2a1c", scale: 1.95 });
    // armadura
    el("rect", { x: -34, y: -228, width: 68, height: 96, rx: 12, fill: BRONZE }, f.body);
    el("rect", { x: -34, y: -190, width: 68, height: 8, fill: BRONZE_D }, f.body);
    el("path", { d: "M -36 -272 Q -38 -322 0 -326 Q 38 -322 36 -272 Z", fill: BRONZE }, f.body);
    el("path", { d: "M -4 -326 Q 0 -352 28 -346 Q 8 -340 6 -326 Z", fill: "#9a2b1c" }, f.body);
    el("rect", { x: -38, y: -278, width: 76, height: 9, fill: BRONZE_D }, f.body);
    // escudo en el brazo izquierdo
    el("circle", { cx: -8, cy: 96, r: 78, fill: BRONZE_D }, f.armL);
    el("circle", { cx: -8, cy: 96, r: 62, fill: BRONZE }, f.armL);
    el("circle", { cx: -8, cy: 96, r: 18, fill: "#d9b36a" }, f.armL);
    // lanza (independiente del cuerpo para que no flote al caer)
    const spear = grp(parent);
    el("line", { x1: 0, y1: 0, x2: 0, y2: -780, stroke: "#3b2a1a", "stroke-width": 11, "stroke-linecap": "round" }, spear);
    el("path", { d: "M -17 -776 L 0 -860 L 17 -776 Z", fill: "#cfd2d6" }, spear);
    f.spearAt = (x, y, rot = 0) => spear.setAttribute("transform", `translate(${x},${y}) rotate(${rot})`);
    f.spearAt(-300, 985);
    return f;
  }

  function tinySoldier(parent, H_, x, y, s, robe) {
    const { figure, el } = H_;
    const f = figure(parent, { robe, skin: "#1d1612", scale: s });
    el("line", { x1: 60, y1: 0, x2: 60, y2: -300, stroke: "#2a1d12", "stroke-width": 8 }, f.root);
    f.place(x, y);
    return f;
  }

  const shots = [];

  /* Toma 1 — 1 Samuel 17:4 — Goliat aparece */
  shots.push({
    verses: ["1SA.17.4"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, lerp, seg, W } = H_;
      const cam = grp(g);
      const v = valley(cam, H_, {
        skyColors: ["#191d38", "#5a4457", "#d4915c", "#f0c27a"],
        sunX: 760, sunY: 780, sunColor: "#fff0c2",
        hillColors: ["#4a3a4a", "#3a2c36"], ground: "#2a1f24",
      });
      const army = grp(cam);
      const soldiers = [0, 1, 2, 3, 4].map((i) => tinySoldier(army, H_, 90 + i * 70, 985, 0.34, "#2b2a3a"));
      const gol = goliath(cam, H_);
      return (u, t) => {
        const k = ease(seg(u, 0.02, 0.7));
        const x = lerp(1120, 760, k);
        gol.place(x, 985 + Math.sin(t * 3) * 3 * (1 - k), 1, -1);
        gol.arms(6 + Math.sin(t * 2.4) * 3, -6);
        gol.spearAt(x + 175, 990, Math.sin(t * 1.2) * 1.2);
        gol.sway(t, 1);
        soldiers.forEach((s, i) => s.place(90 + i * 70 - ease(seg(u, 0.3, 0.9)) * 22, 985 + Math.sin(t * 5 + i) * 2, 1, 1));
        v.st(t);
        cam.setAttribute("transform", `translate(540,700) scale(${1 + u * 0.05}) translate(-540,-700)`);
      };
    },
  });

  /* Toma 2 — 1 Samuel 17:45 — «en el nombre de Jehová» */
  shots.push({
    verses: ["1SA.17.45"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, lerp, seg, rays, figure, orb } = H_;
      const cam = grp(g);
      const v = valley(cam, H_, {
        skyColors: ["#1f2a4d", "#6b5163", "#e3a468", "#f6d28d"],
        sunX: 540, sunY: 560, sunColor: "#fff3cd",
        hillColors: ["#54405a", "#3d2f3e"], ground: "#2e2228",
      });
      const beamG = grp(cam);
      el("path", { d: "M 150 0 L 330 0 L 420 990 L 90 990 Z", fill: H_.gradient([[0, "#fff0c2", 0.0], [0.5, "#fff0c2", 0.22], [1, "#fff0c2", 0.0]], { x1: 0, y1: 0, x2: 0, y2: 1 }) }, beamG);
      const gol = goliath(cam, H_);
      const dav = figure(cam, { robe: "#c9a25b", skin: "#3a261a", sleeve: "#b8924a", scale: 1.15, hood: "#7a4a24", band: "#7a4a24" });
      const staff = el("line", { x1: 0, y1: 120, x2: 0, y2: -260, stroke: "#5a3b1f", "stroke-width": 9, "stroke-linecap": "round" }, dav.armR);
      return (u, t) => {
        const k = ease(seg(u, 0, 0.85));
        dav.place(lerp(190, 360, k), 985 + Math.abs(Math.sin(t * 4.2)) * -4, 1, 1);
        dav.arms(-165 + Math.sin(t * 2) * 4, 14);
        dav.sway(t, 1.2);
        gol.place(800, 985, 1, -1);
        gol.arms(8, -8);
        gol.spearAt(975, 990, -3 + k * 5);
        beamG.setAttribute("opacity", 0.55 + Math.sin(t * 1.5) * 0.2);
        v.st(t);
        cam.setAttribute("transform", `translate(540,700) scale(${1.03 + u * 0.03}) translate(-540,-700)`);
      };
    },
  });

  /* Toma 3 — 1 Samuel 17:49 — la honda y la piedra */
  shots.push({
    verses: ["1SA.17.49"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, easeOut, lerp, seg, clamp, figure, gradient } = H_;
      const cam = grp(g);
      const v = valley(cam, H_, {
        skyColors: ["#222d52", "#78566a", "#eaae72", "#f8dc9a"],
        sunX: 540, sunY: 520, sunColor: "#fff6d8",
        hillColors: ["#5a455f", "#43344a"], ground: "#33252b",
      });
      const gol = goliath(cam, H_);
      const dav = figure(cam, { robe: "#c9a25b", skin: "#3a261a", sleeve: "#b8924a", scale: 1.25, hood: "#7a4a24", band: "#7a4a24" });
      const slingG = grp(cam);
      const slingLine = el("line", { stroke: "#2a1b10", "stroke-width": 4, "stroke-linecap": "round" }, slingG);
      const stone = el("circle", { r: 13, fill: "#6e6a66", stroke: "#3b3835", "stroke-width": 3 }, slingG);
      const trail = [0, 1, 2, 3].map((i) => el("circle", { r: 10 - i * 2, fill: "#d9c9a8", opacity: 0 }, slingG));
      const flash = el("circle", { cx: 0, cy: 0, r: 10, fill: gradient([[0, "#ffffff", 1], [0.4, "#ffe3a0", 0.7], [1, "#ffd27a", 0]], { radial: true }), opacity: 0 }, cam);
      const dust = [0, 1, 2, 3, 4].map(() => el("circle", { r: 20, fill: "#b79d7d", opacity: 0 }, cam));

      const DX = 270;
      const GX = 800;
      const GY = 985;
      const forehead = { x: GX - 20, y: GY - 1.95 * 262 };
      const handAt = (a) => {
        const s = 1.25;
        const rad = (a * Math.PI) / 180;
        return { x: DX - 36 * s - 106 * s * Math.sin(rad), y: 985 - 222 * s + 106 * s * Math.cos(rad) };
      };
      return (u, t) => {
        const spinEnd = 0.42;
        const flyEnd = 0.58;
        // brazo en alto girando
        const armA = -172 + Math.sin(t * 9) * 5;
        dav.place(DX, 985, 1, 1);
        dav.arms(armA, 14);
        dav.sway(t, 0.6);
        const hand = handAt(armA);
        // honda
        const spinning = u < spinEnd;
        const flying = u >= spinEnd && u < flyEnd;
        const ang = t * 15;
        if (spinning) {
          const rx = 92;
          const ry = 34;
          const sx = hand.x + Math.cos(ang) * rx;
          const sy = hand.y - 8 + Math.sin(ang) * ry;
          slingLine.setAttribute("x1", hand.x);
          slingLine.setAttribute("y1", hand.y - 4);
          slingLine.setAttribute("x2", sx);
          slingLine.setAttribute("y2", sy);
          slingLine.setAttribute("opacity", 1);
          stone.setAttribute("cx", sx);
          stone.setAttribute("cy", sy);
          stone.setAttribute("opacity", 1);
          trail.forEach((c) => c.setAttribute("opacity", 0));
        } else if (flying) {
          const k = (u - spinEnd) / (flyEnd - spinEnd);
          const p0 = { x: hand.x + 90, y: hand.y - 8 };
          const x = lerp(p0.x, forehead.x, k);
          const y = lerp(p0.y, forehead.y, k) - Math.sin(Math.PI * k) * 60;
          stone.setAttribute("cx", x);
          stone.setAttribute("cy", y);
          stone.setAttribute("opacity", 1);
          slingLine.setAttribute("opacity", 0);
          trail.forEach((c, i) => {
            const kk = Math.max(0, k - (i + 1) * 0.05);
            c.setAttribute("cx", lerp(p0.x, forehead.x, kk));
            c.setAttribute("cy", lerp(p0.y, forehead.y, kk) - Math.sin(Math.PI * kk) * 60);
            c.setAttribute("opacity", 0.55 - i * 0.12);
          });
        } else {
          stone.setAttribute("opacity", 0);
          slingLine.setAttribute("opacity", 0);
          trail.forEach((c) => c.setAttribute("opacity", 0));
        }
        // impacto
        const hit = clamp((u - flyEnd) / 0.1);
        flash.setAttribute("cx", forehead.x);
        flash.setAttribute("cy", forehead.y);
        flash.setAttribute("r", 30 + hit * 120);
        flash.setAttribute("opacity", u >= flyEnd ? (1 - hit) * 0.95 : 0);
        // caída de Goliat
        const fall = ease(clamp((u - (flyEnd + 0.04)) / 0.3));
        const sway = u >= flyEnd ? Math.sin(fall * Math.PI) * 4 : 0;
        gol.place(GX, GY - fall * 117, 1, -1, -fall * 88);
        gol.arms(8 + fall * 40, -8 - fall * 30);
        gol.spearAt(GX + 175 + fall * 40, 990, fall * 75 + sway);
        // polvo
        dust.forEach((c, i) => {
          const dk = clamp((u - (flyEnd + 0.26)) / 0.3);
          c.setAttribute("cx", GX - 260 - i * 70 + dk * (i - 2) * 25);
          c.setAttribute("cy", GY - 14 - dk * (20 + i * 8));
          c.setAttribute("r", 14 + dk * (22 + i * 6));
          c.setAttribute("opacity", u > flyEnd + 0.26 ? (1 - dk) * 0.5 : 0);
        });
        v.st(t);
        const shake = u >= flyEnd && u < flyEnd + 0.08 ? Math.sin(t * 90) * 6 : 0;
        cam.setAttribute("transform", `translate(${540 + shake},700) scale(${1.04 + u * 0.03}) translate(-540,-700)`);
      };
    },
  });

  /* Toma 4 — 1 Samuel 17:50 — la victoria */
  shots.push({
    verses: ["1SA.17.50"],
    build(g, { helpers: H_ }) {
      const { grp, el, ease, lerp, seg, rays, figure } = H_;
      const cam = grp(g);
      const v = valley(cam, H_, {
        skyColors: ["#2b3a66", "#a77a78", "#f3b97c", "#ffe7ae"],
        sunX: 540, sunY: 600, sunColor: "#fffbe6",
        hillColors: ["#6a5163", "#4c3a4f"], ground: "#3a2a2e", rayOp: 0.14,
      });
      const rayG = v.rayG;
      const gol = goliath(cam, H_);
      gol.place(1040, 985 - 42, 0.7, -1, -88);
      gol.arms(2, -2);
      gol.spearAt(1130, 1012, -87);
      const dav = figure(cam, { robe: "#c9a25b", skin: "#3a261a", sleeve: "#b8924a", scale: 1.35, hood: "#7a4a24", band: "#7a4a24" });
      const crowd = [0, 1, 2, 3, 4, 5].map((i) => tinySoldier(cam, H_, 70 + i * 52, 985, 0.38, i % 2 ? "#2b2a3a" : "#3a2a2a"));
      return (u, t) => {
        dav.place(560, 985 + Math.abs(Math.sin(t * 3)) * -3, 1, 1);
        dav.arms(148 + Math.sin(t * 2.2) * 6, -148 - Math.sin(t * 2.2) * 6);
        dav.sway(t, 0.8);
        crowd.forEach((s, i) => {
          const jump = Math.abs(Math.sin(t * 4 + i * 0.9)) * -26 * ease(seg(u, 0.15, 0.4));
          s.place(70 + i * 52, 985 + jump, 1, 1);
          s.arms(-160 * ease(seg(u, 0.15, 0.4)), 10);
        });
        rayG.setAttribute("transform", `rotate(${t * 3},540,600)`);
        rayG.setAttribute("opacity", ease(seg(u, 0, 0.5)));
        v.sun.halo.setAttribute("r", 80 * (4 + ease(seg(u, 0, 0.7)) * 2));
        v.st(t);
        cam.setAttribute("transform", `translate(540,700) scale(${1.08 - u * 0.05}) translate(-540,-700)`);
      };
    },
  });

  window.STORIES.david = {
    kicker: "Historias en 60 segundos · 1 de 3",
    title: "David\ny Goliat",
    subtitle: "1 Samuel 17",
    next: { kicker: "Mañana", title: "José y sus\nhermanos" },
    shots,
  };
})();
