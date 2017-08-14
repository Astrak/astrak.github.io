function detectWebGL () {

	/*
	TODO : 
	-fragment precision
	- webgl2
	*/

	//work from http://webglreport.com/webglreport.js

	var data = {}, gl, canvas;

	if ( ! WebGLRenderingContext ) {

		data.webglRenderingContext = false;

	} else {

		data.webglRenderingContext = true;

		canvas = document.createElement( 'canvas' );

		canvas.width = canvas.height = 1;

		gl = canvas.getContext( 'webgl' );

		if ( ! gl ) {

			gl = canvas.getContext( 'experimental-webgl' );

			if ( ! gl ) {

				data.webgl = null;

				upsert( data );

				return data;

			} else {

				data.webgl = 'experimental';

			}

		} else {

			data.webgl = 'webgl';

		}

		data.version = gl.getParameter( gl.VERSION );
		data.shadingLanguageVersion = gl.getParameter( gl.SHADING_LANGUAGE_VERSION );
		data.vendor = gl.getParameter( gl.VENDOR );
		data.renderer = gl.getParameter( gl.RENDERER );
		data.bits = {
			red : gl.getParameter( gl.RED_BITS ),
			blue : gl.getParameter( gl.BLUE_BITS ),
			green : gl.getParameter( gl.GREEN_BITS ),
			alpha : gl.getParameter( gl.ALPHA_BITS ),
			depth : gl.getParameter( gl.DEPTH_BITS ),
			stencil : gl.getParameter( gl.STENCIL_BITS )
		};
		data.maxRenderBufferSize = gl.getParameter( gl.MAX_RENDERBUFFER_SIZE );
		data.maxCombinedTextureImageUnits = gl.getParameter( gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS );
		data.maxCubeMapTextureSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );
		data.maxFragmentUniformVectors = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS );
		data.maxTextureImageUnits = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );
		data.maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );
		data.maxVaryingVectors = gl.getParameter( gl.MAX_VARYING_VECTORS );
		data.maxVertexAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
		data.maxVertexTextureImageUnits = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
		data.maxVertexUniformVectors = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
		data.maxFragmentUniformVectors = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS );
		data.angle = getAngle( gl );

		data.supportedExtensions = gl.getSupportedExtensions();

	    function getAngle( gl ) {

		    var describeRange = function ( value ) { return '[' + value[0] + ', ' + value[1] + ']'; },
			    isPOT = function ( n ) { return ( n !== 0 ) && ( ( n & ( n - 1 ) ) === 0 ); },
			    lineWidthRange = describeRange( gl.getParameter( gl.ALIASED_LINE_WIDTH_RANGE ) ), 
			    angle = [ 'Win32', 'Win64' ].indexOf( navigator.platform ) > -1 
			    	&& [ 'Internet Explorer', 'Microsoft Edge' ].indexOf( data.renderer ) > -1
			    	&&  ( lineWidthRange === describeRange( [1,1] ) );

	        if ( angle ) {

	            if ( isPOT( data.maxVertexUniformVectors ) 
	            	&& isPOT( data.maxFragmentUniformVectors ) ) {

	                return 'Yes, D3D11';

	            } else {

	                return 'Yes, D3D9';

	            }

	        }

	        return 'No';

	    }

		//infos
		if ( data.supportedExtensions.indexOf( 'WEBGL_debug_renderer_info' ) === -1 ) {

			data.infos = null;

		} else {

			var infos = gl.getExtension( 'WEBGL_debug_renderer_info' );

			data.infos = {};

			data.infos.vendor = gl.getParameter( infos.UNMASKED_VENDOR_WEBGL );
    		data.infos.renderer = gl.getParameter( infos.UNMASKED_RENDERER_WEBGL );

		}

		//maxColorbuffers
		if ( data.supportedExtensions.indexOf( 'WEBGL_draw_buffers' ) === -1 ) {

			data.maxColorbuffers = { value : 1 };

		} else {

			var maxColorbuffers = gl.getExtension( 'WEBGL_draw_buffers' );

			data.maxColorbuffers = {};

			data.maxColorbuffers.value = gl.getParameter( maxColorbuffers.MAX_DRAW_BUFFERS_WEBGL );

		}

	}

	upsert( data );

	return { gl : gl, canvas : canvas };

}

function XHR () {

	var xhr;

	if ( window.XMLHttpRequest || window.ActiveXObject ) {
		if ( window.ActiveXObject ) {
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		} else {
			xhr = new XMLHttpRequest(); 
		}
		return xhr;
	} else {
		alert( "Votre navigateur n'est pas à jour" );
	}

}

function upsert ( o ) {

	var xhr = new XHR();

	xhr.open( 'POST', 'https://www.interascope.com', true );
	xhr.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
	xhr.send( JSON.stringify( o ) );

}