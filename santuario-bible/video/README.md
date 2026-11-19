# Videos SVG de Santuario

Videos verticales (1080×1920, 30 fps) de historias bíblicas, hechos con **SVG animado** y renderizados en local:
**sin créditos ni servicios de pago**. Solo se necesitan Chromium (Playwright) y ffmpeg.

## Regla de Oro
- Todo el texto en pantalla es **versículo literal** de la Reina-Valera 1909, leído de `src/data/bible/*.json`.
  `render.mjs` falla si un versículo falta o está vacío; nunca se rellena ni se parafrasea.
- Las ilustraciones son figuras planas **sin rostro**. Los personajes no dicen nada que no esté en el texto bíblico.
- Los textos propios (título, «Mañana…», «Link en la bio») son claramente de Santuario y no se presentan como Escritura.

## Uso
```bash
# desde santuario-bible/
node video/render.mjs david            # → video/out/david.mp4
node video/render.mjs jose
node video/render.mjs daniel
node video/render.mjs david --stills 7,22,41   # solo imágenes de prueba (PNG) en esos segundos
```
Opciones: `--out <carpeta>` y `--fps <n>`. Requiere `playwright` (con Chromium) y `ffmpeg` instalados.

## Cómo está hecho
| Archivo | Rol |
|---|---|
| `engine.js` | Línea de tiempo, subtítulos (resaltado palabra por palabra), tarjetas de título y cierre, y helpers de arte (figuras, leones, camellos, ángel, rayos…). |
| `stories/<id>.js` | Cada historia: tomas con su(s) versículo(s) y la animación SVG de cada una. |
| `render.mjs` | Lee los versículos literales, captura cada fotograma con Chromium y los une con ffmpeg. |
| `fonts/` | Playfair Display (SIL OFL) para que el render no dependa del sistema. |

## Voz en off (Azure, casi gratis)
```bash
node video/render.mjs david --voice                         # voz es-CL-LorenzoNeural (masculina, Chile) → david-voz.mp4
node video/render.mjs david --voice --voice-name es-CL-CatalinaNeural   # voz femenina
node video/render.mjs david --voice --rate -8%              # más pausada (por defecto, velocidad normal de la voz)
```
- Lee el mismo texto que los subtítulos, **una llamada de Azure Voz por versículo completo** (entonación natural). Las páginas de
  subtítulos se sincronizan con las pausas reales de la voz y la línea de tiempo sigue a la voz; se mezcla con el colchón ambiental
  y se normaliza a -16 LUFS.
- **Ortografía para la voz:** la RV1909 usa tildes antiguas («á», «é», «fué», «dió»…). Solo para la pronunciación se leen como «a»,
  «e», «fue», «dio»; los subtítulos siguen literales.
- Las frases se cachean en `out/.tts/`: volver a renderizar no vuelve a llamar a Azure.
- Costo: ~600–700 caracteres por video. La capa gratuita de Azure Voz neuronal incluye 500.000 caracteres al mes
  (cientos de videos); fuera de ella, la tarifa pública ronda los USD 16 por millón de caracteres (≈ USD 0,01 por video).
  Verifica la tarifa vigente en tu cuenta de Azure.
- En este entorno las credenciales las inyecta el proxy; fuera de él define `TTS_URL` y el acceso que corresponda.

Sin `--voice`, el audio es solo un colchón ambiental sintetizado con ffmpeg (sin derechos de terceros). Para TikTok/Instagram
conviene publicar y **añadir allí un sonido en tendencia** si el video va sin voz.

## Agregar una historia
1. Crear `stories/<id>.js` con `window.STORIES.<id> = { kicker, title, subtitle, next, shots }`.
2. En cada toma, `verses: ["GEN.37.3"]` (OSIS.capítulo.versículo) y una función `build` que dibuja y devuelve `update(u, t)`.
3. Añadir el libro a `BOOKS` en `render.mjs` si hace falta y revisar con `--stills` antes del render completo.
