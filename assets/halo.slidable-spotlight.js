(function ($) {
	var halo = {
	    initSlidableSpotlight: function () {
          
            var slidableSpotlights = $('[data-slidable-spotlight]');

            if (slidableSpotlights.length) {
                slidableSpotlights.each(function () {
                    var self = $(this);
                    if (self.not('.slick-initialized')) {
                      $('.halo-block-content-B').slick({
                        slidesToShow: 3, 
                        slidesToScroll: 1,
                        fade: false,
                        arrows: true,
                        dots: false,
                        centerMode: true,
                        focusOnSelect: true,
                        asNavFor: '.halo-block-content-L',
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        infinite: true, 
                        centerMode: true,
                      })
                      $('.halo-block-content-L').slick({
                          dots: false,
                          slidesToShow: 1, 
                          slidesToScroll: 1,
                          centerMode: true,
                          focusOnSelect: true,
                          arrows: false,
                          fade: true,
                          infinite: true, 
                          asNavFor: '.halo-block-content-B'
                      })
                    }
                });
            };
        }
	}
	halo.initSlidableSpotlight();
    if ($('body').hasClass('cursor-fixed__show')){
        window.sharedFunctionsAnimation.onEnterButton();
        window.sharedFunctionsAnimation.onLeaveButton();
    }
})(jQuery);
