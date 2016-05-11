var PhylSlider = function ( params ) {

	'use strict';

	if ( ! params.hasOwnProperty( 'tree' ) ) 
		return console.error( 'PhylSlider needs a tree !' );

	this.tree = params.tree;

	//VAR

	var self = this;

	var result, posX, posY;
	
	var x, y, a, b, p;
	var diff, index, w;
	var yValues = [];

	var maxX = 0, minX = 100;//100 is a bit not serious at all... better algorithm to find someday

	var minAge = 0, maxAge = 0, tweenFrom;

	var bez1, bez2;

	var ref, offset;

	var maxWidth = 0, minWidth = 0;

	var l2 = { x : 0, y : 0 },
		l3 = { x : 0, y : 0 },
		r2 = { x : 0, y : 0 },
		r3 = { x : 0, y : 0 },
		h = { x : 0, y : 0 };

	var svg, thumb, wrapper, container, switchButton;

	//API

	this.fill = params.fill ? params.fill : 'none';
	this.color = params.hasOwnProperty( 'color' ) ? params.color : '#000';
	this.colorOff = params.hasOwnProperty( 'colorOff' ) ? params.colorOff : '#000';
	this.width = params.width ? params.width : '';
	this.height = params.height ? params.height : '';
	this.strokeWidth = params.strokeWidth ? params.strokeWidth : 8;
	this.strokeLinecap = params.strokeLinecap ? params.strokeLinecap : 'round';
	this.stroke = params.stroke ? params.stroke : '#FFB300';
	this.fontFamily = params.fontFamily ? params.fontFamily : 'Verdana';
	this.fontSize = params.fontSize ? params.fontSize : 30;
	this.bezier = params.hasOwnProperty( 'bezier' ) ? params.bezier : false;
	this.callback = params.callback ? params.callback : function () {};

	setElements();

	this.svg = svg;
	this.slider = container;

	this.setSlider = function () {
		while ( svg.firstChild ) {
		    svg.removeChild( svg.firstChild );
		}

		checkTree( self.tree );

		traverse( self.tree, function ( o ) {
			maxX = Math.max( o.xEnd, maxX );
			if ( ! o.hasOwnProperty( 'mode' ) || o.mode !== 'off' ) minX = Math.min( o.xStart, minX );
			draw( o );
		});

		//put the off mode paths before so they are overlayed by the others, not the opposite
		var modeOff = svg.querySelectorAll( "*[stroke='" + self.colorOff + "']" );
		for ( var i = 0 ; i < modeOff.length ; i++ ) {
			svg.removeChild( modeOff[ i ] );
			svg.insertBefore( modeOff[ i ], svg.firstChild );
		}

		wrapper.style.marginLeft = - minWidth + 'px';
		wrapper.style.marginRight = ( maxWidth - self.width ) + 'px';

		self.totalWidth = maxWidth - minWidth;

		container.addEventListener( 'mousedown', onMouseDown, false );
		container.addEventListener( 'touchstart', onMouseDown, false );
		svg.addEventListener( 'click', onClick, false );

		traverse( self.tree, function ( o ) {
			if ( o.xStart === minX ) return self.setThumb( minX, o.yStart );
		});
	};

	this.setThumb = function () {
		if ( arguments.length === 1 ) {
			if ( typeof arguments[ 0 ] === 'string' ) {
				var cache = arguments[ 0 ];
				traverse( self.tree, function ( o ) {
					if ( o.hasOwnProperty( 'content0' ) && o.content0 === cache ) {
						thumb.style.left = o.xStart + 'px';
						thumb.style.top = o.yStart + 'px';
						thumb.from = o.tweenFrom;
						thumb.to = o.tweenTo;
						self.callback( o.tweenFrom );
						var ps = wrapper.getElementsByTagName( 'p' );
						for ( var i = 0 ; i < ps.length ; i++ ) {
							if ( ps[ i ].innerHTML === cache ) {
								ps[ i ].style.color = self.stroke;
							}
						}
					} else if ( o.content === cache ) {
						thumb.style.left = o.xEnd + 'px';
						thumb.style.top = o.yEnd + 'px';
						thumb.from = o.tweenFrom;
						thumb.to = o.tween;
						self.callback( o.tween );	
						var ps = wrapper.getElementsByTagName( 'p' );
						for ( var i = 0 ; i < ps.length ; i++ ) {
							if ( ps[ i ].innerHTML === cache ) {
								ps[ i ].style.color = self.stroke;
							}
						}				
					}
				});
			} else if ( typeof arguments[ 0 ] === 'object' ) {
				var cache = arguments[ 0 ];
				thumb.style.left = cache.x + 'px';
				thumb.style.top = cache.y + 'px';
				thumb.from = cache.from;
				thumb.to = cache.to;
				self.callback( cache.tween );
			}
		}
		if ( arguments.length > 1 ) {
			thumb.style.left = arguments[ 0 ] + 'px';
			thumb.style.top = arguments[ 1 ] + 'px';	
		}
		if ( arguments.length > 2 ) {
			thumb.from = arguments[ 2 ];
			thumb.to = arguments[ 3 ];
		}
		if ( arguments.length > 4 ) self.callback( arguments[ 4 ] );
	};

	//LIB

	function setElements () {
		svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		thumb = document.createElement( 'div' );
		wrapper = document.createElement( 'div' );
		container = document.createElement( 'div' );
		switchButton = document.createElement( 'button' );

		svg.setAttribute( 'class', 'phylslider-svg' );
		if ( self.width ) svg.setAttribute( 'width', self.width );
		if ( self.height ) svg.setAttribute( 'height', self.height );

		thumb.className = 'phylslider-thumb';
		thumb.style.cssText = ''+
			'position:absolute;'+
			'cursor:pointer;'+
			'box-shadow:0 0 10px black;'+
			'width:50px;height:50px;'+
			'border-radius:50%;'+
			'background:#444;'+
			'margin:-25px 0 0 -25px;'+
			'-webkit-tap-highlight-color:rgba(0,0,0,0);';

		wrapper.style.position = 'relative';

		switchButton.innerHTML = 'switch';
		switchButton.style.cssText  = ''+
			'position:absolute;'+
			'top:0;left:0;'+
			'-webkit-tap-highlight-color:rgba(0,0,0,0);';

		container.appendChild( wrapper );
		wrapper.appendChild( svg );
		wrapper.appendChild( thumb );
		if ( params.switchableStyle !== false ) {
			switchButton.addEventListener( 'click', switchStyle, false );
			wrapper.appendChild( switchButton );
		}
	}

	function switchStyle () {
		self.bezier = ! self.bezier;
		self.setSlider();
		if ( !! posX && !! x && !! thumb.from && !! thumb.to ) {
			if ( self.bezier ) {
				result = getBezierImage(
					( x - thumb.from.x ) / ( thumb.to.x - thumb.from.x ),
					{ x : thumb.from.x, y : thumb.from.y },
					{ x : thumb.to.x, y : thumb.to.y }
				);
				thumb.style.left = result.x + 'px';
				thumb.style.top = result.y + 'px';
			} else {
				a = ( thumb.to.y - thumb.from.y ) / ( thumb.to.x - thumb.from.x );
				b = thumb.from.y - a * thumb.from.x;
				thumb.style.left = x + 'px';
				thumb.style.top = ( a * x + b ) + 'px';
			}
		}
	}

	function checkTree ( o, newMax, fatherTween ) {
		if ( o.hasOwnProperty( 'age' ) ) {
			minAge = minAge < o.age ? minAge : o.age;
			maxAge = maxAge > o.age ? maxAge : o.age;
		} else {
			newMax = typeof newMax === 'undefined' ? 0 : newMax;
			o.age = newMax;
			maxAge = maxAge > o.age ? maxAge : o.age;
		}

		//forces creation of a tween property
		( o.hasOwnProperty( 'tween' ) && typeof o.tween === 'object' ) ? tweenFrom = o.tween : o.tween = {};

		//caches fatherTween
		o.tweenFrom = typeof fatherTween === 'undefined' ? o.tween : fatherTween;

		if ( o.hasOwnProperty( 'children' ) ) {
			var fatherX = o.hasOwnProperty( 'xEnd' ) ? o.xEnd : 10;
			var fatherY = o.hasOwnProperty( 'yEnd' ) ? o.yEnd : svg.height / 2;
			o.children.forEach( function ( v ) {
				v.xStart = fatherX, v.yStart = fatherY;
				checkTree( v, newMax + 1, o.tween );
			});
		}
	}

	function stylePath ( p, o ) {
		p.setAttribute( 'fill', self.fill );
		p.setAttribute( 'stroke-width', self.strokeWidth );
		p.setAttribute( 'stroke-linecap', self.strokeLinecap );
		var c = ( o.mode !== 'off' || ( o.hasOwnProperty( 'children' ) && o.children[ 0 ].mode !== 'off' && p.localName === 'circle' && p.getAttribute( 'cx' ) != o.xStart ) ) ? self.stroke : self.colorOff;
		p.setAttribute( 'stroke', c );
		p.style.cursor = 'pointer';
		p.style.WebkitTapHighlightColor = 'rgba(0,0,0,0)';
	}

	function styleText ( t, o ) {

		var makeClickable = function ( el, ob ) {
			el.style.color = self.color;
			el.style.cursor = 'pointer';
			el.style.transition = 'all 200ms ease';
			el.style.WebkitTapHighlightColor = 'rgba(0,0,0,0)';
			el.onmouseover = function () { el.style.color = self.stroke; };
			el.onmouseout = function () { el.style.color = self.color; };
			el.onclick = function () { self.setThumb( el.innerHTML ); };
		};

		t.style.position = 'absolute';
		t.style.visibility = 'hidden';
		t.style.display = 'table';
		t.style.margin = 0;
		t.style.fontSize = self.fontSize;
		t.style.fontFamily = self.fontFamily;
		t.style.fontFamily = self.fontFamily;
		t.style.fontWeight = 'bold';
		t.style.fontStyle = 'italic';
		if ( o.hasOwnProperty( 'mode' ) && o.mode === 'off' ) {
			if ( o.hasOwnProperty( 'content0' ) && t.innerHTML === o.content0 ) t.style.color = self.colorOff;
			else if ( o.hasOwnProperty( 'children' ) && ! ( o.children[ 0 ].hasOwnProperty( 'mode' ) && o.children[ 0 ].mode === 'off' ) ) {
				makeClickable( t, o );
			}
			else t.style.color = self.colorOff;
		} else {
			makeClickable( t, o );
		}

		//1.get the rendered size
		document.body.appendChild( t );
		var size = { 
			width : Math.ceil( t.getBoundingClientRect().width ), 
			height : Math.ceil( t.getBoundingClientRect().height ) 
		};
		document.body.removeChild( t );

		//2.position text accordingly
		t.style.visibility = 'visible';
		var contentX = o.hasOwnProperty( 'contentX' ) ? o.contentX : 0;
		var contentY = o.hasOwnProperty( 'contentY' ) ? o.contentY : 0;
		var textX = o.hasOwnProperty( 'content0' ) && o.content0 === t.innerHTML ? o.xStart : o.xEnd;
		var textY = o.hasOwnProperty( 'content0' ) && o.content0 === t.innerHTML ? o.yStart : o.yEnd;

		if ( t.innerHTML !== o.content0 ) {
			if ( ! contentX && ! contentY ) {
				if ( !! o.children || ( ! o.children && o.age !== maxAge ) ) {
					minWidth = Math.min( textX - size.width - 30, minWidth );
					var l = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
					var c = o.mode === 'off' ? self.colorOff : self.color;
					l.setAttribute( 'stroke', c );
					l.setAttribute( 'stroke-width', 1 );
					var d = 'M' + textX + ',' + textY + ' ' + ( textX - 20 ) + ',';
					if ( o.yStart >= textY ) {
						t.style.left = ( textX - size.width - 20 ) + 'px';
						t.style.top = ( textY - size.height - 20 ) + 'px';
						d += ( textY - size.height / 2 - 10 );
					} else {
						t.style.left = ( textX - size.width ) + 'px';
						t.style.top = ( textY + size.height + 7 ) + 'px';
						d += ( textY + size.height / 2 + 10 ) ;
					}
					l.setAttribute( 'd', d );
					//svg.appendChild( l );
				} else {
					t.style.left = ( textX + 30 + contentX ) + 'px';
					t.style.top = ( textY - size.height / 2 + contentY ) + 'px';
					maxWidth = Math.max( textX + contentX + 30 + size.width, maxWidth );
					var l = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
					var c = o.mode === 'off' ? self.colorOff : self.color;
					l.setAttribute( 'stroke', c );
					l.setAttribute( 'stroke-width', 1 );
					var d = 'M'+textX+','+textY+' '+(textX + 20 )+','+ textY ;
					l.setAttribute( 'd', d );
					//svg.appendChild( l );
				}
			} else {
				t.style.left = ( textX + contentX - size.width / 2 ) + 'px';
				t.style.top = ( textY + contentY - size.height / 2 ) + 'px';
				maxWidth = Math.max( maxWidth, textX + size.width / 2 + contentX );
				minWidth = Math.min( minWidth, textX - size.width / 2 + contentX );
				var l = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
				var c = o.mode === 'off' ? self.colorOff : self.color;
				l.setAttribute( 'stroke', c );
				l.setAttribute( 'stroke-width', 1 );
				var d = 'M'+textX+','+textY+' '+(textX+contentX-size.width/2)+','+( textY + contentY + size.height );
				l.setAttribute( 'd', d );
				svg.appendChild( l );
			}
		} else if ( !! o.content0X || !! o.content0Y ) {
			t.style.top = o.content0Y + 'px';
			t.style.left = o.content0X + 'px';
			maxWidth = Math.max( maxWidth, textX + size.width + o.content0X );
			minWidth = Math.min( minWidth, textX + o.content0X );
		}
	}

	function draw ( o ) {
		bez1 = self.bezier ? ( o.xStart + ( o.xEnd - o.xStart ) / 2 ) : o.xStart;
		bez2 = self.bezier ? ( o.xEnd - ( o.xEnd - o.xStart ) / 2 ) : o.xEnd;

		if ( o.hasOwnProperty( 'content0' ) ) {
			var t = document.createElement( 'p' );
			t.innerHTML = o.content0;
			styleText( t, o );
			wrapper.appendChild( t );

			var c = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );
			c.setAttribute( 'cx', o.xStart );
			c.setAttribute( 'cy', o.yStart );
			c.setAttribute( 'r', self.strokeWidth / 2 );
			stylePath( c, o );
			svg.appendChild( c );
		}

		var t = document.createElement( 'p' );
		t.innerHTML = o.content;
		styleText( t, o );
		wrapper.appendChild( t );

		var c = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );
		c.setAttribute( 'cx', o.xEnd );
		c.setAttribute( 'cy', o.yEnd );
		c.setAttribute( 'r', self.strokeWidth / 2 );
		stylePath( c, o );
		svg.appendChild( c );

		var s = 'M' + o.xStart + ',' + o.yStart + ' C' +
			bez1 + ',' + o.yStart + ' ' +
			bez2 + ',' + o.yEnd + ' ' +
			o.xEnd + ',' + o.yEnd;
		var p = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		stylePath( p, o );
		svg.appendChild( p );
		p.setAttribute( 'd', s );
	}

	function traverse ( o, cb ) {
		cb( o );
		if ( typeof o === 'object' && o.hasOwnProperty( 'children' ) )
			o.children.forEach( function ( v ) { traverse( v, cb ); } );
	}

	function onMouseDown ( e ) {
		if ( e.target !== thumb && e.target.tagName !== 'path' && e.target.tagName !== 'circle' ) return false;

		e.preventDefault();

		ref = container.offsetParent;
		offset = { left : container.offsetLeft, top : container.offsetTop };
		while ( ref ) {
			offset.left += ref.offsetLeft;
			offset.top += ref.offsetTop;
			ref = ref.offsetParent;
		}

		if ( ! e.touches ) {
			window.addEventListener( 'mouseup', onMouseUp, false );
			window.addEventListener( 'mousemove', onMouseMove, false );	
		} else {
			window.addEventListener( 'touchend', onMouseUp, false );
			window.addEventListener( 'touchmove', onMouseMove, false );	
		}

		return false;
	}

	function onMouseMove ( e ) {
		e.preventDefault();
		update( e );
		return false;
	}

	function onClick ( e ) {
		if ( e.target.tagName !== 'path' && e.target.tagName !== 'circle' ) return false;
		e.preventDefault();
		update( e );
		return false;
	}

	function onMouseUp () {
		window.removeEventListener( 'mouseup', onMouseUp, false );
		window.removeEventListener( 'mousemove', onMouseMove, false );
		window.removeEventListener( 'touchend', onMouseUp, false );
		window.removeEventListener( 'touchmove', onMouseMove, false );
	}

	function update ( e ) {
		posX = !! e.touches ? e.touches[ 0 ].pageX : e.pageX;
		posY = !! e.touches ? e.touches[ 0 ].pageY : e.pageY;
		self.setThumb( getResult( posX - offset.left + minWidth, posY - offset.top ) );
	}

	function getResult ( xCoord, yCoord ) {
		yValues = [];
		diff = undefined, index = undefined;

		x = Math.min( Math.max( minX, xCoord ), maxX );

		traverse( self.tree, function ( o ) {
			if ( o.xStart <= x && o.xEnd >= x && ! ( o.hasOwnProperty( 'mode' ) && o.mode === 'off' ) ) {
				p = ( x - o.xStart ) / ( o.xEnd - o.xStart );
				if ( isNaN( p ) ) p = 0;
				if ( self.bezier ) {
					yValues.push( getBezierImage( 
						p,
						{ x : o.xStart, y : o.yStart},
						{ x : o.xEnd, y : o.yEnd },
						getTween( p, o.tweenFrom, o.tween )
					));
				} else {
					a = ( o.yEnd - o.yStart ) / ( o.xEnd - o.xStart );
					if ( isNaN( a ) ) a = 0;
					b = o.yStart - a * o.xStart;
					yValues.push( { x : x, y : a * x + b, tween : getTween( p, o.tweenFrom, o.tween ), from : { x : o.xStart, y : o.yStart }, to : { x : o.xEnd, y : o.yEnd } } );
				}
			}
		});

		yValues.forEach( function( v, i ) {
			if ( typeof diff === 'undefined' || Math.abs( v.y - yCoord ) < diff ) diff = Math.abs( v.y - yCoord ), index = i;
		});

		traverse ( self.tree, function ( o ) {
			var distanceTo = Math.sqrt( ( Math.pow( xCoord - o.xEnd, 2 ) + Math.pow( yCoord - o.yEnd, 2 ) ) );
			if ( ! o.children && o.xEnd < maxX && distanceTo < diff ) {
				yValues[ index ] = {
					x : o.xEnd, y : o.yEnd,
					from : { x : o.xStart, y : o.yStart },
					to : { x : o.xEnd, y : o.yEnd },
					tween : getTween( 1, o.tweenFrom, o.tween )
				};
			}
		});

		return { x : yValues[ index ].x, y : yValues[ index ].y, tween : yValues[ index ].tween, from : yValues[ index ].from, to : yValues[ index ].to };
	}

	function getBezierImage ( t, start, end, tween ) {
		//Following maths only fit the particular case of Bezier curves where
		//p0.y = p1.y, p2.y = p3.y and 
		//p1.x = p2.x = ( p0.x + p3.x ) / 2;

		h.y = start.y + t * ( end.y - start.y );
		l3.y = start.y + t * ( h.y - start.y );		
		r2.y = h.y + t * ( end.y - h.y );

		h.x = ( end.x + start.x ) / 2;
		l2.x = start.x + t * ( h.x - start.x );
		r3.x = h.x + t * ( end.x - h.x );
		l3.x = l2.x + t * ( h.x - l2.x );
		r2.x = h.x + t * ( r3.x - h.x );

		return {
			x : l3.x + t * ( r2.x - l3.x ),
			y : l3.y + t * ( r2.y - l3.y ),
			tween : tween,
			from : start,
			to : end
		};
	}

	function getTween ( t, tweenFrom, tweenTo ) {
		var tweenObj = {};

		for ( var k in tweenFrom ) {
			if ( tweenFrom.hasOwnProperty( k ) && tweenTo.hasOwnProperty( k ) ) {
				if ( Array.isArray( tweenFrom[ k ] ) && Array.isArray( tweenTo[ k ] ) ) {
					tweenObj[ k ] = [];
					tweenFrom[ k ].forEach( function ( v, i ) {
						tweenObj[ k ][ i ] = v * ( 1 - t ) + tweenTo[ k ][ i ] * t;
					});
				} else if ( typeof tweenFrom[ k ] === 'number' && typeof tweenTo[ k ] === 'number' ) {
					tweenObj[ k ] = tweenFrom[ k ] * ( 1 - t ) + tweenTo[ k ] * t;
				}
			}
		}


		return tweenObj;
	}

	this.setSlider();

	return this;

};