var linearFilteredSmoothLambertMaterial=new THREE.MeshLambertMaterial({transparent:true});
var unique = new THREE.MeshLambertMaterial();
var resources = {
    textures:[
        'carstest041',          // 0 
        'groundtest002'         // 1  linearfilter
        ],
    geometries:[
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
                geometry:0,
                map:0,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_4x4'
            },
            {//1
                geometry:1,
                map:0,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_citadine'
            },
            {//2
                geometry:2,
                map:0,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_break'
            },
            {//3
                geometry:3,
                map:0,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_berline'
            },
            {//4
                geometry:4,
                map:0,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_kangoo'
            },
            {//5
                geometry:5,
                map:0,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_sportive'
            },
            {//6
                geometry:6,
                map:0,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_camionette'
            },
            {//7
                geometry:7,
                map:0,
                material:linearFilteredSmoothLambertMaterial,
                name:'cars_familiale'
            },
        {//8
            geometry:8,
            map:1,
            material:new THREE.MeshLambertMaterial(),
            name:'ground'
        }
        ]
};