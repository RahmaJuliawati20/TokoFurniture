/* ============================================================
   RumahLuvia — cart.js
   Shared cart logic: add, remove, update, persist, render
   ============================================================ */

const CART_KEY = 'rumahluvia_cart';

/* ── Storage helpers ── */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ── Public API ── */
function addToCart(product) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty += (product.qty || 1);
  } else {
    cart.push({ ...product, qty: product.qty || 1 });
  }
  saveCart(cart);
  renderCart();
  showCartFeedback(product.name);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  renderCart();
}

function updateQty(id, delta) {
  const cart = getCart().map(i => {
    if (i.id === id) { i.qty = Math.max(1, i.qty + delta); }
    return i;
  });
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function getCartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function getCartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

/* ── Feedback toast ── */
function showCartFeedback(name) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = `✓ "${name}" ditambahkan ke keranjang`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ── Render cart panel ── */
function renderCart() {
  const cart      = getCart();
  const panel     = document.getElementById('cart-panel');
  const itemsEl   = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total-price');
  const badgeEl   = document.getElementById('cart-badge');
  const emptyEl   = document.getElementById('cart-empty');
  const footerEl  = document.getElementById('cart-footer');

  if (!panel) return;

  /* Badge */
  const count = getCartCount();
  if (badgeEl) {
    badgeEl.textContent = count;
    badgeEl.style.display = count > 0 ? 'flex' : 'none';
  }

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    if (emptyEl)  emptyEl.style.display  = 'flex';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyEl)  emptyEl.style.display  = 'none';
  if (footerEl) footerEl.style.display = 'block';

  itemsEl.innerHTML = cart.map(item => `
    <div class="ci-row" data-id="${item.id}">
      <div class="ci-img">
        <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none';this.parentElement.classList.add('ci-img-fallback')">
      </div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">${formatRp(item.price)}</div>
        <div class="ci-qty">
          <button class="ci-btn" onclick="updateQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button class="ci-btn" onclick="updateQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="ci-remove" onclick="removeFromCart('${item.id}')" aria-label="Hapus">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = formatRp(getCartTotal());
}

/* ── Open / close panel ── */
function openCart() {
  renderCart();
  const panel   = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  if (panel)   panel.classList.add('open');
  if (overlay) overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const panel   = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  if (panel)   panel.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

/* ── Checkout redirect ── */
function goCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;
  window.location.href = 'checkout.html';
}

/* ── Utility ── */
function formatRp(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

/* ── Init on DOM ready ── */
document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  const overlay = document.getElementById('cart-overlay');
  if (overlay) overlay.addEventListener('click', closeCart);
});
