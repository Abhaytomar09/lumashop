// main.js - product data, cart functions, UI injection

const PRODUCTS = [
  {
    id: 'p1',
    title: 'Aero Wireless Headphones',
    price: 99,
    desc: 'Comfort-fit, active noise cancellation, 30h battery.',
    img: 'https://images.unsplash.com/photo-1518444029746-1a1d9f7b9a6d?w=900&q=60&auto=format&fit=crop'
  },
  {
    id: 'p2',
    title: 'Nova Smartwatch',
    price: 149,
    desc: 'Fitness tracking, notifications and 7-day battery.',
    img: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41e2?w=900&q=60&auto=format&fit=crop'
  },
  {
    id: 'p3',
    title: 'Pulse Bluetooth Speaker',
    price: 79,
    desc: 'Rich sound, waterproof, portable design.',
    img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&q=60&auto=format&fit=crop'
  },
  {
    id: 'p4',
    title: 'Lumen Desk Lamp',
    price: 59,
    desc: 'Adjustable color temperatures and minimal design.',
    img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=60&auto=format&fit=crop'
  },
  {
    id: 'p5',
    title: 'Orbit Phone Lens Kit',
    price: 39,
    desc: 'Macro and wide-angle lens for smartphone photography.',
    img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&q=60&auto=format&fit=crop'
  },
  {
    id: 'p6',
    title: 'Nimbus Travel Bag',
    price: 129,
    desc: 'Durable, water-resistant with ergonomic straps.',
    img: 'https://images.unsplash.com/photo-1520975927189-7c7d06f5d7f6?w=900&q=60&auto=format&fit=crop'
  }
];

function _(s){ return document.querySelector(s) }

