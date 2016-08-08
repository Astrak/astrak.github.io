'use strict';

//next lines are to be removed if the script integrates the website
//they are meant to correct a display issue in 'submenu Entreprise' 
//created by the testing page not being served via php


var el = document.querySelector( '.submenu ul li ul');
setTimeout( function () {
	el.style.cssText = 'display:block;background:#f2eee1;';
}, 0 );

//resources
var resources = {
		paths:{
			geometries:'json/',
			images:'textures/'
		},
		geometries : [
			'bat1_floor0',
			'bat1_floor1',
			//'bat1_floor0_windows',
			//'bat1_floor1_windows',
			'bat1_floor0_intersect',
			'bat1_floor1_intersect',
			'bat1_floor2',
			'bat2_floor0',
			//'bat2_floor0_windows',
			'bat2_floor1',
			'bat2_floor0_intersect',
			'bat2_floor1_intersect',
			'bat2_floor2',
			'ground', 
			'causse'
		],
		images : {
			'bat1_floor0' : null,
			'bat1_floor1' : null,
			'bat1_floor2' : null,
			'bat2_floor0' : null,
			'bat2_floor2' : null,
			'bat2_floor1' : null,
			'ground' : null, 
			'causse' : null
		},
		sprites : {
			equipements : [
				{
					x : 1,
					y : 1.5,
					z : 0,
					title : 'Bureau partagé (espace de coworking)'
				},
				{
					x : 1,
					y : 1,
					z : 1,
					title : 'Accès sécurisé 24H/24, 7J/7'
				},
				{
					x : -2.5,
					y : 1,
					z : 1,
					title : 'Accès sécurisé 24H/24, 7J/7'
				},
				{
					x : 2,
					y : 1,
					z : 2,
					title : 'Salles de réunion et de vidéoconférence équipées WIFI'
				},
				{
					x : 7,
					y : 1,
					z : -2,
					title : 'Espace détente / cafétéria'
				}
			],
			quotidien : [
				{
					x : 2.5,
					y : 1,
					z : 1,
					title : 'Accueil physique et téléphonique personnalisé'
				},
				{
					x : 3,
					y : 1,
					z : 1.5,
					title : 'Prestations bureautiques, télécopie'
				},
				{
					x : 1.5,
					y : 1,
					z : 1.2,
					title : 'Presse'
				},
				{
					x : 1,
					y : 1,
					z : 1,
					title : 'Distribution et collecte du courrier'
				},
				{
					x : -2.5,
					y : 1,
					z : 1,
					title : 'Distribution et collecte du courrier'
				},
			]
		}
	};

//basics
var scene,renderer,camera,controls,raycaster;

//objects
var arobase, cubeCamera;
var bat1_rdc, bat1_rdc_intersect, bat1_1er, bat1_1er_intersect, bat1_Plafond;
var bat2_rdc, bat2_rdc_intersect, bat2_1er, bat2_1er_intersect, bat2_Plafond;

//sky
var sky, sunSphere;

//rendering
var lastPosition = new THREE.Vector3(),
	actualPosition = new THREE.Vector3(),
	distance = new THREE.Vector3(),
	rQAID;

//DOM
var diapo = document.querySelector('.diaporama'),
	loadLayer, 
	menu;

//webgl
var webgl = ( function () {
	try {
		var c = document.createElement( 'canvas' );
		return !! ( window.WebGLRenderingContext && ( c.getContext( 'webgl' ) || c.getContext( 'experimental-webgl' ) ) );
	} catch ( e ) {
		return false;
	}
} ) ();


if ( ! webgl ) diapo.innerHTML = "<img src='./index_files/arobase01.jpg'/>";
else loadScreen();

