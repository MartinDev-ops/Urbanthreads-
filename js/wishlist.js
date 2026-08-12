// ============================================================
// wishlist.js — wishlist.html page controller. Gated to
// logged-in users. Lists saved products with a "Move to Cart"
// and a "Remove" action.
// ============================================================

import { requireAuth, setCartBadgeCount, showToast } from "./app.js";
import { subscribeToWishlist, removeFromWishlist } from "./wishlist-store.js";
import { addToCart, subscribeToCart, cartCount } from "./cart-store.js";

const loading = document.getElementById("loading");
const grid = document.getElementById("wishlist-grid");
const emptyEl = document.getElementById("empty-wishlist");

let uid = null;
let lastItems = [];

requireAuth((user) => {
  uid = user.uid;
  loading.style.display = "none";

  subscribeToCart(uid, (items) => setCartBadgeCount(cartCount(items)));
  subscribeToWishlist(uid, render);
});

function render(items) {
  lastItems = items;
  emptyEl.style.display = items.length === 0 ? "block" : "none";
  grid.innerHTML = items.map(cardHtml).join("");

  grid.querySelectorAll("[data-move-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => handleMoveToCart(btn.dataset.moveToCart));
  });
  grid.querySelectorAll("[data-remove-wish]").forEach((btn) => {
    btn.addEventListener("click", () => handleRemove(btn.dataset.removeWish));
  });
}

function cardHtml(item) {
  const img = item.imageURL || "https://placehold.co/400x400?text=Urban+Threads";
  return `
    <div class="product-card">
      <div class="img-wrap"><img src="${img}" alt="${escapeHtml(item.name)}" /></div>
      <div class="product-body">
        <span class="product-name">${escapeHtml(item.name)}</span>
        <div class="product-footer">
          <span class="price">R${item.price.toFixed(2)}</span>
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="btn btn-primary btn-sm" style="flex:1;" data-move-to-cart="${item.productId}">Add to Cart</button>
          <button class="btn btn-danger btn-sm" data-remove-wish="${item.productId}">Remove</button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function handleMoveToCart(productId) {
  const item = findItem(productId);
  if (!item) return;
  await addToCart(uid, { id: item.productId, name: item.name, price: item.price, imageURL: item.imageURL }, 1);
  showToast(`Added "${item.name}" to cart`);
}

async function handleRemove(productId) {
  const item = findItem(productId);
  await removeFromWishlist(uid, productId);
  if (item) showToast(`Removed "${item.name}" from wishlist`);
}

// Local cache of the latest wishlist items so click handlers can look up
// product details without re-querying Firestore.
function findItem(productId) {
  return lastItems.find((i) => i.productId === productId);
}
