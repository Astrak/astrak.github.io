'use strict';

var SCENE={
    set:function(data){
    	this.removeLoadScreen();

        scene=new THREE.Scene();
        
        renderer=new THREE.WebGLRenderer({alpha:true});
        //renderer.setPixelRatio(.8);
        renderer.setSize(innerWidth,innerHeight);
        canvasContainer.style.cssText='height:'+innerHeight+'px;width:'+innerWidth+'px;cursor:move;';
        canvasContainer.appendChild(renderer.domElement);
        renderer.domElement.style.position='relative';
        //renderer.setClearColor(0x2E2EC1);
        renderer.setClearColor(0x000000);

        this.setView();

        this.setLighting();
    	
    	//add first-step no-car meshes
    	for(var i=0;i<data.meshes.length;i++){
            if(i>7){//so cars are not added yet
                if(i<11||i>19)data.meshes[i].castShadow=data.meshes[i].receiveShadow=true;
                if(data.meshes[i].userData.steps[0]==true)scene.add(data.meshes[i]);
                data.meshes.matrixAutoUpdate=false;
            }
    	}
    
	    CARS.addCars(data);
	    TREES.addTrees(data);

		this.createSky(32,data);
			
		//this.addLensFlares(light,camera);
    },
    setView:function(){
        camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.4,150);
        camera.position.set(10,12,20);
        camera.update=false;
        scene.add(camera);
        
        controls=new THREE.TrackballControls(camera,renderer.domElement);
    	controls.noPan=true;
        controls.noZoom=true;
    	controls.rotateSpeed=.7;
    	controls.maxDistance=25;
		
        window.addEventListener('resize',this.updateWH,false);
        this.updateWH();
    },
    updateWH:function(){
        var height=window.innerHeight;
        var width=window.innerWidth;
        canvasContainer.style.height=height+'px';
        canvasContainer.style.width=width+'px';
        renderer.setSize(width,height);
        if(camera instanceof THREE.OrthographicCamera){
            var widthCam=20;
            var heightCam=widthCam*height/width;
            camera.top=heightCam;
            camera.bottom=-heightCam;
            camera.left=-widthCam;
            camera.right=widthCam;
        }
        camera.aspect=width/height;
        camera.updateProjectionMatrix();
        controls.handleResize();
        camera.update=true;
        var UIContainer=document.querySelector('#UIContainer');
    },
    setLighting:function(){
        var ambient=new THREE.AmbientLight(0x888888);
        var light=new THREE.DirectionalLight(0xffffff,1.3);
        light.position.set(0,35,20);
        light.shadowDarkness=1;
        scene.add(light,ambient);

    	renderer.shadowMapEnabled=true;
    	light.castShadow=true;
    	light.shadowCameraFar=60;
    	light.shadowCameraTop=25;
    	light.shadowCameraNear=light.shadowCameraRight=25;
    	light.shadowCameraBottom=light.shadowCameraLeft=-25;
    	light.shadowMapWidth=light.shadowMapHeight=2048;
    	light.shadowDarkness=.5;
    },
    createSky:function(skyWidth,data){
        var _skyWidth=skyWidth!==undefined?skyWidth:47;
        var sky=new THREE.Mesh(
            new THREE.CylinderGeometry(_skyWidth,_skyWidth,25,60,1,true),
            new THREE.MeshBasicMaterial({color:0xffffff,map:data.textures[9]})
            );
        sky.position.y=9;
        sky.scale.x=-1;
        scene.add(sky);
        SCENE.sky=sky;
    },
    addLensFlares:function(source,camera){
		var textureFlare0 = data.textures[10],
			textureFlare2 = data.textures[11],
			textureFlare3 = data.textures[12],
			flareColor=new THREE.Color(0xffffff);
		flareColor.setHSL(.9,.9,1);
		var lensFlare=new THREE.LensFlare(textureFlare0,500,0,THREE.AdditiveBlending,flareColor);
		lensFlare.add(textureFlare2,3000,0,THREE.AdditiveBlending);
		lensFlare.add(textureFlare2,1000,0,THREE.AdditiveBlending);
		lensFlare.add(textureFlare3,60,0,THREE.AdditiveBlending);
		lensFlare.add(textureFlare3,70,.7,THREE.AdditiveBlending);
		lensFlare.add(textureFlare3,120,.9,THREE.AdditiveBlending);
		lensFlare.add(textureFlare3,70,1,THREE.AdditiveBlending);
		var vec=new THREE.Vector3().subVectors(source.position,camera.position);
		lensFlare.position.set(source.position.x,source.position.y,source.position.z);
		lensFlare.customUpdateCallback=lensFlareUpdateCallback;
    	scene.add(lensFlare);
    	function lensFlareUpdateCallback(object) {
    		var fl=object.lensFlares.length,flare,
    			vecX=-object.positionScreen.x*2,
    			vecY=-object.positionScreen.y*2;
    		for(var f=0;f<fl;f++){
    			flare=object.lensFlares[f];
    			flare.x=object.positionScreen.x+vecX*flare.distance;
    			flare.y=object.positionScreen.y+vecY*flare.distance;
    			flare.rotation=0;
    		}
    	}
	},
	removeLoadScreen:function(){
	    document.body.style.overflowY='hidden';
	    var loadScreen=document.querySelector('.background');
	    document.body.removeChild(loadScreen);
	    canvasContainer=document.querySelector('.canvas-container');
    }
};