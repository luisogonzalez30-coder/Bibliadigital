"use client";

import { useSyncExternalStore } from "react";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { isStatsEnabled, setStatsEnabled, subscribeStats } from "@/services/usageStats";

/** Interruptor de Ajustes para la medición anónima de uso. */
export function StatsToggle() {
  const enabled = useSyncExternalStore(subscribeStats, isStatsEnabled, () => false);
  return (
    <div className="space-y-2">
      <ToggleSwitch label="Ayudar a mejorar Santuario Bíblico (estadísticas anónimas)" checked={enabled} onChange={setStatsEnabled} />
      <p className="px-1 text-xs text-sanct-muted">
        Cuenta aperturas, instalaciones y capítulos leídos con un código aleatorio del dispositivo. Sin nombre, correo ni
        textos que escribes. Al desactivarlo se borra ese código.
      </p>
    </div>
  );
}
