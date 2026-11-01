const CACHE_VERSION = 'bitacora-ia-v2';
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
// Cache only the app shell; updates wait for existing clients to close.
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  const assets = CORE_ASSETS.map(path => new URL(path, self.registration.scope).href);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!assets.includes(url.href) && !(req.mode === 'navigate' && url.href === self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(req.mode === 'navigate' ? './index.html' : req);
    if (cached) return cached;
    try { return await fetch(req); }
    catch { return new Response('Sin conexión. Abre la app una vez con internet.', {status:503}); }
  })());
});
