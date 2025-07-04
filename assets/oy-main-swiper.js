// 根据翻译的颜色获取对应的英文
const colorMap = {
  Black: ["Schwarz", "Negro", "Nero", "Noir"],
  Camo: ["Camo"],
  Grey: ["Grau", "Gris", "Grigio"],
  Blue: ["Blau", "Azul", "Blu", "Bleu"],
  Yellow: ["Gelb", "Amarillo", "Giallo", "Jaune"],
  Green: ["Grün", "Verde", "Vert"],
  "Wine Red": ["Weinrot", "Vino rojo", "Vino rosso", "Rouge Vin"],
  Red: ["Rot", "Rojo", "Rosso", "Rouge"],
  Pink: ["Rosa", "Rose"],
  White: ["Weiß", "Blanco", "Bianco", "Blanc"],
  "Siege X Edition": ["Siege X Edition"],
};
function getEnglishColor(colorInput) {
  colorInput = colorInput.toLowerCase();
  for (let english in colorMap) {
    if (
      colorMap[english].some((c) => c.toLowerCase() === colorInput) ||
      english.toLowerCase() === colorInput
    ) {
      return english;
    }
  }
  return "Black";
}
// swiper相关
let imgthumbSwiper, imgboxSwiper;
let initialSlide = 0;
function initSwiper(initColor) {
  const color = getEnglishColor(initColor).toLowerCase();
  const images = colorImages[color] || [];
  console.log(color, images);

  const slideHTML = images
    .map(
      (img) =>
        `<div class="swiper-slide"><img src="${img}" alt="${color}" loading="eager" fetchpriority="high"></div>`
    )
    .join("");
  const thumbSlideHTML = images
    .map(
      (img) =>
        `<div class="swiper-slide"><img src="${img}?width=150&height=100" alt="${color}" loading="eager" fetchpriority="high"></div>`
    )
    .join("");

  const thumbWrapper = document.querySelector(
    ".imgthumb-swiper .swiper-wrapper"
  );
  const boxWrapper = document.querySelector(".imgbox-swiper .swiper-wrapper");
  thumbWrapper.innerHTML = thumbSlideHTML;
  boxWrapper.innerHTML = slideHTML;

  const loadingSpinner = document.getElementById("oy-left-loading-spinner");
  const imagesContainer = document.querySelector(
    ".product-main>.oy-in>.oy-left .img-shop.pc-suspend"
  );
  const spinImageBg = document.querySelector(".icon-360 img");
  spinImageBg.src = `${images[0]}?width=80`;

  imgthumbSwiper = new Swiper(".imgthumb-swiper", {
    //    loop: true,
    spaceBetween: 6,
    slidesPerView: "auto",
    freeMode: true,
    watchSlidesProgress: true,
    on: {
      click: function (swiper, event) {
        document.querySelector(".spin-360").classList.remove("act");
        // initialSlide = swiper.clickedIndex;
      },
    },
    initialSlide: initialSlide,
  });
  imgboxSwiper = new Swiper(".imgbox-swiper", {
    //    loop: true,
    spaceBetween: 0,
    navigation: {
      nextEl: "#productMainBtnNext",
      prevEl: "#productMainBtnPrev",
    },
    thumbs: {
      swiper: imgthumbSwiper,
    },
    initialSlide: initialSlide,
    on: {
      init: function () {
        // 新增图片加载检测
        const slides = thumbWrapper.querySelectorAll(".swiper-slide");
        const imagePromises = Array.from(slides).map((slide) => {
          const img = slide.querySelector("img");
          if (img.complete) {
            return Promise.resolve();
          } else {
            return new Promise((resolve) => {
              img.addEventListener("load", resolve);
              img.addEventListener("error", resolve);
            });
          }
        });

        // 等待所有缩略图加载完成
        Promise.all(imagePromises).then(() => {
          const activeSlide = imgboxSwiper.slides[imgboxSwiper.activeIndex];
          const activeImg = activeSlide.querySelector("img");

          if (!activeImg) {
            console.warn("Active slide image not found!");
            return;
          }

          // 额外检测主图是否加载完成
          if (activeImg.complete) {
            finalizeImageLoading();
          } else {
            activeImg.addEventListener("load", finalizeImageLoading);
            activeImg.addEventListener("error", finalizeImageLoading);
          }
        });

        // 统一的加载完成逻辑
        function finalizeImageLoading() {
          loadingSpinner.style.display = "none";
          imagesContainer.style.opacity = "1";
          imagesContainer.classList.add("loaded");

          // 调整主图适配
          const activeSlide = imgboxSwiper.slides[imgboxSwiper.activeIndex];
          const activeImg = activeSlide.querySelector("img");
          if (activeImg && activeImg.complete) {
            adjustImageFit(activeImg);
          }
        }
      },
      slideChange: function () {
        if (imgboxSwiper.destroyed) return;
        initialSlide = imgboxSwiper.activeIndex;
        // 获取当前 active slide
        let activeSlide = imgboxSwiper.slides[imgboxSwiper.activeIndex];

        // 获取图片元素
        let img = activeSlide.querySelector("img");

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
    img.style.objectFit = "cover"; // 宽图
  } else {
    img.style.objectFit = "contain"; // 窄图
  }
}
function changeSwiperColor(color) {
  if (imgthumbSwiper) imgthumbSwiper.destroy();
  if (imgboxSwiper) imgboxSwiper.destroy();
  initSwiper(color);
}
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

function checkVisibleElements(callback) {
  waitForElement(".product-main .oy-left .shop-main", (target) => {
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
        rootMargin: "500px", // 提前 500px 触发检测
      }
    );

    observer.observe(target);
  });
}

// 调用方法，并在所有元素可见时执行操作
checkVisibleElements(() => {
  console.log("所有可见区域的 DOM 元素都已解析完成！");
  // 初始化获取展示商品
  let oneFlag = true;
  const urlParams = new URLSearchParams(window.location.search);
  const variantId = urlParams.get("variant");
  if (variantId) {
    console.log("Current variant:", variantId);
    const matchedVariant = productData.variants.find((v) => v.id == variantId);

    if (matchedVariant) {
      initSwiper(matchedVariant.option2);
      oneFlag = false;
    }

    if (oneFlag) {
      const firstAvailable = productData.variants.find((v) => v.available);
      initSwiper(firstAvailable.option2);
    }
  } else {
    // 寻找第一个可用变体
    const firstAvailable = productData.variants.find((v) => v.available);
    if (firstAvailable) {
      initSwiper(firstAvailable.option2);
    }
  }
});
