# Santuario · Biblia

Lectura diaria de las Escrituras, íntegra y verificada (SHA-256). Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind CSS v4.

> **Regla de Oro:** no se inventa, resume ni parafrasea ningún versículo. Todo texto sale de `src/data/canonicalSeed.ts` (o de Supabase) y se valida por hash antes de mostrarse.

## Desarrollo local

```bash
npm install
npm run dev
```

La app funciona sin Supabase: el estado (tradición, racha, favoritos) se guarda en `localStorage`.

Comandos de calidad: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Despliegue

El proyecto Next.js vive en la carpeta **`santuario-bible/`** del repositorio, no en la raíz. En ambos proveedores hay que indicarlo.

### Vercel
1. *Add New → Project* e importa el repositorio.
2. En **Root Directory** elige `santuario-bible`. Framework: Next.js (se detecta solo).
3. (Opcional) En *Environment Variables* agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. *Deploy*.

### Netlify
1. *Add new site → Import an existing project* y selecciona el repositorio.
2. En **Base directory** escribe `santuario-bible`. Build command: `npm run build`. Netlify aplica su runtime de Next.js automáticamente.
3. (Opcional) En *Site configuration → Environment variables* agrega las dos variables públicas de Supabase.
4. *Deploy*.

> No cargues `SUPABASE_SERVICE_ROLE_KEY` en el hosting: solo se usa en tu máquina para el seed.

## Conectar Supabase (opcional)

1. **Crea el esquema.** En tu proyecto Supabase abre *SQL Editor*, pega el contenido de `supabase/migrations/01_santuario_schema.sql` y ejecútalo. Crea `verses`, `user_profiles` y `user_bookmarks` con RLS activo.
2. **Variables de entorno.** Copia la plantilla y completa los valores (*Project Settings → API*):
   ```bash
   cp .env.example .env.local
   ```
   | Variable | Uso |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto (navegador y seed) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon/publishable (navegador) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Solo para el seed; nunca en frontend ni en el hosting |
3. **Carga el catálogo.** Con las variables disponibles en tu terminal:
   ```bash
   set -a; source .env.local; set +a
   npm run seed:verses
   ```
   El script verifica el SHA-256 de cada versículo antes de insertar y es idempotente: no modifica filas existentes.

Sin las variables públicas, `isSupabaseConfigured()` devuelve `false` y la app sigue usando solo `localStorage`.
