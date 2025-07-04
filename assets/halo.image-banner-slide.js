(function ($) {
    var halo = {
        imageBannderSlide: function() {
            var imageBanner = $('[data-image-banner-slide]');
            
            imageBanner.each(function() {
                var self = $(this),
                    arrowEnable = self.data('arrows')
                    dotEnable = self.data('dots')
                    autoplay = self.data('autoplay')
                    autoplaySpeed = self.data('autoplay-speed')
                    variablewidth = self.data('variablewidth')
                    initialslide = self.data('initialslide')
                    fade = self.data('fade')
                    centermode = self.data('centermode')
                    slidestoshow = self.data('slidestoshow')
                    centerpadding = self.data('centerpadding')
                self.slick({
                    centerMode: centermode,
                    centerPadding: centerpadding + 'px',
                    infinite: true,
                    speed: autoplaySpeed,
                    autoplay: autoplay,         
                    arrows: arrowEnable,
                    dots: dotEnable,
                    fade: fade,
                    nextArrow: window.arrows.icon_next,
                    prevArrow: window.arrows.icon_prev,
                    rtl: window.rtl_slick,
                    initialSlide: initialslide,
                    slidesToShow: slidestoshow,
                    responsive: [
                      {
                        breakpoint: 768,
                        settings: {
                          fade: true
                        }
                      },
                        // {
                        //     breakpoint: 1500,
                        //     settings: {
                        //         arrows: false,
                        //     }
                        // },
                    ]
                });
            });
        }
    }
    halo.imageBannderSlide();

    $('.steps_lists .step_item').on('click', function() {
        const index = $(this).index()
      
        $('.steps_lists .step_item').removeClass('active')
      
        $('#shopify-section-template--17695539560679__image_banner_iFNJCT #halo-image-banner-template--17695539560679__image_banner_iFNJCT .slideshow.slick-slider').slick('slickGoTo', index)
        
        
        if(index == 0) {
          $('.steps_lists .step_item:nth-of-type(1)').addClass('active')
          $('.steps_lists .step_item:nth-of-type(4)').addClass('active')
          $('.steps_lists .step_item:nth-of-type(7)').addClass('active')
        } else if (index == 1) {
          $('.steps_lists .step_item:nth-of-type(2)').addClass('active')
          $('.steps_lists .step_item:nth-of-type(5)').addClass('active')
          $('.steps_lists .step_item:nth-of-type(8)').addClass('active')
        } else if (index == 2) {
          $('.steps_lists .step_item:nth-of-type(3)').addClass('active')
          $('.steps_lists .step_item:nth-of-type(6)').addClass('active')
          $('.steps_lists .step_item:nth-of-type(9)').addClass('active')
        }
    })
    $('.steps_list_mb .steps_list_mb_item').on('click', function() {
      const index = $(this).index()
      
      $('#shopify-section-template--17695539560679__image_banner_iFNJCT #halo-image-banner-template--17695539560679__image_banner_iFNJCT .slideshow.slick-slider').slick('slickGoTo', index)
      $(this).addClass('active_mb').siblings().removeClass('active_mb');
    })

    // 移动端滑动切换
     $('#shopify-section-template--17695539560679__image_banner_iFNJCT .slick-slider').on('afterChange', function(ev) {
       switch(`${ev.target.slick.currentSlide}`) {
          case '0':
             $('.steps_list_mb .steps_list_mb_item').removeClass('active_mb')
             $('.steps_list_mb .steps_list_mb_item:nth-of-type(1)').addClass('active_mb')
          break;
          case '1':
             $('.steps_list_mb .steps_list_mb_item').removeClass('active_mb')
             $('.steps_list_mb .steps_list_mb_item:nth-of-type(2)').addClass('active_mb')
          break;
          case '2':
             $('.steps_list_mb .steps_list_mb_item').removeClass('active_mb')
             $('.steps_list_mb .steps_list_mb_item:nth-of-type(3)').addClass('active_mb')
          break;
         default:
       }
     })
})(jQuery);