(function($) {
	
	"use strict";
	var about_carousel_js = function($scope, $) {
		
		
		if($('.curved-circle').length) {
			$('.curved-circle').circleType({position: 'absolute', dir: 1, radius: 270, forceHeight: true, forceWidth: true});
		}
	
		if($('.curved-circle-2').length) {
			$('.curved-circle-2').circleType({position: 'absolute', dir: 1, radius: 270, forceHeight: true, forceWidth: true});
		}
	
		if($('.curved-circle-3').length) {
			$('.curved-circle-3').circleType({position: 'absolute', dir: 1, radius: 270, forceHeight: true, forceWidth: true});
		}
	
		if($('.curved-circle-4').length) {
			$('.curved-circle-4').circleType({position: 'absolute', dir: 1, radius: 270, forceHeight: true, forceWidth: true});
		}		
		
	};
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_about_us.default', about_carousel_js);
    });	

})(window.jQuery);