
const path = require('path');
// Load env before importing controller
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { createPaymentOrder } = require('../src/controllers/PaymentController');

const req = {
    body: {
        amount: 3999 // Matching user's amount
    }
};

const res = {
    status: function (code) {
        console.log(`[Response Status]: ${code}`);
        return this;
    },
    json: function (data) {
        console.log(`[Response JSON]:`, JSON.stringify(data, null, 2));
        return this;
    }
};

console.log("--- Starting Payment Controller Debug ---");
console.log("Checking Env Vars:");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "LOADED" : "MISSING");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "LOADED" : "MISSING");

(async () => {
    try {
        await createPaymentOrder(req, res);
    } catch (e) {
        console.error("CRITICAL: Uncaught Error calling controller:", e);
    }
})();

