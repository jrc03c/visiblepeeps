let oldWidth = 0;

function setCSSRules(event){
	let newWidth = $(window).width();
	
	if (newWidth === oldWidth) return;
	
	if (newWidth > 1050) {
		$('.mobile-nav').css('display','none');
		$('#side-menu').show();
	}
	else {
		$('.mobile-nav').css('display','block');
		$('#side-menu').hide();
	}
	
	oldWidth = newWidth;
}

$(window).ready(setCSSRules);
$(window).resize(setCSSRules);

$(".mobile-nav").click(function(e){
	e.preventDefault();
	$("#side-menu").slideToggle("fast");   
	return false;
});
