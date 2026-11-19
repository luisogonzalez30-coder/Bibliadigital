# Santuario · Biblia

MVP web instalable (PWA) de lectura bíblica diaria, minimalista y verificada. Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind CSS v4.

## Qué es

- **Modo Santuario:** diseño Día (pergamino `#FAF6F0`) y Noche (carbón `#0C0A09`), con serif editorial para las Escrituras.
- **Tradición y espejo bilingüe:** catálogo filtrado por tradición (católica, protestante, Torá, universal) y traducción en inglés en paralelo opcional.
- **Brújula del Alma:** eliges cómo te sientes (ansiedad, gratitud, duelo, cansancio, sabiduría) y ves los pasajes correspondientes.
- **Modo Stories:** lectura diaria de 4 láminas con barra de progreso; al completarla se ilumina la **Racha de Luz**.
- **Estudio de Postal 9:16:** genera y descarga una imagen PNG lista para compartir.
- **PWA instalable:** incluye manifiesto (`src/app/manifest.ts`), íconos en `public/icons/` y un service worker (`public/sw.js`, caché `santuario-v1`, *network-first* solo para el mismo origen; nunca intercepta Supabase ni rutas `/api/`). Se registra únicamente en producción o en `localhost`, y se puede instalar desde el navegador.
- **Local-first:** todo funciona sin cuenta, guardado en `localStorage`. El respaldo en **Supabase** (perfil, racha y favoritos) es opcional.

> **Regla de Oro:** no se inventa, resume ni parafrasea ningún versículo. Todo texto sale de `src/data/canonicalSeed.ts` (RV1909 / KJV) y se valida por SHA-256 antes de mostrarse.

**Estado conocido:** el catálogo tiene 9 pasajes. Los deuterocanónicos (Torres Amat) están pendientes de una fuente verificable y la app lo avisa a quien elige `catholic` o `universal`.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Página de presentación (landing): camino, escrituras, verificador de huella SHA-256, compromiso y preguntas frecuentes |
| `/santuario` | La app (umbral, lectura diaria, Brújula, «Describe tu problema», postales). Es la `start_url` de la PWA |
| `/privacidad` | Qué guarda la app y dónde |

## Desarrollo local

```bash
npm install
npm run dev
```

Verificaciones: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Despliegue

El proyecto Next.js vive en la carpeta **`santuario-bible/`** del repositorio, no en la raíz. Hay que indicarlo en el proveedor.

### Vercel
1. *Add New → Project* e importa el repositorio.
2. **Root Directory:** `santuario-bible`. Framework: Next.js (se detecta solo).
3. *Environment Variables* (opcionales, solo si usas Supabase): `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. *Deploy*.

### Netlify
1. *Add new site → Import an existing project* y elige el repositorio.
2. **Base directory:** `santuario-bible`. Build command: `npm run build`.
3. *Site configuration → Environment variables* (opcionales): `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. *Deploy*.

Las variables `NEXT_PUBLIC_*` se incorporan al compilar: tras cambiarlas, vuelve a desplegar.
No cargues `SUPABASE_SERVICE_ROLE_KEY` en el hosting; solo se usa en tu máquina para el seed.

## Activar Supabase (opcional)

1. **Esquema.** En tu proyecto Supabase abre *SQL Editor*, pega `supabase/migrations/01_santuario_schema.sql` y ejecútalo. Crea `verses` (lectura pública, texto inmutable con hash verificado), `user_profiles` y `user_bookmarks`, con RLS activo.
2. **URLs de autenticación.** En *Authentication → URL Configuration* define:
   - **Site URL:** la URL de producción (por ejemplo `https://tu-app.vercel.app`).
   - **Redirect URLs:** esa misma URL y `http://localhost:3000` para desarrollo.

   Sin esto, el enlace mágico del correo no regresa a la app.
3. **Variables de entorno.** Crea `.env.local` a partir de la plantilla y completa los valores (*Project Settings → API*):
   ```bash
   cp .env.example .env.local
   ```
   | Variable | Uso |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto (navegador y seed) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon/publishable (navegador) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Solo para el seed; nunca en el frontend ni en el hosting |
4. **Catálogo.** Con las variables cargadas en tu terminal:
   ```bash
   set -a; source .env.local; set +a
   npm run seed:verses
   ```
   Verifica el SHA-256 de cada versículo antes de insertar y es idempotente: no modifica filas existentes. Hazlo antes de usar favoritos en la nube, porque `user_bookmarks` referencia a `verses`.

Sin las variables públicas la app sigue en modo local y muestra un aviso discreto; nunca exige iniciar sesión.
