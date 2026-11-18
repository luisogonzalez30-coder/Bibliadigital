/**
 * Carga idempotente del catálogo canónico en Supabase (tabla `verses`).
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:verses
 *
 * - Verifica el SHA-256 de cada versículo ANTES de insertar; si alguno no coincide, aborta sin insertar nada.
 * - Usa INSERT ... ON CONFLICT DO NOTHING (ignoreDuplicates): jamás hace UPDATE de filas existentes.
 * - La service_role key sólo se lee de process.env y nunca se imprime.
 */
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { CANONICAL_VERSES } from '../src/data/canonicalSeed';

const sha256Hex = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');

async function main(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  const missing = [
    !url && 'NEXT_PUBLIC_SUPABASE_URL',
    !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter((v): v is string => Boolean(v));
  if (!url || !serviceKey) {
    console.error(`[seed] Faltan variables de entorno: ${missing.join(', ')}. No se insertó nada.`);
    return 1;
  }

  const corrupted = CANONICAL_VERSES.filter(
    (v) => sha256Hex(`${v.textEs}|${v.textEn}`) !== v.sha256Hash
  );
  if (corrupted.length > 0) {
    console.error(
      `[seed] Hash SHA-256 inválido en: ${corrupted.map((v) => v.id).join(', ')}. No se insertó nada.`
    );
    return 1;
  }

  const rows = CANONICAL_VERSES.map((v) => ({
    id: v.id,
    book_osis: v.bookOsis,
    book_name_es: v.bookNameEs,
    book_name_en: v.bookNameEn,
    chapter: v.chapter,
    verse_number: v.verseNumber,
    testament_category: v.testamentCategory,
    text_es: v.textEs,
    text_en: v.textEn,
    version_es: v.versionEs,
    version_en: v.versionEn,
    allowed_traditions: [...v.allowedTraditions],
    emotion_tags: [...v.emotionTags],
    sha256_hash: v.sha256Hash,
  }));

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('verses')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
    .select('id');

  if (error) {
    console.error(`[seed] Error de Supabase: ${error.message}`);
    return 1;
  }

  const inserted = data?.length ?? 0;
  console.log(
    `[seed] ${CANONICAL_VERSES.length} versículos verificados · ${inserted} insertados · ${
      CANONICAL_VERSES.length - inserted
    } ya existían (sin modificar).`
  );
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e: unknown) => {
    console.error(`[seed] Error inesperado: ${e instanceof Error ? e.message : 'desconocido'}`);
    process.exit(1);
  });
