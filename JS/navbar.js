import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || !userDoc.data().isAdmin) return;

    const navRight = document.querySelector(".navtextright");
    if (!navRight) return;

    const adminLink = document.createElement("a");
    adminLink.href = "./admin.html";
    adminLink.style.fontSize = "17px";
    adminLink.innerHTML = `<i class="fa-solid fa-shield-halved"></i>`;
    adminLink.title = "Admin Panel";

    const userIcon = navRight.querySelector('a[href*="login"]');
    if (userIcon) {
      navRight.insertBefore(adminLink, userIcon);
    } else {
      navRight.appendChild(adminLink);
    }
  });
});