function loadScreen () {

	var progress;

	addLoadScreen();
	loadResources();

	function addLoadScreen () {
		//1. insert renderer
		renderer=new THREE.WebGLRenderer({antialias:true});
		renderer.setSize(552,318);
		diapo.appendChild(renderer.domElement);

		//2. add grey layer
			//create grey layer and insert in diapo
			loadLayer = document.createElement( 'div' );
			loadLayer.style.cssText = ''+
				'background:hsl(345,12%,94%);'+
				'height:368px;width:552px;'+
				'margin-top:-318px;'+
				'z-index:2;'+
				'position:relative;';
			diapo.appendChild( loadLayer );

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
				'margin-top:-3px;'+
				'margin-left:-50px;'+
				'position:relative;';

			//infos
			var infos = document.createElement( 'p' );
			infos.style.cssText = ''+
				'top:40%;'+
				'text-align:center;'+
				'position:relative;'+
				"font-family:'Yanone Kaffeesatz';"+
				'font-size:18px;';
			infos.innerHTML = "Chargement de la présentation interactive ( 7Mo )";

			loadLayer.appendChild( infos );
			progressBar.appendChild( progress );
			loadLayer.appendChild( progressBar );
	}

	function loadResources () {

		var nFiles = Object.keys( resources.geometries ).length + Object.keys( resources.images ).length,
			counter = 0;
		var gLoader = new THREE.JSONLoader();
		var tLoader = new THREE.TextureLoader();

		for ( var i = 0 ; i < resources.geometries.length ; i++ ) loadGeometry( i );
		for ( var p in resources.images ) loadTexture( p );

		function loadGeometry ( v ) {
			var name = resources.geometries[ v ];
			gLoader.load( resources.paths.geometries + name + '.json', function ( g ) {
				g.name = name;
				resources.geometries[ v ] = g;
				updateProgress();
			});
		}

		function loadTexture ( attr ) {
			var name = attr,
				path = resources.paths.images + name + '.png';
			tLoader.load( path, function ( t ) {
				t.name = name;
				resources.images[ attr ] = t;
				updateProgress();
			});
		}

		function updateProgress () {
			counter ++;
			progress.style.width = ( counter / nFiles * 98 ).toString() + 'px';
			if ( counter === nFiles ) {
				makeObjects();
				setScene();
				diapo.removeChild( loadLayer );
			}
		}

		function makeObjects () {
			resources.meshes = [];

			for ( var i = 0 ; i < resources.geometries.length ; i++ ) add( i );

			function add ( v ) {
				var g = resources.geometries[ v ], 
					defaultMat = new THREE.MeshBasicMaterial({color:0xaaaaaa});
				var material = g.name.indexOf( 'intersect' ) === -1 ? resources.images.hasOwnProperty( g.name ) ? new THREE.MeshBasicMaterial({
						map : resources.images[ g.name ]
					}) : defaultMat : defaultMat;
				var m = new THREE.Mesh( g, material );
				m.name = g.name;
				resources.meshes.push( m );
			}
		}
	}
}

function setScene () {
	//basics
	scene=new THREE.Scene();

	setView();

	addMeshes();

	addSprites();

	//initSky();

	//setRaycaster();

	//lighting
	//setLighting();

	//interaction
	addInteraction();

	animate();
}

function addMeshes () {
	cubeCamera = new THREE.CubeCamera( .1, 500, 128 );
	arobase = new THREE.Object3D();
	arobase.name = 'arobase';
	var glassMaterial = new THREE.MeshPhongMaterial({ 
		envMap : cubeCamera.renderTarget,
		combine : THREE.MixOperation,
		reflectivity : 1,
		color : 0x555555, 
		shading : THREE.FlatShading,
		transparent : true,
		alphaTest : .9,
		opacity : 0.7
	});
	for ( var i = 0 ; i < resources.meshes.length ; i++ ) {
		var m = resources.meshes[ i ];
		switch ( m.name ) {
			case 'bat1_floor0' : bat1_rdc = m ; break ;
			case 'bat1_floor1' : bat1_1er = m ; break ;
			case 'bat1_floor0_intersect' : bat1_rdc_intersect = m ; break ;
			case 'bat1_floor1_intersect' : bat1_1er_intersect = m ; break ;
			case 'bat1_floor2' : bat1_Plafond = m ; break ;
			case 'bat2_floor0' : bat2_rdc = m ; break ;
			case 'bat2_floor1' : bat2_1er = m ; break ;
			case 'bat2_floor0_intersect' : bat2_rdc_intersect = m ; break ;
			case 'bat2_floor1_intersect' : bat2_1er_intersect = m ; break ;
			case 'bat2_floor2' : bat2_Plafond = m ; break ;
			default:;break;
		}
		if ( m.name.indexOf( 'windows' ) > -1 ) m.material = glassMaterial;
		if ( m.name.indexOf( 'intersect' ) < 0 ) arobase.add( m );
	}

	bat1_rdc.add( bat1_rdc_intersect );
	bat1_rdc_intersect.material = bat1_rdc.material;
	bat1_rdc_intersect.material.needsUpdate = true;

	bat1_1er.add( bat1_1er_intersect );
	bat1_1er_intersect.material = bat1_1er.material;
	bat1_1er_intersect.material.needsUpdate = true;

	bat2_rdc.add( bat2_rdc_intersect );
	bat2_rdc_intersect.material = bat2_rdc.material;
	bat2_rdc_intersect.material.needsUpdate = true;

	bat2_1er.add( bat2_1er_intersect );
	bat2_1er_intersect.material = bat2_1er.material;
	bat2_1er_intersect.material.needsUpdate = true;

	scene.add( arobase, cubeCamera );

	//render once objects are added
	camera.update = true;
}

