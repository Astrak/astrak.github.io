'use strict';

//basics
var renderer, scene, camera, controls, raycaster;

//objects
var carsMeshes = [],
	parkedCarsMesh,
	treesMesh = {}, 
	meshes = [];

//loadscreen
var loadLayer;

//UI
var slC;

//rendering
var height;
var lastPosition = new THREE.Vector3(),
	actualPosition = new THREE.Vector3(),
	distance = new THREE.Vector3();

//webgl
var webgl = ( function () {
	try {
		var c = document.createElement( 'canvas' );
		return !! ( window.WebGLRenderingContext && ( c.getContext( 'webgl' ) || c.getContext( 'experimental-webgl' ) ) );
	} catch ( e ) {
		return false;
	}
} ) ();


if ( webgl ) loadScreen();

function loadScreen () {
	var progress;

	addLoadScreen();
	loadResources();

	function addLoadScreen () {
		//1. insert renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( innerWidth, innerHeight );
		renderer.setPixelRatio( window.devicePixelRatio );
		document.body.appendChild( renderer.domElement );

		//2. add grey layer
			//create grey layer and insert it
			loadLayer = document.createElement( 'div' );
			loadLayer.style.cssText = ''+
				'background:hsl(345,12%,94%);'+
				'height:100%;width:100%;'+
				'top:0;'+
				'z-index:2;'+
				'position:absolute;';
			document.body.appendChild( loadLayer );

			//create progress indicator
			progress = document.createElement( 'span' );
			progress.style.cssText = ''+
				'background:hsl(345,12%,40%);'+
				'width:0px;height:4px;'+
				'top:1px;left:1px;'+
				'position:absolute;';

			//create progressBar, append indicator and insert in layer
			var progressBar = document.createElement( 'div' );
			progressBar.style.cssText = ''+
				'background:hsl(345,12%,70%);'+
				'width:100px;height:6px;'+
				'top:50%;left:50%;'+
				'margin-left:-50px;'+
				'position:relative;';

			//infos
			var infos = document.createElement( 'p' );
			infos.style.cssText = ''+
				'top:50%;'+
				'margin-top:-20px;'+
				'text-align:center;'+
				'position:relative;'+
				'font-family:Arial;'+
				'font-size:18px;';
			infos.innerHTML = 'Chargement de la présentation interactive';

			loadLayer.appendChild( infos );
			progressBar.appendChild( progress );
			loadLayer.appendChild( progressBar );
	}

	function loadResources () {
		var nFiles = resources.geometries.length + resources.textures.length, 
			counter = 0,
			tCounter = 0;
		var gLoader = new THREE.JSONLoader();
		var tLoader = new THREE.TextureLoader();

		for ( var i = 0 ; i < resources.geometries.length ; i++ ) loadGeometry( i );
		for ( var i = 0 ; i < resources.textures.length ; i++ ) loadLowTexture( i );

		function loadGeometry ( v ) {
			var name = resources.geometries[ v ];
			gLoader.load( 'JSON/' + name + '.json', function ( g ) {
				g.name = name;
				resources.geometries[ v ] = g;
				updateProgress();
			});
		}

		function loadLowTexture ( v ) {
			var name = resources.textures[ v ];
			tLoader.load( 'textures/min/' + name + '.png', function ( t ) {
				t.name = name;
				resources.textures[ v ] = t;
				updateProgress();
			});
		}

		function updateProgress () {
			counter ++;
			progress.style.width = ( counter / nFiles * 98 ).toString() + 'px';
			if ( counter === nFiles ) {
				makeObjects();
				setScene();
				document.body.removeChild( loadLayer );
			}
		}

		function makeObjects () {
			for ( var i = 0 ; i < resources.meshes.length ; i++ ) add( i );

			function add ( v ) {
				var m = resources.meshes[ v ], 
					g = resources.geometries[ m.geometry ];

				var geometry = m.hasOwnProperty( 'flatShaded' ) && m.flatShaded ? new THREE.FlatShadedGeometry( g ) : g;

				m.material.map = resources.textures[ m.map ];

				var mesh = new THREE.Mesh( geometry, m.material );
				mesh.name = m.name;
				mesh.userData.map = m.map;
				if ( m.hasOwnProperty( 'steps' ) ) mesh.userData.steps = m.steps;
				resources.meshes[ v ] = mesh;
			}

			for ( var i = 0 ; i < resources.textures.length ; i++ ) loadHighTexture( i );
		}

		function loadHighTexture ( v ) {
			var name = resources.textures[ v ].name;
			tLoader.load( 'textures/' + name + '.png', function ( t ) {
				t.name = name + 'high';
				resources.textures[ v ].dispose();
				resources.textures[ v ] = t;
				resources.textures[ v ].needsUpdate = true;
				camera.update = true;
				updateTextures();
			});
		}

		function updateTextures () {
			tCounter++;
			if ( tCounter === resources.textures.length ) {
				for ( var i = 0 ; i < resources.meshes.length ; i++ ) {
					if ( resources.meshes[ i ].userData.hasOwnProperty( 'map' ) ) {
		            	if ( [ 10, 11, 8, 9, 13, 5, 4 ].indexOf( i ) > -1 ) resources.textures[ i ].minFilter = THREE.LinearFilter;
						resources.meshes[ i ].material.map = resources.textures[ resources.meshes[ i ].userData.map ];
						resources.meshes[ i ].material.color.set( 0xffffff );//for sky
						resources.meshes[ i ].material.needsUpdate = true;
					}
				}
				resources.textures[ 8 ].minFilter = THREE.NearestFilter;
				treesMesh.high.material.map = resources.textures[ 8 ];
				updateShadows();
			}
		}
	}
}

