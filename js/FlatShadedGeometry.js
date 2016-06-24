/**
 * @author astrak / astrak.github.io
 */

THREE.FlatShadedGeometry = function ( geometry ) {

	var flatShadedGeometry = geometry.clone();

	var vertices = [], 
		faces = [],
		morphTargets = [];

	if ( geometry.morphTargets ) {

		for ( var i = 0 ; i < geometry.morphTargets.length ; i++ ) {

			morphTargets[ i ] = { name : geometry.morphTargets.name, vertices : [] };

		}

	}

	for ( var i = 0 ; i < geometry.faces.length ; i++ ) {

		var f = geometry.faces[ i ];

		vertices[ i * 3 ] = geometry.vertices[ f.a ].clone();
		vertices[ i * 3 + 1 ] = geometry.vertices[ f.b ].clone();
		vertices[ i * 3 + 2 ] = geometry.vertices[ f.c ].clone();

		faces.push( f.clone() );

		faces[ i ].a = i * 3;
		faces[ i ].b = i * 3 + 1;
		faces[ i ].c = i * 3 + 2;

		faces[ i ].vertexNormals[ 0 ] = f.normal.clone();
		faces[ i ].vertexNormals[ 1 ] = f.normal.clone();
		faces[ i ].vertexNormals[ 2 ] = f.normal.clone();

		if ( geometry.morphTargets ) {

			for ( var j = 0 ; j < geometry.morphTargets.length ; j++ ) {

				morphTargets[ j ].vertices[ i * 3 ] = geometry.morphTargets[ j ].vertices[ f.a ].clone();
				morphTargets[ j ].vertices[ i * 3 + 1 ] = geometry.morphTargets[ j ].vertices[ f.b ].clone();
				morphTargets[ j ].vertices[ i * 3 + 2 ] = geometry.morphTargets[ j ].vertices[ f.c ].clone();

			}

		}

	}

	flatShadedGeometry.vertices = vertices;

	flatShadedGeometry.faces = faces;

	if ( geometry.morphTargets ) {
		
		flatShadedGeometry.morphTargets = morphTargets;

		flatShadedGeometry.computeVertexNormals();

		flatShadedGeometry.computeMorphNormals();

	}

	return flatShadedGeometry;

};