// ============================================================
// orders-store.js — Firestore data layer for order history.
//
// Data model (top-level collection, filtered by uid so a user can
// only ever query/read their own orders — see firestore.rules):
//   orders/{orderId} = {
//     uid, items: [...], total, createdAt
//   }
// ============================================================

import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

export async function createOrder(uid, items, total) {
  try {
    const ref = await addDoc(collection(db, "orders"), {
      uid,
      items,
      total,
      createdAt: serverTimestamp(),
    });
    console.log("Order created:", ref.id);
    return ref.id;
  } catch (err) {
    console.error("createOrder error:", err);
    throw err;
  }
}

export function subscribeToOrders(uid, callback) {
  const q = query(
    collection(db, "orders"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log(`orders snapshot (${uid}):`, docs.length, "orders");
      callback(docs);
    },
    (err) => {
      console.error("orders onSnapshot error:", err);
    }
  );
}
