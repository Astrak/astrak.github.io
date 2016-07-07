'use strict';

//basics
var renderer, scene, camera, controls, raycaster;

//objects
var carsMeshes = [],
	carsTls = [],
	parkedCarsMesh,
	treesMesh = {}, 
	meshes = [];

//loadscreen
var loadLayer;

//UI
var slC, topInterface, shadowContainter;
var anims, PLUs, closePLU, closeInfos;

//rendering
var animated = true;
var height;
var compass, ref = new THREE.Vector3( 0, 0, -1 ), cam = new THREE.Vector3();
var angle, s;

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

				if ( m.hasOwnProperty( 'flatShaded' ) && m.flatShaded ) g.computeFlatVertexNormals();

				m.material.map = resources.textures[ m.map ];

				var mesh = new THREE.Mesh( g, m.material );
				mesh.name = m.name;
				mesh.userData.map = m.map;
				if ( m.hasOwnProperty( 'steps' ) ) mesh.userData.steps = m.steps;
				if ( m.hasOwnProperty( 'infos' ) ) mesh.userData.infos = m.infos;
				resources.meshes[ v ] = mesh;
			}
		}
	}
}

function setScene () {
	scene = new THREE.Scene();

	setView();
	setLighting();
	setSky();

	//createTrees();
	createCars();

	prepareScene();

	setUI();

	animate();
}

function setUI () {
	setSteps();
	
	topInterface = document.createElement( 'div' );
	topInterface.id = 'top-interface';
	shadowContainter = document.createElement( 'div' );
	topInterface.appendChild( shadowContainter );
	
	showAnimations();
	showPLU();
	//shadowContainter.appendChild( showInfos() );
	topInterface.appendChild( compass() );
	
	document.body.appendChild( topInterface );
	
	resize();
}

function compass () {
	var	button = document.createElement( 'button' );
	compass = document.createElement( 'span' );
	compass.id = 'compass';
	button.id = 'compass-bttn';
	button.appendChild( compass );

	button.addEventListener( 'click', function ( e ) {
        e.stopPropagation();
		TweenLite.to( camera.position, .7, { x : 0, y : 12, z : 23 } );
		return false;
	}, false );

	return button;
}

function SwitchButton ( title, callback, init ) {
	var b = document.createElement( 'button' ),
		p = document.createElement( 'p' ),
		container = document.createElement( 'div' ),
		on = document.createElement( 'p' ),
		off = document.createElement( 'p' ),
		thumb = document.createElement( 'span' );

	b.className = 'sb';
	container.className = 'sb-cont';
	on.className = 'sb-on';
	off.className = 'sb-off';
	thumb.className = init ? 'on' : 'off';

	p.innerHTML = title;
	on.innerHTML = 'on';
	off.innerHTML = '&nbsp;off';

	container.appendChild( on );
	container.appendChild( off );
	container.appendChild( thumb );
	b.appendChild( p );
	b.appendChild( container );

	b.bool = init;

	b.on = function () {
		if ( b.bool ) return;
		b.bool = false;
		thumb.className = 'on';
		callback();
		return false;
	};

	b.off = function () {
		if ( ! b.bool ) return;
		b.bool = true;
		thumb.className = 'off';
		callback();
		return false;
	};

	b.addEventListener( 'click', function ( e ) {
		e.stopPropagation();
		callback();
		b.bool = ! b.bool;
		thumb.className = b.bool ? 'on' : 'off';
		return false;
	}, false );

	return b;
}

function showAnimations () {
	anims = new SwitchButton( 'animations', function () {
		if ( animated ) {
			for ( var i = 0 ; i < carsMeshes.length ; i++ ) {
				scene.remove( carsMeshes[ i ] );
				carsTls[ i ].pause( 0, true );
			}
			camera.update = true;
		} else {
			for ( var i = 0 ; i < carsMeshes.length ; i++ ) {
				scene.add( carsMeshes[ i ] );
				carsTls[ i ].resume();
			}
		}
		animated = ! animated;
	}, true );
	shadowContainter.appendChild( anims );
}

