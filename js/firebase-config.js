
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD022wv6vX9GlDpNkLGzUjpOZamxaRBFXU",
  authDomain: "urbanthreadsstore-9819c.firebaseapp.com",
  projectId: "urbanthreadsstore-9819c",
  storageBucket: "urbanthreadsstore-9819c.firebasestorage.app",
  messagingSenderId: "794454674357",
  appId: "1:794454674357:web:e3b825478d95bfe02a67fc",
};

// Initialize Firebase app + services once, export for reuse everywhere
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
