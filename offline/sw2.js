var CACHE_NAME = 'v1';
var urlsToCache = [
  '/index.html'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch',function(e){
	var fetchRequest = e.request.clone(),
		cacheRequest = e.request.clone();

	e.respondWith( 
		caches.match( cacheRequest )
			.then( function ( cache ) { return cache; })
			.catch( function ( err ) {
				fetch( fetchRequest )
					.then( function ( res ) {
						caches.open( CACHE_NAME ).then( function ( cache ) {
								cache.put( fetchRequest, res );
							})
					})
			});
});

	// e.respondWith(
	// 	caches.match(e.request.clone()).then( function (res){
	// 		if ( res ) return res;
	// 		var req = e.request.clone();
	// 		return fetch( req ).then( function ( res ) {
	// 			if ( ! res || res.status !== 200 || res.type !== 'basic' ) return res;
	// 			var cacheRes = res.clone();
	// 			caches.open( CACHE_NAME ).then( function( cache ) {
	// 				cache.put( e.request, cacheRes );
	// 			})
	// 		})
	// 	})
	// );