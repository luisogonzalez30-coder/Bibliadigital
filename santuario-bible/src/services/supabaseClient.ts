import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/services/supabaseReady';

let browserClient: SupabaseClient | null = null;

/**
 * Devuelve un cliente singleton de Supabase para el navegador si las variables
 * públicas están configuradas; en caso contrario retorna null sin lanzar error.
 */
export function getBrowserSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClient;
}
