
const Razorpay = require('razorpay');

require('dotenv').config({ path: './server/.env' }); // Adjust path if needed

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log("Testing Hardcoded Keys...");
console.log("Key ID:", keyId);

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
});

async function testOrder() {
    try {
        const options = {
            amount: 50000, // 500 INR
            currency: "INR",
            receipt: "test_receipt_" + Date.now()
        };
        console.log("Attempting to create order...");
        const order = await razorpay.orders.create(options);
        console.log("SUCCESS! Order Created:", order);
    } catch (error) {
        console.error("FAILURE! Razorpay Error:", error);
    }
}

testOrder();
