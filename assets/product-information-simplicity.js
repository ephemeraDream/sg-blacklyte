// 导航栏处理
setTimeout(() => {
  const top_bar = document.querySelectorAll(".shopify-section.shopify-section-group-header-group")
  top_bar.forEach(el => {
    el.style.setProperty("position", "relative", "important");
    el.style.setProperty("top", "0", "important");
  });
}, 0)
let hasInitializedSwiper = false;

window.addEventListener('resize', () => {
  if (img_show_type === "grid" && window.innerWidth < 768 && !hasInitializedSwiper) {
    hasInitializedSwiper = true;
    checkVisibleElements(() => {
      initSwiper();
    });
  }
});
// initResizeListener()
// function initResizeListener() {
//   let resizeTicking = false;

//   function onResize() {
//     if (window.innerWidth > 1000) {
//       initSwiperHeight()
//     }
//     initColorContainHeight()

//     resizeTicking = false;
//   }

//   window.addEventListener("resize", () => {
//     if (!resizeTicking) {
//       requestAnimationFrame(onResize);
//       resizeTicking = true;
//     }
//   });
// }
// if (window.innerWidth > 1000) {
//   initSwiperHeight()
// }
// function initSwiperHeight() {
//   const swiper = document.querySelector(".product_infor_simplicity .imgmain-swiper");
//   if (!swiper) return;

//   let ticking = false;

//   function updateSwiperHeight() {
//     const scrollY = window.scrollY;

//     if (scrollY >= 0 && scrollY <= 114) {
//       const height = `calc(100vh - ${114 - scrollY}px - 6.77084vw)`;
//       swiper.style.height = height;
//     } else if (scrollY > 114) {
//       swiper.style.height = `calc(100vh - 0px - 6.77084vw)`;
//     }

//     ticking = false;
//   }

//   window.addEventListener("scroll", function () {
//     if (!ticking) {
//       requestAnimationFrame(updateSwiperHeight);
//       ticking = true;
//     }
//   });

//   updateSwiperHeight()
// }
const navbar = document.querySelector(".product_infor_navbar");
if (navbar) {
  const navbarOffsetTop = navbar.offsetTop;
  let scrollFunction = () => {
    if (window.scrollY >= navbarOffsetTop) {
      navbar.style.position = "fixed";
    } else {
      navbar.style.position = "relative";
    }
  }
  window.addEventListener("scroll", scrollFunction);
}
// color view
// initColorContainHeight()
function initColorContainHeight() {
  const getTotalHeightWithMargin = (element) => {
    const style = window.getComputedStyle(element);
    const height = element.offsetHeight;
    const marginTop = parseFloat(style.marginTop);

    return height + marginTop;
  }

  const getVisibleItemsTotalHeight = (contain) => {
    const allItems = contain.querySelectorAll('.product_infor_simplicity_right_select_item:not(.product_infor_simplicity_right_select_item_hidden)');
    let totalHeight = 0;

    allItems.forEach(item => {
      totalHeight += getTotalHeightWithMargin(item);
    });

    return totalHeight + titleHeight;
  }

  const colorContain = document.querySelector(".product_infor_simplicity_right_product_contain[data-type='Color']")
  const originHeight = colorContain.clientHeight;
  const titleHeight = colorContain.querySelector(".product_infor_simplicity_right_select_title").clientHeight
  colorContain.style.maxHeight = getVisibleItemsTotalHeight(colorContain) + 'px';

  const viewMore = document.querySelector(".product_infor_simplicity_right_product_viewmore")
  if (viewMore) {
    viewMore.addEventListener("click", (event) => {
      viewMore.classList.toggle("show");
      window.removeEventListener("scroll", scrollFunction)
      if (viewMore.classList.contains("show")) {
        colorContain.style.maxHeight = originHeight + 'px';
        scrollFunction = () => {
          if (window.scrollY >= navbarOffsetTop + originHeight - getVisibleItemsTotalHeight(colorContain)) {
            navbar.style.position = "fixed";
          } else {
            navbar.style.position = "relative";
          }
        }
        window.addEventListener("scroll", scrollFunction);
        viewMore.querySelector("span").innerHTML = "View less"
      } else {
        colorContain.style.maxHeight = getVisibleItemsTotalHeight(colorContain) + 'px';
        scrollFunction = () => {
          if (window.scrollY >= navbarOffsetTop) {
            navbar.style.position = "fixed";
          } else {
            navbar.style.position = "relative";
          }
        }
        window.addEventListener("scroll", scrollFunction);
        viewMore.querySelector("span").innerHTML = "View more"
      }
    })
  }
}

