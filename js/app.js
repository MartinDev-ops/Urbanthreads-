// ============================================================
// app.js — shared across every page:
//   - renders navbar auth state (logged in / logged out)
//   - handles logout
//   - dark mode toggle (persisted in localStorage)
//   - mobile nav toggle
//   - small toast helper used by other scripts
// Include this AFTER firebase-config.js on every page, as a module.
// ============================================================

import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Dark mode is controlled by the user's system preference via CSS
// `prefers-color-scheme`. No JS toggle is required.

// ---------- Mobile nav ----------
function initMobileNav() {
  const navbar = document.querySelector(".navbar");
  const toggle = document.getElementById("nav-toggle");
  if (!navbar || !toggle) return;
  toggle.addEventListener("click", () => navbar.classList.toggle("open"));
}

// ---------- Toast ----------
export function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- Cart badge ----------
export function setCartBadgeCount(count) {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  badge.textContent = count > 0 ? String(count) : "";
  badge.style.display = count > 0 ? "flex" : "none";
}

// ---------- Auth-aware navbar ----------
// Elements to control via data attributes in the navbar markup:
//   [data-auth="in"]  -> only visible when logged IN
//   [data-auth="out"] -> only visible when logged OUT
//   #user-chip        -> filled with the user's name/email
//   #logout-btn       -> triggers signOut()
function initAuthUI() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      showToast("Logged out");
      window.location.href = "index.html";
    });
  }

  onAuthStateChanged(auth, (user) => {
    document.querySelectorAll('[data-auth="in"]').forEach((el) => {
      el.style.display = user ? "" : "none";
    });
    document.querySelectorAll('[data-auth="out"]').forEach((el) => {
      el.style.display = user ? "none" : "";
    });

    const chip = document.getElementById("user-chip");
    if (chip && user) {
      chip.textContent = user.displayName || user.email;
    }

    // Let page-specific scripts react (e.g. shop.js loads the cart badge,
    // cart.html/wishlist.html/orders.html redirect guests to login).
    document.dispatchEvent(
      new CustomEvent("ut-auth-ready", { detail: { user } })
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initAuthUI();
});

// ---------- Guard helper for protected pages ----------
// Call from a page's own script: requireAuth(user => { ...load page... })
// Redirects to login.html (with a return path) if nobody is signed in.
export function requireAuth(onUser) {
  document.addEventListener("ut-auth-ready", (e) => {
    const user = e.detail.user;
    if (!user) {
      const page = window.location.pathname.split("/").pop();
      window.location.href = `login.html?redirect=${encodeURIComponent(page)}`;
      return;
    }
    onUser(user);
  });
}
