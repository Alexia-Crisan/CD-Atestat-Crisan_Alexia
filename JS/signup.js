import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "./home.html";
});

document.getElementById("signup-btn").addEventListener("click", async () => {
  const name     = document.getElementById("name").value.trim();
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm  = document.getElementById("confirm").value;
  const errorMsg = document.getElementById("error-msg");

  errorMsg.style.display = "none";

  if (!name || !email || !password || !confirm) {
    errorMsg.textContent = "Please fill in all fields.";
    errorMsg.style.display = "block";
    return;
  }
  if (password !== confirm) {
    errorMsg.textContent = "Passwords do not match.";
    errorMsg.style.display = "block";
    return;
  }
  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters.";
    errorMsg.style.display = "block";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    await setDoc(doc(db, "users", user.uid), {
      name:      name,
      email:     email,
      cart:      [],
      createdAt: new Date().toISOString(),
    });

    window.location.href = "./home.html";
  } catch (err) {
    errorMsg.style.display = "block";
    switch (err.code) {
      case "auth/email-already-in-use":
        errorMsg.textContent = "An account with this email already exists."; break;
      case "auth/invalid-email":
        errorMsg.textContent = "Please enter a valid email address."; break;
      case "auth/weak-password":
        errorMsg.textContent = "Password must be at least 6 characters."; break;
      default:
        errorMsg.textContent = "Something went wrong. Please try again.";
    }
  }
});

});