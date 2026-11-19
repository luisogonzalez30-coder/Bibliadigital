"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CalendarDays, HandHeart, Heart, Library, SlidersHorizontal } from "lucide-react";
import { AmbientSoundToggle } from "@/components/AmbientSoundToggle";
import { CloudSyncPanel } from "@/components/CloudSyncPanel";
import { DailyReminder } from "@/components/DailyReminder";
import { DailyStoriesModal } from "@/components/DailyStoriesModal";
import { FaithCompanionsModal } from "@/components/FaithCompanionsModal";
import { NameField } from "@/components/NameField";
import { OfferingInvite } from "@/components/OfferingInvite";
import { Onboarding, type OnboardingResult } from "@/components/Onboarding";
import { PostalStudioModal } from "@/components/PostalStudioModal";
import { ProblemAdvisor } from "@/components/ProblemAdvisor";
import { SettingsSheet } from "@/components/SettingsSheet";
import { SoulCompass } from "@/components/SoulCompass";
import { Umbral } from "@/components/Umbral";
import { VoluntaryOfferingModal } from "@/components/VoluntaryOfferingModal";
import { DeuterocanonNotice } from "@/components/DeuterocanonNotice";
import { StreakPanel } from "@/components/StreakPanel";
import { StatsToggle } from "@/components/StatsToggle";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { TraditionSelector } from "@/components/TraditionSelector";
import { VerseCard } from "@/components/VerseCard";
import { CANONICAL_VERSES, TRADITIONS_METADATA } from "@/data/canonicalSeed";
import { faithDisplayLabel } from "@/data/onboarding";
import type { FaithCompanion } from "@/data/faithCompanions";
import {
  isOfferingConfigured,
  loadOfferingPrefs,
  saveOfferingPrefs,
  shouldInviteToday,
  snoozeUntilFrom,
} from "@/services/offeringConfig";
import {
  DEFAULT_USER_STATE,
  filterVerifiedVerses,
  getActiveStreak,
  getDailyStoriesVerses,
  getVersesByTradition,
  loadUserState,
  mergeCloudState,
  registerDailyReading,
  toggleBookmark,
  saveUserState,
  toLocalIsoDate,
} from "@/services/sanctuaryEngine";
import {
  fetchCloudSnapshot,
  getCloudUserEmail,
  onCloudAuthChange,
  signInWithMagicLink,
  signOutCloudUser,
  syncUserBookmarksToCloud,
  syncUserProfileToCloud,
} from "@/services/supabaseRepository";
import { isSupabaseConfigured } from "@/services/supabaseReady";
import type { CanonicalVerse, TraditionSlug, UserSanctuaryState } from "@/types/bible";

const PENDING_DEUTERO_BOOKS = ["WIS", "SIR", "TOB"] as const;

type View = "umbral" | "santuario";

/** Saludo y fecha sobrios del día, calculados en cliente. */
function buildClock(now: Date): { greeting: string; dateLabel: string } {
  const hour = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  const raw = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(now);
  return { greeting, dateLabel: raw.charAt(0).toUpperCase() + raw.slice(1) };
}

/** Sincroniza en segundo plano; nunca bloquea ni altera la UI si falla o no hay sesión. */
function triggerCloudSyncIfReady(nextState: UserSanctuaryState): void {
  if (!isSupabaseConfigured()) return;
  void syncUserProfileToCloud(nextState).catch(() => {});
}

/** Igual que el perfil: segundo plano, sin bloquear ni alterar la UI. */
function triggerBookmarksSyncIfReady(verseIds: readonly string[]): void {
  if (!isSupabaseConfigured()) return;
  void syncUserBookmarksToCloud(verseIds).catch(() => {});
}

