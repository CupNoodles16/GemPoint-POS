import { Controller } from "@hotwired/stimulus";

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

export default class extends Controller {
  static targets = ["cartItems", "cartTotal", "barcodeSearch"];
  
  connect() {
    this.cart = [];
    this.allProducts = [];
    this.currentProducts = [];
    this.searchTerm = '';
    this.selectedCategory = null;
    this.updateDateTime();
    this.startDateTimeInterval();
    this.loadProducts();
    this.setupAmountInput();
    this.isNewAmountEntry = true;
    
    // Add keyboard listener for numpad
    this.boundHandleKeyboardInput = this.handleKeyboardInput.bind(this);
    document.addEventListener('keydown', this.boundHandleKeyboardInput);
  }
  
  disconnect() {
    if (this.dateTimeInterval) clearInterval(this.dateTimeInterval);
    if (this.boundHandleKeyboardInput) {
      document.removeEventListener('keydown', this.boundHandleKeyboardInput);
    }
  }
  
  startDateTimeInterval() {
    this.updateDateTime();
    this.dateTimeInterval = setInterval(() => this.updateDateTime(), 60000);
  }
  
  updateDateTime() {
    const now = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const dateTimeElement = document.getElementById('current-datetime');
    if (dateTimeElement) {
      dateTimeElement.innerText = now.toLocaleString('en-US', options);
    }
  }
  
  loadProducts() {
    const productButtons = document.querySelectorAll('.product-btn');
    this.allProducts = Array.from(productButtons).map(btn => ({
      id: btn.dataset.productId,
      name: btn.dataset.productName,
      price: parseFloat(btn.dataset.productPrice),
      quantity: parseInt(btn.dataset.stock) || 0,
      category_id: btn.dataset.categoryId || null,
      barcode: btn.dataset.barcode || null
    }));
    this.currentProducts = [...this.allProducts];
    this.renderProducts();
  }
  
  renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    if (this.currentProducts.length === 0) {
      productsGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No products found.</div>';
      return;
    }
    
    let html = '';
    this.currentProducts.forEach(product => {
      html += `
        <button class="product-btn bg-white rounded-lg shadow p-3 hover:shadow-md active:scale-95 transition-all text-left"
                data-action="click->pos#addToCart"
                data-product-id="${product.id}"
                data-product-name="${product.name}"
                data-product-price="${product.price}"
                data-category-id="${product.category_id || ''}"
                data-stock="${product.quantity}"
                data-barcode="${product.barcode || ''}">
          <div class="text-sm font-semibold text-gray-800">${product.name}</div>
          <div class="text-base font-bold text-green-600 mt-1">₱${product.price}</div>
          <div class="text-xs text-gray-500 mt-1">Stock: ${product.quantity}</div>
        </button>
      `;
    });
    
