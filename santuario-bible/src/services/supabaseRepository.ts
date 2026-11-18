import { getBrowserSupabaseClient } from '@/services/supabaseClient';
import type { UserSanctuaryState } from '@/types/bible';

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
