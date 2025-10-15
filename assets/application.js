
/* ========== HEADER CART (keep your target: #CartCount) ========== */
async function updateCartCount() {
  try {
    const res = await fetch('/cart.js', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    const cart = await res.json();
    const cartCountEl = document.getElementById('CartCount');
    if (cartCountEl) cartCountEl.textContent = cart.item_count;
  } catch (err) {
    console.error('Error updating cart count:', err);
  }
}
updateCartCount();

/* ========== TOAST (use your existing) ========== */
function showCartToast(message = 'Added to cart') {
  const toast = document.getElementById('cart-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('opacity-0', 'pointer-events-none');
  toast.classList.add('opacity-100');

  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0', 'pointer-events-none');
  }, 2500);
}

/* ========== ONE CART API FOR EVERYTHING ========== */
async function addToCart({ id, quantity = 1, properties, selling_plan }) {
  const payload = { id, quantity };
  if (properties && Object.keys(properties).length) payload.properties = properties;
  if (selling_plan) payload.selling_plan = selling_plan;

  const res = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // Try to show Shopify’s error message if available
    let msg = 'Add to cart failed';
    try { const data = await res.json(); if (data?.description) msg = data.description; } catch { }
    throw new Error(msg);
  }
  return res.json(); // returns the line item
}

// CART DRAWER
// Grab the actual section id Shopify uses (e.g. "cart-drawer" or a generated id)
let CART_SECTION_ID =
  (document.querySelector('#CartDrawerMount [id^="shopify-section-"]')?.id || '')
    .replace('shopify-section-', '') || 'cart-drawer';

async function renderCartDrawer({ open = false } = {}) {
  const mount = document.getElementById('CartDrawerMount');
  if (!mount) { console.warn('CartDrawerMount not found'); return; }

  let html = null;

  // 1) Try raw HTML endpoint (simplest)
  for (const path of [`/?section_id=${CART_SECTION_ID}`, `/cart?section_id=${CART_SECTION_ID}`]) {
    try {
      const res = await fetch(path, { headers: { Accept: 'text/html' }, cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('<')) { html = text; break; }
      }
    } catch { }
  }

  // 2) Fallback: JSON sections endpoint
  if (!html) {
    try {
      const url = new URL('/cart', window.location.origin);
      url.searchParams.set('sections', CART_SECTION_ID);
      const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Common shapes: { "<id>": "<html>" } or { sections: { "<id>": "<html>" } }
        html =
          (typeof data[CART_SECTION_ID] === 'string' && data[CART_SECTION_ID]) ||
          (data.sections && Object.values(data.sections).find(v => typeof v === 'string' && v.includes('<'))) ||
          (Object.values(data).find(v => typeof v === 'string' && v.includes('<')));
      }
    } catch { }
  }

  if (!html) {
    console.warn('Could not fetch cart drawer HTML. Using section id:', CART_SECTION_ID);
    return;
  }

  mount.innerHTML = html;

  // After DOM swap: re-bind + sync count + open
  if (typeof bindCartDrawerEvents === 'function') bindCartDrawerEvents();
  if (typeof updateCartCount === 'function') updateCartCount();
  if (open && typeof openCartDrawer === 'function') openCartDrawer();
}


// Open drawer from any [data-cart-open] trigger (fresh render every time)
document.addEventListener('click', async (e) => {
  const opener = e.target.closest('[data-cart-open]');
  if (!opener) return;
  e.preventDefault();
  await renderCartDrawer({ open: true });
});


/* ========== HELPERS ========== */
function buildPayloadFromForm(fd) {
  const payload = {
    id: fd.get('id'),
    quantity: parseInt(fd.get('quantity') || '1', 10),
  };

  // properties[Gift note] → { "Gift note": "..." }
  const props = {};
  fd.forEach((val, key) => {
    if (key.startsWith('properties[')) {
      const name = key.slice('properties['.length, -1);
      props[name] = val;
    }
  });
  if (Object.keys(props).length) payload.properties = props;

  const sellingPlan = fd.get('selling_plan');
  if (sellingPlan) payload.selling_plan = sellingPlan;

  return payload;
}

/* ========== PRODUCT PAGE FORM (AJAX) ========== */
function initProductFormAdd() {
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form.matches('form[action="/cart/add"], form.product-form')) return;

    // Only intercept if the actual Add button triggered it
    const submitter = e.submitter;
    if (!submitter || !submitter.matches('[data-add-to-cart]')) return;

    e.preventDefault();

    const fd = new FormData(form);
    // Guard: need variant id present for single-variant products too
    const id = fd.get('id');
    if (!id) {
      console.error('No variant id found in form');
      showCartToast('Please select a variant');
      return;
    }

    const payload = buildPayloadFromForm(fd);

    // Optional visual lock
    submitter.disabled = true;
    try {
      await addToCart(payload);
      await renderCartDrawer({ open: true });
      // await updateCartCount();
      showCartToast('Added to cart');
      // Optional: reset qty to 1
      // const qty = form.querySelector('input[name="quantity"]'); if (qty) qty.value = '1';
    } catch (err) {
      console.error(err);
      showCartToast(err.message || 'Could not add to cart');
    } finally {
      submitter.disabled = false;
    }
  });
}

