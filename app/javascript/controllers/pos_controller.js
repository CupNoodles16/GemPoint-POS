import { Controller } from "@hotwired/stimulus";

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
  }
  
  disconnect() {
    if (this.dateTimeInterval) clearInterval(this.dateTimeInterval);
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
      barcode: btn.dataset.barcode || null  // Add this line
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
  
  // Sorting and Filtering Methods
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
    
    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.searchTerm)
      );
    }
    
    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category_id == this.selectedCategory);
    }
    
    // Apply sorting
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
      const categoryName = this.allProducts.find(p => p.category_id == this.selectedCategory)?.name || 
                           document.querySelector(`button[data-category-id="${this.selectedCategory}"] span`)?.innerText || 
                           'Category';
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
  
  // Category Modal Methods
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
  
  // Original Cart Methods
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
                      data-action="click->pos#decrementQuantity" data-index="${index}">
                −
              </button>
              <span class="quantity-value w-8 text-center font-semibold text-base">${item.quantity}</span>
              <button class="quantity-plus w-10 h-10 bg-gray-200 rounded-lg text-xl font-bold hover:bg-gray-300 transition"
                      data-action="click->pos#incrementQuantity" data-index="${index}">
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
  
  processCashPayment() {
    if (this.cart.length === 0) {
      this.showEmptyCartModal();
      return;
    }
    const total = this.cartTotalTarget.innerText;
    this.showSuccessModal(total, 'cash');
    this.clearCart();
  }
  
  // Show payment modal with itemized list
  showPaymentModal() {
    if (this.cart.length === 0) {
      this.showEmptyCartModal();
      return;
    }
    
    const modal = document.getElementById('payment-modal');
    const total = this.cartTotalTarget.innerText;
    const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Generate itemized list HTML
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
  
    // Process payment after method selection (from modal)
  processPayment(event) {
    const method = event.currentTarget.dataset.method;
    
    if (method === 'credit') {
      // Close payment modal and show credit/IOU modal
      this.closeModal();
      this.showCreditModal();
    } else {
      // For cash, GCash, PayMaya - proceed to success
      const total = this.cartTotalTarget.innerText;
      this.closeModal();
      this.showSuccessModal(total, method);
      this.clearCart();
    }
  }
  
  // Show Credit / IOU Modal
  showCreditModal() {
    if (this.cart.length === 0) {
      this.showEmptyCartModal();
      return;
    }
    
    const modal = document.getElementById('credit-modal');
    const total = this.cartTotalTarget.innerText;
    
    // Populate itemized list
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
    
    // Set default due date to 7 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    document.getElementById('credit-due-date').value = dueDate.toISOString().split('T')[0];
    
    // Clear previous form values
    document.getElementById('credit-customer-name').value = '';
    document.getElementById('credit-customer-phone').value = '';
    document.getElementById('credit-notes').value = '';
    
    modal.classList.remove('hidden');
  }
  
  // Close Credit Modal
  closeCreditModal() {
    const modal = document.getElementById('credit-modal');
    modal.classList.add('hidden');
  }
  
  // Close Credit Modal on background click
  closeCreditModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeCreditModal();
    }
  }
  
  // Confirm Credit Sale
  confirmCreditSale() {
    const customerName = document.getElementById('credit-customer-name').value.trim();
    
    if (!customerName) {
      alert('Please enter customer name');
      return;
    }
    
    const customerPhone = document.getElementById('credit-customer-phone').value;
    const dueDate = document.getElementById('credit-due-date').value;
    const notes = document.getElementById('credit-notes').value;
    const total = this.cartTotalTarget.innerText;
    
    // Build confirmation message
    let message = `✅ CREDIT SALE RECORDED\n\n`;
    message += `Customer: ${customerName}\n`;
    if (customerPhone) message += `Contact: ${customerPhone}\n`;
    message += `Amount: ${total}\n`;
    if (dueDate) message += `Due Date: ${new Date(dueDate).toLocaleDateString()}\n`;
    if (notes) message += `Notes: ${notes}\n`;
    message += `\nItems:\n`;
    
    this.cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      message += `  - ${item.quantity}x ${item.name}: ₱${subtotal.toFixed(2)}\n`;
    });
    
    alert(message);
    
    // Close modal and clear cart
    this.closeCreditModal();
    this.clearCart();
    
    // Optional: Show success message
    alert(`Credit sale recorded for ${customerName}. Total debt: ${total}`);
  }
  
  showEmptyCartModal() {
    const modal = document.getElementById('empty-cart-modal');
    if (modal) modal.classList.remove('hidden');
  }
  
  closeEmptyCartModal() {
    const modal = document.getElementById('empty-cart-modal');
    if (modal) modal.classList.add('hidden');
  }
  
  showSuccessModal(total, method) {
    const modal = document.getElementById('success-modal');
    if (modal) {
      document.getElementById('success-total').innerText = total;
      document.getElementById('success-method').innerText = method.charAt(0).toUpperCase() + method.slice(1);
      modal.classList.remove('hidden');
    } else {
      alert(`✅ Payment Successful!\nTotal: ${total}\nMethod: ${method}`);
    }
  }
  
  closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.classList.add('hidden');
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
      // Find product by barcode
      const product = this.allProducts.find(p => p.barcode === barcode);
      if (product) {
        // Add to cart
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
}