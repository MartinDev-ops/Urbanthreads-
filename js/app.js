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
  const profileToggle = document.getElementById("profile-toggle");
  const userMenu = document.getElementById("user-menu");
  const userMenuClose = document.getElementById("user-menu-close");

  const closeMenu = () => {
    if (!userMenu) return;
    userMenu.setAttribute("aria-hidden", "true");
    if (profileToggle) profileToggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    if (!userMenu) return;
    userMenu.setAttribute("aria-hidden", "false");
    if (profileToggle) profileToggle.setAttribute("aria-expanded", "true");
  };

  if (profileToggle) {
    profileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = userMenu && userMenu.getAttribute("aria-hidden") === "false";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (userMenuClose) {
    userMenuClose.addEventListener("click", (event) => {
      event.stopPropagation();
      closeMenu();
    });
  }

  document.addEventListener("click", (event) => {
    if (
      userMenu &&
      userMenu.getAttribute("aria-hidden") === "false" &&
      !userMenu.contains(event.target) &&
      profileToggle &&
      !profileToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      closeMenu();
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

    if (profileToggle) {
      profileToggle.style.display = user ? "" : "none";
      if (!user) closeMenu();
    }

    const userNameEl = document.getElementById("menu-user-name");
    const userEmailEl = document.getElementById("menu-user-email");
    const authMethodEl = document.getElementById("menu-auth-method");
    const passwordRow = document.querySelector(".password-row");

    if (user) {
      const displayName = user.displayName || user.email?.split("@")[0] || "Member";
      const email = user.email || "Unknown";
      const providerId = user.providerData?.[0]?.providerId || "password";
      const methodLabel =
        providerId === "password"
          ? "Email"
          : providerId === "google.com"
          ? "Google"
          : providerId;

      if (userNameEl) userNameEl.textContent = displayName;
      if (userEmailEl) userEmailEl.textContent = email;
      if (authMethodEl) authMethodEl.textContent = methodLabel;
      if (passwordRow)
        passwordRow.style.display = providerId === "password" ? "flex" : "none";
    } else {
      if (userNameEl) userNameEl.textContent = "";
      if (userEmailEl) userEmailEl.textContent = "";
      if (authMethodEl) authMethodEl.textContent = "";
      if (passwordRow) passwordRow.style.display = "none";
    }

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
