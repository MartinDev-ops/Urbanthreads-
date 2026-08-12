// ============================================================
// orders.js — orders.html page controller. Gated to logged-in
// users. Lists past orders (written by cart.js at checkout time)
// newest first.
// ============================================================

import { requireAuth, setCartBadgeCount } from "./app.js";
import { subscribeToOrders } from "./orders-store.js";
import { subscribeToCart, cartCount } from "./cart-store.js";

const loading = document.getElementById("loading");
const list = document.getElementById("orders-list");
const emptyEl = document.getElementById("empty-orders");

requireAuth((user) => {
  loading.style.display = "none";
  subscribeToCart(user.uid, (items) => setCartBadgeCount(cartCount(items)));
  subscribeToOrders(user.uid, render);
});

function render(orders) {
  console.log('render orders:', orders && orders.length);
  emptyEl.style.display = orders.length === 0 ? "block" : "none";
  list.innerHTML = orders.map(orderCard).join("");
}

function orderCard(order) {
  const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
  const itemsHtml = order.items
    .map((i) => `<li>${escapeHtml(i.name)} × ${i.qty} — R${(i.qty * i.price).toFixed(2)}</li>`)
    .join("");

  return `
    <div class="order-card">
      <div class="order-meta">
        <span>${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <span>Order #${order.id.slice(0, 8).toUpperCase()}</span>
      </div>
      <ul>${itemsHtml}</ul>
      <div style="text-align:right; font-weight:700; margin-top:8px;">
        Total: R${order.total.toFixed(2)}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
