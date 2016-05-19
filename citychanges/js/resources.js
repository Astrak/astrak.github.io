var linearFilteredSmoothLambertMaterial=new THREE.MeshLambertMaterial({transparent:true});
var unique = new THREE.MeshLambertMaterial();
var resources = {
    textures:[
        'hospitaltest143',      // 0
        'gambettatest187',      // 1  
        'chantier1test018',     // 2  linearfilter
        'chantiertest043',      // 3  linearfilter
        'commercestest019',     // 4  
        'nouveauxbat048',       // 5  
        'platane10',            // 6  linearfilter
        'gridtest047',          // 7  linearfilter
        'carstest041',          // 8  
        'gambettacitytest304',  // 9  
        'groundtest002'         //10  linearfilter
        ],
    geometries:[
        'hospital_higher',//0
        'gambettacity_higher',
        'gambetta',
        'chantier',
        'chantier1',
        'commerces',//5
        'commercesdepth',
        'escalier',
        'nouveau_sol',
        'residences',
        'RPA',//10
        '4x4_shadow',
        'citadine_shadow',
        'break_shadow',
        'berline_shadow',
        'kangoo_shadow',//15
        'sportive_shadow',
        'camionette_shadow',
        'familiale_shadow',
        'ground'//19
        ],
    meshes:[//! dont change cars indices
        /*CARS*/
            {//0
                geometry:11,
                map:8,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_4x4'
            },
            {//1
                geometry:12,
                map:8,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_citadine'
            },
            {//2
                geometry:13,
                map:8,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_break'
            },
            {//3
                geometry:14,
                map:8,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_berline'
            },
            {//4
                geometry:15,
                map:8,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_kangoo'
            },
            {//5
                geometry:16,
                map:8,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_sportive'
            },
            {//6
                geometry:17,
                map:8,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_camionette'
            },
            {//7
                geometry:18,
                map:8,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_familiale'
            },
        {//8
            geometry:19,
            map:10,
            material:new THREE.MeshLambertMaterial(),
            name:'ground'
        },
        {//11
            geometry:10,
            map:5,
            material:unique,
            flatShaded:true,
            name:'RPA',
            steps:[false,false,true]
        },
        {//12
            geometry:9,
            map:5,
            material:unique,
            flatShaded:true,
            name:'residences',
            steps:[false,false,true]
        },
        {//13
            geometry:8,
            map:5,
            material:unique,
            name:'nouveau_sol',
            steps:[false,false,true]
        },
        {//14
            geometry:7,
            map:5,
            material:unique,
            flatShaded:true,
            name:'escalier',
            steps:[false,false,true]
        },
        {//15
            geometry:6,
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
            geometry:5,
            map:4,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'commerces',
            steps:[false,false,true]
        },
        {//17
            geometry:3,
            map:3,
            material:new THREE.MeshLambertMaterial(),
            name:'chantier',
            steps:[false,true,false]
        },
        {//18
            geometry:4,
            map:2,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'chantier1',
            steps:[false,true,false]
        },
        {//19
            geometry:0,
            map:0,
            material:new THREE.MeshLambertMaterial({transparent:true, alphaTest:.4}),
            flatShaded:true,
            name:'hospital',
            infos:{title:"Informations sur le bâtiment principal de l'hôpital",description:"Il a été bâti en 1982"},
            steps:[true,false,false]
        },
        {//20
            geometry:2,
            map:1,
            material:new THREE.MeshLambertMaterial(),
            flatShaded:true,
            name:'gambetta'
        },
        {//22
            geometry:1,
            map:9,
            material:new THREE.MeshLambertMaterial({transparent:true, alphaTest:.5}),
            flatShaded:true,
            name:'gambettacity'
        }
        ]
};