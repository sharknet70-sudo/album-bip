// ── VERSIÓN DEL CACHÉ — cambia este número cada vez que actualices la app ──
const CACHE_NAME = 'album-bip-v8';

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalación: guarda los archivos en caché pero NO toma control inmediato
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS))
    // sin self.skipWaiting() — espera a que el usuario cierre y reabra la app
  );
});

// Activación: borra cachés viejos, toma control de clientes existentes
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: red primero, caché como respaldo offline
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
