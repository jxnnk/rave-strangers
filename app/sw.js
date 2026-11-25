/* Rave Strangers service worker: makes the web app installable and opens the shell offline.
   Network first for our own files (so new versions arrive right away), cache as fallback.
   Requests to Supabase, map tiles and other hosts are never cached. */
var CACHE='rs-shell-v11';
var SHELL=['./','./index.html','./app.js','./style.css','./vendor/supabase.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon.svg'];
self.addEventListener('install',function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==self.location.origin) return;
  e.respondWith(fetch(e.request).then(function(r){
    if(r&&r.ok){ var copy=r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request,copy); }); }
    return r;
  }).catch(function(){ return caches.match(e.request).then(function(m){ return m||caches.match('./index.html'); }); }));
});