// swiper相关
let imgthumbSwiper, imgboxSwiper;
let initialSlide = 0;
function initSwiper() {
  imgthumbSwiper = new Swiper('.imgthumb-swiper', {
    // loop: true,
    spaceBetween: 6,
    slidesPerView: 'auto',
    freeMode: true,
    watchSlidesProgress: true,
    on: {
      click: function (swiper, event) {
        if (show_degree) {
          document.querySelector('.spin-360').classList.remove('act');
          document.querySelector(".icon-360").classList.remove("hide");
        }
        // initialSlide = swiper.clickedIndex;
      },
      init: function (swiper) {
        judgeImgthumbNavigationDisplay(swiper)
      },
      slideChange: function (swiper) {
        judgeImgthumbNavigationDisplay(swiper)
      },
      reachBeginning: function () {
        const prevBtn = document.querySelector(".imgthumb-swiper .imgthumb-swiper-prev")
        prevBtn.classList.add("hide")
      },
      reachEnd: function () {
        const nextBtn = document.querySelector(".imgthumb-swiper .imgthumb-swiper-next")
        nextBtn.classList.add("hide")
      },
    },
    initialSlide: initialSlide,
    navigation: {
      nextEl: '.imgthumb-swiper .imgthumb-swiper-next',
      prevEl: '.imgthumb-swiper .imgthumb-swiper-prev',
    },
  });
  imgboxSwiper = new Swiper('.imgmain-swiper', {
    loop: true,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    spaceBetween: 0,
    navigation: {
      nextEl: '.imgmain-swiper .imgmain-swiper-next',
      prevEl: '.imgmain-swiper .imgmain-swiper-prev',
    },
    thumbs: {
      swiper: imgthumbSwiper,
    },
    initialSlide: initialSlide,
    on: {
      init: function (swiper) {
        // 获取当前 active slide
        let activeSlide = swiper.slides[initialSlide];

        // 获取图片元素
        let img = activeSlide.querySelector('img');

        // 确保图片已加载
        if (img && img.complete) {
          adjustImageFit(img);
        } else {
          img.onload = function () {
            adjustImageFit(img);
          };
        }
      },
      slideChange: function () {
        if (imgboxSwiper.destroyed) return;
        initialSlide = imgboxSwiper.realIndex;
        // 获取当前 active slide
        let activeSlide = imgboxSwiper.slides[imgboxSwiper.realIndex];

        // 获取图片元素
        let img = activeSlide.querySelector('img');

        // 确保图片已加载
        if (img && img.complete) {
          adjustImageFit(img);
        } else {
          img.onload = function () {
            adjustImageFit(img);
          };
        }
      },
    },
  });
}
// 调整图片显示方式
function adjustImageFit(img) {
  const aspectRatio = img.naturalWidth / img.naturalHeight;
  if (aspectRatio > 1) {
    img.style.objectFit = 'cover'; // 宽图
  } else {
    img.style.objectFit = 'contain'; // 窄图
  }
}
function judgeImgthumbNavigationDisplay(swiper) {
  const nextBtn = document.querySelector(".imgthumb-swiper .imgthumb-swiper-next")
  const prevBtn = document.querySelector(".imgthumb-swiper .imgthumb-swiper-prev")
  if (swiper.isBeginning) {
    prevBtn.classList.add("hide")
  } else {
    prevBtn.classList.remove("hide")
  }
  if (swiper.isEnd) {
    nextBtn.classList.add("hide")
  } else {
    nextBtn.classList.remove("hide")
  }
}
// 监测swiper是否可见
function checkVisibleElements(callback) {
  waitForElement('.product_infor_simplicity_left', (target) => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          window.requestAnimationFrame(callback); // 使用 rAF 确保 UI 就绪
        }
      },
      {
        root: null,
        threshold: 0.01, // 降低检测阈值
        rootMargin: '500px', // 提前 500px 触发检测
      }
    );

    observer.observe(target);
  });
}
if ((img_show_type == "thumb" || (img_show_type == "grid" && window.innerWidth < 768)) && !hasInitializedSwiper) {
  hasInitializedSwiper = true;
  checkVisibleElements(() => {
    initSwiper()
  });
}

//底部悬浮窗展示监测判断
toggleBottomBar();
function toggleBottomBar() {
  const targetSelector = ".product_infor_simplicity_left";
  const bottomBar = document.querySelector(".simplicity_bottom_bar");
  const pmdTargetSelector = ".product_infor_simplicity_right_buybox_price.pmd_show";
  const buyboxTargetSelector = ".product_infor_simplicity_right_buybox";

  if (!bottomBar) return; // 确保目标元素存在

  function initObserver(target, threshold) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            bottomBar.style.zIndex = -1;
            bottomBar.style.opacity = 0;
          } else {
            bottomBar.style.zIndex = 99;
            bottomBar.style.opacity = 1;
          }
        });
      },
      {
        root: null, // 视口
        threshold: threshold
      }
    );

    observer.observe(target);
  }

  if (window.innerWidth > 1000) {
    if (product_type === "chair") {
      waitForElement(targetSelector, (target) => {
        initObserver(target, 0.6)
      });
    } else {
      waitForElement(targetSelector, (target) => {
        initObserver(target, 0.4)
      });
    }
  } else {
    waitForElement(pmdTargetSelector, (target) => {
      initObserver(target, 0)
    });

    waitForElement(buyboxTargetSelector, (target) => {
      initObserver(target, 0.3)
    });
  }
}
// function toggleBottomBar() {
//   const targetSelector = ".product_infor_simplicity_right_buybox";
//   const pmdTargetSelector = ".product_infor_simplicity_right_buybox_price.pmd_show";
//   const bottomBar = document.querySelector(".simplicity_bottom_bar");

//   if (!bottomBar) return; // 确保目标元素存在

//   waitForElement(targetSelector, (target) => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             bottomBar.style.display = "none";
//           } else {
//             bottomBar.style.display = "block";
//           }
//         });
//       },
//       {
//         root: null, // 视口
//         threshold: 0.3
//       }
//     );

//     observer.observe(target);
//   });

//   if (window.innerWidth < 768) {
//     waitForElement(pmdTargetSelector, (target) => {
//       const observer = new IntersectionObserver(
//         (entries) => {
//           entries.forEach((entry) => {
//             if (entry.isIntersecting) {
//               bottomBar.style.display = "none";
//             } else {
//               bottomBar.style.display = "block";
//             }
//           });
//         },
//         {
//           root: null, // 视口
//           threshold: 0
//         }
//       );

