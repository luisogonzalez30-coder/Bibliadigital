# Textos para publicar (TikTok / Instagram Reels)

> El texto de los videos es la Reina-Valera 1909 literal. Estas descripciones las escribió Santuario y no son Escritura.
> Sustituye el dominio por el definitivo cuando lo tengas.

## 1 · David y Goliat
**Descripción:** Un pastor, una honda y una piedra. David y Goliat, leído tal como está escrito (1 Samuel 17, Reina-Valera 1909).
Mañana: José y sus hermanos. 👇 Capítulo completo en el link de la bio.
**Link:** https://smartassistusa.online/historias/david-y-goliat
**Hashtags:** #biblia #davidygoliat #fe #historiasbiblicas #palabradedios #chile #cristianos #reinavalera

## 2 · José y sus hermanos
**Descripción:** Vendido por sus hermanos, puesto por Dios: la historia de José en cuatro momentos (Génesis 37, 39, 45 y 50, Reina-Valera 1909).
Mañana: Daniel y los leones. Capítulo completo en el link de la bio.
**Link:** https://smartassistusa.online/historias/jose-y-sus-hermanos
**Hashtags:** #biblia #jose #perdon #fe #historiasbiblicas #palabradedios #chile #reinavalera

## 3 · Daniel y los leones
**Descripción:** La noche en el foso, según el texto de Daniel 6 (Reina-Valera 1909).
Esta semana: empieza un plan de lectura de 7 días, gratis, en el link de la bio.
**Link:** https://smartassistusa.online/historias/daniel-y-los-leones
**Hashtags:** #biblia #daniel #fe #historiasbiblicas #palabradedios #chile #cristianos #reinavalera

## Calendario sugerido
| Día | Publicar | Medir |
|---|---|---|
| 1 | David y Goliat | vistas 3 s, retención, clics a la bio |
| 2 | José y sus hermanos | idem + instalaciones en `/admin` |
| 3 | Daniel y los leones | idem + retención D1 |

## Links con utm (para saber qué video y qué voz trae cada instalación)
Plantilla: `https://smartassistusa.online/historias/<historia>?utm_source=<red>&utm_medium=video&utm_campaign=<serie>&utm_content=<voz>`

| Historia | `<historia>` | `utm_content` (voz de hombre / mujer) |
|---|---|---|
| David y Goliat | `david-y-goliat` | `david-voz-hombre` / `david-voz-mujer` |
| José y sus hermanos | `jose-y-sus-hermanos` | `jose-voz-hombre` / `jose-voz-mujer` |
| Daniel y los leones | `daniel-y-los-leones` | `daniel-voz-hombre` / `daniel-voz-mujer` |

- `<red>`: `tiktok`, `instagram` o `youtube`. `<serie>`: `historias-1`.
- Solo letras minúsculas, números, `-` y `_` (si no, la etiqueta se descarta).
- Ejemplo: `https://smartassistusa.online/historias/david-y-goliat?utm_source=tiktok&utm_medium=video&utm_campaign=historias-1&utm_content=david-voz-hombre`
- En `/admin` → «Origen (utm)» aparece, por cada combinación, cuántos dispositivos llegaron, cuántos instalaron y cuántas lecturas hubo.
- Se guarda el **primer contacto** del dispositivo: quien llegó por una etiqueta la conserva en sus visitas siguientes.
- La migración `supabase/migrations/03_utm.sql` debe ejecutarse **después** de `02_analitica.sql`.
