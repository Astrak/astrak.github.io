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
        'platane10',            // 8  minfilter : linearfilter
        'gridtest047',          // 9  minfilter : linearfilter
        'lensflare1_uncache',   //10  minfilter : 
        'lensflare2',           //11  minfilter : 
        'lensflare3',           //12  minfilter : 
        'routestest090',        //13  minfilter : linearfilter
        'trottoirstest042',     //14  minfilter : linearfilter
        'carstest041',          //15  minfilter : 
        'gardenstest033',       //16  minfilter : linearfilter
        'gambettacitytest299'   //17  minfilter : 
        ],
    geometries:[
        'hospital',//0
        'hugo',
        'gambettacity19',
        'gambetta',
        'gambetta2',
        'chantier',//5
        'chantier1',
        'commerces',
        'commercesdepth',
        'escalier',
        'nouveau_sol',//10
        'residences',
        'RPA',
        'gardens2',
        'routes5',
        'trottoirs4',//15
        '4x4_shadow',
        'citadine_shadow',
        'break_shadow',
        'berline_shadow',
        'kangoo_shadow',//20
        'sportive_shadow',
        'camionette_shadow',
        'familiale_shadow'
        ],
    meshes:[//! dont change cars indices
        /*CARS*/
        {//0
            geometry:16,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'4x4'
        },
        {//1
            geometry:17,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'citadine'
        },
        {//2
            geometry:18,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'break'
        },
        {//3
            geometry:19,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'berline'
        },
        {//4
            geometry:20,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'kangoo'
        },
        {//5
            geometry:21,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'sportive'
        },
        {//6
            geometry:22,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'camionette'
        },
        {//7
            geometry:23,
            map:15,
            material:linearFilteredSmoothLambertMaterial,
            name:'familiale'
        },//cars
        {//8
            geometry:13,
            map:16,
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'gardens'
        },
        {//9
            geometry:14,
            map:13,//minFilter set to Linear in loadTextures
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'routes'
        },
        {//10
            geometry:15,
            map:14,
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'trottoirs'
        },
        {//11
            geometry:12,
            map:7,
            material:nearestFilteredFlatLambertMaterial,
            name:'RPA',
            steps:[false,false,true]
        },
        {//12
            geometry:11,
            map:7,
            material:nearestFilteredFlatLambertMaterial,
            name:'residences',
            steps:[false,false,true]
        },
        {//13
            geometry:10,
            map:7,
            material:nearestFilteredFlatLambertMaterial,
            name:'nouveau_sol',
            steps:[false,false,true]
        },
        {//14
            geometry:9,
            map:7,
            material:nearestFilteredFlatLambertMaterial,
            name:'escalier',
            steps:[false,false,true]
        },
        {//15
            geometry:8,
            map:undefined,
            material:new THREE.MeshPhongMaterial({
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
        {//16
            geometry:7,
            map:6,
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'commerces',
            steps:[false,false,true]
        },
        {//17
            geometry:5,
            map:5,
            material:new THREE.MeshLambertMaterial({color:0xffffff,shading:THREE.SmoothShading}),
            name:'chantier',
            steps:[false,true,false]
        },
        {//18
            geometry:6,
            map:4,
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'chantier1',
            steps:[false,true,false]
        },
        {//19
            geometry:0,
            map:0,
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading,side:THREE.DoubleSide}),
            name:'hospital',
            infos:{title:"Informations sur le bâtiment principal de l'hôpital",description:"Il a été bâti en 1982"},
            steps:[true,false,false]
        },
        {//20
            geometry:3,
            map:2,
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'gambetta'
        },
        {//21
            geometry:4,
            map:1,
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'gambetta2'
        },
        {//22
            geometry:1,
            map:3,
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'hugo'
        },
        {//23
            geometry:2,
            map:17,
            material:new THREE.MeshPhongMaterial({color:0xffffff,shading:THREE.FlatShading}),
            name:'gambettacity'
        }
        ]
};