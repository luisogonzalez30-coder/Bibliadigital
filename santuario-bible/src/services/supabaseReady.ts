/**
 * Indica si las variables públicas de Supabase están configuradas y son válidas.
 * Nunca lanza: sin configuración (o con una URL mal escrita) la app sigue funcionando con localStorage.
 * Nota: Next.js sólo inyecta NEXT_PUBLIC_* con acceso literal, por eso no se usa process.env[...].
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return false;

  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}
