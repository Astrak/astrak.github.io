var linearFilteredSmoothLambertMaterial=new THREE.MeshLambertMaterial({transparent:true});
var unique = new THREE.MeshLambertMaterial();
var resources = {
    textures:[
        'hospitaltest142',      // 0  minfilter : 
        'gambetta2test095',     // 1  minfilter : 
        'gambettatest187',      // 2  minfilter : 
        'hugotest181',          // 3  minfilter : 
        'chantier1test018',     // 4  minfilter : linearfilter
        'chantiertest043',      // 5  minfilter : linearfilter
        'commercestest019',     // 6  minfilter : 
        'nouveauxbat048',       // 7  minfilter : 
        'platane10',            // 8  minfilter : linearfilter
        'gridtest047',          // 9  minfilter : linearfilter
        'carstest041',          //10  minfilter : 
        'gambettacitytest299',  //11  minfilter : 
        'groundtest001'         //12
        ],
    geometries:[
        'hospital_higher',//0
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
        '4x4_shadow',
        'citadine_shadow',
        'break_shadow',//15
        'berline_shadow',
        'kangoo_shadow',
        'sportive_shadow',
        'camionette_shadow',
        'familiale_shadow',//20
        'ground'
        ],
    meshes:[//! dont change cars indices
        /*CARS*/
            {//0
                geometry:13,
                map:10,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_4x4'
            },
            {//1
                geometry:14,
                map:10,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_citadine'
            },
            {//2
                geometry:15,
                map:10,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_break'
            },
            {//3
                geometry:16,
                map:10,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_berline'
            },
            {//4
                geometry:17,
                map:10,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_kangoo'
            },
            {//5
                geometry:18,
                map:10,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_sportive'
            },
            {//6
                geometry:19,
                map:10,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_camionette'
            },
            {//7
                geometry:20,
                map:10,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_familiale'
            },
        {//8
            geometry:21,
            map:15,
            material:new THREE.MeshLambertMaterial(),
            name:'ground'
        },
        {//11
            geometry:12,
            map:7,
            material:unique,
            flatShaded:true,
            name:'RPA',
            steps:[false,false,true]
        },
        {//12
            geometry:11,
            map:7,
            material:unique,
            flatShaded:true,
            name:'residences',
            steps:[false,false,true]
        },
        {//13
            geometry:10,
            map:7,
            material:unique,
            name:'nouveau_sol',
            steps:[false,false,true]
        },
        {//14
            geometry:9,
            map:7,
            material:unique,
            flatShaded:true,
            name:'escalier',
            steps:[false,false,true]
        },
        {//15
            geometry:8,
            map:undefined,
            material:new THREE.MeshLambertMaterial({
				color:0xaaaaff,
				depthTest:false,depthWrite:true,
				transparent:true,
				opacity:.5,
				side:THREE.FrontSide
            }),
            flatShaded:true,
            name:'commercesdepth',
            steps:[false,false,true]
        },
        {//16
            geometry:7,
            map:6,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'commerces',
            steps:[false,false,true]
        },
        {//17
            geometry:5,
            map:5,
            material:new THREE.MeshLambertMaterial(),
            name:'chantier',
            steps:[false,true,false]
        },
        {//18
            geometry:6,
            map:4,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'chantier1',
            steps:[false,true,false]
        },
        {//19
            geometry:0,
            map:0,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'hospital',
            infos:{title:"Informations sur le bâtiment principal de l'hôpital",description:"Il a été bâti en 1982"},
            steps:[true,false,false]
        },
        {//20
            geometry:3,
            map:2,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'gambetta'
        },
        {//21
            geometry:4,
            map:1,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'gambetta2'
        },
        {//22
            geometry:1,
            map:3,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'hugo'
        },
        {//23
            geometry:2,
            map:11,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'gambettacity'
        }
        ]
};