export default function Home() {
  // Estado inicial seguro (idéntico en servidor y cliente); el guardado se lee tras montar.
  const [state, setState] = useState<UserSanctuaryState>(DEFAULT_USER_STATE);
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<string | null>(null);
  const [verified, setVerified] = useState<CanonicalVerse[] | null>(null);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [cloudEmail, setCloudEmail] = useState<string | null>(null);
  const stateRef = useRef(state);
  // true sólo tras leer la nube con éxito: evita que un favorito marcado antes de hidratar borre datos remotos.
  const cloudReadyRef = useRef(false);
  const [postalVerse, setPostalVerse] = useState<CanonicalVerse | null>(null);
  const [view, setView] = useState<View>("umbral");
  const [companionsOpen, setCompanionsOpen] = useState(false);
  const [focus, setFocus] = useState<{ verse: CanonicalVerse; companion: FaithCompanion } | null>(null);
  const focusRef = useRef<HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [offeringOpen, setOfferingOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [clock, setClock] = useState<{ greeting: string; dateLabel: string } | null>(null);

  useEffect(() => {
    // Lectura diferida (callback) tras montar: evita hydration mismatch y renders en cascada.
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      setState(loadUserState());
      setToday(toLocalIsoDate());
      setClock(buildClock(new Date()));
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

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Sesión en la nube (opcional): nunca bloquea el uso local.
  useEffect(() => {
    if (!mounted || !isSupabaseConfigured()) return;
    let alive = true;
    void getCloudUserEmail().then((email) => {
      if (alive) setCloudEmail(email);
    });
    const unsubscribe = onCloudAuthChange((email) => {
      if (alive) setCloudEmail(email);
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [mounted]);

  // Al iniciar sesión: hidrata desde la nube fusionando con lo local y respalda el resultado.
  useEffect(() => {
    cloudReadyRef.current = false;
    if (!cloudEmail) return;
    let alive = true;
    void fetchCloudSnapshot().then((snapshot) => {
      // null = la lectura falló: se conserva todo lo local y no se sincroniza nada.
      if (!alive || snapshot === null) return;
      const merged = mergeCloudState(stateRef.current, snapshot);
      setState(merged);
      cloudReadyRef.current = true;
      triggerCloudSyncIfReady(merged);
      triggerBookmarksSyncIfReady(merged.bookmarkedVerseIds);
    });
    return () => {
      alive = false;
    };
  }, [cloudEmail]);

  const update = useCallback(
    (patch: Partial<UserSanctuaryState>) => setState((s) => ({ ...s, ...patch })),
    [],
  );

  const verses = useMemo(
    () => (verified ? getVersesByTradition(state.tradition, verified) : []),
    [verified, state.tradition],
  );

  // Un único versículo verificado del día: el primero de la selección diaria determinista.
  const dailyVerse = useMemo(
    () => (verified && today ? (getDailyStoriesVerses(state.tradition, today, verified)[0] ?? null) : null),
    [verified, today, state.tradition],
  );

  const openCompanions = useCallback(() => setCompanionsOpen(true), []);
  const closeCompanions = useCallback(() => setCompanionsOpen(false), []);
  // "Leer en el Santuario": destaca el pasaje en la vista principal y cierra el modal.
  const handleReadCompanion = useCallback((verse: CanonicalVerse, companion: FaithCompanion) => {
    setFocus({ verse, companion });
    setView("santuario");
    setCompanionsOpen(false);
  }, []);

  useEffect(() => {
    if (!focus) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    focusRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    focusRef.current?.focus({ preventScroll: true });
  }, [focus]);

  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const handleToggleBookmark = useCallback(
    (verseId: string) => {
      const next = toggleBookmark(state, verseId);
      setState(next);
      if (cloudReadyRef.current) triggerBookmarksSyncIfReady(next.bookmarkedVerseIds);
    },
    [state],
  );

  const registerTodayReading = useCallback(() => {
    if (!today) return;
    const next = registerDailyReading(state, today);
    if (next === state) return;
    setState(next);
    triggerCloudSyncIfReady(next);
  }, [state, today]);

  const handleCompleteReading = useCallback(() => {
    registerTodayReading();
    setStoriesOpen(false);
    // Invitación opcional: máximo una vez al día y sólo si el aporte está configurado.
    if (today && shouldInviteToday(loadOfferingPrefs(), today)) {
      saveOfferingPrefs({ lastInviteDate: today });
      setInviteOpen(true);
    }
  }, [registerTodayReading, today]);

  const closeOffering = useCallback(() => setOfferingOpen(false), []);
  const openOffering = useCallback(() => setOfferingOpen(true), []);
  const acceptInvite = useCallback(() => {
    setInviteOpen(false);
    setOfferingOpen(true);
  }, []);
  const dismissInvite = useCallback(() => {
    if (today) saveOfferingPrefs({ snoozeUntil: snoozeUntilFrom(today) });
    setInviteOpen(false);
  }, [today]);

  const handleTraditionChange = useCallback(
    (tradition: TraditionSlug) => {
      // Al cambiar el canon a mano, la etiqueta de fe guardada deja de aplicar: se muestra el nombre del canon.
      const next = { ...state, tradition, faithId: undefined };
      setState(next);
      triggerCloudSyncIfReady(next);
    },
    [state],
  );

  const handleOnboardingFinish = useCallback(
    (result: OnboardingResult) => {
      const next: UserSanctuaryState = { ...state, ...result, onboarded: true };
      setState(next);
      setView("umbral");
      triggerCloudSyncIfReady(next);
    },
    [state],
  );

  const showDeuteroNotice =
    (state.tradition === "catholic" || state.tradition === "universal") &&
    PENDING_DEUTERO_BOOKS.some((osis) => !verses.some((v) => v.bookOsis === osis));

  const readToday = today !== null && state.lastReadDate === today;
  const activeStreak = today !== null ? getActiveStreak(state, today) : 0;

  const deuteroNotice = showDeuteroNotice ? <DeuterocanonNotice /> : null;

  // Primera vez (o «ver la bienvenida otra vez»): se pregunta fe, nombre y necesidad antes de mostrar nada.
  if (mounted && state.onboarded !== true) {
    return (
      <main className="w-full">
        <Onboarding
          initial={{ tradition: state.tradition, faithId: state.faithId, displayName: state.displayName ?? "", focusEmotion: state.focusEmotion ?? null }}
          verified={verified}
          today={today}
          onFinish={handleOnboardingFinish}
        />
      </main>
    );
  }

  const traditionLabel = faithDisplayLabel(state.faithId, TRADITIONS_METADATA.find((t) => t.slug === state.tradition)?.labelEs ?? "");

  return (
    <main className={`mx-auto w-full max-w-3xl px-6 py-6${mounted ? "" : " invisible"}`}>
      <header className="relative z-20 flex items-center justify-between">
        {view === "santuario" ? (
          <button
            type="button"
            onClick={() => setView("umbral")}
            className="inline-flex items-center gap-2 rounded-full py-2 pr-3 text-sm text-sanct-muted transition hover:text-sanct-text"
          >
            <ArrowLeft size={16} aria-hidden /> <span className="scripture text-xl text-sanct-text">Santuario</span>
          </button>
        ) : (
          <h1 className="scripture text-xl text-sanct-text">Santuario</h1>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openOffering}
            title="Aporte voluntario"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-sanct-muted transition hover:bg-sanct-surface hover:text-sanct-text"
          >
            <Heart size={16} strokeWidth={1.5} aria-hidden /> Aportar
          </button>
          <AmbientSoundToggle />
          <button
            type="button"
            aria-label="Ajustes y respaldo"
            title="Ajustes y respaldo"
            onClick={() => setSettingsOpen(true)}
            className="rounded-full p-2.5 text-sanct-muted transition hover:bg-sanct-surface hover:text-sanct-text"
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </header>

      {view === "umbral" ? (
        <Umbral
          greeting={clock?.greeting ?? null}
          dateLabel={clock?.dateLabel ?? null}
          activeStreak={activeStreak}
          readToday={readToday}
          verse={dailyVerse}
          showParallelEnglish={state.showParallelEnglish}
          onStories={() => setStoriesOpen(true)}
          onEnter={() => setView("santuario")}
          onPostal={setPostalVerse}
          onCompanions={openCompanions}
          name={state.displayName}
          traditionLabel={traditionLabel}
          onChangeTradition={() => setSettingsOpen(true)}
        />
      ) : (
        <div className="space-y-14 py-10">
          {focus && (
            <section ref={focusRef} tabIndex={-1} aria-label="Pasaje destacado" className="scroll-mt-24 space-y-4 outline-none">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xs uppercase tracking-widest text-sanct-accent">Pasaje destacado · {focus.companion.name}</h2>
                <button type="button" onClick={() => setFocus(null)} className="text-xs text-sanct-muted underline underline-offset-4">
                  Quitar
                </button>
              </div>
              <VerseCard
                verse={focus.verse}
                showParallelEnglish={state.showParallelEnglish}
                bookmarked={state.bookmarkedVerseIds.includes(focus.verse.id)}
                onToggleBookmark={handleToggleBookmark}
                onCreatePostal={setPostalVerse}
              />
              <p className="text-sm leading-relaxed text-sanct-muted">
                <span className="text-sanct-accent">Para tu oración: </span>
                {focus.companion.prayerPrompt}
              </p>
            </section>
          )}

          <StreakPanel
            activeStreak={activeStreak}
            longestStreak={state.longestStreak}
            readToday={readToday}
            onMarkRead={registerTodayReading}
          />

          <button
            type="button"
            onClick={() => setStoriesOpen(true)}
            disabled={verified === null || today === null}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sanct-accent px-5 py-3.5 text-sm font-medium text-sanct-bg disabled:opacity-50"
          >
            <BookOpen size={16} aria-hidden /> Lectura diaria · 2 min
          </button>

          <button
            type="button"
            onClick={openCompanions}
            className="flex w-full items-center gap-4 rounded-3xl border border-sanct-border p-6 text-left transition hover:bg-sanct-surface"
          >
            <HandHeart size={26} strokeWidth={1.4} aria-hidden className="shrink-0 text-sanct-accent" />
            <span>
              <span className="scripture block text-xl">Compañeros de Fe</span>
              <span className="block text-sm text-sanct-muted">Figuras de fe, cada una con un pasaje real de la Escritura y una guía para tu oración.</span>
            </span>
          </button>

          <Link
            href="/biblia"
            className="flex w-full items-center gap-4 rounded-3xl border border-sanct-border p-6 text-left transition hover:bg-sanct-surface"
          >
            <Library size={26} strokeWidth={1.4} aria-hidden className="shrink-0 text-sanct-accent" />
            <span>
              <span className="scripture block text-xl">La Biblia completa</span>
              <span className="block text-sm text-sanct-muted">Los 66 libros, con búsqueda y verificación por capítulo.</span>
            </span>
          </Link>

          <Link
            href="/planes"
            className="flex w-full items-center gap-4 rounded-3xl border border-sanct-border p-6 text-left transition hover:bg-sanct-surface"
          >
            <CalendarDays size={26} strokeWidth={1.4} aria-hidden className="shrink-0 text-sanct-accent" />
            <span>
              <span className="scripture block text-xl">Planes de lectura</span>
              <span className="block text-sm text-sanct-muted">7 días para la ansiedad, el cansancio o la gratitud.</span>
            </span>
          </Link>

          {verified !== null && (
            <ProblemAdvisor
              tradition={state.tradition}
              verifiedVerses={verified}
              showParallelEnglish={state.showParallelEnglish}
              bookmarkedIds={state.bookmarkedVerseIds}
              onToggleBookmark={handleToggleBookmark}
              onCreatePostal={setPostalVerse}
            />
          )}

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

          {deuteroNotice}

          <section aria-label="Versículos" className="space-y-8">
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
        </div>
      )}

      <SettingsSheet open={settingsOpen} onClose={closeSettings}>
        <NameField value={state.displayName ?? ""} onCommit={(displayName) => update({ displayName })} />
        <TraditionSelector value={state.tradition} onChange={handleTraditionChange} />
        {deuteroNotice}
        <ToggleSwitch
          label="Espejo bilingüe (mostrar también en inglés)"
          checked={state.showParallelEnglish}
          onChange={(showParallelEnglish) => update({ showParallelEnglish })}
        />
        <DailyReminder />
        <ToggleSwitch label="Modo noche" checked={state.darkMode} onChange={(darkMode) => update({ darkMode })} />
        <StatsToggle />
        <button
          type="button"
          onClick={() => {
            setSettingsOpen(false);
            update({ onboarded: false });
          }}
          className="w-full rounded-2xl border border-sanct-border px-4 py-3 text-left text-sm text-sanct-muted transition hover:bg-sanct-surface hover:text-sanct-text"
        >
          Ver la bienvenida otra vez (fe, nombre y lo que te trae)
        </button>
        <CloudSyncPanel email={cloudEmail} onSendMagicLink={signInWithMagicLink} onSignOut={signOutCloudUser} />
      </SettingsSheet>

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

      {companionsOpen && verified !== null && (
        <FaithCompanionsModal
          tradition={state.tradition}
          verifiedVerses={verified}
          showParallelEnglish={state.showParallelEnglish}
          suspendEscape={postalVerse !== null}
          onClose={closeCompanions}
          onReadInSanctuary={handleReadCompanion}
          onCreatePostal={setPostalVerse}
        />
      )}

      <PostalStudioModal
        verse={postalVerse}
        showParallelEnglish={state.showParallelEnglish}
        onClose={() => setPostalVerse(null)}
        onOffer={isOfferingConfigured() ? openOffering : undefined}
      />

      {inviteOpen && !offeringOpen && <OfferingInvite onAccept={acceptInvite} onDismiss={dismissInvite} />}
      {offeringOpen && <VoluntaryOfferingModal onClose={closeOffering} />}
    </main>
  );
}