function addSprites () {
	arobase.userData.sprites = {
		equipements : [],
		quotidien : []
	};
	bat1_rdc.userData.sprites = [];
	bat1_1er.userData.sprites = [];
	bat2_rdc.userData.sprites = [];
	bat2_1er.userData.sprites = [];

	var rE = resources.sprites.equipements;
	for ( var i = 0 ; i < rE.length ; i++ ) {
		var sprite = makeTextSprite( rE[ i ].title, i, true);
		sprite.position.set( rE[ i ].x, rE[ i ].y, rE[ i ].z );
		arobase.userData.sprites.equipements.push( sprite );
	}
	var rQ = resources.sprites.quotidien;
	for ( var i = 0 ; i < rQ.length ; i++ ) {
		var sprite = makeTextSprite( rQ[ i ].title, i, true);
		sprite.position.set( rQ[ i ].x, rQ[ i ].y, rQ[ i ].z );
		arobase.userData.sprites.quotidien.push( sprite );
	}
	var a1RDC = arobase1.levels[ 0 ].locations;
	for ( var i = 0 ; i < a1RDC.length ; i++ ) {
		var sprite = makeTextSprite( a1RDC[ i ].title, i );
		sprite.position.set( a1RDC[ i ].x * 9, 0, a1RDC[ i ].y * 6 ).add(new THREE.Vector3(-.35,1,-3));
		bat1_rdc.userData.sprites.push( sprite );
	}
	var a11 = arobase1.levels[ 1 ].locations;
	for ( var i = 0 ; i < a11.length ; i++ ) {
		var sprite = makeTextSprite( a11[ i ].title, i );
		sprite.position.set( a11[ i ].x * 9, 0, a11[ i ].y * 6 ).add(new THREE.Vector3(-.35,1.5,-3));
		bat1_1er.userData.sprites.push( sprite );
	}
	var a2RDC = arobase2.levels[ 0 ].locations;
	for ( var i = 0 ; i < a2RDC.length ; i++ ) {
		var sprite = makeTextSprite( a2RDC[ i ].title, i );
		sprite.position.set( a2RDC[ i ].x * 12, 0, a2RDC[ i ].y * 9 ).add(new THREE.Vector3(-12.5,1,-3));
		bat2_rdc.userData.sprites.push( sprite );
	}
	var a21 = arobase2.levels[ 1 ].locations;
	for ( var i = 0 ; i < a21.length ; i++ ) {
		var sprite = makeTextSprite( a21[ i ].title, i );
		sprite.position.set( a21[ i ].x * 12, 0, a21[ i ].y * 9 ).add(new THREE.Vector3(-12.5,1.5,-3));
		bat2_1er.userData.sprites.push( sprite );
	}
}

