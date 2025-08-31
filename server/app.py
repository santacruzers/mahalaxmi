# server/app.py (Flask backend for Razorpay integration)

from flask import Flask, request, jsonify
import razorpay, hmac, hashlib, os

app = Flask(__name__)

razorpay_client = razorpay.Client(auth=("rzp_test_xxxxxxxx", "xxxxxxxxxxxxxxxx"))  # replace with real credentials

@app.route("/create_order", methods=["POST"])
def create_order():
    data = request.get_json()
    amount = data.get("amount")
    try:
        order = razorpay_client.order.create({"amount": amount, "currency": "INR", "receipt": f"receipt_{os.urandom(4).hex()}"})
        return jsonify(order)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/verify_payment", methods=["POST"])
def verify_payment():
    data = request.get_json()
    order_id = data.get("order_id")
    payment_id = data.get("payment_id")
    signature = data.get("signature")

    generated_signature = hmac.new(
        b"xxxxxxxxxxxxxxxx",     # your Razorpay secret
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()

    if generated_signature == signature:
        return jsonify({"success": True, "message": "Payment verified successfully"})
    else:
        return jsonify({"success": False, "message": "Payment verification failed"}), 400

if __name__ == "__main__":
    app.run(port=5000)
