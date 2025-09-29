(function($) {
	
	"use strict";
	var project_carousel_js = function($scope, $) {
		
		var design_one = $('.counsolve-project-three-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-project-slider').data('slider');
            $('.counsolve-project-three-item-carousel').owlCarousel({
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
		
		var design_one = $('.counsolve-project-two-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-project-slider-v2').data('slider');
            $('.counsolve-project-two-item-carousel').owlCarousel({
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
						items:2
					},			
					1200:{
						items:slider_attr.item_show
					}					
                }
            });
        }			
				
	};
	
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_project_carousel.default', project_carousel_js);
    });	
	

})(window.jQuery);