// Put your application javascript here
// HEADER CART
function updateCartCount() {
    fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
            const cartCountEl = document.getElementById('CartCount');
            if (cartCountEl) {
                cartCountEl.textContent = cart.item_count;
            }
        })
        .catch(err => console.error('Error updating cart count:', err));
}
updateCartCount();

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

// PRODUCT CARD BUTTONS
function initAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.product-cart__button');

    addToCartButtons.forEach((button) => {
        // Skip disabled buttons
        if (button.disabled) return;

        // Avoid multiple bindings
        if (button.dataset.listenerAttached === 'true') return;
        button.dataset.listenerAttached = 'true';

        button.addEventListener('click', async () => {
            // Only run if button says "Add to cart"
            if (button.textContent.trim().toLowerCase() !== 'add to cart') return;

            const variantId = button.getAttribute('data-variant-id');
            if (!variantId) return;

            try {
                // Add to cart
                await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ id: variantId, quantity: 1 }),
                });

                // Update cart count
                const cartResponse = await fetch('/cart.js');
                const cartData = await cartResponse.json();

                const cartCountEl = document.getElementById('CartCount');
                if (cartCountEl) {
                    cartCountEl.textContent = cartData.item_count;
                }

                // Show toast (optional)
                if (typeof showCartToast === 'function') {
                    showCartToast();
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        });
    });
}

// Initialize after page load
document.addEventListener('DOMContentLoaded', initAddToCartButtons);
