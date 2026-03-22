const CACHE_NAME = 'neon-space-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/manifest.json'
];

// گیم کی فائلوں کو موبائل میں ڈاؤن لوڈ کر کے سیو کرنا
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all files');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// جب انٹرنیٹ نہ ہو تو سیو کی ہوئی فائلوں سے گیم چلانا
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
