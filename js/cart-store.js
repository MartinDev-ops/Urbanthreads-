// ============================================================
// cart-store.js — single source of truth for reading/writing a
// signed-in user's shopping cart in Firestore.
//
// Data model:
//   carts/{uid} = {
//     items: [ { productId, name, price, imageURL, qty }, ... ],
//     updatedAt: <server timestamp>
//   }
//
// Every page that touches the cart (shop.js for "Add to Cart",
// cart.js for the cart page, app.js for the navbar badge) imports
// from this one module so the read/write logic only lives in one
// place.
// ============================================================

import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

function cartRef(uid) {
  return doc(db, "carts", uid);
}

/** Live-subscribe to a user's cart. callback receives an array of items. */
export function subscribeToCart(uid, callback) {
  return onSnapshot(cartRef(uid), (snap) => {
    const items = snap.exists() ? snap.data().items || [] : [];
    callback(items);
  });
}

async function writeItems(uid, items) {
  await setDoc(
    cartRef(uid),
    { items, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/** Add a product to the cart, incrementing qty if it's already present. */
export async function addToCart(uid, product, qty = 1) {
  const snap = await getDoc(cartRef(uid));
  const items = snap.exists() ? snap.data().items || [] : [];
  const existing = items.find((i) => i.productId === product.id);

  if (existing) {
    existing.qty += qty;
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageURL: product.imageURL || "",
      qty,
    });
  }
  await writeItems(uid, items);
}

/** Set an exact quantity for a line item (removes it if qty <= 0). */
export async function setQty(uid, productId, qty) {
  const snap = await getDoc(cartRef(uid));
  let items = snap.exists() ? snap.data().items || [] : [];
  if (qty <= 0) {
    items = items.filter((i) => i.productId !== productId);
  } else {
    const existing = items.find((i) => i.productId === productId);
    if (existing) existing.qty = qty;
  }
  await writeItems(uid, items);
}

export async function removeFromCart(uid, productId) {
  await setQty(uid, productId, 0);
}

export async function clearCart(uid) {
  await writeItems(uid, []);
}

export function cartCount(items) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

export function cartTotal(items) {
  return items.reduce((sum, i) => sum + i.qty * i.price, 0);
}
