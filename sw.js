// ── VERSIÓN DEL CACHÉ — cambia este número cada vez que actualices la app ──
const CACHE_NAME = 'album-bip-v5';

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalación: guarda los archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS))
  );
});

// Activación: borra cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: red primero, caché como respaldo
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Actualiza el caché con la respuesta nueva
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Permite que el nuevo SW tome control inmediatamente
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
