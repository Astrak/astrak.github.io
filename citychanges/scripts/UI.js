'use strict';

var UI={
	compassTween:true,
	viewMassPlan:false,
	viewFP:false,
	showInfos:false,
	showPLU:false,
	showCadastre:false,
    closeOtherInfosThan:function(arg){
        if(UI.showInfos!==arg&&UI.showInfos)UI.infos.close();
        if(UI.showPLU!==arg&&UI.showPLU)UI.PLU.close();
    },
    closeOtherViewsThan:function(arg){
        if(UI.showInfos!==arg&&UI.showInfos)UI.infos.close();
        if(UI.showPLU!==arg&&UI.showPLU)UI.PLU.close();
    },
	set:function(data){
		//Layout
		var UIContainer=document.createElement('div');
		var stepsContainer=document.createElement('div');
		var leftPanelContainer=document.createElement('div');
		var rightPanelContainer=document.createElement('div');
		UIContainer.id='UIContainer';
		UIContainer.className='extendON';
		stepsContainer.id='stepsContainer';
		leftPanelContainer.id='leftPanelContainer';
		rightPanelContainer.id='rightPanelContainer';
		leftPanelContainer.className=rightPanelContainer.className='panelContainer';
		leftPanelContainer.innerHTML=rightPanelContainer.innerHTML=stepsContainer.innerHTML="<p class=panel-title></p><span class=valign-panel></span>";
		rightPanelContainer.firstElementChild.innerHTML='Informations';
		stepsContainer.firstElementChild.innerHTML='Etapes';
		leftPanelContainer.firstElementChild.innerHTML='Contrôles';
		UIContainer.appendChild(leftPanelContainer);
		UIContainer.appendChild(stepsContainer);
		UIContainer.appendChild(rightPanelContainer);
		canvasContainer.appendChild(UIContainer);
		//prevent controls update when clicking the UI
		UIContainer.addEventListener('click',function(e){e.stopPropagation()},false);

        this.extend.appendTo(UIContainer);

		//Append infos buttons
		this.infos.appendTo(rightPanelContainer);
        this.traffic.appendTo(rightPanelContainer);
        this.PLU.appendTo(rightPanelContainer);
        this.cadastre.appendTo(rightPanelContainer);

		//Append views buttons
        this.compass.appendTo(leftPanelContainer);
        this.walk.appendTo(leftPanelContainer);
		this.massPlan.appendTo(leftPanelContainer);
		this.geol.appendTo(leftPanelContainer);
        this.animation.appendTo(leftPanelContainer);
	    
	    //Steps
	    this.stepsUI.set(stepsContainer,data);
	},
    stepsUI:{
        actualStep:0,
    	set:function(stepsContainer,data){
	        var stepsLength=steps.length;
	        var sliderContainer=document.createElement('div');
	        sliderContainer.id='gambetta-sliderContainer';
	        var slider=document.createElement('div');
	        slider.id='gambetta-slider';
	        stepsContainer.appendChild(sliderContainer);
	        sliderContainer.appendChild(slider);
	        for(var i=0;i<stepsLength;i++){
	            var dateFrom=document.createElement('p');dateFrom.innerHTML=steps[i].dateFrom;
	            var dateTo=document.createElement('p');dateTo.innerHTML=steps[i].dateTo;
	            dateFrom.className=dateTo.className='slider-stepDate';
	            var title=document.createElement('p');title.innerHTML=steps[i].title;
	            title.className='slider-stepTitle';
	            var description=document.createElement('p');description.innerHTML=steps[i].description;
	            description.className='slider-stepDescription';
	            var step=document.createElement('div');
	            step.className='slider-step';
	            var infos=document.createElement('div');
	            infos.className='slider-stepMain';
	            infos.appendChild(title);infos.appendChild(description);
	            step.appendChild(dateFrom);step.appendChild(infos);step.appendChild(dateTo);
	            slider.appendChild(step);
	        }
	        var valign=document.createElement('span');
	        valign.className='valign-sliderStep';
	        slider.appendChild(valign);
	        var buttonBefore=document.createElement('span');
	        var buttonAfter=document.createElement('span');
	        buttonBefore.className=buttonAfter.className='slider-buttons';
	        buttonBefore.id='buttonBefore';buttonAfter.id='buttonAfter';
	        sliderContainer.appendChild(buttonBefore);
	        sliderContainer.appendChild(buttonAfter);

	        buttonBefore.addEventListener('click',oneStepBefore,false);
	        buttonAfter.addEventListener('click',oneStepBeyond,false);
	        window.addEventListener('resize',function(){
                UI.stepsUI.resizeStepContainer(stepsContainer,slider)
            },false);

            function oneStepBeyond(e){
                e.stopPropagation();
                if(UI.stepsUI.actualStep<(steps.length-1)){
                    UI.stepsUI.actualStep+=1;
                    var stepsContainerWidth=parseInt(getComputedStyle(stepsContainer,null).width)+10;
                    slider.style.left=-(stepsContainerWidth-10)*UI.stepsUI.actualStep+'px';
                    buttonAfter.style.borderLeftColor=UI.stepsUI.actualStep==(steps.length-1)?'#555':'wheat';
                    buttonBefore.style.borderRightColor=UI.stepsUI.actualStep==0?'#555':'wheat';
                    for(var i=0;i<data.meshes.length;i++){
                        var mesh=data.meshes[i];
                        if(mesh.userData.steps[UI.stepsUI.actualStep]==true&&mesh.userData.steps[UI.stepsUI.actualStep-1]==false)UI.stepsUI.addMesh(mesh);
                        if(mesh.userData.steps[UI.stepsUI.actualStep]==false&&mesh.userData.steps[UI.stepsUI.actualStep-1]==true)UI.stepsUI.removeMesh(mesh);
                    }
                }
            }

            function oneStepBefore(e){
                e.stopPropagation();
                if(UI.stepsUI.actualStep>0){
                    UI.stepsUI.actualStep-=1;
                    var stepsContainerWidth=parseInt(getComputedStyle(stepsContainer,null).width)+10;
                    slider.style.left=-(stepsContainerWidth-10)*UI.stepsUI.actualStep+'px';
                    buttonBefore.style.borderRightColor=UI.stepsUI.actualStep==0?'#555':'wheat';
                    buttonAfter.style.borderLeftColor=UI.stepsUI.actualStep==(steps.length-1)?'#555':'wheat';
                    for(var i=0;i<data.meshes.length;i++){
                        var mesh=data.meshes[i];
                        if(mesh.userData.steps[UI.stepsUI.actualStep]==true&&mesh.userData.steps[UI.stepsUI.actualStep+1]==false)UI.stepsUI.addMesh(mesh);
                        if(mesh.userData.steps[UI.stepsUI.actualStep]==false&&mesh.userData.steps[UI.stepsUI.actualStep+1]==true)UI.stepsUI.removeMesh(mesh);
                    }
                }
            }
	    },
	    addMesh:function(mesh){
            if(mesh.material.depthTest==false)return;//dont add commercesdepth now
            scene.add(mesh);
            mesh.material.transparent=true;
            mesh.material.opacity=0;
            mesh.material.color.set(0x00ff00)
            TweenLite.to(mesh.material,.7,{
            	opacity:1,
            	onComplete:function(){
        			mesh.material.transparent=false;
        			mesh.material.color.set(0xffffff)
            	}
            });
	    },
	    removeMesh:function(mesh){
            mesh.material.transparent=true;
            mesh.material.color.set(0xff0000)
            TweenLite.to(mesh.material,.7,{
            	opacity:0,
            	onComplete:function(){scene.remove(mesh)}
            });
        },
        resizeStepContainer:function(stepsContainer,slider){
            var stepsContainerWidth=parseInt(getComputedStyle(stepsContainer,null).width)+10;
            slider.style.left=-(stepsContainerWidth-10)*UI.stepsUI.actualStep+'px';
        }
    },
    extend:{
        appendTo:function(UIContainer){
            var span=document.createElement('span');
            span.id='extendON';
            UIContainer.appendChild(span);
            span.addEventListener('click',function(e){
                e.stopPropagation();
                UI.compass.updateCompass=!UI.compass.updateCompass;
                if(span.id=='extendOFF'){
                    span.id=UIContainer.className='extendON';
                }else{
                    span.id=UIContainer.className='extendOFF';
                }
            },false);
        }
    },
    compass:{
        updateCompass:false,
        appendTo:function(container){
            UI.compass.compassRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
            UI.compass.compassRenderer.setSize(40,40);
            UI.compass.compassRenderer.domElement.className='item ready';
            
            UI.compass.compassScene=new THREE.Scene();
            UI.compass.compassCamera=new THREE.PerspectiveCamera(70,50/50,.1,100);
            var compass=this.createMesh();
            UI.compass.compassScene.add(compass,UI.compass.compassCamera);
            UI.compass.updateCompass=true;
            
            UI.compass.compassRenderer.domElement.addEventListener('click',function(){
                if(UI.viewMassPlan)return;
                var pos={x:0,y:12,z:23};
                if(camera.position.x==pos.x&&camera.position.y==pos.y&&camera.position.z==pos.z || camera instanceof THREE.OrthographicCamera )return;
                TweenLite.to(camera.position,.7,{x:pos.x,y:pos.y,z:pos.z});
            },false);
        
            container.appendChild(UI.compass.compassRenderer.domElement);
        },
        createMesh:function(){
            var _innerRadius=.25;
            var innerX=Math.cos(Math.PI/4)*_innerRadius;
            var innerY=Math.sin(Math.PI/4)*_innerRadius;
            var _height=.2;
            var _color=0xffffff;
            var material=new THREE.MeshBasicMaterial({color:_color,side:THREE.DoubleSide});
            //first cross
            var firstCross=new THREE.Geometry(),
                vertices=[],faces=[];
            vertices.push(
                {x:0,y:_height,z:0},
                {x:innerX,y:0,z:-innerY},
                {x:1,y:0,z:0},{x:innerX,y:0,z:innerY},
                {x:0,y:0,z:1},{x:-innerX,y:0,z:innerY},
                {x:-1,y:0,z:0},{x:-innerX,y:0,z:-innerY}
            );
            faces.push(
                {a:0,b:1,c:2},{a:0,b:2,c:3},{a:0,b:3,c:4},{a:0,b:4,c:5},{a:0,b:5,c:6},{a:0,b:6,c:7},
                {a:1,b:2,c:3},{a:3,b:4,c:5},{a:5,b:6,c:7},{a:1,b:5,c:3},{a:1,b:7,c:5}
            );
            var vLength=vertices.length,fLength=faces.length;
            for(var i=0;i<vLength;i++){
                var v=vertices[i];
                firstCross.vertices.push(new THREE.Vector3(v.x,v.y,v.z));
            }
            for(var i=0;i<fLength;i++){
                var f=faces[i];
                firstCross.faces.push(new THREE.Face3(f.a,f.b,f.c));
            }
            var firstCross=new THREE.Mesh(firstCross,material);
            
            //north tail
            var northTailGeo=new THREE.Geometry(),
                vertices=[],faces=[];
            vertices.push(
                {x:0,y:_height,z:0},
                {x:-innerX,y:0,z:-innerY},
                {x:0,y:0,z:-1},{x:innerX,y:0,z:-innerY}
            );
            faces.push(
                {a:0,b:1,c:2},{a:0,b:2,c:3},{a:2,b:3,c:1}
            );
            var vLength=vertices.length,fLength=faces.length;
            for(var i=0;i<vLength;i++){
                var v=vertices[i];
                northTailGeo.vertices.push(new THREE.Vector3(v.x,v.y,v.z));
            }
            for(var i=0;i<fLength;i++){
                var f=faces[i];
                northTailGeo.faces.push(new THREE.Face3(f.a,f.b,f.c));
            }
            var northTail=new THREE.Mesh(northTailGeo,new THREE.MeshBasicMaterial({color:0xff0000,side:THREE.DoubleSide}));
            firstCross.add(northTail);
            //second cross
            var secondCrossGeo=new THREE.Geometry(),
                vertices=[],faces=[];
            vertices.push(
                {x:0,y:_height,z:0},
                {x:0,y:0,z:-1},{x:innerX,y:0,z:-innerY},
                {x:1,y:0,z:0},{x:innerX,y:0,z:innerY},
                {x:0,y:0,z:1},{x:-innerX,y:0,z:innerY},
                {x:-1,y:0,z:0},{x:-innerX,y:0,z:-innerY}
            );
            faces.push(
                {a:0,b:1,c:2},{a:0,b:2,c:3},{a:0,b:3,c:4},{a:0,b:4,c:5},{a:0,b:5,c:6},{a:0,b:6,c:7},
                {a:0,b:7,c:8},{a:0,b:8,c:1},{a:1,b:8,c:2},{a:7,b:6,c:8},{a:6,b:5,c:4},{a:4,b:3,c:2},{a:2,b:8,c:4},{a:4,b:8,c:6}
            );
            var vLength=vertices.length,fLength=faces.length;
            for(var i=0;i<vLength;i++){
                var v=vertices[i];
                secondCrossGeo.vertices.push(new THREE.Vector3(v.x,v.y,v.z));
            }
            for(var i=0;i<fLength;i++){
                var f=faces[i];
                secondCrossGeo.faces.push(new THREE.Face3(f.a,f.b,f.c));
            }
            var secondCross=new THREE.Mesh(secondCrossGeo,material);
            secondCross.rotation.y=Math.PI/4;
            secondCross.scale.set(.7,.7,.7);
            firstCross.add(secondCross);
            return firstCross;
        }
    },
    walk:{
        appendTo:function(container){
            var span=document.createElement('span');
            span.className='item';
            span.style.backgroundImage="url('img/walk.png')";

            var initialPos;

            //span.addEventListener('click',toggleWalk,false);

            function toggleWalk(){
                span.removeEventListener('click',toggleWalk,false);
                setTimeout(function(){span.addEventListener('click',toggleWalk,false)},2100);
                if(!walk){
                    //button style
                    span.style.cssText+='background-color:blue;';

                    //3D
                    controls.enabled=false;
                    initialPos={x:camera.position.x,y:camera.position.y,z:camera.position.z};
                    TweenLite.to(camera.position,2,{x:-1.89,y:.25,z:8.17,ease:Power2.easeOut,onComplete:function(){
                        walk=true;
                    }});
                    TweenLite.to(camera.up,2,{x:0,y:1,z:0,ease:Power2.easeOut});//if clicked from massplan view
                    TweenLite.to(camera,2,{fov:100,near:.1,ease:Power3.easeOut,onUpdate:function(){camera.updateProjectionMatrix()}});

                }else{

                    //button style
                    span.style.cssText="background-image:url('img/walk.png')";

                    //3D
                    walk=false;
                    TweenLite.to(camera.position,2,{x:initialPos.x,y:initialPos.y,z:initialPos.z,ease:Power2.easeInOut,onComplete:function(){
                        controls.enabled=true;
                    }});
                    TweenLite.to(camera,2,{fov:40,near:.4,ease:Power3.easeInOut,onUpdate:function(){camera.updateProjectionMatrix()}});
                }
            } 

            container.appendChild(span)
        }
    },
    traffic:{
        appendTo:function(container){
            var span=document.createElement('span');
            span.className='item not-ready';
            span.style.backgroundImage="url('img/car.png')";
            container.appendChild(span);
        }
    },
    geol:{
        appendTo:function(container){
            var span=document.createElement('span');
            span.className='item not-ready';
            span.style.backgroundImage="url('img/geol.png')";
            container.appendChild(span);
        }
    },
    massPlan:{
        appendTo:function(container){
            var span=document.createElement('span');
            span.className='item';
            span.style.backgroundImage="url('img/planmasse40.png')";

            var initialPos;

            span.addEventListener('click',cameraTransition,false);

            function cameraTransition(){
                span.removeEventListener('click',cameraTransition,false);
                setTimeout(function(){span.addEventListener('click',cameraTransition,false)},2100);
                if(!UI.viewMassPlan){
                    //button style
                    span.style.cssText+='background-color:blue;';

                    //3D
                    controls.maxDistance=100;
                    controls.enabled=false;
                    initialPos={x:camera.position.x,y:camera.position.y,z:camera.position.z};
                    TweenLite.to(camera.position,2,{x:0,y:100,z:0,ease:Power2.easeOut});
                    TweenLite.to(camera.up,2,{x:0,y:0,z:-1,ease:Power2.easeOut});
                    TweenLite.to(camera,2,{fov:13,ease:Power3.easeOut,onUpdate:function(){camera.updateProjectionMatrix()}});
                }else{
                    //button style
                    span.style.cssText="background-image:url('img/planmasse40.png')";

                    //3D
                    TweenLite.to(camera.position,2,{x:initialPos.x,y:initialPos.y,z:initialPos.z,ease:Power2.easeInOut,onComplete:function(){
                        controls.enabled=true;controls.maxDistance=25;
                    }});
                    TweenLite.to(camera.up,2,{x:0,y:1,z:0,ease:Power2.easeInOut});
                    TweenLite.to(camera,2,{fov:40,ease:Power3.easeInOut,onUpdate:function(){camera.updateProjectionMatrix()}});
                }
                UI.viewMassPlan=!UI.viewMassPlan;
            }
            
            container.appendChild(span)
        }
    },
    infos:{
    	appendTo:function(container){
	        var span=document.createElement('span');
	        span.className='item';
	        span.innerHTML='<p>i</p>';
	        span.style.cssText='font:italic 33px Times New Roman;color:#fff;';
	        span.firstElementChild.style.marginLeft='-2px';

            var raycaster= new THREE.Raycaster();
            var mouse = new THREE.Vector2();
            var INTERSECTED=null;
            var mouseMove=false;

	        span.addEventListener('click',function(e){
                e.stopPropagation();
                UI.closeOtherInfosThan(UI.showInfos);
                UI.showInfos=!UI.showInfos;
                if(UI.showInfos){
                    UI.closeOtherInfosThan(UI.showInfos);
                    setTimeout(function(){
                        window.addEventListener('mousemove',raycast,false);
                        window.addEventListener('click',displayInfos,false);
                        window.addEventListener('mousedown',checkMouseMove,true);
                    },200);//so if PLU was ON, it waits the PLU.OFF() to finish
                    this.style.cssText+='background:blue;';
                }else{
                    window.removeEventListener('mousemove',raycast,false);
                    window.removeEventListener('click',displayInfos,false);
                    window.removeEventListener('mousedown',checkMouseMove,true);
                    if(INTERSECTED)INTERSECTED.material.color.set(0xffffff);
                    INTERSECTED=null;
                    this.style.cssText='font:italic 33px Times New Roman;color:#fff;';
                    canvasContainer.style.cursor=camera instanceof THREE.PerspectiveCamera?'move':'auto';
                }
            },false);

            function raycast(e) {
                if(!mouseMove){
                    mouse.x=(e.clientX/window.innerWidth)*2-1;
                    mouse.y=-(e.clientY/window.innerHeight)*2+1;
                    raycaster.setFromCamera( mouse, camera );
                    var interest=false;
                    var intersects = raycaster.intersectObjects( scene.children );
                    for(var i=0;i<intersects.length;i++){
                        if(intersects[i].object.userData!=undefined){
                            if(intersects[i].object.userData.infos!=undefined){
                                interest=i;break
                            }
                        }
                    }
                    if(interest!==false){
                        if(INTERSECTED){
                            if(INTERSECTED===intersects[interest].object)return;
                            INTERSECTED.material.color.set(0xffffff);
                        }
                        INTERSECTED=intersects[interest].object;
                        INTERSECTED.material.color.set(0xaaaaff);
                        canvasContainer.style.cursor='pointer';
                    }else{
                        if(INTERSECTED)INTERSECTED.material.color.set(0xffffff);
                        INTERSECTED=null;
                        canvasContainer.style.cursor=camera instanceof THREE.PerspectiveCamera?'move':'auto';
                    }
                }
            }
            function displayInfos(){
                if(INTERSECTED && INTERSECTED.userData.infos!=undefined && !mouseMove){
                    
                    INTERSECTED.material.color.set(0xaaaaff);//for mobile devices where there is no mousemove
                    window.removeEventListener('click',displayInfos,false)
                    
                    var div=document.createElement('div');
                    var greyScreen2=document.createElement('div');
                    var close=document.createElement('button');
                    
                    greyScreen2.className='greyScreen';
                    div.className='display-infos';
                    close.className='display-infos-button';
                    
                    div.innerHTML="<h3 class='display-infos-title'>"+INTERSECTED.userData.infos.title+
                        "</h3><br/><br/><p class='display-infos-description'>"+INTERSECTED.userData.infos.description+"</p>";
                    close.innerHTML='close';
                    
                    div.appendChild(close);
                    greyScreen2.appendChild(div);
                    document.body.appendChild(greyScreen2);
                    
                    close.addEventListener('click',function(e){
                        e.stopPropagation();
                        document.body.removeChild(greyScreen2);
                        setTimeout(function(){window.addEventListener('click',displayInfos,false)},0);
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
                if(canvasContainer.style.cursor==='pointer'){
                    canvasContainer.style.cursor=camera instanceof THREE.PerspectiveCamera?'move':'auto';
                }
                mouseMove=true;
            }
            function checkMouseUp(){
                setTimeout(function(){
                    mouseMove=false;
                    if(INTERSECTED)canvasContainer.style.cursor='pointer';
                },0);
                window.removeEventListener('mouseup',checkMouseUp,true);
                window.removeEventListener('mousemove',mouseMoveTrue,true);
                window.addEventListener('mousedown',checkMouseMove,true);
            }
            this.close=function(){
                window.removeEventListener('mousedown',checkMouseMove,true);
                window.removeEventListener('mousemove',raycast,false)
                window.removeEventListener('click',displayInfos,false)
                if(INTERSECTED)INTERSECTED.material.color.set(0xffffff);
                INTERSECTED=null;
                span.style.cssText='font:italic 33px Times New Roman;color:#fff;';
                canvasContainer.style.cursor=camera instanceof THREE.PerspectiveCamera?'move':'auto';
                UI.showInfos=false;
            }
            
            container.appendChild(span);
        }
    },
    cadastre:{
        appendTo:function(container){
            var span=document.createElement('span');
            span.className='item not-ready cadastre';
            
            var p=document.createElement('p');
            p.style.cssText='margin-top:13px;font:normal 10px Arial;color:#fff';
            p.innerHTML='Cadastre';
            span.appendChild(p);
            
            container.appendChild(span);
        }
    },
    animation:{
        appendTo:function(container){
            var span=document.createElement('span');
            span.className='item not-ready';
            span.id='play';
            container.appendChild(span)
        }
    },
    PLU:{
    	infos:{
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
    	},
    	appendTo:function(container){
		    var span=document.createElement('span');
		    span.className='item';
		    span.innerHTML='<p>PLU</p>';
		    span.style.font='normal 12px Arial';
		    span.style.color='#fff';
		    span.firstElementChild.style.marginTop='13px';

            this.PLUAreas=this.createPLU();
            
            var PLU_raycaster= new THREE.Raycaster();
            var PLU_mouse = new THREE.Vector2();
            var PLU_INTERSECTED=null;
            var mouseMove=false;
		    
		    span.addEventListener('click',function(e){
		        e.stopPropagation();
		        UI.closeOtherInfosThan(UI.showPLU);
		        UI.showPLU=!UI.showPLU;
		        if(UI.showPLU){
		            UI.PLU.PLUAreas.UA.ON();UI.PLU.PLUAreas.UAa.ON();UI.PLU.PLUAreas.UB.ON();
		            span.style.cssText+='background:blue;';
		            setTimeout(function(){
		                window.addEventListener('mousemove',PLU_raycast,false);
		                window.addEventListener('click',PLU_displayInfos,false);
		                window.addEventListener('mousedown',checkMouseMove,true);
		            },200)//so PLU animation finishes before
		        }else{
		            UI.PLU.PLUAreas.UA.OFF();UI.PLU.PLUAreas.UAa.OFF();UI.PLU.PLUAreas.UB.OFF();
		            window.removeEventListener('mousemove',PLU_raycast,false);
		            window.removeEventListener('click',PLU_displayInfos,false);
		            window.removeEventListener('mousedown',checkMouseMove,true);
		            if(PLU_INTERSECTED)PLU_INTERSECTED.material.color.set(0x555588);
		            PLU_INTERSECTED=null;
		            span.style.cssText='font:normal 12px Arial;color:#fff';
		            canvasContainer.style.cursor=camera instanceof THREE.PerspectiveCamera?'move':'auto';
		        }
		    },false);

            function PLU_raycast(e){
                if(!mouseMove){
                    PLU_mouse.x=(e.clientX/window.innerWidth)*2-1;
                    PLU_mouse.y=-(e.clientY/window.innerHeight)*2+1;
                    PLU_raycaster.setFromCamera( PLU_mouse, camera );
                    var intersects = PLU_raycaster.intersectObjects( scene.children );
                    var interest=false;
                    for(var i=0;i<intersects.length;i++){
                        if(intersects[i].object.userData!=undefined){
                            if(intersects[i].object.userData.PLU!=undefined){
                                interest=i;break
                            }
                        }
                    }
                    if(interest!==false){
                        if(PLU_INTERSECTED){
                            if(PLU_INTERSECTED===intersects[interest].object)return;
                            PLU_INTERSECTED.material.color.set(0x333366);
                        }
                        PLU_INTERSECTED=intersects[interest].object;
                        PLU_INTERSECTED.material.color.set(0x555588);
                        canvasContainer.style.cursor='pointer';
                    }else{
                        if(PLU_INTERSECTED)PLU_INTERSECTED.material.color.set(0x333366);
                        PLU_INTERSECTED=null;
                        canvasContainer.style.cursor=camera instanceof THREE.PerspectiveCamera?'move':'auto';
                    }
                }
            }
            function PLU_displayInfos(){
                if(PLU_INTERSECTED&&!mouseMove){
                    
                    PLU_INTERSECTED.material.color.set(0x555588);//for mobile devices where there is no mousemove
                    window.removeEventListener('click',PLU_displayInfos,false)
                    
                    var div=document.createElement('div');
                    var greyScreen2=document.createElement('div');
                    var close=document.createElement('button');
                    
                    greyScreen2.className='greyScreen';
                    div.className='display-infos';
                    close.className='display-infos-button';
                    
                    div.innerHTML="<h3 class='display-infos-title'>"+PLU_INTERSECTED.userData.PLU.title+
                        "</h3><br/><br/><p class='display-infos-description'>"+PLU_INTERSECTED.userData.PLU.description+"</p>";
                    close.innerHTML='close';
                    
                    div.appendChild(close);
                    greyScreen2.appendChild(div);
                    document.body.appendChild(greyScreen2);
                    
                    close.addEventListener('click',function(e){
                        e.stopPropagation();
                        document.body.removeChild(greyScreen2);
                        setTimeout(function(){window.addEventListener('click',PLU_displayInfos,false)},0);
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
                if(canvasContainer.style.cursor==='pointer')canvasContainer.style.cursor=camera instanceof THREE.PerspectiveCamera?'move':'auto';
            }
            function checkMouseUp(){
                setTimeout(function(){
                    mouseMove=false;
                    if(PLU_INTERSECTED)canvasContainer.style.cursor='pointer';
                },0);
                window.removeEventListener('mouseup',checkMouseUp,true);
                window.removeEventListener('mousemove',mouseMoveTrue,true);
                window.addEventListener('mousedown',checkMouseMove,true);
            }

            this.close=function(){
                if(UI.showPLU){
                    UI.showPLU=false;
                    UI.PLU.PLUAreas.UA.OFF();UI.PLU.PLUAreas.UAa.OFF();UI.PLU.PLUAreas.UB.OFF();
                }
                window.removeEventListener('mousemove',PLU_raycast,false);
                window.removeEventListener('click',PLU_displayInfos,false);
                window.removeEventListener('mousedown',checkMouseMove,true);
                span.style.cssText='font:normal 12px Arial;color:#fff';
                if(PLU_INTERSECTED)PLU_INTERSECTED.material.color.set(0x333366);
                PLU_INTERSECTED=null;
                canvasContainer.style.cursor=camera instanceof THREE.PerspectiveCamera?'move':'auto';
            }

            container.appendChild(span);
    	},
        createPLU:function(){
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
            UAMesh.userData={PLU:this.infos.UA};
            UAMesh.name="UA";
            var UASprite=makeTextSprite('UA');
            UASprite.position.set(2,2.5,-12);
            UAMesh.add(UASprite);
            UAMesh.scale.y=.01;
            var UA={
                mesh:UAMesh,
                ON:function(){
                    scene.add(UAMesh);
                    TweenLite.to(UAMesh.scale,.7,{y:1});
                    TweenLite.to(UAMesh.material,.7,{opacity:.6});
                },
                OFF:function(){
                    TweenLite.to(UAMesh.scale,.7,{y:.05,onComplete:function(){scene.remove(UAMesh)}});
                    TweenLite.to(UAMesh.material,.7,{opacity:0});
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
            UAaMesh.userData={PLU:this.infos.UAa};
            UAaMesh.name="UAa";
            var UAaSprite=makeTextSprite('UAa');
            UAaSprite.position.set(0,2.5,0);
            UAaMesh.add(UAaSprite);
            UAaMesh.scale.y=.01;
            var UAa={
                mesh:UAaMesh,
                ON:function(){
                    scene.add(UAaMesh);
                    TweenLite.to(UAaMesh.scale,.7,{y:1});
                    TweenLite.to(UAaMesh.material,.7,{opacity:.6});
                },
                OFF:function(){
                    TweenLite.to(UAaMesh.scale,.7,{y:.05,onComplete:function(){scene.remove(UAaMesh)}});
                    TweenLite.to(UAaMesh.material,.7,{opacity:0});
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
            UBMesh.userData={PLU:this.infos.UB};
            UBMesh.name="UB";
            var UBSprite=makeTextSprite('UB');
            UBSprite.position.set(4,2,16);
            UBMesh.add(UBSprite);
            UBMesh.scale.y=.01;
            var UB={
                mesh:UBMesh,
                ON:function(){
                    scene.add(UBMesh);
                    TweenLite.to(UBMesh.scale,.7,{y:1});
                    TweenLite.to(UBMesh.material,.7,{opacity:.6});
                },
                OFF:function(){
                    TweenLite.to(UBMesh.scale,.7,{y:.05,onComplete:function(){scene.remove(UBMesh)}});
                    TweenLite.to(UBMesh.material,.7,{opacity:0});
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
                        useScreenCoordinates:false,
                        depthTest:false
                        })
                    );
                sprite.material.map.offset.set(-.5,0);
                sprite.scale.set(10,5,5);
                return sprite;
            }
            
            return {UA:UA,UAa:UAa,UB:UB};
        }
    }
};