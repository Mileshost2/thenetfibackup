(function($) {
	
	"use strict";
	var cs_counter_js = function($scope, $) {
		//Timer Countdown
		if($('.timer').length){
		   $(function(){
			    $('[data-countdown]').each(function() {
			   var $this = $(this), finalDate = $(this).data('countdown');
			   $this.countdown(finalDate, function(event) {
			     $this.html(event.strftime('%D days %H:%M:%S'));
			   });
			 });
			});

		   $('.cs-countdown').countdown('').on('update.countdown', function(event) {
			  var $this = $(this).html(event.strftime('<div class="count-col"><span>%D</span><h6>days</h6></div> <div class="count-col"><span>%H</span><h6>Hrs</h6></div> <div class="count-col"><span>%M</span><h6>Mins</h6></div> <div class="count-col"><span>%S</span><h6>Secs</h6></div>'));
			});
		}
	};
	$(window).on('elementor/frontend/init', function () {
            elementorFrontend.hooks.addAction('frontend/element_ready/counsolve_coming_soon.default', cs_counter_js);
    });	

})(window.jQuery);



