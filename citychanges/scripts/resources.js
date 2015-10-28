var linearFilteredSmoothLambertMaterial=new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.SmoothShading,transparent:true});
var nearestFilteredFlatLambertMaterial=new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading});
var resources = {
    textures:[
        // 18 textures = madness
        'hospitaltest141',      // 0  minfilter : 
        'gambetta2test095',     // 1  minfilter : 
        'gambettatest187',      // 2  minfilter : 
        'hugotest181',          // 3  minfilter : 
        'chantier1test018',     // 4  minfilter : linearfilter
        'chantiertest043',      // 5  minfilter : linearfilter
        'commercestest019',     // 6  minfilter : 
        'nouveauxbat048',       // 7  minfilter : 
        //'platane10',            // 8  minfilter : linearfilter
        //'gridtest047',          // 9  minfilter : linearfilter
        //'lensflare1_uncache',   //10  minfilter : 
        //'lensflare2',           //11  minfilter : 
        //'lensflare3',           //12  minfilter : 
        //'routestest090',        //13  minfilter : linearfilter
        //'trottoirstest042',     //14  minfilter : linearfilter
        //'carstest041',          //15  minfilter : 
        //'gardenstest033',       //16  minfilter : linearfilter
       // 'gambettacitytest299'   //17  minfilter : 
        ],
    geometries:[
        'hospital',
        'hugo',
        'gambettacity19',
        'gambetta',
        'gambetta2',
        'chantier',
        'chantier1',
        'commerces',
        'commercesdepth',
        'escalier',
        'nouveau_sol',
        'residences',
        'RPA',
        'gardens2',
        'routes5',
        'trottoirs4',
        '4x4_shadow',
        'citadine_shadow',
        'break_shadow',
        'berline_shadow',
        'kangoo_shadow',
        'sportive_shadow',
        'camionette_shadow',
        'familiale_shadow'
        ],
    meshes:[//! dont change cars indices
        /*CARS*/
        {
            geometry:16,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'4x4',
            steps:[true,true,true]
        },
        {
            geometry:17,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'citadine',
            steps:[true,true,true]
        },
        {
            geometry:18,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'break',
            steps:[true,true,true]
        },
        {
            geometry:19,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'berline',
            steps:[true,true,true]
        },
        {
            geometry:20,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'kangoo',
            steps:[true,true,true]
        },
        {
            geometry:21,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'sportive',
            steps:[true,true,true]
        },
        {
            geometry:22,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'camionette',
            steps:[true,true,true]
        },
        {
            geometry:23,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'familiale',
            steps:[true,true,true]
        },//cars
        {
            geometry:13,
            map:16,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'gardens',
            steps:[true,true,true]
        },
        {
            geometry:14,
            map:13,//minFilter set to Linear in loadTextures
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'routes',
            steps:[true,true,true]
        },
        {
            geometry:15,
            map:14,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'trottoirs',
            steps:[true,true,true]
        },
        {
            geometry:12,
            map:7,
            material:nearestFilteredFlatLambertMaterial,
            name:'RPA',
            steps:[false,false,true]
        },
        {
            geometry:11,
            map:7,
            material:nearestFilteredFlatLambertMaterial,
            name:'residences',
            steps:[false,false,true]
        },
        {
            geometry:10,
            map:7,
            material:nearestFilteredFlatLambertMaterial,
            name:'nouveau_sol',
            steps:[false,false,true]
        },
        {
            geometry:9,
            map:7,
            material:nearestFilteredFlatLambertMaterial,
            name:'escalier',
            steps:[false,false,true]
        },
        {
            geometry:8,
            map:undefined,
            material:new THREE.MeshLambertMaterial({
				color:0xaaaaff,
				shading:THREE.FlatShading,
				depthTest:false,depthWrite:true,
				transparent:true,
				opacity:.5,
				side:THREE.FrontSide
            }),
            name:'commercesdepth',
            steps:[false,false,true]
        },
        {
            geometry:7,
            map:6,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'commerces',
            steps:[false,false,true]
        },
        {
            geometry:5,
            map:5,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.SmoothShading}),
            name:'chantier',
            steps:[true,true,true]
        },
        {
            geometry:6,
            map:4,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'chantier1',
            steps:[false,true,false]
        },
        {
            geometry:0,
            map:0,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading,side:THREE.DoubleSide}),
            name:'hospital',
            infos:{title:"Informations sur le bâtiment principal de l'hôpital",description:"Il a été bâti en 1982"},
            steps:[true,false,false]
        },
        {
            geometry:3,
            map:2,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'gambetta',
            steps:[true,true,true]
        },
        {
            geometry:4,
            map:1,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'gambetta2',
            steps:[true,true,true]
        },
        {
            geometry:1,
            map:3,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'hugo',
            steps:[true,true,true]
        },
        {
            geometry:2,
            map:17,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'gambettacity',
            steps:[true,true,true]
        }
        ]
};