function showPLU () {
	var infos = {
    		UA:{
	            title:"Informations sur la zone UA",
	            description:"la zone UA recouvre l'écusson"
    		},
    		UAa:{
	            title:"Informations sur la zone UAa",
	            description:"la zone UAa recouvre la zone de l'ancien hôpital Gabarrou, actual Carré Gambetta"
			},
			UB:{
	            title:"Informations sur la zone UB",
	            description:"la zone UB ..."
			}
		};

	var PLU = createPLU(),
		showPLU = false,
		PLU_raycaster= new THREE.Raycaster(),
		PLU_mouse = new THREE.Vector2(),
		PLU_INTERSECTED = null,
		mouseMove = false;

	PLUs = new SwitchButton( 'PLU', function () {
		if ( ! showPLU ) {
			PLU.UA.ON();PLU.UAa.ON();PLU.UB.ON();
	        setTimeout( function(){
	            window.addEventListener( 'mousemove', PLU_raycast, false );
	            window.addEventListener( 'click', PLU_displayInfos, false );
	            //window.addEventListener( 'mousedown', checkMouseMove, true );
	        }, 200 );
		} else {
			PLU.UA.OFF();PLU.UAa.OFF();PLU.UB.OFF();
	        window.removeEventListener( 'mousemove', PLU_raycast, false );
	        window.removeEventListener( 'click', PLU_displayInfos, false );
	        //window.removeEventListener( 'mousedown', checkMouseMove, true );
	        if ( PLU_INTERSECTED ) PLU_INTERSECTED.material.color.set( 0x555588 );
	        PLU_INTERSECTED = null;
	        renderer.domElement.style.cursor = '';
		}
		showPLU = ! showPLU;
	}, showPLU );

	shadowContainter.appendChild( PLUs );

	function PLU_raycast ( e ) {
	    if ( ! mouseMove ) {
	        PLU_mouse.x = ( e.clientX / innerWidth ) * 2 - 1;
	        PLU_mouse.y = - ( e.clientY / innerHeight ) * 2 + 1;
	        PLU_raycaster.setFromCamera( PLU_mouse, camera );

	        var intersects = PLU_raycaster.intersectObjects( scene.children );
	        var interest = false;

	        for ( var i = 0 ; i < intersects.length ; i++ ) {
	            if ( intersects[ i ].object.userData != undefined ) {
	                if ( intersects[ i ].object.userData.PLU != undefined ) {
	                    interest = i; break;
	                }
	            }
	        }

	        if ( interest !== false ) {
	            if ( PLU_INTERSECTED ) {
	                if ( PLU_INTERSECTED === intersects[ interest ].object ) return;
	                PLU_INTERSECTED.material.color.set( 0x333366 );
	            }
	            PLU_INTERSECTED = intersects[ interest ].object;
	            PLU_INTERSECTED.material.color.set( 0x555588 );
	            renderer.domElement.style.cursor = 'pointer';
	        } else {
	            if ( PLU_INTERSECTED ) PLU_INTERSECTED.material.color.set( 0x333366 );
	            PLU_INTERSECTED = null;
	            renderer.domElement.style.cursor = '';
	        }

            camera.update = true;
	    }
	}
	function PLU_displayInfos(){
	    if ( PLU_INTERSECTED && ! mouseMove ) {
	        PLU_INTERSECTED.material.color.set(0x555588);//for mobile devices where there is no mousemove
	        window.removeEventListener( 'click', PLU_displayInfos, false );
	        
	        var div = document.createElement( 'div' );
	        var greyScreen2 = document.createElement( 'div' );
	        var close = document.createElement( 'button' );
	        
	        greyScreen2.className = 'greyScreen';
	        div.className = 'display-infos';
	        close.className = 'display-infos-button';
	        
	        div.innerHTML = "<h3 class='display-infos-title'>" + PLU_INTERSECTED.userData.PLU.title + 
	            "</h3><br/><br/><p class='display-infos-description'>" + PLU_INTERSECTED.userData.PLU.description + "</p>";
	        close.innerHTML = 'close';
	        
	        div.appendChild( close );
	        greyScreen2.appendChild( div );
	        document.body.appendChild( greyScreen2 );
	        
	        close.addEventListener( 'click', function ( e ) {
	            e.stopPropagation();
	            document.body.removeChild( greyScreen2 );
	            setTimeout( function () { window.addEventListener( 'click', PLU_displayInfos, false ); }, 0 );
	        });
	    }
	}
	function checkMouseMove(){
	    mouseMove=false;
	    window.addEventListener('mousemove',mouseMoveTrue,true);
	    window.addEventListener('mouseup',checkMouseUp,true);
	    window.removeEventListener('mousedown',checkMouseMove,true);
	}
	function mouseMoveTrue(){
	    mouseMove=true;
	    if(renderer.domElement.style.cursor==='pointer')
	    	renderer.domElement.style.cursor='';
	}
	function checkMouseUp(){
        setTimeout(function(){
            mouseMove=false;
            if(PLU_INTERSECTED)renderer.domElement.style.cursor='pointer';
        },0);
        window.removeEventListener('mouseup',checkMouseUp,true);
        window.removeEventListener('mousemove',mouseMoveTrue,true);
        window.addEventListener('mousedown',checkMouseMove,true);
	}

	function createPLU () {
        //UA
        var UAPoints=[
                {x:16.2,z:12.1},{x:1.76,z:11.73},{x:0,z:11.1},{x:-11.53,z:18.77},//extfaces
                {x:-31.2,z:4.88},{x:-28.6,z:-13.6},{x:-16.36,z:-26.88},{x:6.42,z:-30.9},{x:25.36,z:-18.78},{x:30.85,z:4.26},{x:21.52,z:22.8},
                {x:.34,z:10.29},{x:-13.9,z:.47},{x:-5.29,z:-8.72},{x:6.48,z:-4.26},{x:9.2,z:-2.53}//fromUAa>intfaces
                ],
            UAPointsLength=UAPoints.length,
            UAMaxHeight=2;
        var UAGeometry=new THREE.Geometry();
        for(var i=0;i<UAPointsLength;i++){
            UAGeometry.vertices.push(new THREE.Vector3(UAPoints[i].x,UAMaxHeight,UAPoints[i].z));
        }
        for(var i=0;i<UAPointsLength;i++){
            UAGeometry.vertices.push(new THREE.Vector3(UAPoints[i].x,0,UAPoints[i].z));
        }
        UAGeometry.faces.push(
            new THREE.Face3(0,16,17),new THREE.Face3(0,17,1),new THREE.Face3(1,17,18),new THREE.Face3(1,18,2),
            new THREE.Face3(2,18,19),new THREE.Face3(2,19,3),
            new THREE.Face3(11,28,27),new THREE.Face3(11,12,28),new THREE.Face3(12,29,28),new THREE.Face3(12,13,29),
            new THREE.Face3(13,30,29),new THREE.Face3(13,14,30),new THREE.Face3(14,31,30),new THREE.Face3(14,15,31),
            new THREE.Face3(15,27,31),new THREE.Face3(15,11,27),
            new THREE.Face3(0,1,11),new THREE.Face3(1,2,11),new THREE.Face3(2,12,11),new THREE.Face3(2,3,12),
            new THREE.Face3(3,4,12),new THREE.Face3(4,5,12),new THREE.Face3(5,6,12),new THREE.Face3(6,13,12),
            new THREE.Face3(6,7,13),new THREE.Face3(7,8,13),new THREE.Face3(13,8,14),new THREE.Face3(8,9,14),
            new THREE.Face3(9,15,14),new THREE.Face3(9,10,15),new THREE.Face3(0,11 ,15),new THREE.Face3(0,15,10),
            new THREE.Face3(26,16,10),new THREE.Face3(16,0,10)
            );
        UAGeometry.computeFaceNormals();
        var UAMaterial=new THREE.MeshLambertMaterial({color:0x333366,transparent:true,opacity:0,side:THREE.DoubleSide});
        var UAMesh=new THREE.Mesh(UAGeometry,UAMaterial);
        UAMesh.userData={PLU:infos.UA};
        UAMesh.name="UA";
        var UASprite=makeTextSprite('UA');
        UASprite.position.set(2,2.5,-12);
        UAMesh.add(UASprite);
        UAMesh.scale.y=.01;
        var UA={
            mesh:UAMesh,
            ON:function(){
                scene.add(UAMesh);
                TweenLite.to(UAMesh.scale,.7,{y:1,onUpdate:function(){camera.update=true}});
                TweenLite.to(UAMesh.material,.7,{opacity:.6,onUpdate:function(){camera.update=true}});
            },
            OFF:function(){
                TweenLite.to(UAMesh.scale,.7,{y:.05,onComplete:function(){scene.remove(UAMesh)},onUpdate:function(){camera.update=true}});
                TweenLite.to(UAMesh.material,.7,{opacity:0,onUpdate:function(){camera.update=true}});
            }
        };
        
        //UAa
        var UAaPoints=[{x:.37,z:9.45},{x:-12.9,z:.37},{x:-5.48,z:-7.88},{x:6.34,z:-3.8},{x:8.43,z:-2.5}],
            UAaPointsLength=UAaPoints.length,
            UAaMaxHeight=2.54;
        var UAaGeometry=new THREE.Geometry();
        for(var i=0;i<UAaPointsLength;i++){
            UAaGeometry.vertices.push(new THREE.Vector3(UAaPoints[i].x,UAaMaxHeight,UAaPoints[i].z));
        }
        for(var i=0;i<UAaPointsLength;i++){
            UAaGeometry.vertices.push(new THREE.Vector3(UAaPoints[i].x,0,UAaPoints[i].z));
        }
        UAaGeometry.faces.push(
            new THREE.Face3(0,1,2),new THREE.Face3(0,2,3),new THREE.Face3(0,3,4),
            new THREE.Face3(0,5,6),new THREE.Face3(0,6,1),new THREE.Face3(1,6,7),new THREE.Face3(1,7,2),new THREE.Face3(2,7,8),
            new THREE.Face3(2,8,3),new THREE.Face3(3,8,9),new THREE.Face3(3,9,4),new THREE.Face3(4,9,5),new THREE.Face3(4,5,0)
            );
        UAaGeometry.computeFaceNormals();
        var UAaMaterial=new THREE.MeshLambertMaterial({color:0x555599,transparent:true,opacity:0,side:THREE.DoubleSide});
        var UAaMesh=new THREE.Mesh(UAaGeometry,UAaMaterial);
        UAaMesh.userData={PLU:infos.UAa};
        UAaMesh.name="UAa";
        var UAaSprite=makeTextSprite('UAa');
        UAaSprite.position.set(0,2.5,0);
        UAaMesh.add(UAaSprite);
        UAaMesh.scale.y=.01;
        var UAa={
            mesh:UAaMesh,
            ON:function(){
                scene.add(UAaMesh);
                TweenLite.to(UAaMesh.scale,.7,{y:1,onUpdate:function(){camera.update=true}});
                TweenLite.to(UAaMesh.material,.7,{opacity:.6,onUpdate:function(){camera.update=true}});
            },
            OFF:function(){
                TweenLite.to(UAaMesh.scale,.7,{y:.05,onComplete:function(){scene.remove(UAaMesh)},onUpdate:function(){camera.update=true}});
                TweenLite.to(UAaMesh.material,.7,{opacity:0,onUpdate:function(){camera.update=true}});
            }
        };
        
        //UB
        var UBPoints=[
            {x:-31.14,z:3.57},{x:-11.25,z:19.4},{x:-.99,z:13.04},{x:1.03,z:13.43},{x:13.77,z:13.43},
            {x:20,z:23.7},{x:0,z:31.5},{x:-21.8,z:22.4}
            ],
            UBPointsLength=UBPoints.length,
            UBMaxHeight=1.75;
        var UBGeometry=new THREE.Geometry();
        for(var i=0;i<UBPointsLength;i++){
            UBGeometry.vertices.push(new THREE.Vector3(UBPoints[i].x,UBMaxHeight,UBPoints[i].z));
        }
        for(var i=0;i<UBPointsLength;i++){
            UBGeometry.vertices.push(new THREE.Vector3(UBPoints[i].x,0,UBPoints[i].z));
        }
        UBGeometry.faces.push(
            new THREE.Face3(0,1,8),new THREE.Face3(1,8,9),new THREE.Face3(1,2,10),new THREE.Face3(1,10,9),new THREE.Face3(2,3,10),
            new THREE.Face3(3,10,11),new THREE.Face3(3,4,11),new THREE.Face3(4,11,12),new THREE.Face3(4,5,12),new THREE.Face3(5,12,13),//sides
            new THREE.Face3(0,1,7),new THREE.Face3(1,7,6),new THREE.Face3(1,2,6),new THREE.Face3(2,3,6),new THREE.Face3(3,4,6),
            new THREE.Face3(4,5,6)//top
            );
        UBGeometry.computeFaceNormals();
        var UBMaterial=new THREE.MeshLambertMaterial({color:0x111144,transparent:true,opacity:0,side:THREE.DoubleSide});
        var UBMesh=new THREE.Mesh(UBGeometry,UBMaterial);
        UBMesh.userData={PLU:infos.UB};
        UBMesh.name="UB";
        var UBSprite=makeTextSprite('UB');
        UBSprite.position.set(4,2,16);
        UBMesh.add(UBSprite);
        UBMesh.scale.y=.01;
        var UB={
            mesh:UBMesh,
            ON:function(){
                scene.add(UBMesh);
                TweenLite.to(UBMesh.scale,.7,{y:1,onUpdate:function(){camera.update=true}});
                TweenLite.to(UBMesh.material,.7,{opacity:.6,onUpdate:function(){camera.update=true}});
            },
            OFF:function(){
                TweenLite.to(UBMesh.scale,.7,{y:.05,onComplete:function(){scene.remove(UBMesh)},onUpdate:function(){camera.update=true}});
                TweenLite.to(UBMesh.material,.7,{opacity:0,onUpdate:function(){camera.update=true}});
            }
        };
        
        function makeTextSprite(message){
            var canvas=document.createElement('canvas');
            var context=canvas.getContext('2d');
            
            context.font="Bold 18px Arial";
            context.fillStyle="rgba(0,0,0,1)";
            context.strokeStyle="rgba(255,255,255,1)";
            context.lineWidth=2;
            context.fillText('zone '+message,4,22);
            
            var padding=5;
            
            var texture=new THREE.Texture(canvas);
            texture.minFilter=THREE.LinearFilter;
            texture.needsUpdate=true;
            
            var sprite=new THREE.Sprite(new THREE.SpriteMaterial({ 
                    map:texture,
                    depthTest:false
                    })
                );
            sprite.material.map.offset.set(-.5,0);
            sprite.scale.set(10,5,5);
            return sprite;
        }
        
        return {UA:UA,UAa:UAa,UB:UB};
	}

	closePLU = function () {
        if(showPLU){
            showPLU=false;
            PLU.UA.OFF();PLU.UAa.OFF();PLU.UB.OFF();
        }

        window.removeEventListener('mousemove',PLU_raycast,false);
        window.removeEventListener('click',PLU_displayInfos,false);
        window.removeEventListener('mousedown',checkMouseMove,true);

        if(PLU_INTERSECTED)PLU_INTERSECTED.material.color.set(0x333366);
        PLU_INTERSECTED=null;
        renderer.domElement.style.cursor='move';
	};

	return PLUs;
}

