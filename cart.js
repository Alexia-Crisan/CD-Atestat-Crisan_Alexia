document.addEventListener("DOMContentLoaded", function () {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.querySelector(".cartitems"); 
    const totalContainer = document.querySelector("#cart-total-container"); 
  
    function displayCart() {
      cartItemsContainer.innerHTML = "";
      let total = 0;
      
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<div
              style="
                display: flex;
                justify-content: space-around;
                align-items: center;
                weight: 100%;
                height: 100%;
              "
            >
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
          </div>
        `;
      });
  
      totalContainer.innerHTML = `
        <h2 class="empty">Total: &nbsp; <span style="color:rgb(250, 77, 77);">${total.toFixed(2)} RON </span></h2>
        <button class="button" id="clear-cart">Clear Cart</button>
        <button class="button" id="pay">Pay</button>
      `;
  
      addEventListeners();
    }
  
    function addEventListeners() {
      document.querySelectorAll(".plus").forEach((button) => {
        button.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          cart[index].quantity++;
          localStorage.setItem("cart", JSON.stringify(cart));
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
          localStorage.setItem("cart", JSON.stringify(cart));
          displayCart();
        });
      });
  
      document.getElementById("clear-cart").addEventListener("click", function () {
        localStorage.removeItem("cart");
        location.reload();
      });
    }
  
    displayCart();
  });
  