//       observer.observe(target);
//     });
//   }
// }
// 等待元素dom加载
function waitForElement(selector, callback) {
  const element = document.querySelector(selector);
  if (element) {
    callback(element);
    return;
  }

  const observer = new MutationObserver((mutations, obs) => {
    const element = document.querySelector(selector);
    if (element) {
      obs.disconnect();
      callback(element);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
// option点击事件
initOptionClick();
function initOptionClick(optionList) {
  document.querySelectorAll(".product_infor_simplicity_right_product_contain").forEach((container) => {
    const type = container.getAttribute("data-type");
    if ((!optionList && type) || (optionList && optionList.includes(type))) {
      container.addEventListener("click", (event) => {
        const target = event.target.closest(".product_infor_simplicity_right_select_item");
        if (!target || target.classList.contains("product_infor_simplicity_right_select_item_active") || target.classList.contains("product_infor_simplicity_right_select_item_diasbled")) return;

        const items = container.querySelectorAll(".product_infor_simplicity_right_select_item");
        items.forEach((item) => item.classList.remove("product_infor_simplicity_right_select_item_active"));
        target.classList.add("product_infor_simplicity_right_select_item_active");

        if (type === "series") {
          const handle = target.getAttribute("data-handle");
          changeSeries(handle)
          return;
        }

        if (type === "Size") {
          // const variantId = target.getAttribute("data-id");
          // const url = new URL(window.location.href);
          // if (variantId) {
          //   url.searchParams.set("variant", variantId);
          // } else {
          //   url.searchParams.delete("variant");
          // }
          // window.history.replaceState(null, "", url.toString());
          if (specsSwiper) {
            const index = target.getAttribute('data-index');
            specsSwiper.slideTo(index);
          }
          // return;
        }

        if (type === "Color" && product_type === "desk") {
          const selectSize = document.querySelector(`.product_infor_simplicity_right_product_contain[data-type='Size'] .product_infor_simplicity_right_select_item_active`).getAttribute("data-value")
          const selectColor = target.getAttribute("data-value");
          let variant = product.variants.find(item => item.option1 === selectColor && item.option2 === selectSize && item.available);
          if (!variant) {
            variant = product.variants.find(item => item.option1 === selectColor && item.available);
          }
          changeVariant(variant.id, type)
          return
        }

        const variantId = target.getAttribute("data-id");
        changeVariant(variantId, type)
      });
    }
  });
}
// 变体切换
function changeVariant(variantId, type) {
  const swiperContain = document.querySelector('.product_infor_simplicity_left_contain');
  swiperContain.style.opacity = '0';

  fetch(location.pathname + `?variant=${variantId}`)
    .then((response) => response.text())
    .then((data) => {
      const parser = new DOMParser();
      const html = parser.parseFromString(data, "text/html");

      // swiper模块
      changeVariantSwiper(swiperContain, html)
      // 多属性模块
      let optionList = [];
      if (type === "Material") {
        optionList.push("Color")
      }
      if (type === "Color") {
        optionList.push("Color")
        optionList.push("Material")
        optionList.push("Size")
      }
      changeVariantOption(html, optionList)
      // addons模块
      changeVariantAddons(html)
      // 购买模块
      const quantity = document.querySelector(".product_infor_simplicity_right_buybox_quantity_input").value
      changeVariantBuyBox(html, quantity)
      document.querySelector('.product_extrainfo').innerHTML = html.querySelector('.product_extrainfo').innerHTML;
      initRefundModal()
      // 切换变体地址
      const url = new URL(window.location.href);
      url.searchParams.set("variant", variantId);
      window.history.replaceState(null, "", url.toString());
    });
}
// 系列产品切换
function changeSeries(handle) {
  const swiperContain = document.querySelector('.product_infor_simplicity_left_contain');
  swiperContain.style.opacity = '0';
  const handleMap = {
    "blacklyte-kraken-pro-gaming-chair": ["schwarzer-kraken-pro-gaming-chair", "blacklyte-silla-de-juego-profesional-kraken", "blacklyte-kraken-pro-pro-gaming-chair", "blacklyte-chaise-de-jeu-kraken-pro"],
    "blacklyte-kraken-gaming-chair": ["schwarzer-kraken-gaming-stuhl", "blacklyte-silla-de-juego-kraken", "blacklyte-kraken-gaming-chair", "blacklyte-chaise-de-jeu-kraken"],
    "blacklyte-athena-pro-gaming-chair": ["schwarzer-athena-pro-gaming-chair", "blacklyte-silla-de-juego-de-athena-pro", "blacklyte-athena-pro-gaming-chair", "blacklyte-chaise-de-jeu-athena-pro"],
    "blacklyte-athena-gaming-chair": ["schwarzer-athena-gaming-chair", "blacklyte-silla-de-juego-de-athena", "blacklyte-athena-gaming-chair", "blacklyte-chaise-de-jeu-athena"],
  };
  const getEnglishHandle = (handle) => {
    for (let english in handleMap) {
      if (
        handleMap[english].some((c) => c === handle) ||
        english === handle
      ) {
        return english;
      }
    }
  }

  fetch(`/products/${window.location.host.indexOf(".eu") > -1 ? getEnglishHandle(handle) : handle}.js`)
    .then(response => response.json())
    .then(data => {
      const activeColor = document.querySelector(".product_infor_simplicity_right_product_contain[data-type='Color'] .product_infor_simplicity_right_select_item_active").getAttribute("data-value")
      const activeMaterial = document.querySelector(".product_infor_simplicity_right_product_contain[data-type='Material'] .product_infor_simplicity_right_select_item_active").getAttribute("data-value")
      let showVariant = data.variants.find(item => item.option2 === activeColor && item.option1 === activeMaterial && item.available)
      if (!showVariant) {
        showVariant = data.variants[0]
      }

      if (showVariant) {
        fetch(`/products/${handle}?variant=${showVariant.id}`)
          .then((response) => response.text())
          .then((data) => {
            const parser = new DOMParser();
            const html = parser.parseFromString(data, "text/html");

            // swiper模块
            changeVariantSwiper(swiperContain, html)
            // 多属性模块
            const optionList = ["Material", "Size", "Color"];
            changeVariantOption(html, optionList)
            // addons模块
            changeVariantAddons(html)
            // 购买模块
            const quantity = document.querySelector(".product_infor_simplicity_right_buybox_quantity_input").value
            changeVariantBuyBox(html, quantity)
            // extra模块
            changeExtraInfo(html)
            // 切换变体地址
            const url = new URL(`${window.location.origin}/products/${handle}?variant=${showVariant.id}`);
            window.history.replaceState(null, "", url.toString());
          });
      }
    });
}
function changeVariantSwiper(swiperContain, html) {
  if (show_degree) {
    const isShowSpin = document.querySelector(".spin-360").classList.contains("act");
    if (!isShowSpin) {
      html.querySelector(".spin-360").classList.remove("act")
      html.querySelector(".icon-360").classList.remove("hide");
    }
  }
  swiperContain.innerHTML = html.querySelector(".product_infor_simplicity_left_contain").innerHTML;
  document.querySelector(".icon-360").addEventListener("click", (e) => {
    document.querySelector(".spin-360").classList.add("act");
    document.querySelector(".icon-360").classList.add("hide");
  });
  if (show_degree) {
    const firstImage = document.querySelector('.product-360-image');
    const done = () => {
      firstImage.removeEventListener('load', done);
      firstImage.removeEventListener('error', done);
      swiperContain.style.opacity = '1';
    };
    if (firstImage.complete) {
      swiperContain.style.opacity = '1';
    } else {
      firstImage.addEventListener('load', done);
      firstImage.addEventListener('error', done);
    }
  } else {
    swiperContain.style.opacity = '1';
  }

  if (img_show_type == "thumb" || (img_show_type == "grid" && window.innerWidth < 768)) {
    initSwiper()
  }

  if (show_degree) {
    const images = document.querySelectorAll('.product-360-image');
    let currentIndex = 0;
    let imageCount = images.length;

    const handleMouseMove = (event) => {
      let mouseX = event.clientX || event.touches?.[0]?.clientX || 0;
      let viewerRect = viewer.getBoundingClientRect();
      let relativeX = mouseX - viewerRect.left;
      let newIndex = Math.floor((relativeX / viewerRect.width) * imageCount);

      newIndex = Math.max(0, Math.min(newIndex, imageCount - 1));

      if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        images.forEach((img, i) => {
          img.style.opacity = i === currentIndex ? '1' : '0';
        });
      }
    }

    const viewer = document.getElementById('product-360-viewer');
    viewer.addEventListener('mousemove', handleMouseMove);
    viewer.addEventListener('touchmove', handleMouseMove);
  }
  // if (window.innerWidth > 1000) {
  //   initSwiperHeight()
  // }
}
function changeVariantOption(html, optionList) {
  optionList.forEach(type => {
    let targetContainer = document.querySelector(`.product_infor_simplicity_right_product_contain[data-type="${type}"] .product_infor_simplicity_right_select_itembox`);
    if (targetContainer) {
      // if (type === "Material") {
      //   targetContainer = targetContainer.querySelector(".product_infor_simplicity_right_select_materialbox")
      // }
      const oldItems = targetContainer.querySelectorAll('.product_infor_simplicity_right_select_item');
      oldItems.forEach(item => item.remove());
      const newItems = html.querySelectorAll(`.product_infor_simplicity_right_product_contain[data-type="${type}"] .product_infor_simplicity_right_select_item`);
      newItems.forEach(item => {
        targetContainer.appendChild(item);
      });
    }
  })
  initOptionClick(optionList);
  if (specsSwiper) {
    const sizeItem = document.querySelectorAll(".product_infor_simplicity_right_product_contain[data-type='Size'] .product_infor_simplicity_right_select_item")
    sizeItem.forEach((item, index) => {
      if (item.classList.contains("product_infor_simplicity_right_select_item_active")) {
        specsSwiper.slideTo(index);
      }
    })
  }
}
function changeVariantAddons(html) {
  const targetContainer = document.querySelector('.product_infor_simplicity_right_product_addons');
  if (targetContainer) {
    const targetElement = targetContainer.querySelector('.product_infor_simplicity_right_select_title');
    const oldItems = targetContainer.querySelectorAll('.product_infor_simplicity_right_select_item_addons');
    // const oldSelectItems = targetContainer.querySelectorAll('.product_infor_simplicity_right_select_item_addons_selectable');
    oldItems.forEach(item => item.remove());
    // oldSelectItems.forEach(item => item.remove());
    const newItems = html.querySelectorAll('.product_infor_simplicity_right_select_item_addons');
    [...newItems].reverse().forEach(item => {
      targetElement.insertAdjacentElement('afterend', item);
      // targetContainer.appendChild(item);
    });
    // const newSelectItems = html.querySelectorAll('.product_infor_simplicity_right_select_item_addons_selectable');
    // newSelectItems.forEach(item => {
    //   targetContainer.appendChild(item);
    // });
    // initSelectAddson()
  }
}
function changeVariantBuyBox(html, quantity) {
  document.querySelector(".product_infor_simplicity_right_buybox").innerHTML = html.querySelector(".product_infor_simplicity_right_buybox").innerHTML;
  document.querySelector(".simplicity_bottom_bar_contain").innerHTML = html.querySelector(".simplicity_bottom_bar_contain").innerHTML;
  document.querySelector(".product_infor_simplicity_right_buybox_price.pmd_show").innerHTML = html.querySelector(".product_infor_simplicity_right_buybox_price.pmd_show").innerHTML;
  document.querySelector(".product_infor_simplicity_right_header .product_infor_simplicity_right_buybox_price").innerHTML = html.querySelector(".product_infor_simplicity_right_header .product_infor_simplicity_right_buybox_price").innerHTML;
  document.querySelector(".product_infor_simplicity_right_buybox_quantity_input").value = quantity;
  const newBuybox = initBuybox();
  newBuybox.quantityBindPrice(quantity)
}
// 数量切换&加购和购买
initBuybox()
function initBuybox() {
  // 数量切换
  const quantityInput = document.querySelector(".product_infor_simplicity_right_buybox_quantity_input")
  document.querySelectorAll(".product_infor_simplicity_right_buybox_quantity_btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const type = btn.getAttribute("data-type");
      const quantity = Number(quantityInput.value)
      if (type === "minus" && quantity > 1) {
        quantityInput.value = quantity - 1
      }
      if (type === "plus" && quantity < 10) {
        quantityInput.value = quantity + 1
      }
      quantityBindPrice(quantityInput.value)
    });
  });
  if (quantityInput) {
    quantityInput.addEventListener("input", function (event) {
      let value = quantityInput.value.replace(/\D/g, ""); // 只保留数字
      if (value === "") {
        quantityInput.value = value;
        // quantityBindPrice(1)
        return;
      }

      value = Math.max(1, Math.min(10, parseInt(value, 10))); // 限制范围 1-10
      quantityInput.value = value;

      quantityBindPrice(value)
    });

    quantityInput.addEventListener('blur', function () {
      let value = quantityInput.value.replace(/\D/g, "");
      if (value == '') {
        quantityInput.value = 1;
        quantityBindPrice(1)
      }
    });
  }

  // 加购和购买
  document.querySelectorAll(".product_infor_simplicity_right_buybox_btns_btn").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const type = btn.getAttribute("data-type");
      const cartIcon = document.querySelector(".header--cart .header__icon--cart");
      const goods_id = document.querySelector("input[name='goods_id']").value
      const cartFormData = { items: [{ id: goods_id, quantity: Number(quantityInput.value) }] };
      const selectedAddsonItems = document.querySelectorAll(".product_infor_simplicity_right_select_item_addons_selectable.product_infor_simplicity_right_select_item_active")
      if (selectedAddsonItems.length) {
        selectedAddsonItems.forEach(item => {
          const id = item.getAttribute("data-id");
          const quantity = item.querySelector(".product_infor_simplicity_right_select_quantity_input").value
          cartFormData.items.push({ id: id, quantity: Number(quantity) })
        })
      }
      btn.classList.add("is_loading");
      if (type === "add_to_cart") {
        try {
          await fetch(window.Shopify.routes.root + "cart/add.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cartFormData),
          });

          Shopify.getCart((cartTotal) => {
            document.body.classList.add("cart-sidebar-show");
            updateSidebarCart(cartTotal);
          });
        } finally {
          btn.classList.remove("is_loading");
          setTimeout(() => cartIcon?.click(), 0);
        }
      }
      if (type === "buy_it_now") {
        // const buildCheckoutUrl = (id) =>
        //   `/cart/${id}:${Number(quantityInput.value)}?checkout`.replace(/([^:]\/)\/+/g, "$1");

        const buildCheckoutUrl = (items) => {
          const cartParams = items
            .map(item => `${item.id}:${item.quantity}`)
            .join(',');

          return `/cart/${cartParams}?checkout`;
        };

        location.href = buildCheckoutUrl(cartFormData.items)
        btn.classList.remove("is_loading");
      }
    });
  });

  return {
    quantityBindPrice
  };
}
function changeExtraInfo(html) {
  document.querySelector('.product_extrainfo').innerHTML = html.querySelector('.product_extrainfo').innerHTML;
  document.querySelector('.extra_info_bottom').innerHTML = html.querySelector('.extra_info_bottom').innerHTML;
  document.querySelector('.product_infor_simplicity_right_header').innerHTML = html.querySelector('.product_infor_simplicity_right_header').innerHTML;
  document.querySelector('.product_infor_navbar_select_head').innerHTML = html.querySelector('.product_infor_navbar_select_head').innerHTML;

  safeReplaceSections(html)

  setTimeout(() => {
    initRefundModal()
    document.querySelectorAll('.chat_now').forEach(el => {
      el.addEventListener('click', () => zE('messenger', 'open'));
    });

    const video = document.querySelector('.video_simplicity_video');
    const playIcon = document.querySelector('.video_simplicity_playicon');
    if (playIcon) {
      playIcon.addEventListener('click', function () {
        if (video.paused) {
          video.style.zIndex = 2;
          video.play();
        } else {
          video.pause();
        }
      });
    }

    sectionsObserver.disconnect();
    sections = [];
    sectionIds.forEach(sectionId => {
      sections.push(document.querySelector(`#${sectionId}`));
    });
    startIntersectionObserver(sections)

    const swiper_simplicity_swiper = document.querySelectorAll(".swiper_simplicity_swiper")
    if (swiper_simplicity_swiper.length) {
      const restartProgressAnimation = (ring) => {
        if (!ring) return;
        setTimeout(() => {
          ring.style.animation = 'circleProgress 5s linear forwards';
        }, 0);
      }

      swiper_simplicity_swiper.forEach(item => {
        const ring = item.closest(".swiper_simplicity").querySelector('.ring-progress');
        new Swiper(item, {
          loop: true,
          navigation: {
            nextEl: item.closest(".swiper_simplicity").querySelector(".swiper_simplicity_swiper_next"),
            prevEl: item.closest(".swiper_simplicity").querySelector(".swiper_simplicity_swiper_prev"),
          },
          autoplay: {
            delay: 5000,
            disableOnInteraction: false,
          },
          pagination: {
            el: item.closest(".swiper_simplicity").querySelector(".swiper_simplicity_pagination"),
          },
          on: {
            init: function () {
              restartProgressAnimation(ring);
            },
            slideChange: function () {
              ring.style.animation = 'none';
              restartProgressAnimation(ring);
            },
          },
        });
      })
    }

    if (window.innerWidth <= 768) {
      const img_with_text_box_simplicity = document.querySelector(".img_with_text_box_simplicity_contain.pmd_show")
      new Swiper(img_with_text_box_simplicity, {
        loop: true,
        initialSlide: 1,
        spaceBetween: 20,
        pagination: {
          el: '.img_with_text_box_simplicity .swiper-pagination',
        },
      });
    }

    (function ($) {
      $('.video-list-container').slick({
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        nextArrow: window.arrows.icon_next,
        prevArrow: window.arrows.icon_prev,
        dots: false,
        autoplay: false,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
              arrows: false,
              dots: true,
              autoplay: false,
            },
          },
        ],
      });

      // 函数：暂停所有视频
      function pauseAllVideos() {
        $('.video-list-container video').each(function () {
          this.pause();
          this.currentTime = 0; // 重置视频播放进度
        });
      }

      // 函数：播放当前视窗中的第一个视频
      function playFirstVisibleVideo() {
        const firstVisibleVideo = $('.slick-current video')[0]; // 获取当前滑块中的第一个视频
        if (firstVisibleVideo) {
          firstVisibleVideo.play();
        }
      }

      // 监听滑块切换事件
      $('.video-list-container').on('afterChange', function (event, slick, currentSlide) {
        pauseAllVideos(); // 切换时暂停所有视频
        playFirstVisibleVideo(); // 播放当前视窗中的第一个视频
        updateButtonOpacity(slick, currentSlide);
      });

      // 更新按钮的透明度
      function updateButtonOpacity(slick, currentSlide) {
        console.log('slick:', slick);
        console.log('currentSlide:', currentSlide);
        // 获取当前滑动的视频项
        var currentVideoItem = $(slick.$slides[currentSlide]);

        // 使当前视频的播放按钮透明度为 0，其他按钮透明度为 1
        currentVideoItem.find('.focusable-play-button').css('opacity', 0); // 当前视频按钮透明度为 0
        slick.$slides.not(currentVideoItem).find('.focusable-play-button').css('opacity', 1); // 其他视频按钮透明度为 1
      }

      // 初始化时播放第一个视频
      playFirstVisibleVideo();

      $('.video-list-container .video-item:first .focusable-play-button').css('opacity', 0);
      $('[data-slick-index="0"] .focusable-play-button').css('opacity', 0);

      // button点击播放视频
      $('.video-list-container').on('click', '.video-item', function () {
        // 获取当前点击的 video 元素
        var currentVideo = $(this).closest('.video-item').find('video')[0];

        // 暂停页面上的所有视频，并重置按钮透明度
        $('.video-list-container video').each(function () {
          var video = this;
          // 获取当前 video 所在的 button
          var button = $(this).closest('.video-item').find('button');

          if (video !== currentVideo) {
            video.pause(); // 暂停所有其他视频
            button.css('opacity', 1); // 将其他按钮的透明度设置为1
          }
        });

        // 播放当前视频，并将当前视频的按钮透明度设置为0, 暂停状态则播放, 播放状态则暂停
        if (currentVideo.paused) {
          currentVideo.play(); // 播放当前视频
          $(this).find('.focusable-play-button').css('opacity', 0); // 将当前按钮的透明度设置为0
        } else {
          currentVideo.pause(); // 暂停当前视频
          $(this).find('.focusable-play-button').css('opacity', 1); // 将当前按钮的透明度设置为1
        }
      });
    })(jQuery);
  }, 0);
}
function safeReplaceSections(html) {
  const mainContent = document.querySelector('#MainContent');
  if (!mainContent) return;

  // 第一个 section 保留
  const firstSection = mainContent.querySelector('.shopify-section');
  const oldSections = mainContent.querySelectorAll('.shopify-section');
  const newSections = html.querySelectorAll('#MainContent .shopify-section');

  // Step 1：构建新的 section，并隐藏（display: none）
  const fragment = document.createDocumentFragment();
  newSections.forEach((section, i) => {
    if (i > 0 && i !== newSections.length - 1) {
      const clone = section.cloneNode(true);
      clone.style.visibility = 'hidden';
      clone.style.opacity = '0';
      fragment.appendChild(clone);
    }
  });

  // Step 2：先移除旧 section（除第一个）
  oldSections.forEach((el, i) => {
    if (i > 0 && i !== oldSections.length - 1) el.remove();
  });

  // Step 3：插入 fragment（但都隐藏状态）
  mainContent.firstElementChild.after(fragment);

  // Step 4：下一帧统一触发显示（非闪烁）
  requestAnimationFrame(() => {
    const inserted = mainContent.querySelectorAll('.shopify-section');
    inserted.forEach((el, i) => {
      if (i > 0) {
        el.style.visibility = 'visible';
        el.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          requestAnimationFrame(() => {
            el.style.opacity = '1';
          });
        }, 0)
      }
    });
  });
}

