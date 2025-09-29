(function($) {
	
	"use strict";
	var banner_carousel_js = function($scope, $) {
		
		var design_one = $('.banner-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-banner-slider').data('slider');
            $('.banner-carousel').owlCarousel({
                loop:slider_attr.infinite,
				margin:slider_attr.item_gap,
				nav:true,
				animateOut: 'fadeOut',
				animateIn: 'fadeIn',
				active: true,
				smartSpeed: slider_attr.autoplaySpeed,
				autoplay: slider_attr.autoplay,
				infinite: slider_attr.infinite,
				"navText": ["<span class=\"flaticon-up-chevron\"></span>","<span class=\"flaticon-down-arrow\"></span>"],			
                responsive:{
                    0: {
                        items: 1
                    },
					600:{
						items: 1
					},
					800:{
						items: 1
					},			
					1024:{
						items:slider_attr.item_show
					}
                }
            });
        }		
		
	};
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_banner_carousel.default', banner_carousel_js);
    });	

})(window.jQuery);