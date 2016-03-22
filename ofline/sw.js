var CACHE_NAME = '1';
var urlsToCache = [
  '/index.html'
];

self.addEventListener( 'install' , function ( e ) {
	e.waitUntil(
		caches.open( CACHE_NAME ).then( function ( cache ) {
			console.log('CACHE_NAME : ' + CACHE_NAME)
			return cache.addAll( urlsToCache );
		})
	);
});

self.addEventListener( 'fetch' , function ( e ) {
	var fetchRequest = e.request.clone(),
		cacheRequest = e.request.clone();
	e.respondWith( 
		caches.match( cacheRequest )
			.then( function ( cache ) { 
				console.log(cache)
				if ( cache ) return cache;
				return fetch( fetchRequest ).then( 
					function ( res ) {
						var cacheRes = res.clone(),
							retRes = res.clone();
						caches.open( CACHE_NAME ).then( function ( cache ) {
							cache.put( fetchRequest, cacheRes );
						});
						return retRes;
					}
				);
			})
				
	);
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});