function makeTextSprite(message,i, big){
    var canvas=document.createElement('canvas');
    var context=canvas.getContext('2d');
    canvas.width=256;canvas.height=128;
    var size = big===undefined?'20px':'30px';
    if ( message.length > 18 && message.indexOf(' ') > -1 ) {
		var m = [], a = [], g = 0, v = 0;
		for ( var j = 0 ; j < message.length ; j++ ) {
			v = message.indexOf( ' ', j );
			a.push( v );
		}
		for ( var j= 0 ; j < a.length ; j++ ) {
			g = Math.max( Math.min( 18, a[ j ] ), g );
		}
		m[ 0 ] = message.substring(0, g);
		m[ 1 ] = message.substring(g, message.length);

        context.fillStyle="rgba(0,0,0,0)";
        context.fillRect(0,43*(i%2),256,52);
        context.fillStyle="rgba(255,255,255,1)";
        context.lineWidth=2;
        context.textAlign='center';
        context.font="Bold "+size+" Lucida Grande";
        for ( var j = 0 ; j < m.length ; j++ ) context.fillText(m[j],128,22*(1+2*(i%2)+j));
        context.strokeStyle="rgba(255,255,255,1)";
        context.lineWidth=3;
		context.moveTo(128,33*(1.5+1.3*(i%2)));
		context.lineTo(128,128);
		context.stroke();
    } else {
        context.fillStyle="rgba(0,0,0,0)";
        context.fillRect(0,43*(i%3),256,33);
        context.fillStyle="rgba(255,255,255,1)";
        context.lineWidth=2;
        context.textAlign='center';
        context.font="Bold "+size+" Lucida Grande";
        context.fillText(message,128,22*(1+2*(i%3)));
        context.strokeStyle="rgba(255,255,255,1)";
        context.lineWidth=3;
		context.moveTo(128,33*(1+1.3*(i%3)));
		context.lineTo(128,128);
		context.stroke();
    }
    
    
    var texture=new THREE.Texture(canvas);
    texture.minFilter=THREE.LinearFilter;
		texture.needsUpdate=true;
    
    var sprite=new THREE.Sprite(new THREE.SpriteMaterial({ 
    		color:0xffffff,
            map:texture,
            depthTest:false,
            transparent:true,
            opacity:0
            })
        );
    sprite.scale.set(2,1,1)
    return sprite;
}

