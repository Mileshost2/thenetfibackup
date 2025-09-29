(function($) {
	
	"use strict";
	var banners_js = function($scope, $) {
		
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
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_banner.default', banners_js);
    });	

})(window.jQuery);