function parseLocalizedNumber(str) {
  if (typeof str !== 'string') return NaN;
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  // 如果两者都有，判断哪个是小数点
  if (hasComma && hasDot) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // ',' 是小数点，'.' 是千位分隔符（欧洲风格）
      return parseFloat(str.replace(/\./g, '').replace(',', '.'));
    } else {
      // '.' 是小数点，',' 是千位分隔符（美式风格）
      return parseFloat(str.replace(/,/g, ''));
    }
  }

  // 仅有 ','，可能是小数或千分位，默认 ',' 为小数点
  if (hasComma) return parseFloat(str.replace(',', '.'));

  // 仅有 '.'，默认 '.' 是小数点
  return parseFloat(str);
}

function quantityBindPrice(quantity) {
  if (!quantity) quantity = document.querySelector(".product_infor_simplicity_right_buybox_quantity_input").value
  const discountPriceNodeList = document.querySelectorAll(".product_infor_simplicity_right_buybox_price_info_discount");
  const savePriceNodeList = document.querySelectorAll(".product_infor_simplicity_right_buybox_price_info_save");
  const opNodeList = document.querySelectorAll(".product_infor_simplicity_right_buybox_price_info_op");
  const mowithNodeList = document.querySelectorAll(".product_infor_simplicity_right_buybox_price_afterpay_mowith");
  const sixMowithNodeList = document.querySelectorAll(".product_infor_simplicity_right_buybox_price_afterpay_sixmowith");
  const currency_symbol = document.querySelector("input[name='currency_symbol']").value;
  let selectedAddsonItemsDp = 0, selectedAddsonItemsOp = 0, selectedAddsonItemsSave = 0
  const selectedAddsonItems = document.querySelectorAll(".product_infor_simplicity_right_select_item_addons_selectable.product_infor_simplicity_right_select_item_active")
  if (selectedAddsonItems.length) {
    selectedAddsonItems.forEach(item => {
      const discountPriceNode = item.querySelector(".product_infor_simplicity_right_select_dp.show");
      const opNode = item.querySelector(".product_infor_simplicity_right_select_op");
      const quantity = item.querySelector(".product_infor_simplicity_right_select_quantity_input").value
      if (discountPriceNode) {
        const discountPrice = parseLocalizedNumber(opNode.getAttribute("data-value")) - parseLocalizedNumber(discountPriceNode.getAttribute("data-value"));
        selectedAddsonItemsDp = safeAdd(selectedAddsonItemsDp, safeMul(discountPrice, Number(quantity)))
        selectedAddsonItemsSave = safeAdd(selectedAddsonItemsSave, safeMul(parseLocalizedNumber(discountPriceNode.getAttribute("data-value")), Number(quantity)))
      } else {
        selectedAddsonItemsDp = safeAdd(selectedAddsonItemsDp, safeMul(parseLocalizedNumber(opNode.getAttribute("data-value")), Number(quantity)))
      }
      selectedAddsonItemsOp = safeAdd(selectedAddsonItemsOp, safeMul(parseLocalizedNumber(opNode.getAttribute("data-value")), Number(quantity)))
    })
  }

  const discountPrice = discountPriceNodeList[discountPriceNodeList.length - 1].getAttribute("data-value");
  const updateDiscountPrice = parseLocalizedNumber(discountPrice) * Number(quantity)

  discountPriceNodeList.forEach(el => el.innerHTML = currency_symbol + safeAdd(updateDiscountPrice, selectedAddsonItemsDp))
  mowithNodeList.forEach(el => el.innerHTML = currency_symbol + (safeAdd(updateDiscountPrice, selectedAddsonItemsDp) / 12).toFixed(2))
  sixMowithNodeList.forEach(el => el.innerHTML = currency_symbol + (safeAdd(updateDiscountPrice, selectedAddsonItemsDp) / 6).toFixed(2))

  if (savePriceNodeList.length > 0) {
    const savePrice = savePriceNodeList[savePriceNodeList.length - 1].getAttribute("data-value");
    const updateSavePrice = parseLocalizedNumber(savePrice) * Number(quantity)
    savePriceNodeList.forEach(el => el.innerHTML = "Save " + currency_symbol + safeAdd(updateSavePrice, selectedAddsonItemsSave))
    opNodeList.forEach(el => el.innerHTML = currency_symbol + safeAdd(safeAdd(updateDiscountPrice, updateSavePrice), selectedAddsonItemsOp))
  }

}

