(function($) {
	
	"use strict";
	var client_carousel_js = function($scope, $) {
		
		var design_one = $('.counsolve-client-five-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-client-slider').data('slider');
            $('.counsolve-client-five-item-carousel').owlCarousel({
                loop:slider_attr.infinite,
				margin:slider_attr.item_gap,
				nav:slider_attr.arrows,
				smartSpeed: slider_attr.autoplaySpeed,
				autoplay: slider_attr.autoplay,
				infinite: slider_attr.infinite,
				"navText": ["<span class=\"flaticon-thin-right-straight-arrow\"></span>","<span class=\"flaticon-thin-right-straight-arrow\"></span>"],
				responsive:{
                    0:{
						items:1
					},
					480:{
						items:2
					},
					600:{
						items:3
					},
					800:{
						items:4
					},				
					1200:{
						items:slider_attr.item_show
					}					
                }
            });
        }
		
	};
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_clients.default', client_carousel_js);
    });	

})(window.jQuery);