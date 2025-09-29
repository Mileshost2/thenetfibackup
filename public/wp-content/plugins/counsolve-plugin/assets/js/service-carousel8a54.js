(function($) {
	
	"use strict";
	var service_carousel_js = function($scope, $) {
		
		var design_one = $('.counsolve-service-three-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-service-slider').data('slider');
            $('.counsolve-service-three-item-carousel').owlCarousel({
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
						items:2
					},				
					1200:{
						items:slider_attr.item_show
					}					
                }
            });
        }
		
		var design_one = $('.counsolve-service-four-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-service-slider-v2').data('slider');
            $('.counsolve-service-four-item-carousel').owlCarousel({
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
		
		var design_one = $('.counsolve-service-single-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-service-slider-v3').data('slider');
            $('.counsolve-service-single-item-carousel').owlCarousel({
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
						items:1
					},
					800:{
						items:1
					},				
					1200:{
						items:slider_attr.item_show
					}					
                }
            });
        }
					
		
	};
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_service_carousel.default', service_carousel_js);
    });	

})(window.jQuery);