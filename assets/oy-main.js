const cartFormData = { items: [{ id: "", quantity: 1 }] };
let skuArray = [];
// sku交互+库存判断
let domKeys = [
  "oy-item-fold-color",
  "oy-item-fold-size",
  "oy-item-fold-material",
];

// 商品不可用时禁用购买按钮
function disableBuyButtons() {
  document.querySelector("#addCart").disabled = true;
  document.querySelector("#buyNow").disabled = true;
  document
    .querySelectorAll(".sale_price_item")
    .forEach((ele) => (ele.style.display = "none"));
  document
    .querySelectorAll(".sale_price_underlined")
    .forEach((ele) => ele.classList.remove("act"));
  document
    .querySelector("#totalPrices_item .oy-total")
    .classList.remove("oy-del");
}
// 重置商品sku信息
function resetSkuDisplay() {
  const skuItems = document.querySelectorAll(".product-sku-fold>.oy-item");
  [skuItems[1], skuItems[2]].forEach((item) => {
    item.querySelector(".oy-item-main .oy-value").innerText = "";
    if (item.querySelector(".oy-item-main .oy-explain")) {
      item.querySelector(".oy-item-main .oy-explain").innerText = "";
    }
  });
  document.querySelector("#endSKU2").innerText = "";
  document.querySelector("#endSKU3").innerText = "";
}
// 初始化商品信息
function setInit(v) {
  const skuItems = document.querySelectorAll(".product-sku-fold>.oy-item");
  const colorItems = Array.from(
    document.querySelector(".oy-item-fold-color").querySelectorAll(".oy-item")
  );
  const sizeItems = Array.from(
    document.querySelectorAll(".oy-item-fold-size.oy-item")
  );
  const materialItems = Array.from(
    document
      .querySelector(".oy-item-fold-material")
      .querySelectorAll(".oy-item")
  );
  // 配置化参数
  const optionConfigs = [
    {
      items: colorItems,
      value: v.option2,
      skuIndex: 1,
      itemIndex: 0,
      idPrefix: "#endSKU1",
      handler: (item) => {
        handleColorSetAddOns(item.dataset.value);
        // initSwiper(item.dataset.value);
      },
    },
    {
      items: sizeItems,
      value: v.option1,
      skuIndex: 0,
      itemIndex: 1,
      idPrefix: "#endSKU2",
      remark: true,
    },
    {
      items: materialItems,
      value: v.option3,
      skuIndex: 2,
      itemIndex: 2,
      idPrefix: "#endSKU3",
    },
  ];

  optionConfigs.forEach((config) => {
    Array.from(config.items).find((item, i) => {
      if (item.dataset.value === config.value) {
        // 设置选中状态
        item.classList.add("active");
        skuArray[config.skuIndex] = config.value;

        // 更新DOM显示
        if (skuItems[config.itemIndex]) {
          const mainElement =
            skuItems[config.itemIndex].querySelector(".oy-item-main");
          mainElement.querySelector(".oy-value").innerText = config.value;

          if (config.remark) {
            const remarkText = item.dataset.remark || "";
            mainElement.querySelector(".oy-explain").innerText = remarkText;
            document.querySelector(
              config.idPrefix
            ).innerText = `${config.value} | ${remarkText}`;
          } else {
            document.querySelector(config.idPrefix).innerText = config.value;
          }
        }

        // 执行特殊处理函数
        config.handler?.(item);
        return true;
      }
    });
  });

  changeSkuArray(skuArray);
}
// 初始化sku选中
function mhyouh(i) {
  console.log("Current SKU:", skuArray);
  const skuItems = document.querySelectorAll(".product-sku-fold>.oy-item");
  const sizeItems = Array.from(
    document.querySelectorAll(".oy-item-fold-size.oy-item")
  );
  const materialItems = Array.from(
    document
      .querySelector(".oy-item-fold-material")
      .querySelectorAll(".oy-item")
  );
  // 状态管理优化：使用临时变量代替直接操作DOM
  const currentValue = skuArray[i];
  const nextValue = skuArray[(i + 1) % 3];

  // 精准禁用逻辑：仅当父级选项未选择时禁用子项
  const disableRelatedItems = () => {
    switch (i) {
      case 1: // 颜色选择时
        sizeItems.forEach((item) =>
          item.classList.toggle("disable", !skuArray[0])
        );
        materialItems.forEach((item) =>
          item.classList.toggle("disable", !skuArray[0])
        );
        break;
      case 0: // 尺寸选择时
        materialItems.forEach((item) =>
          item.classList.toggle("disable", !skuArray[1])
        );
        break;
    }
  };

  // 核心匹配逻辑优化：添加库存检查
  const findMatchedVariant = () =>
    productData.variants.find((v) => {
      const isBaseMatch = v.options[i] === currentValue && v.available;

      if (i === 1) return isBaseMatch;
      if (i === 0) return isBaseMatch && v.options[1] === nextValue;
    });

  const matchedVariant = findMatchedVariant();

  if (matchedVariant) {
    // 状态同步方法：统一处理选项激活
    const syncOptionState = (items, optionIndex) => {
      const targetValue = matchedVariant.options[optionIndex];

      items.forEach((item) => {
        const isMatch = item.dataset.value === targetValue;
        const isSelected = skuArray[optionIndex] === targetValue;

        item.classList.toggle("disable", !isMatch);
        item.classList.toggle("active", isSelected);

        // 当尺寸匹配时更新DOM显示
        if (i === 1 && optionIndex === 0 && isMatch) {
          const mainElement = skuItems[1]?.querySelector(".oy-item-main");
          const endElement = document.querySelector("#endSKU2");

          if (mainElement && endElement) {
            mainElement.querySelector(".oy-value").textContent = targetValue;
            mainElement.querySelector(".oy-explain").textContent =
              item.dataset.remark || "";
            endElement.textContent = `${targetValue}${
              item.dataset.remark ? " | " + item.dataset.remark : ""
            }`;
          }
        }
      });
    };

    // 同步尺寸和材质状态
    syncOptionState(sizeItems, 0);
    syncOptionState(materialItems, 2);

    // 强制刷新尺寸选项状态
    // setTimeout(() => sizeItems.forEach(item => item.offsetHeight), 50);

    // 更新价格
    changeVariantPrice(matchedVariant);
  } else {
    const variant = productData.variants.find((v) => {
      const isBaseMatch = v.options[i] === currentValue;

      if (i === 1) return isBaseMatch;
      if (i === 0) return isBaseMatch && v.options[1] === nextValue;
    });
    changeVariantPrice(variant);
    // 无匹配变体时的处理
    disableRelatedItems();
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
// 根据skuArray更新购物商品信息和url地址
function changeSkuArray(skuArray) {
  // 使用可选链操作符防止未找到变体时的错误
  const matchedProduct =
    productData?.variants?.find(
      (f) =>
        skuArray?.length === f.options?.length &&
        skuArray.every((ev) => f.options.includes(ev))
    ) || {};

  // 使用解构赋值和默认值
  matchedProductId = matchedProduct?.id ?? "";
  cartFormData.items[0].id = matchedProductId;

  // 使用更现代的URL API
  const url = new URL(window.location.href);
  if (matchedProductId) {
    url.searchParams.set("variant", matchedProductId);
  } else {
    url.searchParams.delete("variant");
  }
  window.history.replaceState(null, "", url.toString());
}
// skuitem点击事件
function handleItemClick(event, type) {
  const target = event.target.closest(".oy-item");
  if (
    !target ||
    target.classList.contains("disable") ||
    !target.hasAttribute("data-value") ||
    target.classList.contains("active")
  )
    return;

  let index;
  let skuKey;
  let skuArrayIndex;
  switch (type) {
    case "color":
      index = 0;
      skuArrayIndex = 1;
      skuKey = "#endSKU1";
      break;
    case "size":
      index = 1;
      skuArrayIndex = 0;
      skuKey = "#endSKU2";
      break;
    case "material":
      index = 2;
      skuArrayIndex = 2;
      skuKey = "#endSKU3";
      break;
  }
  const loadingSpinner = document.getElementById("oy-left-loading-spinner");
  const imagesContainer = document.querySelector(
    ".product-main>.oy-in>.oy-left .img-shop.pc-suspend"
  );
  const skuItems = document.querySelectorAll(".product-sku-fold>.oy-item");

  // 取消所有该类别的 active 状态
  document.querySelectorAll(`.oy-item-fold-${type} .oy-item`).forEach((e) => {
    e.classList.remove("active", "disable");
  });

  target.classList.add("active");

  // 更新 SKU 选项文本
  skuItems[index].querySelector(".oy-item-main .oy-value").innerText =
    target.dataset.value;
  document.querySelector(skuKey).innerText =
    target.dataset.value +
    (target.dataset.remark ? " | " + target.dataset.remark : "");

  skuArray[skuArrayIndex] = target.dataset.value;

  // 处理 SKU 交互逻辑
  if (type === "color") {
    loadingSpinner.style.display = "block";
    imagesContainer.style.opacity = "0";
    handleColorSetAddOns(target.dataset.value);
    changeSwiperColor(target.dataset.value);
  }

  clickYouh(skuArrayIndex);
  mhyouh(skuArrayIndex);
  changeSkuArray(skuArray);

  // 处理 SKU 匹配和更新
  const matchedProduct = productData.variants.find(
    (f) =>
      skuArray.length === f.options.length &&
      skuArray.every((ev) => f.options.includes(ev))
  );

  if (matchedProduct) {
    changeVariant360Images(matchedProduct.id);
    updateStickyAddToCart(matchedProduct);
  }

  resetUnselected();
}
// 根据颜色切换赠品
function handleColorSetAddOns(color) {
  // 缓存DOM查询结果
  const colorLower = color.trim().toLowerCase();
  const addOns = document.querySelectorAll(".spec_product_attach_item");

  // 使用CSS类代替直接样式操作
  addOns.forEach((item) => {
    item.classList.toggle(
      "active",
      item.dataset.color?.trim().toLowerCase() === colorLower
    );
  });
}
// 重置未选择的sku信息
function resetUnselected() {
  const skuItems = document.querySelectorAll(".product-sku-fold>.oy-item");
  skuItems.forEach((e) => {
    if (!e.querySelector(".oy-item.active")) {
      const valueElement = e.querySelector(".oy-item-main .oy-value");
      const explainElement = e.querySelector(".oy-item-main .oy-explain");

      if (valueElement) valueElement.innerText = "";
      if (explainElement) explainElement.innerText = "";
    }
  });
}
// 根据商品变体切换价格
function changeVariantPrice(product) {
  console.log(product, "product");
  // const sticky = document.querySelector(".productView-stickyCart");
  // const itemPrice = sticky.querySelector(".sticky-price");
  // const mobileSticky = document.querySelector(".sticky-product-mobile-content");
  // const mobileItemPrice = mobileSticky.querySelector(".sticky-price");
  const symbol = document.querySelector(
    ".oy-right.sale_price_item .symbol"
  ).innerText;

  if (
    product.name.includes("Blacklyte Kraken Gaming Chair") ||
    (product.name.includes("Blacklyte Athena X Gaming Chair") &&
      (product.option2 == "White" || product.option2 == "Pink")) ||
    (product.name.includes("Blacklyte Athena Pro Gaming Chair") &&
      product.option2 != "Grey") ||
    product.name.includes("Blacklyte Kraken Pro Gaming Chair") ||
    product.name.includes("Blacklyte Athena Gaming Chair")
  ) {
    let sale_price;
    if (product.name.includes("Blacklyte Kraken Pro Gaming Chair")) {
      sale_price = product.price - 6000;
    }
    if (product.name.includes("Blacklyte Kraken Gaming Chair")) {
      sale_price = product.price - 8000;
    }
    if (product.name.includes("Blacklyte Athena Pro Gaming Chair")) {
      sale_price = product.price - 5000;
    }
    if (product.name.includes("Blacklyte Athena Gaming Chair")) {
      sale_price = product.price - 8000;
    }
    if (
      product.name.includes("Blacklyte Athena X Gaming Chair") &&
      product.option2 == "Pink"
    ) {
      sale_price = product.price - 10000;
    }
    if (
      product.name.includes("Blacklyte Athena X Gaming Chair") &&
      product.option2 == "Black"
    ) {
      sale_price = product.price - 8000;
    }
    if (
      product.name.includes("Blacklyte Athena X Gaming Chair") &&
      product.option2 == "White"
    ) {
      sale_price = product.price - 9000;
    }
    document.querySelectorAll(".sale_price_item").forEach((ele) => {
      ele.style.display = "flex";
    });
    document
      .querySelector("#totalPrices_item .oy-total")
      .classList.add("oy-del");
    document.querySelector("#financing_twelve").innerText = (
      (sale_price / 100).toFixed(2) / 12
    ).toFixed(2);
    document.querySelector("#financing_four").innerText = (
      (sale_price / 100).toFixed(2) / 6
    ).toFixed(2);
    document.querySelectorAll(".sale_prices").forEach((ele) => {
      ele.innerText = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(sale_price / 100);
    });
    document
      .querySelectorAll(".sale_price_underlined")
      .forEach((ele) => ele.classList.add("act"));

    // itemPrice.innerHTML = `<span class="money-subtotal">${symbol}${(
    //   sale_price / 100
    // ).toFixed(
    //   2
    // )}</span><s class="money-compare-price" data-compare-price="0">${symbol}${(
    //   product.price / 100
    // ).toFixed(2)}</s>`;
    // mobileItemPrice.innerHTML = `<span class="money-subtotal">${symbol}${(
    //   sale_price / 100
    // ).toFixed(
    //   2
    // )}</span><s class="money-compare-price" data-compare-price="0">${symbol}${(
    //   product.price / 100
    // ).toFixed(2)}</s>`;

    document
      .querySelector(".product_infor_simplicity_right_buybox_price_info_save")
      .classList.add("show");
    document
      .querySelector(".product_infor_simplicity_right_buybox_price_info_op")
      .classList.add("show");
    document.querySelector(
      ".product_infor_simplicity_right_buybox_price_info_save span"
    ).innerHTML = ((product.price - sale_price) / 100).toFixed(2);
    document.querySelector(
      ".product_infor_simplicity_right_buybox_price_afterpay .financing_twelve"
    ).innerText = ((sale_price / 100).toFixed(2) / 12).toFixed(2);
    document.querySelector(
      ".product_infor_simplicity_right_buybox_price_afterpay .financing_four"
    ).innerText = ((sale_price / 100).toFixed(2) / 6).toFixed(2);
    document.querySelector(
      ".product_infor_simplicity_right_buybox_price_info_discount span"
    ).innerText = (sale_price / 100).toFixed(2);
  } else {
    document.querySelectorAll(".sale_price_item").forEach((ele) => {
      ele.style.display = "none";
    });
    document.querySelector("#financing_twelve").innerText = (
      (product.price / 100).toFixed(2) / 12
    ).toFixed(2);
    document.querySelector("#financing_four").innerText = (
      (product.price / 100).toFixed(2) / 6
    ).toFixed(2);
    document
      .querySelector("#totalPrices_item .oy-total")
      .classList.remove("oy-del");
    document
      .querySelectorAll(".sale_price_underlined")
      .forEach((ele) => ele.classList.remove("act"));

    // itemPrice.innerHTML = `<span class="money-subtotal">${symbol}${(
    //   product.price / 100
    // ).toFixed(2)}</span>`;
    // mobileItemPrice.innerHTML = `<span class="money-subtotal">${symbol}${(
    //   product.price / 100
    // ).toFixed(2)}</span>`;

    document
      .querySelector(".product_infor_simplicity_right_buybox_price_info_save")
      .classList.remove("show");
    document
      .querySelector(".product_infor_simplicity_right_buybox_price_info_op")
      .classList.remove("show");
    document.querySelector(
      ".product_infor_simplicity_right_buybox_price_afterpay .financing_twelve"
    ).innerText = ((product.price / 100).toFixed(2) / 12).toFixed(2);
    document.querySelector(
      ".product_infor_simplicity_right_buybox_price_afterpay .financing_four"
    ).innerText = ((product.price / 100).toFixed(2) / 6).toFixed(2);
    document.querySelector(
      ".product_infor_simplicity_right_buybox_price_info_discount span"
    ).innerText = (product.price / 100).toFixed(2);
  }
}
// 根据商品变体切换360展示及初始化
function changeVariant360Images(variantId) {
  console.log(variantId);
  fetch(location.pathname + `?variant=${variantId}`)
    .then((response) => response.text())
    .then((data) => {
      const parser = new DOMParser();
      const html = parser.parseFromString(data, "text/html");

      const viewer = html.querySelector(
        "#product-360-viewer .product-360-images"
      );
      const images = viewer.querySelectorAll(".product-360-image");
      images[0].style.opacity = "1";
      let imagesHTML = "";
      images.forEach((img) => {
        imagesHTML += img.outerHTML;
      });
      document.querySelector(
        "#product-360-viewer .product-360-images"
      ).innerHTML = imagesHTML;
      init360Images();
    });
}
async function init360Images() {
  const viewer = document.getElementById("product-360-viewer");
  const imagesContainer = document.querySelector(".product-360-images");
  const images = document.querySelectorAll(".product-360-image");
  const loadingSpinner = document.getElementById("loading-spinner");

  let currentIndex = 0;
  let imageCount = images.length;

  loadingSpinner.style.display = "block";
  imagesContainer.style.opacity = "0";

  function waitForImages() {
    return new Promise((resolve) => {
      const images = document.querySelectorAll(".product-360-image");
      let loadedCount = 0;
      const totalImages = images.length;

      if (totalImages === 0) {
        resolve(); // 如果没有图片，直接 resolve
        return;
      }

      images.forEach((img) => {
        const onLoad = () => {
          loadedCount++;
          if (loadedCount === totalImages) resolve(); // 所有图片加载完成
        };

        img.onload = onLoad;
        img.onerror = onLoad; // 即使加载失败，也继续执行

        if (img.complete) {
          onLoad(); // 处理缓存图片
        }
      });
    });
  }
  await waitForImages();

  loadingSpinner.style.display = "none";
  imagesContainer.style.opacity = "1";
  updateImage(currentIndex);

  function updateImage(index) {
    images.forEach((img, i) => {
      img.style.opacity = i === index ? "1" : "0";
    });
  }

  function handleMouseMove(event) {
    let mouseX = event.clientX || event.touches?.[0]?.clientX || 0;
    let viewerRect = viewer.getBoundingClientRect();
    let relativeX = mouseX - viewerRect.left;
    let newIndex = Math.floor((relativeX / viewerRect.width) * imageCount);

    newIndex = Math.max(0, Math.min(newIndex, imageCount - 1));

    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      updateImage(currentIndex);
    }
  }

  viewer.addEventListener("mousemove", handleMouseMove);
  viewer.addEventListener("touchmove", handleMouseMove);
}
// 根据商品变体切换悬浮加入购物车信息
function updateStickyAddToCart(currentVariant) {
  if (!currentVariant) return;

  // 统一处理桌面和移动端容器
  const CONTAINERS = [
    ".productView-stickyCart",
    ".sticky-product-mobile-content",
  ];

  // 缓存公共元素引用
  const productFormId = `product-form-sticky-${productData.id}`;
  const variantImage = currentVariant?.featured_image?.src;
  let text = window.variantStrings.addToCart;
  if (variantsQuantity[currentVariant.id] <= 0) {
    if (currentVariant.available) {
      text = window.variantStrings.preOrder;
    } else {
      text = window.variantStrings.outOfStock;
    }
  }
  document.querySelector("#addCart").querySelector("span").textContent = text;

  CONTAINERS.forEach((selector) => {
    const container = document.querySelector(selector);
    if (!container) return;

    // 统一更新图片逻辑
    const imageWrapper = container.querySelector(".sticky-image");
    if (variantImage && imageWrapper) {
      const img = imageWrapper.querySelector("img");
      if (img) {
        img.src = variantImage;
        img.srcset = variantImage;
        img.alt = currentVariant.featured_image.alt || "";
      }
    }

    // 统一更新表单元素
    const form = {
      input: document
        .getElementById(productFormId)
        ?.querySelector('input[name="id"]'),
      button: document
        .getElementById(productFormId)
        ?.querySelector('[name="add"]'),
      mobileButton: document.getElementById("show-sticky-product"),
    };

    if (form.input && (form.button || form.mobileButton)) {
      form.input.value = currentVariant.id;
      form.button.textContent = text;
      form.button.disabled = false;
      form.mobileButton.textContent = text;
      form.mobileButton.disabled = false;
      form.input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
}
// 根据点击的sku更新余下sku信息
function clickYouh(i) {
  let oneFlag = true;

  // 预缓存常用DOM元素
  const [skuOption1, skuOption3] = [0, 2].map((idx) => skuArray[idx]);
  const checkConfig = {
    1: (v) => v.available && v.options[i] === skuArray[i],
    0: (v) =>
      v.available &&
      v.options[i] === skuArray[i] &&
      v.options[1] === skuArray[1],
  };

  // 使用find替代forEach提升性能
  const matchedVariant = productData.variants.find((v) => checkConfig[i]?.(v));

  if (matchedVariant) {
    [skuArray[0], skuArray[2]] = [
      matchedVariant.options[0],
      matchedVariant.options[2],
    ];
    oneFlag = false;
  }
  // 更新按钮状态
  document.querySelector("#buyNow").disabled = document.querySelector(
    "#addCart"
  ).disabled = oneFlag;
  if (oneFlag) {
    console.warn("Inventory shortage");
    disableBuyButtons();

    // 延迟处理附加按钮
    const disableAddButton = () => {
      const addButton = document
        .getElementById(`product-form-sticky-${productData.id}`)
        ?.querySelector('[name="add"]');
      if (addButton) addButton.disabled = true;
      else console.warn("Add button not found");
    };
    setTimeout(disableAddButton, 50);
  }
}

// document.addEventListener("DOMContentLoaded", function () {
// 设置图片展示区域的sticky位置
const headerWidth = document.querySelector(
  ".header-navigation-wrapper"
).offsetHeight;
const announcementBarWidth =
  document.querySelector(".announcement-bar").offsetHeight;
let productImgBox = document.querySelector(".product-main>.oy-in>.oy-left");
productImgBox.style.top = headerWidth + announcementBarWidth + "px";

// 初始化获取展示商品
let oneFlag = true;
const urlParams = new URLSearchParams(window.location.search);
const variantId = urlParams.get("variant");
if (variantId) {
  console.log("Current variant:", variantId);
  const matchedVariant = productData.variants.find((v) => v.id == variantId);

  if (matchedVariant) {
    setInit(matchedVariant);
    oneFlag = false;

    if (!matchedVariant.available) {
      disableBuyButtons();
      resetSkuDisplay();
    }
  }

  if (oneFlag) {
    console.warn("Variant not available");
    // disableBuyButtons();
    const firstAvailable = productData.variants.find((v) => v.available);
    setInit(firstAvailable);
  }
} else {
  // 寻找第一个可用变体
  const firstAvailable = productData.variants.find((v) => v.available);
  if (firstAvailable) {
    setInit(firstAvailable);
    oneFlag = false;
  }

  if (oneFlag) {
    console.error("No available variants");
    disableBuyButtons();
  }
}

mhyouh(1);

// sku下拉
document.querySelectorAll(".product-sku-fold>.oy-item").forEach((item) => {
  const mainElement = item.querySelector(".oy-item-main");
  const svgElement = mainElement.querySelector(".oy-icon svg");
  mainElement.addEventListener("click", (e) => {
    const currentItem = e.currentTarget.closest(".oy-item");
    const isActive = currentItem.classList.toggle("active");
    svgElement.style.transform = isActive ? "rotateX(180deg)" : "";
  });
});
// 赠品选项关联active( checkbox 点击事件)
document.querySelectorAll(".product-sku-attach-option").forEach((option) => {
  const checkbox = option.querySelector('.oy-checkbox input[type="checkbox"]');
  const ipt = option.querySelector(".oy-count-ipt");
  checkbox.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    option.classList.toggle("active", isChecked);
    if (isChecked && parseInt(ipt.value) === 0) {
      ipt.value = "1";
    }
    setTotalPrice();
  });
});
// 关联购买数量交互
const countBoxAll = document.querySelectorAll(".oy-count-input");
countBoxAll.forEach((box) => {
  // 缓存DOM元素引用
  const countInput = box.querySelector(".oy-count-ipt");
  const minusBtn = box.querySelector(".minus");
  const plusBtn = box.querySelector(".plus");

  // 统一事件处理器
  const handleInput = () => {
    const value = parseInt(countInput.value, 10) || 1;
    countInput.value = Math.max(1, Math.min(999, value)); // 确保数值在1-999之间
    setTotalPrice();
  };

  // 按钮状态更新函数
  const updateButtonState = () => {
    const value = parseInt(countInput.value, 10);
    minusBtn.disabled = value <= 1;
    plusBtn.disabled = value >= 999;
  };

  // 事件监听优化
  box.addEventListener("input", handleInput);

  minusBtn.addEventListener("click", () => {
    countInput.value = Math.max(1, parseInt(countInput.value, 10) - 1);
    handleInput();
    updateButtonState();
  });

  plusBtn.addEventListener("click", () => {
    countInput.value = Math.min(999, parseInt(countInput.value, 10) + 1);
    handleInput();
    updateButtonState();
  });

  // 初始化按钮状态
  updateButtonState();
});
// 计算总价
function setTotalPrice() {
  // 缓存DOM元素引用
  const priceElements = {
    original: document.querySelector("#originalTotalPrice"),
    current: document.querySelector("#totalPrices"),
  };

  // 计算附加商品总价
  const attachmentsTotal = selectableProductAttachJson.reduce(
    (total, product) => {
      const isActive =
        document.querySelector(`#check${product.id}`)?.checked ?? false;
      const quantity =
        parseInt(document.querySelector(`#count${product.id}`)?.value, 10) || 0;
      return total + (isActive ? (product.price / 100) * quantity : 0);
    },
    0
  );

  // 格式化价格显示
  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return formatted.replace(/^(\D+)/, "$1 "); // 在货币符号后添加空格
  };

  // 计算并更新总价
  const updateDisplay = () => {
    const basePrice = (productData?.price ?? 0) / 100; // 安全访问价格
    const totalAmount = attachmentsTotal + basePrice;

    [priceElements.original, priceElements.current].forEach((el) => {
      if (el) el.textContent = formatCurrency(totalAmount);
    });
  };

  // 执行更新
  updateDisplay();
}

// 加入购物车
const addCartBtn = document.querySelector("#addCart");
const cartIcon = document.querySelector(".header--cart .header__icon--cart");
addCartBtn.addEventListener("click", async (e) => {
  try {
    e.preventDefault();
    addCartBtn.classList.add("is-loading");

    const response = await fetch(window.Shopify.routes.root + "cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartFormData),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const jsonResponse = await response.json();
    Shopify.getCart((cartTotal) => {
      document.body.classList.add("cart-sidebar-show");
      updateSidebarCart(cartTotal);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    addCartBtn.classList.remove("is-loading");
    setTimeout(() => cartIcon?.click(), 1000);
  }
});
// 结算按钮
const buyNowBtn = document.querySelector("#buyNow");
buyNowBtn.addEventListener("click", async (e) => {
  try {
    e.preventDefault();
    buyNowBtn.classList.add("is-loading");
    buyNowBtn.disabled = true;

    // 安全获取变体ID
    const findVariant = () =>
      productData.variants.find(
        (f) =>
          skuArray.length === f.options.length &&
          skuArray.every((ev) => f.options.includes(ev))
      );

    const variant = findVariant();
    if (!variant) {
      console.error("No matching variant found");
      return;
    }

    // 构建安全URL
    const buildCheckoutUrl = (id) =>
      `/cart/${id}:1?checkout`.replace(/([^:]\/)\/+/g, "$1");

    location.href = buildCheckoutUrl(variant.id);
  } catch (error) {
    console.error("Checkout error:", error);
    showErrorMessage(window.checkoutStrings.error);
  } finally {
    buyNowBtn.classList.remove("is-loading");
    buyNowBtn.disabled = false;
  }
});

// sku操作
const colorWrap = document.querySelector(".oy-item-fold-color");
// const sizeWrap = document.querySelector(".oy-item-fold-size");
const materialWrap = document.querySelector(".oy-item-fold-material");
colorWrap.addEventListener("click", (event) => handleItemClick(event, "color"));
// sizeWrap.addEventListener("click", (event) => handleItemClick(event, "size"));
materialWrap.addEventListener("click", (event) =>
  handleItemClick(event, "material")
);

// 360点击展示
document.querySelector(".icon-360").addEventListener("click", (e) => {
  document.querySelector(".spin-360").classList.add("act");
});
// });

document
  .querySelectorAll(".product_infor_simplicity_right_buybox_btns_btn")
  .forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const type = btn.getAttribute("data-type");
      const cartIcon = document.querySelector(
        ".header--cart .header__icon--cart"
      );
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
        // 安全获取变体ID
        const findVariant = () =>
          productData.variants.find(
            (f) =>
              skuArray.length === f.options.length &&
              skuArray.every((ev) => f.options.includes(ev))
          );

        const variant = findVariant();

        const buildCheckoutUrl = (id) =>
          `/cart/${id}:1?checkout`.replace(/([^:]\/)\/+/g, "$1");

        location.href = buildCheckoutUrl(variant.id);
        btn.classList.remove("is_loading");
      }
    });
  });

const navbar = document.querySelector(".simplicity_bottom_bar");
let scrollFunction = () => {
  if (window.scrollY >= 2620) {
    navbar.style.display = "block";
  } else {
    navbar.style.display = "none";
  }
};
window.addEventListener("scroll", scrollFunction);
