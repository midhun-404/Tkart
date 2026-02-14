const { db } = require('../config/firebaseAdmin');

const getSettings = async (req, res) => {
    try {
        const doc = await db.collection('settings').doc('general').get();
        if (!doc.exists) {
            return res.json({});
        }
        res.json(doc.data());
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ message: "Failed to fetch settings" });
    }
};

const updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        // set with merge: true updates existing fields and adds new ones
        await db.collection('settings').doc('general').set(settings, { merge: true });
        res.json({ message: "Settings updated successfully" });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Failed to update settings" });
    }
};

module.exports = { getSettings, updateSettings };
