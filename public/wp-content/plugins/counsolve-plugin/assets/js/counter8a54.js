(function($) {
	
	"use strict";
	var counter_js = function($scope, $) {
		
		//Fact Counter + Text Count
		if($('.count-box').length){
			$('.count-box').appear(function(){
		
				var $t = $(this),
					n = $t.find(".count-text").attr("data-stop"),
					r = parseInt($t.find(".count-text").attr("data-speed"), 10);
					
				if (!$t.hasClass("counted")) {
					$t.addClass("counted");
					$({
						countNum: $t.find(".count-text").text()
					}).animate({
						countNum: n
					}, {
						duration: r,
						easing: "linear",
						step: function() {
							$t.find(".count-text").text(Math.floor(this.countNum));
						},
						complete: function() {
							$t.find(".count-text").text(this.countNum);
						}
					});
				}
				
			},{accY: 0});
		}
		
		// Progress Bar
		if ($('.count-bar').length) {
			$('.count-bar').appear(function(){
				var el = $(this);
				var percent = el.data('percent');
				$(el).css('width',percent).addClass('counted');
			},{accY: -50});
	
		}
		
	};
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_funfact_box.default', counter_js);
    });	

})(window.jQuery);