    productsGrid.innerHTML = html;
  }
  
  setupAmountInput() {
    const amountInput = document.getElementById('cash-amount-received');
    if (!amountInput) return;
    
    amountInput.addEventListener('input', (e) => {
      let value = e.target.value;
      let cleanValue = value.replace(/[^0-9.]/g, '');
      const parts = cleanValue.split('.');
      if (parts.length > 2) {
        cleanValue = parts[0] + '.' + parts.slice(1).join('');
      }
      if (parts[1] && parts[1].length > 2) {
        cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
      }
      e.target.value = cleanValue;
      this.calculateCashChange();
    });
  }
  
  openKeypadForAmount() {
    const amountDisplay = document.getElementById('keypad-amount');
    const amountInput = document.getElementById('cash-amount-received');
    
    // Reset keypad display to current amount value
    let currentValue = amountInput.value || '0';
    amountDisplay.innerText = `₱${parseFloat(currentValue).toFixed(2)}`;
    this.isNewAmountEntry = true;
    
    // Focus on keypad area
    const keypadContainer = document.querySelector('#cash-confirm-modal .bg-gray-50');
    if (keypadContainer) {
      keypadContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  handleQuantityClick(event) {
    event.stopPropagation();
  }
  
  toggleKeypad(event) {
    if (event) event.stopPropagation();
  }
  
  handleKeyboardInput(event) {
    // Check if cash modal is visible
    const cashModal = document.getElementById('cash-confirm-modal');
    const isCashModalVisible = cashModal && !cashModal.classList.contains('hidden');
    
    if (!isCashModalVisible) return;
    
    const key = event.key;
    const displayAmount = document.getElementById('keypad-amount');
    
    // Handle number keys (both regular and numpad)
    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      if (this.isNewAmountEntry) {
        displayAmount.innerText = '₱';
        this.isNewAmountEntry = false;
      }
      this.updateKeypadDisplay(key);
    } 
    // Handle decimal point
    else if (key === '.' || key === ',') {
      event.preventDefault();
      const currentText = displayAmount.innerText.replace('₱', '');
      if (!currentText.includes('.')) {
        if (this.isNewAmountEntry) {
          displayAmount.innerText = '₱0';
          this.isNewAmountEntry = false;
        }
        this.updateKeypadDisplay('.');
      }
    }
    // Handle backspace (regular and delete key)
    else if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault();
      let currentText = displayAmount.innerText.replace('₱', '');
      if (currentText.length > 1) {
        currentText = currentText.slice(0, -1);
      } else {
        currentText = '0';
        this.isNewAmountEntry = true;
      }
      displayAmount.innerText = `₱${currentText}`;
      
      // Live update amount field
      let numericAmount = parseFloat(currentText);
      if (!isNaN(numericAmount)) {
        const amountField = document.getElementById('cash-amount-received');
        if (amountField) {
          amountField.value = numericAmount.toFixed(2);
          const inputEvent = new Event('input');
          amountField.dispatchEvent(inputEvent);
        }
      }
    }
    // Handle Enter key (confirm payment)
    else if (key === 'Enter') {
      event.preventDefault();
      const confirmBtn = document.getElementById('confirm-cash-payment-btn');
      if (confirmBtn && !confirmBtn.disabled) {
        this.confirmCashPayment();
      }
    }
    // Handle Escape key (close modal)
    else if (key === 'Escape') {
      event.preventDefault();
      this.closeCashConfirmModal();
    }
  }
  
  updateKeypadDisplay(value) {
    const displayAmount = document.getElementById('keypad-amount');
    let currentText = displayAmount.innerText.replace('₱', '');
    
    // Handle decimal point
    if (value === '.') {
      if (currentText.includes('.')) return;
      if (currentText === '0' || currentText === '') {
        currentText = '0.';
      } else {
        currentText += '.';
      }
      displayAmount.innerText = `₱${currentText}`;
      return;
    }
    
    // Handle numbers
    if (currentText === '0' || currentText === '0.') {
      currentText = value;
    } else {
      currentText += value;
    }
    
    // Limit to 2 decimal places
    if (currentText.includes('.')) {
      const parts = currentText.split('.');
      if (parts[1] && parts[1].length > 2) {
        return;
      }
    }
    
    displayAmount.innerText = `₱${currentText}`;
  }
  
  keypadPress(event) {
    event.stopPropagation();
    const value = event.currentTarget.dataset.value;
    const displayAmount = document.getElementById('keypad-amount');
    
    // Clear the display if it's the initial state
    if (this.isNewAmountEntry && /^[0-9]$/.test(value)) {
      displayAmount.innerText = '₱';
      this.isNewAmountEntry = false;
    }
    
    this.updateKeypadDisplay(value);
    
    // Live update the amount received field
    let currentText = displayAmount.innerText.replace('₱', '');
    let numericAmount = parseFloat(currentText);
    if (!isNaN(numericAmount)) {
      const amountField = document.getElementById('cash-amount-received');
      amountField.value = numericAmount.toFixed(2);
      const inputEvent = new Event('input');
      amountField.dispatchEvent(inputEvent);
    }
  }
  
  keypadClear(event) {
    if (event) event.stopPropagation();
    const displayAmount = document.getElementById('keypad-amount');
    displayAmount.innerText = '₱0';
    this.isNewAmountEntry = true;
    
    // Clear the amount received field
    const amountField = document.getElementById('cash-amount-received');
    if (amountField) {
      amountField.value = '0.00';
      const inputEvent = new Event('input');
      amountField.dispatchEvent(inputEvent);
    }
  }

  keypadBackspace(event) {
    if (event) event.stopPropagation();
    const displayAmount = document.getElementById('keypad-amount');
    let currentText = displayAmount.innerText.replace('₱', '');
    
    if (currentText.length > 1) {
      currentText = currentText.slice(0, -1);
    } else {
      currentText = '0';
      this.isNewAmountEntry = true;
    }
    
    displayAmount.innerText = `₱${currentText}`;
    
    // Live update the amount received field
    let numericAmount = parseFloat(currentText);
    if (!isNaN(numericAmount)) {
      const amountField = document.getElementById('cash-amount-received');
      amountField.value = numericAmount.toFixed(2);
      const inputEvent = new Event('input');
      amountField.dispatchEvent(inputEvent);
    }
  }

  closeKeypad(event) {
    if (event) event.stopPropagation();
    // The keypad is always visible now, so this just updates the amount
    const displayAmount = document.getElementById('keypad-amount');
    let amountText = displayAmount.innerText.replace('₱', '');
    
    let numericAmount = parseFloat(amountText);
    if (isNaN(numericAmount)) numericAmount = 0;
    
    const amountField = document.getElementById('cash-amount-received');
    if (amountField) {
      amountField.value = numericAmount.toFixed(2);
      const inputEvent = new Event('input');
      amountField.dispatchEvent(inputEvent);
    }
    
    this.isNewAmountEntry = true;
  }
  
  sortProducts() {
    const sortValue = document.getElementById('sort-select').value;
    this.applyFiltersAndSort();
  }
  
  searchProducts(event) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFiltersAndSort();
  }
  
  filterByCategory(event) {
    const categoryId = event.currentTarget.dataset.categoryId;
    this.selectedCategory = categoryId === 'all' ? null : categoryId;
    this.closeCategoryModal();
    this.updateActiveFiltersDisplay();
    this.applyFiltersAndSort();
  }
  
  applyFiltersAndSort() {
    let filtered = [...this.allProducts];
    
    if (this.searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.searchTerm)
      );
    }
    
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category_id == this.selectedCategory);
    }
    
    const sortValue = document.getElementById('sort-select')?.value || 'name_asc';
    switch(sortValue) {
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'stock_asc':
        filtered.sort((a, b) => a.quantity - b.quantity);
        break;
      case 'stock_desc':
        filtered.sort((a, b) => b.quantity - a.quantity);
        break;
    }
    
    this.currentProducts = filtered;
    this.renderProducts();
  }
  
  updateActiveFiltersDisplay() {
    const container = document.getElementById('active-filters');
    if (!container) return;
    
    let filters = [];
    
    if (this.selectedCategory) {
      const categoryName = this.allProducts.find(p => p.category_id == this.selectedCategory)?.name || 'Category';
      filters.push(`<span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
        Category: ${categoryName}
        <button data-action="click->pos#clearCategoryFilter" class="hover:text-purple-900">✕</button>
      </span>`);
    }
    
    if (this.searchTerm) {
      filters.push(`<span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
        Search: ${this.searchTerm}
        <button data-action="click->pos#clearSearchFilter" class="hover:text-blue-900">✕</button>
      </span>`);
    }
    
    container.innerHTML = filters.join('');
  }
  
  clearCategoryFilter() {
    this.selectedCategory = null;
    this.updateActiveFiltersDisplay();
    this.applyFiltersAndSort();
  }
  
  clearSearchFilter() {
    this.searchTerm = '';
    if (this.barcodeSearchTarget) {
      this.barcodeSearchTarget.value = '';
    }
    this.updateActiveFiltersDisplay();
    this.applyFiltersAndSort();
  }
  
  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = null;
    if (this.barcodeSearchTarget) {
      this.barcodeSearchTarget.value = '';
    }
    document.getElementById('sort-select').value = 'name_asc';
    this.updateActiveFiltersDisplay();
    this.applyFiltersAndSort();
  }
  
  toggleCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) modal.classList.remove('hidden');
  }
  
  closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) modal.classList.add('hidden');
  }
  
  closeCategoryModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeCategoryModal();
    }
  }
  
  addToCart(event) {
    const btn = event.currentTarget;
    const product = {
      id: btn.dataset.productId,
      name: btn.dataset.productName,
      price: parseFloat(btn.dataset.productPrice),
      quantity: 1
    };
    
    const existing = this.cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push(product);
    }
    this.updateCartDisplay();
  }
  
  updateCartDisplay() {
    if (this.cart.length === 0) {
      this.cartItemsTarget.innerHTML = `
        <div class="text-center text-gray-400 py-12">
          <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <p class="text-lg">No items in cart</p>
          <p class="text-sm mt-2">Tap products to add</p>
        </div>
      `;
      this.cartTotalTarget.innerText = '₱0.00';
      return;
    }
    
    let total = 0;
    let html = '<div class="space-y-3">';
    
    this.cart.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      
      html += `
        <div class="cart-item bg-gray-50 rounded-xl p-3 transition-all" 
             data-item-id="${item.id}"
             data-item-name="${item.name}">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="font-semibold text-base text-gray-800">${item.name}</div>
              <div class="text-sm text-gray-500 mt-1">₱${item.price} each</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-green-600 text-lg">₱${subtotal.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
            <div class="text-xs text-gray-400">👆 Swipe left to remove</div>
            <div class="flex items-center space-x-3">
              <button class="quantity-minus w-10 h-10 bg-gray-200 rounded-lg text-xl font-bold hover:bg-gray-300 transition"
                      data-action="click->pos#decrementQuantity click->pos#handleQuantityClick"
                      data-index="${index}">
                −
              </button>
              <span class="quantity-value w-8 text-center font-semibold text-base">${item.quantity}</span>
              <button class="quantity-plus w-10 h-10 bg-gray-200 rounded-lg text-xl font-bold hover:bg-gray-300 transition"
                      data-action="click->pos#incrementQuantity click->pos#handleQuantityClick"
                      data-index="${index}">
                +
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    this.cartItemsTarget.innerHTML = html;
    this.cartTotalTarget.innerText = `₱${total.toFixed(2)}`;
    this.setupSwipeListeners();
  }
  
  decrementQuantity(event) {
    event.stopPropagation();
    const index = parseInt(event.currentTarget.dataset.index);
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity--;
      this.updateCartDisplay();
    } else {
      const item = this.cart[index];
      this.showSwipeRemoveModal(item.id, item.name);
    }
  }
  
  incrementQuantity(event) {
    event.stopPropagation();
    const index = parseInt(event.currentTarget.dataset.index);
    this.cart[index].quantity++;
    this.updateCartDisplay();
  }
  
  setupSwipeListeners() {
    const cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach(item => {
      if (item._swipeListener) return;
      this.attachSwipeListener(item);
      item._swipeListener = true;
    });
  }
  
  attachSwipeListener(element) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    element.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    element.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(element, touchStartX, touchEndX);
    });
  }
  
  handleSwipe(element, startX, endX) {
    const swipeDistance = endX - startX;
    const threshold = 50;
    
    if (swipeDistance < -threshold) {
      const itemId = element.dataset.itemId;
      const itemName = element.dataset.itemName;
      this.showSwipeRemoveModal(itemId, itemName);
    }
  }
  
  showSwipeRemoveModal(itemId, itemName) {
    this.pendingRemoveItemId = itemId;
    this.pendingRemoveItemName = itemName;
    
    const modal = document.getElementById('swipe-remove-modal');
    if (modal) {
      document.getElementById('swipe-item-name').innerText = itemName;
      modal.classList.remove('hidden');
    } else {
      if (confirm(`Remove ${itemName} from cart?`)) {
        const index = this.cart.findIndex(item => item.id == itemId);
        if (index !== -1) {
          this.cart.splice(index, 1);
          this.updateCartDisplay();
        }
      }
    }
  }
  
  closeSwipeModal() {
    const modal = document.getElementById('swipe-remove-modal');
    if (modal) modal.classList.add('hidden');
    this.pendingRemoveItemId = null;
    this.pendingRemoveItemName = null;
  }
  
  closeSwipeModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeSwipeModal();
    }
  }
  
  confirmSwipeRemove() {
    if (this.pendingRemoveItemId) {
      const index = this.cart.findIndex(item => item.id == this.pendingRemoveItemId);
      if (index !== -1) {
        this.cart.splice(index, 1);
        this.updateCartDisplay();
      }
    }
    this.closeSwipeModal();
  }
  
  // FIXED: Cash payment now shows cash confirmation modal
  processCashPayment() {
    if (this.cart.length === 0) {
      this.showEmptyCartModal();
      return;
    }
    this.showCashConfirmModal();
  }
  
  showCashConfirmModal() {
    const modal = document.getElementById('cash-confirm-modal');
    if (!modal) return;
    
    // Reset amount fields first
    this.resetCashAmount();
    
    const total = this.cartTotalTarget.innerText;
    const totalValue = parseFloat(total.replace('₱', ''));
    const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    let itemsHtml = '';
    let subtotal = 0;
    this.cart.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      itemsHtml += `
        <div class="flex justify-between items-center text-sm">
          <div class="flex-1">
            <span class="font-medium text-gray-800">${item.quantity}x</span>
            <span class="text-gray-600 ml-1">${item.name}</span>
          </div>
          <div class="text-right">
            <span class="font-semibold text-green-600">₱${itemSubtotal.toFixed(2)}</span>
          </div>
        </div>
      `;
    });
    
    document.getElementById('cash-confirm-item-list').innerHTML = itemsHtml;
    document.getElementById('cash-confirm-subtotal').innerText = `₱${subtotal.toFixed(2)}`;
    document.getElementById('cash-confirm-total').innerText = total;
    document.getElementById('cash-confirm-item-count').innerText = itemCount;
    
    const amountInput = document.getElementById('cash-amount-received');
    if (amountInput) {
      amountInput.value = totalValue;
      this.calculateCashChange();
    }
    
    modal.classList.remove('hidden');
    
    // Focus on keypad for keyboard input
    const keypadContainer = document.querySelector('#cash-confirm-modal .bg-gray-50');
    if (keypadContainer) {
      keypadContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  calculateCashChange() {
    const total = parseFloat(this.cartTotalTarget.innerText.replace('₱', ''));
    const received = parseFloat(document.getElementById('cash-amount-received')?.value) || 0;
    const change = received - total;
    const changeElement = document.getElementById('cash-change-amount');
    const confirmBtn = document.getElementById('confirm-cash-payment-btn');
    
    if (changeElement) {
      if (change >= 0) {
        changeElement.innerText = `₱${change.toFixed(2)}`;
        changeElement.classList.remove('text-red-600');
        changeElement.classList.add('text-green-600');
        if (confirmBtn) confirmBtn.disabled = false;
      } else {
        changeElement.innerText = `₱${Math.abs(change).toFixed(2)} short`;
        changeElement.classList.remove('text-green-600');
        changeElement.classList.add('text-red-600');
        if (confirmBtn) confirmBtn.disabled = true;
      }
    }
  }
  
  closeCashConfirmModal() {
    const modal = document.getElementById('cash-confirm-modal');
    if (modal) modal.classList.add('hidden');
    this.resetCashAmount();
  }
  
  closeCashConfirmModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeCashConfirmModal();
    }
  }
  
  // FIXED: Cash confirmation - no duplicate alert
  confirmCashPayment() {
    // Get total from cart
    const total = this.cartTotalTarget.innerText;
    const totalValue = parseFloat(total.replace('₱', '').replace(',', '')) || 0;
    
    // IMPORTANT: Get the amount from the keypad display, NOT the input field
    // The keypad display shows what the cashier entered
    const keypadDisplay = document.getElementById('keypad-amount');
    let received = 0;
    
    if (keypadDisplay) {
      const receivedText = keypadDisplay.innerText.replace('₱', '').replace(',', '');
      received = parseFloat(receivedText) || 0;
    }
    
    // Also update the input field for consistency
    const amountField = document.getElementById('cash-amount-received');
    if (amountField) {
      amountField.value = received.toFixed(2);
    }
    
    console.log(`Total: ${totalValue}, Received: ${received}`); // Debug line
    
    if (received < totalValue) {
      alert(`Insufficient payment! Need ₱${(totalValue - received).toFixed(2)} more.`);
      return;
    }
    
    this.closeCashConfirmModal();
    this.showSuccessModal(total, 'cash');
    this.clearCart();
    this.resetCashAmount();
  }
  
  showPaymentModal() {
    if (this.cart.length === 0) {
      this.showEmptyCartModal();
      return;
    }
    
    const modal = document.getElementById('payment-modal');
    const total = this.cartTotalTarget.innerText;
    const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    let itemsHtml = '';
    this.cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      itemsHtml += `
        <div class="flex justify-between items-center text-sm">
          <div class="flex-1">
            <span class="font-medium text-gray-800">${item.quantity}x</span>
            <span class="text-gray-600 ml-1">${item.name}</span>
          </div>
          <div class="text-right">
            <span class="font-semibold text-green-600">₱${subtotal.toFixed(2)}</span>
          </div>
        </div>
      `;
    });
    
    document.getElementById('modal-item-list').innerHTML = itemsHtml;
    document.getElementById('modal-total').innerText = total;
    document.getElementById('modal-item-count').innerText = itemCount;
    
    modal.classList.remove('hidden');
  }
  
  closeModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('hidden');
  }
  
  closeModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
  
  processPayment(event) {
    const method = event.currentTarget.dataset.method;
    
    if (method === 'credit') {
      this.closeModal();
      this.showCreditModal();
    } else if (method === 'cash') {
      // Cash is handled by processCashPayment, not here
      this.closeModal();
      this.showCashConfirmModal();
    } else {
      const total = this.cartTotalTarget.innerText;
      this.closeModal();
      this.showSuccessModal(total, method);
      this.clearCart();
    }
  }
  
  showCreditModal() {
    if (this.cart.length === 0) {
      this.showEmptyCartModal();
      return;
    }
    
    const modal = document.getElementById('credit-modal');
    const total = this.cartTotalTarget.innerText;
    
    let itemsHtml = '';
    this.cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      itemsHtml += `
        <div class="flex justify-between items-center text-sm">
          <div class="flex-1">
            <span class="font-medium text-gray-800">${item.quantity}x</span>
            <span class="text-gray-600 ml-1">${item.name}</span>
          </div>
          <div class="text-right">
            <span class="font-semibold text-red-600">₱${subtotal.toFixed(2)}</span>
          </div>
        </div>
      `;
    });
    
    document.getElementById('credit-item-list').innerHTML = itemsHtml;
    document.getElementById('credit-total').innerText = total;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    document.getElementById('credit-due-date').value = dueDate.toISOString().split('T')[0];
    
    document.getElementById('credit-customer-name').value = '';
    document.getElementById('credit-customer-phone').value = '';
    document.getElementById('credit-notes').value = '';
    
    modal.classList.remove('hidden');
  }
  
  closeCreditModal() {
    const modal = document.getElementById('credit-modal');
    modal.classList.add('hidden');
  }
  
  closeCreditModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeCreditModal();
    }
  }
  
  // FIXED: Credit sale uses success modal
  confirmCreditSale() {
    const customerName = document.getElementById('credit-customer-name').value.trim();
    
    if (!customerName) {
      alert('Please enter customer name');
      return;
    }
    
    const total = this.cartTotalTarget.innerText;
    
    this.closeCreditModal();
    this.showSuccessModal(total, 'credit');
    this.clearCart();
  }
  
  showEmptyCartModal() {
    const modal = document.getElementById('empty-cart-modal');
    if (modal) modal.classList.remove('hidden');
  }
  
  closeEmptyCartModal() {
    const modal = document.getElementById('empty-cart-modal');
    if (modal) modal.classList.add('hidden');
  }
  
  showSuccessModal(total, method, transactionDetails = null) {
    const modal = document.getElementById('success-modal');
    if (modal) {
      let customerName = '';
      let dueDate = '';
      if (method === 'credit') {
        customerName = document.getElementById('credit-customer-name')?.value.trim() || '';
        dueDate = document.getElementById('credit-due-date')?.value || '';
      }
      
      // Parse total
      const totalValue = parseFloat(total.replace('₱', '').replace(',', '')) || 0;
      const formattedTotal = `₱${totalValue.toFixed(2)}`;
      
      // Get received amount for cash payments
      let receivedAmount = 0;
      let changeAmount = 0;
      if (method === 'cash') {
        // Get from keypad display or input field
        const keypadDisplay = document.getElementById('keypad-amount');
        if (keypadDisplay) {
          const receivedText = keypadDisplay.innerText.replace('₱', '').replace(',', '');
          receivedAmount = parseFloat(receivedText) || 0;
        }
        // Fallback to input field
        if (receivedAmount === 0) {
          receivedAmount = parseFloat(document.getElementById('cash-amount-received')?.value) || 0;
        }
        changeAmount = receivedAmount - totalValue;
      }
      
      // Build receipt HTML
      let receiptHtml = `
        <div class="text-center mb-4">
          <div class="text-2xl font-bold text-gray-800">🏪 GemPoint POS</div>
          <div class="text-xs text-gray-500 mt-1">${new Date().toLocaleString()}</div>
          <div class="text-xs text-gray-500">Receipt #: ${Math.floor(Math.random() * 1000000)}</div>
          <div class="border-t border-gray-200 my-3"></div>
        </div>
        
        <div class="space-y-2 mb-4">
      `;
      
      // Add items
      this.cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        receiptHtml += `
          <div class="flex justify-between text-sm">
            <div>
              <span class="font-medium">${item.quantity}x</span>
              <span class="text-gray-700 ml-1">${escapeHtml(item.name)}</span>
            </div>
            <div class="font-medium">₱${subtotal.toFixed(2)}</div>
          </div>
        `;
      });
      
      receiptHtml += `
        </div>
        <div class="border-t border-gray-200 pt-3 mb-3">
          <div class="flex justify-between text-base font-bold">
            <span>TOTAL:</span>
            <span class="text-green-600">${formattedTotal}</span>
          </div>
      `;
      
      if (method === 'cash') {
        receiptHtml += `
          <div class="flex justify-between text-sm mt-2">
            <span class="text-gray-600">Payment Method:</span>
            <span class="font-medium">Cash</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Amount Received:</span>
            <span>₱${receivedAmount.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Change:</span>
            <span class="text-green-600">₱${changeAmount.toFixed(2)}</span>
          </div>
        `;
      } else if (method === 'gcash') {
        receiptHtml += `
          <div class="flex justify-between text-sm mt-2">
            <span class="text-gray-600">Payment Method:</span>
            <span class="font-medium">GCash</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Reference:</span>
            <span>GCASH-${Math.floor(Math.random() * 100000)}</span>
          </div>
        `;
      } else if (method === 'paymaya') {
        receiptHtml += `
          <div class="flex justify-between text-sm mt-2">
            <span class="text-gray-600">Payment Method:</span>
            <span class="font-medium">PayMaya</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Reference:</span>
            <span>PAYMAYA-${Math.floor(Math.random() * 100000)}</span>
          </div>
        `;
      } else if (method === 'credit') {
        receiptHtml += `
          <div class="flex justify-between text-sm mt-2">
            <span class="text-gray-600">Payment Method:</span>
            <span class="font-medium text-red-600">Credit (IOU)</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Customer:</span>
            <span>${escapeHtml(customerName)}</span>
          </div>
          ${dueDate ? `<div class="flex justify-between text-sm">
            <span class="text-gray-600">Due Date:</span>
            <span>${new Date(dueDate).toLocaleDateString()}</span>
          </div>` : ''}
        `;
      }
      
      receiptHtml += `
        </div>
        <div class="border-t border-gray-200 pt-3 text-center">
          <p class="text-xs text-gray-400">Thank you for your purchase!</p>
          <p class="text-xs text-gray-400">Please come again</p>
        </div>
      `;
      
      document.getElementById('receipt-content').innerHTML = receiptHtml;
      modal.classList.remove('hidden');
      
      setTimeout(() => {
        this.closeSuccessModal();
      }, 5000);
    } else {
      alert(`✅ Payment Successful!\nTotal: ${total}\nMethod: ${method}`);
    }
  }
  
  closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
  
  clearCart() {
    this.cart = [];
    this.updateCartDisplay();
  }
  
  showClearCartModal() {
    if (this.cart.length === 0) {
      alert('Cart is already empty!');
      return;
    }
    
    const modal = document.getElementById('clear-cart-modal');
    const total = this.cartTotalTarget.innerText;
    const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.getElementById('clear-cart-item-count').innerText = itemCount;
    document.getElementById('clear-cart-total').innerText = total;
    modal.classList.remove('hidden');
  }
  
  closeClearCartModal() {
    const modal = document.getElementById('clear-cart-modal');
    modal.classList.add('hidden');
  }
  
  closeClearCartModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeClearCartModal();
    }
  }
  
  confirmClearCart() {
    this.cart = [];
    this.updateCartDisplay();
    this.closeClearCartModal();
    
    const totalElement = this.cartTotalTarget;
    totalElement.classList.add('text-red-500');
    setTimeout(() => {
      totalElement.classList.remove('text-red-500');
      totalElement.classList.add('text-green-600');
    }, 500);
  }
  
  searchBarcode(event) {
    if (event.key === 'Enter') {
      const barcode = event.target.value;
      const product = this.allProducts.find(p => p.barcode === barcode);
      if (product) {
        this.addToCartWithId(product.id);
        event.target.value = '';
      } else {
        alert(`Product with barcode ${barcode} not found`);
      }
    }
  }
  
  addToCartWithId(productId) {
    const product = this.allProducts.find(p => p.id == productId);
    if (product) {
      const existing = this.cart.find(item => item.id == product.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        });
      }
      this.updateCartDisplay();
    }
  }

    resetCashAmount() {
    const amountDisplay = document.getElementById('keypad-amount');
    const amountField = document.getElementById('cash-amount-received');
    
    if (amountDisplay) {
      amountDisplay.innerText = '₱0.00';
    }
    if (amountField) {
      amountField.value = '0.00';
    }
    this.isNewAmountEntry = true;
    
    // Reset change display
    const changeElement = document.getElementById('cash-change-amount');
    if (changeElement) {
      changeElement.innerText = '₱0.00';
      changeElement.classList.remove('text-red-600');
      changeElement.classList.add('text-green-600');
    }
    
    // Re-enable confirm button if disabled
    const confirmBtn = document.getElementById('confirm-cash-payment-btn');
    if (confirmBtn) {
      confirmBtn.disabled = false;
    }
  }
}