// update cart badge
function updateCartBadge(){
  const cart = JSON.parse(localStorage.getItem('luma_cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badgeEls = document.querySelectorAll('#cart-count-badge');
  badgeEls.forEach(el => el.textContent = totalItems);
}

// render featured products on index
function renderFeatured(){
  const container = _('#featuredProducts');
  if(!container) return;
  // pick first 4
  const featured = PRODUCTS.slice(0,4);
  container.innerHTML = featured.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy" />
      <h3>${escapeHtml(p.title)}</h3>
      <p class="price">$${p.price.toFixed(2)}</p>
      <p class="meta">${escapeHtml(p.desc)}</p>
      <div class="product-actions">
        <a class="btn btn-ghost" href="product.html?id=${p.id}">View</a>
        <button class="btn btn-primary" onclick="addToCart('${p.id}', this)">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

// render all products on shop page
function renderAllProducts(){
  const container = _('#allProducts');
  if(!container) return;
  container.innerHTML = PRODUCTS.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy" />
      <h3>${escapeHtml(p.title)}</h3>
      <p class="price">$${p.price.toFixed(2)}</p>
      <p class="meta">${escapeHtml(p.desc)}</p>
      <div class="product-actions">
        <a class="btn btn-ghost" href="product.html?id=${p.id}">View</a>
        <button class="btn btn-primary" onclick="addToCart('${p.id}', this)">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

// product detail page
function renderProductDetail(){
  const el = _('#productDetail');
  if(!el) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || PRODUCTS[0].id;
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];
  if(!p) {
    el.innerHTML = '<p>Product not found. <a href="shop.html">Return to shop</a></p>';
    return;
  }
  el.innerHTML = `
    <div class="product-detail">
      <div class="left">
        <div class="product-images">
          <img src="${p.img}" alt="${escapeHtml(p.title)}" />
        </div>
      </div>
      <div class="right">
        <a href="shop.html" class="back-link">← Back to Shop</a>
        <h1>${escapeHtml(p.title)}</h1>
        <p class="price">$${p.price.toFixed(2)}</p>
        <p class="product-desc">${escapeHtml(p.desc)}</p>
        <div class="product-detail-actions">
          <button class="btn btn-primary" onclick="addToCart('${p.id}', this)">Add to Cart</button>
          <a class="btn btn-ghost" href="cart.html">View Cart</a>
        </div>
      </div>
    </div>
  `;
}

// cart UI
function renderCart(){
  const target = _('#cartArea');
  if(!target) return;
  const cart = JSON.parse(localStorage.getItem('luma_cart') || '[]');
  if(cart.length === 0){
    target.innerHTML = `<div class="empty-cart"><p>Your cart is empty.</p><a href="shop.html" class="btn btn-primary">Browse Products</a></div>`;
    return;
  }
  let html = '<div class="cart-items">';
  let total = 0;
  cart.forEach((item, idx) => {
    const quantity = item.quantity || 1;
    const itemTotal = item.price * quantity;
    total += itemTotal;
    html += `
      <div class="cart-item">
        <img src="${item.img}" alt="${escapeHtml(item.title)}" />
        <div class="cart-item-info">
          <strong>${escapeHtml(item.title)}</strong>
          <div class="cart-item-desc">${escapeHtml(item.desc)}</div>
          <div class="cart-item-quantity">
            <button class="qty-btn" onclick="updateQuantity(${idx}, -1)">−</button>
            <span class="qty-value">${quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${idx}, 1)">+</button>
          </div>
        </div>
        <div class="cart-item-price">
          <div class="item-total">$${itemTotal.toFixed(2)}</div>
          <div class="item-unit">$${item.price.toFixed(2)} each</div>
          <button class="btn btn-ghost btn-small" onclick="removeFromCart(${idx})">Remove</button>
        </div>
      </div>
    `;
  });
  html += `</div><div class="cart-total"><strong>Total: $${total.toFixed(2)}</strong></div>`;
  target.innerHTML = html;
}

// helper: escape HTML
function escapeHtml(s){
  return (s+'').replace(/[&<>"']/g, function(m){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m];
  });
}

// cart operations
function addToCart(productId, buttonElement){
  const prod = PRODUCTS.find(p => p.id === productId);
  if(!prod) {
    alert('Product not found');
    return;
  }
  const cart = JSON.parse(localStorage.getItem('luma_cart') || '[]');
  const existingItem = cart.find(item => item.id === productId);
  
  if(existingItem){
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cart.push({...prod, quantity: 1});
  }
  
  localStorage.setItem('luma_cart', JSON.stringify(cart));
  updateCartBadge();
  
  // Show visual feedback
  if(buttonElement && buttonElement.tagName === 'BUTTON') {
    const originalText = buttonElement.textContent;
    buttonElement.textContent = 'Added!';
    buttonElement.style.opacity = '0.7';
    buttonElement.disabled = true;
    setTimeout(() => {
      buttonElement.textContent = originalText;
      buttonElement.style.opacity = '1';
      buttonElement.disabled = false;
    }, 1000);
  }
}

function updateQuantity(index, change){
  const cart = JSON.parse(localStorage.getItem('luma_cart') || '[]');
  if(index >= 0 && index < cart.length){
    const item = cart[index];
    item.quantity = (item.quantity || 1) + change;
    if(item.quantity <= 0){
      cart.splice(index, 1);
    }
    localStorage.setItem('luma_cart', JSON.stringify(cart));
    renderCart();
    updateCartBadge();
  }
}

function removeFromCart(index){
  const cart = JSON.parse(localStorage.getItem('luma_cart') || '[]');
  if(index >= 0 && index < cart.length){
    cart.splice(index,1);
    localStorage.setItem('luma_cart', JSON.stringify(cart));
    renderCart();
    updateCartBadge();
  }
}

function clearCart(){
  if(confirm('Clear cart?')){
    localStorage.removeItem('luma_cart');
    renderCart();
    updateCartBadge();
  }
}

function checkout(){
  const cart = JSON.parse(localStorage.getItem('luma_cart') || '[]');
  if(cart.length === 0) return alert('Your cart is empty');
  // simulate checkout success and redirect to track page
  localStorage.removeItem('luma_cart');
  updateCartBadge();
  alert('Order placed! Redirecting to tracking (demo).');
  window.location.href = 'track-order.html';
}

// smooth scroll for anchor links
function initSmoothScroll(){
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if(href === '#') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// initialization on pages
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderFeatured();
  renderAllProducts();
  renderProductDetail();
  renderCart();
  initSmoothScroll();
});

