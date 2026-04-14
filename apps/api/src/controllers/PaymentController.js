const Razorpay = require('razorpay');
const crypto = require('crypto');

// --- STRICT RAZORPAY IMPLEMENTATION ---

const createPaymentOrder = async (req, res) => {
    try {
        console.log("Payment route hit"); // Debug confirmation
        const { amount } = req.body;
        console.log("Creating Razorpay Order. Amount:", amount);

        // 1. Validation
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount. Must be greater than 0." });
        }

        // 2. Load Keys from Environment
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // 3. Strict Key Validation
        if (!keyId || !keySecret) {
            console.error("FATAL: Razorpay keys missing in .env");
            return res.status(500).json({
                message: "Server Configuration Error: Payment Gateway Keys Missing."
            });
        }

        console.log("Using Razorpay Key ID:", keyId); // Do not log Secret

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });

        // 4. Create Order
        const options = {
            amount: Math.round(amount * 100), // amount in paise (100 paise = 1 INR)
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // 5. Return Success Response
        console.log("Razorpay Order Created:", order.id);
        res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: keyId // Frontend needs this to open modal
        });

    } catch (error) {
        // 6. Detailed Error Logging
        console.error("Razorpay Create Order Error [STACK]:", error.stack);
        console.error("Razorpay Create Order Error [MSG]:", error);

        res.status(500).json({
            message: "Payment Initiation Failed",
            error: error.message || "Unknown Razorpay Error",
            tip: "Check server logs for details."
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) {
            return res.status(500).json({ message: "Server Error: Missing Secret for Verification" });
        }

        const expectedSign = crypto
            .createHmac("sha256", secret)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            console.error("Signature Mismatch:", { expected: expectedSign, received: razorpay_signature });
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { createPaymentOrder, verifyPayment };
