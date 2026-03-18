import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {

  function addToCart(event) {
    const button = event.target;
    const productName  = button.getAttribute("data-name");
    const productPrice = parseFloat(button.getAttribute("data-price"));
    const productImage = button.getAttribute("data-image");

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("Please log in to add items to your cart.");
        return;
      }

      const userRef  = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let cart = userSnap.exists() ? (userSnap.data().cart || []) : [];

      const existing = cart.find((item) => item.name === productName);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ name: productName, price: productPrice, quantity: 1, image: productImage });
      }

      await updateDoc(userRef, { cart });
      alert(`${productName} was added to the cart!`);
    });
  }

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", addToCart);
  });
});