function addInteraction () {

	menu = {
		'nos services' : {
			container : null,
			b1 : 'équipements',
			b2 : 'au quotidien',
			button : null
		},
		'situation' : {
			container : null,
			b1 : 'le Causse',
			b2 : 'la région',
			button : null
		},
		'les bureaux' : {
			container : null,
			b1 : 'bâtiment 1',
			b2 : 'bâtiment 2',
			toggle : null,
			button : null
		}
	};

	addMenu();

	interact();

	function addMenu () {

		//the following function handles css without html and stylesheet nor jquery
		//so it is sometimes silly and can look completely mad
		//but it will allow scene manipulation using the main 'menu' object
		//and each DOMElement inside it has few more javascript properties for that purpose

		var interactionContainer = document.createElement( 'div' );
		interactionContainer.style.cssText = ''+
			'background:hsl(345,12%,94%);'+
			'position:relative;'+
			'text-align:center;'+
			'border:solid 1px #ddd;'+
			'border-radius:0 0 4px 4px;'+
			'height:50px';
		diapo.appendChild( interactionContainer );

		var mainContainer = document.createElement( 'div' );	
		mainContainer.style.cssText = ''+
			'position:relative;'+
			'z-index:2;'+
			'margin-top:-1px;'+
			'border-top:solid 1px #ddd;'+
			'padding:1px 0px 4px 0px;'+
			'background:hsl(345,12%,94%);';
		interactionContainer.appendChild( mainContainer );

		for ( var p in menu ) {
			//create submenu container
			var subMenu = document.createElement( 'div' );
			subMenu.style.cssText = ''+
				'text-align:center;'+
				'margin-top:0px;'+
				'top:0;'+
				'width:100%;'+
				'transition:margin-top 200ms ease;'+
				'z-index:1;'+
				'position:absolute;';
			interactionContainer.appendChild( subMenu );
			menu[ p ].container = subMenu;

			//create submenu
			for ( var attr in menu[ p ] ) {
				if ( attr === 'b1' || attr === 'b2' ) {
					var button = document.createElement( 'button' );
					button.innerHTML = menu[ p ][ attr ];
					var margin = ( p === 'les bureaux' ) ? '0 20px 0 20px;' : '0px 60px 0px 60px;' ;
					button.style.cssText = ''+
						'position:relative;'+
						'background:hsl(345,12%,100%);'+
	   					'cursor:pointer;'+
						"font-family: 'Yanone Kaffeesatz', sans-serif;"+
			   			'font-size: 25px;'+
						'margin:' + margin +
						'border-radius:5px 5px 0px 0px;'+
	   					'color:#1693C1;'+
			   			'display: inline-block;'+
	   					'padding:5px 25px;'+
	   					'box-shadow:5px 5px 5px #333;'+
	   					'transition:background 500ms ease;'+
						'border:none;';
					menu[ p ][ attr ] = button;
					if ( attr === 'b1' ) {
						button.active = true;
						button.position = p;
						button.relative = 'b2';
						button.style.textDecoration = 'underline';
					} else {
						button.active = false;
						button.style.background = 'hsl(345,12%,85%)';
						button.position = p;
						button.relative = 'b1';
						button.onmouseover = onMouseOver;
						button.onmouseout = onMouseOut;
						button.onclick = updateSubButtonStyle;
					}
					subMenu.appendChild( button );
				} 
			}

			if ( p === 'les bureaux' ) {
				var toggle = document.createElement( 'button' );
				toggle.innerHTML = "voir RDC";
				toggle.style.cssText = '' +
					'position:relative;'+
					'width:121px;'+
					'background:hsl(345,12%,85%);'+
					'cursor:pointer;'+
					"font-family: 'Yanone Kaffeesatz', sans-serif;"+
		   			'font-size: 25px;'+
					'margin:0px 30px;'+
	   					'color:#1693C1;'+
					'display:inline-block;'+
					'padding:5px 25px;'+
					'border-radius:5px 5px 0px 0px;'+
	   				'box-shadow:5px 5px 5px #333;'+
						'border:none;';
				toggle.onmousedown = function () { toggle.style.background = 'hsl(345,12%,100%)'; } ;
				toggle.onmouseup = function () { toggle.style.background = 'hsl(345,12%,85%)'; } ;
				toggle.onmouseover = onMouseOver;
				toggle.onmouseout = onMouseOut;
				subMenu.appendChild( toggle );
				menu[ p ].toggle = toggle;
				menu[ p ].toggle.rdc = false;
				menu[ p ].toggle.onclick = function () { this.rdc = !this.rdc ; this.innerHTML = this.rdc ? 'voir 1er' : 'voir RDC';};
			}

			//create menu
			var button = document.createElement( 'button' );
			button.innerHTML = p;
			button.style.cssText = ''+
				'width: 32%; height: 40px;'+
				"font-family: 'Yanone Kaffeesatz', sans-serif;"+
	   			'font-size: 30px;'+
				'background:hsl(345,12%,94%);'+
	   			'color:#1693C1;'+
	   			'cursor:pointer;'+
	   			'margin: 5px 3px 0px 3px;'+
	   			'border-radius:3px;'+
			   	'text-decoration:none;'+
				'z-index:2;'+
				'position:relative;'+
	   			'transition:background 500ms ease;'+
	   			'border:none';
	   		button.active = p === 'nos services' ? true : false;
			button.addEventListener( 'click', updateButtonStyle, false );
   			menu[ p ].button = button;
			mainContainer.appendChild( button );
		}

		//simulate css button:active without touching css
		var active = menu['nos services'].button;
		active.style.color = 'hsl(345,12%,94%)';
		active.style.background = '#1693C1';
		menu['nos services'].container.style.marginTop = '-40px';

		function updateButtonStyle ( e ) {
			//restore previous element'style
			if ( active !== e.target ) {
				active.active = false;
				active.style.color = '#1693C1';
	   			active.style.background = 'hsl(345,12%,94%)';
	   			for ( var p in menu ) {
	   				if ( active === menu[ p ].button ) {
	   					menu[ p ].container.style.marginTop = '0px';
	   				}
	   			}
			}
   			//change actual element'style
			active = e.target;
			active.active = true;
			active.style.color = 'hsl(345,12%,94%)';
   			active.style.background = '#1693C1';
   			for ( var p in menu ) {
   				if ( active === menu[ p ].button ) {
   					menu[ p ].container.style.marginTop = '-40px';
   				}
   			}
		}

		function updateSubButtonStyle ( e ) {
			//change other button'style to inactive
			var t = menu[ e.target.position ][ e.target.relative ];
			t.style.textDecoration = 'none';
			t.active = false;
			t.style.background = 'hsl(345,12%,85%)';
			t.onmouseover = onMouseOver;
			t.onmouseout = onMouseOut;
			t.onclick = updateSubButtonStyle;

			//change this button'style to active
			e.target.onmouseover = e.target.onmouseout = e.target.onclick = undefined;
			e.target.style.textDecoration = 'underline';
			e.target.style.background = 'hsl(345,12%,100%)';
			e.target.active = true;
		}

		function onMouseOver ( e ) {
			e.target.style.textDecoration = 'underline';
		}

		function onMouseOut ( e ) {
			e.target.style.textDecoration = 'none';
		}
	}

	function interact () {

		var b = menu[ 'les bureaux' ],
			b1 = menu[ 'nos services' ],
			b2 = menu[ 'situation' ];

		var offset = 7 ,
			duration = .7;

		var occupationRefs = {
			arobase1Position : { x : -4.4, y : 0, z  : .3 },
			arobase1CameraPosition : { x : 1.5, y : 9, z : 5.5 },
			arobase2Position : { x : 7, y : 0, z : -1 },
			arobase2CameraPosition : { x : -1, y : 10, z : 6.5 },
			defaultCameraPosition : { x : 13, y : 5, z : 6 },
			causseCameraPosition : { x : -272, y : 164, z : 44 },
			regionCameraPosition : { x : -100, y : 200, z : 300 },
			equipCamera : { x : 14, y : 5.4, z : 2.3 },
			servicesCam : { x: .7, y : 6.2, z : 13.8 }
		};

		var tween = {
			cameraX : camera.position.x,
			cameraY : camera.position.y,
			cameraZ : camera.position.z,
			arobaseX : arobase.position.x,
			arobaseY : arobase.position.y,
			arobaseZ : arobase.position.z,
			bat1_1er : bat1_1er.position.y,
			bat1_Plafond : bat1_Plafond.position.y,
			bat2_1er : bat2_1er.position.y,
			bat2_Plafond : bat2_Plafond.position.y,
			sprites1RDC : 0,
			sprites11 : 0,
			sprites2RDC : 0,
			sprites21 : 0,
			spritesE : 0,
			spritesQ : 0,
			t : 0
		};

		//setTimeout to let b1.active or b2.active be set, and detect the click origin quick inside a single function
		b.button.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );
		b.b1.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );
		b.b2.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );
		b.toggle.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );

		b1.button.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );
		b1.b1.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );
		b1.b2.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );

		b2.button.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );
		b2.b1.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );
		b2.b2.addEventListener( 'click', function () { setTimeout( tweenfunction, 0 )}, false );

		function tweenfunction () {
			tween.cameraX = camera.position.x;
			tween.cameraY = camera.position.y;
			tween.cameraZ = camera.position.z;

			var cameraPosition, arobasePosition, 
				bat1_1er_offset, bat1_Plafond_offset,
				bat2_1er_offset, bat2_Plafond_offset,
				sprites1RDC, sprites11,
				sprites2RDC, sprites21, 
				spritesE, spritesQ,
				useSpline, spline;

			if ( b.button.active ) {//bureaux
				//useSpline = true;
				tween.t = 0;
				cameraPosition = b.b1.active ? occupationRefs.arobase1CameraPosition : occupationRefs.arobase2CameraPosition;
				arobasePosition = b.b1.active ? occupationRefs.arobase1Position : occupationRefs.arobase2Position;
				bat1_1er_offset = b.b1.active ? b.toggle.rdc ? offset : 0 : 0 ;
				bat1_Plafond_offset = b.b1.active ? offset : 0 ;
				bat2_1er_offset = b.b2.active ? b.toggle.rdc ? offset : 0 : 0 ;
				bat2_Plafond_offset = b.b2.active ? offset : 0 ;
				sprites1RDC = b.b1.active ? b.toggle.rdc ? 1 : 0 : 0;
				sprites11 = b.b1.active ? b.toggle.rdc ? 0 : 1 : 0;
				sprites2RDC = b.b2.active ? b.toggle.rdc ? 1 : 0 : 0;
				sprites21 = b.b2.active ? b.toggle.rdc ? 0 : 1 : 0;
				spritesE = spritesQ = 0;
			} else if ( b1.button.active ) {//nos services
				//useSpline = true;
				tween.t = 0;
				spritesE = b1.b1.active ? 1 : 0;
				spritesQ = b1.b2.active ? 1 : 0;
				cameraPosition = b1.b1.active ? occupationRefs.equipCamera : occupationRefs.servicesCam;
				arobasePosition = {x:0,y:0,z:0};
				bat1_1er_offset = bat1_Plafond_offset = bat2_1er_offset = bat2_Plafond_offset = 0;
				sprites1RDC = sprites11 = sprites2RDC = sprites21 = 0;
			} else {//situation
				//useSpline = true;
				tween.t = 0;
				cameraPosition = b2.b1.active ? occupationRefs.causseCameraPosition : occupationRefs.regionCameraPosition;
				arobasePosition = {x:0,y:0,z:0};
				bat1_1er_offset = bat1_Plafond_offset = bat2_1er_offset = bat2_Plafond_offset = 0 ;
				sprites1RDC = sprites11 = sprites2RDC = sprites21 = spritesE = spritesQ = 0;
			}

			if ( useSpline ) {
				var x = camera.position.x + Math.random() * ( cameraPosition.x - camera.position.x ),
					y = (camera.position.y + cameraPosition.y ) / 2,
					z = camera.position.z + Math.random() * ( cameraPosition.z - camera.position.z );

				spline = new THREE.CatmullRomCurve3( [
					camera.position.clone(),
					new THREE.Vector3( x, y, z ),
					new THREE.Vector3( cameraPosition.x, cameraPosition.y, cameraPosition.z )
				] );
			}

			TweenLite.to( tween, duration, {
				cameraX : cameraPosition.x,
				cameraY : cameraPosition.y,
				cameraZ : cameraPosition.z,
				t : 1,
				arobaseX : arobasePosition.x,
				arobaseY : arobasePosition.y,
				arobaseZ : arobasePosition.z,
				bat1_1er : bat1_1er_offset,
				bat1_Plafond : bat1_Plafond_offset,
				bat2_1er : bat2_1er_offset,
				bat2_Plafond : bat2_Plafond_offset,
				sprites1RDC : sprites1RDC,
				sprites11 : sprites11,
				sprites2RDC : sprites2RDC,
				sprites21 : sprites21,
				spritesE : spritesE,
				spritesQ : spritesQ,
				onUpdate : onUpdate,
				onComplete : onComplete
			} );

			function onUpdate () {
				if ( useSpline ) {
					var position = spline.getPointAt( tween.t );
					camera.position.copy( position );
				} else {
					camera.position.set( tween.cameraX, tween.cameraY, tween.cameraZ );
				}
				arobase.position.set( tween.arobaseX, tween.arobaseY, tween.arobaseZ );
				bat1_1er.position.z = - tween.bat1_1er;
				bat1_Plafond.position.z = - tween.bat1_Plafond;
				bat2_1er.position.z = - tween.bat2_1er;
				bat2_Plafond.position.z = - tween.bat2_Plafond;

				if ( tween.spritesE > 0 ) {
					var a = arobase.userData.sprites.equipements;
					for ( var i = 0 ; i < a.length ; i++ ) {
						a[ i ].material.opacity = tween.spritesE;
						if ( ! a[ i ].parent ) arobase.add( a[ i ] );
					}
				}
				if ( tween.spritesQ > 0 ) {
					var a = arobase.userData.sprites.quotidien;
					for ( var i = 0 ; i < a.length ; i++ ) {
						a[ i ].material.opacity = tween.spritesQ;
						if ( ! a[ i ].parent ) arobase.add( a[ i ] );
					}
				}
				if ( tween.sprites1RDC > 0 ) {
					var a = bat1_rdc.userData.sprites;
					for ( var i = 0 ; i < a.length ; i++ ) {
						a[ i ].material.opacity = tween.sprites1RDC;
						if ( ! a[ i ].parent ) arobase.add( a[ i ] );
					}
				}
				if ( tween.sprites11 > 0 ) {
					var a = bat1_1er.userData.sprites;
					for ( var i = 0 ; i < a.length ; i++ ) {
						a[ i ].material.opacity = tween.sprites11;
						if ( ! a[ i ].parent ) arobase.add( a[ i ] );
					}
				}
				if ( tween.sprites2RDC > 0 ) {
					var a = bat2_rdc.userData.sprites;
					for ( var i = 0 ; i < a.length ; i++ ) {
						a[ i ].material.opacity = tween.sprites2RDC;
						if ( ! a[ i ].parent ) arobase.add( a[ i ] );
					}
				}
				if ( tween.sprites21 > 0 ) {
					var a = bat2_1er.userData.sprites;
					for ( var i = 0 ; i < a.length ; i++ ) {
						a[ i ].material.opacity = tween.sprites21;
						if ( ! a[ i ].parent ) arobase.add( a[ i ] );
					}
				}
				camera.update = true;
			}

			function onComplete () {
				var a = arobase.children;
				for ( var i = 0 ; i < a.length ; i++ ) if ( a[ i ].type === 'Sprite' && a[ i ].material.opacity === 0 ) arobase.remove( a[ i ] );
			}
		}


	}
}

