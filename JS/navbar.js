import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

function waitForAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => { unsub(); resolve(user); });
  });
}

async function injectAdminBadge() {
  const user = await waitForAuth();
  if (!user) return;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || !userDoc.data().isAdmin) return;

  const navRight = document.querySelector(".navtextright");
  if (!navRight) return;

  const adminLink = document.createElement("a");
  adminLink.href = "./admin.html";
  adminLink.title = "Admin Panel";
  adminLink.style.cssText = `
    font-size: 10px;
    font-weight: 700;
    background-color: rgb(230, 76, 60);
    color: rgb(242, 239, 231) !important;
    padding: 3px 10px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: .06em;
    text-decoration: none;
  `;
  adminLink.textContent = "Admin";

  const userIcon = navRight.querySelector('a[href*="login"]');
  if (userIcon) {
    navRight.insertBefore(adminLink, userIcon);
  } else {
    navRight.appendChild(adminLink);
  }
}

injectAdminBadge();