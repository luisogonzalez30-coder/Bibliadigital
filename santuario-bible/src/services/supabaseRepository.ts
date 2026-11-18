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
 * Devuelve un snapshot vacío si la nube no tiene datos, y null si no se pudo leer
 * (sin cliente, sin sesión o error): así nunca se confunde "vacío" con "falló".
 */
export async function fetchCloudSnapshot(): Promise<CloudSnapshot | null> {
  const client = getBrowserSupabaseClient();
  if (!client) return null;

  try {
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) return null;
    const userId = auth.user.id;

    const [profileRes, bookmarksRes] = await Promise.all([
      client
        .from('user_profiles')
        .select('tradition,current_streak,longest_streak,last_read_date')
        .eq('user_id', userId)
        .maybeSingle(),
      client.from('user_bookmarks').select('verse_id').eq('user_id', userId),
    ]);

    if (profileRes.error || bookmarksRes.error) return null;

    const row = profileRes.data;
    const profile =
      row && isTraditionSlug(row.tradition)
        ? {
            tradition: row.tradition,
            currentStreak: Number(row.current_streak) || 0,
            longestStreak: Number(row.longest_streak) || 0,
            lastReadDate: typeof row.last_read_date === 'string' ? row.last_read_date : null,
          }
        : null;

    const bookmarkedVerseIds = (bookmarksRes.data ?? []).map((b) => String(b.verse_id));

    return { profile, bookmarkedVerseIds };
  } catch {
    return null;
  }
}

/**
 * Sincroniza de forma idempotente los favoritos del usuario autenticado con `user_bookmarks`:
 * - Inserta los que faltan en la nube, sólo si el versículo ya existe en `verses` (FK); los demás
 *   se omiten sin error y se reintentan en la siguiente sincronización.
 * - Elimina de la nube los que el usuario ya no tiene marcados.
 * Nunca toca el estado local. Devuelve false, sin lanzar errores, si no hay cliente o sesión
 * o si la base de datos falla.
 */
export async function syncUserBookmarksToCloud(verseIds: readonly string[]): Promise<boolean> {
  const client = getBrowserSupabaseClient();
  if (!client) return false;

  try {
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) return false;
    const userId = auth.user.id;
    const wanted = Array.from(new Set(verseIds));

    const existing = await client.from('user_bookmarks').select('verse_id').eq('user_id', userId);
    if (existing.error) return false;
    const inCloud = new Set((existing.data ?? []).map((r) => String(r.verse_id)));

    const missing = wanted.filter((id) => !inCloud.has(id));
    if (missing.length > 0) {
      const known = await client.from('verses').select('id').in('id', missing);
      if (known.error) return false;
      const populated = new Set((known.data ?? []).map((r) => String(r.id)));
      const toInsert = missing.filter((id) => populated.has(id));

      if (toInsert.length > 0) {
        const { error } = await client.from('user_bookmarks').upsert(
          toInsert.map((verse_id) => ({ user_id: userId, verse_id })),
          { onConflict: 'user_id,verse_id', ignoreDuplicates: true }
        );
        if (error) return false;
      }
    }

    const toDelete = [...inCloud].filter((id) => !wanted.includes(id));
    if (toDelete.length > 0) {
      const { error } = await client
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .in('verse_id', toDelete);
      if (error) return false;
    }

    return true;
  } catch {
    return false;
  }
}
