const { db } = require('../src/config/firebaseAdmin');

async function inspectDeal() {
    try {
        console.log("Inspecting 'deals/daily_deal'...");
        const doc = await db.collection('deals').doc('daily_deal').get();
        if (doc.exists) {
            console.log("Deal Found:", JSON.stringify(doc.data(), null, 2));
            const now = new Date();
            const end = new Date(doc.data().endTime);
            console.log(`Time Check: Now=${now.toISOString()}, End=${end.toISOString()}`);
            console.log(`Expired? ${now > end}`);
            if (now > end) console.log("EXPIRED! This is why API returns null.");
        } else {
            console.log("Deal Document NOT Found.");
        }
    } catch (error) {
        console.error("Error inspecting deal:", error);
    }
}

inspectDeal();

