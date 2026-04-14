import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Trash, Plus, Tag, Wifi } from 'lucide-react';

const AdminCouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discount_percentage: '',
        expiry_date: '',
        usage_limit: ''
    });

    // ── Real-time listener ─────────────────────────────────────────────────────
    useEffect(() => {
        const q = query(collection(db, 'coupons'), orderBy('code'));
        const unsub = onSnapshot(q, (snap) => {
            setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLastUpdated(new Date());
            setLoading(false);
        }, err => {
            console.error('Coupons listener:', err);
            setLoading(false);
        });
        return unsub;
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'coupons'), {
                ...formData,
                code: formData.code.toUpperCase().trim(),
                discount_percentage: Number(formData.discount_percentage),
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
                usage_count: 0,
                createdAt: new Date().toISOString()
            });
            setFormData({ code: '', discount_percentage: '', expiry_date: '', usage_limit: '' });
            // onSnapshot auto-refreshes the list
        } catch (error) {
            console.error('Create Coupon Error', error);
            alert('Failed to create coupon');
        }
    };

    const deleteCoupon = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        try {
            await deleteDoc(doc(db, 'coupons', id));
            // onSnapshot auto-refreshes
        } catch (error) {
            console.error('Delete Coupon Error', error);
            alert('Failed to delete');
        }
    };

    const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-serif text-slate-800">Coupon Management</h1>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                    <Wifi size={14} className="animate-pulse" /> LIVE
                    {lastUpdated && <span className="text-gray-400 font-normal">· {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
                </div>
            </div>

            {/* Create Form */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={18} /> Create New Coupon</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Code</label>
                            <input name="code" placeholder="e.g. SAVE20" value={formData.code}
                                onChange={handleChange}
                                className="w-full border border-gray-200 p-2.5 rounded-lg uppercase text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Discount %</label>
                            <input name="discount_percentage" type="number" min="1" max="100" placeholder="e.g. 20"
                                value={formData.discount_percentage} onChange={handleChange}
                                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Expiry Date</label>
                            <input name="expiry_date" type="date" value={formData.expiry_date}
                                onChange={handleChange}
                                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Usage Limit (optional)</label>
                            <input name="usage_limit" type="number" min="1" placeholder="Unlimited"
                                value={formData.usage_limit} onChange={handleChange}
                                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                        </div>
                    </div>
                    <button type="submit"
                        className="mt-4 bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors text-sm">
                        Create Coupon
                    </button>
                </form>
            </div>

            {/* Coupons List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="p-4">Code</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4">Expiry</th>
                                <th className="p-4">Usage</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center"><div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                            ) : coupons.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No coupons yet. Create one above.</td></tr>
                            ) : (
                                coupons.map(coupon => (
                                    <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <span className="font-bold text-accent font-mono bg-accent/10 px-2 py-1 rounded text-sm">{coupon.code}</span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">{coupon.discount_percentage}% OFF</td>
                                        <td className="p-4">
                                            <span className={isExpired(coupon.expiry_date) ? 'text-red-500 line-through' : 'text-gray-700'}>
                                                {new Date(coupon.expiry_date).toLocaleDateString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">{coupon.usage_count || 0} / {coupon.usage_limit || '∞'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${isExpired(coupon.expiry_date) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                                {isExpired(coupon.expiry_date) ? 'Expired' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => deleteCoupon(coupon.id)}
                                                className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCouponManager;
