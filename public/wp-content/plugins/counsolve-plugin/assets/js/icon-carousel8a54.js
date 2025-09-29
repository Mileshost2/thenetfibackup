(function($) {
	
	"use strict";
	var icon_carousel_js = function($scope, $) {		
		
		var design_one = $('.counsolve-icon-single-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-icon-slider').data('slider');
            $('.counsolve-icon-single-item-carousel').owlCarousel({
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
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_icon_box.default', icon_carousel_js);
    });	

})(window.jQuery);