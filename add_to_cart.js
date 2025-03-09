document.addEventListener("DOMContentLoaded", function () {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    function addToCart(event) {
      const button = event.target;
      const productName = button.getAttribute("data-name");
      const productPrice = parseFloat(button.getAttribute("data-price"));
      const productImage = button.getAttribute("data-image");
  
      const existingProduct = cart.find((item) => item.name === productName);
  
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push({
          name: productName,
          price: productPrice,
          quantity: 1,
          image: productImage,
        });
      }
  
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${productName} was added to the cart!`);
    }
  
    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", addToCart);
    });
  });
  