//可选加购商品
initSelectAddson()
function initSelectAddson() {
  const selectAddsonItems = document.querySelectorAll(".product_infor_simplicity_right_select_item_addons_selectable")
  if (selectAddsonItems.length) {
    const initSelectAddsonItemBuybox = (contain) => {
      const selectAddsonItemQuantityBindPrice = (quantity) => {
        const discountPriceNode = contain.querySelector(".product_infor_simplicity_right_select_dp");
        const opNode = contain.querySelector(".product_infor_simplicity_right_select_op");
        const currency_symbol = document.querySelector("input[name='currency_symbol']").value;

        if (discountPriceNode) {
          const discountPrice = parseLocalizedNumber(opNode.getAttribute("data-value")) - parseLocalizedNumber(discountPriceNode.getAttribute("data-value"));
          const updateDiscountPrice = discountPrice * Number(quantity)

          discountPriceNode.innerHTML = currency_symbol + updateDiscountPrice
        }

        opNode.innerHTML = currency_symbol + safeMul(parseLocalizedNumber(opNode.getAttribute("data-value")), Number(quantity))

        if (contain.classList.contains("product_infor_simplicity_right_select_item_active")) {
          quantityBindPrice()
        }
      }
      // 数量切换
      const quantityInput = contain.querySelector(".product_infor_simplicity_right_select_quantity_input")
      contain.querySelectorAll(".product_infor_simplicity_right_select_quantity_btn").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          const type = btn.getAttribute("data-type");
          const quantity = Number(quantityInput.value)
          if (type === "minus" && quantity > 1) {
            quantityInput.value = quantity - 1
          }
          if (type === "plus" && quantity < 10) {
            quantityInput.value = quantity + 1
          }
          selectAddsonItemQuantityBindPrice(quantityInput.value)
        });
      });
      if (quantityInput) {
        quantityInput.addEventListener("input", function (event) {
          event.stopPropagation();
          let value = quantityInput.value.replace(/\D/g, ""); // 只保留数字
          if (value === "") {
            quantityInput.value = value;
            // quantityBindPrice(1)
            return;
          }

          value = Math.max(1, Math.min(10, parseInt(value, 10))); // 限制范围 1-10
          quantityInput.value = value;

          selectAddsonItemQuantityBindPrice(value)
        });

        quantityInput.addEventListener('blur', function () {
          let value = quantityInput.value.replace(/\D/g, "");
          if (value == '') {
            quantityInput.value = 1;
            selectAddsonItemQuantityBindPrice(1)
          }
        });
      }
    }

    selectAddsonItems.forEach(item => {
      item.querySelector(".product_infor_simplicity_right_select_quantity_box").addEventListener("click", (event) => {
        event.stopPropagation()
      })
      item.addEventListener("click", (event) => {
        if (event.target.closest('.product_infor_simplicity_right_select_feature_img')) {
          return;
        }
        item.classList.toggle("product_infor_simplicity_right_select_item_active")
        quantityBindPrice()
      })

      initSelectAddsonItemBuybox(item)
    })
  }
}

