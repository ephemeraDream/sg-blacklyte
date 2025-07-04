let prev = document.querySelector(".swiper-button-prev");
let next = document.querySelector(".swiper-button-next");
let ul = document.getElementById("thumbs-ul");
let current_li = '';
let lis = document.getElementsByClassName("thumbs-li");
let banner = document.querySelector(".banner")
let bannerWidth = banner.offsetWidth;
let num = 0;
let nums = lis.length;

let ul_product = document.getElementsByClassName("swiper-product-info-list")[0];
let ul_product_width = ul_product.offsetWidth;

ul_product.style.width = nums * ul_product_width + "px";

function animation(obj, key) {
    for (let i = 0; i < nums; i++) {
      if (key == i) {
        obj[key].classList.add('thumbs-active');
      } else {
        obj[i].classList.remove('thumbs-active');
      }
    }
  console.log(num, -num * ul_product_width + "px");
  ul_product.style.left = -num * ul_product_width + "px";
}

var flag = true;
next.addEventListener("click", function () {
  if (flag) {
    flag = false;
    if (num == nums - 1) {
      num = 0;
      animation(lis, 0);
      flag = true;
    } else {
      num ++;
      animation(lis, num);
      flag = true;
    }
  }
});

prev.addEventListener("click", function () {
  if (flag) {
    flag = false;
    if (num == 0) {
      num = nums - 1;
      animation(lis, nums - 1);
      flag = true;
    } else {
      num--;
      animation(lis, num);
      flag = true;
    }
  }
});
