function Loader () {

    'use strict';

    this.load=function(data,options){

        if(typeof data !== 'object' || !(data.hasOwnProperty('geometries') && data.hasOwnProperty('meshes') && data.hasOwnProperty('textures'))){
            return console.warn('Loader.load() method needs an object with textures, geometries and meshes properties');
        }

        var _data=data;

        if(typeof options !== 'undefined'){
            
        }


    }
	
    // WORKER !!!
	// FakeSmile !!!

    document.body.innerHTML+=''+
        '<div class=background>'+
            '<div id=load-container>'+
                '<div class=illumination></div>'+
                '<div id=load-contained>'+
                    '<svg width=50 height=50 class=svg>'+
                        '<path d="M 25,2 A 23,23,0,1,1,25,49  A 23,23,0,1,1,25,2" fill=none stroke-linecap=round stroke-width=3 stroke=#244 ></path>'+
                        '<path class=spinner-loading d="M 25,2 A 23,23,0,1,1,25,49  A 23,23,0,1,1,25,2" stroke-linecap=round stroke-width=3></path>'+
                    '</svg>'+
                '</div>'+
                '<span class=valign></span>'+
            '</div>'+
            '<span class=valign></span>'+
        '</div>';

	var width=window.innerWidth;
	var height=window.innerHeight;

	var loadScreen=document.querySelector('.background');
    loadScreen.style.height=height+'px';
    loadScreen.style.width=width+'px';

    var handleResize=function(){
        height=window.innerHeight;
        width=window.innerWidth;
        loadScreen.style.height=height+'px';
        loadScreen.style.width=width+'px';
    };

    window.addEventListener('resize',handleResize,false);
    
    /*LOADING*/
    var texturesLength=resources.textures.length,
    	geometriesLength=resources.geometries.length,
    	meshesLength=resources.meshes.length;
    var texturesCounter=0,
    	geometriesCounter=0,
    	meshesCounter=0;
    
    var loader=new THREE.JSONLoader();
    var loadContained=document.getElementById('load-contained');
    var geometriesInfo=document.createElement('p'),
    	texturesInfo=document.createElement('p'),
    	meshesInfo=document.createElement('p'),
        go=document.createElement('p');
    geometriesInfo.className=texturesInfo.className=meshesInfo.className=go.className='info';
    geometriesInfo.innerHTML='<br/>&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;analyse des géometries, 0/'+geometriesLength;
    texturesInfo.innerHTML='&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;chargement des textures, 0/'+4;
    meshesInfo.innerHTML='&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;création des objets, 0/'+meshesLength;
    
    go.innerHTML='cliquez pour lancer l\'application';

    this.loadTextures = function(start,end){
        loadContained.appendChild(texturesInfo);

        setTimeout(function(){
            for(var i=start;i<end;i++)loadAsyncTextures(i);
        },200);

        function loadAsyncTextures(i){
            var src='img/'+resources.textures[i]+'.png',name=resources.textures[i];
            resources.textures[i]=THREE.ImageUtils.loadTexture(src,{},onTextureLoaded);
            //TODO : improve road texture contours to then enable mipmapping on it too (and everywhere)
            //resources.textures[i].minFilter=THREE.NearestMipMapNearestFilter;
            if(i===13||i===14||i===8||i===9||i===16||i===5||i===4)resources.textures[i].minFilter=THREE.LinearFilter;
            resources.textures[i].name=name;
        }

        function onTextureLoaded(){
            texturesCounter++;
            texturesInfo.innerHTML='&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;chargement des textures, '+texturesCounter+'/'+texturesLength;
            if(texturesCounter===(end-1)){
                texturesInfo.innerHTML='&#9745;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;chargement des textures, '+texturesCounter+'/'+texturesLength;
                _this.createMeshes();
            }
        }
    };

    this.loadGeometries = function(){
        loadContained.appendChild(geometriesInfo);

        setTimeout(function(){
            for(var i=0;i<geometriesLength;i++)loadAsyncGeo(i);
        },200);

        function loadAsyncGeo(i){
        	var src='JSON/'+resources.geometries[i]+'.json',name=resources.geometries[i];
            loader.load(src,function(geo){
                geo.name=name;
                resources.geometries[i]=geo;
                onGeometryLoaded();
            });
        }

        function onGeometryLoaded(){
	        geometriesCounter+=1;
	        geometriesInfo.innerHTML='<br/>&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;analyse des géometries, '+geometriesCounter+'/'+geometriesLength;
	        if(geometriesCounter===geometriesLength){
	            geometriesInfo.innerHTML='<br/>&#9745;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;analyse des géometries, '+geometriesCounter+'/'+geometriesLength;
	            _this.loadTextures(0,4);
	        }
        }
    };

    this.createMeshes = function(){
        loadContained.appendChild(meshesInfo);

        setTimeout(function(){
            for(var i=0;i<meshesLength;i++)createAsyncMeshes(i);
        },200);

		function createAsyncMeshes(i){
            var material=resources.meshes[i].material;
            var geometryRef=resources.meshes[i].geometry;
            var mapRef=resources.meshes[i].map;
            var steps=resources.meshes[i].steps!=undefined?resources.meshes[i].steps:undefined;
            var name=resources.meshes[i].name;
            var infos=resources.meshes[i].infos;
            
            var mesh=new THREE.Mesh();
            
            if(material instanceof THREE.MeshFaceMaterial){
                var src='JSON/'+resources.geometries[geometryRef].name+'.json';
                loader.load(src,function(geo,mat){
                    var matLength=mat.length;
                    for(var j=0;j<matLength;j++){
        				var color=mat[j].color;
        				mat[j]=new THREE.MeshLambertMaterial({color:color,shading:THREE.FlatShading});
                    }
                    material.materials=mat;
                    mesh.material=material;
                })
            }else {
                mesh.material=material;
                if(mapRef!=undefined)mapRef<4?material.map=resources.textures[mapRef]:mesh.texture=mapRef;
            }
            mesh.geometry=resources.geometries[geometryRef];
            mesh.name=name;
            if(steps!=undefined)mesh.userData={steps:steps,infos:infos};
            resources.meshes[i]=mesh;
            onObjectCreated();
		}

		function onObjectCreated (){
	        meshesCounter++;
	        meshesInfo.innerHTML='&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;création des objets, '+meshesCounter+'/'+meshesLength;
	        if(meshesCounter===meshesLength){
	            meshesInfo.innerHTML='&#9745;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;création des objets, '+meshesCounter+'/'+meshesLength;
	            _this.end(resources);
	        }
	    }
    };
    
    this.end = function(data){
        loadContained.innerHTML='';
        loadContained.appendChild(go);
        window.addEventListener('click',launch,false);
        window.addEventListener('touchstart',launch,false);
        document.body.style.cursor='pointer';
        function launch(){
            go.innerHTML='initialisation...';
            setTimeout(function(){
                if(Detectizr.device.type!=='desktop')UI.launchIntoFullscreen(document.documentElement);
                initScene(data)
                document.body.style.cursor='auto';
                window.removeEventListener('resize',handleResize,false);
                window.removeEventListener('click',launch,false);
                window.removeEventListener('touchstart',launch,false);
            },100);
        }
    };
}