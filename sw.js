const CACHE_VERSION = 'bitacora-ia-v3';
const CORE_ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(CORE_ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('bitacora-ia-') && key !== CACHE_VERSION) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
// Solo se manejan los archivos de la app (mismo origen). El HTML usa red primero
// para recibir actualizaciones; el resto, caché primero. Modelos de IA y librerías
// externas (jsDelivr, cdnjs, Hugging Face) no se interceptan.
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  const indexUrl = new URL('./index.html', self.registration.scope).href;
  const assets = CORE_ASSETS.map(path => new URL(path, self.registration.scope).href);
  const isNav = req.mode === 'navigate' && (url.href === self.registration.scope || url.href === indexUrl);
  if (!isNav && !assets.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    if (isNav || url.href === indexUrl) {
      try {
        const fresh = await fetch(req);
        if (fresh.ok) await cache.put(indexUrl, fresh.clone());
        return fresh;
      } catch {
        const cached = await cache.match(indexUrl);
        return cached || new Response('Sin conexión. Abre la app una vez con internet.', {status: 503});
      }
    }
    const cached = await cache.match(req);
    if (cached) return cached;
    try { return await fetch(req); }
    catch { return new Response('Sin conexión.', {status: 503}); }
  })());
});
