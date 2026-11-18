"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Moon, Sun } from "lucide-react";
import { DailyStoriesModal } from "@/components/DailyStoriesModal";
import { PostalStudioModal } from "@/components/PostalStudioModal";
import { SoulCompass } from "@/components/SoulCompass";
import { DeuterocanonNotice } from "@/components/DeuterocanonNotice";
import { StreakPanel } from "@/components/StreakPanel";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { TraditionSelector } from "@/components/TraditionSelector";
import { VerseCard } from "@/components/VerseCard";
import { CANONICAL_VERSES } from "@/data/canonicalSeed";
import {
  DEFAULT_USER_STATE,
  filterVerifiedVerses,
  getActiveStreak,
  getVersesByTradition,
  loadUserState,
  registerDailyReading,
  toggleBookmark,
  saveUserState,
  toLocalIsoDate,
} from "@/services/sanctuaryEngine";
import type { CanonicalVerse, UserSanctuaryState } from "@/types/bible";

const PENDING_DEUTERO_BOOKS = ["WIS", "SIR", "TOB"] as const;

export default function Home() {
  // Estado inicial seguro (idéntico en servidor y cliente); el guardado se lee tras montar.
  const [state, setState] = useState<UserSanctuaryState>(DEFAULT_USER_STATE);
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<string | null>(null);
  const [verified, setVerified] = useState<CanonicalVerse[] | null>(null);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [postalVerse, setPostalVerse] = useState<CanonicalVerse | null>(null);

  useEffect(() => {
    // Lectura diferida (callback) tras montar: evita hydration mismatch y renders en cascada.
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      setState(loadUserState());
      setToday(toLocalIsoDate());
      setMounted(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    void filterVerifiedVerses(CANONICAL_VERSES).then((v) => {
      if (alive) setVerified(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.darkMode);
    if (mounted) saveUserState(state);
  }, [state, mounted]);

  const update = useCallback(
    (patch: Partial<UserSanctuaryState>) => setState((s) => ({ ...s, ...patch })),
    [],
  );

  const verses = useMemo(
    () => (verified ? getVersesByTradition(state.tradition, verified) : []),
    [verified, state.tradition],
  );

  const handleToggleBookmark = useCallback(
    (verseId: string) => setState((s) => toggleBookmark(s, verseId)),
    [],
  );

  const handleCompleteReading = useCallback(() => {
    if (today) setState((s) => registerDailyReading(s, today));
    setStoriesOpen(false);
  }, [today]);

  const showDeuteroNotice =
    (state.tradition === "catholic" || state.tradition === "universal") &&
    PENDING_DEUTERO_BOOKS.some((osis) => !verses.some((v) => v.bookOsis === osis));

  const readToday = today !== null && state.lastReadDate === today;
  const activeStreak = today !== null ? getActiveStreak(state, today) : 0;

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="scripture text-3xl">Santuario</h1>
        <button
          type="button"
          aria-label={state.darkMode ? "Activar modo día" : "Activar modo noche"}
          onClick={() => update({ darkMode: !state.darkMode })}
          className="rounded-full bg-sanct-surface p-2 text-sanct-accent"
        >
          {state.darkMode ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
        </button>
      </header>

      <TraditionSelector value={state.tradition} onChange={(tradition) => update({ tradition })} />

      <ToggleSwitch
        label="Espejo bilingüe (mostrar también en inglés)"
        checked={state.showParallelEnglish}
        onChange={(showParallelEnglish) => update({ showParallelEnglish })}
      />

      <StreakPanel
        activeStreak={activeStreak}
        longestStreak={state.longestStreak}
        readToday={readToday}
        onMarkRead={() => today && setState((s) => registerDailyReading(s, today))}
      />

      <button
        type="button"
        onClick={() => setStoriesOpen(true)}
        disabled={verified === null || today === null}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sanct-accent px-5 py-3 text-sm font-medium text-sanct-bg disabled:opacity-50"
      >
        <BookOpen size={16} aria-hidden /> Lectura diaria · 2 min
      </button>

      {verified !== null && (
        <SoulCompass
          tradition={state.tradition}
          verifiedVerses={verified}
          showParallelEnglish={state.showParallelEnglish}
          bookmarkedIds={state.bookmarkedVerseIds}
          onToggleBookmark={handleToggleBookmark}
          onCreatePostal={setPostalVerse}
        />
      )}

      {showDeuteroNotice && <DeuterocanonNotice />}

      <section aria-label="Versículos" className="space-y-5">
        {verified === null ? (
          <p className="text-sm text-sanct-muted">Verificando textos…</p>
        ) : (
          verses.map((v) => (
            <VerseCard
              key={v.id}
              verse={v}
              showParallelEnglish={state.showParallelEnglish}
              bookmarked={state.bookmarkedVerseIds.includes(v.id)}
              onToggleBookmark={handleToggleBookmark}
              onCreatePostal={setPostalVerse}
            />
          ))
        )}
      </section>

      {storiesOpen && verified !== null && today !== null && (
        <DailyStoriesModal
          tradition={state.tradition}
          todayIso={today}
          verifiedVerses={verified}
          showParallelEnglish={state.showParallelEnglish}
          onClose={() => setStoriesOpen(false)}
          onComplete={handleCompleteReading}
        />
      )}

      <PostalStudioModal
        verse={postalVerse}
        showParallelEnglish={state.showParallelEnglish}
        onClose={() => setPostalVerse(null)}
      />
    </main>
  );
}
