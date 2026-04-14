const { db } = require('../src/config/firebaseAdmin');

async function setDeal() {
    try {
        const dealData = {
            productId: 'test-product-id', // Use a real ID if possible, but string is fine for schema check
            productTitle: "Forced Debug Deal",
            productImage: "https://via.placeholder.com/150",
            originalPrice: 1000,
            discountPrice: 500,
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            updatedAt: new Date().toISOString()
        };

        console.log("Force setting deal with data:", dealData);
        await db.collection('deals').doc('daily_deal').set(dealData);
        console.log("Deal force-set successfully.");
    } catch (error) {
        console.error("Error setting deal:", error);
    }
}

setDeal();

