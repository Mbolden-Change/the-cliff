const C = 'the-cliff-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate' || e.request.url.endsWith('/index.html');
  if (isPage) {
    // network-first: always get the newest game when online; cached copy only offline
    e.respondWith(
      fetch(e.request).then(res => {
        const cp = res.clone();
        caches.open(C).then(c => c.put(e.request, cp));
        return res;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
  } else {
    // cache-first for icons/manifest
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const cp = res.clone();
        caches.open(C).then(c => c.put(e.request, cp));
        return res;
      }))
    );
  }
});
