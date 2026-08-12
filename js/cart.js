// ============================================================
// cart.js — cart.html page controller. Gated to logged-in users
// via requireAuth(). Renders line items with quantity controls,
// a running total, and handles checkout (writes an order, clears
// the cart).
// ============================================================

import { requireAuth, setCartBadgeCount, showToast } from "./app.js";
import {
  subscribeToCart,
  setQty,
  removeFromCart,
  clearCart,
  cartCount,
  cartTotal,
} from "./cart-store.js";
import { createOrder } from "./orders-store.js";

const loading = document.getElementById("loading");
const content = document.getElementById("cart-content");
const itemsEl = document.getElementById("cart-items");
const emptyEl = document.getElementById("empty-cart");
const summaryCount = document.getElementById("summary-count");
const summaryTotal = document.getElementById("summary-total");
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutMsg = document.getElementById("checkout-msg");

let uid = null;
let currentItems = [];

requireAuth((user) => {
  uid = user.uid;
  loading.style.display = "none";
  content.style.display = "block";

  subscribeToCart(uid, (items) => {
    currentItems = items;
    render(items);
    setCartBadgeCount(cartCount(items));
  });
});

function render(items) {
  emptyEl.style.display = items.length === 0 ? "block" : "none";
  checkoutBtn.disabled = items.length === 0;

  itemsEl.innerHTML = items.map(rowHtml).join("");

  itemsEl.querySelectorAll("[data-decrease]").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(btn.dataset.decrease, -1));
  });
  itemsEl.querySelectorAll("[data-increase]").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(btn.dataset.increase, 1));
  });
  itemsEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => handleRemove(btn.dataset.remove));
  });

  summaryCount.textContent = String(cartCount(items));
  summaryTotal.textContent = `R${cartTotal(items).toFixed(2)}`;
}

function rowHtml(item) {
  const img = item.imageURL || "https://placehold.co/120x120?text=Urban+Threads";
  const lineTotal = (item.qty * item.price).toFixed(2);
  return `
    <div class="cart-row">
      <div class="thumb"><img src="${img}" alt="${escapeHtml(item.name)}" /></div>
      <div class="info">
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="unit-price">R${item.price.toFixed(2)} each</div>
      </div>
      <div class="qty-control">
        <button data-decrease="${item.productId}" aria-label="Decrease quantity"><i class="bi bi-dash-lg"></i></button>
        <span>${item.qty}</span>
        <button data-increase="${item.productId}" aria-label="Increase quantity"><i class="bi bi-plus-lg"></i></button>
      </div>
      <div class="line-total">R${lineTotal}</div>
      <button class="btn btn-danger btn-sm" data-remove="${item.productId}">Remove</button>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function changeQty(productId, delta) {
  const item = currentItems.find((i) => i.productId === productId);
  if (!item) return;
  await setQty(uid, productId, item.qty + delta);
}

async function handleRemove(productId) {
  await removeFromCart(uid, productId);
  showToast("Item removed from cart");
}

checkoutBtn.addEventListener("click", async () => {
  if (currentItems.length === 0) return;
  checkoutBtn.disabled = true;
  checkoutMsg.className = "form-msg";

  try {
    const total = cartTotal(currentItems);
    await createOrder(uid, currentItems, total);
    await clearCart(uid);
    checkoutMsg.className = "form-msg success";
    checkoutMsg.textContent = "Order placed! Redirecting to your order history…";
    setTimeout(() => (window.location.href = "orders.html"), 900);
  } catch (err) {
    checkoutBtn.disabled = false;
    checkoutMsg.className = "form-msg error";
    checkoutMsg.textContent = err.message || "Checkout failed. Please try again.";
  }
});
