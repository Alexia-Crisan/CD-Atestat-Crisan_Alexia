import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "./home.html";
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;
  const errorMsg = document.getElementById("error-msg");

  errorMsg.style.display = "none";

  if (!email || !password) {
    errorMsg.textContent = "Please fill in all fields.";
    errorMsg.style.display = "block";
    return;
  }

  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "./home.html";
  } catch (err) {
    errorMsg.style.display = "block";
    switch (err.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        errorMsg.textContent = "Incorrect email or password."; break;
      case "auth/too-many-requests":
        errorMsg.textContent = "Too many attempts. Try again later."; break;
      default:
        errorMsg.textContent = "Something went wrong. Please try again.";
    }
  }
});