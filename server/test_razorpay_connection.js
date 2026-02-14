require('dotenv').config();
const Razorpay = require('razorpay');

console.log("Testing Razorpay Connection...");
console.log("Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("Key Secret Length:", process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.length : 0);

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("ERROR: Missing Keys in .env");
    process.exit(1);
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function testOrder() {
    try {
        const options = {
            amount: 50000, // 500 INR
            currency: "INR",
            receipt: "test_receipt_001"
        };
        console.log("Attempting to create order with options:", options);
        const order = await razorpay.orders.create(options);
        console.log("SUCCESS! Order Created:", order);
    } catch (error) {
        console.error("FAILURE! Razorpay Error:", error);
    }
}

testOrder();