function setScene () {
	scene = new THREE.Scene();

	setView();
	setLighting();
	setSky();

	createTrees();
	createCars();

	prepareScene();

	setUI();

	animate();
}

function setUI () {
	setSteps();



	resize();
}

function setSteps () {
	var currentStep = 0;

	var valign = document.createElement( 'span' ),
		sl = document.createElement( 'div' ),
		bB = document.createElement( 'button' ),
		bA = document.createElement( 'button' );

	slC = document.createElement( 'div' );
	slC.id = 'UI-slider-container';
	sl.id = 'UI-slider';
	valign.className = 'UI-slider-valign';
	bB.className = bA.className = 'UI-slider-buttons';
	bB.id = 'UI-button-before';
	bA.id = 'UI-button-after';

	sl.appendChild( valign ); 
	slC.appendChild( sl );
	document.body.appendChild( slC );
	document.body.appendChild( bA );
	document.body.appendChild( bB );


	bB.addEventListener( 'click', oneStepBefore, false );
	bA.addEventListener( 'click', oneStepBeyond, false );

	bB.style.display = 'none';

	for ( var i = 0 ; i < steps.length ; i++ ) {
        var from = document.createElement( 'p' ); 
        from.innerHTML = steps[ i ].from;
        var to = document.createElement( 'p' );
        to.innerHTML = steps[ i ].to;
        from.className = to.className = 'slider-stepDate';
        var title = document.createElement( 'p' );
        title.innerHTML = steps[ i ].title;
        title.className = 'slider-stepTitle';
        var description = document.createElement( 'p' );
        description.innerHTML = steps[ i ].description;
        description.className = 'slider-stepDescription';
        var step = document.createElement( 'div' );
        step.className = 'slider-step';
        var infos = document.createElement( 'div' );
        infos.className = 'slider-stepMain';
        infos.appendChild( title );
        infos.appendChild( description );
        step.appendChild( from );
        step.appendChild( infos );
        step.appendChild( to );
        sl.appendChild( step );
    }

    /*window.addEventListener( 'resize', function () {
    	if ( )
    }, false );*/

    function oneStepBeyond ( e ) {
        e.stopPropagation();

        if ( currentStep < ( steps.length - 1 ) ) {
            currentStep++;
            sl.style.marginLeft = - 100 * currentStep + '%';
            bA.style.display = currentStep === ( steps.length - 1 ) ? 'none' : 'block';
            bB.style.display = currentStep === 0 ? 'none' : 'block';
            for ( var i = 0 ; i < resources.meshes.length ; i++ ) {
                var m = resources.meshes[ i ];
                if ( m.userData.hasOwnProperty( 'steps' ) && m.userData.steps[ currentStep ] === true && m.userData.steps[ currentStep - 1 ] === false ) addMesh( m );
                if ( m.userData.hasOwnProperty( 'steps' ) && m.userData.steps[ currentStep ] === false && m.userData.steps[ currentStep - 1 ] === true ) removeMesh( m );
            }
        }
    }

    function oneStepBefore ( e ) {
        e.stopPropagation();

        if ( currentStep > 0){
            currentStep--;
            sl.style.marginLeft = - 100 * currentStep + '%';
            bB.style.display = currentStep === 0 ? 'none' : 'block';
            bA.style.display = currentStep === ( steps.length - 1 ) ? 'none' : 'block';
            for ( var i = 0 ; i < resources.meshes.length ; i++ ) {
                var m = resources.meshes[ i ];
                if ( m.userData.hasOwnProperty( 'steps' ) && m.userData.steps[ currentStep ] === true && m.userData.steps[ currentStep + 1 ] === false ) addMesh( m );
                if ( m.userData.hasOwnProperty( 'steps' ) && m.userData.steps[ currentStep ] === false && m.userData.steps[ currentStep + 1 ] === true ) removeMesh( m );
            }
        }
    }

    function addMesh ( mesh ) {
        if ( mesh.material.depthTest == false ) return;//dont add commercesdepth now
        scene.add( mesh );
        if ( mesh.name !== 'chantier' ) {
            mesh.material.transparent = true;
            mesh.material.opacity = 0;
            TweenLite.to( mesh.material, .7, {
            	opacity : 1,
                onUpdate : function () { camera.update = true; },
            	onComplete : function () { 
            		mesh.material.transparent = false;
            		updateShadows();
            	}
            });
        }
    }

    function removeMesh ( mesh ) {
    	if ( mesh.name !== 'chantier' ){
            mesh.material.transparent = true;
            TweenLite.to( mesh.material, .7, {
            	opacity : 0,
                onUpdate : function () { camera.update = true; },
            	onComplete : function () {
                    scene.remove( mesh );
                    if ( mesh.name === 'commerces' ) {
                    	var m = resources.meshes;
                    	for ( var  i = 0 ; i < m.length ; i++ ) {
                    		if ( m[ i ].name === 'RPA' || m[ i ].name === 'residences' || m[ i ].name === 'nouveau_sol' ) scene.remove( m[ i ] );
                    	}
                    }
    				updateShadows();
                }
            });
    	} else {
    		setTimeout( function () {
    			scene.remove( mesh );
    			updateShadows();
    		}, 700 );
    	}
    }
}

