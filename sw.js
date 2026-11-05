/* Guarda la app en el teléfono para que abra sin internet. Cambia VERSION al publicar cambios. */
var VERSION = "encuesta-mrt-v8";
var ARCHIVOS = ["./", "./index.html", "./manifest.json", "./icono-192.png", "./icono-512.png",
  "./icono-maskable-192.png", "./icono-maskable-512.png", "./apple-touch-icon.png", "./favicon-48.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS.map(function (a) { return new Request(a, { cache: "reload" }); })); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (claves) {
    return Promise.all(claves.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  var esFuente = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== self.location.origin && !esFuente) return;
  if (e.request.mode === "navigate") {
    e.respondWith(caches.match("./index.html").then(function (r) { return r || fetch(e.request); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (guardada) {
    if (guardada) return guardada;
    return fetch(e.request).then(function (r) {
      if (esFuente || r.ok) {
        var copia = r.clone();
        caches.open(VERSION).then(function (c) { c.put(e.request, copia); });
      }
      return r;
    });
  }));
});
