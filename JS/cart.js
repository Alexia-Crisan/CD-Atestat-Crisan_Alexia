import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const cartItemsContainer = document.querySelector(".cartitems");
  const totalContainer     = document.querySelector("#cart-total-container");

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      document.querySelector(".cartbox").innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%; height:100%; gap:20px;">
          <p style="font-size:20px; font-weight:700; color:rgb(41,115,178);">Please log in to view your cart</p>
          <a href="./login.html" style="padding:10px 24px; background-color:rgb(41,115,178); color:rgb(242,239,231); border-radius:9px; font-weight:700; font-size:15px; text-decoration:none;">Go to Login</a>
        </div>`;
      return;
    }

    // User-specific cart key
    const cartKey = `cart_${user.uid}`;
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    function displayCart() {
      cartItemsContainer.innerHTML = "";
      let total = 0;

      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
          <div style="display:flex; justify-content:space-around; align-items:center; width:100%; height:100%;">
            <h2 class="empty">Your cart is empty</h2>
          </div>`;
        totalContainer.innerHTML = `<h2 class="empty">Total: 0.00 RON</h2>`;
        return;
      }

      cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        total += itemTotal;

        cartItemsContainer.innerHTML += `
          <div class="item">
            <img class="itemphoto" src="${item.image}" style="width: 50px; height: 50px;" />
            <p class="itemname">${item.name}</p>
            <div class="totalPrice">${item.price.toFixed(2)} RON</div>
            <button class="minus" data-index="${index}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="plus" data-index="${index}">+</button>
          </div>`;
      });

      totalContainer.innerHTML = `
        <h2 class="empty">Total: &nbsp; <span style="color:rgb(250, 77, 77);">${total.toFixed(2)} RON</span></h2>
        <button class="button" id="clear-cart">Clear Cart</button>
        <div id="paypal-button-container"></div>`;

      addEventListeners();
      renderPayPalButton();
    }

    function renderPayPalButton() {
      paypal.Buttons({
        style: { layout: "horizontal", color: "gold", shape: "rect", label: "paypal", height: 50 },
        createOrder: function (data, actions) {
          let totalRON = getTotalCartAmount();
          let totalAmount = totalRON / 5;
          return actions.order.create({
            purchase_units: [{ amount: { value: totalAmount.toFixed(2), currency_code: "EUR" } }],
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {
            alert("Thank you for your purchase!");
            localStorage.removeItem(cartKey);
            location.reload();
          });
        },
        onError: function (err) {
          console.error("PayPal Checkout Error:", err);
          alert("An error occurred during the transaction. Please try again.");
        },
      }).render("#paypal-button-container");
    }

    function getTotalCartAmount() {
      let totalElement = document.querySelector("#cart-total-container h2 span");
      if (!totalElement) return 0;
      let totalText = totalElement.innerText;
      let totalAmount = parseFloat(totalText.replace(" RON", "").trim());
      return isNaN(totalAmount) ? 0 : totalAmount;
    }

    function addEventListeners() {
      document.querySelectorAll(".plus").forEach((button) => {
        button.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          cart[index].quantity++;
          localStorage.setItem(cartKey, JSON.stringify(cart));
          displayCart();
        });
      });

      document.querySelectorAll(".minus").forEach((button) => {
        button.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          if (cart[index].quantity > 1) {
            cart[index].quantity--;
          } else {
            cart.splice(index, 1);
          }
          localStorage.setItem(cartKey, JSON.stringify(cart));
          displayCart();
        });
      });

      document.getElementById("clear-cart").addEventListener("click", function () {
        localStorage.removeItem(cartKey);
        location.reload();
      });
    }

    displayCart();
  });
});