function createTrees () {
	//textured model : create foliage geometry
    var plane = new THREE.PlaneGeometry(1.7,2.5,1,1);
    var noMaterial = new THREE.MeshBasicMaterial();
    
    var plane1 = new THREE.Mesh( plane, noMaterial );
    var plane2 = new THREE.Mesh( plane, noMaterial );
    plane2.rotation.y = Math.PI / 2;
    plane2.updateMatrixWorld();
    
    var g = new THREE.Geometry();
    g.merge( plane1.geometry, plane1.matrixWorld );
    g.merge( plane2.geometry, plane2.matrixWorld );

    //low poly model for shadows
    var sphere = new THREE.Mesh( new THREE.SphereGeometry( .6, 10, 10 ), noMaterial );
    var cyl = new THREE.Mesh( new THREE.CylinderGeometry( .1, .1, 1, 4 ), noMaterial );
    //sphere.position.y=1.2;
    sphere.updateMatrixWorld();
    cyl.position.y = -1;
    cyl.updateMatrixWorld();
    var fg = new THREE.Geometry();
    fg.merge( sphere.geometry, sphere.matrixWorld );
    fg.merge( cyl.geometry, cyl.matrixWorld );
    
    //mat
    var m = new THREE.MeshBasicMaterial({
            map : resources.textures[ 8 ],
            transparent : true,
            side : THREE.DoubleSide,
            depthWrite : true,
            alphaTest : .7
        });
    
    var tree = new THREE.Mesh( g, m );
    var ftree = new THREE.Mesh( fg, new THREE.MeshLambertMaterial({ color : 0x516702 }) );
    
    //clone to each coordinates and scale
    var geometry = new THREE.Geometry();
    var fgeometry = new THREE.Geometry();
    var l = trees.length;

    for ( var i = 0 ; i < l ; i++ ) {
        var treeY = trees[ i ].y + ( trees[ i ].scaleY - 1 ) * 2.5 / 2;

        tree.position.set( trees[ i ].x, treeY + .5, trees[ i ].z );
        ftree.position.set( trees[ i ].x, treeY + .5, trees[ i ].z );

        tree.scale.set( trees[ i ].scaleX, trees[ i ].scaleY, trees[ i ].scaleZ );
        ftree.scale.set( trees[ i ].scaleX, trees[ i ].scaleY, trees[ i ].scaleZ );

        tree.rotation.y += Math.random() * Math.PI * 2;
        ftree.rotation.y += Math.random() * Math.PI * 2;
        
        tree.updateMatrixWorld();
        ftree.updateMatrixWorld();

        geometry.merge( tree.geometry.clone(), tree.matrixWorld );
        fgeometry.merge( ftree.geometry.clone(), ftree.matrixWorld );
    }

    var mesh = new THREE.Mesh( geometry, m );
    var fmesh = new THREE.Mesh( fgeometry, ftree.material );

    fmesh.castShadow = fmesh.receiveShadow = true;
    fmesh.matrixAutoUpdate = mesh.matrixAutoUpdate = false;

    treesMesh.low = fmesh;
    treesMesh.high = mesh;
}

