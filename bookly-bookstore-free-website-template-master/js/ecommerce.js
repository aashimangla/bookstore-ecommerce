(function () {
  "use strict";

  const STORAGE_KEY = "booklyCart";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderAll();
  }

  function money(value) {
    return "$" + Number(value).toFixed(2);
  }

  function cartCount(cart) {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function subtotal(cart) {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function shipping(cart) {
    const total = subtotal(cart);
    return cart.length === 0 ? 0 : (total >= 1000 ? 0 : 40);
  }

  function showToast(message) {
    let toast = document.querySelector(".cart-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "cart-toast alert alert-dark shadow-sm mb-0";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove("d-none");
    clearTimeout(window.booklyToastTimer);
    window.booklyToastTimer = setTimeout(() => toast.remove(), 1800);
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    showToast(product.name + " added to cart");
  }

  function updateQuantity(name, quantity) {
    const cart = getCart();
    const item = cart.find(product => product.name === name);
    if (!item) return;
    item.quantity = Math.max(1, Number(quantity) || 1);
    saveCart(cart);
  }

  function removeItem(name) {
    saveCart(getCart().filter(item => item.name !== name));
  }

  function renderHeaderCart() {
    const cart = getCart();
    const count = cartCount(cart);
    const countEl = document.getElementById("header-cart-count");
    const badgeEl = document.getElementById("header-cart-badge");
    const listEl = document.getElementById("header-cart-items");

    if (countEl) countEl.textContent = "(" + String(count).padStart(2, "0") + ")";
    if (badgeEl) badgeEl.textContent = count;

    if (!listEl) return;

    if (!cart.length) {
      listEl.innerHTML = '<li class="list-group-item bg-transparent text-center text-black-50">Your cart is empty.</li>';
      return;
    }

    listEl.innerHTML = cart.slice(0, 4).map(item => `
      <li class="list-group-item bg-transparent d-flex justify-content-between lh-sm">
        <div>
          <h5><a href="single-product.html">${escapeHtml(item.name)}</a></h5>
          <small>Qty: ${item.quantity}</small>
        </div>
        <span class="text-primary">${money(item.price * item.quantity)}</span>
      </li>
    `).join("");

    if (cart.length > 4) {
      listEl.innerHTML += '<li class="list-group-item bg-transparent text-center text-black-50">+ more items in cart</li>';
    }
  }

  function renderCartPage() {
    const container = document.getElementById("cart-items");
    const content = document.getElementById("cart-content");
    const empty = document.getElementById("cart-empty");
    if (!container || !content || !empty) return;

    const cart = getCart();
    if (!cart.length) {
      content.classList.add("d-none");
      empty.classList.remove("d-none");
      return;
    }

    content.classList.remove("d-none");
    empty.classList.add("d-none");

    container.innerHTML = cart.map(item => `
      <div class="cart-row p-4 d-flex flex-wrap align-items-center gap-3">
        <img src="${escapeAttr(item.image)}" class="cart-product-image" alt="${escapeAttr(item.name)}">
        <div class="flex-grow-1">
          <h5 class="mb-1">${escapeHtml(item.name)}</h5>
          <p class="text-black-50 mb-2">${money(item.price)} each</p>
          <div class="d-flex align-items-center gap-3">
            <div class="input-group qty-control">
              <button type="button" class="btn btn-outline-secondary cart-qty-minus" data-name="${escapeAttr(item.name)}">−</button>
              <input type="number" min="1" class="form-control text-center cart-qty-input" value="${item.quantity}" data-name="${escapeAttr(item.name)}">
              <button type="button" class="btn btn-outline-secondary cart-qty-plus" data-name="${escapeAttr(item.name)}">+</button>
            </div>
            <a href="#" class="remove-cart-item" data-name="${escapeAttr(item.name)}">Remove</a>
          </div>
        </div>
        <strong class="text-primary">${money(item.price * item.quantity)}</strong>
      </div>
    `).join("");

    const sub = subtotal(cart);
    const ship = shipping(cart);
    document.getElementById("cart-subtotal").textContent = money(sub);
    document.getElementById("cart-shipping").textContent = ship === 0 ? "Free" : money(ship);
    document.getElementById("cart-total").textContent = money(sub + ship);
  }

  function renderCheckoutPage() {
    const form = document.getElementById("checkout-form");
    const empty = document.getElementById("checkout-empty");
    if (!form || !empty) return;

    const cart = getCart();
    if (!cart.length) {
      form.classList.add("d-none");
      empty.classList.remove("d-none");
      return;
    }

    form.classList.remove("d-none");
    empty.classList.add("d-none");

    const items = document.getElementById("checkout-items");
    items.innerHTML = cart.map(item => `
      <div class="d-flex justify-content-between gap-3 mb-3">
        <div>
          <div class="fw-medium">${escapeHtml(item.name)}</div>
          <small class="text-black-50">Qty: ${item.quantity}</small>
        </div>
        <span>${money(item.price * item.quantity)}</span>
      </div>
    `).join("");

    const sub = subtotal(cart);
    const ship = shipping(cart);
    document.getElementById("checkout-subtotal").textContent = money(sub);
    document.getElementById("checkout-shipping").textContent = ship === 0 ? "Free" : money(ship);
    document.getElementById("checkout-total").textContent = money(sub + ship);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function renderAll() {
    renderHeaderCart();
    renderCartPage();
    renderCheckoutPage();
  }

  document.addEventListener("click", function (e) {
    const addButton = e.target.closest(".add-to-cart, .card-concern button");
    if (addButton) {
      const cartIcon = addButton.querySelector('svg.cart, use[href="#cart"], use[xlink\\:href="#cart"]');
      if (!addButton.classList.contains("add-to-cart") && !cartIcon) return;
      e.preventDefault();

      const card = addButton.closest(".product-card, .card");
      if (!card) return;

      let name = card.dataset.productName;
      let price = Number(card.dataset.productPrice);
      let image = card.dataset.productImage;

      // Supports the remaining original product cards without changing their markup.
      if (!name) {
        const nameEl = card.querySelector("h6 a");
        const priceEl = card.querySelector(".price");
        const imageEl = card.querySelector("img");
        name = nameEl ? nameEl.textContent.trim() : "Book";
        image = imageEl ? imageEl.getAttribute("src") : "";
        if (!price) {
          const priceText = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, "") : "0";
          price = Number(priceText) || 0;
        }
      }

      addToCart({ name, price, image });
      return;
    }

    const plus = e.target.closest(".cart-qty-plus");
    if (plus) {
      const name = plus.dataset.name;
      const item = getCart().find(i => i.name === name);
      if (item) updateQuantity(name, item.quantity + 1);
      return;
    }

    const minus = e.target.closest(".cart-qty-minus");
    if (minus) {
      const name = minus.dataset.name;
      const item = getCart().find(i => i.name === name);
      if (item) updateQuantity(name, Math.max(1, item.quantity - 1));
      return;
    }

    const remove = e.target.closest(".remove-cart-item");
    if (remove) {
      e.preventDefault();
      removeItem(remove.dataset.name);
      return;
    }
  });

  document.addEventListener("change", function (e) {
    const input = e.target.closest(".cart-qty-input");
    if (input) updateQuantity(input.dataset.name, input.value);
  });

  document.addEventListener("submit", function (e) {
    const form = e.target.closest("#checkout-form");
    if (!form) return;

    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const orderNumber = "BK" + Date.now().toString().slice(-8);
    localStorage.removeItem(STORAGE_KEY);

    form.classList.add("d-none");
    const success = document.getElementById("order-success");
    success.classList.remove("d-none");
    document.getElementById("order-number").textContent = orderNumber;
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.addEventListener("DOMContentLoaded", renderAll);
})();
