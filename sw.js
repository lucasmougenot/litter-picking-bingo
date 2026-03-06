const REPO_NAME = "litter-picking-bingo";
// TODO: UPDATE CACHE ON EVERY PUSH!
const CACHE = "LPB-2026-03-06-v2";
const ASSETS = [
    `/${REPO_NAME}/`,
    `/${REPO_NAME}/index.html`,
    `/${REPO_NAME}/style.css`,
    `/${REPO_NAME}/bingo.js`,
    `/${REPO_NAME}/items.json`,
];

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(ASSETS))
    );
});

self.addEventListener("activate", e => {
    // clean up old caches
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
});

self.addEventListener("fetch", e => {
  console.log("SW fetching:", e.request.url);
  e.respondWith(
    caches.match(e.request).then(r => {
      if (r) {
        console.log("SW serving from cache:", e.request.url);
        return r;
      }
      return fetch(e.request).then(response => {
        return caches.open(CACHE).then(cache => {
          cache.put(e.request, response.clone());
          console.log("SW cached:", e.request.url);
          return response;
        });
      });
    })
  );
});
