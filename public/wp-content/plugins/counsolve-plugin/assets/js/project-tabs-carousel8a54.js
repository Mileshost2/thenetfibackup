(function($) {
	
	"use strict";
	var project_tab_carousel_js = function($scope, $) {
		
		//Project Tabs
		if($('.project-tab').length){
			$('.project-tab .project-tab-btns .p-tab-btn').on('click', function(e) {
				e.preventDefault();
				var target = $($(this).attr('data-tab'));
				
				if ($(target).hasClass('actve-tab')){
					return false;
				}else{
					$('.project-tab .project-tab-btns .p-tab-btn').removeClass('active-btn');
					$(this).addClass('active-btn');
					$('.project-tab .p-tabs-content .p-tab').removeClass('active-tab');
					$(target).addClass('active-tab');
				}
			});
		}
		
		var design_one = $('.project-counsolve-four-item-carousel'); 
        if(design_one.length){
            var slider_attr = $('.project-counsolve-four-item-carousel').data('slider');
            $('.project-counsolve-four-item-carousel').owlCarousel({
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
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_project_tab_carousel.default', project_tab_carousel_js);
    });	
	

})(window.jQuery);