/* libellus.js */


//$(initMenuAmazonStyle);
$(initMenu);
$(function(){
	setActiveMenu();
});





function initMenu(){
	//__ cache le sous menu au lancement de la page
	$(".submenu ul ul").hide();
	$(".submenu .active").removeClass("active");
}







//__ trace le triangle de dÃ©bogage ou pas
var DEBUG = 0;

// When neither `undefined` nor `null`, this is a 2D canvas rendering context to be used
// for debug triangle display.
var surface;

// Our submenu management state.
var state = {
	// (x,y) is the triangle's left vertex.  (x2,y2) is the top-right one,
	// and (x2,y3) is the bottom-right one (y3 could be higher up than y, too).
	x: 0, y: 0, x2: 0, y2: 0, y3: 0,

	// angles from (x,y) to (x2,y2) and (x2,y3).  If positive, go up, otherwise go down.
	angleRight: 0, angleLeft: 0,

	// the level-1 menu whose submenu is currently displayed.
	item: null
};

function initMenuAmazonStyle(){
	//__ cache le sous menu au lancement de la page
	$(".submenu ul ul").hide();
	$(".submenu .active").removeClass("active");


	// We don't rely on CSS `:hover` to open/close menus, as we need to manually
	// control when we switch submenus.  So it's `mouseenter` and `mouseleave` on
	// the main items, then `mousemove` on the level-1 menu items.
	$(".submenu>ul>li").mousemove(maintainArea);

	// A debug checkbox lets us display the triangle using a canvas overlay.
	if( DEBUG ){
		setDebug();
	}

}



  // The main code triggered on every mouse movement over a level-1 menu item.  Maintains the
  // active triangle, basically, and uses it to switch submenus.
  function maintainArea(e) {
	var item = e.currentTarget;

	// Whenever a new level-1 menu (item) becomes the reference one, show its submenu and
	// compute+cache the right-hand vertices of the triangle (and the current angles).
	function cacheValues(item) {
	  state.item = item;
	  var submenu = $(item).children('ul').show();

	  var offset = submenu.offset();
     var width = submenu.width();
     var height = submenu.height();


	  //state.x2  = offset.left;
	  state.x2  = offset.left+width;
	  state.y2 = offset.top;

	  state.x3 = offset.left;
	  state.y3 = state.y2;

	  maintainAngles(e);
	}

	// Compute the angles (in radians, we don't need to display them anyway so we don't bother
	// with converting to degrees) for the upper and lower sides of the triangle.  A positive
	// angle goes up, a negative one goes down.
	function computeAngles(container, x, y) {
	  var h = Math.abs(state.y2 - y);

	  wRight = Math.abs(state.x2 - x);
	  wLeft = Math.abs(x - state.x3);

	  container.angleRight = Math.atan(wRight / h);
	  container.angleLeft = Math.atan(wLeft / h);
	  return container;
	}

	// Whenever the mouse moves, maintains left-hand vertex and angles for the triangle.
	function maintainAngles() {
	  state.x = e.pageX;
	  state.y = e.pageY;
	  computeAngles(state, state.x, state.y);

	  // If we have a debug surface available, render the triangle on it.
	  if (surface) {
		surface.clearRect(0, 0, window.innerWidth, window.innerHeight);
		surface.beginPath();
		surface.moveTo(state.x, state.y);
		surface.lineTo(state.x2, state.y2);
		surface.lineTo(state.x3, state.y3);
		surface.fill();
	  }
	}

	if (!state.item) {
	  // 1. No active submenu?  Start with the current one!
	  cacheValues(item);
	} else if (state.item === item) {
	  // 2. Changing pos yet still on active submenu?  Maintain origin and angles.
	  maintainAngles();
	} else {
	  // 3. Changed level-1 menu?  Check whether we're still in the latest triangle
	  // (this means angles for the current mouse pos are growing for the upper side,
	  // and decreasing for the lower side).
	  var angles = computeAngles({}, e.pageX, e.pageY);

	  if (angles.angleRight >= state.angleRight && angles.angleLeft >= state.angleLeft) {
		return;
	  }
	  // Nope, we went out of the triangle: hide previous submenu and init state
	  // afresh.
	  $(state.item).children('ul').hide();
	  cacheValues(item);
	}
  }





function setDebug() {
	if( $('canvas#menu_debug').length === 0 ){
		$("body").append( $('<canvas id="menu_debug"></canvas>') );
	}

	var canvas = $('canvas#menu_debug')[0];


	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	surface = canvas.getContext('2d');
	surface.fillStyle = 'rgba(255, 100, 0, 0.4)';
	surface.clearRect(0, 0, canvas.width, canvas.height);

}




$.extend(String.prototype , {

	startsWith:function(b){return this.substring(0,b.length)===b},

	endsWith:function(b){var a=b.length;return this.substr(this.length-a,a)===b},

	isValidEmail:function(){return/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,6}$/i.test(this)},
	containsValidEmail:function(){return/(^|\W+)[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,6}(\W+|$)/i.test(this)}
});


/*
Met en place le rappel de contexte sur le menu horizontal
*/
function setActiveMenu( current_url , t ){
	var url = current_url || document.location.href;

	$(".submenu a").each(function(){
		$this = $(this);
		var href = $this.attr("href");
		var parent_li = $this.parents("li");
		var parent_ul = $this.parents("ul");

		if( url.endsWith( href ) ){
			parent_li.addClass("active");
			parent_ul.show();
		}
	});
}