/* ========== PRODUCT CARD BUTTONS (QUICK ADD) ========== */
function initAddToCartButtons() {
  const buttons = document.querySelectorAll('.product-cart__button');

  buttons.forEach((button) => {
    // Skip disabled & avoid double-binding
    if (button.disabled || button.dataset.listenerAttached === 'true') return;
    button.dataset.listenerAttached = 'true';

    button.addEventListener('click', async () => {
      // Only run if button says "Add to cart"
      if (button.textContent.trim().toLowerCase() !== 'add to cart') return;

      const variantId = button.getAttribute('data-variant-id');
      if (!variantId) return;

      button.disabled = true;
      try {
        await addToCart({ id: variantId, quantity: 1 });
        await renderCartDrawer({ open: true });
        // await updateCartCount();
        showCartToast('Added to cart');
      } catch (error) {
        console.error('Error adding to cart:', error);
        showCartToast('Could not add to cart');
      } finally {
        button.disabled = false;
      }
    });
  });
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  initProductFormAdd();
  initAddToCartButtons();
});



// ===== OPEN/CLOSE (global; survives section re-render) =====
let cartScrollY = 0;

function getCartEls() {
  const root = document.getElementById('cart-root');
  return {
    root,
    overlay: root?.querySelector('[data-cart-overlay]'),
    panel: root?.querySelector('[data-cart-panel]'),
  };
}

function openCartDrawer() {
  const { root, overlay, panel } = getCartEls();
  if (!root || !overlay || !panel) return;

  cartScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${cartScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.width = '100%';

  root.classList.remove('hidden');
  requestAnimationFrame(() => {
    overlay.classList.remove('opacity-0');
    panel.classList.remove('translate-x-full');
  });

  // reflect expanded state on the trigger
  const trigger = document.querySelector('[data-cart-open][aria-controls="cart-root"]');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
}

function closeCartDrawer() {
  const { root, overlay, panel } = getCartEls();
  if (!root || !overlay || !panel) return;

  overlay.classList.add('opacity-0');
  panel.classList.add('translate-x-full');

  setTimeout(() => {
    root.classList.add('hidden');

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    document.body.style.width = '';
    window.scrollTo(0, cartScrollY);

    const trigger = document.querySelector('[data-cart-open][aria-controls="cart-root"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }, 300); // match CSS duration
}

// ===== Qty/remove handlers (delegated on the drawer root) =====
async function changeLineQty(line, quantity) {
  const res = await fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ line, quantity })
  });
  if (!res.ok) throw new Error('Cart update failed');
  return res.json();
}

function bindCartDrawerQuantityEvents() {
  const { root } = getCartEls();
  if (!root) return;

  // + / − / remove
  root.addEventListener('click', async (e) => {
    const inc = e.target.closest('[data-qty-increase]');
    const dec = e.target.closest('[data-qty-decrease]');
    const rem = e.target.closest('[data-remove-line]');
    if (!inc && !dec && !rem) return;

    e.preventDefault();
    const btn = inc || dec || rem;
    const line = parseInt(btn.getAttribute('data-line'), 10);
    if (!line) return;

    let newQty;
    if (rem) {
      newQty = 0;
    } else {
      const input = root.querySelector(`input[data-line-qty="${line}"]`);
      const current = parseInt((input && input.value) || '1', 10);
      newQty = inc ? current + 1 : Math.max(0, current - 1);
    }

    try {
      await changeLineQty(line, newQty);
      await renderCartDrawer({ open: true });  // fresh HTML + stays open
      if (typeof showCartToast === 'function') showCartToast('Cart updated');
    } catch (err) {
      console.error(err);
    }
  });

  // direct input
  root.addEventListener('change', async (e) => {
    const input = e.target.closest('input[data-line-qty]');
    if (!input) return;
    const line = parseInt(input.getAttribute('data-line'), 10);
    let qty = parseInt(input.value || '0', 10);
    if (isNaN(qty) || qty < 0) qty = 0;

    try {
      await changeLineQty(line, qty);
      await renderCartDrawer({ open: true });
      if (typeof showCartToast === 'function') showCartToast('Cart updated');
    } catch (err) {
      console.error(err);
    }
  });
}

// ===== Close/backdrop/ESC binder =====
let escBound = false;
function bindCartDrawerEvents() {
  const { root, overlay } = getCartEls();
  if (!root) return;

  root.querySelectorAll('[data-cart-close]').forEach((btn) => {
    btn.addEventListener('click', closeCartDrawer);
  });
  overlay?.addEventListener('click', closeCartDrawer);

  if (!escBound) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !getCartEls().root?.classList.contains('hidden')) {
        closeCartDrawer();
      }
    }, { passive: true });
    escBound = true;
  }

  // also wire qty/remove
  bindCartDrawerQuantityEvents();
}



// Initial bind for the first server-rendered drawer (before the first re-render)
document.addEventListener('DOMContentLoaded', () => {
  bindCartDrawerEvents();
});

// Accordian 
document.addEventListener('DOMContentLoaded', function () {
  const headers = document.querySelectorAll('.accordion-header');

  headers.forEach((header) => {
    header.addEventListener('click', function () {
      const content = this.nextElementSibling;

      // Toggle active class
      this.classList.toggle('active');

      // Slide toggle effect
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
});
