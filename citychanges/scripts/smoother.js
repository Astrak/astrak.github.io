var SMOOTHER=function(){
	var clock=new THREE.Clock();
	var frame=0;
	var max=0;
	var frequency=5;//seconds
	var pixelRatio=window.devicePixelRatio;

	var id=setInterval(setPixelRatio,frequency*1000);

	this.check=function(){
		frame+=1;
		max=Math.max(max,clock.getDelta()*1000);
	}

	function setPixelRatio(){
		console.log('last 5 stats : maximum render time = '+max.toString()+', total frmes rendered : '+(frame).toString() );
		if(max<50||frame>300){
			max=frame=0;
			return;
		}else {
			window.clearInterval(id);
			pixelRatio-=.05;
			renderer.setPixelRatio(pixelRatio);
			renderer.setSize(innerWidth,innerHeight);
			max=frame=0;
			console.warn('slow rendering detected : pixel ratio reduced')
			setTimeout(function(){
				console.log('stats restarted')
				id=setInterval(setPixelRatio,frequency*1000)
			},1000);
		}
	}

};