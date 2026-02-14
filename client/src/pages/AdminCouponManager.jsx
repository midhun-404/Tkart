import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Trash, Plus, Tag } from 'lucide-react';

const AdminCouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [formData, setFormData] = useState({
        code: '',
        discount_percentage: '',
        expiry_date: '',
        usage_limit: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const querySnapshot = await getDocs(query(collection(db, 'coupons'), orderBy('code')));
            setCoupons(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                discount_percentage: Number(formData.discount_percentage),
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
                usage_count: 0,
                createdAt: new Date().toISOString()
            };
            await addDoc(collection(db, 'coupons'), payload);
            fetchCoupons();
            setFormData({ code: '', discount_percentage: '', expiry_date: '', usage_limit: '' });
        } catch (error) {
            console.error("Create Coupon Error", error);
            alert('Failed to create coupon');
        }
    };

    const deleteCoupon = async (id) => {
        if (window.confirm('Delete this coupon?')) {
            try {
                await deleteDoc(doc(db, 'coupons', id));
                fetchCoupons();
            } catch (error) {
                console.error("Delete Coupon Error", error);
                alert('Failed to delete');
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold font-serif text-primary mb-6">Coupon Management</h2>

            {/* Create Form */}
            <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18} /> Create New Coupon</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        name="code"
                        placeholder="Code (e.g., SAVE10)"
                        value={formData.code}
                        onChange={handleChange}
                        className="border p-2 rounded uppercase"
                        required
                    />
                    <input
                        name="discount_percentage"
                        type="number"
                        placeholder="Discount %"
                        value={formData.discount_percentage}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        name="expiry_date"
                        type="date"
                        value={formData.expiry_date}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        name="usage_limit"
                        type="number"
                        placeholder="Limit (Optional)"
                        value={formData.usage_limit}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                </div>
                <button type="submit" className="mt-4 bg-primary text-white px-6 py-2 rounded hover:bg-emerald-800 transition-colors">
                    Create Coupon
                </button>
            </form>

            {/* Coupons List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3">Code</th>
                            <th className="p-3">Discount</th>
                            <th className="p-3">Expiry</th>
                            <th className="p-3">Usage</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(coupon => (
                            <tr key={coupon.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="p-3 font-bold text-accent font-mono">{coupon.code}</td>
                                <td className="p-3">{coupon.discount_percentage}%</td>
                                <td className="p-3">{new Date(coupon.expiry_date).toLocaleDateString()}</td>
                                <td className="p-3">{coupon.usage_count} / {coupon.usage_limit || '∞'}</td>
                                <td className="p-3">
                                    <button onClick={() => deleteCoupon(coupon.id)} className="text-red-500 hover:text-red-700">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCouponManager;
