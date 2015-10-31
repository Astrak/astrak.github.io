var CARS={
    addCars:function(data){
    	this.addParkedCars(data);
    	this.addStreetCars(data);
    },
    addParkedCars:function(data){
		var l=this.parkedCars.length;
		var geometry=new THREE.Geometry();
		var cars=this.cars(data);
	    for(var i=0;i<l;i++){
			var car=cars[this.randomCarIndex(cars)].car;
			car.position.set(this.parkedCars[i].x,0,this.parkedCars[i].z);
			car.rotation.y=this.parkedCars[i].rot/180*Math.PI;
			car.updateMatrixWorld();
			geometry.merge(car.geometry.clone(),car.matrixWorld);
		}
		var parkedCarsMesh=new THREE.Mesh(
		    geometry,
		    linearFilteredSmoothLambertMaterial
		    );
		parkedCarsMesh.receiveShadow=parkedCarsMesh.castShadow=true;
		scene.add(parkedCarsMesh);
	},
	addStreetCars:function(data){
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
		    car.castShadow=car.receiveShadow=true;
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

			for(var k=0;k<tL;k++)createAnimatedPath(k);

			/*for(var l=0;l<tL;l++){
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
			}*/

			var beginPos=CARS.streetCars[i].curve.spline.getPoint(CARS.streetCars[i].begin)
			car.position.set(beginPos.x,beginPos.y,beginPos.z);
			car.lookAt(CARS.streetCars[i].curve.spline.getPoint(CARS.streetCars[i].begin+.001));
			scene.add(car);
        }
        for(var i=0;i<CARS.streetMesh.length;i++)scene.remove(CARS.streetMesh[i])
	},
    randomCarIndex:function(array){
        var divider=0;
		var arrayLength=array.length;
		for(var z=0;z<arrayLength;z++){
			divider+=array[z].proba;
		}
		var randomNumber=Math.floor(Math.random()*divider);
		var checkNumber=0;
		var index;
		for(var zz=0;zz<arrayLength;zz++){
			checkNumber+=array[zz].proba;
			if(randomNumber<checkNumber){index=zz;break}
		}
		return index
    },
	cars:function(data){
		return [
			{car:data.meshes[0],name:'4x4',proba:7},
			{car:data.meshes[1],name:'citadine',proba:20},
			{car:data.meshes[2],name:'break',proba:12},
			{car:data.meshes[3],name:'berline',proba:20},
			{car:data.meshes[4],name:'kangoo',proba:12},
			{car:data.meshes[5],name:'sportive',proba:2},
			{car:data.meshes[6],name:'camionette',proba:8},
			{car:data.meshes[7],name:'familiale',proba:7},
        ];
    },
	streetCars:[
		{
			pathDescription:'bvd lices > amiral galibert : arrêt au 1er feu 1',
			curve:{
				points:[{x:-24.75,z:-19.8},{x:-17.57,z:-3.31},{x:-16.05,z:.95},{x:-17.72,z:3.79},{x:-22.18,z:9.99},{x:-27.1,z:15.5}],
				spline:undefined
			},
			tweens:[
				{to:.15,duration:6000,easing:Power0.easeNone,delay:0,ending:false},
				{to:.22,duration:19000,easing:Expo.easeOut,delay:0,ending:false},
				{to:.35,duration:8000,easing:Expo.easeIn,delay:0,ending:false},
				{to:1,duration:11000,easing:Power0.easeNone,delay:0,ending:true}
			],
			tweensArray:[],
			begin:0
		},
		{
			pathDescription:'bvd lices > amiral galibert : arrêt au 1er feu 2',
			curve:{
				points:[{x:-24.75,z:-19.8},{x:-17.57,z:-3.31},{x:-16.05,z:.95},{x:-17.72,z:3.79},{x:-22.18,z:9.99},{x:-27.1,z:15.5}],
				spline:undefined
			},
			tweens:[
				{to:1,duration:2000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.15,duration:6000,easing:Power0.easeNone,delay:0,ending:false},
				{to:.202,duration:19000,easing:Expo.easeOut,delay:0,ending:false},
				{to:.332,duration:8000,easing:Expo.easeIn,delay:0,ending:false},
				{to:.9,duration:9000,easing:Power0.easeNone,delay:0,ending:false}
			],
			tweensArray:[],
			begin:.9
		},
		{
			pathDescription:'bvd lices > foch > pont, voie droite 1',
			curve:{
				points:[
					{x:-24.75,y:0,z:-19.8},{x:-23.03,y:0,z:-15.88},{x:-21.23,y:0,z:-11.75},{x:-19.57,y:0,z:-7.84},{x:-17.58,y:0,z:-3.31},
					{x:-15.5,y:0,z:1.02},{x:-12.88,y:0,z:3.48},{x:-9.02,y:0,z:6.38},{x:-5.57,y:0,z:8.91},{x:-2.1,y:0,z:11.48},
					{x:.98,y:0,z:13.76},{x:5,y:0,z:14.16},{x:10.53,y:0,z:14.16},{x:14.29,y:0,z:14.57},{x:16.30,y:0,z:17.37},{x:17.4,y:0,z:21.4},
					{x:20.17,y:0,z:24.76}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:28000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.4,duration:16000,easing:Power0.easeNone,delay:0,ending:false}
			],
			tweensArray:[],
			begin:.4
		},
		{
			pathDescription:'bvd lices > foch > pont, voie droite 2',
			curve:{
				points:[
					{x:-24.75,y:0,z:-19.8},{x:-23.03,y:0,z:-15.88},{x:-21.23,y:0,z:-11.75},{x:-19.57,y:0,z:-7.84},{x:-17.58,y:0,z:-3.31},
					{x:-15.5,y:0,z:1.02},{x:-12.88,y:0,z:3.48},{x:-9.02,y:0,z:6.38},{x:-5.57,y:0,z:8.91},{x:-2.1,y:0,z:11.48},
					{x:.98,y:0,z:13.76},{x:5,y:0,z:14.16},{x:10.53,y:0,z:14.16},{x:14.29,y:0,z:14.57},{x:16.30,y:0,z:17.37},{x:17.4,y:0,z:21.4},
					{x:20.17,y:0,z:24.76}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:34000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.2,duration:10000,easing:Power0.easeNone,delay:0,ending:false}
			],
			tweensArray:[],
			begin:.2
		},
		{
			pathDescription:'bvd lices > foch > pont, voie droite : arrêt au 2nd feu 1',
			curve:{
				points:[
					{x:-24.75,y:0,z:-19.8},{x:-23.03,y:0,z:-15.88},{x:-21.23,y:0,z:-11.75},{x:-19.57,y:0,z:-7.84},{x:-17.58,y:0,z:-3.31},
					{x:-15.5,y:0,z:1.02},{x:-12.88,y:0,z:3.48},{x:-9.02,y:0,z:6.38},{x:-5.57,y:0,z:8.91},{x:-2.1,y:0,z:11.48},
					{x:.98,y:0,z:13.76},{x:5,y:0,z:14.16},{x:10.53,y:0,z:14.16},{x:14.29,y:0,z:14.57},{x:16.30,y:0,z:17.37},{x:17.4,y:0,z:21.4},
					{x:20.17,y:0,z:24.76}
					],
				spline:undefined
			},
			tweens:[
				{to:.45,duration:12000,easing:Power0.easeNone,delay:0,ending:false},
				{to:.55,duration:18000,easing:Expo.easeOut,delay:0,ending:false},
				{to:.62,duration:15000,easing:Expo.easeIn,delay:6000,ending:false},
				{to:1,duration:14000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.1,duration:3000,easing:Power0.easeNone,delay:20000,ending:false}
			],
			tweensArray:[],
			begin:.1
		},
		{
			pathDescription:'bvd lices > foch > pont, voie droite : arrêt au 2nd feu 2',
			curve:{
				points:[
					{x:-24.75,y:0,z:-19.8},{x:-23.03,y:0,z:-15.88},{x:-21.23,y:0,z:-11.75},{x:-19.57,y:0,z:-7.84},{x:-17.58,y:0,z:-3.31},
					{x:-15.5,y:0,z:1.02},{x:-12.88,y:0,z:3.48},{x:-9.02,y:0,z:6.38},{x:-5.57,y:0,z:8.91},{x:-2.1,y:0,z:11.48},
					{x:.98,y:0,z:13.76},{x:5,y:0,z:14.16},{x:10.53,y:0,z:14.16},{x:14.29,y:0,z:14.57},{x:16.30,y:0,z:17.37},{x:17.4,y:0,z:21.4},
					{x:20.17,y:0,z:24.76}
					],
				spline:undefined
			},
			tweens:[
				{to:.41,duration:11500,easing:Power0.easeNone,delay:0,ending:false},
				{to:.532,duration:16000,easing:Power3.easeOut,delay:0,ending:false},
				{to:.602,duration:18500,easing:Expo.easeIn,delay:5000,ending:false},
				{to:1,duration:16000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.03,duration:1000,easing:Power0.easeNone,delay:20000,ending:false}
			],
			tweensArray:[],
			begin:.03
		},
		{
			pathDescription:'bvd lices > foch > pont, voie centrale 1',
			curve:{
				points:[
					{x:-24.29,y:0,z:-20.34},{x:-22.53,y:0,z:-16.21},{x:-20.75,y:0,z:-12.1},{x:-18.87,y:0,z:-7.74},{x:-16.94,y:0,z:-3.34},
					{x:-15.06,y:0,z:.72},{x:-12.40,y:0,z:3.13},{x:-8.42,y:0,z:6.04},{x:-5.15,y:0,z:8.43},{x:-1.6,y:0,z:11.1},
					{x:1.66,y:0,z:13.35},{x:4.82,y:0,z:13.57},{x:10.07,y:0,z:13.59},{x:14.36,y:0,z:14.07},{x:16.55,y:0,z:17.04},{x:17.71,y:0,z:21.04},
					{x:20.63,y:0,z:24.38}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:30000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.2,duration:14000,easing:Power0.easeNone,delay:0,ending:false}
			],
			tweensArray:[],
			begin:.2
		},
		{
			pathDescription:'bvd lices > foch > pont, voie centrale 2',
			curve:{
				points:[
					{x:-24.29,y:0,z:-20.34},{x:-22.53,y:0,z:-16.21},{x:-20.75,y:0,z:-12.1},{x:-18.87,y:0,z:-7.74},{x:-16.94,y:0,z:-3.34},
					{x:-15.06,y:0,z:.72},{x:-12.40,y:0,z:3.13},{x:-8.42,y:0,z:6.04},{x:-5.15,y:0,z:8.43},{x:-1.6,y:0,z:11.1},
					{x:1.66,y:0,z:13.35},{x:4.82,y:0,z:13.57},{x:10.07,y:0,z:13.59},{x:14.36,y:0,z:14.07},{x:16.55,y:0,z:17.04},{x:17.71,y:0,z:21.04},
					{x:20.63,y:0,z:24.38}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:23000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.35,duration:21000,easing:Power0.easeNone,delay:0,ending:false}
			],
			tweensArray:[],
			begin:.35
		},
		{
			pathDescription:'bvd lices > foch > pont, voie centrale : arrêt au 2nd feu 1',
			curve:{
				points:[
					{x:-24.29,y:0,z:-20.34},{x:-22.53,y:0,z:-16.21},{x:-20.75,y:0,z:-12.1},{x:-18.87,y:0,z:-7.74},{x:-16.94,y:0,z:-3.34},
					{x:-15.06,y:0,z:.72},{x:-12.40,y:0,z:3.13},{x:-8.42,y:0,z:6.04},{x:-5.15,y:0,z:8.43},{x:-1.6,y:0,z:11.1},
					{x:1.66,y:0,z:13.35},{x:4.82,y:0,z:13.57},{x:10.07,y:0,z:13.59},{x:14.36,y:0,z:14.07},{x:16.55,y:0,z:17.04},{x:17.71,y:0,z:21.04},
					{x:20.63,y:0,z:24.38}
					],
				spline:undefined
			},
			tweens:[
				{to:.49,duration:12000,easing:Power0.easeNone,delay:0,ending:false},
				{to:.544,duration:5000,easing:Power3.easeOut,delay:0,ending:false},
				{to:.62,duration:14000,easing:Expo.easeIn,delay:19000,ending:false},
				{to:1,duration:14000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.1,duration:3000,easing:Power0.easeNone,delay:21000,ending:false}
			],
			tweensArray:[],
			begin:.1
		},
		{
			pathDescription:'bvd lices > foch > pont, voie gauche : arrêt au 2nd feu 1',
			curve:{
				points:[
					{x:-23.88,y:0,z:-21.02},{x:-21.91,y:0,z:-16.43},{x:-20.15,y:0,z:-12.38},{x:-18.25,y:0,z:-7.92},{x:-16.36,y:0,z:-3.62},
					{x:-14.53,y:0,z:.39},{x:-11.19,y:0,z:3.25},{x:-7.97,y:0,z:5.6},{x:-4.84,y:0,z:7.87},{x:-1.06,y:0,z:10.66},{x:2.03,y:0,z:12.79},
					{x:5.29,y:0,z:12.95},{x:10.07,y:0,z:12.98},{x:14.64,y:0,z:13.53},{x:16.9,y:0,z:16.75},{x:17.95,y:0,z:20.66},{x:21.02,y:0,z:24.04}
					],
				spline:undefined
			},
			tweens:[
				{to:.49,duration:12000,easing:Power0.easeNone,delay:0,ending:false},
				{to:.54,duration:5000,easing:Power3.easeOut,delay:0,ending:false},
				{to:.62,duration:14000,easing:Expo.easeIn,delay:19000,ending:false},
				{to:1,duration:14000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.1,duration:3000,easing:Power0.easeNone,delay:21000,ending:false}
			],
			tweensArray:[],
			begin:.1
		},
		{
			pathDescription:'bvd lices > foch > mairie > renaissance > justice, voie gauche 1',
			curve:{
				points:[
					{x:-23.88,y:0,z:-21.02},{x:-21.91,y:0,z:-16.43},{x:-20.15,y:0,z:-12.38},{x:-18.25,y:0,z:-7.92},{x:-16.36,y:0,z:-3.62},
					{x:-14.53,y:0,z:.39},{x:-11.19,y:0,z:3.25},{x:-7.97,y:0,z:5.6},{x:-4.84,y:0,z:7.87},{x:-1.06,y:0,z:10.66},{x:2.03,y:0,z:12.79},
					{x:5.29,y:0,z:12.95},{x:10.07,y:0,z:12.98},{x:14,y:0,z:13.17},{x:16.35,y:0,z:14.94},{x:19,y:0,z:13.56},{x:19.49,y:0,z:9.96},
					{x:20,y:0,z:5.8},{x:20.64,y:0,z:.72},{x:21.21,y:0,z:-3.3},{x:21.51,y:0,z:-6.61},{x:18.4,y:0,z:-8.14},{x:12.38,y:0,z:-10.77},
					{x:7.32,y:0,z:-14.9},{x:4.31,y:0,z:-17.99},{x:2.44,y:0,z:-20.3},{x:-2.75,y:0,z:-23.78},{x:-8.34,y:0,z:-30.19}
					],
				spline:undefined
			},
			tweens:[
				{to:.28,duration:14000,easing:Power0.easeNone,delay:0,ending:false},
				{to:.31,duration:6000,easing:Power3.easeOut,delay:0,ending:false},
				{to:.34,duration:11000,easing:Expo.easeIn,delay:19000,ending:false},
				{to:1,duration:38000,easing:Power0.easeNone,delay:0,ending:true}
			],
			tweensArray:[],
			begin:0
		},// à régler après gambetta+sabatier
		{
			pathDescription:'sabatier > gambetta > albert I, aucun arrêt 1',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.28,y:0,z:4.56},{x:1.35,y:0,z:8.28},
					{x:-.83,y:0,z:11.66},{x:-3.78,y:0,z:14.08},{x:-6.77,y:0,z:16.01},{x:-9.87,y:0,z:18.18},{x:-13.64,y:0,z:20.58},{x:-16.51,y:0,z:22.4},
					{x:-19.83,y:0,z:24.49}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:44000,easing:Power0.easeNone,delay:0,ending:true}
			],
			tweensArray:[],
			begin:0
		},
		{
			pathDescription:'sabatier > gambetta > albert I, aucun arrêt 2',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.28,y:0,z:4.56},{x:1.35,y:0,z:8.28},
					{x:-.83,y:0,z:11.66},{x:-3.78,y:0,z:14.08},{x:-6.77,y:0,z:16.01},{x:-9.87,y:0,z:18.18},{x:-13.64,y:0,z:20.58},{x:-16.51,y:0,z:22.4},
					{x:-19.83,y:0,z:24.49}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:41000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.075,duration:3000,easing:Power0.easeNone,delay:0,ending:false},
			],
			tweensArray:[],
			begin:.075
		},
		{
			pathDescription:'sabatier > gambetta > albert I, aucun arrêt 3',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.28,y:0,z:4.56},{x:1.35,y:0,z:8.28},
					{x:-.83,y:0,z:11.66},{x:-3.78,y:0,z:14.08},{x:-6.77,y:0,z:16.01},{x:-9.87,y:0,z:18.18},{x:-13.64,y:0,z:20.58},{x:-16.51,y:0,z:22.4},
					{x:-19.83,y:0,z:24.49}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:43000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.05,duration:1000,easing:Power0.easeNone,delay:0,ending:false},
			],
			tweensArray:[],
			begin:.05
		},
		{
			pathDescription:'sabatier > gambetta > albert I, début au feu 1',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.28,y:0,z:4.56},{x:1.35,y:0,z:8.28},
					{x:-.83,y:0,z:11.66},{x:-3.78,y:0,z:14.08},{x:-6.77,y:0,z:16.01},{x:-9.87,y:0,z:18.18},{x:-13.64,y:0,z:20.58},{x:-16.51,y:0,z:22.4},
					{x:-19.83,y:0,z:24.49}
					],
				spline:undefined
			},
			tweens:[
				{to:.65,duration:5000,easing:Power3.easeIn,delay:18000,ending:false},
				{to:1,duration:15000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.55,duration:22000,easing:Power0.easeNone,delay:23000,ending:false},
				{to:.6,duration:5000,easing:Power3.easeOut,delay:0,ending:false},
			],
			tweensArray:[],
			begin:.6
		},
		{
			pathDescription:'sabatier > gambetta > albert I, arrêt au feu 2',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.28,y:0,z:4.56},{x:1.35,y:0,z:8.28},
					{x:-.83,y:0,z:11.66},{x:-3.78,y:0,z:14.08},{x:-6.77,y:0,z:16.01},{x:-9.87,y:0,z:18.18},{x:-13.64,y:0,z:20.58},{x:-16.51,y:0,z:22.4},
					{x:-19.83,y:0,z:24.49}
					],
				spline:undefined
			},
			tweens:[
				{to:.635,duration:5000,easing:Power3.easeIn,delay:18000,ending:false},
				{to:1,duration:16000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.535,duration:21000,easing:Power0.easeNone,delay:23000,ending:false},
				{to:.585,duration:5000,easing:Power3.easeOut,delay:0,ending:false},
			],
			tweensArray:[],
			begin:.585
		},
		{
			pathDescription:'sabatier > gambetta > albert I',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.28,y:0,z:4.56},{x:1.35,y:0,z:8.28},
					{x:-.83,y:0,z:11.66},{x:-3.78,y:0,z:14.08},{x:-6.77,y:0,z:16.01},{x:-9.87,y:0,z:18.18},{x:-13.64,y:0,z:20.58},{x:-16.51,y:0,z:22.4},
					{x:-19.83,y:0,z:24.49}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:6000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.8,duration:38000,easing:Power0.easeNone,delay:0,ending:false},
			],
			tweensArray:[],
			begin:.8
		},
		{
			pathDescription:'sabatier > gambetta > albert I',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.28,y:0,z:4.56},{x:1.35,y:0,z:8.28},
					{x:-.83,y:0,z:11.66},{x:-3.78,y:0,z:14.08},{x:-6.77,y:0,z:16.01},{x:-9.87,y:0,z:18.18},{x:-13.64,y:0,z:20.58},{x:-16.51,y:0,z:22.4},
					{x:-19.83,y:0,z:24.49}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:8000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.73,duration:36000,easing:Power0.easeNone,delay:0,ending:false},
			],
			tweensArray:[],
			begin:.73
		},
		{
			pathDescription:'sabatier > gambetta > albert I',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.28,y:0,z:4.56},{x:1.35,y:0,z:8.28},
					{x:-.83,y:0,z:11.66},{x:-3.78,y:0,z:14.08},{x:-6.77,y:0,z:16.01},{x:-9.87,y:0,z:18.18},{x:-13.64,y:0,z:20.58},{x:-16.51,y:0,z:22.4},
					{x:-19.83,y:0,z:24.49}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:0,easing:Power0.easeNone,delay:0,ending:true},
				{to:.55,duration:29000,easing:Power0.easeNone,delay:13000,ending:false},
				{to:.6,duration:6000,easing:Power3.easeOut,delay:0,ending:false},
				{to:.67,duration:6000,easing:Power3.easeIn,delay:15000,ending:false},
				{to:1,duration:15000,easing:Power0.easeNone,delay:0,ending:false},
				{to:1,duration:0,easing:Power0.easeNone,delay:3000,ending:false},
			],
			tweensArray:[],
			begin:1
		},
		{
			pathDescription:'sabatier > gambetta > foch > pont 1',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.34,y:0,z:4.74},{x:2.55,y:0,z:7.67},
					{x:.61,y:0,z:11.35},{x:2.77,y:0,z:13.8},{x:6.34,y:0,z:14.14},{x:10.53,y:0,z:14.16},{x:14.29,y:0,z:14.57},{x:16.30,y:0,z:17.37},
					{x:17.4,y:0,z:21.4},{x:20.17,y:0,z:24.76}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:5000,easing:Power0.easeNone,delay:0,ending:true},
				{to:.85,duration:39000,easing:Power0.easeNone,delay:0,ending:false},
			],
			tweensArray:[],
			begin:.85
		},
		{
			pathDescription:'sabatier > gambetta > foch > pont : arrêt au feu 1',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.34,y:0,z:4.74},{x:2.55,y:0,z:7.67},
					{x:.61,y:0,z:11.35},{x:2.77,y:0,z:13.8},{x:6.34,y:0,z:14.14},{x:10.53,y:0,z:14.16},{x:14.29,y:0,z:14.57},{x:16.30,y:0,z:17.37},
					{x:17.4,y:0,z:21.4},{x:20.17,y:0,z:24.76}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:0,easing:Power0.easeNone,delay:0,ending:true},
				{to:.53,duration:29000,easing:Power0.easeNone,delay:12000,ending:false},
				{to:.58,duration:6000,easing:Power3.easeOut,delay:0,ending:false},
				{to:.63,duration:6000,easing:Power3.easeIn,delay:15000,ending:false},
				{to:1,duration:15000,easing:Power0.easeNone,delay:0,ending:false},
				{to:1,duration:0,easing:Power0.easeNone,delay:4000,ending:false},
			],
			tweensArray:[],
			begin:.85
		},
		{
			pathDescription:'sabatier > gambetta > foch > pont : arrêt au feu 1',
			curve:{
				points:[
					{x:15.91,y:0,z:-25.23},{x:15.43,y:0,z:-19.76},{x:14.87,y:0,z:-15.82},{x:14.43,y:0,z:-12.56},{x:13.74,y:0,z:-9.58},
					{x:12.25,y:0,z:-7.09},{x:10.59,y:0,z:-4.59},{x:8.62,y:0,z:-1.77},{x:6.56,y:0,z:1.2},{x:4.34,y:0,z:4.74},{x:2.55,y:0,z:7.67},
					{x:.61,y:0,z:11.35},{x:2.77,y:0,z:13.8},{x:6.34,y:0,z:14.14},{x:10.53,y:0,z:14.16},{x:14.29,y:0,z:14.57},{x:16.30,y:0,z:17.37},
					{x:17.4,y:0,z:21.4},{x:20.17,y:0,z:24.76}
					],
				spline:undefined
			},
			tweens:[
				{to:1,duration:0,easing:Power0.easeNone,delay:0,ending:true},
				{to:.52,duration:29000,easing:Power0.easeNone,delay:14000,ending:false},
				{to:.57,duration:6000,easing:Power3.easeOut,delay:0,ending:false},
				{to:.62,duration:6000,easing:Power3.easeIn,delay:15000,ending:false},
				{to:1,duration:15000,easing:Power0.easeNone,delay:0,ending:false},
				{to:1,duration:0,easing:Power0.easeNone,delay:2000,ending:false},
			],
			tweensArray:[],
			begin:.85
		},
	],
	parkedCars:[
		{x:5.43,z:2.11,rot:-34.5},{x:5.89,z:1.44,rot:-34.5},{x:6.96,z:1.37,rot:-34.5},{x:6.65,z:.32,rot:-34.5},{x:7.37,z:.73,rot:-34.5},
		{x:8.14,z:-.34,rot:-34.5},{x:7.36,z:-.72,rot:-34.5},{x:7.79,z:-1.34,rot:-34.5},{x:6.21,z:2.5,rot:-34.5},{x:5.77,z:3.12,rot:-34.5},
		{x:8.84,z:-1.41,rot:-34.5},//gambetta1
		{x:10.25,z:-3.38,rot:-33},{x:10.7,z:-4,rot:-33},{x:11.5,z:-5.3,rot:-35},{x:12,z:-6,rot:-34},{x:12.4,z:-6.6,rot:-32},{x:11.7,z:-7,rot:-32},
		{x:12.1,z:-7.6,rot:-32},{x:13,z:-7.6,rot:-32},{x:13.43,z:-8.3,rot:-32},{x:13.9,z:-9,rot:-32},{x:12.77,z:-8.7,rot:-32},
		{x:13.2,z:-9.3,rot:-29},//gambetta2
		{x:13.73,z:-10.9,rot:-11},{x:14.41,z:-10.75,rot:-11},{x:14.58,z:-11.47,rot:-11},{x:13.9,z:-11.62,rot:-11},{x:14.71,z:-12.21,rot:-11},
		{x:14.18,z:-13.09,rot:-8},{x:14.85,z:-13,rot:-8},{x:14.3,z:-14,rot:-8},{x:15,z:-13.9,rot:-8},{x:15.11,z:-14.66,rot:-11},
		{x:14.41,z:-14.76,rot:-7},{x:14.5,z:-15.5,rot:-5},{x:15.2,z:-15.4,rot:-6.6},{x:15.3,z:-16.15,rot:-9},{x:14.6,z:-16.25,rot:-9},
		{x:15.41,z:-16.88,rot:-9},{x:14.8,z:-17.71,rot:-9},{x:15.7,z:-19,rot:-6},{x:15,z:-19,rot:-6},{x:15.1,z:-19.9,rot:-5.3},
		{x:15.8,z:-19.8,rot:-5.3},{x:15.9,z:-21,rot:-6.5},{x:15.1,z:-20.5,rot:-5.5},{x:15.25,z:-21.5,rot:-5.5},{x:16,z:-21.5,rot:-6.3},
		{x:16.1,z:-22.1,rot:-3},{x:15.4,z:-23.2,rot:-3},//sabatier
		{x:10.7,z:.96,rot:-39.7},{x:11.19,z:.37,rot:-39.7},{x:12,z:1.43,rot:-10.2},{x:11.85,z:2.18,rot:-10.2},{x:11.76,z:2.96,rot:-.15},
		{x:12.87,z:4.17,rot:133},//around theater
		{x:1.04,z:-6.7,rot:63},{x:2.17,z:-6.3,rot:67},{x:3.15,z:-5.9,rot:68},{x:3.87,z:-5.6,rot:68},{x:-5.9,z:-9.5,rot:51},{x:-7,z:-10.3,rot:51},
		{x:-11.1,z:-12.6,rot:46},{x:-12.3,z:-13.5,rot:225},{x:-11.8,z:-13.9,rot:216},{x:-11.4,z:-15.2,rot:74},{x:-11.7,z:-15.7,rot:74},
		{x:-12.1,z:-16.25,rot:74},//l'edit
		{x:6.87,z:-11.96,rot:-95},{x:6.45,z:-11.04,rot:-95},{x:6.48,z:-10.45,rot:-95},{x:7.39,z:-11.36,rot:-25},//gabrielguy
		{x:-2.9,z:13.98,rot:-54},{x:-2.25,z:13.5,rot:-57},{x:-4.1,z:14.77,rot:-55},{x:-5.25,z:15.5,rot:-55},{x:-8.38,z:17.75,rot:-55},
		{x:-9.12,z:18.22,rot:-55},{x:-9.9,z:18.75,rot:-56},{x:-10.6,z:-19,rot:-56},{x:-11.54,z:19.8,rot:-56},{x:-12.2,z:20.2,rot:-56},
		{x:-13.1,z:20.77,rot:-56.5},{x:-13.76,z:21.21,rot:-56.5},{x:-14.75,z:21.82,rot:-59},{x:-15.41,z:22.2,rot:-57},
		{x:-16.6,z:23,rot:-56},{x:-17.25,z:23.5,rot:-56},{x:-17.9,z:23.8,rot:-56},{x:-18.9,z:24.5,rot:-56},//albertIer
		{x:-19,z:7.28,rot:-37},{x:-19.6,z:7.9,rot:-37},{x:-20.06,z:8.5,rot:-41},{x:-20.6,z:9.06,rot:-41},{x:-21.1,z:9.63,rot:-41.5},
		{x:-22.1,z:10.73,rot:-41.5},{x:-23.5,z:12.34,rot:-41.5},{x:-24.4,z:13.41,rot:-37.8},{x:-25,z:14,rot:-41},{x:-26,z:15,rot:-42.5},//north of albert I
		{x:-21.6,z:.2,rot:67},{x:-22.6,z:-.2,rot:67},{x:-23.6,z:-.6,rot:67},{x:-25.8,z:-1.5,rot:67},{x:-27,z:1.9,rot:67}
		//whats next is actually 70% hidden by frascaty trees so its not necessary now
		//{x:-27.7,z:-6.7,rot:-14.5},{x:-27.5,z:-7.6,rot:-12.5},{x:-28.6,z:-7.8,rot:-12.6},{x:-28.4,z:-8.7,rot:-12.6},{x:-27.3,z:-8.4,rot:-12.6},
		//{x:-27,z:-9.4,rot:-12.6},{x:-28.2,z:-9.7,rot:-12.6},{x:-26.9,z:-10.5,rot:-12.6},{x:-27.7,z:-11.9,rot:-12.6},{x:-26.6,z:-11.6,rot:-12.6},
		//{x:-26.4,z:-12.6,rot:-12.6},{x:-27.4,z:-12.9,rot:-12.6},{x:-27.2,z:-13.9,rot:-12.6},{x:-25.8,z:-14.9,rot:-12.6},{x:-26.7,z:-16.3,rot:-12.6}
	]
};