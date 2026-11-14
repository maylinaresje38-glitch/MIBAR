// Service worker: guarda los archivos para que la app funcione sin internet.
// Cada vez que cambies algo de la app, subí el número de versión (v3 -> v4).
const CACHE = 'bar-v3';

const ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icono-192.png',
  './icono-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return (
        cached ||
        fetch(e.request).then((resp) => {
          // Solo se guardan respuestas válidas (incluye las fuentes de Google)
          if (resp.ok || resp.type === 'opaque') {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copia));
          }
          return resp;
        }).catch(() => {
          // Sin internet: si se pedía una página, se muestra la app
          if (e.request.mode === 'navigate') return caches.match('./index.html');
        })
      );
    })
  );
});
