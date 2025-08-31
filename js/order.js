// js/order.js (frontend logic connecting order form with backend Razorpay server)

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("orderForm");
  const deliveryFields = document.getElementById("deliveryFields");
  const summaryBox = document.getElementById("summary");

  // Toggle delivery address field
  form.mode.forEach(radio => {
    radio.addEventListener("change", e => {
      deliveryFields.style.display = e.target.value === "Delivery" ? "block" : "none";
    });
  });

  // Handle form submit
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const category = document.getElementById("category").value;
    const details = document.getElementById("details").value;
    const qty = document.getElementById("quantity").value;
    const mode = form.mode.value;
    const address = document.getElementById("address").value;
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const payment = document.getElementById("payment").value;

    let orderText = `Order: MAHALAXMI\nCustomer: ${name}\nPhone: ${phone}\nCategory: ${category}\nDetails: ${details}\nQty: ${qty}\nMode: ${mode}`;
    if (mode === "Delivery") orderText += `\nAddress: ${address}`;
    orderText += `\nPayment: ${payment}`;

    summaryBox.style.display = "block";
    summaryBox.textContent = orderText;

    if (payment === "COD (Cash on Delivery)") {
      const waUrl = "https://wa.me/919588675809?text=" + encodeURIComponent(orderText);
      window.open(waUrl, "_blank");
    } else if (payment === "Online (Razorpay)") {
      try {
        // call backend to create Razorpay order
        const createRes = await fetch("http://localhost:5000/create_order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 50000 }) // replace with calculated amount
        });
        const orderData = await createRes.json();

        const options = {
          key: "rzp_test_xxxxxxxx", // replace with real key
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Mahalaxmi Stationery",
          description: "Order Payment",
          order_id: orderData.id,
          handler: async function (response) {
            const verifyRes = await fetch("http://localhost:5000/verify_payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              const waUrl = "https://wa.me/919588675809?text=" + encodeURIComponent(orderText + `\nPayment ID: ${response.razorpay_payment_id}`);
              window.open(waUrl, "_blank");
            } else {
              alert("Payment verification failed. Please try again.");
            }
          },
          prefill: { name: name, contact: phone }
        };
        const rzp1 = new Razorpay(options);
        rzp1.open();
      } catch (err) {
        console.error("Razorpay error:", err);
        alert("Failed to initiate payment. Please try again later.");
      }
    }
  });
});
