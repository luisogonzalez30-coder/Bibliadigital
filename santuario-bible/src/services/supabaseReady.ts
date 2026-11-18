/**
 * Indica si las variables públicas de Supabase están configuradas.
 * Nunca lanza: sin configuración la app sigue funcionando con localStorage.
 * Nota: Next.js sólo inyecta NEXT_PUBLIC_* con acceso literal, por eso no se usa process.env[...].
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && url.trim() && anonKey && anonKey.trim());
}
