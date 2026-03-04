document.addEventListener("DOMContentLoaded", function () {
    paypal.Buttons({
        style: {
            layout: "horizontal", 
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 50, 
        },
        createOrder: function (data, actions) {
        
            let totalRON = getTotalCartAmount();
            let totalAmount = totalRON / 5;
      
            return actions.order.create({
                purchase_units: [
                    {
                        amount: {
                            value: totalAmount.toFixed(2), 
                            currency_code: "EUR", 
                        },
                    },
                ],
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                alert("Thank you for your purchase!");
                clearCart();
            });
        },
        onError: function (err) {
            console.error("PayPal Checkout Error:", err);
            alert("An error occurred during the transaction. Please try again.");
        },
    }).render("#paypal-button-container"); 
});

function getTotalCartAmount() {
    let totalElement = document.querySelector("#cart-total-container h2");
    let totalText = totalElement.innerText;
    let totalAmount = parseFloat(totalText.replace("Total: ", "").replace(" RON", ""));
    return isNaN(totalAmount) ? 0 : totalAmount;
}

function clearCart() {
    localStorage.removeItem("cartItems");
    document.getElementById("cart-items-container").innerHTML = "";
    document.querySelector("#cart-total-container h2").innerText = "Total: 0.00 RON";
}