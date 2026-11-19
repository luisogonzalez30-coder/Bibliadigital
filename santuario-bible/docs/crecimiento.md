# Crecimiento y monetización · Santuario

> Documento de trabajo. Los precios de dominio se consultaron el 19-nov-2026 y están en dólares; verifícalos antes de comprar.

## Orden de trabajo (de mayor a menor impacto)
1. **Alcance:** contenido corto diario (ver `contenido-30-dias.md`) y las páginas indexables (`/biblia`, `/versiculos/*`, `/planes/*`).
2. **Hábito:** versículo del día, planes de 7 días y recordatorio de calendario (ya implementados).
3. **Medición:** Vercel Web Analytics (activarlo en el proyecto de Vercel).
4. **Confianza:** quiénes somos (con personas reales), correo de contacto, revisión legal de privacidad y términos.
5. **Monetización:** aporte voluntario ahora; suscripción solo cuando haya tráfico.

## Dominio
El dominio actual (`smartassistusa.online`) no habla de fe ni de Santuario. Candidatos libres, ordenados por mi preferencia:

| Dominio | Primer año | Renovación | Comentario |
|---|---|---|---|
| `santuariodiario.com` | 12,03 | 12,03 | Recomendado: .com de confianza, precio estable, «diario» comunica el hábito. |
| `santuariodiario.app` | 9,99 | 15,00 | Buena segunda opción; ideal como alias. |
| `santuariobiblia.com` | 12,03 | 12,03 | Fuerte para búsquedas de la Biblia. |
| `santuariodefe.com` | 12,03 | 12,03 | Más amplio que lo bíblico. |
| `santuariodiario.cl` | 64,99 | 64,99 | Señal local, pero caro. |
| `santuario.lat` | 1,99 | 30,99 | Cuidado: barato el primer año, caro al renovar. |
| `santuario.church` | 11,99 | 41,00 | Temático, pero la renovación sube. |
| `santuario.faith` | 385,00 | 55,00 | Premium: no compensa. |

No disponibles: `santuario.com`, `.app`, `.cl`, `.org`, `.online`, `.one`.

**Al cambiar de dominio:** agregarlo en Vercel, actualizar `NEXT_PUBLIC_SITE_URL`, las URLs de redirección de Supabase y el enlace de la bio; dejar el dominio actual redirigiendo al nuevo.

## Monetización por fases
| Fase | Qué | Condición |
|---|---|---|
| Ahora | Aporte voluntario (Mercado Pago, monto libre) | Ya activo |
| Con ~5.000 usuarios activos al mes | «Amigos del Santuario»: suscripción baja con planes extra, audio narrado y plantillas de postal. La Escritura siempre gratis. | Tráfico y retención medidos |
| Después | Santuario para comunidades (parroquias, grupos, colegios) | Primeros usuarios que lo pidan |

Escenario de ingresos con suscripción de $2.990 CLP/mes (antes de comisiones; los porcentajes de conversión son supuestos):

| Usuarios activos | 1 % | 2 % | 3 % |
|---|---|---|---|
| 5.000 | $149.500 | $299.000 | $448.500 |
| 20.000 | $598.000 | $1.196.000 | $1.794.000 |
| 50.000 | $1.495.000 | $2.990.000 | $4.485.000 |

## Pendiente de decisión del dueño
- **Notificaciones push o correo diario:** requieren guardar suscripciones o correos (datos personales), claves y un servidor; además, en iPhone solo funcionan con la app instalada. Decidir si valen la complejidad frente al recordatorio de calendario.
- **Versiones con copyright (RVR1960, NVI):** exigen licencia. Hoy solo se usa texto de dominio público.
- **Deuterocanónicos en español católico:** pendientes de una edición verificable.