// 更新侧边栏购物车
function updateSidebarCart(cart) {
  if (cart && Object.keys(cart).length > 0) {
    const cartDropdown = document.querySelector(
      "#halo-cart-sidebar .halo-sidebar-wrapper .previewCart-wrapper"
    );
    if (!cartDropdown) return;

    const cartLoading = document.createElement("div");
    cartLoading.classList.add("loading-overlay", "loading-overlay--custom");
    cartLoading.innerHTML = `
             <div class="loading-overlay__spinner">
                 <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                     <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                 </svg>
             </div>
         `;

    cartDropdown.classList.add("is-loading");
    cartDropdown.prepend(cartLoading);

    fetch(window.routes.root + "/cart?view=ajax_side_cart", {
      cache: "no-store",
    })
      .then((response) => response.text())
      .then((data) => {
        cartDropdown.classList.remove("is-loading");
        cartDropdown.innerHTML = data;
      })
      .catch((error) => {
        console.error("Cart update error:", error);
      })
      .finally(() => {
        document
          .querySelectorAll("[data-cart-count]")
          .forEach((el) => (el.textContent = cart.item_count));

        document.querySelectorAll("[data-cart-text]").forEach((el) => {
          el.textContent =
            cart.item_count === 1
              ? window.cartStrings.item
              : window.cartStrings.items;
        });

        document.dispatchEvent(
          new CustomEvent("cart-update", { detail: cart })
        );

        if (document.body.classList.contains("cursor-fixed__show")) {
          window.sharedFunctionsAnimation.onEnterButton();
          window.sharedFunctionsAnimation.onLeaveButton();
        }
      });
  }
}
// 360点击展示
document.querySelector(".icon-360").addEventListener("click", (e) => {
  document.querySelector(".spin-360").classList.add("act");
  document.querySelector(".icon-360").classList.add("hide");
});
// 锚点栏下拉点击
const navbarSelect = document.querySelector(".product_infor_navbar_select");

