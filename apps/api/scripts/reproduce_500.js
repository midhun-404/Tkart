
const { createPaymentOrder } = require('../src/controllers/PaymentController');

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

console.log("Simulating createPaymentOrder...");
createPaymentOrder(req, res);

