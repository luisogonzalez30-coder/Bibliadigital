"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Botón "Instalar app": usa el aviso nativo si el navegador lo ofrece; si no, lleva a las instrucciones. */
export function InstallAppButton({ className = "", fallbackHref = "#instalar" }: { className?: string; fallbackHref?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (deferred) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          void deferred.prompt().catch(() => {});
          setDeferred(null);
        }}
      >
        <Download size={16} aria-hidden /> Instalar app
      </button>
    );
  }
  return (
    <a href={fallbackHref} className={className}>
      <Download size={16} aria-hidden /> Instalar app
    </a>
  );
}
