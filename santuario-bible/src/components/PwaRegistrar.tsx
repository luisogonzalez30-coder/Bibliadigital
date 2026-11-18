"use client";

import { useEffect } from "react";

/** Registra el service worker en producción o en localhost; falla en silencio si se bloquea. */
export function PwaRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
    const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
    if (process.env.NODE_ENV !== "production" && !isLocalhost) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);

  return null;
}
