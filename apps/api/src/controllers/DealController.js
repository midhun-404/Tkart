const { db } = require('../config/firebaseAdmin');

// Set or Update the Deal of the Day
const setDeal = async (req, res) => {
    try {
        console.log("Setting Deal of the Day. Body:", req.body);
        const productId = req.body.productId || req.body.product_id;
        const discountPrice = req.body.discountPrice || req.body.discount_price;
        const endTime = req.body.endTime || req.body.end_time;

        if (!productId || !discountPrice || !endTime) {
            console.error("Missing required fields");
            return res.status(400).json({ message: "Product ID, Discount Price, and End Time are required." });
        }

        console.log(`Fetching product: ${productId}`);
        // Fetch product details to ensure it exists and store snapshot
        const productRef = db.collection('products').doc(productId);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            console.error("Product not found in database");
            return res.status(404).json({ message: "Product not found." });
        }

        const productData = productSnap.data();
        console.log("Product found:", productData.title);

        const dealData = {
            productId,
            product_id: productId,
            productTitle: productData.title || "Unknown Product",
            title: productData.title || "Unknown Product",
            productImage: productData.images?.[0] || '',
            image: productData.images?.[0] || '',
            originalPrice: Number(productData.selling_price || productData.price || 0),
            original_price: Number(productData.selling_price || productData.price || 0),
            discountPrice: Number(discountPrice),
            discount_price: Number(discountPrice),
            endTime, // ISO String expected
            end_time: endTime,
            updatedAt: new Date().toISOString()
        };

        console.log("Saving deal data:", dealData);
        // We use a fixed ID 'daily_deal' to easily overwrite/fetch the single active deal
        await db.collection('deals').doc('daily_deal').set(dealData);
        console.log("Deal saved successfully");

        res.status(200).json({ message: "Deal of the Day set successfully.", deal: dealData });
    } catch (error) {
        console.error("Error setting deal logic:", error);
        res.status(500).json({ message: "Failed to set deal. Server Error: " + error.message });
    }
};

// Get the Active Deal
const getActiveDeal = async (req, res) => {
    try {
        const dealDoc = await db.collection('deals').doc('daily_deal').get();

        if (!dealDoc.exists) {
            return res.status(200).json(null); // No deal set
        }

        const dealData = dealDoc.data();
        const now = new Date();
        const end = new Date(dealData.endTime || dealData.end_time);

        console.log(`[DEBUG] Check Active Deal: Now=${now.toISOString()}, End=${end.toISOString()}, Expired=${now > end}`);

        // Check if expired - REMOVED to allow Admin to see it. Frontend handles visibility.
        // if (now > end) {
        //     return res.status(200).json(null);
        // }

        // Add isExpired flag for convenience
        const isExpired = now > end;
        console.log(`[DEBUG] Sending deal data (Expired: ${isExpired})`);
        res.status(200).json({ ...dealData, isExpired });
    } catch (error) {
        console.error("Error fetching deal:", error);
        res.status(500).json({ message: "Failed to fetch deal." });
    }
};

// Remove Deal (Optional, for Admin to clear it manually)
const removeDeal = async (req, res) => {
    try {
        await db.collection('deals').doc('daily_deal').delete();
        res.status(200).json({ message: "Deal removed successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove deal." });
    }
}

module.exports = { setDeal, getActiveDeal, removeDeal };
