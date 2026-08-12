// ============================================================
// auth.js — login.html logic: sign up, log in, Google sign-in,
// validation + user feedback, and post-login redirects.
// ============================================================

import { auth, db, googleProvider } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const form = document.getElementById("auth-form");
const msg = document.getElementById("form-msg");
const submitBtn = document.getElementById("submit-btn");
const googleBtn = document.getElementById("google-btn");
const toggleModeBtn = document.getElementById("toggle-mode");
const toggleText = document.getElementById("toggle-text");
const formTitle = document.getElementById("form-title");
const formSub = document.getElementById("form-sub");
const nameField = document.getElementById("name-field");
const confirmField = document.getElementById("confirm-field");

let mode = "login"; // or "signup"

function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "shop.html";
}

function showMessage(text, type = "error") {
  msg.textContent = text;
  msg.className = `form-msg ${type}`;
}

function clearMessage() {
  msg.className = "form-msg";
  msg.textContent = "";
}

function setMode(next) {
  mode = next;
  clearMessage();
  if (mode === "signup") {
    formTitle.textContent = "Create your account";
    formSub.textContent = "Sign up to start shopping Urban Threads.";
    submitBtn.textContent = "Sign Up";
    nameField.style.display = "";
    confirmField.style.display = "";
    toggleText.textContent = "Already have an account?";
    toggleModeBtn.textContent = "Log in";
  } else {
    formTitle.textContent = "Welcome back";
    formSub.textContent = "Log in to your Urban Threads account.";
    submitBtn.textContent = "Log In";
    nameField.style.display = "none";
    confirmField.style.display = "none";
    toggleText.textContent = "Don't have an account?";
    toggleModeBtn.textContent = "Sign up";
  }
}

toggleModeBtn.addEventListener("click", () => {
  setMode(mode === "login" ? "signup" : "login");
});

// Ensure a lightweight user profile doc exists (used to show name/email
// consistently and as a natural home for future user-level fields).
async function ensureUserDoc(user, extra = {}) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      name: user.displayName || extra.name || "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  submitBtn.disabled = true;

  try {
    if (mode === "signup") {
      const name = document.getElementById("name").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value;

      if (!name) throw { message: "Please enter your full name." };
      if (password.length < 6) throw { message: "Password must be at least 6 characters." };
      if (password !== confirmPassword) throw { message: "Passwords do not match." };

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await ensureUserDoc(cred.user, { name });

      showMessage("Account created! Redirecting…", "success");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("Logged in! Redirecting…", "success");
    }

    setTimeout(() => (window.location.href = getRedirectTarget()), 600);
  } catch (err) {
    submitBtn.disabled = false;
    showMessage(friendlyError(err));
  }
});

googleBtn.addEventListener("click", async () => {
  clearMessage();
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(result.user);
    showMessage("Logged in with Google! Redirecting…", "success");
    setTimeout(() => (window.location.href = getRedirectTarget()), 500);
  } catch (err) {
    showMessage(friendlyError(err));
  }
});

function friendlyError(err) {
  const code = err && err.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered — try logging in instead.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Password is too weak — use at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    default:
      return (err && err.message) || "Something went wrong. Please try again.";
  }
}

// If the user is already logged in and lands on login.html, send them along.
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = getRedirectTarget();
  }
});

setMode("login");
