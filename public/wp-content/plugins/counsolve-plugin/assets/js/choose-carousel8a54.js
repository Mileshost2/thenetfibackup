(function($) {
	
	"use strict";
	var choose_carousel_js = function($scope, $) {
		
		var design_one = $('.choose-four-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-choose-slider').data('slider');
            $('.choose-four-item-carousel').owlCarousel({
                loop:slider_attr.infinite,
				margin:slider_attr.item_gap,
				nav:slider_attr.arrows,
				smartSpeed: slider_attr.autoplaySpeed,
				autoplay: slider_attr.autoplay,
				infinite: slider_attr.infinite,
				"navText": ["<span class=\"flaticon-right-chevron\"></span>","<span class=\"flaticon-right-chevron\"></span>"],
				responsive:{
                    0:{
						items:1
					},
					480:{
						items:1
					},
					600:{
						items:2
					},
					800:{
						items:3
					},				
					1200:{
						items:slider_attr.item_show
					}					
                }
            });
        }							
		
	};
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_choose_us.default', choose_carousel_js);
    });	

})(window.jQuery);