var CACHE_NAME = 'v2';
var urlsToCache = [
  '/index.html',
  '/sw.js'
];

self.addEventListener( 'install' , function ( e ) {
	e.waitUntil(
		caches.open( CACHE_NAME ).then( function ( cache ) {
			console.log('youre in v4')
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

// self.addEventListener( 'activate' , function ( e ) {
// 	e.waitUntil(
// 		caches.keys().then( function ( cacheNames ) {
// 			return Promise.all(
// 				cacheNames.map( function ( cacheName ) {
// 					if ( urlsToCache.indexOf( cacheName ) === -1 ) return caches.delete( cacheName );
// 				})
// 			)
// 		})
// 	);
// });