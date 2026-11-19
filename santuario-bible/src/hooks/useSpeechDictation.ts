"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Tipos mínimos de la Web Speech API (no vienen en lib.dom en todas las versiones de TypeScript). */
interface SpeechAlternativeLike {
  transcript: string;
}
interface SpeechResultLike {
  isFinal: boolean;
  [index: number]: SpeechAlternativeLike;
}
interface SpeechEventLike {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

function describeError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Permiso de micrófono denegado. Actívalo en tu navegador para dictar.";
    case "no-speech":
      return "No te escuché. Inténtalo de nuevo, más cerca del micrófono.";
    case "audio-capture":
      return "No encontré un micrófono disponible.";
    case "network":
      return "El dictado necesita conexión a internet. Puedes escribir tu texto.";
    default:
      return "No se pudo usar el dictado. Puedes escribir tu texto.";
  }
}

/** Dictado por voz con la Web Speech API del navegador. `supported` es false en servidor y en navegadores sin soporte. */
export function useSpeechDictation() {
  const supported = useSyncExternalStore(noopSubscribe, () => getCtor() !== null, () => false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const start = useCallback((onFinalText: (text: string) => void) => {
    const Ctor = getCtor();
    if (!Ctor) return;
    setError(null);
    try {
      const rec = new Ctor();
      rec.lang = "es-419";
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result && result.isFinal && result[0]) onFinalText(result[0].transcript);
        }
      };
      rec.onerror = (event) => setError(describeError(event.error));
      rec.onend = () => {
        recRef.current = null;
        setListening(false);
      };
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      recRef.current = null;
      setListening(false);
      setError(describeError("other"));
    }
  }, []);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, error, start, stop };
}
