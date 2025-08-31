// server/app.js (Node.js Express backend for Razorpay integration)

const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const razorpay = new Razorpay({
  key_id: "rzp_test_xxxxxxxx",       // replace with real key_id
  key_secret: "xxxxxxxxxxxxxxxx",    // replace with real key_secret
});

// Create order endpoint
app.post("/create_order", async (req, res) => {
  try {
    const { amount } = req.body; // amount in paise
    const options = {
      amount: amount,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order", details: err });
  }
});

// Verify payment endpoint
app.post("/verify_payment", (req, res) => {
  const { order_id, payment_id, signature } = req.body;
  const generated_signature = crypto
    .createHmac("sha256", razorpay.key_secret)
    .update(order_id + "|" + payment_id)
    .digest("hex");

  if (generated_signature === signature) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mahalaxmi Razorpay server running on port ${PORT}`);
});
