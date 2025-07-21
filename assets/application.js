// Put your application javascript here
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