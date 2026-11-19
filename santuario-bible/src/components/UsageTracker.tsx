"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isStatsEnabled, trackEvent } from "@/services/usageStats";
import { captureUtm } from "@/services/utm";

const READ_PREFIXES = ["/biblia/", "/planes/", "/versiculos/", "/historias/"] as const;

/** Mide aperturas diarias, instalaciones y lecturas de capítulos de forma anónima. */
export function UsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (isStatsEnabled()) captureUtm(window.location.search);
    trackEvent("open", pathname);
    const onInstalled = () => trackEvent("install", window.location.pathname);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
    // «open» se limita a uno por día; la ruta inicial basta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!READ_PREFIXES.some((p) => pathname.startsWith(p))) return;
    try {
      const key = `santuario_read_${pathname}`;
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* sin sessionStorage: se registra igualmente */
    }
    trackEvent("read", pathname);
  }, [pathname]);

  return null;
}
