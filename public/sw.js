// ShopeeLink Pro - Service Worker
const CACHE_NAME = 'shopeelink-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Chỉ can thiệp các request GET điều hướng hoặc static assets
  if (event.request.method !== 'GET') return;

  // Bỏ qua các API call để luôn lấy dữ liệu tươi mới từ server
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Nếu lấy thành công từ mạng, trả về bình thường
        return response;
      })
      .catch(() => {
        // Fallback vào cache nếu offline
        return caches.match(event.request);
      })
  );
});
