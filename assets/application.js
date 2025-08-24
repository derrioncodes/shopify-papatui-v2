// Put your application javascript here
// // HEADER CART
// function updateCartCount() {
//     fetch('/cart.js')
//         .then(res => res.json())
//         .then(cart => {
//             const cartCountEl = document.getElementById('CartCount');
//             if (cartCountEl) {
//                 cartCountEl.textContent = cart.item_count;
//             }
//         })
//         .catch(err => console.error('Error updating cart count:', err));
// }
// updateCartCount();

// function showCartToast(message = 'Added to cart') {
//     const toast = document.getElementById('cart-toast');
//     if (!toast) return;

//     toast.textContent = message;
//     toast.classList.remove('opacity-0', 'pointer-events-none');
//     toast.classList.add('opacity-100');

//     setTimeout(() => {
//         toast.classList.remove('opacity-100');
//         toast.classList.add('opacity-0', 'pointer-events-none');
//     }, 2500);
// }

// // PRODUCT CARD BUTTONS
// function initAddToCartButtons() {
//     const addToCartButtons = document.querySelectorAll('.product-cart__button');

//     addToCartButtons.forEach((button) => {
//         // Skip disabled buttons
//         if (button.disabled) return;

//         // Avoid multiple bindings
//         if (button.dataset.listenerAttached === 'true') return;
//         button.dataset.listenerAttached = 'true';

//         button.addEventListener('click', async () => {
//             // Only run if button says "Add to cart"
//             if (button.textContent.trim().toLowerCase() !== 'add to cart') return;

//             const variantId = button.getAttribute('data-variant-id');
//             if (!variantId) return;

//             try {
//                 // Add to cart
//                 await fetch('/cart/add.js', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Accept: 'application/json',
//                     },
//                     body: JSON.stringify({ id: variantId, quantity: 1 }),
//                 });

//                 // Update cart count
//                 const cartResponse = await fetch('/cart.js');
//                 const cartData = await cartResponse.json();

//                 const cartCountEl = document.getElementById('CartCount');
//                 if (cartCountEl) {
//                     cartCountEl.textContent = cartData.item_count;
//                 }

//                 // Show toast (optional)
//                 if (typeof showCartToast === 'function') {
//                     showCartToast();
//                 }
//             } catch (error) {
//                 console.error('Error adding to cart:', error);
//             }
//         });
//     });
// }

// // Initialize after page load
// document.addEventListener('DOMContentLoaded', initAddToCartButtons);

// Intercept product form submit -> add via AJAX -> show toast (no redirect)
// document.addEventListener('submit', async (e) => {
//     const form = e.target;
//     if (!form.matches('form[action="/cart/add"], form.product-form')) return;

//     // Only intercept when the Add button is used
//     const submitter = e.submitter;
//     if (!submitter || !submitter.matches('[data-add-to-cart]')) return;

//     e.preventDefault();

//     const fd = new FormData(form);
//     const id = fd.get('id');
//     const quantity = parseInt(fd.get('quantity') || '1', 10);

//     // Optional: collect line item properties if you use them
//     const properties = {};
//     fd.forEach((val, key) => {
//         if (key.startsWith('properties[')) {
//             const propName = key.slice('properties['.length, -1); // properties[Gift note] -> Gift note
//             properties[propName] = val;
//         }
//     });

//     const payload = { id, quantity };
//     if (Object.keys(properties).length) payload.properties = properties;
//     if (fd.get('selling_plan')) payload.selling_plan = fd.get('selling_plan'); // for subscriptions

//     try {
//         const res = await fetch('/cart/add.js', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//             body: JSON.stringify(payload),
//         });
//         if (!res.ok) throw new Error('Add to cart failed');

//         // Success → show toast
//         showCartToast('Added to cart');

//         // (Optional) update a cart count badge
//         // updateCartCount();

//     } catch (err) {
//         console.error(err);
//         showCartToast('Could not add to cart', true);
//     }
// });

// // (Optional) cart badge updater
// async function updateCartCount() {
//     try {
//         const cart = await fetch('/cart.js', { headers: { 'Accept': 'application/json' } }).then(r => r.json());
//         const countEl = document.querySelector('[data-cart-count]');
//         if (countEl) countEl.textContent = cart.item_count;
//     } catch { }
// }



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
            await updateCartCount();
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
                await updateCartCount();
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

