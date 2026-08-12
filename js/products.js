// ============================================================
// products.js — shop.html page controller.
// Fetches products from Firestore in real time, renders a
// responsive grid, and wires up search, category filter,
// "Add to Cart", and wishlist heart toggle.
// ============================================================

import { auth, db } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { addToCart, subscribeToCart, cartCount } from "./cart-store.js";
import { subscribeToWishlist, toggleWishlist } from "./wishlist-store.js";
import { setCartBadgeCount, showToast } from "./app.js";
import { SAMPLE_PRODUCTS } from "./sample-products.js";

const grid = document.getElementById("product-grid");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const chips = document.querySelectorAll(".chip");

let allProducts = [];
let wishlistIds = new Set();
let currentUser = null;
let activeCategory = "All";
let searchTerm = "";
let fallbackNoticeShown = false;

// Preselect category from ?category= in the URL (used by the homepage tiles)
const urlCategory = new URLSearchParams(window.location.search).get("category");
if (urlCategory) {
  activeCategory = urlCategory;
}

// ---------- Firestore: live product list ----------
onSnapshot(
  collection(db, "products"),
  (snap) => {
    const loadedProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (loadedProducts.length === 0) {
      allProducts = SAMPLE_PRODUCTS.map((product, index) => ({ id: `sample-${index + 1}`, ...product }));
      if (!fallbackNoticeShown) {
        showToast("Showing local product samples because Firestore has no products.");
        fallbackNoticeShown = true;
      }
    } else {
      allProducts = loadedProducts;
      fallbackNoticeShown = false;
    }
    loading.style.display = "none";
    syncChipsToActiveCategory();
    render();
  },
  (err) => {
    loading.style.display = "none";
    allProducts = SAMPLE_PRODUCTS.map((product, index) => ({ id: `sample-${index + 1}`, ...product }));
    showToast("Using local sample products because Firestore failed.");
    syncChipsToActiveCategory();
    render();
  }
);

// ---------- Auth-aware: cart badge + wishlist hearts ----------
document.addEventListener("ut-auth-ready", (e) => {
  currentUser = e.detail.user;
  if (currentUser) {
    subscribeToCart(currentUser.uid, (items) => {
      setCartBadgeCount(cartCount(items));
    });
    subscribeToWishlist(currentUser.uid, (items) => {
      wishlistIds = new Set(items.map((i) => i.productId));
      render();
    });
  } else {
    setCartBadgeCount(0);
    wishlistIds = new Set();
    render();
  }
});

// ---------- Filters ----------
function getCategoryCount(category) {
  if (category === "All") return allProducts.length;
  return allProducts.filter((product) => product.category === category).length;
}

function syncChipsToActiveCategory() {
  chips.forEach((chip) => {
    const label = chip.dataset.label || chip.dataset.category;
    const count = getCategoryCount(chip.dataset.category);
    chip.textContent = `${label} (${count})`;
    chip.classList.toggle("active", chip.dataset.category === activeCategory);
  });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    activeCategory = chip.dataset.category;
    syncChipsToActiveCategory();
    render();
  });
});

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  render();
});

function getFiltered() {
  return allProducts.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const haystack = `${p.name} ${p.description || ""}`.toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}

// ---------- Render ----------
function render() {
  const filtered = getFiltered();
  emptyState.style.display = filtered.length === 0 ? "block" : "none";
  grid.innerHTML = filtered.map(productCard).join("");

  grid.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => handleAddToCart(btn.dataset.addToCart));
  });
  grid.querySelectorAll("[data-wishlist]").forEach((btn) => {
    btn.addEventListener("click", () => handleToggleWishlist(btn.dataset.wishlist));
  });
}

function productCard(p) {
  const isWished = wishlistIds.has(p.id);
  const img = p.imageURL || "https://placehold.co/400x400?text=Urban+Threads";
  return `
    <div class="product-card">
      <button class="wishlist-toggle ${isWished ? "active" : ""}" data-wishlist="${p.id}" title="Toggle wishlist">
        <i class="bi ${isWished ? "bi-heart-fill" : "bi-heart"}"></i>
      </button>
      <div class="img-wrap"><img src="${img}" alt="${escapeHtml(p.name)}" loading="lazy" /></div>
      <div class="product-body">
        <span class="product-category">${escapeHtml(p.category || "")}</span>
        <span class="product-name">${escapeHtml(p.name)}</span>
        <span class="product-desc">${escapeHtml(p.description || "")}</span>
        <div class="product-footer">
          <span class="price">R${Number(p.price).toFixed(2)}</span>
          <button class="btn btn-primary btn-sm" data-add-to-cart="${p.id}">Add to Cart</button>
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

// ---------- Actions ----------
async function handleAddToCart(productId) {
  if (!currentUser) {
    window.location.href = "login.html?redirect=shop.html";
    return;
  }
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;
  await addToCart(currentUser.uid, product, 1);
  showToast(`Added "${product.name}" to cart`);
}

async function handleToggleWishlist(productId) {
  if (!currentUser) {
    window.location.href = "login.html?redirect=shop.html";
    return;
  }
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;
  const nowActive = await toggleWishlist(currentUser.uid, product);
  showToast(nowActive ? `Added "${product.name}" to wishlist` : `Removed "${product.name}" from wishlist`);
}
