
const Razorpay = require('razorpay');

// --- COPIED FROM PaymentController.js ---

const createPaymentOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        console.log("Creating Razorpay Order. Amount:", amount);

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        // --- HARDCODED KEYS DIRECT (STRICT) ---
        const keyId = "rzp_test_S8X93NUrtx5Pm3";
        const keySecret = "1AswCsLr08PGbb506gnmvoJz";

        console.log("Using Razorpay Key:", keyId);

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });

        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Return key_id so frontend uses the same one
        res.json({ ...order, key: keyId });
    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        res.status(500).json({
            message: "Payment Initiation Failed",
            error: error.message,
            tip: "Check Razorpay dashboard for API key validity"
        });
    }
};

// --- END COPY ---

const req = {
    body: { amount: 500 } // 500 INR
};

const res = {
    json: (data) => console.log("SUCCESS JSON:", data),
    status: (code) => {
        console.log("STATUS:", code);
        return {
            json: (data) => console.log("ERROR JSON:", data)
        };
    }
};

console.log("Simulating createPaymentOrder logic locally...");
createPaymentOrder(req, res);
