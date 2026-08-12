// ============================================================
// wishlist-store.js — Firestore data layer for a user's wishlist.
//
// Data model:
//   wishlists/{uid} = {
//     items: [ { productId, name, price, imageURL }, ... ]
//   }
// ============================================================

import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

function wishlistRef(uid) {
  return doc(db, "wishlists", uid);
}

export function subscribeToWishlist(uid, callback) {
  return onSnapshot(wishlistRef(uid), (snap) => {
    callback(snap.exists() ? snap.data().items || [] : []);
  });
}

/** Adds the product if not present, removes it if it already is. Returns the new "is in wishlist" state. */
export async function toggleWishlist(uid, product) {
  const snap = await getDoc(wishlistRef(uid));
  const items = snap.exists() ? snap.data().items || [] : [];
  const idx = items.findIndex((i) => i.productId === product.id);

  let nowActive;
  if (idx >= 0) {
    items.splice(idx, 1);
    nowActive = false;
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageURL: product.imageURL || "",
    });
    nowActive = true;
  }
  await setDoc(wishlistRef(uid), { items }, { merge: true });
  return nowActive;
}

export async function removeFromWishlist(uid, productId) {
  const snap = await getDoc(wishlistRef(uid));
  const items = (snap.exists() ? snap.data().items || [] : []).filter(
    (i) => i.productId !== productId
  );
  await setDoc(wishlistRef(uid), { items }, { merge: true });
}