function setRaycaster () {
	raycaster = new THREE.Raycaster();
	renderer.domElement.addEventListener('click', raycast, false);
}

function raycast ( e ) {
	var mouse = {};
	mouse.x = 2 * e.offsetX / 552 - 1;
	mouse.y = 1 - 2 * e.offsetY / 318;
	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( arobase.children );

	for ( var i = 0 ; i < intersects.length ; i++ ) {
		if ( intersects[ i ].object.type === 'Sprite' ) {
			intersects[ i ].object.material.color = 0xff0000;
			break;
		}
	}
}

function animate () {
	rQAID = requestAnimationFrame(animate);

	lastPosition.copy( camera.position );
	controls.update();
	actualPosition.copy( camera.position );
	distance.subVectors(actualPosition,lastPosition);

	if ( distance.length() > .001 || camera.update ) {
		scene.remove( arobase );
		//cubeCamera.updateCubeMap( renderer, scene );
		scene.add( arobase );
		renderer.render( scene, camera );
		camera.update = false;
	}
}

function setView () {
	camera=new THREE.PerspectiveCamera(30,552/318,.1,600);
	camera.position.set( 13, 5, 6 );
	controls=new THREE.OrbitControls(camera,renderer.domElement);
	controls.enableDamping=true;
	controls.enableZoom=false;
	controls.enablePan=false;
	controls.dampingFactor=.05;
	controls.rotateSpeed=.07;
	controls.maxPolarAngle=Math.PI/2;
}

