function Landscape ( data, params ) {

	/* UI 3rd version 
	Copyright 2015 
	- merged previous separate versions
	- event-driven to better handle resources calls and display the scene quicker
	- handles container's size

	//TODO : 
	//- use localstorage to store display parameters and resources
	//- implement 'container in view' when animations are on, so they are not updated when out of view
	//- implement container resize
	//- use threejs event dispatcher (understand classes, prototypes & inheritance...)
	//- blender / gimp : merge roads/trottoirs/gardens/cars on same texture
	*/

    'use strict';

    var scope = this;

    if ( typeof data !== 'object' || ! ( data.hasOwnProperty( 'geometries' ) && data.hasOwnProperty( 'meshes' ) && data.hasOwnProperty( 'textures' ) ) ) {
        return console.error( 'UI needs an object with textures, geometries and meshes properties as first parameter' );
    }

    var options = ( typeof params === 'undefined' ) ? {} : params;

    var isMobile = ( function () {
    	//Detectizr
	    var nav = ( navigator.userAgent || navigator.vendor || window.opera ).toLowerCase(), test = function ( r ) { return r.test( nav ); };
	    return !( ( ( test( /windows.(nt|xp|me|9)/ ) && ! test( /phone/ ) ) || test( /win(9|.9|nt)/ ) || test( /\(windows 8\)/ ) ) 
			|| ( test( /macintosh|powerpc/ ) && ! test( /silk/ ) ) 
			|| ( test( /linux/ ) && test( /x11/ ) ) 
			|| ( test( /solaris|sunos|bsd/ ) ) 
			|| ( test( /cros/ ) ) 
			|| ( test( /bot|crawler|spider|yahoo|ia_archiver|covario-ids|findlinks|dataparksearch|larbin|mediapartners-google|ng-search|snappy|teoma|jeeves|tineye/ ) 
				&& ! test( /mobile/ ) ) );
    } ) ();

    var webgl = ( function () {
    	try {
    		var c = document.createElement( 'canvas' );
    		return !! ( window.WebGLRenderingContext && ( c.getContext( 'webgl' ) || c.getContext( 'experimental-webgl' ) ) );
		} catch ( e ) {
			return false;
		}
	} ) ();

	var c2d = !! window.CanvasRenderingContext2D;

	var useSmooth = webgl && ! isMobile;

    var width, height, container;
    if ( options.hasOwnProperty( 'container' ) && options.container !== document.body ) {
    	var div = document.createElement( 'div' );
    	options.container.appendChild( div );
    	div.className = 'container';
		var style = getComputedStyle( options.container, null );
		width = parseInt( style.width );
		height = parseInt( style.height );
		container = div;
    } else {
    	container = document.body; 
    	container.style.margin = '0';
    	width = window.innerWidth;
    	height = window.innerHeight;
    }

    var events = new EventsHandler();

    var scene, renderer, camera, controls;

    if ( webgl ) renderer = new THREE.WebGLRenderer({antialias:true});
    else if ( c2d ) renderer = new THREE.CanvasRenderer();

    renderer.setSize( width, height );
    renderer.domElement.style.width = renderer.domElement.style.height = '100%';
    container.appendChild( renderer.domElement );

    this.renderer = renderer; // > this.renderer.info

    var loadScreen = new LoadScreen();
    var ctx = new Context();
    var ui = new UI();

	loadScreen.start();
	
	events.on( {
		initPrompted : function () { 
			ctx.start(); 
	    	loadScreen.end();
	    	ui.set(); 
	    },
		//texturesready : function () { console.log('texturesready'); },
	} );

    function LoadScreen () {

    	/*
    		This function behaves as follow : 

    		1. loads all geometries
    		2. creates all meshes listed
    		3. if fTLL defined && fTLL load time > 5 seconds or isMobile

	    			prompts to 
	    			- view now & continue loading in background
	    			- or view now without loading the rest (so low bandwitdh connexions & mobiles with low RAM don't wait an inifinite load or crash their devices)

			   else

					3. loads all textures but ends loadscreen at 'firsttexturesloadlimit'
					4. prompts starting visualization

		  	   fires texturescomplete event if chosen
    	*/

    	var _this = this;

    	var w, lI;
	    var tL = data.textures.length, tC = 0, fTC = 0, tI;
	    var gL = data.geometries.length, gC = 0, gI;
	    var mL = data.meshes.length;
	    var go, wa;
	    var fTLL = options.hasOwnProperty( 'firstTexturesLoadLimit' ) ? options.firstTexturesLoadLimit : tL;
		var timer;

	    this.complete = false;// in case it is complete before the user asks it ? (in what case ?)

    	this.start = function () {

		    var svg = useSmooth ? "<svg width=50 height=50 class='loader-svg'>"+
		            '<path d="M 25,2 A 23,23,0,1,1,25,49  A 23,23,0,1,1,25,2" fill=none stroke-linecap=round stroke-width=3 stroke=#244 ></path>'+
		            '<path class=spinner-loading d="M 25,2 A 23,23,0,1,1,25,49  A 23,23,0,1,1,25,2" stroke-linecap=round stroke-width=3></path>'+
		        '</svg>' : '';

		    w = document.createElement( 'div' );
		    w.className = 'loader-wrapper';
		    w.style.height = height + 'px' ;
		    w.style.width = width + 'px' ;

		    w.innerHTML = ''+
				'<div class=loader-infos-wrapper>'+
				    '<div class=illumination></div>'+
				    '<div id=loader-infos>'+
				        svg +
				    '</div>'+
				    '<span class=valign></span>'+
				'</div>'+
				'<span class=valign></span>';
		    var re = !! window.WebGLRenderingContext ? 'votre appareil ne semble pas disposer de carte graphique' : 'votre navigateur est obsolète' ;
		    wa = document.createElement('p');
		    gI = document.createElement('p'); gI.innerHTML = '<br>&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;analyse des géometries, 0/' + gL + ' (3Mo)';
		    tI = document.createElement('p'); tI.innerHTML = '&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;chargement des textures, 0/' + tL + ' (14Mo)';
		    go = document.createElement('p'); go.innerHTML = 'cliquez pour lancer l\'application';
		    gI.className = tI.className = go.className = 'info';  
		    if ( ! webgl ) wa.innerHTML = '<br>&#9888&nbsp;<i>Contenus webgl non disponibles<br>('+ re +')<br>la visualisation sera de basse qualité</i>'; 
		    else wa.innerHTML = '<br><i>pour améliorer la fluidité, <br>changez les paramètres d\'affichage</i>';

			container.appendChild( w );
			lI = document.getElementById( 'loader-infos' );
	        lI.appendChild( gI );
	    	setTimeout( loadGeometries, 500 ); 
    	};

	    this.loadTextures = function( from ) {

	        if ( typeof from === 'undefined' ) {
	        	from = 0;
	        	lI.appendChild( tI );
	        	timer = Date.now();
	        } else {
	        	timer = null;
	        }

	        //first load ends at ftll on mobile.
	        //on desktop the loadscreen will end but the requests will continue
	        var end = ( typeof from !== 'undefined' && ( from > 0 ) ) ? tL : fTLL ;

	        //set delay for animations when infos are returned to loadscreen
	        var d = from ? 0 : 500;

	        //for canvas 2D renderer
	        var tLoader = new THREE.TextureLoader();

	        setTimeout( function () { for ( var i = from ; i < end ; i++ ) load( i ); }, d );
	        
	        function load ( i ) {

	        	//load function : it only assigns
	            var src = 'img/' + data.textures[i] + '.png',
	            	name = data.textures[ i ],
	            	//if ftll has been defined, the second load will have an other callback
	            	cb = i <= fTLL ? onFirstLoaded : onLoaded ;

	            if ( webgl ) {
	            	//webgl texture loader = imageutils
	            	data.textures[ i ] = THREE.ImageUtils.loadTexture( src, {}, cb );
	            	//specific to here, to implement in resources.textures later
		            if ( [ 13, 14, 8, 9, 16, 5, 4 ].indexOf( i ) > -1 ) data.textures[ i ].minFilter = THREE.LinearFilter;
		            //name can yet be fixed with imageutils.loadtexture
		            data.textures[ i ].name = name;
	            } else {
	            	//texture loader does not behave the same : the texture will have to be set in the callback
	            	tLoader.load( src, function ( t ) {
	            		//to assign texture on first load
	            		t.name = name;
	            		data.textures[ i ] = cb( t );
	            		data.textures[ i ].name = name;
	            	} );
	            }
	        }

	        function onFirstLoaded ( t ) {
	        	fTC++;
	        	tC++;

	        	assignTexture( t );

	        	//update UI for first textures, fire events & end loadscreen
	            if ( fTC < fTLL ) {
	            	tI.innerHTML = '&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;chargement des textures, ' + fTC + '/' + tL + ' (14Mo)';
	            } else if ( fTC === fTLL ) {
	                tI.innerHTML = '&#9745;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;chargement des textures, ' + fTC + '/' + tL + ' (14Mo)';

	                events.fire( 'texturesready' );

	                setTimeout( function () {
	                	_this.promptsInit();
	                }, d );
	            }

	        	if ( tC === tL ) {
	        		events.fire( 'texturescomplete' );
	        		_this.complete = true;
	        	}

	        	if ( ! webgl ) return t;
	        }

	        function onLoaded ( t ) {
	        	tC++;

	        	if ( tC === tL ) {
	        		events.fire( 'texturescomplete' );
	        		_this.complete = true;
	        	}

	        	if ( ! webgl ) return t;
	        }

	        function assignTexture ( tx ) {
	        	//assign texture to material map of matching meshes 
	        	var dm = data.meshes;
	        	for ( var j = 0 ; j < dm.length ; j++ ) {
	        		var dmj = dm[ j ], uD = dmj.userData;
	        		if ( uD.hasOwnProperty( 'map' ) && uD.map === tx.name ) {
	        			dmj.material.map = tx;
	        			dmj.material.needsUpdate = true;
	        			delete uD.map ;
	        		}
	        	}
	        }
	    };

	    this.promptsInit = function () {
	    	lI.removeChild( tI );
	    	lI.removeChild( gI );
			lI.innerHTML = ''; 
			lI.appendChild( go );

			var delay;

			if ( options.hasOwnProperty( 'firstTexturesLoadLimit' ) && timer ) delay = Date.now() - timer;

			if ( delay > 5000 || isMobile ) {
				//go.className = '';
				go.style.paddingRight=go.style.paddingLeft='50px';
				go.innerHTML = fTLL + " textures sur " + tL + " ont pu être chargées.<br>"+
					"Charger le reste maintenant (10Mo) ?<br>"+
					"Le chargement se poursuivra en arrière-plan<br>";
				var bNow = document.createElement( 'button' ), bLat = document.createElement( 'button' );
				bNow.innerHTML = 'OUI'; bLat.innerHTML = 'PLUS TARD';
				bNow.className = bLat.className = 'loader-prompt-mobile';
				go.appendChild( bNow ); go.appendChild( bLat );
				bNow.addEventListener( 'click', loadMore, false ); bNow.addEventListener( 'touchstart', loadMore, false );
				bLat.addEventListener( 'click', loadScreenOff, false ); bLat.addEventListener( 'touchstart', loadScreenOff, false );
			} else {
				lI.appendChild( wa );
		        container.addEventListener( 'click', loadScreenOff, false );
		        container.addEventListener( 'touchstart', loadScreenOff, false );
		        container.style.cursor = 'pointer';
	        	_this.loadTextures( fTLL );
			}

	        function loadMore() {
	        	_this.loadTextures( fTLL );
	        	loadScreenOff();
				bNow.removeEventListener( 'click', loadMore, false ); bNow.removeEventListener( 'touchstart', loadMore, false );
				bLat.removeEventListener( 'click', loadScreenOff, false ); bLat.removeEventListener( 'touchstart', loadScreenOff, false );
	        }

	        function loadScreenOff () {
	        	go.className = 'info';
	            go.innerHTML = 'initialisation...';
	            wa = undefined;
           		container.removeEventListener( 'click', loadScreenOff, false );
            	container.removeEventListener( 'touchstart', loadScreenOff, false );
	            setTimeout( function (){
	                //if ( isMobile ) fullscreen( renderer.domElement );//needs resize listener
	               	if ( typeof bNow === 'undefined' ) {
	                	container.style.cursor = 'auto';
	                }
	                events.fire( 'initPrompted' );
	            }, 400 );
	        }
	    };

    	this.end = function () {
	    	w.style.opacity = 1;
	    	w.innerHTML = '';

	    	if ( useSmooth ) {
				TweenLite.to( w.style, 1, { 
		    			opacity : 0, 
		    			easing : Power3.easeIn,
		    			onComplete : function () { 
		    				container.removeChild( w ); 
		    				w = undefined;
		    			}
		    		});
	    	} else {
	    		container.removeChild( w );
	    		w = undefined;	
	    	}   	
    	};

	    function loadGeometries () {

   			var jl = new THREE.JSONLoader();

	        for ( var i = 0 ; i < gL ; i++ ) load( i );

	        function load ( i ) {
	        	var src = 'JSON/' + data.geometries[ i ] + '.json', name = data.geometries[ i ];
	            jl.load( src, function( g ) {
	                g.name = name;
	                data.geometries[ i ] = g;
	                onLoaded();
	            });
	        }

	        function onLoaded () {
		        gC++; gI.innerHTML = '<br/>&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;analyse des géometries, ' + gC + '/' + gL + ' (3Mo)' ; 
		        if ( gC === gL ) {
		            gI.innerHTML = '<br/>&#9745;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;analyse des géometries, ' + gC + '/' + gL + ' (3Mo)' ;
		            createMeshes();
		            _this.loadTextures( );
		        }
	        }
	    }

	    function createMeshes () {
	        for ( var i = 0 ; i < mL ; i++ ) {
				var mI = data.meshes[ i ];
	            var mapRef = mI.hasOwnProperty( 'map' ) ? mI.map : undefined;
	            var steps = mI.hasOwnProperty( 'steps' ) ? mI.steps : undefined;
	            var infos = mI.hasOwnProperty( 'infos' ) ? mI.infos : undefined;

	            if ( ! webgl ) mI.material = new THREE.MeshLambertMaterial( { color: 0xffffff, overdraw : .5 } );
	            
	            var mesh = new THREE.Mesh( data.geometries[ mI.geometry ], mI.material );

	            if ( mapRef !== undefined ) mesh.userData.map = data.textures[ mapRef ];
	            if ( steps !== undefined ) mesh.userData.steps = steps; 
	            if ( infos !== undefined ) mesh.userData.infos = infos;
	            mesh.name = mI.name;
	            data.meshes[ i ] = mesh;
			}
	    }
    }

    function Context () {

    	var _this = this;

    	scene = new THREE.Scene();
    	this.cars = new Cars();
    	this.trees = new Trees();

	    this.meshes = {
	    	main : [],
	    	env : {
	    		merged : null,
	    		textured : null
	    	}
	    };

    	this.start = function () {
	        _this.setView();
	        _this.setLighting();

			if ( options.hasOwnProperty( 'skyTexture' ) ) _this.setSky();

			_this.prepareMeshes();

			if ( webgl ) _this.animate();  
			else renderer.render( scene, camera );
    	};

	    this.prepareMeshes = function () {

			var carsMeshesRef = [];
			if ( options.hasOwnProperty( 'cars' ) ) for ( var i = 0 ; i < options.cars.meshes.length ; i++ ) carsMeshesRef.push( options.cars.meshes[i].mesh );

			convertEnvMeshes();//in case strings are passed in the array

			//if not envmesh, push all in meshes.main, otherwise separate them in this one + meshes.env.textured
			fillThisMeshes();

			//create trees & cars
			createTreesCars();

			//if envmesh is defined, merge envmeshes (& eventually trees & cars) 
			//to propose a low-envmesh for both display parameters and before textureload is complete
			createMergedMesh();

			//if webgl, cast shadows for main (+ textured if sky), and for mergedmesh (if envmeshes)
			prepareShadows();

			prepareScene();

		    //update textured meshes textures & remove merged mesh
	    	if ( loadScreen.complete ) textureMeshes();
	    	else events.on( 'texturescomplete', textureMeshes );

        	function textureMeshes () {
			    //updates textures > fTLL on texturesComplete
			    //(which supposes fTLL excludes envMeshes materials..)
			    //then removes mergedmesh and adds textured envmeshes

        		options.hasOwnProperty( 'envMeshes' ) ? assignTexturesIn( _this.meshes.env.textured ) : assignTexturesIn( _this.meshes.main );

        		//update cars
        		if ( options.hasOwnProperty( 'cars' ) && options.cars.hasOwnProperty( 'parkedCars' ) ) {
	        		_this.cars.parkedCars.material.map = data.textures[ options.cars.texture ];
	        		_this.cars.parkedCars.material.needsUpdate = true;
	        		scene.add( _this.cars.parkedCars );
        		}

        		if ( options.hasOwnProperty( 'trees' ) ) {
        			scene.remove( _this.trees.low );
        			scene.add( _this.trees.high );
        		}

        		if ( options.hasOwnProperty( 'envMeshes' ) ) {
        			for ( var i = 0 ; i < _this.meshes.env.textured.length ; i++ ) scene.add( _this.meshes.env.textured[ i ] );
        		} else {
        			for ( var i = 0 ; i < _this.meshes.main.length ; i++ ) {
			    		if ( ! _this.meshes.main[ i ].userData.hasOwnProperty( 'steps' ) || _this.meshes.main[ i ].userData.steps[ 0 ] === true ) {
			        		scene.add( _this.meshes.main[ i ] );
			        	}
        			} 
        			if ( options.hasOwnProperty( 'skyTexture' ) ) scene.add( _this.meshes.env.textured[ 0 ] );    			
        		}

    			scene.remove( _this.meshes.env.merged );

        		function assignTexturesIn ( o ) {
	        		for ( var i = 0 ; i < o.length ; i++ ) {
	        			for ( var j = 0 ; j < data.textures.length ; j++ ) {
	        				if ( o[ i ].userData.map === data.textures[ j ].name ) {
	        					o[ i ].material.map = data.textures[ j ];
	        					o[ i ].material.needsUpdate = true;
	        					delete o[ i ].userData.map;
	        				}
	        			}
	        		}        			
        		}
        	}

			function convertEnvMeshes () {
				if ( options.hasOwnProperty( 'envMeshes' ) ) {
					if ( ! _this.meshes.env.textured ) _this.meshes.env.textured = [];
					for ( var i = 0 ; i < options.envMeshes.length ; i++ ) {
						if ( typeof options.envMeshes[ i ] === 'string' ) {
							for ( var j = 0 ; j < data.meshes.length ; j++ ) {
								if ( data.meshes[ j ].name === options.envMeshes[ i ] ) options.envMeshes[ i ] = j;
							}
						}
					}
				}
			}

			function fillThisMeshes () {
		    	for ( var i = 0 ; i < data.meshes.length ; i++ ) {

		    		var dmi = data.meshes[ i ];

		    		//avoid car meshes
		            if ( ! options.hasOwnProperty( 'cars' ) || ( options.hasOwnProperty( 'cars' ) && carsMeshesRef.indexOf( i ) === -1 ) ) {//so cars are not considered here

		            	//generic meshes settings
		                if ( i < 11 || i > 19 ) dmi.castShadow = dmi.receiveShadow = true;//remove condition for further landscapes : here i drawed shadows on some of them yet
		                dmi.matrixAutoUpdate = false;

		                //push in the right array
		                if ( options.hasOwnProperty( 'envMeshes' ) ) {
		                	if ( options.envMeshes.indexOf( i ) === -1 ) _this.meshes.main.push( dmi );
		                	else _this.meshes.env.textured.push( dmi );
		                } else {
		                	//if not options.envMeshes, all meshes are main. 
		                	_this.meshes.main.push( dmi );
		                }

		            }

		    	}
			}

			function createTreesCars () {
		    	if ( options.hasOwnProperty( 'trees' ) ) _this.trees.create( options.trees );

		    	if ( options.hasOwnProperty( 'cars' ) ) {

			    		var c = options.cars;

			    		_this.cars.init( c.meshes );

			    		if ( c.hasOwnProperty( 'parkedCars' ) ) _this.cars.createParkedCars( c );

			    		if ( c.hasOwnProperty( 'streetCars' ) ) _this.cars.createStreetCars( c );

		    	}
			}

			function createMergedMesh () {
	        	if ( options.hasOwnProperty( 'envMeshes' ) ) {

	        		var mergedG = new THREE.Geometry();

		        	for ( var j = 0 ; j < _this.meshes.env.textured.length ; j++ ) {
		        		if ( _this.meshes.env.textured[ j ].name !== 'sky' ) mergedG.merge( _this.meshes.env.textured[ j ].geometry );
		        	}

			    	if ( options.hasOwnProperty( 'trees' ) ) mergedG.merge( _this.trees.low.geometry );

			   		if ( options.hasOwnProperty( 'cars' ) && options.cars.hasOwnProperty( 'parkedCars' ) ) mergedG.merge( _this.cars.parkedCars.geometry );
		   	
		        	_this.meshes.env.merged = new THREE.Mesh( mergedG, new THREE.MeshLambertMaterial( {
		    			color : 0xffffff,
		    			shading : THREE.FlatShading
		    			} )
		        	);

		        	_this.meshes.env.merged.castShadow = _this.meshes.env.merged.receiveShadow = true;
		        	_this.meshes.env.merged.matrixAutoUpdate = false;

		        	if ( ! webgl ) _this.meshes.env.merged.material.overdraw = .5;

		        }
			}

			function prepareShadows () {
        		//anyway, add all main meshes
        		for ( var i = 0 ; i < _this.meshes.main.length ; i++ ) {
        			if ( ! _this.meshes.main[ i ].userData.hasOwnProperty( 'steps' ) || _this.meshes.main[ i ].userData.steps[ 0 ] === true ) {
        				scene.add( _this.meshes.main[ i ] );
        			}
        		}

	        	if ( webgl ) {

	        		if ( _this.meshes.env.textured ) for ( var i = 0 ; i < _this.meshes.env.textured.length ; i++ ) scene.add( _this.meshes.env.textured[ i ] );
	        		if ( options.hasOwnProperty( 'trees' ) ) scene.add( _this.trees.low );
	        		if ( options.hasOwnProperty( 'cars' ) && options.cars.hasOwnProperty( 'parkedCars' ) ) scene.add( _this.cars.parkedCars );

	        		renderer.render( scene, camera );

	        		//remove trees, cars and envMeshes (depending if merged will have to be added)
	        		if ( _this.meshes.env.textured ) for ( var i = 0 ; i < _this.meshes.env.textured.length ; i++ ) scene.remove( _this.meshes.env.textured[ i ] );
	        		if ( options.hasOwnProperty( 'trees' ) ) scene.remove( _this.trees.low );
	        		if ( options.hasOwnProperty( 'cars' ) && options.cars.hasOwnProperty( 'parkedCars' ) ) scene.remove( _this.cars.parkedCars );

	        	} 
			}

			function prepareScene () {
			    if ( options.hasOwnProperty( 'envMeshes' ) ) {
			    	scene.add( _this.meshes.env.merged );
			    } else if ( webgl ) {
	        		if ( options.hasOwnProperty( 'trees' ) ) scene.add( _this.trees.low );
	        		if ( options.hasOwnProperty( 'cars' ) && options.cars.hasOwnProperty( 'parkedCars' ) ) scene.add( _this.cars.parkedCars );
	   		    }
			}
	    };

    	this.setView = function () {
	        camera = new THREE.PerspectiveCamera( 37, width / height, 1, 150 );
	        camera.position.set( 10, 12, 20 );//r = 25.4
		    camera.lastPosition = new THREE.Vector3().copy( camera.position );
	        camera.update = true;

        	controls = new THREE.OrbitControls( camera, renderer.domElement );
        	controls.enableZoom = false;
        	controls.enablePan = false;
        	controls.maxPolarAngle = controls.minPolarAngle = 1.077;

	        if ( webgl ) {
	        	controls.enableDamping = true;
        		controls.rotateSpeed = .12;
	        	controls.dampingFactor = .11;
	        } else {
	        	scene.add( camera )
	        	controls.addEventListener( 'change', function () {
	        		renderer.render( scene, camera );
	        	} );
	        }
    	};

    	this.setSky = function ( w ) {
	        var _w = typeof w !== 'undefined' ? w : 32;
	        var sky = new THREE.Mesh(
	            new THREE.CylinderGeometry( _w, _w, 25, 60, 1, true ),
	            new THREE.MeshBasicMaterial( { color : 0xffffff } )
	            );
	        sky.position.y = webgl ? 9 : 7.5;//uv does not apply the same on canvas renderer
	        sky.scale.x = -1;
	        sky.name = 'sky';
	        sky.updateMatrixWorld();
	        sky.matrixAutoUpdate = false; //??????
	        sky.userData.map = data.textures[ options.skyTexture ].name ;

	        if ( ! webgl ) sky.material.overdraw = .5;

	        if ( ! _this.meshes.env.textured ) _this.meshes.env.textured = [];

	        _this.meshes.env.textured.push( sky );
    	};

    	this.setLighting = function () {
	        var ambient = new THREE.AmbientLight( 0x888888 );
	        var light = new THREE.DirectionalLight( 0xffffff, 1.3 );
	        light.position.set( 0, 35, 20 );
	        light.shadowDarkness = 1;
	    	light.castShadow = true;
	    	light.shadowCameraFar = 60;
	    	light.shadowCameraTop = 25;
	    	light.shadowCameraNear = light.shadowCameraRight = 25;
	    	light.shadowCameraBottom = light.shadowCameraLeft = -25;
	    	light.shadowMapWidth = light.shadowMapHeight = 2048;
	    	light.shadowDarkness = .5;

	        scene.add( light, ambient );
	    	renderer.shadowMapEnabled = true;
    	};

    	this.animate = function () {

    		var v = new THREE.Vector3(), d;

			( function loop () {

				requestAnimationFrame( loop );

				controls.update();

				d = v.subVectors( camera.position, camera.lastPosition ).length();

				if ( d > .01 || camera.update ) {
					renderer.render( scene, camera );
					camera.lastPosition.copy( camera.position );
					camera.update = false;
				}

			} ) ();
    	};
    }

    function UI () {

    	var _this = this;

    	var bGCN = 'UI-button';//button generic classname

    	this.set = function () {

    		//buttons
    		setParametersMenu();
    		if ( options.hasOwnProperty( 'fullscreen' ) && options.fullscreen ) setFullscreen();

    		//steps UI
    		if ( options.hasOwnProperty( 'steps' ) && options.steps.hasOwnProperty( 'length' ) ) setSteps();
    	};

    	function setParametersMenu () {

    		//bottom left button
    		var b = document.createElement( 'button' );
    		b.className = bGCN;
    		b.id = 'params';
    		b.style.cssText = 'height:43px;width:43px;top:100%;margin-top:-43px;';
    		container.appendChild( b );
    		b.innerHTML = ""+
    			"<svg width=33 height=33 viewBox='108 13 72 72' class='UI-svg'>"+
    			 	"<path fill=chocolate d='m 143.08444,12.785985 c -1.0016,0 -1.37756,0.9016 -1.80664,1.806641 l -2,4.21875 c -0.004,0.0091 -0.002,"+
    			 	"	0.01827 -0.006,0.02734 a 30.96591,30.96591 0 0 0 -3.69922,0.84375 c -0.015,-0.103974 -0.0579,-0.194541 -0.14648,-0.261718 l -3.72071,"+
    			 	"   -2.820313 c -0.79813,-0.60511 -1.54878,-1.233434 -2.4375,-0.771484 l -3.74218,1.947265 c -0.88872,0.46194 -0.80817,1.43657 -0.77149,"+
    			 	"	2.4375 l 0.17188,4.666016 c 0.005,0.13424 0.0715,0.234494 0.17969,0.3125 a 30.96591,30.96591 0 0 0 -3.29493,3.052734 c -0.0549,-0.04653"+
    			 	"	 -0.11652,-0.08125 -0.19531,-0.0918 l -4.62691,-0.619134 c -0.99275,-0.13288 -1.95661,-0.30887 -2.50196,0.53125 l -2.29687,3.539062 c "+
    			 	"-0.54535,0.84013 0.008,1.64733 0.5332,2.5 l 2.44922,3.97461 c 0.0803,0.130332 0.20985,0.182971 0.36914,0.185547 a 30.96591,30.96591 0 0 "+
    			 	"0 -1.30273,4.46875 c -0.13187,-0.08546 -0.26786,-0.116542 -0.40625,-0.05469 l -4.26172,1.90625 c -0.91443,0.408702 -1.82705,0.76618 "+
    			 	"-1.84961,1.76758 l -0.0937,4.216797 c -0.0224,1.0013 0.87239,1.398356 1.76758,1.847656 l 4.17187,2.09375 c 0.1289,0.06469 0.25955,"+
    			 	"0.04624 0.38867,-0.02344 a 30.96591,30.96591 0 0 0 0.77735,3.453125 c -0.16397,-0.01617 -0.30356,0.02163 -0.39844,0.146484 l -2.82422,"+
    			 	"3.716797 c -0.606,0.7975 -1.2344,1.5483 -0.77344,2.4375 l 1.94141,3.746094 c 0.46096,0.8892 1.43653,0.809437 2.4375,0.773437 l 4.66602,"+
    			 	"-0.166015 c 0.13881,-0.0049 0.24133,-0.07841 0.32031,-0.19336 a 30.96591,30.96591 0 0 0 2.82031,3.183594 c -0.14919,0.06686 -0.25062,0.169683 "+
    			 	"-0.27148,0.324219 l -0.62305,4.625 c -0.13397,0.9927 -0.31023,1.955653 0.5293,2.501953 l 3.53515,2.300781 c 0.83952,0.5463 1.6487,-0.0048 "+
    			 	"2.50196,-0.529297 l 3.97656,-2.445312 c 0.13411,-0.08244 0.18596,-0.217129 0.18555,-0.382813 a 30.96591,30.96591 0 0 0 4.41406,1.416016 "+
    			 	"c -0.0415,0.102122 -0.0471,0.20685 0,0.3125 l 1.89844,4.263672 c 0.40767,0.9149 0.76429,1.825609 1.76562,1.849609 l 4.2168,0.09961 "+
    			 	"c 1.00132,0.0236 1.40131,-0.870925 1.85156,-1.765625 l 2.09766,-4.169922 c 0.0108,-0.02139 0.009,-0.04298 0.0156,-0.06445 a 30.96591,"+
    			 	"30.96591 0 0 0 4.72656,-1.056641 c 0.0263,0.06782 0.0638,0.128774 0.12891,0.175781 l 3.7871,2.732422 c 0.81216,0.5862 1.57748,1.195591 "+
    			 	"2.45508,0.712891 l 3.69532,-2.033203 c 0.8776,-0.4827 0.7731,-1.455279 0.71289,-2.455078 l -0.28125,-4.660157 c -0.004,-0.06095 -0.0187,"+
    			 	"-0.115787 -0.0449,-0.164062 a 30.96591,30.96591 0 0 0 3.27929,-3.1875 30.96591,30.96591 0 0 0 0.002,0 l 4.63867,0.511719 c 0.99561,0.109399 "+
    			 	"1.9609,0.260903 2.48633,-0.591797 l 2.21284,-3.591797 c 0.52544,-0.8527 -0.0444,-1.646228 -0.58984,-2.486328 l -2.54297,-3.916016 c -0.0319,"+
    			 	"-0.04917 -0.0709,-0.08653 -0.11524,-0.115234 a 30.96591,30.96591 0 0 0 1.24414,-4.492188 c 0.0341,-0.0061 0.0674,-0.0072 0.10157,-0.02344 l "+
    			 	"4.21679,-2.003907 c 0.90456,-0.43 1.80764,-0.808946 1.80664,-1.810546 l -0.006,-4.21875 c -0.001,-1.0016 -0.90503,-1.378541 -1.81054,-1.806641 "+
    			 	"l -4.22071,-1.994141 c -0.0198,-0.0093 -0.0389,-0.0078 -0.0586,-0.01367 a 30.96591,30.96591 0 0 0 -0.85937,-3.402343 c 0.19779,0.03398 0.36144,"+
    			 	"-0.0048 0.46679,-0.150391 l 2.73633,-3.783203 c 0.58708,-0.8115 1.19855,-1.576978 0.7168,-2.455078 l -2.0293,-3.697266 c -0.48175,-0.87814 "+
    			 	"-1.45522,-0.775897 -2.45508,-0.716797 l -4.66015,0.275391 c -0.15458,0.0091 -0.264,0.102186 -0.3418,0.244141 a 30.96591,30.96591 0 0 0 "+
    			 	"-3.11133,-3.263672 c 0.055,-0.0596 0.0957,-0.128489 0.10547,-0.216797 l 0.51563,-4.638672 c 0.11058,-0.99548 0.26425,-1.961901 -0.58789,"+
    			 	"-2.488281 l -3.58985,-2.21875 c -0.85213,-0.52639 -1.6476,0.0434 -2.48828,0.58789 l -3.91797,2.539063 c -0.0957,0.06201 -0.14641,0.151613 "+
    			 	"-0.16797,0.257812 a 30.96591,30.96591 0 0 0 -4.05664,-1.173828 c 0.0422,-0.105666 0.0469,-0.213088 -0.004,-0.320312 l -2,-4.21875 c -0.42905,"+
    			 	"-0.90504 -0.80695,-1.80664 -1.80856,-1.80664 l -4.21875,0 z m 1.24805,25.246094 a 11.273787,11.273787 0 0 1 11.27344,11.273437 11.273787,11.273787 "+
    			 	"0 0 1 -11.27344,11.273438 11.273787,11.273787 0 0 1 -11.27344,-11.273438 11.273787,11.273787 0 0 1 11.27344,-11.273437 z'>"+
  					"</path>"+
    			"</svg>";

    		b.addEventListener( 'click', displayMenu, false );

    		/**menu tab**/

    		//1. create div
	    	var menuDiv = document.createElement( 'div' );
	    	menuDiv.className = 'UI-menu';
	    	container.appendChild( menuDiv );

	    	//2. add buttons
    		var display = document.createElement( 'button' ),
    			edit = document.createElement( 'button' ),
    			install = document.createElement( 'button' ),
    			about = document.createElement( 'button' );
    		display.className = edit.className = install.className = about.className = 'UI-menu-buttons';
    		display.innerHTML = 'AFFICHAGE';
    		edit.innerHTML = 'EDITION';
    		install.innerHTML = 'APPLI MOBILE';
    		about.innerHTML = 'À PROPOS';
			menuDiv.appendChild( display );
			menuDiv.appendChild( edit );
    		menuDiv.appendChild( install );
			menuDiv.appendChild( about );  

			//3. deduce style
			var l = parseInt( getComputedStyle( menuDiv, null).width );
			menuDiv.style.marginLeft = - l + 'px';
  			setTimeout( function () { menuDiv.style.transition = 'margin-left 200ms ease' }, 0 );

			//4. events

    		function displayMenu () {			
    			//compute every buttons'width and get the max value
    			menuDiv.style.marginLeft = '0px';
    			renderer.domElement.addEventListener( 'mousedown', hideMenu, false );
    			renderer.domElement.addEventListener( 'touchstart', hideMenu, false );
    			menuDiv.addEventListener( 'touchmove', onTouchMove, false );
    			menuDiv.addEventListener( 'touchstart', onTouchStart, false );
    			menuDiv.addEventListener( 'touchend', onTouchEnd, false );
    		}

    		function hideMenu () {
    			menuDiv.style.marginLeft = - l + 'px'; // = owns width
    			renderer.domElement.removeEventListener( 'mousedown', hideMenu, false );
    			renderer.domElement.removeEventListener( 'touchstart', hideMenu, false );
    			menuDiv.removeEventListener( 'touchmove',  onTouchMove, false );
    			menuDiv.removeEventListener( 'touchstart', onTouchStart, false );
    			menuDiv.removeEventListener( 'touchend', onTouchEnd, false );
    		}

    		//swipe detection on menuDiv
			var startX, dist;

    		function onTouchStart ( e ) {
    			startX = e.changedTouches[ 0 ].pageX;
    		}

    		function onTouchEnd () {
    			dist <= -50 ? hideMenu() : menuDiv.style.marginLeft = '0px';
    		}

    		function onTouchMove ( e ) {
    			dist = e.changedTouches[ 0 ].pageX - startX;
    			menuDiv.style.marginLeft = Math.min( dist, 0 ) + 'px';
    		}
		}

    	function setFullscreen () {

    		var b = document.createElement( 'button' );
    		b.className = bGCN;
    		b.id = 'params';
    		b.style.cssText = 'height:43px;width:43px;top:100%;margin-top:-43px;left:100%;margin-left:-43px;';
    		var svgEnter = ""+
    			"<svg width=33 height=33 viewBox='-4 -4 8 8'>"+
				"	<path fill=chocolate d='M -4, 4 L -1 4 L -2 3 L 0 1 L 2 3 L 1 4 L 4 4 L 4 1 L 3 2 L 1 0 L 3 -2 "+
				"		L4 -1 L 4 -4 L 1 -4 L 2 -3 L 0 -1 L -2 -3 L -1 -4 L -4 -4 L -4 -1 L -3 -2 L -1 0 L -3 2 L -4 1 "+
				"		L -4 4'>"+
				"	</path>"+
				"</svg>";

			var svgExit = ""+
    			"<svg width=33 height=33 viewBox='-4 -4 8 8'>"+
				"	<path fill=chocolate d='M -3 4 L -2 3 L -1 4 L -1 1 L -4 1 L -3 2 L -4 3 L -3 4'></path>"+
				"	<path fill=chocolate d='M 1 4 L 2 3 L 3 4 L 4 3 L 3 2 L 4 1 L 1 1 L 1 4'></path>"+
				"	<path fill=chocolate d='M 1 -1 L 4 -1 L 3 -2 L 4 -3 L 3 -4 L 2 -3 L 1 -4 L 1 -1'></path>"+
				"	<path fill=chocolate d='M -1 -1 L -1 -4 L -2 -3 L -3 -4 L -4 -3 L -3 -2 L -4 -1 L -1 -1'></path>"+
				"</svg>";
			b.innerHTML = svgEnter;
    		container.appendChild( b );

    		b.addEventListener( 'click', fullscreen, false );

		    function exitFullscreen () {
		    	scope.fullscreen = false;
				if( document.exitFullscreen ) {
					document.exitFullscreen();
				} else if ( document.mozCancelFullScreen ) {
					document.mozCancelFullScreen();
				} else if ( document.webkitExitFullscreen ) {
					document.webkitExitFullscreen();
				}
    			renderer.setSize( width, height);
    			camera.aspect = width / height;
    			camera.updateProjectionMatrix();
    			camera.update = true;
				if ( ! webgl ) renderer.render( scene, camera );
    			b.addEventListener( 'click', fullscreen, false );
    			b.removeEventListener( 'click', exitFullscreen, false );
    			b.innerHTML = svgEnter;
			}

		    function fullscreen () {
		    	scope.fullscreen = true;
		        if ( container.requestFullscreen ) {
		            container.requestFullscreen();
		        } else if ( container.mozRequestFullScreen ) {
		            container.mozRequestFullScreen();
		        } else if ( container.webkitRequestFullscreen ) {
		            container.webkitRequestFullscreen();
		        } else if ( container.msRequestFullscreen ) {
		            container.msRequestFullscreen();
		        }
    			renderer.setSize( innerWidth, innerHeight);
    			camera.aspect = innerWidth / innerHeight;
    			camera.updateProjectionMatrix();
    			camera.update = true;
				if ( ! webgl ) renderer.render( scene, camera );
    			b.addEventListener( 'click', exitFullscreen, false );
    			b.removeEventListener( 'click', fullscreen, false );
    			b.innerHTML = svgExit;
		    }

			container.addEventListener( 'fullscreenchange', fullscreenChange, false );
			container.addEventListener( 'MSFullscreenChange', fullscreenChange, false );
			container.addEventListener( 'mozfullscreenchange', fullscreenChange, false );
			container.addEventListener( 'webkitfullscreenchange', fullscreenChange, false );

		    function fullscreenChange () {
		    	if ( ! ( document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement ) ) exitFullscreen();
		    }
    	}

    	function setSteps () {

    		var currentStep = 0,
    			s = options.steps,
    			sL = s.length;

    		var valign = document.createElement( 'span' ),
    			slC = document.createElement( 'div' ),
    			sl = document.createElement( 'div' ),
    			bB = document.createElement( 'button' ),
    			bA = document.createElement( 'button' );

    		slC.id = 'UI-slider-container';
    		sl.id = 'UI-slider';
    		valign.className = 'UI-slider-valign';
    		bB.className = bA.className = 'UI-slider-buttons';
    		bB.id = 'UI-button-before';
    		bA.id = 'UI-button-after';

    		sl.appendChild( valign ); 
    		slC.appendChild( sl );
    		container.appendChild( slC );
    		container.appendChild( bA );
    		container.appendChild( bB );


    		bB.addEventListener( 'click', oneStepBefore, false );
    		bA.addEventListener( 'click', oneStepBeyond, false );

    		bB.style.display = 'none';

			/*for(var i=0;i<stepsLength;i++){
	            var from=document.createElement('p');from.innerHTML=steps[i].from;
	            var to=document.createElement('p');to.innerHTML=steps[i].to;
	            from.className=to.className='slider-stepDate';
	            var title=document.createElement('p');title.innerHTML=steps[i].title;
	            title.className='slider-stepTitle';
	            var description=document.createElement('p');description.innerHTML=steps[i].description;
	            description.className='slider-stepDescription';
	            var step=document.createElement('div');
	            step.className='slider-step';
	            var infos=document.createElement('div');
	            infos.className='slider-stepMain';
	            infos.appendChild(title);infos.appendChild(description);
	            step.appendChild(from);step.appendChild(infos);step.appendChild(to);
	            slider.appendChild(step);
	        }*/
		        

            function oneStepBeyond ( e ) {
                e.stopPropagation();

                if ( currentStep < ( sL - 1 ) ) {
                    currentStep++;
                    //var stepsContainerWidth=parseInt(getComputedStyle(stepsContainer,null).width)+10;
                    //slider.style.left=-(stepsContainerWidth-10)*UI.stepsUI.currentStep+'px';
                    bA.style.display = currentStep === ( sL - 1 ) ? 'none' : 'block';
                    bB.style.display = currentStep === 0 ? 'none' : 'block';
                    for ( var i = 0 ; i < ctx.meshes.main.length ; i++ ) {
                        var m = ctx.meshes.main[ i ];
                        if ( m.userData.hasOwnProperty( 'steps' ) && m.userData.steps[ currentStep ] === true && m.userData.steps[ currentStep - 1 ] === false ) addMesh( m );
                        if ( m.userData.hasOwnProperty( 'steps' ) && m.userData.steps[ currentStep ] === false && m.userData.steps[ currentStep - 1 ] === true ) removeMesh( m, data );
                    }
                    if ( ! webgl ) renderer.render( scene, camera );
                }
            }

            function oneStepBefore ( e ) {
                e.stopPropagation();

                if ( currentStep > 0){
                    currentStep--;
                    //ar stepsContainerWidth=parseInt(getComputedStyle(stepsContainer,null).width)+10;
                    //lider.style.left=-(stepsContainerWidth-10)*UI.stepsUI.currentStep+'px';
                    bB.style.display = currentStep === 0 ? 'none' : 'block';
                    bA.style.display = currentStep === ( sL - 1 ) ? 'none' : 'block';
                    for ( var i = 0 ; i < ctx.meshes.main.length ; i++ ) {
                        var m = ctx.meshes.main[ i ];
                        if ( m.userData.hasOwnProperty( 'steps' ) && m.userData.steps[ currentStep ] === true && m.userData.steps[ currentStep + 1 ] === false ) addMesh( m );
                        if ( m.userData.hasOwnProperty( 'steps' ) && m.userData.steps[ currentStep ] === false && m.userData.steps[ currentStep + 1 ] === true ) removeMesh( m );
                    }
                    if ( ! webgl ) renderer.render( scene, camera );
                }
            }

		    function addMesh ( mesh ) {
	            if ( mesh.material.depthTest == false ) return;//dont add commercesdepth now
	            if ( webgl ) {
		            scene.add( mesh );
		            if ( mesh.name !== 'chantier' ) {
			            mesh.material.transparent = true;
			            mesh.material.opacity = 0;
			            mesh.material.color.set( 0x00ff00 );
			            TweenLite.to( mesh.material, .7, {
			            	opacity : 1,
			                onUpdate : function () { camera.update = true;},
			            	onComplete : function () {
			        			mesh.material.transparent = false;
			        			mesh.material.color.set( 0xffffff );
			            	}
			            });
		            }
	            } else {
	            	scene.add( mesh );
	            }
		    }

		    function removeMesh ( mesh ) {
		    	if ( webgl ) {
			    	if ( mesh.name !== 'chantier' ){
			            mesh.material.transparent = true;
			            mesh.material.color.set( 0xff0000 )
			            TweenLite.to( mesh.material, .7, {
			            	opacity : 0,
			                onUpdate : function () { camera.update = true;},
			            	onComplete : function () {
			                    scene.remove( mesh );
			                    if ( mesh.name === 'commerces' ) {
			                    	var m = ctx.meshes.main;
			                    	for ( var  i = 0 ; i < m.length ; i++ ) {
			                    		if ( m[ i ].name === 'RPA' || m[ i ].name === 'residences' || m[ i ].name === 'nouveau_sol' ) scene.remove( m[ i ] );
			                    	}
			                    }
			                }
			            });
			    	} else {
			    		setTimeout( function () {
			    			scene.remove( mesh );
			    		}, 700 );
			    	}
		    	} else {
		    		scene.remove( mesh );
		    	}
	        }
    	}
    }

    function resize () {
    	var _width = innerWidth, 
    		_height = innerHeight;
    	if ( ! scope.fullscreen ) {
    		_width = width ; _height = height;
    	}
		renderer.setSize( _width, _height);
		camera.aspect = _width / _height;
		camera.updateProjectionMatrix();
		camera.update = true;
		if ( ! webgl ) renderer.render( scene, camera );
    }

    window.addEventListener('resize',resize,false)

	function Trees () {

		var _this = this;

		this.create = function ( r ) {
    		//textured model : create foliage geometry
	        var plane=new THREE.PlaneGeometry(1.7,2.5,1,1);
	        
	        var plane1=new THREE.Mesh(plane,new THREE.MeshBasicMaterial());
	        var plane2=new THREE.Mesh(plane,new THREE.MeshBasicMaterial());
	        plane2.rotation.y=Math.PI/2;
	        plane2.updateMatrixWorld();
	        
	        var g=new THREE.Geometry();
	        g.merge(plane1.geometry,plane1.matrixWorld);
	        g.merge(plane2.geometry,plane2.matrixWorld);

	        //low poly model, to use for shadows too
	        var sphere=new THREE.Mesh(new THREE.SphereGeometry(.6,10,10),new THREE.MeshBasicMaterial());
	        var cyl=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,1,4),new THREE.MeshBasicMaterial());
	        //sphere.position.y=1.2;
	        sphere.updateMatrixWorld();
	        cyl.position.y=-1;
	        cyl.updateMatrixWorld();
	        var fg=new THREE.Geometry();
	        fg.merge(sphere.geometry,sphere.matrixWorld);
	        fg.merge(cyl.geometry,cyl.matrixWorld);

	        
	        //mat
	        var m=new THREE.MeshBasicMaterial({
	                map:data.textures[8],
	                transparent:true,
	                side:THREE.DoubleSide,
	                depthWrite:true,
	                alphaTest:.7
	            });
	        
	        var tree=new THREE.Mesh(g,m);
	        var ftree=new THREE.Mesh(fg,new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}));
	        
	        //clone to each coordinates and scale
	        var geometry=new THREE.Geometry();
	        var fgeometry=new THREE.Geometry();
	        var l=r.length;
	        for(var i=0;i<l;i++){
	            var treeY=r[i].y+(r[i].scaleY-1)*2.5/2;

	            tree.position.set(r[i].x,treeY+.5,r[i].z);
	            ftree.position.set(r[i].x,treeY+.5,r[i].z);

	            tree.scale.set(r[i].scaleX,r[i].scaleY,r[i].scaleZ);
	            ftree.scale.set(r[i].scaleX,r[i].scaleY,r[i].scaleZ);

	            tree.rotation.y+=Math.random()*Math.PI*2;
	            ftree.rotation.y+=Math.random()*Math.PI*2;
	            
	            tree.updateMatrixWorld();
	            ftree.updateMatrixWorld();

	            geometry.merge(tree.geometry.clone(),tree.matrixWorld);
	            fgeometry.merge(ftree.geometry.clone(),ftree.matrixWorld);
	        }
	        var mesh=new THREE.Mesh( geometry, m );
	        var fmesh=new THREE.Mesh( fgeometry, ftree.material );
	        fmesh.castShadow = fmesh.receiveShadow = true;
	        fmesh.matrixAutoUpdate = mesh.matrixAutoUpdate = false;

	        _this.low = fmesh;
	        _this.high = mesh;
		};
	}

	function Cars () {

		var _this = this;

		this.init = function ( r ) {
			for ( var i = 0 ; i < r.length ; i++ ) {
				var n = r[ i ].mesh;
				r[ i ].mesh = data.meshes[ n ];
			}
		};

		this.createParkedCars = function ( r ) {
			var p = r.parkedCars,
				pL = p.length,
				g = new THREE.Geometry(),
				cs = r.meshes;
		    for ( var i = 0 ; i < pL ; i++ ) {
				var c = cs[ _this.random( cs ) ].mesh;
				c.position.set( p[ i ].x, 0, p[ i ].z );
				c.rotation.y = p[ i ].rot / 180 * Math.PI;
				c.updateMatrixWorld();
				g.merge( c.geometry.clone(), c.matrixWorld );
			}
			var mt = linearFilteredSmoothLambertMaterial;
			var m=new THREE.Mesh( g, mt );
			m.receiveShadow = m.castShadow = true;
			m.matrixAutoUpdate = false;
			_this.parkedCars = m;
		};

		this.createStreetCars = function () {
			console.warn('streetCars will come later');
			/* RECENT PART 
			var cars=this.cars(data);
	        var l=this.streetCars.length;

	        CARS.streetMesh=[];

			for(var i=0;i<l;i++)createCar(i);

	        function createCar(i){
	        	//path
				var points=CARS.streetCars[i].curve.points,
					pl=points.length;

				for(var j=0;j<pl;j++)points[j]=new THREE.Vector3(points[j].x,0,points[j].z);

				CARS.streetCars[i].curve.spline=new THREE.SplineCurve3(points);

				//tweens
				var t=CARS.streetCars[i].tweens,
					tA=CARS.streetCars[i].tA,
					tL=t.length;

				var position={l:CARS.streetCars[i].begin};
			    var car=cars[CARS.randomCarIndex(cars)].car.clone();
			    car.receiveShadow=true;
			    CARS.streetMesh.push(car);

			    var tl=new TimelineLite();

		        var createAnimatedPath=function(k){
		        	var complete=function(){
						if(t[k].ending)position.l=0;
						if(i===tL-1)tl.restart();
					};
					tl.add(
						new TweenLite(
							position,
							t[k].duration/1000,//initially the time values were given in milliseconds
							{
								l:t[k].to,
								ease:t[k].easing,
								onUpdate:function(){
									var pos=CARS.streetCars[i].curve.spline.getPoint(position.l);
									car.position.set(pos.x,pos.y,pos.z);
									car.lookAt(CARS.streetCars[i].curve.spline.getPoint(position.l+.001));	
								},
								onComplete:complete,
								delay:t[k].delay/1000
							}
						)
					);
		        };

				for(var k=0;k<tL;k++)createAnimatedPath(k);*/

				/* OLD KEPT PART THAT MAY SOLVE THE ISSUE

				for(var l=0;l<tL;l++){
					if(!t[l].ending){
						if(l<(tL-1)){
							(function(l){	
								tA[l].onComplete(function(){
									tA[l+1].start();
								});
							})(l);
						}else{
							(function(l){
								tA[l].onComplete(function(){
									position.l=streetCarsData[i].begin;
									tA[0].start();
								});
							})(l);
						}
					}else{
						if(l<(tL-1)){
							(function(l){
								tA[l].onComplete(function(){
									position.l=0;
									tA[l+1].start();
								});
							})(l);
						}else{
							(function(l){
								tA[l].onComplete(function(){
									position.l=0;
									tA[0].start();
								});
							})(l);
						}
					}
				} END OF THE OLD KEPT PART*/

				/* END OF THE RECENT PART :
				var beginPos=CARS.streetCars[i].curve.spline.getPoint(CARS.streetCars[i].begin)
				car.position.set(beginPos.x,beginPos.y,beginPos.z);
				car.lookAt(CARS.streetCars[i].curve.spline.getPoint(CARS.streetCars[i].begin+.001));
				scene.add(car);
	        }
	        for(var i=0;i<CARS.streetMesh.length;i++)scene.remove(CARS.streetMesh[i])
		},*/
		};

		this.random = function ( a ) {
	        var d = 0, aL = a.length;
			for ( var i = 0 ; i < aL ; i++ ) d += a[ i ].proba;
			var r = Math.floor( Math.random() * d ), c = 0, n;
			for ( var i = 0 ; i < aL ; i++ ) {
				c += a[ i ].proba;
				if ( r < c ) { 
					n = i; 
					break;
				}
			}
			return n;
		};
	}
    
    //TODO : remove & use threejs eventsdispatcher
    function EventsHandler () {
    	//handles only single UI-scoped dispatcher
    	var _this = this;

    	this.on = function ( e, f ) {
			if ( typeof _this.l === 'undefined' ) _this.l = {};
			var tls = _this.l;
    		if ( typeof e === 'string' ) {
				if ( typeof tls[ e ] === 'undefined' ) tls[ e ] = [];
				if ( tls[ e ].indexOf( f ) === - 1 ) tls[ e ].push( f );
    		} else if ( typeof e === 'object' ) {
    			for ( var p in e ) {
					if ( typeof tls[ p ] === 'undefined' ) tls[ p ] = [];
					if ( tls[ p ].indexOf( e[p] ) === - 1 ) tls[ p ].push( e[p] );
    			}
    		}
    	};

    	this.off = function ( e, f ) {
			if ( typeof _this.l === 'undefined' ) return;
			var tls = _this.l, lA = tls[ e ];
			if ( typeof lA !== 'undefined' ) {
				var index = lA.indexOf( f );
				if ( index !== - 1 ) lA.splice( index, 1 );
			}
    	};

    	this.fire = function ( e ) {
			if ( typeof _this.l === 'undefined' ) return;
			var tls = _this.l, lA = tls[ e ];
			if ( typeof lA !== 'undefined' ) {
				var array = [], length = lA.length;
				for ( var i = 0 ; i < length ; i ++ ) array[ i ] = lA[ i ];
				for ( var i = 0 ; i < length ; i ++ ) array[ i ].call( _this, e );
			}
    	};
    }
}