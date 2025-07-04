class VariantSelects extends HTMLElement {
    constructor() {
        super();
        this.item = $(this).closest('.productView');
        this.isFullWidth = this.item.is('.layout-4');

        this.onVariantInit();
        this.addEventListener('change', this.onVariantChange.bind(this));
    }

    onVariantInit(){
        this.updateOptions();
        this.updateMasterId();
        this.updateMedia(1500);
        // this.updateURL();
        this.renderProductAjaxInfo();
        this.renderProductInfo();
                
        if (!this.currentVariant) {
            this.updateAttribute(true);
        } else {
            this.updateAttribute(false, !this.currentVariant.available);
        }
        this.updateVariantStatuses();
    }
    
    onVariantChange(event) {
        this.updateOptions();
        this.updateMasterId();
        this.updatePickupAvailability();
        this.updateVariantStatuses();
      
        if (!this.currentVariant) {
            this.updateAttribute(true);
            this.updateStickyAddToCart(true);
        } else {
            this.updateMedia(1500);
            if (!document.querySelector('.featured-product')) {
                this.updateURL();
            }
            this.updateVariantInput();
            this.renderProductAjaxInfo();
            this.renderProductInfo();
            this.updateProductInfo();
            this.updateAttribute(false, !this.currentVariant.available);
            this.updateStickyAddToCart(false, !this.currentVariant.available);
            this.checkQuantityWhenVariantChange();
        }
    }

    updateOptions() {
        this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    }

    decodeOptions() {
        this.options = this.options.map(option => {
            const parsedOption = this.decodeOption(option)
            return parsedOption
        })
    }
  
    decodeOption(option) {
      if (option) {
          return option.split('Special_Double_Quote').join('"').split('Special_Slash').join('/')
        } else {
          return null
        }
    }

    encodeOption(option) {
        if (option) {
          return option.split('"').join('Special_Double_Quote').split('/').join('Special_Slash')
        } else {
          return null
        }
    }
    
    updateMasterId() {
        this.decodeOptions()

        const dataArr = this.getVariantData().filter((variant) => variant.available)
        this.currentVariant = dataArr.find((variant) => {
            return !variant.options.map((option, index) => {
                return this.options[index] === option;
            }).includes(false);
        });

        if(!this.currentVariant) {
          this.currentVariant = dataArr.find((variant) => {
              return !variant.options.map((option, index) => {
                  // 仅检查索引 0 和 1 的匹配情况
                  if (index === 0 || index === 1) {
                      return this.options[index] === option;
                  }
                  return true; // 对于其他索引，不影响匹配结果
              }).includes(false);
          });
        }

        this.updateInputChecked()
          
        if (this.item.find('[data-filter]').length) {
            this.item.find('[data-filter]:checked').attr('data-value-default-lang', this.currentVariant.featured_media.alt.toLowerCase().replace(/ /g,"-"));
        }
    }

    // 获取所有type 为 radio 的input, 判断是否与当前规格的options 一致, 不一致则修改input checked属性
    updateInputChecked () {
        // 获取所有的 radio 按钮
        const radioButtons = document.querySelectorAll('.product-form__swatch input.product-form__radio[type="radio"]');
    
        // 获取 this.currentVariant.option3 的值
        const option3Value = this.currentVariant.option3;
    
        // 遍历 radio 按钮
        radioButtons.forEach((radio) => {
            // 如果当前 radio 的 checked 属性存在
            if (radio.checked) {
                // 检查其 value 是否与 option3Value 一致
                if (radio.value !== option3Value) {
                    // 如果不一致，移除 checked 属性
                    radio.checked = false;
                }
            }
    
            // 匹配条件：value 和 option3Value 一致
            if (radio.value === option3Value) {
                // 赋值 checked 属性
                radio.checked = true;
            }
        });
    }

    updateMedia(time) {
        if (!this.currentVariant || !this.currentVariant?.featured_media) return;

        const newMedia = document.querySelectorAll(
            `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
        );

        if (!newMedia) return false;
        console.log('!newMedia: return false')
      
        window.setTimeout(() => {
            $(newMedia).trigger('click');
        }, time);


        if (!this.isFullWidth || window.innerWidth < 768) return;

        const mediaToReplace = document.querySelector('.productView-image[data-index="1"]')
      
        const imageToReplace = mediaToReplace.querySelector('img')

        if (!this.currentVariant) return;

        const image = this.currentVariant?.featured_image;

        if (image == null) return;

        imageToReplace.setAttribute('src',  image.src)
        imageToReplace.setAttribute('srcset', image.src)
        imageToReplace.setAttribute('alt', image.alt)

        if (mediaToReplace.getBoundingClientRect().top < window.scrollY) {
            this.scrollToBlock(mediaToReplace)
        }
    }

    scrollToBlock(block) {
        const headerHeight = document.querySelectorAll('.section-header-navigation')[0]?.getBoundingClientRect().height 
        const announcementBarHeight = document.querySelectorAll('.announcement-bar')[0]?.getBoundingClientRect().height 
        const positionTop = block.getBoundingClientRect().top - headerHeight - announcementBarHeight 

        window.scrollTo({
            top: positionTop,
            behavior: 'smooth'
        })
    }

    updateURL() {
        if (!this.currentVariant) return;
        window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateVariantInput() {
        const productForms = document.querySelectorAll(`#product-form-${this.dataset.product}, #product-form-installment-${this.dataset.product}`);
      
        productForms.forEach((productForm) => {
            const input = productForm.querySelector('input[name="id"]');
            input.value = this.currentVariant.id;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    updatePickupAvailability() {
        const pickUpAvailability = document.querySelector('pickup-availability');
        if (!pickUpAvailability) return;

        if (this.currentVariant?.available) {
            pickUpAvailability.fetchAvailability(this.currentVariant.id);
        } else {
            pickUpAvailability.removeAttribute('available');
            pickUpAvailability.innerHTML = '';
        }
    }

    renderProductAjaxInfo() {
        fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
            .then((response) => response.text())
            .then((responseText) => {
                // price
                const id = `product-price-${this.dataset.product}`;
                // ergonomics
                const ergonomicsId = `product-ergonomics-${this.dataset.product}`
                
                const html = new DOMParser().parseFromString(responseText, 'text/html')
                // price
                const destination = document.getElementById(id);
                // ergonomics
                const destinationErgonomics = document.getElementById(ergonomicsId);
                // price
                const source = html.getElementById(id);
                // ergonomics
                const ergonomicsSource = html.getElementById(ergonomicsId)

                const property = `product-property-${this.dataset.product}`;
                const destinationProperty = document.getElementById(property);
                const sourceProperty = html.getElementById(property);

                // price
                if (source && destination) {
                    destination.innerHTML = source.innerHTML;
                }
                // ergonomics
                if (ergonomicsSource && destinationErgonomics) {
                  destinationErgonomics.innerHTML = ergonomicsSource.innerHTML
                }

                if (this.checkNeedToConvertCurrency()) {
                    let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');

                    Currency.convertAll(window.shop_currency, currencyCode, 'span.money', 'money_format');
                }

                if(destinationProperty) {
                    if (sourceProperty) {
                        destinationProperty.innerHTML = sourceProperty.innerHTML;
                        destinationProperty.style.display = 'table';
                    } else{
                        destinationProperty.style.display = 'none';
                    }
                } else if (sourceProperty) {
                    document.querySelector('.productView-product').insertBefore(sourceProperty, document.querySelector('.productView-options'));
                }

                document.getElementById(`product-price-${this.dataset.product}`)?.classList.remove('visibility-hidden');

                this.updateErgomicsSalePrice()
                

        });
      
        this.updatePriceAndIntallmentPrice()
    }

    // 仅针对athenax pink 
    updateErgomicsSalePrice() {
      if (this.currentVariant.name.toLocaleLowerCase().includes('blacklyte athena x gaming chair')) {
          // 获取目标元素
          const element = document.querySelector(
            '#product-price-8562365432039 .ergonomics_right_price'
          );
          if(this.currentVariant.option3 === 'Pink') {
            // 检查元素是否存在
            if (element) {
              // 添加类名
              element.classList.add('athenax_pink_price');
            }
          }
        }

      if(this.currentVariant.name.toLocaleLowerCase().includes('pixel art led')) {
        // 获取目标元素
        const element = document.querySelector(
          '#product-price-8456610480359 .ergonomics_right_price'
        );
        if (element) {
          // 添加类名
          element.classList.add('pixelArtLed_black_price');
        }
        
      }
      
    }

    // update 折扣后的价格与 分期价格
    updatePriceAndIntallmentPrice () {
      console.log(this.currentVariant)
      // athena x
      if (this.currentVariant.name.toLocaleLowerCase().includes('blacklyte athena x gaming chair')) {
        if(this.currentVariant.option3.toLocaleLowerCase() === 'pink') {
          this.applyDiscount(10000)
        }
      } else if(this.currentVariant.name.toLocaleLowerCase().includes('pixel art led')) {
        this.applyDiscount(5000)
      }
    }

    // 折扣价格
     applyDiscount(value) {
        if(value !== 0) {
          document.querySelector('#halloween_price').style.display = 'block';
          document.querySelector('#halloween_settings').style.textDecoration = 'line-through'
        } else {
          document.querySelector('#halloween_price').style.display = 'none';
          document.querySelector('#halloween_settings').style.textDecoration = 'none'
        }
        
        // 计算折扣后的价格
        const discountedPrice = Shopify.formatMoney(this.currentVariant.price - value, window.money_format);
       
        const finalPrice = discountedPrice.replace(/[,.]00/, '') + ' ' + window.shop_currency;
      
        // 4期分期付款
        const installmentPrice4 = Shopify.formatMoney((this.currentVariant.price - value) / 4, window.money_format);
        // 12期分期付款
        const installmentPrice12 = Shopify.formatMoney((this.currentVariant.price - value) / 12, window.money_format);

        setTimeout(() => {
          document.querySelector('#checkout_price').textContent = finalPrice;
          document.querySelector('#product_installment_price').textContent = installmentPrice4;
          document.querySelector('#product_installment_price_12').textContent = installmentPrice12;
        }, 0)
    }

    renderProductInfo() {
        if(this.item.find('[data-sku]').length > 0){
            this.item.find('[data-sku] .productView-info-value').text(this.currentVariant.sku);
        }

        if(this.item.find('[data-barcode]').length > 0){
            this.item.find('[data-barcode] .productView-info-value').text(this.currentVariant.barcode);
        }

        var inventory = this.currentVariant?.inventory_management;

        if(inventory != null) {
            var arrayInVarName = `product_inven_array_${this.dataset.product}`,
                inven_array = window[arrayInVarName];

            if(inven_array != undefined) {
                var inven_num = inven_array[this.currentVariant.id],
                    inputQuantity = this.item.find('input[name="quantity"]'),
                    buttonSubmit = this.item.find('button#product-add-to-cart'),
                    inventoryQuantity = parseInt(inven_num);

                if(inputQuantity.length > 0) {
                    inputQuantity.attr('data-inventory-quantity', inventoryQuantity);
                } else {
                    buttonSubmit.attr('data-inventory-quantity', inventoryQuantity);
                }

                if(this.item.find('[data-inventory]').length > 0){
                    if(inventoryQuantity > 0){
                        const showStock = this.item.find('[data-inventory]').data('stock-level');
                        if (showStock == 'show') {
                            this.item.find('[data-inventory] .productView-info-value').text(inventoryQuantity+' '+window.inventory_text.inStock);
                        }
                        else {
                            this.item.find('[data-inventory] .productView-info-value').text(window.inventory_text.inStock);
                        }
                    } else {
                        this.item.find('[data-inventory] .productView-info-value').text(window.inventory_text.outOfStock);
                    }
                }

                hotStock(inventoryQuantity);
            }
        }

        if(this.item.find('.productView-stickyCart').length > 0){
            const sticky = this.item.find('.productView-stickyCart');
            const optionSticky = sticky.find('.select__select');

            optionSticky.val(this.currentVariant.id);
        }
    }

    updateProductInfo() {
        fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
            .then((response) => response.text())
            .then((responseText) => {
                const description = `[data-product-description-${this.dataset.product}]`
                const html = new DOMParser().parseFromString(responseText, 'text/html')
                const destinationDesc = document.querySelector(description);
                const sourceDesc = html.querySelector(description);

                if (sourceDesc && destinationDesc) {
                    destinationDesc.innerHTML = sourceDesc.innerHTML;
                    if (destinationDesc.closest('.toggle-content--height')){
                        destinationDesc.style.maxHeight = null;
                    }
                }
        });

        document.querySelectorAll('.product_metafield_value').forEach(item => {
          
          if (item.getAttribute('data-variant-id') == this.currentVariant.id && item.innerText.trim() !== '') {
            item.style.display = 'inline-block'
          } else {
            item.style.display = 'none'
          }
        })

        this.initSalePriceAndIntallmentPrice()
        
    }

    // 初始化 价格与售卖价格
    initSalePriceAndIntallmentPrice() {
        const currentVariantPrice = this.currentVariant.price
        var listPrice = (window.totalPrices - 0) + (currentVariantPrice - 0)
        // 总价
        const priceFinal = Shopify.formatMoney(listPrice, window.money_format)
        // 当前规格的价格
        const currentVariantPriceFinal = Shopify.formatMoney(currentVariantPrice, window.money_format)
        // 分期付款的价格
        const productInstallmentPrice = currentVariantPrice / 4
        const productInstallmentPriceFinal = Shopify.formatMoney(productInstallmentPrice, window.money_format)
        var listTotalPriceCount = priceFinal.replace(/[,.]00/, '')
        const currentVariantPriceFinalCount = currentVariantPriceFinal.replace(/[,.]00/, '')
        const currency = window.shop_currency
        const texts = listTotalPriceCount + ' ' + currency
        const currentTexts = currentVariantPriceFinalCount + ' ' + currency
        
        document.querySelector('#list-price').textContent = texts
        document.querySelector('.price__last .price-item.price-item--regular').textContent = currentTexts
        document.querySelector('.price__last .price-item.price-item--sale').textContent = currentTexts
        document.querySelector('#product_installment_price').textContent = productInstallmentPriceFinal
        
        // 当材质变化时,显示不同材质的色块
      if(this.currentVariant.name.toLocaleLowerCase().includes('blacklyte athena x gaming chair')) {
           
          if(this.currentVariant.option3 === 'Pink') {
            // 折扣价格
            const priceHell = Shopify.formatMoney(this.currentVariant.price - 10000, window.money_format)
            const finPriceHell = priceHell.replace(/[,.]00/, '') + ' ' + window.shop_currency
            document.querySelector('#checkout_price').textContent = finPriceHell
            // fenqi
            const fenqiprice = Shopify.formatMoney((this.currentVariant.price - 10000) / 4, window.money_format)
            document.querySelector('#product_installment_price').textContent = fenqiprice
          }

          this.updateErgomicsSalePrice()
        }
    }

    updateAttribute(unavailable = true, disable = true){
        const productMetafieldValueList = document.querySelectorAll('.product_metafield_value')
        if (Array.from(productMetafieldValueList).length > 0) {
            document.querySelectorAll('.product_metafield_value').forEach(item => {
              if (item.getAttribute('data-variant-id') == this.currentVariant.id && item.innerText.trim() !== '') {
                item.style.display = 'inline-block'
              } else {
                item.style.display = 'none'
              }
            })
        }

        
        const addButton = document.getElementById(`product-form-${this.dataset.product}`)?.querySelector('[name="add"]');
        const buyButton = document.getElementById(`product-form-${this.dataset.product}`)?.querySelector('[data-btn-buyItNow]');
        var quantityInput = this.item.find('input[name="quantity"]'),
            notifyMe = this.item.find('.productView-notifyMe'),
            hotStock = this.item.find('.productView-hotStock'),
            buttonAddtocart = this.item.find('.product-form__submit'),
            maxValue = parseInt(quantityInput.attr('data-inventory-quantity'));

        if (isNaN(maxValue)) {
            maxValue = maxValue = parseInt(buttonAddtocart.attr('data-inventory-quantity'));
        } else {
            maxValue = parseInt(quantityInput.attr('data-inventory-quantity'));
        }
        
        if(unavailable){
            var text = window.variantStrings.unavailable;

            quantityInput.attr('disabled', true);
            notifyMe.slideUp('slow');
            addButton.setAttribute('disabled', true);
            addButton.textContent = text;
            buyButton.setAttribute('disabled', true);
            buyButton.textContent = text
            quantityInput.closest('quantity-input').addClass('disabled');

            if(hotStock.length > 0) hotStock.addClass('is-hiden');
        } else {
            if (disable) {
                var text = window.variantStrings.soldOut,
                    subTotal = 0,
                    price = this.currentVariant?.price;

                const stickyPrice = $('[data-sticky-add-to-cart] .money-subtotal .money');
                const stickyComparePrice = $('[data-sticky-add-to-cart] .money-compare-price .money');

                if (window.subtotal.show) {
                    let qty = quantityInput.val() || 1;

                    subTotal = qty * price;
                    subTotal = Shopify.formatMoney(subTotal, window.money_format);
                    subTotal = extractContent(subTotal);

                    const moneySpan = document.createElement('span')
                    moneySpan.classList.add(window.currencyFormatted ? 'money' : 'money-subtotal')
                    moneySpan.innerText = subTotal
                    document.body.appendChild(moneySpan)

                    if (this.checkNeedToConvertCurrency()) {
                        let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');
                        Currency.convertAll(window.shop_currency, currencyCode, 'span.money', 'money_format');
                    }

                    subTotal = moneySpan.innerText
                    $(moneySpan).remove()

                    if (window.subtotal.style == '1') {
                        const pdView_subTotal = document.querySelector('.productView-subtotal .money') || document.querySelector('.productView-subtotal .money-subtotal');
                        if (pdView_subTotal != null) {
                            pdView_subTotal.textContent = subTotal;
                        }
                    } else if (window.subtotal.style == '2') {
                        text = window.subtotal.text.replace('[value]', subTotal);
                    }
                } else {
                    subTotal = Shopify.formatMoney(price, window.money_format);
                    subTotal = extractContent(subTotal);
                }

                quantityInput.attr('data-price', this.currentVariant?.price);
                quantityInput.attr('disabled', true);
                addButton.setAttribute('disabled', true);
                addButton.textContent = text;
                buyButton.setAttribute('disabled', true);
                buyButton.textContent = text
                quantityInput.closest('quantity-input').addClass('disabled');

                if (subTotal != 0 && stickyPrice.length) {
                    stickyPrice.text(subTotal);
                }

                const thisStickyPrice = $('[data-sticky-add-to-cart] .sticky-price');
                const thisComparePrice = $('[data-sticky-add-to-cart] .money-compare-price');
                const compare_at_price = this.currentVariant?.compare_at_price;
                const current_at_price = this.currentVariant?.price;

                if(compare_at_price == current_at_price) {
                    thisStickyPrice.removeClass('has-compare-price');
                    thisComparePrice.remove();
                } else {
                    if (compare_at_price) {
                        thisStickyPrice.addClass('has-compare-price');
                        if (thisComparePrice.length) {
                            thisComparePrice.attr('data-compare-price', compare_at_price);
                        } else {
                            thisStickyPrice.prepend(`<s class="money-compare-price" data-compare-price="${compare_at_price}"><span class="money"></span></s>`);
                        }
                    } else {
                        thisStickyPrice.removeClass('has-compare-price');
                        thisComparePrice.remove();
                    }
                }

                if (subTotal != 0 && stickyComparePrice.length && window.subtotal.show) {
                    let comparePrice = $('[data-sticky-add-to-cart] .money-compare-price').data('compare-price'),
                        qty = quantityInput.val() || 1;
                    comparePrice = qty * comparePrice;
                    comparePrice = Shopify.formatMoney(comparePrice, window.money_format);
                    comparePrice = extractContent(comparePrice);
                    stickyComparePrice.text(comparePrice);
                }

                if (notifyMe.length > 0) {
                    notifyMe.find('.halo-notify-product-variant').val(this.currentVariant.title);
                    notifyMe.find('.notifyMe-text').empty();
                    notifyMe.slideDown('slow');
                }
            } else {
                var text,
                    subTotal = 0,
                    price = this.currentVariant?.price;

                const stickyPrice = $('[data-sticky-add-to-cart] .money-subtotal .money');

                if (window.subtotal.show) {
                    let qty = quantityInput.val() || 1;

                    subTotal = qty * price;
                    subTotal = Shopify.formatMoney(subTotal, window.money_format);
                    subTotal = extractContent(subTotal);

                    const moneySpan = document.createElement('span')
                    moneySpan.classList.add(window.currencyFormatted ? 'money' : 'money-subtotal')
                    moneySpan.innerText = subTotal
                    document.body.appendChild(moneySpan)

                    if (this.checkNeedToConvertCurrency()) {
                        let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');
                        Currency.convertAll(window.shop_currency, currencyCode, 'span.money', 'money_format');
                    }

                    subTotal = moneySpan.innerText
                    $(moneySpan).remove()

                    if (window.subtotal.style == '1') {
                        const pdView_subTotal = document.querySelector('.productView-subtotal .money') || document.querySelector('.productView-subtotal .money-subtotal');
                        if (pdView_subTotal != null) {
                            pdView_subTotal.textContent = subTotal;
                        }

                        if (this.currentVariant.available && maxValue <= 0 && this.currentVariant.inventory_management == "shopify") {
                            text = window.variantStrings.preOrder;
                            // document.querySelector('.product_metafield_value').style.display = 'inline-block'
                        } else {
                            text = window.variantStrings.addToCart;
                            // document.querySelector('.product_metafield_value').style.display = 'none'
                        }
                    } else if (window.subtotal.style == '2') {
                        if (this.currentVariant.available && maxValue <= 0 && this.currentVariant.inventory_management == "shopify") {
                            text = window.variantStrings.preOrder;
                            // document.querySelector('.product_metafield_value').style.display = 'inline-block'
                        } else {
                            text = window.subtotal.text.replace('[value]', subTotal);
                            $('#show-sticky-product').text(text);
                            $('#product-sticky-add-to-cart').text(text);
                            // document.querySelector('.product_metafield_value').style.display = 'none'
                        }
                    }
                } else {
                    subTotal = Shopify.formatMoney(price, window.money_format);
                    subTotal = extractContent(subTotal);
                    if (this.currentVariant.available && maxValue <= 0 && this.currentVariant.inventory_management == "shopify") {
                        text = window.variantStrings.preOrder;
                        // document.querySelector('.product_metafield_value').style.display = 'inline-block'
                    } else {
                        text = window.variantStrings.addToCart;
                        // document.querySelector('.product_metafield_value').style.display = 'none'
                    }
                }

                quantityInput.attr('data-price', this.currentVariant?.price);
                quantityInput.attr('disabled', false);
                addButton.removeAttribute('disabled');
                addButton.textContent = text;
                if (buyButton) {
                  buyButton.removeAttribute('disabled');
                  buyButton.textContent = 'Buy it now';
                }
                
                quantityInput.closest('quantity-input').removeClass('disabled');

                if (subTotal != 0 && stickyPrice.length) {
                    stickyPrice.text(subTotal);
                }

                const thisStickyPrice = $('[data-sticky-add-to-cart] .sticky-price');
                const thisComparePrice = $('[data-sticky-add-to-cart] .money-compare-price');
                const compare_at_price = this.currentVariant?.compare_at_price;
                const current_at_price = this.currentVariant?.price;

                if(compare_at_price == current_at_price) {
                    thisStickyPrice.removeClass('has-compare-price');
                    thisComparePrice.remove();
                } else {
                    if (compare_at_price) {
                        thisStickyPrice.addClass('has-compare-price');
                        if (thisComparePrice.length) {
                            thisComparePrice.attr('data-compare-price', compare_at_price);
                        } else {
                            thisStickyPrice.prepend(`<s class="money-compare-price" data-compare-price="${compare_at_price}"><span class="money"></span></s>`);
                        }
                    } else {
                        thisStickyPrice.removeClass('has-compare-price');
                        thisComparePrice.remove();
                    }
                }

                const stickyComparePrice = $('[data-sticky-add-to-cart] .money-compare-price .money');
                if (subTotal != 0 && stickyComparePrice.length && window.subtotal.show) {
                    let comparePrice = $('[data-sticky-add-to-cart] .money-compare-price').data('compare-price'),
                        qty = quantityInput.val() || 1;
                    comparePrice = qty * comparePrice;
                    comparePrice = Shopify.formatMoney(comparePrice, window.money_format);
                    comparePrice = extractContent(comparePrice);
                    stickyComparePrice.text(comparePrice);
                }

                if (notifyMe.length > 0) {
                    notifyMe.slideUp('slow');
                }
            }
        }
    }

    updateStickyAddToCart(unavailable = true, disable = true){
        if(this.item.find('.productView-stickyCart').length > 0){
            const sticky = this.item.find('.productView-stickyCart');
            const itemImage = sticky.find('.sticky-image');
            const option = sticky.find('.select__select');
            const input = document.getElementById(`product-form-sticky-${this.dataset.product}`)?.querySelector('input[name="id"]');
            const button = document.getElementById(`product-form-sticky-${this.dataset.product}`)?.querySelector('[name="add"]');
            var quantityInput = this.item.find('input[name="quantity"]');
            var maxValue;

            if (quantityInput.length > 0) {
                maxValue = parseInt(quantityInput.attr('data-inventory-quantity'));
            } else {
                maxValue = parseInt(submitBtn.attr('data-inventory-quantity'));
            }
          
            if(unavailable){
                var text = window.variantStrings.unavailable;

                button.setAttribute('disabled', true);
                button.textContent = text;
            } else {
                if (!this.currentVariant) return;

                const image = this.currentVariant?.featured_image;
                
                if (image != null) {
                    itemImage.find('img').attr({
                        'src': image.src,
                        'srcset': image.src,
                        'alt': image.alt
                    });
                }

                option.val(this.currentVariant.id);

                if (disable) {
                    var text = window.variantStrings.soldOut;

                    button.setAttribute('disabled', true);
                    button.textContent = text;
                } else {
                    if (this.currentVariant.available && maxValue <= 0 && this.currentVariant.inventory_management == "shopify") {
                        text = window.variantStrings.preOrder;
                        // document.querySelector('.product_metafield_value').style.display = 'inline-block'
                    } else {
                        text = window.variantStrings.addToCart;
                        // document.querySelector('.product_metafield_value').style.display = 'none'
                    }

                    button.removeAttribute('disabled');
                    button.textContent = text;
                }

                input.value = this.currentVariant.id;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    getVariantData() {
        this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
        return this.variantData;
    }

    checkNeedToConvertCurrency() {
        var currencyItem = $('.dropdown-item[data-currency]');
        if (currencyItem.length) {
            return (window.show_multiple_currencies && Currency.currentCurrency != shopCurrency) || window.show_auto_currency;
        } else {
            return;
        }
    }

    checkQuantityWhenVariantChange() {
        var quantityInput = this.closest('.productView-details').querySelector('input.quantity__input')
        var maxValue = parseInt(quantityInput?.dataset.inventoryQuantity);
        var inputValue = parseInt(quantityInput?.value);

        let value = inputValue 

        if (inputValue > maxValue && maxValue > 0) {
            value = maxValue
        } else {
            value = inputValue
        }

        if (value < 1 || isNaN(value)) value = 1 
      
        if (quantityInput) {
          quantityInput.value = value
        }
      
        document.getElementById('product-add-to-cart').dataset.available = this.currentVariant.available && maxValue <= 0
    }

    updateVariantStatuses() {
        // const options = this.item.find('.productView-details .product-form__input'),
        //     optionsLength = options.length,
        //     pvOptionsLength = PVoptions.length,
        //     checkStickyVariant = false;
      
        // optionsLength > pvOptionsLength ? checkStickyVariant = true : '';
      
        const selectedOptionOneVariants = this.variantData.filter(variant => this.querySelector(':checked').value === variant.option1);
        const inputWrappers = [...this.querySelectorAll('.product-form__input')];
        const inputLength = inputWrappers.length;
        const variant_swatch = [...this.querySelectorAll('.product-form__swatch')];
        inputWrappers.forEach((option, index) => {
            option.querySelector('[data-header-option]').innerText = option.querySelector(':checked').value;
            if (index === 0 && inputLength > 1) return;
            const optionInputs = [...option.querySelectorAll('input[type="radio"], option')]
            const previousOptionSelected = inputLength > 1 ? inputWrappers[index - 1].querySelector(':checked').value : inputWrappers[index].querySelector(':checked').value;
            const optionInputsValue = inputLength > 1 ? selectedOptionOneVariants.filter(variant => variant[`option${ index }`] === previousOptionSelected).map(variantOption => variantOption[`option${ index + 1 }`]) : this.variantData.map(variantOption => variantOption[`option${ index + 1 }`]);
            const availableOptionInputsValue = inputLength > 1 ? selectedOptionOneVariants.filter(variant => variant.available && variant[`option${ index }`] === previousOptionSelected).map(variantOption => variantOption[`option${ index + 1 }`]) : this.variantData.filter(variant => variant.available).map(variantOption => variantOption[`option${ index + 1 }`]);
            this.setInputAvailability(optionInputs, optionInputsValue, availableOptionInputsValue)
            if (variant_swatch.length > 1){
                this.updateImageSwatch(selectedOptionOneVariants)
            }
        });
    }

    updateImageSwatch(selectedOptionOneVariants) {
        const inputWrappers = this.querySelectorAll('.product-form__input');
        if(inputWrappers){
            inputWrappers.forEach((element, inputIndex) => {
                const imageSpan = element.querySelectorAll("label>span.pattern");
                const imageLabel = element.querySelectorAll("label");
                const imageSpanImage = element.querySelectorAll("label>span.expand>img");
                const inputList = element.querySelectorAll("input");

                inputList.forEach((item, index) => {
                    const image = selectedOptionOneVariants.filter(tmp => {
                        if (inputIndex == 0) return tmp.option1 == item.value;
                        if (inputIndex == 1) return tmp.option2 == item.value;
                        if (inputIndex == 2) return tmp.option3 == item.value;
                    });
    
                    if(image.length > 0) {
                        imageLabel[index].style.display = "inline-block";
                        if (imageSpan[index] != undefined && image[0].featured_image != null) imageSpan[index].style.backgroundImage = `url("${image[0].featured_image.src}")`;
                        if (imageSpanImage[index] != undefined && image[0].featured_image != null) imageSpanImage[index].srcset = image[0].featured_image.src;
                    }
                    // else {
                    //     imageLabel[index].style.display = "none";
                    // }
                })
            });
        }
    }            

    setInputAvailability(optionInputs, optionInputsValue, availableOptionInputsValue) {
        optionInputs.forEach(input => {
            if (availableOptionInputsValue.includes(input.getAttribute('value'))) {
                input.classList.remove('soldout');
                input.innerText = input.getAttribute('value');
              input.disabled = false
            } else {
                input.classList.add('soldout');
              input.disabled = true
                optionInputsValue.includes(input.getAttribute('value')) ? input.innerText = input.getAttribute('value') + ' (Sold out)' : input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'))
            }
        });
    }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
    constructor() {
        super();
    }

    setInputAvailability(optionInputs, optionInputsValue, availableOptionInputsValue) {
        optionInputs.forEach(input => {
            if (availableOptionInputsValue.includes(input.getAttribute('value'))) {
                input.nextSibling.classList.remove('soldout', 'unavailable');
                input.nextSibling.classList.add('available');
              input.disabled = false
            } else {
                input.nextSibling.classList.remove('available', 'unavailable');
                input.nextSibling.classList.add('soldout');
              input.disabled = true

                if (window.variantStrings.hide_variants_unavailable && !optionInputsValue.includes(input.getAttribute('value'))) {
                    input.nextSibling.classList.add('unavailable')
                    if (!input.checked) return;
                    let inputsValue;
                    availableOptionInputsValue.length > 0 ? inputsValue = availableOptionInputsValue : inputsValue = optionInputsValue;
                    input.closest('.product-form__input').querySelector(`input[value="${inputsValue[0]}"]`).checked = true;
                    this.dispatchEvent(new Event('change'))
                }
            }
        });
    }
        
    updateOptions() {
        const fieldsets = Array.from(this.querySelectorAll('fieldset'));
        this.options = fieldsets.map((fieldset) => {
            return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
        });
    }
}

customElements.define('variant-radios', VariantRadios);

class QuantityInput extends HTMLElement {
    constructor() {
        super();
        this.input = this.querySelector('input');
        this.changeEvent = new Event('change', { bubbles: true });
        this.input.addEventListener('change', this.onInputChange.bind(this));

        this.querySelectorAll('button').forEach(
            (button) => button.addEventListener('click', this.onButtonClick.bind(this))
        );

        if (!this.checkHasMultipleVariants()) {
            this.initProductQuantity();
            this.checkVariantInventory();
        }
    }

    onInputChange(event) {
        event.preventDefault(); 
        var inputValue = this.input.value;
        var maxValue = parseInt(this.input.dataset.inventoryQuantity);
        var currentId = document.getElementById(`product-form-${this.input.dataset.product}`)?.querySelector('[name="id"]')?.value;
        var saleOutStock  = document.getElementById('product-add-to-cart').dataset.available === 'true' || false ;
        const addButton = document.getElementById(`product-form-${this.input.dataset.product}`)?.querySelector('[name="add"]');

        if(inputValue < 1) {
            inputValue = 1;

            this.input.value =  inputValue;
        }
        
        if (inputValue > maxValue && !saleOutStock && maxValue > 0) {
            var arrayInVarName = `selling_array_${this.input.dataset.product}`,
                itemInArray = window[arrayInVarName],
                itemStatus = itemInArray[currentId];
          
            if(itemStatus == 'deny') {
              inputValue = maxValue
              this.input.value = inputValue;
              const message = getInputMessage(maxValue)
              showWarning(message, 3000)
            }
        } else if (inputValue > maxValue && saleOutStock && maxValue <= 0) {
            this.input.value = inputValue;
        }

        if(window.subtotal.show) {
            var text,
                price = this.input.dataset.price,
                subTotal = 0;

            var parser = new DOMParser();

            subTotal = inputValue * price;
            subTotal = Shopify.formatMoney(subTotal, window.money_format);
            subTotal = extractContent(subTotal);

            const moneySpan = document.createElement('span')
            moneySpan.classList.add(window.currencyFormatted ? 'money' : 'money-subtotal') 
            moneySpan.innerText = subTotal 
            document.body.appendChild(moneySpan) 

            if (this.checkNeedToConvertCurrency()) {
                let currencyCode = document.getElementById('currencies')?.querySelector('.active')?.getAttribute('data-currency');
                Currency.convertAll(window.shop_currency, currencyCode, 'span.money', 'money_format');
            }

            subTotal = moneySpan.innerText 
            $(moneySpan).remove()

            if (window.subtotal.style == '1') {
                const pdView_subTotal = document.querySelector('.productView-subtotal .money') || document.querySelector('.productView-subtotal .money-subtotal');

                pdView_subTotal.textContent = subTotal;
            }
            else if (window.subtotal.style == '2') {
                text = window.subtotal.text.replace('[value]', subTotal);
                $('#product-sticky-add-to-cart').text(text);

                addButton.textContent = text;  
            }

            const stickyPrice = $('[data-sticky-add-to-cart] .money-subtotal .money');
            const stickyComparePrice = $('[data-sticky-add-to-cart] .money-compare-price .money');

            if (stickyPrice.length) {
                stickyPrice.text(subTotal);
            }

            if (stickyComparePrice.length && window.subtotal.show) {
                let comparePrice = $('[data-sticky-add-to-cart] .money-compare-price').data('compare-price');
                comparePrice = inputValue * comparePrice;
                comparePrice = Shopify.formatMoney(comparePrice, window.money_format);
                comparePrice = extractContent(comparePrice);
                stickyComparePrice.text(comparePrice);
            }
        }

        if (this.classList.contains('quantity__group--2') || this.classList.contains('quantity__group--3')) {
            const mainQty = document.querySelector('.quantity__group--1 .quantity__input');
            mainQty.value = inputValue;

            const mainQty2Exists = !!document.querySelector('.quantity__group--2 .quantity__input');
            const mainQty3Exists = !!document.querySelector('.quantity__group--3 .quantity__input');

            if (this.classList.contains('quantity__group--2') && mainQty3Exists) {
                const mainQty3 = document.querySelector('.quantity__group--3 .quantity__input');
                mainQty3.value = inputValue;
            }
            else if (this.classList.contains('quantity__group--3') && mainQty2Exists) {
                const mainQty2 = document.querySelector('.quantity__group--2 .quantity__input');
                mainQty2.value = inputValue;
            }
        }
    }

    onButtonClick(event) {
        event.preventDefault();
        const previousValue = this.input.value;
        
        event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
        if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
    }

    checkNeedToConvertCurrency() {
        return (window.show_multiple_currencies && Currency.currentCurrency != shopCurrency) || window.show_auto_currency;
    }
    
    checkHasMultipleVariants() {
        const arrayInVarName = `product_inven_array_${this.querySelector('[data-product]').dataset.product}`
        this.inven_array = window[arrayInVarName];
        return Object.keys(this.inven_array).length > 1
    }
        
    initProductQuantity() {
        if(this.inven_array != undefined) {
            var inven_num = Object.values(this.inven_array),
                inventoryQuantity = parseInt(inven_num);

            this.querySelector('input[name="quantity"]').setAttribute('data-inventory-quantity', inventoryQuantity);
            this.querySelector('input[name="quantity"]').dataset.inventoryQuantity = inventoryQuantity
        }
    }

    checkVariantInventory() {
        const addBtn = document.getElementById('product-add-to-cart')
        this.input.disabled = addBtn.disabled 
        this.querySelector('.btn-quantity.minus').disabled = addBtn.disabled
        this.querySelector('.btn-quantity.plus').disabled = addBtn.disabled
    }

    getVariantData() {
        this.variantData = this.variantData || JSON.parse(document.querySelector('.product-option [type="application/json"]').textContent);
        return this.variantData;
    }
}

customElements.define('quantity-input', QuantityInput);

function hotStock(inventoryQuantity) {
    const productView = document.querySelector('.productView');
    const hotStock = productView.querySelector('.productView-hotStock');
    if(hotStock) {
        let hotStockText = hotStock.querySelector('.hotStock-text'),
            maxStock = parseFloat(hotStock.dataset.hotStock),
            textStock;

        if(inventoryQuantity > 0 && inventoryQuantity <= maxStock){
            hotStock.matches('.style-2') ? textStock  = window.inventory_text.hotStock2.replace('[inventory]', inventoryQuantity) : textStock  = window.inventory_text.hotStock.replace('[inventory]', inventoryQuantity);
            if (hotStockText) hotStockText.innerHTML = textStock;
            hotStock.classList.remove('is-hide');
        } else {
            hotStock.classList.add('is-hide');
        }

        if (hotStock.matches('.style-2')) {
            const invenProgress = inventoryQuantity / maxStock * 100,
                hotStockProgressItem = hotStock.querySelector('.hotStock-progress-item');
            if (hotStockProgressItem) hotStockProgressItem.style.width = `${invenProgress}%`;
        }
    }
}
const hotStockNoOptions = document.querySelector('.productView .productView-hotStock[data-current-inventory]');
if (hotStockNoOptions) {
    const inventoryQuantity = parseFloat(hotStockNoOptions.dataset.currentInventory);
    hotStock(inventoryQuantity);
}


function showWarning(content, time = null) {
    if (window.warningTimeout) {
        clearTimeout(window.warningTimeout);
    }
    const warningPopupContent = document.getElementById('halo-warning-popup').querySelector('[data-halo-warning-content]')
    warningPopupContent.textContent = content
    document.body.classList.add('has-warning')

    if (time) {
        window.warningTimeout = setTimeout(() => {
            document.body.classList.remove('has-warning')
        }, time)
    }
}

function getInputMessage(maxValue) {
    var message = window.cartStrings.addProductOutQuantity.replace('[maxQuantity]', maxValue);
    return message
}