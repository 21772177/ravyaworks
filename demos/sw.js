/* ============================================================
   RAVYAWORKS — Service Worker
   Cache-first for static assets (CSS, JS, images, fonts).
   Network-first for pages (config.js may update).
   Scope: /demos/ (controls all demo subdirectories)
   ============================================================ */

var CACHE = "ravyaworks-v1";
var STATIC_PATTERNS = [
  /\/_framework\//,
  /\/assets\//,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll([
        "/demos/_framework/css/base.css",
        "/demos/_framework/css/layout.css",
        "/demos/_framework/css/components.css",
        "/demos/_framework/css/theme.css",
        "/demos/_framework/css/critical.css",
        "/demos/_framework/js/app.js"
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  var url = e.request.url;
  var isStatic = STATIC_PATTERNS.some(function (p) { return p.test(url); });

  if (isStatic) {
    // Cache-first
    e.respondWith(
      caches.match(e.request).then(function (hit) { return hit || fetchAndCache(e.request); })
    );
  } else {
    // Network-first for pages and config.js
    e.respondWith(
      fetch(e.request).then(function (res) { return cacheIfOk(e.request, res) || res; })
        .catch(function () { return caches.match(e.request); })
    );
  }
});

function fetchAndCache(req) {
  return fetch(req).then(function (res) {
    if (res.ok) {
      var copy = res.clone();
      caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
    }
    return res;
  });
}

function cacheIfOk(req, res) {
  if (res.ok) {
    var copy = res.clone();
    caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
  }
  return null;
}
