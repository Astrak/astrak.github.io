$(function(){
	
$('#indexSlider').cycle({
		speed: 1000,
		timeout:6000, 
		fx: 'fade',
		pager:'ul.nav',
		activePagerClass:'active'
	
	});	
	
	
	$(".carousel").jCarouselLite({
		vertical: true,
		auto: 4000,
		speed: 1000,
		visible: 2
  });
	
});