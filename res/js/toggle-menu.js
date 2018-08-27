function setCSSRules(){
	if ($(window).width() > 1050) {
		$('.mobile-nav').css('display','none');
		$('#side-menu').show();
	}
	else {
		$('.mobile-nav').css('display','block');
		$('#side-menu').hide();
	}
}

$(window).ready(setCSSRules);
$(window).resize(setCSSRules);

$(".mobile-nav").click(function(e){
	e.preventDefault();
	$("#side-menu").slideToggle("fast");   
	return false;
});
