// ============================================================
// seed.js — seed.html page controller. One-click utility to
// populate the Firestore `products` collection with sample data
// so graders/demoers see a populated shop immediately.
//
// Not part of the required app flow — safe to delete before
// final submission, or leave in since it's gated behind login.
// ============================================================

import { db } from "./firebase-config.js";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { SAMPLE_PRODUCTS } from "./sample-products.js";

const seedBtn = document.getElementById("seed-btn");
const msg = document.getElementById("form-msg");

seedBtn?.addEventListener("click", async () => {
  seedBtn.disabled = true;
  msg.className = "form-msg";
  msg.textContent = "";

  try {
    const productsRef = collection(db, "products");
    const existingProducts = await getDocs(productsRef);

    const existingByImage = new Map();
    const duplicateIds = [];

    existingProducts.docs.forEach((productDoc) => {
      const productData = productDoc.data();
      const imageURL = productData?.imageURL;
      if (!imageURL) return;
      if (!existingByImage.has(imageURL)) {
        existingByImage.set(imageURL, productDoc.id);
      } else {
        duplicateIds.push(productDoc.id);
      }
    });

    const deletePromises = duplicateIds.map((id) => deleteDoc(doc(db, "products", id)));
    await Promise.all(deletePromises);

    let updated = 0;
    let added = 0;
    for (const product of SAMPLE_PRODUCTS) {
      const existingId = existingByImage.get(product.imageURL);
      if (existingId) {
        await setDoc(doc(db, "products", existingId), product);
        updated++;
      } else {
        await addDoc(productsRef, product);
        added++;
      }
    }

    const verify = await getDocs(productsRef);
    const totalProducts = verify.size;
    msg.className = "form-msg success";
    msg.textContent = `Done — updated ${updated} products and added ${added} new ones. Firestore now contains ${totalProducts} products.`;
  } catch (err) {
    msg.className = "form-msg error";
    msg.textContent = `Failed: ${err.message}`;
  } finally {
    seedBtn.disabled = false;
  }
});