if (navbarSelect) {
  navbarSelect.addEventListener("click", (e) => {
    e.stopPropagation();
    navbarSelect.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!navbarSelect.contains(e.target)) {
      navbarSelect.classList.remove("show");
    }
  });
}
// 锚点栏下拉切换
document.querySelectorAll(".product_infor_navbar_select_item").forEach(item => {
  item.addEventListener("click", (event) => {
    const handle = event.target.getAttribute("data-handle");
    const seriesContain = document.querySelector(".product_infor_simplicity_right_product_contain[data-type='series']");
    const activeHandle = seriesContain.querySelector(".product_infor_simplicity_right_select_item_active").getAttribute("data-handle");
    if (handle === activeHandle) return;
    changeSeries(handle)

    const items = seriesContain.querySelectorAll(".product_infor_simplicity_right_select_item");
    items.forEach((item) => {
      item.classList.remove("product_infor_simplicity_right_select_item_active");
      if (item.getAttribute("data-handle") === handle) {
        item.classList.add("product_infor_simplicity_right_select_item_active");
      }
    });
  });
})
const links = document.querySelectorAll(".product_infor_navbar_anchor_item");
// const navbar = document.querySelector(".product_infor_navbar");
links.forEach(link => {
  link.addEventListener("click", function (event) {
    event.preventDefault(); // 阻止默认锚点跳转
    const targetId = this.getAttribute("data-value");
    const targetSection = document.getElementById(targetId);

    if (targetSection && navbar) {
      const navbarHeight = navbar.offsetHeight;
      let offsetTop
      if (window.getComputedStyle(navbar).position === "fixed") {
        offsetTop = targetSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      } else {
        offsetTop = targetSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight * 2;
      }

      if (targetId === "feature") {
        if (window.getComputedStyle(navbar).position === "fixed") {
          window.scrollTo({
            top: offsetTop - 1
          });
        } else {
          window.scrollTo({
            top: offsetTop + navbarHeight - 1
          });
        }
      } else {
        window.scrollTo({
          top: offsetTop
        });
      }
    }

    links.forEach(item => item.classList.remove("product_infor_navbar_anchor_item_active"));
    this.classList.add("product_infor_navbar_anchor_item_active");
  });
});
// 获取所有链接对应的 section
const sectionIds = Array.from(links).map(link => link.getAttribute("data-watch"));
let sectionsLoaded = 0;
var sectionsObserver;
var sections = [];

function initializeObserver() {
  // 等待所有目标 section 元素都加载完毕
  sectionIds.forEach(sectionId => {
    waitForElement(`#${sectionId}`, (element) => {
      sections.push(element);
      sectionsLoaded++;

      // 一旦所有 sections 加载完毕，开始初始化 IntersectionObserver
      if (sectionsLoaded === sectionIds.length) {
        startIntersectionObserver(sections);
      }
    });
  });
}

function startIntersectionObserver(sections) {
  sectionsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const targetSection = entry.target;
        const correspondingLink = document.querySelector(`.product_infor_navbar_anchor_item[data-watch="${targetSection.id}"]`);
        // 如果该 section 进入视口，则给对应的链接添加 active 类
        if (entry.isIntersecting) {
          links.forEach(link => link.classList.remove("product_infor_navbar_anchor_item_active"));
          if (correspondingLink) {
            correspondingLink.classList.add("product_infor_navbar_anchor_item_active");
          }
        }
      });
    },
    {
      root: null, // 视口
      threshold: 0.1 // 设置阈值，0.3表示至少30%的区域出现在视口中时触发
    }
  );

  // 开始观察所有 section
  sections.forEach(section => {
    sectionsObserver.observe(section);
  });
}