function createCars () {
	for ( var i = 0 ; i < cars.meshes.length ; i++ )
		resources.meshes[ i ].userData.proba = cars.meshes[ i ].proba;

	//parkedcars
	var p = cars.parkedCars,
		pL = p.length,
		g = new THREE.Geometry(),
		cs = cars.meshes;
    for ( var i = 0 ; i < pL ; i++ ) {
		var c = pickRandomCar();
		c.position.set( p[ i ].x, 0, p[ i ].z );
		c.rotation.y = p[ i ].rot / 180 * Math.PI;
		c.updateMatrixWorld();
		g.merge( c.geometry.clone(), c.matrixWorld );
	}
	var mt = linearFilteredSmoothLambertMaterial;
	var m = new THREE.Mesh( g, mt );
	m.receiveShadow = m.castShadow = true;
	m.matrixAutoUpdate = false;
	parkedCarsMesh = m;

	//streetCars
	for ( var i = 0 ; i < cars.streetCars.length ; i++ ) createCar( i );

    function createCar ( i ) {
    	var car = cars.streetCars[ i ];

    	//path
		var points = car.curve.points,
			pl = points.length;

		for ( var j = 0 ; j < pl ; j++ ) points[ j ] = new THREE.Vector3( points[ j ].x, 0, points[ j ].z );

		car.curve.spline = new THREE.CatmullRomCurve3( points );

		//tweens
		var t = car.tweens,
			tL = t.length;

		var position = { l : car.begin };
	    var mesh = pickRandomCar().clone();
	    carsMeshes.push( mesh );

	    var tl = new TimelineMax( { repeat : -1 } );

        var createAnimatedPath = function ( k ) {
        	var complete = function () {
				if ( t[ k ].ending ) position.l = 0;
			};
			tl.add(
				new TweenLite(
					position,
					t[ k ].duration / 1000,//initially the time values were given in milliseconds
					{
						l : t[ k ].to,
						ease : t[ k ].easing,
						onUpdate : function () {
							var pos = car.curve.spline.getPoint( position.l );
							mesh.position.set( pos.x,pos.y,pos.z );
							mesh.lookAt( car.curve.spline.getPoint( position.l + .001 ) );	
						},
						onComplete : complete,
						delay : t[ k ].delay / 1000
					}
				)
			);
        };

		for ( var k = 0 ; k < tL ; k++ ) createAnimatedPath( k );

		var beginPos = car.curve.spline.getPoint( car.begin )
		mesh.position.set( beginPos.x, beginPos.y, beginPos.z );
		mesh.lookAt( car.curve.spline.getPoint( car.begin + .001 ) );
		scene.add( mesh );
    }

    //for ( var i = 0 ; i < carsMeshes.length ; i++ ) scene.remove( carsMeshes[ i ] );

	function pickRandomCar () {
        var d = 0, carsLength = 8;
		for ( var i = 0 ; i < carsLength ; i++ ) d += resources.meshes[ i ].userData.proba;
		var r = Math.floor( Math.random() * d ), c = 0, n;
		for ( var i = 0 ; i < carsLength ; i++ ) {
			c += resources.meshes[ i ].userData.proba;
			if ( r < c ) { 
				n = i; 
				break;
			}
		}
		return resources.meshes[ n ];
	}
}

