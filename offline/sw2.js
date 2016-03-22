var CACHE_NAME = 'v1';
var urlsToCache = [
  '/index.html'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache' + CACHE_NAME );
        return cache.addAll(urlsToCache);
      })
  );
  console.log('installation complete')
});

self.addEventListener('fetch',function(e){
	console.log(e)
	e.respondWith(
		caches.match(e.request).then( function (res){
			if ( res ) return res;
			console.log('use network')
			return fetch(e.request);
		});
	);
});