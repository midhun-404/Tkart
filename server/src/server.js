const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('./app');


const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Environment loaded.");
    console.log("Razorpay Key ID Present:", process.env.RAZORPAY_KEY_ID ? "YES" : "NO");
});