function prepareScene () {
	for ( var i = 8 ; i < resources.meshes.length ; i++ ) {
		if ( ! resources.meshes[ i ].userData.hasOwnProperty( 'steps' ) || resources.meshes[ i ].userData.steps[ 0 ] === true ) {
			scene.add( resources.meshes[ i ] );
		}
		resources.meshes[ i ].castShadow = resources.meshes[ i ].receiveShadow = true;
	}

	scene.add( treesMesh.low, parkedCarsMesh );

	renderer.render( scene, camera );

	scene.remove( treesMesh.low );

    scene.add( treesMesh.high );
}

function setView () {
    camera = new THREE.PerspectiveCamera( 37, innerWidth / innerHeight, 1, 150 );
    camera.position.set( 10, 12, 20 );//r = 25.4
    camera.lastPosition = new THREE.Vector3().copy( camera.position );
    camera.update = true;

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', function () { camera.update = true; } );
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.maxPolarAngle = controls.minPolarAngle = 1.077;
	controls.enableDamping = true;
	controls.rotateSpeed = .12;
	controls.dampingFactor = .11;

    window.addEventListener( 'resize', resize, false );
}

function resize () {
	if ( innerWidth <= 1035 ) {
		height = innerHeight - parseInt( getComputedStyle( slC, null ).height );
		console.log(innerHeight, height)
	} else {
		height = innerHeight;
	}
	renderer.setSize( innerWidth, height );
	camera.aspect = innerWidth / height;
	camera.updateProjectionMatrix();
	camera.update = true;
}

function setLighting () {
    var ambient = new THREE.AmbientLight( 0x888888 );
    var light = new THREE.DirectionalLight( 0xffffff, 1.3 );
    light.position.set( 0, 35, 20 );
	light.castShadow = true;
	light.shadow.bias = - 0.002;
	light.shadow.camera.far = 60;
	light.shadow.camera.top = 25;
	light.shadow.camera.near = light.shadow.camera.right = 25;
	light.shadow.camera.bottom = light.shadow.camera.left = -25;
	light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;

    scene.add( light, ambient );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
}

function updateShadows () {
	scene.remove( treesMesh.high );
	scene.add( treesMesh.low );
	renderer.shadowMap.needsUpdate = true;
	renderer.render( scene, camera );
	scene.add( treesMesh.high );
	scene.remove( treesMesh.low );
	camera.update = true;
}

function setSky () {
    var sky = new THREE.Mesh(
        new THREE.CylinderGeometry( 32, 32, 25, 60, 1, true ),
        new THREE.MeshBasicMaterial( { color : 0x72AAFF } )
        );
    sky.position.y = 9;
    sky.scale.x = -1;
    sky.name = 'sky';
    sky.updateMatrixWorld();
    sky.matrixAutoUpdate = false;
    sky.userData.map = 9;
    resources.meshes.push( sky );
}

function animate () {
	requestAnimationFrame( animate );

	//lastPosition.copy( camera.position );
	controls.update();
	//actualPosition.copy( camera.position );
	//distance.subVectors( actualPosition, lastPosition );

	//if ( distance.length() > .001 || camera.update ) {
		renderer.render( scene, camera );
	//	camera.update = false;
	//}
}
