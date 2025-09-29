(function($) {
	
	"use strict";
	var industries_carousel_js = function($scope, $) {
		
		//industry-tab
		if($('.industry-tab').length){
			$('.industry-tab .industry-tab-btns .p-tab-btn').on('click', function(e) {
				e.preventDefault();
				var target = $($(this).attr('data-tab'));
				
				if ($(target).hasClass('actve-tab')){
					return false;
				}else{
					$('.industry-tab .industry-tab-btns .p-tab-btn').removeClass('active-btn');
					$(this).addClass('active-btn');
					$('.industry-tab .p-tabs-content .p-tab').removeClass('active-tab');
					$(target).addClass('active-tab');
				}
			});
		}
		
	};
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_industries_tabs.default', industries_carousel_js);
    });	

})(window.jQuery);