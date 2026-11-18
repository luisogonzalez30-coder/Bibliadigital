import { getBrowserSupabaseClient } from '@/services/supabaseClient';
import type { CloudSnapshot, TraditionSlug, UserSanctuaryState } from '@/types/bible';

const TRADITIONS: readonly TraditionSlug[] = ['catholic', 'protestant', 'torah', 'universal'];

function isTraditionSlug(value: unknown): value is TraditionSlug {
  return typeof value === 'string' && (TRADITIONS as readonly string[]).includes(value);
}

/**
 * Sincroniza el perfil del usuario (tradición y Racha de Luz) con Supabase.
 * Devuelve false, sin lanzar errores, si no hay cliente, no hay sesión activa o la operación falla.
 */
export async function syncUserProfileToCloud(state: UserSanctuaryState): Promise<boolean> {
  const client = getBrowserSupabaseClient();
  if (!client) return false;

  try {
    const { data, error: authError } = await client.auth.getUser();
    if (authError || !data.user) return false;

    const { error } = await client.from('user_profiles').upsert(
      {
        user_id: data.user.id,
        tradition: state.tradition,
        current_streak: state.currentStreak,
        longest_streak: state.longestStreak,
        last_read_date: state.lastReadDate,
      },
      { onConflict: 'user_id' }
    );

    return error === null;
  } catch {
    return false;
  }
}

/** Envía un enlace mágico de acceso al correo. false si no hay cliente o falla. */
export async function signInWithMagicLink(email: string): Promise<boolean> {
  const client = getBrowserSupabaseClient();
  const address = email.trim();
  if (!client || !address) return false;

  try {
    const { error } = await client.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: window.location.origin },
    });
    return error === null;
  } catch {
    return false;
  }
}

/** Cierra la sesión en la nube. false si no hay cliente o falla; los datos locales no se tocan. */
export async function signOutCloudUser(): Promise<boolean> {
  const client = getBrowserSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.auth.signOut();
    return error === null;
  } catch {
    return false;
  }
}

/** Correo del usuario autenticado, o null si no hay cliente ni sesión. */
export async function getCloudUserEmail(): Promise<string | null> {
  const client = getBrowserSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return data.user.email ?? null;
  } catch {
    return null;
  }
}

/**
 * Se suscribe a los cambios de sesión (login, logout, enlace mágico).
 * Devuelve la función para cancelar la suscripción (no-op si no hay cliente).
 */
export function onCloudAuthChange(callback: (email: string | null) => void): () => void {
  const client = getBrowserSupabaseClient();
  if (!client) return () => {};

  try {
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      callback(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  } catch {
    return () => {};
  }
}

/**
 * Lee el perfil y los favoritos del usuario autenticado.
 * Devuelve un snapshot vacío si no hay cliente, sesión, datos o si algo falla.
 */
export async function fetchCloudSnapshot(): Promise<CloudSnapshot> {
  const empty: CloudSnapshot = { profile: null, bookmarkedVerseIds: [] };
  const client = getBrowserSupabaseClient();
  if (!client) return empty;

  try {
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) return empty;
    const userId = auth.user.id;

    const [profileRes, bookmarksRes] = await Promise.all([
      client
        .from('user_profiles')
        .select('tradition,current_streak,longest_streak,last_read_date')
        .eq('user_id', userId)
        .maybeSingle(),
      client.from('user_bookmarks').select('verse_id').eq('user_id', userId),
    ]);

    const row = profileRes.error ? null : profileRes.data;
    const profile =
      row && isTraditionSlug(row.tradition)
        ? {
            tradition: row.tradition,
            currentStreak: Number(row.current_streak) || 0,
            longestStreak: Number(row.longest_streak) || 0,
            lastReadDate: typeof row.last_read_date === 'string' ? row.last_read_date : null,
          }
        : null;

    const bookmarkedVerseIds = bookmarksRes.error
      ? []
      : (bookmarksRes.data ?? []).map((b) => String(b.verse_id));

    return { profile, bookmarkedVerseIds };
  } catch {
    return empty;
  }
}
