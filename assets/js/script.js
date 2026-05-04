// ==================== DONNÉES PRODUITS (PRIX EN AR) ====================
const products = [
    { id: 1, name: "Balenciaga", price: 50000, image: "assets/img/balanciaga.jpg" },
    { id: 2, name: "Adidas Campus", price: 60000, image: "assets/img/campus.jpg" },
    { id: 3, name: "Converse", price: 40000, image: "assets/img/converse.jpg" },
    { id: 4, name: "Jordan 1", price: 65000, image: "assets/img/jord1.jpg" },
    { id: 5, name: "Jordan 4", price: 75000, image: "assets/img/jord4.jpg" },
    { id: 6, name: "New Balance", price: 60000, image: "assets/img/nb.jpg" },
    { id: 6, name: "Nike Zoom", price: 80000, image: "assets/img/nikezoom.jpg" },
    { id: 6, name: "Puma Speedcat", price: 70000, image: "assets/img/pumaspeedcat.jpg" },
    { id: 6, name: "Nike TN", price: 65000, image: "assets/img/tn.jpg" },
    { id: 6, name: "Vans", price: 60000, image: "assets/img/vans.jpg" },
];

let cart = [];

// Formater le prix en Ariary
function formatPrice(price) {
    return price.toLocaleString('fr-MG') + ' Ar';
}

// Navigation entre sections
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active-section'));
            document.getElementById(targetId).classList.add('active-section');
            
            // Scroll en haut
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// Affichage des produits (prix en Ar)
function renderProducts() {
    const grid = document.getElementById("productsGrid");
    if(!grid) return;
    grid.innerHTML = "";
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="product-price"><i class="fas fa-tag"></i> ${formatPrice(product.price)}</div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Ajouter au panier
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            addToCart(id);
        });
    });
}

// Panier
function loadCartFromStorage() {
    const stored = localStorage.getItem("dynastie_cart");
    cart = stored ? JSON.parse(stored) : [];
    updateCartUI();
    updateCartCount();
}

function saveCartToStorage() { localStorage.setItem("dynastie_cart", JSON.stringify(cart)); }

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if(!product) return;
    const existingItem = cart.find(item => item.id === productId);
    if(existingItem) {
        existingItem.quantity += 1;
        showToast(`➕ ${product.name} (x${existingItem.quantity})`);
    } else {
        cart.push({ ...product, quantity: 1 });
        showToast(`✨ ${product.name} ajouté au panier`);
    }
    saveCartToStorage();
    updateCartUI();
    updateCartCount();
}

function updateCartUI() {
    const cartContainer = document.getElementById("cartItemsList");
    const totalSpan = document.getElementById("cartTotalPrice");
    if(!cartContainer) return;

    if(cart.length === 0) {
        cartContainer.innerHTML = `<div class="empty-cart-msg"><i class="fas fa-shopping-cart"></i> Votre panier est vide.</div>`;
        if(totalSpan) totalSpan.innerText = "0";
        return;
    }

    let total = 0;
    cartContainer.innerHTML = "";
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const cartItemDiv = document.createElement("div");
        cartItemDiv.className = "cart-item";
        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" data-action="decr" data-id="${item.id}"><i class="fas fa-minus"></i></button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-action="incr" data-id="${item.id}"><i class="fas fa-plus"></i></button>
                    <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div>${formatPrice(itemTotal)}</div>
        `;
        cartContainer.appendChild(cartItemDiv);
    });

    if(totalSpan) totalSpan.innerText = total.toLocaleString('fr-MG');

    document.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const action = btn.getAttribute("data-action");
            const id = parseInt(btn.getAttribute("data-id"));
            if(action === "incr") changeQuantity(id, 1);
            else if(action === "decr") changeQuantity(id, -1);
        });
    });

    document.querySelectorAll(".remove-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            removeItemCompletely(id);
        });
    });
}

function changeQuantity(productId, delta) {
    const index = cart.findIndex(item => item.id === productId);
    if(index === -1) return;
    const newQty = cart[index].quantity + delta;
    if(newQty <= 0) {
        cart.splice(index, 1);
        showToast(`🗑️ Article retiré`);
    } else {
        cart[index].quantity = newQty;
    }
    saveCartToStorage();
    updateCartUI();
    updateCartCount();
}

function removeItemCompletely(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
    updateCartCount();
    showToast(`🗑️ Article supprimé`);
}

function updateCartCount() {
    const countElement = document.getElementById("cartCount");
    if(countElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.innerText = totalItems;
    }
}

// Toast
let toastTimeout;
function showToast(message) {
    const toast = document.getElementById("toastNotification");
    const toastMessageSpan = document.getElementById("toastMessage");
    if(!toast) return;
    clearTimeout(toastTimeout);
    if(toastMessageSpan) toastMessageSpan.innerText = message;
    toast.classList.add("show");
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2000);
}

// Panier overlay
function initCartOverlay() {
    const overlay = document.getElementById("cartOverlay");
    const openBtn = document.getElementById("cartIcon");
    const closeBtn = document.getElementById("closeCartBtn");
    const bodyOverlay = document.getElementById("bodyOverlay");

    openBtn?.addEventListener("click", () => {
        overlay.classList.add("open");
        bodyOverlay.classList.add("active");
    });

    const closePanel = () => {
        overlay.classList.remove("open");
        bodyOverlay.classList.remove("active");
    };
    closeBtn?.addEventListener("click", closePanel);
    bodyOverlay?.addEventListener("click", closePanel);
    document.addEventListener("keydown", (e) => { if(e.key === "Escape" && overlay.classList.contains("open")) closePanel(); });
}

// Checkout
function initCheckout() {
    const checkoutBtn = document.getElementById("checkoutBtn");
    if(checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if(cart.length === 0) {
                showToast("🛑 Votre panier est vide !");
                return;
            }
            const totalSpan = document.getElementById("cartTotalPrice");
            alert(`✨ Merci pour votre commande ! ✨\n\nTotal : ${totalSpan?.innerText} Ar\n\nDynastie Sneakers vous remercie.\nNotre équipe vous contactera sous 24h.`);
            cart = [];
            saveCartToStorage();
            updateCartUI();
            updateCartCount();
            document.getElementById("cartOverlay")?.classList.remove("open");
            document.getElementById("bodyOverlay")?.classList.remove("active");
            showToast("🎉 Commande validée !");
        });
    }
}

// Scroll bouton
function initShopNow() {
    const shopBtn = document.getElementById("shopNowBtn");
    if(shopBtn) {
        shopBtn.addEventListener("click", () => {
            document.querySelector('#produits').classList.add('active-section');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-section="produits"]').classList.add('active');
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
            document.getElementById('produits').classList.add('active-section');
            window.scrollTo({ top: document.getElementById('produits').offsetTop - 80, behavior: 'smooth' });
        });
    }
}

// Formulaire de contact
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formMessage');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;
            if(name && email && message) {
                formFeedback.innerHTML = '<i class="fas fa-check-circle"></i> Message envoyé ! Nous vous répondrons rapidement.';
                formFeedback.style.color = '#05CEA8';
                form.reset();
                setTimeout(() => formFeedback.innerHTML = '', 5000);
            } else {
                formFeedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Veuillez remplir tous les champs.';
                formFeedback.style.color = '#ff6b6b';
            }
        });
    }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromStorage();
    renderProducts();
    initCartOverlay();
    initCheckout();
    initShopNow();
    initNavigation();
    initContactForm();
});