function showInfos () {
    var button = document.createElement( 'button' );
    button.innerHTML='i';

    var raycaster= new THREE.Raycaster(),
    	mouse = new THREE.Vector2(),
    	INTERSECTED = null,
    	mouseMove = false,
    	showInfos = false;

    button.addEventListener( 'click', function ( e ) {
        e.stopPropagation();
        showInfos = ! showInfos;
        if ( showInfos ) {
            setTimeout( function () {
                window.addEventListener( 'mousemove', raycast, false );
                window.addEventListener( 'click', displayInfos, false );
                window.addEventListener( 'mousedown', checkMouseMove, true );
            }, 200 );
        } else {
            window.removeEventListener( 'mousemove', raycast, false );
            window.removeEventListener( 'click', displayInfos, false );
            window.removeEventListener( 'mousedown', checkMouseMove, true );
            if ( INTERSECTED ) {
                INTERSECTED.material.color.set( 0xffffff );
                camera.update = true;
            }
            INTERSECTED = null;
            this.style.cssText = 'font:italic 33px Times New Roman;color:#fff;';
            renderer.domElement.style.cursor = '';
        }
        return false;
    }, false );

    function raycast ( e ) {
        if ( ! mouseMove ) {
            mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
            raycaster.setFromCamera( mouse, camera );

            var interest = false;
            var intersects = raycaster.intersectObjects( scene.children );

            for ( var i = 0 ; i < intersects.length ; i++ ) {
                if ( intersects[ i ].object.userData != undefined ) {
                    if ( intersects[ i ].object.userData.infos != undefined ) {
                        interest = i; break;
                    }
                }
            }

            if ( interest !== false ) {
                if ( INTERSECTED ) {
                    if ( INTERSECTED === intersects[ interest ].object ) return;
                    INTERSECTED.material.color.set( 0xffffff );
                }
                INTERSECTED = intersects[ interest ].object;
                INTERSECTED.material.color.set( 0xaaaaff );
                camera.update = true
                renderer.domElement.style.cursor = 'pointer';
            } else {
                if ( INTERSECTED ) {
                    INTERSECTED.material.color.set( 0xffffff );
                    camera.update = true
                }
                INTERSECTED = null;
                renderer.domElement.style.cursor = '';
            }
        }
    }

    function displayInfos () {
        if ( INTERSECTED && INTERSECTED.userData.infos != undefined && ! mouseMove ) {
            
            INTERSECTED.material.color.set( 0xaaaaff );//for mobile devices where there is no mousemove
            window.removeEventListener( 'click', displayInfos, false );
            
            var div = document.createElement( 'div' );
            var greyScreen2 = document.createElement( 'div' );
            var close = document.createElement( 'button' );
            
            greyScreen2.className = 'greyScreen';
            div.className = 'display-infos';
            close.className = 'display-infos-button';
            
            div.innerHTML = "<h3 class='display-infos-title'>" + INTERSECTED.userData.infos.title +
                "</h3><br/><br/><p class='display-infos-description'>" + INTERSECTED.userData.infos.description + "</p>";
            close.innerHTML = 'close';
            
            div.appendChild( close );
            greyScreen2.appendChild( div );
            document.body.appendChild( greyScreen2 );
            
            close.addEventListener( 'click', function ( e ) {
                e.stopPropagation();
                document.body.removeChild( greyScreen2 );
                setTimeout( function () { window.addEventListener( 'click', displayInfos, false ); }, 0 );
            });
        }
    }

    function checkMouseMove () {
        mouseMove = false;
        window.addEventListener( 'mousemove', mouseMoveTrue, true );
        window.addEventListener( 'mouseup', checkMouseUp, true );
        window.removeEventListener( 'mousedown', checkMouseMove, true );
    }

    function mouseMoveTrue () {
        if ( renderer.domElement.style.cursor === 'pointer' )
            renderer.domElement.style.cursor = '';
        mouseMove = true;
    }

    function checkMouseUp () {
        setTimeout( function () {
            mouseMove = false;
            if ( INTERSECTED ) renderer.domElement.style.cursor = 'pointer';
        }, 0 );
        window.removeEventListener( 'mouseup', checkMouseUp, true );
        window.removeEventListener( 'mousemove', mouseMoveTrue, true );
        window.addEventListener( 'mousedown', checkMouseMove, true );
    }

    closeInfos = function () {
        window.removeEventListener( 'mousedown', checkMouseMove, true );
        window.removeEventListener( 'mousemove', raycast, false )
        window.removeEventListener( 'click', displayInfos, false )
        if ( INTERSECTED ) INTERSECTED.material.color.set( 0xffffff );
        INTERSECTED = null;
        renderer.domElement.style.cursor = '';
        showInfos = false;
    };

	return button;
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
        //if ( mesh.name !== 'chantier' ) {
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
        //}
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
    var plane = new THREE.PlaneGeometry( 1.7, 2.5, 1, 1 );
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
            map : resources.textures[ 6 ],
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
	var bufferCars = [];
	for ( var i = 0 ; i < CARS.meshes.length ; i++ ) {
		resources.meshes[ i ].userData.proba = CARS.meshes[ i ].proba;
		bufferCars[ i ] = new THREE.BufferGeometry().fromGeometry( resources.meshes[ i ].geometry );
	}

	//parkedcars
		var p = CARS.parkedCars,
			pL = p.length,
			g = new THREE.Geometry(),
			cs = CARS.meshes;
	    for ( var i = 0 ; i < pL ; i++ ) {
			var c = pickRandomCar( 'mesh' );
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

		var size = 8;//max cars = 8 * 8 / 2 = 32
		var dataTexture = new THREE.DataTexture( new Float32Array( size * size ), size, size, THREE.RGBFormat, THREE.FloatType );


		//2. create shader material : simple lambert with transparency enabled.
		var multiCarMaterial = new THREE.ShaderMaterial({
			vertexShader : [''+
				'attribute float rank;',
				'uniform sampler2D data;',
				'varying vec2 vUv;',
				//'varying vec2 vNormal;',
				'mat4 lookAt ( vec3 pos, vec3 target ) {',
				'	vec3 X, Y, Z;',
				'	Z = normalize( pos - target);',
				'	X = normalize( cross( vec3( .0, 1., .0 ), Z ) );',
				'	Y = normalize( cross( X, Z ) );',
				'	mat4 r;',
				'	r[0] = vec4( X, .0 );',
				'	r[1] = vec4( Y, .0 );',
				'	r[2] = vec4( Z, .0 );',
				'	r[3][3] = 1.;',
				'}',
				'void main () {',
				'	vUv = uv;',
				'	int size = ' + size + ';',
				'	vec2 coordPos = vec2( ( ( rank * 2 ) % size ) * 1 / size, 1 - floor( ( rank * 2 ) / size ) / size;',
				'	vec2 coordTarget = vec2( ( ( rank * 2 + 1 ) % size ) * 1 / size, 1 - floor( ( rank * 2 + 1 ) / size ) / size;',
				'	vec3 pos = texture2D( data, coordPos );',
				'	mat4 p; p[0][0] = p[1][1] = p[2][2] = 1.;',
				'	p[3] = vec4( pos, 1. );',
				'	mat4 r = lookAt( pos, texture2D( data, coordTarget ) );',
				//'	vNormal = normal * normalMatrix;',
				'	gl_Position = projectionMatrix * r * p * viewMatrix * position;',
				'}'
			].join( '\n' ),
			fragmentShader : [''+
				'uniform sampler2D tex;',
				'varying vec2 vUv;',
				//'varying vec2 vNormal;',
				'void main () {',
				'	gl_FragColor = texture2D( tex, vUv );',//basic mat
				'}'
			].join( '\n' ),
			uniforms : {
				tex : { value : null },
				data : { value : null }
			},
			transparent : true
		});

		//3. for each car, merge model buffergeometry position/normal/uv plus add the 'index' attribute. Index has to be set too.
		var positions = [],
			normals = [],
			uvs = [],
			ranks = [],
			indices = [],
			data = [],
			aOffset = 0;

		for ( var i = 0 ; i < CARS.streetCars.length ; i++ ) {
			var car = CARS.streetCars[ i ];

	    	//path
				var points = car.curve.points,
					pl = points.length;

				for ( var j = 0 ; j < pl ; j++ ) points[ j ] = new THREE.Vector3( points[ j ].x, 0, points[ j ].z );

				car.curve.spline = new THREE.CatmullRomCurve3( points );

				var beginPos = car.curve.spline.getPoint( car.begin );
				var beginTarget = car.curve.spline.getPoint( car.begin + .001 );

				dataTexture.image.data[ i * 6 ] = beginPos.x; 
				dataTexture.image.data[ i * 6 + 1 ] = beginPos.y; 
				dataTexture.image.data[ i * 6 + 2 ] = beginPos.z; 

				dataTexture.image.data[ i * 6 + 3 ] = beginTarget.x; 
				dataTexture.image.data[ i * 6 + 4 ] = beginTarget.y; 
				dataTexture.image.data[ i * 6 + 5 ] = beginTarget.z;

			//attributes
				var curGeo = pickRandomCar();
				var count = curGeo.attributes.uv.array.length / 2;

				for ( var j = 0 ; j < count ; j++ ) {
					positions[ aOffset * 3 + count * 3 ] = curGeo.attributes.position.array[ j * 3 ];
					positions[ aOffset * 3 + count * 3 + 1 ] = curGeo.attributes.position.array[ j * 3 + 1 ];
					positions[ aOffset * 3 + count * 3 + 2 ] = curGeo.attributes.position.array[ j * 3 + 2 ];

					normals[ aOffset * 3 + count * 3 ] = curGeo.attributes.normal.array[ j * 3 ];
					normals[ aOffset * 3 + count * 3 + 1 ] = curGeo.attributes.normal.array[ j * 3 + 1 ];
					normals[ aOffset * 3 + count * 3 + 2 ] = curGeo.attributes.normal.array[ j * 3 + 2 ];

					uvs[ aOffset * 2 + count * 2 ] = curGeo.attributes.uv.array[ j * 2 ];
					uvs[ aOffset * 2 + count * 2 + 1 ] = curGeo.attributes.uv.array[ j * 2 + 1 ];

					ranks[ aOffset + count ] = i;
				}


				aOffset += count;

			//tweens
				var t = car.tweens,
					tL = t.length, 
					position = { l : car.begin }, 
					tl = new TimelineMax( { repeat : -1 } );
				var	createAnimatedPath = function ( k ) {
		        	var complete = function () {
						if ( t[ k ].ending ) position.l = 0;
					};
					var pos, target, offset = i;
					tl.add(
						new TweenLite(
							position,
							t[ k ].duration / 1000,
							{
								l : t[ k ].to,
								ease : t[ k ].easing,
								onUpdate : function () {
									pos = car.curve.spline.getPoint( position.l );
									target = car.curve.spline.getPoint( position.l + .001 );
									dataTexture.image.data[ offset * 6 ] = pos.x;
									dataTexture.image.data[ offset * 6 + 1 ] = pos.y;
									dataTexture.image.data[ offset * 6 + 2 ] = pos.z;
									dataTexture.image.data[ offset * 6 + 3 ] = target.x;
									dataTexture.image.data[ offset * 6 + 4 ] = target.y;
									dataTexture.image.data[ offset * 6 + 5 ] = target.z;
									dataTexture.needsUpdate = true;
								},
								onComplete : complete,
								delay : t[ k ].delay / 1000
							}
						)
					);
		        };

				for ( var k = 0 ; k < tL ; k++ ) createAnimatedPath( k );

			    carsTls.push( tl );
		}

		//complete buffergeometry
		g = new THREE.BufferGeometry();
		g.addAttribute( new THREE.BufferAttribute( 'position', new Float32Array( positions ), 3 ) );
		g.addAttribute( new THREE.BufferAttribute( 'normal', new Float32Array( normals ), 3 ) );
		g.addAttribute( new THREE.BufferAttribute( 'uv', new Float32Array( uvs ), 2 ) );
		g.addAttribute( new THREE.BufferAttribute( 'rank', new Float32Array( ranks ), 1 ) );
		//g.setIndex( new THREE.BufferAttribute( new Uint32Array( indices ), 1 ) );

		
		//create mesh
		var cars = new THREE.Mesh( g, multiCarMaterial );
		//scene.add( cars );

	//individual car objects
		/*for ( var i = 0 ; i < cars.streetCars.length ; i++ ) createCar( i );

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

		    carsTls.push( tl );

			var beginPos = car.curve.spline.getPoint( car.begin )
			mesh.position.set( beginPos.x, beginPos.y, beginPos.z );
			mesh.lookAt( car.curve.spline.getPoint( car.begin + .001 ) );
			scene.add( mesh );
	    }*/


	function pickRandomCar ( type ) {
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
		if ( type === 'mesh' ) return resources.meshes[ n ];
		else return bufferCars[ n ];//for merged buffergeometry
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
	height = innerWidth <= 1035 ? innerHeight - parseInt( getComputedStyle( slC, null ).height ) : innerHeight;
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
    sky.userData.map = 7;
    resources.meshes.push( sky );
}

function animate () {
	requestAnimationFrame( animate );

	controls.update();

	if ( animated || camera.update ) {
	
		if ( typeof compass !== 'undefined' && compass.style ) {
			cam.set( camera.position.x, 0, camera.position.z ).normalize();
			angle = cam.angleTo( ref ) * 180 / Math.PI;
			angle = camera.position.x > 0 ? - angle : angle;
			s = 'rotateZ(' + angle + 'deg);';
			compass.style.cssText = 'transform :'+s;
		}

		renderer.render( scene, camera );
		camera.update = false;

	}
}
