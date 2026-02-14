import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Settings } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        site_banner: '',
        tax_percentage: '0',
        shipping_charge: '0',
        enable_cod: 'true'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const docRef = doc(db, 'settings', 'global');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(prev => ({ ...prev, ...docSnap.data() }));
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch settings", error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const docRef = doc(db, 'settings', 'global');
            await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
            alert("Settings Saved Successfully!");
        } catch (error) {
            console.error("Save Settings Error:", error);
            alert("Failed to save settings");
        }
    };

    if (loading) return <div>Loading Settings...</div>;

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold font-serif text-charcoal mb-6 flex items-center gap-2">
                <Settings className="text-primary" /> System Configuration
            </h1>

            <div className="bg-white rounded-lg shadow-sm p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Banner */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Site Banner Text</label>
                        <p className="text-xs text-gray-400 mb-2">Display a message at the top of the site (e.g., "Season Sale 50% Off")</p>
                        <input
                            name="site_banner"
                            value={settings.site_banner}
                            onChange={handleChange}
                            className="w-full border p-3 rounded focus:ring-2 focus:ring-accent"
                            placeholder="Enter banner text..."
                        />
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tax Percentage (%)</label>
                            <input
                                name="tax_percentage"
                                type="number"
                                value={settings.tax_percentage}
                                onChange={handleChange}
                                className="w-full border p-3 rounded focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Shipping Charge (₹)</label>
                            <input
                                name="shipping_charge"
                                type="number"
                                value={settings.shipping_charge}
                                onChange={handleChange}
                                className="w-full border p-3 rounded focus:ring-2 focus:ring-accent"
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Payment Options</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="enable_cod"
                                checked={settings.enable_cod === 'true'}
                                onChange={(e) => setSettings({ ...settings, enable_cod: e.target.checked.toString() })}
                                className="w-5 h-5 text-accent"
                            />
                            <span>Enable Cash on Delivery (COD)</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> Save Configuration
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
