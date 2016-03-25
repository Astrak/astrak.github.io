var CACHE_NAME = '2';
var urlsToCache = [
  '/index.html'
];

self.addEventListener( 'install', function ( e ) {
	e.waitUntil(
		caches.open( CACHE_NAME ).then( function ( cache ) {
			console.log('CACHE_NAME : ' + CACHE_NAME)
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
    console.log(requestUrl)
    if ( requestUrl.hostname === 'interascope.com' ) {
        console.log('fetch is same domain')
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
                    console.error('  Error in fetch handler:', error);
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
            console.log('cache updated')
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

