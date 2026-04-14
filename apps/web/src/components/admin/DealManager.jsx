import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import axios from 'axios';
import { Timer, Save, Trash2, Search } from 'lucide-react';

const DealManager = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [endTime, setEndTime] = useState('');
    const [currentDeal, setCurrentDeal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debugInfo, setDebugInfo] = useState(null); // Debug state

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

    useEffect(() => {
        fetchProducts();
        fetchCurrentDeal();
    }, []);

    const fetchProducts = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'products'));
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchCurrentDeal = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/deals`);
            setCurrentDeal(data);
            if (data) {
                // Pre-fill form if editing
                setSelectedProduct(data.productId);
                setDiscountPrice(data.discountPrice);
                // HTML datetime-local needs YYYY-MM-DDTHH:MM format
                const endDateStr = data.end_time || data.endTime;
                if (endDateStr) {
                    const date = new Date(endDateStr);
                    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                    setEndTime(date.toISOString().slice(0, 16));
                }
            }
        } catch (error) {
            console.error("Error fetching deal:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Get user token (assuming stored in localStorage from auth flow)
        const token = localStorage.getItem('token');

        try {
            await axios.post(
                `${API_URL}/deals`,
                {
                    product_id: selectedProduct,
                    discount_price: discountPrice,
                    end_time: new Date(endTime).toISOString(),
                    title: filteredProducts.find(p => p.id === selectedProduct)?.title || 'Deal',
                    image: filteredProducts.find(p => p.id === selectedProduct)?.images?.[0] || ''
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            alert("Deal updated successfully!");
            fetchCurrentDeal();
        } catch (error) {
            console.error("Error saving deal:", error);
            const msg = error.response?.data?.message || "Failed to save deal.";
            setDebugInfo({ message: msg });
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!window.confirm("Are you sure you want to remove the current deal?")) return;
        if (!currentDeal || !currentDeal.id) return;

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/deals/${currentDeal.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentDeal(null);
            setSelectedProduct('');
            setDiscountPrice('');
            setEndTime('');
            alert("Deal removed.");
        } catch (error) {
            console.error("Error removing deal:", error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
                <Timer className="text-accent" /> Deal of the Day
            </h2>

            {currentDeal && (
                <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <h3 className="font-bold text-green-800 mb-2">Active Deal</h3>
                    <div className="flex items-center gap-4">
                        <img src={currentDeal.image} alt="" className="w-16 h-16 object-cover rounded" />
                        <div>
                            <p className="font-bold">{currentDeal.title}</p>
                            <p className="text-sm">Ends: {new Date(currentDeal.end_time).toLocaleString()}</p>
                            <p className="text-sm font-bold text-primary">Price: ₹{currentDeal.discount_price}</p>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="ml-auto px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm font-bold"
                            title="Remove Deal"
                        >
                            <Trash2 size={16} /> Remove Deal
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Selection */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Product</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        required
                    >
                        <option value="">-- Choose a Product --</option>
                        {filteredProducts.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.title} (₹{p.selling_price})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Discount Price (₹)</label>
                        <input
                            type="number"
                            value={discountPrice}
                            onChange={(e) => setDiscountPrice(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">End Time</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? 'Saving...' : <><Save size={18} /> Set Deal</>}
                </button>
            </form>

            {/* Debug Info Panel */}
            {debugInfo && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded text-xs overflow-auto">
                    <h4 className="font-bold text-red-800 mb-2">Debug Information</h4>
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default DealManager;
