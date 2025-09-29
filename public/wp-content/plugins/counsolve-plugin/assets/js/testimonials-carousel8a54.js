(function($) {
	
	"use strict";
	var testi_carousel_js = function($scope, $) {
		
		var design_one = $('.counsolve-testimonial-four-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-testi-slider').data('slider');
            $('.counsolve-testimonial-four-carousel').owlCarousel({
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
		
		var design_one = $('.counsolve-single-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('#yt-testi-slider-v2').data('slider');
            $('.counsolve-single-item-carousel').owlCarousel({
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
		
		
		// bx-slider
		if ($('.testimonial-slider .bxslider').length) {
			$('.testimonial-slider .bxslider').bxSlider({
				nextText: '<i class="flaticon-up-chevron"></i>',
				prevText: '<i class="flaticon-down-arrow"></i>',
				auto: true,
				mode: 'vertical',
				maxSlides: 1,
				minSlides: 1,
				moveSlides: 1,
				pause: 5000,
				speed: 700,
				pager: false
			});
		}		
		
	};
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_testimonials_carousel.default', testi_carousel_js);
    });	

})(window.jQuery);