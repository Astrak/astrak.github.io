var CACHE_NAME = 'v1';
var urlsToCache = [
  '/index.html',
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch',function(e){
	e.respondWith(
		caches.match(e.request).then( function (res){
			if ( res ) {
				console.log('match in cache !', res);
				return res;
			}
			console.log(e.request)
		}).catch( function ( err ) {
			console.log('nothing in cache',err)
		})
	);
});