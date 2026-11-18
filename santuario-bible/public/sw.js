/* Service worker de Santuario.
 * - Network-first con respaldo en caché, sólo para GET del mismo origen.
 * - Nunca intercepta ni cachea peticiones externas (p. ej. Supabase) ni rutas /api/.
 */
const CACHE = 'santuario-v1';
const PRECACHE = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isCacheable(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false; // externo: ni tocarlo
  if (url.pathname.startsWith('/api/')) return false;
  if (url.pathname === '/sw.js') return false;
  if (url.pathname.includes('webpack-hmr')) return false;
  return true;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isCacheable(request)) return; // el navegador la gestiona con normalidad

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const shell = await caches.match('/');
          if (shell) return shell;
        }
        return Response.error();
      })
  );
});