function initSky () {

	// Add Sky Mesh
	sky = new THREE.Sky();
	scene.add( sky.mesh );

	//set parameters
	var inclination = 0.72;
	var azimuth = 0.9;
	sky.uniforms.turbidity.value = 10;
	sky.uniforms.reileigh.value = 2;
	sky.uniforms.luminance.value = 1;
	sky.uniforms.mieCoefficient.value = 0.005;
	sky.uniforms.mieDirectionalG.value = 0.99;

	// Add Sun Helper
	var distance = 1000;
	var theta = Math.PI * ( inclination - 0.5 );
	var phi = 2 * Math.PI * ( azimuth - 0.5 );
	sunSphere = new THREE.Mesh(
		new THREE.SphereGeometry( 200, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0xffffff } )
	);
	sunSphere.position.x = distance * Math.cos( phi );
	sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
	sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
	sunSphere.visible = false;
	sky.uniforms.sunPosition.value.copy( sunSphere.position );
	//scene.add( sunSphere );
}

function setLighting () {
	var ambient = new THREE.AmbientLight( 0x999999 );
	var dir = new THREE.DirectionalLight( 0xffffff, 1, 20, Math.PI/5 );
	dir.position.set( -7, 5, 5 );
	var counterDir = new THREE.DirectionalLight( 0xffffff, 1, 20, Math.PI/5 );
	counterDir.position.set( 7, 5, -5 );
	scene.add( ambient, dir );
	scene.add( counterDir );

	//helper
	//scene.add( new THREE.DirectionalLightHelper( dir ) );

	//shadows
	dir.castShadow = true;
	dir.shadowCameraNear = 5;
	dir.shadowCameraFar = 20;
	dir.shadowCameraTop = 3;
	dir.shadowCameraRight = 3;
	dir.shadowCameraBottom = -2;
	dir.shadowCameraLeft = -4.2;
	dir.shadowMapWidth = dir.shadowMapHeight = 1024;

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.autoUpdate = false;
}