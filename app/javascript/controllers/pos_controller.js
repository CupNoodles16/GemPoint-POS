import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["cartItems", "cartTotal", "barcodeSearch"];
  
  connect() {
    this.cart = [];
    this.updateDateTime();
    this.startDateTimeInterval();
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
          <p class="text-5xl mb-3">🛍️</p>
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
             data-item-name="${item.name}"
             data-swipe-threshold="50">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="font-semibold text-base text-gray-800">${item.name}</div>
              <div class="text-sm text-gray-500 mt-1">₱${item.price} each</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-green-600 text-lg">₱${subtotal.toFixed(2)}</div>
            </div>
          </div>
          
          <!-- Quantity Controls with Swipe Hint -->
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
    
    // Attach swipe listeners to new cart items
    this.setupSwipeListeners();
  }
  
  // Quantity Controls
  decrementQuantity(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity--;
      this.updateCartDisplay();
    } else {
      // If quantity is 1, ask to remove
      const item = this.cart[index];
      this.showSwipeRemoveModal(item.id, item.name);
    }
  }
  
  incrementQuantity(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    this.cart[index].quantity++;
    this.updateCartDisplay();
  }
  
  // Swipe Detection Methods
  setupSwipeListeners() {
    const cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach(item => {
      // Remove existing listener to avoid duplicates
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
    const threshold = 50; // Minimum swipe distance in pixels
    
    // Detect left swipe (negative distance)
    if (swipeDistance < -threshold) {
      const itemId = element.dataset.itemId;
      const itemName = element.dataset.itemName;
      this.showSwipeRemoveModal(itemId, itemName);
    }
  }
  
  // Show swipe removal modal
  showSwipeRemoveModal(itemId, itemName) {
    this.pendingRemoveItemId = itemId;
    this.pendingRemoveItemName = itemName;
    
    const modal = document.getElementById('swipe-remove-modal');
    if (modal) {
      document.getElementById('swipe-item-name').innerText = itemName;
      modal.classList.remove('hidden');
    } else {
      // Fallback if modal doesn't exist
      if (confirm(`Remove ${itemName} from cart?`)) {
        const index = this.cart.findIndex(item => item.id == itemId);
        if (index !== -1) {
          this.cart.splice(index, 1);
          this.updateCartDisplay();
        }
      }
    }
  }
  
  // Close swipe modal
  closeSwipeModal() {
    const modal = document.getElementById('swipe-remove-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.pendingRemoveItemId = null;
    this.pendingRemoveItemName = null;
  }
  
  // Close swipe modal on background click
  closeSwipeModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeSwipeModal();
    }
  }
  
  // Confirm swipe removal
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
  
  // Quick Cash Payment (Most common)
  processCashPayment() {
    if (this.cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    const total = this.cartTotalTarget.innerText;
    
    if (confirm(`Cash Payment\nAmount: ${total}\n\nClick OK to complete transaction`)) {
      alert(`✅ Transaction completed!\n\nTotal: ${total}\nPayment Method: Cash`);
      this.clearCart();
    }
  }
  
  // Show payment modal
  showPaymentModal() {
    if (this.cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    const modal = document.getElementById('payment-modal');
    const total = this.cartTotalTarget.innerText;
    document.getElementById('modal-total').innerText = total;
    modal.classList.remove('hidden');
  }
  
  // Close payment modal
  closeModal() {
    const modal = document.getElementById('payment-modal');
    modal.classList.add('hidden');
  }
  
  // Close payment modal when clicking background
  closeModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
  
  // Process payment after method selection (from modal)
  processPayment(event) {
    const method = event.currentTarget.dataset.method;
    const total = this.cartTotalTarget.innerText;
    
    // Close modal
    this.closeModal();
    
    if (confirm(`${method.toUpperCase()} Payment\nAmount: ${total}\n\nClick OK to complete transaction`)) {
      alert(`✅ Transaction completed!\n\nTotal: ${total}\nPayment Method: ${method.toUpperCase()}`);
      this.clearCart();
    }
  }
  
  // Clear cart after successful payment
  clearCart() {
    this.cart = [];
    this.updateCartDisplay();
  }
  
  // Show Clear Cart confirmation modal
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
  
  // Close Clear Cart modal
  closeClearCartModal() {
    const modal = document.getElementById('clear-cart-modal');
    modal.classList.add('hidden');
  }
  
  // Close Clear Cart modal when clicking background
  closeClearCartModalOnBackground(event) {
    if (event.target === event.currentTarget) {
      this.closeClearCartModal();
    }
  }
  
  // Confirm and clear cart
  confirmClearCart() {
    this.cart = [];
    this.updateCartDisplay();
    this.closeClearCartModal();
    
    // Visual feedback - flash total red
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
      alert(`Searching for: ${barcode}\n\nIn production, this would find and add the product.`);
      event.target.value = '';
    }
  }
}