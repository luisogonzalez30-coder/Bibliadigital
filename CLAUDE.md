# CLAUDE.md — App Bíblica "Santuario"

> **Nombre público: Santuario Bíblico** (Instagram: `@santuariobiblico`; «Santuario» queda como nombre corto —ícono de la app— y para la vista de la app, `/santuario`). Constantes en `src/lib/site.ts`.

## 1. Regla de Oro (Inmutabilidad Sagrada)
- PROHIBIDO inventar, resumir, parafrasear o generar versículos bíblicos (con IA o a mano).
- Todo texto bíblico se lee exclusivamente de un catálogo verificado, copiado literal de la edición indicada.

## 2. Stack obligatorio
- Next.js 16+ con App Router, React 19, TypeScript estricto (sin `any`).
- Tailwind CSS v4 (`@import "tailwindcss";` en el CSS global) + Lucide React.
- Código de la app en `santuario-bible/` (`src/`, alias `@/*`).

## 3. Identidad visual "Santuario Bíblico" (elegante, dorado sobre carbón)
- Día (pergamino cálido): fondo `#FAF6F0`, texto `#1C1917`, acento bronce `#86672D`.
- Noche (carbón cálido): fondo `#1C1917`, texto `#F5EFE6`, acento oro `#D4B06A`.
- Degradado dorado de marca en botones (`.bg-sanct-accent`) y letras (`.gold-text`); monograma «S» con doble aro y destello (`src/components/brand/`), lema «PALABRA DIARIA».
- Playfair Display (serif editorial) para títulos, nombre y Escrituras; Inter (sans limpia) para controles de interfaz.
- Íconos, favicon y tarjeta social se generan con `scripts/build-brand-assets.mjs`.
