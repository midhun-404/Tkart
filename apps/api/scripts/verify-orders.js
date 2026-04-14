const { db } = require('../src/config/firebaseAdmin');

async function verifyOrders() {
    try {
        console.log("Fetching last 5 orders...");
        const snapshot = await db.collection('orders')
            .orderBy('created_at', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            console.log("No orders found with 'created_at'. Trying 'createdAt'...");
            const snapshot2 = await db.collection('orders')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            if (snapshot2.empty) {
                console.log("No orders found with 'createdAt' either.");
                // Fetch *any* order to see fields
                const anySnap = await db.collection('orders').limit(1).get();
                if (!anySnap.empty) {
                    console.log("Sample Order Fields:", Object.keys(anySnap.docs[0].data()));
                    console.log("Sample Data:", anySnap.docs[0].data());
                }
            } else {
                console.log(`Found ${snapshot2.size} orders with 'createdAt'.`);
                snapshot2.docs.forEach(doc => {
                    console.log(`ID: ${doc.id}, UserID: ${doc.data().user_id}, Date: ${doc.data().createdAt}, Status: ${doc.data().order_status}`);
                });
            }
        } else {
            console.log(`Found ${snapshot.size} orders with 'created_at'.`);
            snapshot.docs.forEach(doc => {
                console.log(JSON.stringify({ id: doc.id, ...doc.data() }, null, 2));
            });
        }

    } catch (error) {
        console.error("Error verifying orders:", error);
    }
}

verifyOrders();

