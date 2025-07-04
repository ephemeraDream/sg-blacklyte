// 导航栏处理
setTimeout(() => {
  const top_bar = document.querySelectorAll(".shopify-section.shopify-section-group-header-group")
  top_bar.forEach(el => {
    el.style.setProperty("position", "relative", "important");
    el.style.setProperty("top", "0", "important");
  });
}, 0)
// 椅子swiper
initChairSwiper();
function initChairSwiper() {
  const judgeNavigationDisplay = (swiper) => {
    const nextBtn = document.querySelector(".product_bundle_right_chair_swiper_next")
    const prevBtn = document.querySelector(".product_bundle_right_chair_swiper_prev")
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

  const chairSwiper = new Swiper('.product_bundle_right_chair_swiper', {
    spaceBetween: 11,
    slidesPerView: 'auto',
    freeMode: true,
    initialSlide: initChairIndex,
    on: {
      init: function (swiper) {
        judgeNavigationDisplay(swiper)
      },
      slideChange: function (Swiper) {
        judgeNavigationDisplay(Swiper)
      },
      reachBeginning: function () {
        const prevBtn = document.querySelector(".product_bundle_right_chair_swiper_prev")
        prevBtn.classList.add("hide")
      },
      reachEnd: function () {
        const nextBtn = document.querySelector(".product_bundle_right_chair_swiper_next")
        nextBtn.classList.add("hide")
      },
    },
    navigation: {
      nextEl: '.product_bundle_right_chair_swiper_next',
      prevEl: '.product_bundle_right_chair_swiper_prev',
    },
  });
  // 椅子系列切换
  chairSwiper.slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      chairSwiper.slides.forEach(s => s.classList.remove('choosed'));
      slide.classList.add('choosed');
      chairSwiper.slideTo(index);

      const dataId = slide.getAttribute("data-id");
      const changed_chair = chair_list.find(item => item.id == dataId)
      if (changed_chair) {
        select_chair = changed_chair
        changeChairColorOption()
        changePrice()
      }
    });
  });
}
// 价格展示切换
function changePrice() {
  const total_price = (select_chair_variant.price + select_desk_variant.price) / 100
  const total_discount = total_price * 0.8
  const total_save = total_price * 0.2
  document.querySelector(".product_bundle_right_price_dp").innerHTML = `${currency_symbol}${total_discount.toFixed(2)}`
  document.querySelector(".product_bundle_right_price_op").innerHTML = `${currency_symbol}${total_price.toFixed(2)}`
  document.querySelector(".product_bundle_right_save_price").innerHTML = `${currency_symbol}${total_save.toFixed(2)}`
  document.querySelector(".product_bundle_right_afterpay_mowith").innerHTML = `${currency_symbol}${(total_discount / 12).toFixed(2)}`
  document.querySelector(".product_bundle_right_afterpay_sixmowith").innerHTML = `${currency_symbol}${(total_discount / 6).toFixed(2)}`
}
// 切换椅子系列之后颜色选项切换
function changeChairColorOption() {
  const color_option_list = color_style_obj[select_chair.id]
  if (color_option_list && color_option_list.length) {
    const contain = document.querySelector(".product_bundle_right_chair .product_bundle_right_option[data-type='color'] .product_bundle_right_select_value_box")
    const choosed_color = document.querySelector(".product_bundle_right_chair_swiper_item.choosed").getAttribute("data-color")
    const choosed_variant = select_chair.variants.find(el => el.option2 == choosed_color && el.available)
    if (choosed_variant) {
      select_chair_variant = choosed_variant
      document.querySelector("#product_bundle_left_chair").src = choosed_variant.featured_image.src
      document.querySelector(".product_bundle_right_chair .product_bundle_right_option[data-type='material'] .product_bundle_right_select_value").innerHTML = choosed_variant.option1
    }
    contain.innerHTML = ""
    color_option_list.forEach(item => {
      const variant = select_chair.variants.find(el => el.option2 == item.color && el.available)
      if (!variant) return
      // 创建最外层 div
      const colorBox = document.createElement('div');
      colorBox.setAttribute('data-id', variant ? variant.id : "");
      colorBox.setAttribute('data-value', item.color);
      colorBox.setAttribute('data-img', variant ? variant.featured_image.src : "");
      colorBox.setAttribute('data-material', variant ? variant.option1 : "");
      colorBox.classList.add('product_bundle_right_select_value_box_color');

      // 添加选中样式
      if (item.color == choosed_color) {
        colorBox.classList.add('product_bundle_right_select_value_box_color_active');
      }

      // 添加不可用样式
      if (!variant) {
        colorBox.classList.add('product_bundle_right_select_value_box_color_disabled');

        const outOfStock = document.createElement('div');
        outOfStock.className = 'product_bundle_right_select_value_box_color_out_of_stock';
        outOfStock.textContent = 'Out of stock';
        colorBox.appendChild(outOfStock);
      }

      // 添加图片
      const img = document.createElement('img');
      img.src = item.color_img;
      img.alt = item.show_name;
      colorBox.appendChild(img);

      // 添加标题文字
      const span = document.createElement('span');
      span.className = 'product_bundle_right_select_value_box_color_title';
      span.textContent = item.show_name;
      colorBox.appendChild(span);

      contain.appendChild(colorBox);
    })
    initChairColorChange()
  }
}
// 椅子颜色切换
initChairColorChange()
function initChairColorChange() {
  const chair_color_list = document.querySelectorAll(".product_bundle_right_chair .product_bundle_right_select_value_box_color")
  chair_color_list.forEach(item => {
    item.addEventListener("click", (event) => {
      const target = event.target.closest(".product_bundle_right_select_value_box_color");
      if (target.classList.contains("product_bundle_right_select_value_box_color_active") || target.classList.contains("product_bundle_right_select_value_box_color_disabled")) return
      const dataImg = target.getAttribute("data-img");
      document.querySelector("#product_bundle_left_chair").src = dataImg
      document.querySelector(".product_bundle_right_chair_swiper_item.choosed .product_bundle_right_chair_swiper_item_img img").src = dataImg
      const dataMaterial = target.getAttribute("data-material");
      const nowMaterial = document.querySelector(".product_bundle_right_chair .product_bundle_right_option[data-type='material'] .product_bundle_right_select_value")
      if (dataMaterial != nowMaterial.innerHTML) {
        nowMaterial.innerHTML = dataMaterial
      }
      chair_color_list.forEach((item) => item.classList.remove("product_bundle_right_select_value_box_color_active"));
      target.classList.add("product_bundle_right_select_value_box_color_active");
      select_chair_variant = select_chair.variants.find(el => el.option2 == target.getAttribute("data-value") && el.available)
      document.querySelector(".product_bundle_right_chair_swiper_item.choosed").setAttribute("data-color", select_chair_variant.option2)
    })
  })
}
// 桌子颜色和尺寸切换
initDeskColorOrSizeChange()
function initDeskColorOrSizeChange() {
  const desk_color_list = document.querySelectorAll(".product_bundle_right_desk .product_bundle_right_select_value_box_color")
  const desk_size_list = document.querySelectorAll(".product_bundle_right_desk .product_bundle_right_select_value_box_size")
  desk_color_list.forEach(item => {
    item.addEventListener("click", (event) => {
      const target = event.target.closest(".product_bundle_right_select_value_box_color");
      if (target.classList.contains("product_bundle_right_select_value_box_color_active") || target.classList.contains("product_bundle_right_select_value_box_color_disabled")) return
      desk_color_list.forEach((item) => item.classList.remove("product_bundle_right_select_value_box_color_active"));
      target.classList.add("product_bundle_right_select_value_box_color_active");
      //选择颜色之后判断尺寸是否可用
      const size_list = document.querySelectorAll(".product_bundle_right_select_value_box_size")
      size_list.forEach(item => {
        item.classList.remove("product_bundle_right_select_value_box_size_disabled")
        const size = item.getAttribute("data-value")
        const is_disabled = select_desk.variants.find(item => item.option1 == target.getAttribute("data-value") && item.option2 == size && !item.available)
        if (is_disabled) {
          item.classList.add("product_bundle_right_select_value_box_size_disabled")
          if (item.classList.contains("product_bundle_right_select_value_box_size_active")) {
            item.classList.remove("product_bundle_right_select_value_box_size_active")
            const first_available_variant = select_desk.variants.find(item => item.option1 == target.getAttribute("data-value") && item.available)
            const choosedItemPrice = document.querySelector(".product_bundle_right_desk_item.choosed .product_bundle_right_desk_item_price")
            choosedItemPrice.innerHTML = `${currency_symbol}${(first_available_variant.price / 100 * 0.8).toFixed(2)}<span class="product_bundle_right_desk_item_price_throughline">${currency_symbol}${(first_available_variant.price / 100).toFixed(0)}</span>`
            document.querySelector(`.product_bundle_right_select_value_box_size[data-value=${first_available_variant.option2}]`).classList.add("product_bundle_right_select_value_box_size_active")
          }
        }
      })
      changeLeftDeskImg()
      changePrice()
    })
  })
  desk_size_list.forEach(item => {
    item.addEventListener("click", (event) => {
      const target = event.target.closest(".product_bundle_right_select_value_box_size");
      if (target.classList.contains("product_bundle_right_select_value_box_size_active") || target.classList.contains("product_bundle_right_select_value_box_size_disabled")) return
      desk_size_list.forEach((item) => item.classList.remove("product_bundle_right_select_value_box_size_active"));
      target.classList.add("product_bundle_right_select_value_box_size_active");
      const price = target.getAttribute("data-price")
      const choosedItemPrice = document.querySelector(".product_bundle_right_desk_item.choosed .product_bundle_right_desk_item_price")
      choosedItemPrice.innerHTML = `${currency_symbol}${(price / 100 * 0.8).toFixed(2)}<span class="product_bundle_right_desk_item_price_throughline">${currency_symbol}${(price / 100).toFixed(0)}</span>`
      changeLeftDeskImg()
      changePrice()
    })
  })
}
// 根据桌子颜色尺寸切换左侧显示图片
function changeLeftDeskImg() {
  const choosed_color = document.querySelector(".product_bundle_right_desk .product_bundle_right_select_value_box_color_active").getAttribute("data-value")
  const choosed_size = document.querySelector(".product_bundle_right_desk .product_bundle_right_select_value_box_size_active").getAttribute("data-value")
  const variant = select_desk.variants.find(el => el.option1 == choosed_color && el.option2 == choosed_size)
  if (variant) {
    select_desk_variant = variant
    document.querySelector("#product_bundle_left_desk").src = variant.featured_image.src
    document.querySelector(".product_bundle_right_desk_item.choosed .product_bundle_right_desk_item_img img").src = variant.featured_image.src
    document.querySelector(".product_bundle_right_desk_item.choosed").setAttribute("data-color", variant.option1)
    document.querySelector(".product_bundle_right_desk_item.choosed").setAttribute("data-size", variant.option2)
  }
}
//桌子系列切换
const desk_items = document.querySelectorAll(".product_bundle_right_desk_box .product_bundle_right_desk_item")
desk_items.forEach(item => {
  item.addEventListener('click', () => {
    desk_items.forEach(s => s.classList.remove('choosed'));
    item.classList.add('choosed');

    const dataId = item.getAttribute("data-id");
    const changed_desk = desk_list.find(item => item.id == dataId)
    if (changed_desk) {
      select_desk = changed_desk
      changeDeskColorAndSizeOption()
      changePrice()
    }
  });
})
// 切换桌子系列之后颜色和尺寸选项切换
function changeDeskColorAndSizeOption() {
  const desk_color_option_list = desk_color_style_obj[select_desk.id]

  const choosed_color = document.querySelector(".product_bundle_right_desk_item.choosed").getAttribute("data-color")
  const choosed_size = document.querySelector(".product_bundle_right_desk_item.choosed").getAttribute("data-size")
  const choosed_variant = select_desk.variants.find(el => el.option1 == choosed_color && el.option2 == choosed_size && el.available)
  if (choosed_variant) {
    select_desk_variant = choosed_variant
    document.querySelector("#product_bundle_left_desk").src = choosed_variant.featured_image.src
  }

  if (desk_color_option_list && desk_color_option_list.length) {
    const contain = document.querySelector(".product_bundle_right_desk .product_bundle_right_option[data-type='color'] .product_bundle_right_select_value_box")
    contain.innerHTML = ""
    desk_color_option_list.forEach(item => {
      const variant = select_desk.variants.find(el => el.option1 == item.color && el.available)
      // 创建最外层 div
      const colorBox = document.createElement('div');
      colorBox.setAttribute('data-value', item.color);
      colorBox.classList.add('product_bundle_right_select_value_box_color');

      // 添加选中样式
      if (item.color == choosed_color) {
        colorBox.classList.add('product_bundle_right_select_value_box_color_active');
      }

      // 添加不可用样式
      if (!variant) {
        colorBox.classList.add('product_bundle_right_select_value_box_color_disabled');
      }

      // 添加图片
      const img = document.createElement('img');
      img.src = item.color_img;
      img.alt = item.show_name;
      colorBox.appendChild(img);

      // 添加标题文字
      const span = document.createElement('span');
      span.className = 'product_bundle_right_select_value_box_color_title';
      span.textContent = item.show_name;
      colorBox.appendChild(span);

      contain.appendChild(colorBox);
    })
  }
  const desk_size_option_list = desk_size_obj[select_desk.id]
  if (desk_size_option_list && desk_size_option_list.length) {
    const contain = document.querySelector(".product_bundle_right_desk .product_bundle_right_option[data-type='size'] .product_bundle_right_select_value_box")
    contain.innerHTML = ""
    desk_size_option_list.forEach(item => {
      const variant = select_desk.variants.find(el => el.option1 == choosed_color && el.option2 == item.name && el.available)
      // 创建最外层 div
      const sizeBox = document.createElement('div');
      sizeBox.setAttribute('data-value', item.name);
      sizeBox.setAttribute('data-price', variant ? variant.price : "");
      sizeBox.classList.add('product_bundle_right_select_value_box_size');

      // 添加选中样式
      if (item.name == choosed_size) {
        sizeBox.classList.add('product_bundle_right_select_value_box_size_active');
      }

      // 添加不可用样式
      if (!variant) {
        sizeBox.classList.add('product_bundle_right_select_value_box_size_disabled');
      }

      // 添加标题文字
      const div = document.createElement('div');
      div.className = 'product_bundle_right_select_value_box_size_title';
      const title = document.createElement('div');
      title.textContent = item.name;
      div.appendChild(title);
      const text = document.createElement('div');
      text.textContent = item.size;
      div.appendChild(text);
      sizeBox.appendChild(div);

      contain.appendChild(sizeBox);
    })
  }
  initDeskColorOrSizeChange()
}
// 上一步下一步切换
let step = 0
const btns = document.querySelectorAll(".product_bundle_right_operate_btn")
const progressItems = document.querySelectorAll(".product_bundle_right_progress_item")
const backBtn = document.querySelector(".product_bundle_right_operate_btn[data-type='back']")
const continueBtn = document.querySelector(".product_bundle_right_operate_btn[data-type='continue']")
const addToCartBtn = document.querySelector(".product_bundle_right_operate_btn[data-type='addToCart']")
btns.forEach(item => {
  item.addEventListener('click', (event) => {
    const type = event.target.getAttribute("data-type")
    if (type === "continue") {
      step++
      progressItems[step].classList.add("product_bundle_right_progress_item_active")
      if (step === 1) {
        document.querySelector(".product_bundle_right_desk").classList.remove("hidden")
        document.querySelector(".product_bundle_right_chair").classList.add("hidden")
        backBtn.classList.remove("hidden")
      }
      if (step === 2) {
        document.querySelector(".product_bundle_right_desk").classList.add("hidden")
        document.querySelector(".product_bundle_right_summary").classList.remove("hidden")
        continueBtn.classList.add("hidden")
        addToCartBtn.classList.remove("hidden")
        confirmChoosedChairAndDesk()
      }
    }
    if (type === "back") {
      progressItems[step].classList.remove("product_bundle_right_progress_item_active")
      step--
      if (step === 0) {
        document.querySelector(".product_bundle_right_desk").classList.add("hidden")
        document.querySelector(".product_bundle_right_chair").classList.remove("hidden")
        backBtn.classList.add("hidden")
      }
      if (step === 1) {
        document.querySelector(".product_bundle_right_desk").classList.remove("hidden")
        document.querySelector(".product_bundle_right_summary").classList.add("hidden")
        continueBtn.classList.remove("hidden")
        addToCartBtn.classList.add("hidden")
      }
    }
  });
})
// 渲染summary中选择的椅子和桌子
function confirmChoosedChairAndDesk() {
  const contain = document.querySelector(".product_bundle_right_summary_box")
  const confirm_chair = document.querySelector(".product_bundle_right_summary_box .product_bundle_right_summary_item[data-type='chair']")
  const confirm_desk = document.querySelector(".product_bundle_right_summary_box .product_bundle_right_summary_item[data-type='desk']")
  if (!confirm_chair || confirm_chair.getAttribute("data-id") != select_chair_variant.id) {
    drawAndReplaceItem(select_chair_variant, 'chair', confirm_chair)
  }
  if (!confirm_desk || confirm_desk.getAttribute("data-id") != select_desk_variant.id) {
    drawAndReplaceItem(select_desk_variant, 'desk', confirm_desk)
  }

  function drawAndReplaceItem(item, type, oldChild) {
    // 创建最外层 div
    console.log(item)
    const box = document.createElement('div');
    box.setAttribute('data-id', item.id);
    box.setAttribute('data-type', type);
    box.classList.add('product_bundle_right_summary_item');

    // 添加图片
    const imgBox = document.createElement('div');
    imgBox.classList.add('product_bundle_right_summary_item_img');
    const img = document.createElement('img');
    img.src = item.featured_image.src;
    img.alt = item.title;
    // if (item.name.indexOf("Atlas Lite Standing Desk") > -1) {
    //   const tag = document.createElement('div');
    //   tag.classList.add('product_bundle_right_desk_item_img_tag');
    //   tag.textContent = "Pre order";
    //   imgBox.appendChild(tag);
    // }
    imgBox.appendChild(img);
    box.appendChild(imgBox);

    // 添加标题文字
    const title = document.createElement('div');
    title.className = 'product_bundle_right_summary_item_title';
    title.textContent = type == "chair" ? chair_series_obj[item.id] : desk_series_obj[item.id];
    box.appendChild(title);
    const text = document.createElement('div');
    text.className = 'product_bundle_right_summary_item_text';
    text.textContent = "Ships for free in 1-3 business days.";
    // if (item.name.indexOf("Atlas Lite Standing Desk") > -1) {
    //   if (item.option1 == "Black") {
    //     text.textContent = "Estimated to ship out by 20th June or earlier.";
    //   } else {
    //     text.textContent = "Estimated to ship out by 10th July or earlier.";
    //   }
    // } else {
    //   text.textContent = "Ships for free in 1-3 business days.";
    // }
    box.appendChild(text);

    if (!oldChild) {
      contain.appendChild(box);
    } else {
      contain.replaceChild(box, oldChild);
    }
  }
}
// 加入购物车
addToCartBtn.addEventListener("click", async (event) => {
  const cartIcon = document.querySelector(".header--cart .header__icon--cart");
  const cartFormData = { items: [{ id: select_chair_variant.id, quantity: 1 }, { id: select_desk_variant.id, quantity: 1 }] };
  addToCartBtn.classList.add("is_loading");
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
    addToCartBtn.classList.remove("is_loading");
    setTimeout(() => cartIcon?.click(), 0);
  }
});
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