initializeObserver();

// 对比弹窗
const compare_modal = document.querySelector(".product_infor_modal")
const show_compare_modal = document.querySelector("#show_compare_modal")
if (compare_modal && show_compare_modal) {
  show_compare_modal.addEventListener("click", () => {
    compare_modal.style.display = "block"
    document.body.style.overflowY = "hidden"
  })
  document.querySelector("#close_compare_modal").addEventListener("click", () => {
    compare_modal.style.display = "none"
    document.body.style.overflowY = "auto"
  })
  compare_modal.addEventListener("click", (e) => {
    if (e.target === compare_modal) {
      compare_modal.style.display = "none";
      document.body.style.overflowY = "auto";
    }
  });
}

function getDecimalLength(num) {
  const str = num.toString();
  if (str.includes('e-')) {
    // 处理科学计数法，例如 1e-7
    const [base, exp] = str.split('e-');
    return Number(exp);
  }
  const parts = str.split('.');
  return parts[1] ? parts[1].length : 0;
}

function toInteger(num) {
  const decimalLength = getDecimalLength(num);
  const scale = Math.pow(10, decimalLength);
  return {
    integer: Math.round(num * scale),
    scale
  };
}

function safeAdd(a, b) {
  const len = Math.max(getDecimalLength(a), getDecimalLength(b));
  const scale = Math.pow(10, len);
  return (Math.round(a * scale) + Math.round(b * scale)) / scale;
}

function safeSub(a, b) {
  const len = Math.max(getDecimalLength(a), getDecimalLength(b));
  const scale = Math.pow(10, len);
  return (Math.round(a * scale) - Math.round(b * scale)) / scale;
}

function safeMul(a, b) {
  const { integer: intA, scale: scaleA } = toInteger(a);
  const { integer: intB, scale: scaleB } = toInteger(b);
  return (intA * intB) / (scaleA * scaleB);
}

function safeDiv(a, b) {
  const { integer: intA, scale: scaleA } = toInteger(a);
  const { integer: intB, scale: scaleB } = toInteger(b);
  return (intA / intB) * (scaleB / scaleA);
}

function moneyWithoutTrailingZeros(cents, currencySymbol = '$') {
  const amount = cents / 100;
  const formatted = amount.toFixed(2);
  const final = formatted.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  return `${currencySymbol}${final}`;
}

// 猜你喜欢
initYouMightAlsoLike()
function initYouMightAlsoLike() {
  const select_products = document.querySelectorAll('.product_infor_simplicity_right_product_recommended .product_infor_simplicity_right_select_item_addons_selectable');
  select_products.forEach((select_product) => {
    const data = JSON.parse(
      select_product.querySelector('.product_infor_simplicity_right_select_item_addons_selectable_data').textContent
    );
    const option_selects = select_product.querySelectorAll('.product_infor_simplicity_right_select_contain');
    option_selects.forEach((option_select, i) => {
      const index = option_select.getAttribute('data-index');
      const select = option_select.querySelector('.product_infor_simplicity_right_select_itembox');
      const other_options = Array.from(option_selects).filter((_, j) => j !== i);
      select.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      select.addEventListener('change', (e) => {
        const value = e.target.value;
        const initialVariants = data.filter(
          (item) => item.variant[`option${index}`] == value && item.variant.available
        );
        let matchedVariants = [...initialVariants];
        if (matchedVariants.length > 1 && other_options.length) {
          other_options.forEach((other_option) => {
            const other_index = other_option.getAttribute('data-index');
            const other_value = other_option.querySelector('.product_infor_simplicity_right_select_itembox').value;

            if (other_value) {
              matchedVariants = matchedVariants.filter((item) => item.variant[`option${other_index}`] == other_value);
            }
          });

          if (matchedVariants.length === 0) {
            matchedVariants = initialVariants;
          }
        }
        const matchedVariant = matchedVariants[0];
         if (matchedVariant) {
          select_product.querySelector('.product_infor_simplicity_right_select_feature_img').src =
            matchedVariant.variant.featured_image.src;
          select_product.querySelector('.product_infor_simplicity_right_select_feature_img').setAttribute("href", matchedVariant.variant.featured_image.src)
          select_product.setAttribute('data-id', matchedVariant.variant.id);
          other_options.forEach((item) => {
            const item_index = item.getAttribute('data-index');
            const item_select = item.querySelector('.product_infor_simplicity_right_select_itembox');

            const newValue = matchedVariant.variant[`option${item_index}`];
            if (item_select.value !== newValue) {
              item_select.value = newValue;
            }
          });
          const discount_price = select_product.querySelector('.product_infor_simplicity_right_select_dp');
          const origin_price = select_product.querySelector('.product_infor_simplicity_right_select_op');
          origin_price.innerHTML = moneyWithoutTrailingZeros(matchedVariant.variant.price, matchedVariant.symbol);
          origin_price.setAttribute('data-value', (matchedVariant.variant.price / 100).toFixed(2));
          if (matchedVariant.discount) {
            discount_price.classList.add('show');
            const discountPrice = origin_price.getAttribute('data-value') * 100 - matchedVariant.discount;
            console.log(discountPrice);
            discount_price.innerHTML = moneyWithoutTrailingZeros(discountPrice, matchedVariant.symbol);
            discount_price.setAttribute('data-value', (matchedVariant.discount / 100).toFixed(2));
          } else {
            discount_price.classList.remove('show');
          }
          if (select_product.classList.contains("product_infor_simplicity_right_select_item_active")) {
            quantityBindPrice()
          }
        }
      });
    });
  });
}

//退款协议弹窗
function initRefundModal() {
  const refund_policy_modal = document.querySelector('.refund_policy_modal');
  if (refund_policy_modal) {
    document.querySelector('#refund_policy_btn').addEventListener('click', () => {
      refund_policy_modal.style.display = 'block';
      document.body.style.overflowY = 'hidden';
    });
    document.querySelector('#close_refund_policy_modal').addEventListener('click', () => {
      refund_policy_modal.style.display = 'none';
      document.body.style.overflowY = 'auto';
    });
    refund_policy_modal.addEventListener('click', (e) => {
      if (e.target === refund_policy_modal) {
        refund_policy_modal.style.display = 'none';
        document.body.style.overflowY = 'auto';
      }
    });
  }
}