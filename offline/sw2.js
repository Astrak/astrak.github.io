var CACHE_NAME = 'v1';
var urlsToCache = [
  '/index.html'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        postMessage('Opened cache' + CACHE_NAME );
        return cache.addAll(urlsToCache);
      })
  );
  postMessage('installation complete')
});

self.addEventListener('fetch',function(e){
	postMessage(e)
	e.respondWith(
		caches.match(e.request).then( function (res){
			if ( res ) return res;
			var req = e.request.clone();
			return fetch( req ).then( function ( res ) {
				if ( ! res || res.status !== 200 || res.type !== 'basic' ) return res;
				var cacheRes = res.clone();
				caches.open( CACHE_NAME ).then( function( cache ) {
					cache.put( e.request, cacheRes );
				})
			})
		})
	);
});