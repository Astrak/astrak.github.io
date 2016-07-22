var CACHE_NAME = '1';
var urlsToCache = [
  '/index.html',
  '/XYZ.txt'
];

self.addEventListener( 'install', function ( e ) {
	e.waitUntil(
		caches.open( CACHE_NAME ).then( function ( cache ) {
			return cache.addAll( urlsToCache );
		})
	);
});

self.addEventListener('activate', function ( e ) {
    e.waitUntil(
        caches.keys().then( function ( cacheNames ) {
            return Promise.all(
                cacheNames.map( function ( cacheName ) {
                    if ( cacheName !== CACHE_NAME ) {
                        return caches.delete( cacheName );
                    }
                })
            );
        })
    );
});

//cache + fetch&cache or fetch&cache
self.addEventListener( 'fetch', function ( e ) {
    var requestUrl = new URL( e.request.url );
    if ( requestUrl.hostname === 'astrak.github.io' ) {
         e.respondWith(
            caches.open( CACHE_NAME ).then( function ( cache ) {
                return cache.match( e.request).then(function ( response ) {
                    if ( response ) {
                        fetchAndCache( e, cache);
                        return response;
                    } else {
                        return fetchAndCache( e, cache);
                    }
                }).catch(function (error) {
                    throw error;
                });
            })
        );
    } else {
        e.respondWith(
            caches.match( e.request).then(function (response) {
                return response || fetch( e.request);
            })
        );
    }
});

function fetchAndCache( e, cache) {
    return fetch( e.request.clone() ).then( function ( response ) {
        if ( response.status < 400 ) {
            cache.put( e.request, response.clone() );
        }
        return response;
    });
}

//cache or fetch
/*self.addEventListener( 'fetch', function ( e ) {
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
});*/

