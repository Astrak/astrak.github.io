var TREES={
    addTrees:function addTrees(data){
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
        var ftree=new THREE.Mesh(fg,new THREE.MeshLambertMaterial({color:0x00aa00,shading:THREE.FlatShading}))
        
        //clone to each coordinates and scale
        var geometry=new THREE.Geometry();
        var fgeometry=new THREE.Geometry();
        var l=this.coordinates.length;
        for(var i=0;i<l;i++){
            var treeY=this.coordinates[i].y+(this.coordinates[i].scaleY-1)*2.5/2;

            tree.position.set(this.coordinates[i].x,treeY+.5,this.coordinates[i].z);
            ftree.position.set(this.coordinates[i].x,treeY+.5,this.coordinates[i].z);

            tree.scale.set(this.coordinates[i].scaleX,this.coordinates[i].scaleY,this.coordinates[i].scaleZ);
            ftree.scale.set(this.coordinates[i].scaleX,this.coordinates[i].scaleY,this.coordinates[i].scaleZ);

            tree.rotation.y+=Math.random()*Math.PI*2;
            ftree.rotation.y+=Math.random()*Math.PI*2;
            
            tree.updateMatrixWorld();
            ftree.updateMatrixWorld();

            geometry.merge(tree.geometry.clone(),tree.matrixWorld);
            fgeometry.merge(ftree.geometry.clone(),ftree.matrixWorld);
        }
        var mesh=new THREE.Mesh(geometry,m);
        var fmesh=new THREE.Mesh(fgeometry,ftree.material);
        fmesh.castShadow=fmesh.receiveShadow=true;
        TREES.mesh=mesh;
        TREES.fmesh=fmesh;
        scene.add(fmesh,mesh)
        fmesh.material.visible=false;
    },
    coordinates:[
        {x:6.5,y:.76,z:24.42,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-1.78,y:.76,z:9.38,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-2.65,y:.76,z:8.81,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-3.52,y:.76,z:8.21,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-4.34,y:.76,z:7.54,scaleX:1,scaleY:1,scaleZ:1},
        {x:-5.12,y:.76,z:7.07,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-5.97,y:.76,z:6.45,scaleX:1,scaleY:1,scaleZ:1},
        {x:-6.93,y:.76,z:5.87,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-7.78,y:.76,z:5.16,scaleX:1,scaleY:1,scaleZ:1},
        {x:-10.35,y:.76,z:3.3,scaleX:1,scaleY:1,scaleZ:1},
        {x:-10.68,y:.76,z:2.65,scaleX:1,scaleY:.9,scaleZ:1},
        {x:-12.99,y:.76,z:1.47,scaleX:1,scaleY:1,scaleZ:1},//front trees

        {x:-14.39,y:.76,z:2.77,scaleX:1,scaleY:1,scaleZ:1},
        {x:-13.52,y:.76,z:3.47,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-12.94,y:.76,z:3.94,scaleX:1,scaleY:.9,scaleZ:1},
        {x:-11.96,y:.76,z:4.73,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-10.56,y:.76,z:5.78,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-9.18,y:.76,z:6.76,scaleX:1,scaleY:1,scaleZ:1},
        {x:-8.1,y:.76,z:7.57,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-6.86,y:.76,z:8.51,scaleX:1,scaleY:1,scaleZ:1},
        {x:-5.6,y:.76,z:9.43,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-4.76,y:.76,z:10.05,scaleX:1,scaleY:.9,scaleZ:1},
        {x:-3.59,y:.76,z:10.89,scaleX:1,scaleY:1.1,scaleZ:1},//front of front trees

        {x:1.64,y:.76,z:11.61,scaleX:1,scaleY:1,scaleZ:1},
        {x:2.63,y:.76,z:12.57,scaleX:1,scaleY:.8,scaleZ:1},
        {x:4.06,y:.76,z:12.53,scaleX:1,scaleY:.8,scaleZ:1},
        {x:5.31,y:.76,z:12.48,scaleX:1,scaleY:.9,scaleZ:1},
        {x:6.45,y:.76,z:12.49,scaleX:1,scaleY:.7,scaleZ:1},
        {x:7.76,y:.76,z:12.48,scaleX:1,scaleY:.8,scaleZ:1},
        {x:8.73,y:.76,z:12.48,scaleX:1,scaleY:.9,scaleZ:1},
        {x:7.8,y:.76,z:11.36,scaleX:1,scaleY:.9,scaleZ:1},
        {x:8.98,y:.76,z:11.36,scaleX:1,scaleY:.7,scaleZ:1},
        {x:10.18,y:.76,z:11.36,scaleX:1,scaleY:.7,scaleZ:1},
        {x:12.35,y:.76,z:11.36,scaleX:1,scaleY:.7,scaleZ:1},
        {x:-1.1,y:.76,z:13.56,scaleX:1,scaleY:.8,scaleZ:1},
        {x:1.03,y:.76,z:14.6,scaleX:1,scaleY:.9,scaleZ:1},
        {x:4.94,y:.76,z:14.6,scaleX:1,scaleY:.8,scaleZ:1},
        {x:6.15,y:.76,z:14.6,scaleX:1,scaleY:.9,scaleZ:1},
        {x:7.22,y:.76,z:14.6,scaleX:1,scaleY:.7,scaleZ:1},
        {x:8.3,y:.76,z:14.6,scaleX:1,scaleY:.9,scaleZ:1},
        {x:9.27,y:.76,z:14.6,scaleX:1,scaleY:.8,scaleZ:1},
        {x:10.28,y:.76,z:14.6,scaleX:1,scaleY:.8,scaleZ:1},//eastern boulevard trees

        {x:-14.77,y:.76,z:-.94,scaleX:1,scaleY:1,scaleZ:1},
        {x:-15.44,y:.76,z:-2.29,scaleX:1,scaleY:1,scaleZ:1},
        {x:-16.15,y:.76,z:-3.85,scaleX:1,scaleY:1,scaleZ:1},
        {x:-16.58,y:.76,z:-4.77,scaleX:1,scaleY:1,scaleZ:1},
        {x:-17,y:.76,z:-5.65,scaleX:1,scaleY:1,scaleZ:1},
        {x:-17.44,y:.76,z:-6.64,scaleX:1,scaleY:1,scaleZ:1},
        {x:-17.92,y:.76,z:-7.71,scaleX:1,scaleY:1,scaleZ:1},
        {x:-18.47,y:.76,z:-9.06,scaleX:1,scaleY:1,scaleZ:1},
        {x:-18.96,y:.76,z:-10.44,scaleX:1,scaleY:1,scaleZ:1},
        {x:-19.29,y:.76,z:-10.96,scaleX:1,scaleY:1,scaleZ:1},
        {x:-20.13,y:.76,z:-13.14,scaleX:1,scaleY:1,scaleZ:1},
        {x:-20.85,y:.76,z:-15.05,scaleX:1,scaleY:1,scaleZ:1},
        {x:-21.6,y:.76,z:-17.1,scaleX:1,scaleY:1,scaleZ:1},
        {x:-22.62,y:.76,z:-19.1,scaleX:1,scaleY:1,scaleZ:1},
        {x:-23.3,y:.76,z:-20.76,scaleX:1,scaleY:1,scaleZ:1},
        {x:-22.62,y:.76,z:-19.1,scaleX:1,scaleY:1,scaleZ:1},
        {x:-24.6,y:.76,z:-18.2,scaleX:1,scaleY:1,scaleZ:1},
        {x:-24,y:.76,z:-16.8,scaleX:1,scaleY:1,scaleZ:1},
        {x:-23.15,y:.76,z:-15.15,scaleX:1,scaleY:1,scaleZ:1},
        {x:-22.44,y:.76,z:-13.5,scaleX:1,scaleY:1,scaleZ:1},
        {x:-21.79,y:.76,z:-12.1,scaleX:1,scaleY:1,scaleZ:1},
        {x:-21.17,y:.76,z:-10.75,scaleX:1,scaleY:1,scaleZ:1},
        {x:-20.47,y:.76,z:-9.19,scaleX:1,scaleY:1,scaleZ:1},
        {x:-20.16,y:.76,z:-8.27,scaleX:1,scaleY:1,scaleZ:1},
        {x:-19.75,y:.76,z:-7.39,scaleX:1,scaleY:1,scaleZ:1},
        {x:-19.31,y:.76,z:-6.4,scaleX:1,scaleY:1,scaleZ:1},
        {x:-18.82,y:.76,z:-5.34,scaleX:1,scaleY:1,scaleZ:1},
        {x:-18.27,y:.76,z:-3.98,scaleX:1,scaleY:1,scaleZ:1},
        {x:-17.45,y:.76,z:-2.08,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-17.69,y:.76,z:-2.6,scaleX:1,scaleY:1,scaleZ:1},//western boulevard trees

        {x:-23.9,y:.76,z:-9.41,scaleX:1,scaleY:.9,scaleZ:1},
        {x:-25.38,y:.76,z:-9.53,scaleX:1,scaleY:.7,scaleZ:1},
        {x:-25.18,y:.76,z:-8.52,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-25.52,y:.76,z:-7.19,scaleX:1,scaleY:1,scaleZ:1},
        {x:-23.06,y:.76,z:-11.87,scaleX:1,scaleY:.9,scaleZ:1},
        {x:-22.44,y:.76,z:-10.21,scaleX:1,scaleY:.7,scaleZ:1},
        {x:-22.26,y:.76,z:-8.77,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-22.27,y:.76,z:-7.75,scaleX:1,scaleY:1,scaleZ:1},
        {x:-21.3,y:.76,z:-7.06,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-20.82,y:.76,z:-6.09,scaleX:1,scaleY:.7,scaleZ:1},
        {x:-20.19,y:.76,z:-5.09,scaleX:1,scaleY:1,scaleZ:1},
        {x:-19.66,y:.76,z:-3.7,scaleX:1,scaleY:.9,scaleZ:1},
        {x:-19.15,y:.76,z:-2.33,scaleX:1,scaleY:1,scaleZ:1},
        {x:-18.6,y:.76,z:-1.85,scaleX:1,scaleY:1,scaleZ:1},
        {x:-23.8,y:.76,z:-5.92,scaleX:1,scaleY:.6,scaleZ:1},
        {x:-23.95,y:.76,z:-4.46,scaleX:1,scaleY:.7,scaleZ:1},
        {x:-23.33,y:.76,z:-4.07,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-22.8,y:.76,z:-3.84,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-22.25,y:.76,z:-3.47,scaleX:1,scaleY:1,scaleZ:1},
        {x:-21.72,y:.76,z:-3.2,scaleX:1,scaleY:1,scaleZ:1},
        {x:-20.9,y:.76,z:-2.9,scaleX:1,scaleY:1,scaleZ:1},
        {x:-19.86,y:.76,z:-1,scaleX:1,scaleY:1,scaleZ:1},
        {x:-20.69,y:.76,z:-1.34,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-21.54,y:.76,z:-1.84,scaleX:1,scaleY:1,scaleZ:1},
        {x:-22.54,y:.76,z:-2.23,scaleX:1,scaleY:1,scaleZ:1},
        {x:-23.65,y:.76,z:-2.63,scaleX:1,scaleY:1,scaleZ:1},
        {x:-25.03,y:.76,z:-3.17,scaleX:1,scaleY:1,scaleZ:1},//frascaty trees

        {x:-30.1,y:.76,z:-5.72,scaleX:1,scaleY:.8,scaleZ:1},
        {x:-29.8,y:.76,z:-7.45,scaleX:1,scaleY:1,scaleZ:1},
        {x:-29.2,y:.76,z:-9.4,scaleX:1,scaleY:1,scaleZ:1},
        {x:-28.8,y:.76,z:-11.36,scaleX:1,scaleY:1,scaleZ:1},
        {x:-28.05,y:.76,z:-13.38,scaleX:1,scaleY:1,scaleZ:1},//behind frascaty

        {x:-5.44,y:.76,z:10.6,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:-1.91,y:.76,z:-9.31,scaleX:.4,scaleY:.5,scaleZ:.4},
        {x:6.8,y:.76,z:-5.8,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:5.32,y:.76,z:-7.66,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:5,y:.76,z:-7.03,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:9.5,y:.76,z:8.94,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:10.52,y:.76,z:9.2,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:11.665,y:.76,z:9.2,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:12.3,y:.76,z:9.2,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:11.16,y:.76,z:10,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:5.88,y:.76,z:25.94,scaleX:1,scaleY:.9,scaleZ:1},
        {x:5.6,y:.76,z:24.73,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:10.23,y:.76,z:7.47,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:11.23,y:.76,z:7.64,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:11.76,y:.76,z:6.91,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:12.6,y:.76,z:7.59,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:13.41,y:.76,z:6.98,scaleX:.5,scaleY:.4,scaleZ:.5},//gardens & schools trees

        {x:-13.2,y:.76,z:-6.25,scaleX:1,scaleY:1.3,scaleZ:1},
        {x:-12.32,y:.76,z:-5.65,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-13.52,y:.76,z:-5.26,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-13.8,y:.76,z:-4.22,scaleX:1,scaleY:1.3,scaleZ:1},
        {x:-12.59,y:.76,z:-4.62,scaleX:1,scaleY:1.3,scaleZ:1},
        {x:-14.58,y:.76,z:-5.87,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-12.39,y:.76,z:-7.04,scaleX:1,scaleY:1.3,scaleZ:1},
        {x:-14.07,y:.76,z:-6.87,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-15,y:.76,z:-6.86,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-15.07,y:.76,z:-7.66,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-14.06,y:.76,z:-8.08,scaleX:1,scaleY:1.3,scaleZ:1},
        {x:-12.99,y:.76,z:-8.06,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-12.22,y:.76,z:-8.56,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-13.12,y:.76,z:-9.17,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-12.62,y:.76,z:-10.05,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-14.34,y:.76,z:-9.08,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-15.39,y:.76,z:-8.68,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-15.85,y:.76,z:-9.78,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-14.7,y:.76,z:-10.09,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-13.59,y:.76,z:-10.2,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-13.9,y:.76,z:-11.29,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-15.12,y:.76,z:-11.2,scaleX:1,scaleY:1.3,scaleZ:1},
        {x:-16.16,y:.76,z:-10.8,scaleX:1,scaleY:1.3,scaleZ:1},
        {x:-14.83,y:.76,z:-13.31,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-15.97,y:.76,z:-12.79,scaleX:1,scaleY:1.1,scaleZ:1},
        {x:-17.1,y:.76,z:-12,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-17.88,y:.76,z:-13.25,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-16.73,y:.76,z:-14,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-16.15,y:.76,z:-14.9,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-17.8,y:.76,z:-16,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-19,y:.76,z:-16.6,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-18,y:.76,z:-17.5,scaleX:1,scaleY:1.2,scaleZ:1},
        {x:-18.6,y:.76,z:-22.5,scaleX:1,scaleY:1.3,scaleZ:1},
        {x:-19.7,y:.76,z:-22,scaleX:1,scaleY:1.3,scaleZ:1},
        {x:-18.5,y:.76,z:-21.6,scaleX:1,scaleY:1.3,scaleZ:1},//boulevard parc trees

        {x:-9.7,y:.76,z:-22,scaleX:1,scaleY:.7,scaleZ:1},
        {x:-7.82,y:.76,z:-14.44,scaleX:1,scaleY:.7,scaleZ:1},
        {x:-8.26,y:.76,z:-13.7,scaleX:1,scaleY:.7,scaleZ:1},
        {x:2.3,y:.76,z:-28,scaleX:1,scaleY:.7,scaleZ:1},
        {x:19,y:.76,z:-2.86,scaleX:1,scaleY:.7,scaleZ:1},
        {x:19,y:.76,z:-1.8,scaleX:1,scaleY:.7,scaleZ:1},
        {x:16.3,y:.76,z:-3.65,scaleX:1,scaleY:.7,scaleZ:1},
        {x:17.95,y:.76,z:-4.25,scaleX:1,scaleY:.7,scaleZ:1},
        {x:16.53,y:.76,z:-5.08,scaleX:1,scaleY:.7,scaleZ:1},
        {x:16.35,y:.76,z:22.6,scaleX:1.3,scaleY:.7,scaleZ:1.3},
        {x:15.49,y:.76,z:26.1,scaleX:1.3,scaleY:.7,scaleZ:1.3},
        {x:18.92,y:.76,z:24.75,scaleX:1.3,scaleY:.7,scaleZ:1.3},//rest of the city trees : clockwise from west to west

        {x:-7,y:.76,z:20.2,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-9,y:.76,z:21.6,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-8.42,y:.76,z:24.85,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-8.5,y:.76,z:25.9,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-6.36,y:.76,z:25.9,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-11.83,y:.76,z:25.6,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-13.4,y:.76,z:25.6,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-11.14,y:.76,z:27.5,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-16.1,y:.76,z:25.73,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-15.86,y:.76,z:26.15,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-15.5,y:.76,z:26.5,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-11.26,y:.76,z:28.92,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-10.34,y:.76,z:28.4,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-9.55,y:.76,z:29.48,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-15,y:.76,z:26,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-14.64,y:.76,z:26.35,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-19.5,y:.76,z:17.41,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-18.73,y:.76,z:17.87,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-17.47,y:.76,z:16.31,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-16.95,y:.76,z:14.12,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-16.91,y:.76,z:9.15,scaleX:1.1,scaleY:.6,scaleZ:1.1},
        {x:-21.44,y:.76,z:6.36,scaleX:1.1,scaleY:.6,scaleZ:1.1},//south little gardens trees

        {x:-16.36,y:.76,z:26.62,scaleX:2,scaleY:1,scaleZ:2},
        {x:-10.21,y:.76,z:28.1,scaleX:2,scaleY:1,scaleZ:2},
        {x:-8.89,y:.76,z:28.16,scaleX:2,scaleY:1,scaleZ:2},
        {x:-13.6,y:.76,z:25.9,scaleX:.6,scaleY:.8,scaleZ:.6},
        {x:-11.73,y:.76,z:25.26,scaleX:.6,scaleY:1,scaleZ:.6},
        {x:-7,y:.76,z:28.2,scaleX:.6,scaleY:1,scaleZ:.6},
        {x:-7.63,y:.76,z:25.8,scaleX:.7,scaleY:.8,scaleZ:.7},
        {x:-14.75,y:.76,z:12.99,scaleX:.6,scaleY:1,scaleZ:.6},
        {x:-27.41,y:.76,z:12.07,scaleX:2,scaleY:1,scaleZ:2},
        {x:-26.62,y:.76,z:12.31,scaleX:2,scaleY:1,scaleZ:2},
        {x:-27.55,y:.76,z:12.64,scaleX:2,scaleY:1,scaleZ:2},//south taller or bigger gardens trees


        {x:21.19,y:.76,z:15.9,scaleX:2,scaleY:1,scaleZ:2},
        {x:21,y:.76,z:16.6,scaleX:2,scaleY:1,scaleZ:2},
        {x:20.4,y:.76,z:17.5,scaleX:2,scaleY:1,scaleZ:2},
        {x:20.3,y:.76,z:18.35,scaleX:2,scaleY:1,scaleZ:2},
        {x:20.3,y:.76,z:19.38,scaleX:2,scaleY:1,scaleZ:2},
        {x:19.8,y:.76,z:20.3,scaleX:2,scaleY:1,scaleZ:2},
        {x:20.1,y:.76,z:21.25,scaleX:2,scaleY:1,scaleZ:2},
        {x:20.84,y:.76,z:22,scaleX:2,scaleY:1,scaleZ:2},
        {x:23.8,y:.76,z:20.6,scaleX:2,scaleY:1,scaleZ:2},
        {x:22.3,y:.76,z:20.45,scaleX:2,scaleY:1,scaleZ:2},
        {x:21,y:.76,z:20.25,scaleX:2,scaleY:1,scaleZ:2},
        {x:21.8,y:.76,z:19.17,scaleX:2,scaleY:1,scaleZ:2},
        {x:22.6,y:.76,z:18.44,scaleX:2,scaleY:1,scaleZ:2},
        {x:26.2,y:.76,z:17.38,scaleX:2,scaleY:1,scaleZ:2},
        {x:24.8,y:.76,z:17.2,scaleX:2,scaleY:1,scaleZ:2},
        {x:23.4,y:.76,z:17.1,scaleX:2,scaleY:1,scaleZ:2},
        {x:22.4,y:.76,z:15.6,scaleX:2,scaleY:1,scaleZ:2},
        {x:23.85,y:.76,z:15.6,scaleX:2,scaleY:1,scaleZ:2},
        {x:25.82,y:.76,z:15.6,scaleX:2,scaleY:1,scaleZ:2},
        {x:19.65,y:.76,z:16,scaleX:2,scaleY:1,scaleZ:2},
        {x:19.4,y:.76,z:17.2,scaleX:2,scaleY:1,scaleZ:2},
        {x:19.2,y:.76,z:18.35,scaleX:2,scaleY:1,scaleZ:2},
        {x:19.14,y:.76,z:20.21,scaleX:2,scaleY:1,scaleZ:2},
        {x:27.73,y:.76,z:14.95,scaleX:2,scaleY:1,scaleZ:2},
        {x:27.25,y:.76,z:15.83,scaleX:2,scaleY:1,scaleZ:2},//lenotre kids big

        {x:20.9,y:.76,z:4.52,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.86,y:.76,z:5.02,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.81,y:.76,z:5.59,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.74,y:.76,z:6.17,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.72,y:.76,z:6.66,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.67,y:.76,z:7.27,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.58,y:.76,z:7.91,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.55,y:.76,z:8.49,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.34,y:.76,z:9.86,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.3,y:.76,z:10.43,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.21,y:.76,z:11.02,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.16,y:.76,z:11.6,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.12,y:.76,z:12.11,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.06,y:.76,z:12.66,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20,y:.76,z:13.33,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:20.02,y:.76,z:14.03,scaleX:.5,scaleY:.4,scaleZ:.5},//lenotre front

        {x:29.62,y:.1,z:4.23,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.52,y:.1,z:4.78,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.5,y:.1,z:5.56,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.5,y:.1,z:6.19,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.4,y:.1,z:6.85,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.3,y:.1,z:7.54,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.26,y:.1,z:8.18,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.17,y:.1,z:8.83,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.06,y:.1,z:9.73,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.05,y:.1,z:10.7,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.06,y:.1,z:11.57,scaleX:1.2,scaleY:.85,scaleZ:1.2},
        {x:29.05,y:.1,z:12.41,scaleX:1.2,scaleY:.85,scaleZ:1.2},//lenotre back haie

        {x:22.67,y:.76,z:4.38,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.2,y:.76,z:5,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22,y:.76,z:6.06,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.85,y:.76,z:6.67,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.7,y:.76,z:7.51,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.64,y:.76,z:8.31,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.2,y:.76,z:9.02,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.03,y:.76,z:8.68,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.2,y:.76,z:7.5,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.27,y:.76,z:6.74,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.24,y:.76,z:5.93,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.54,y:.76,z:4.95,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.67+3.95,y:.76,z:4.38,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.2+3.95,y:.76,z:5,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22+3.95,y:.76,z:6.06,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.85+3.95,y:.76,z:6.67,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.7+3.95,y:.76,z:7.51,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.64+3.95,y:.76,z:8.31,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.2+3.95,y:.76,z:9.02,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.03+3.95,y:.76,z:8.68,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.2+3.95,y:.76,z:7.5,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.27+3.95,y:.76,z:6.74,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.24+3.95,y:.76,z:5.93,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:24.54+3.95,y:.76,z:4.95,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.36,y:.76,z:10.17,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.35,y:.76,z:10.99,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.3,y:.76,z:12.05,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.07,y:.76,z:13.28,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21,y:.76,z:13.87,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21,y:.76,z:14.62,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.36,y:.76,z:10.17,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.35,y:.76,z:10.99,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.3,y:.76,z:12.05,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.07,y:.76,z:13.28,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21,y:.76,z:13.87,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21,y:.76,z:14.62,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.36+6.6,y:.76,z:10.17,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.35+6.6,y:.76,z:10.99,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.3+6.6,y:.76,z:12.05,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.07+6.6,y:.76,z:13.28,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21+6.6,y:.76,z:13.87,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21+6.6,y:.76,z:14.62,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.36+6.6,y:.76,z:10.17,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.35+6.6,y:.76,z:10.99,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.3+6.6,y:.76,z:12.05,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.07+6.6,y:.76,z:13.28,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21+6.6,y:.76,z:13.87,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21+6.6,y:.76,z:14.62,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.7,y:.76,z:10,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:23.86,y:.76,z:10,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:23.8,y:.76,z:10.75,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:23,y:.76,z:11.28,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.35,y:.76,z:12.03,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.17,y:.76,z:13.07,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.75,y:.76,z:13.95,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:23.6,y:.76,z:14.3,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:23.5,y:.76,z:15,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:22.52,y:.76,z:15,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:21.56,y:.76,z:15,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:26.93,y:.76,z:15,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:25.9,y:.76,z:15,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:25.12,y:.76,z:15,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:25.12,y:.76,z:14.36,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:25.86,y:.76,z:14.14,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:26.77,y:.76,z:13.5,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:26.75,y:.76,z:12.22,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:26.28,y:.76,z:11.44,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:25.4,y:.76,z:10.8,scaleX:.5,scaleY:.4,scaleZ:.5},//lenotre inside

        {x:10.5,y:.76,z:29.26,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:9.5,y:.76,z:29.4,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:8.5,y:.76,z:29.6,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:7.5,y:.76,z:29.8,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:6.5,y:.76,z:30,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:5.5,y:.76,z:30.2,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:4.5,y:.76,z:30.4,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:3.5,y:.76,z:30.6,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:2.5,y:.76,z:30.8,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:1.5,y:.76,z:31,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:0.5,y:.76,z:31.2,scaleX:.5,scaleY:.4,scaleZ:.5},//behind big dirty christian school

        {x:8.73,y:.76,z:-11.9,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:8.5,y:.76,z:-11.47,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:8.3,y:.76,z:-11.08,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:8,y:.76,z:-10.5,scaleX:.5,scaleY:.4,scaleZ:.5},
        {x:7.8,y:.76,z:-10.16,scaleX:.5,scaleY:.4,scaleZ:.5},//little parking next school north gambetta
    ]
};