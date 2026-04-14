import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
    Settings, Save, Globe, CreditCard, Truck, Megaphone,
    ShieldAlert, Trash2, RefreshCw, CheckCircle, AlertTriangle,
    Store, Percent, Package, Info
} from 'lucide-react';

// Reusable section card
const Section = ({ icon: Icon, title, description, children, accent = 'indigo' }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-700',
        rose: 'bg-rose-50 text-rose-600',
    };
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 flex items-start gap-4">
                <div className={`p-2 rounded-xl ${colors[accent]} flex-shrink-0 mt-0.5`}>
                    <Icon size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                    {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

// Toggle switch
const Toggle = ({ checked, onChange, label, description }) => (
    <label className="flex items-start gap-4 cursor-pointer group py-1">
        <div className="relative mt-0.5 flex-shrink-0">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
            <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">{label}</p>
            {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
    </label>
);

// Input field
const Field = ({ label, description, ...props }) => (
    <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
        {description && <p className="text-xs text-gray-400 mb-2">{description}</p>}
        <input
            {...props}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder-gray-400"
        />
    </div>
);

// Toast notification
const Toast = ({ message, type }) => {
    if (!message) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-fade-in
            ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
            {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {message}
        </div>
    );
};

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const [settings, setSettings] = useState({
        // Store
        store_name: 'TrendKart',
        store_email: '',
        store_phone: '',
        store_address: '',
        // Announcement
        site_banner: '',
        // Financials
        tax_percentage: '0',
        shipping_charge: '0',
        free_shipping_above: '999',
        // Payments
        enable_cod: true,
        enable_online: true,
        // Features
        enable_reviews: true,
        enable_coupons: true,
        maintenance_mode: false,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'settings', 'global'));
                if (docSnap.exists()) {
                    setSettings(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'global'), {
                ...settings,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            showToast('Settings saved successfully!', 'success');
        } catch (err) {
            console.error('Save error:', err);
            showToast('Failed to save settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        const confirm1 = window.confirm('⚠️ WARNING: This will permanently delete ALL orders, products, users, and data. This cannot be undone. Are you absolutely sure?');
        if (!confirm1) return;
        const confirm2 = window.confirm('Final confirmation: Type-check — you are about to WIPE ALL DATA. Proceed?');
        if (!confirm2) return;

        setResetting(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
            const res = await fetch(`${API_URL}/admin/reset`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                showToast('All data has been wiped.', 'success');
            } else {
                showToast('Reset failed: ' + data.error, 'error');
            }
        } catch (err) {
            showToast('Reset failed. Server error.', 'error');
        } finally {
            setResetting(false);
        }
    };

    const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading configuration...</p>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSave} className="max-w-3xl space-y-6">
            <Toast message={toast.message} type={toast.type} />

            {/* Page Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings size={22} className="text-indigo-500" />
                        System Settings
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Configure your store settings and preferences</p>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200 hover:shadow-md disabled:opacity-60"
                >
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* 1. Store Identity */}
            <Section icon={Store} title="Store Identity" description="Basic information about your store" accent="indigo">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Store Name" value={settings.store_name}
                        onChange={e => set('store_name', e.target.value)}
                        placeholder="TrendKart" />
                    <Field label="Store Email" type="email" value={settings.store_email}
                        onChange={e => set('store_email', e.target.value)}
                        placeholder="support@trendkart.com" />
                    <Field label="Phone Number" value={settings.store_phone}
                        onChange={e => set('store_phone', e.target.value)}
                        placeholder="+91 98765 43210" />
                    <Field label="Store Address" value={settings.store_address}
                        onChange={e => set('store_address', e.target.value)}
                        placeholder="123 Main Street, City" />
                </div>
            </Section>

            {/* 2. Announcement Banner */}
            <Section icon={Megaphone} title="Announcement Banner" description="Show a message at the top of every page for your customers" accent="amber">
                <Field
                    label="Banner Text"
                    description="Leave empty to hide the banner."
                    value={settings.site_banner}
                    onChange={e => set('site_banner', e.target.value)}
                    placeholder="🎉 Season Sale — Up to 50% OFF! Use code SAVE20"
                />
                {settings.site_banner && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700 font-medium flex items-center gap-2">
                        <Info size={14} />
                        Preview: {settings.site_banner}
                    </div>
                )}
            </Section>

            {/* 3. Shipping & Tax */}
            <Section icon={Truck} title="Shipping & Tax" description="Manage delivery charges and tax configuration" accent="emerald">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="Tax Percentage (%)" type="number" min="0" max="100"
                        value={settings.tax_percentage}
                        onChange={e => set('tax_percentage', e.target.value)}
                        placeholder="0" />
                    <Field label="Shipping Charge (₹)" type="number" min="0"
                        value={settings.shipping_charge}
                        onChange={e => set('shipping_charge', e.target.value)}
                        placeholder="0" />
                    <Field label="Free Shipping Above (₹)" type="number" min="0"
                        description="Set to 0 to disable."
                        value={settings.free_shipping_above}
                        onChange={e => set('free_shipping_above', e.target.value)}
                        placeholder="999" />
                </div>
            </Section>

            {/* 4. Payment Methods */}
            <Section icon={CreditCard} title="Payment Methods" description="Control which payment options are available at checkout" accent="indigo">
                <div className="space-y-4">
                    <Toggle
                        checked={settings.enable_cod}
                        onChange={e => set('enable_cod', e.target.checked)}
                        label="Cash on Delivery (COD)"
                        description="Allow customers to pay when the order arrives."
                    />
                    <Toggle
                        checked={settings.enable_online}
                        onChange={e => set('enable_online', e.target.checked)}
                        label="Online Payment (Razorpay)"
                        description="Accept UPI, Cards, Net Banking via Razorpay."
                    />
                </div>
            </Section>

            {/* 5. Features */}
            <Section icon={Globe} title="Store Features" description="Enable or disable specific store features" accent="emerald">
                <div className="space-y-4">
                    <Toggle
                        checked={settings.enable_reviews}
                        onChange={e => set('enable_reviews', e.target.checked)}
                        label="Product Reviews"
                        description="Let customers submit star ratings and reviews on product pages."
                    />
                    <Toggle
                        checked={settings.enable_coupons}
                        onChange={e => set('enable_coupons', e.target.checked)}
                        label="Coupon Codes"
                        description="Allow customers to apply coupon codes at checkout."
                    />
                    <Toggle
                        checked={settings.maintenance_mode}
                        onChange={e => set('maintenance_mode', e.target.checked)}
                        label="Maintenance Mode"
                        description="Temporarily show a maintenance message to all visitors."
                    />
                </div>
            </Section>

            {/* Save button (bottom) */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-60">
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>

            {/* 6. Danger Zone */}
            <Section icon={ShieldAlert} title="Danger Zone" description="Irreversible actions — proceed with extreme caution" accent="rose">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-rose-700 text-sm">Wipe All Store Data</p>
                            <p className="text-xs text-rose-500 mt-1">
                                Permanently deletes ALL orders, users, products, and deals. This action cannot be undone.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={resetting}
                            className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-700 transition-all shadow-sm flex-shrink-0 disabled:opacity-60"
                        >
                            {resetting ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            {resetting ? 'Wiping...' : 'Wipe All Data'}
                        </button>
                    </div>
                </div>
            </Section>
        </form>
    );
};

export default AdminSettings;
