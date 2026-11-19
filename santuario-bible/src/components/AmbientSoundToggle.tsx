"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Acorde cálido y grave (Re mayor add9). Frecuencias en Hz. */
const CHORD: ReadonlyArray<{ freq: number; gain: number }> = [
  { freq: 73.42, gain: 0.5 }, // D2
  { freq: 110.0, gain: 0.35 }, // A2
  { freq: 146.83, gain: 0.3 }, // D3
  { freq: 185.0, gain: 0.18 }, // F#3
  { freq: 329.63, gain: 0.07 }, // E4 (add9)
];

const TARGET_GAIN = 0.07; // volumen final muy suave
const FADE_IN_S = 3;
const FADE_OUT_S = 1.6;

interface Engine {
  ctx: AudioContext;
  master: GainNode;
  stop: () => void;
}

/** Construye el pad ambiental. Todo se genera en el navegador: sin archivos ni red. */
function startEngine(): Engine | null {
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(TARGET_GAIN, ctx.currentTime + FADE_IN_S);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 520;
  filter.Q.value = 0.4;

  // Respiración lenta del filtro (LFO ~0.07 Hz).
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 140;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  filter.connect(master);
  master.connect(ctx.destination);

  const oscillators: OscillatorNode[] = [lfo];
  for (const { freq, gain } of CHORD) {
    for (const detune of [-5, 5]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = gain / 2;
      osc.connect(g);
      g.connect(filter);
      oscillators.push(osc);
    }
  }
  oscillators.forEach((o) => o.start());
  void ctx.resume().catch(() => {});

  return {
    ctx,
    master,
    stop: () => oscillators.forEach((o) => { try { o.stop(); } catch { /* ya detenido */ } }),
  };
}

/** Sonido ambiental opcional: silencioso por defecto, con fade-in/fade-out, sin archivos externos. */
export function AmbientSoundToggle() {
  const [on, setOn] = useState(false);
  const engineRef = useRef<Engine | null>(null);
  const closeTimer = useRef<number | null>(null);

  const teardown = useCallback((fade: boolean) => {
    const engine = engineRef.current;
    engineRef.current = null;
    if (!engine) return;
    const { ctx, master } = engine;
    const finish = () => {
      engine.stop();
      void ctx.close().catch(() => {});
    };
    if (!fade) return finish();
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + FADE_OUT_S);
    closeTimer.current = window.setTimeout(finish, FADE_OUT_S * 1000 + 100);
  }, []);

  const toggle = useCallback(() => {
    if (on) {
      teardown(true);
      setOn(false);
      return;
    }
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    try {
      const engine = startEngine();
      if (!engine) return; // navegador sin Web Audio: el botón simplemente no hace nada
      engineRef.current = engine;
      setOn(true);
    } catch {
      engineRef.current = null;
    }
  }, [on, teardown]);

  useEffect(() => () => teardown(false), [teardown]);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Silenciar sonido ambiental" : "Activar sonido ambiental"}
      title={on ? "Silenciar sonido ambiental" : "Activar sonido ambiental"}
      onClick={toggle}
      className={`rounded-full p-2.5 transition hover:bg-sanct-surface ${on ? "text-sanct-accent" : "text-sanct-muted"}`}
    >
      {on ? <Volume2 size={18} strokeWidth={1.5} aria-hidden /> : <VolumeX size={18} strokeWidth={1.5} aria-hidden />}
    </button>
  );
}
