import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, ArrowRight, Home, Clock } from 'lucide-react';
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const OrderSuccess = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id || id === 'new') { setLoading(false); return; }
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (e) {
                console.error('Failed to fetch order:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const estimatedDelivery = () => {
        const d = new Date();
        d.setDate(d.getDate() + 5);
        return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
            <div className="max-w-lg w-full">
                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Green Header */}
                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-10 text-white text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold font-serif mb-1">Order Placed!</h1>
                        <p className="text-green-100 text-sm">Thank you for shopping with TrendKart 🎉</p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Order ID */}
                        {id && id !== 'new' && (
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Order ID</p>
                                    <p className="font-mono font-bold text-gray-800 mt-0.5">#{id.slice(0, 12).toUpperCase()}</p>
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase">Confirmed</span>
                            </div>
                        )}

                        {/* Delivery Info */}
                        <div className="space-y-3">
                            {order?.shippingAddress && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                    <Truck size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Shipping to</p>
                                        <p className="text-sm text-gray-600">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                                <Clock size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Estimated Delivery</p>
                                    <p className="text-sm text-gray-600">{estimatedDelivery()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Preview */}
                        {order?.items && order.items.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</p>
                                <div className="space-y-2">
                                    {order.items.slice(0, 3).map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                <img src={item.image || 'https://placehold.co/40?text=P'} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="flex-1 truncate text-gray-700">{item.title}</span>
                                            <span className="font-medium text-gray-800">× {item.quantity}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <p className="text-xs text-gray-400 pl-13">+{order.items.length - 3} more item(s)</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Total */}
                        {(order?.total_amount || order?.totalAmount) && (
                            <div className="flex justify-between items-center py-3 border-t border-gray-100">
                                <span className="font-bold text-gray-700">Order Total</span>
                                <span className="text-xl font-bold text-primary">₹{(order.total_amount || order.totalAmount)?.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {id && id !== 'new' && (
                                <Link
                                    to={`/account/orders/${id}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm"
                                >
                                    <Package size={16} /> Track Order
                                </Link>
                            )}
                            <Link
                                to="/"
                                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-primary hover:text-primary transition-all text-sm"
                            >
                                <Home size={16} /> Continue Shopping
                            </Link>
                        </div>

                        <p className="text-center text-xs text-gray-400">
                            A confirmation email has been sent to your registered email address.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
