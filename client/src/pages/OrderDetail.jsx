import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Package, Truck, CheckCircle, MapPin, CreditCard, ArrowLeft, Download } from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("Order not found");
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch order", error);
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!order) return <div className="p-8 text-center">Order not found.</div>;

    // Tracking Logic
    const steps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
    const currentStep = steps.indexOf(order.order_status) !== -1 ? steps.indexOf(order.order_status) : 0;
    const isCancelled = order.order_status === 'Cancelled';

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-primary transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Back to Orders
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Order ID: {order.id}</span>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                            <Download size={16} /> Invoice
                        </button>
                    </div>
                </div>

                {/* Tracking Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold font-serif mb-6 text-primary">Order Status</h2>

                    {isCancelled ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-3">
                            <CheckCircle size={24} />
                            <span className="font-bold">This order has been cancelled.</span>
                        </div>
                    ) : (
                        <div className="relative flex items-center justify-between w-full">
                            {/* Progress Bar Line */}
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-0"></div>
                            <div
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 -z-0"
                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {/* Steps */}
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 
                                            ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                                            ${isCurrent ? 'ring-4 ring-green-100' : ''}
                                        `}>
                                            {isCompleted ? <CheckCircle size={14} /> : index + 1}
                                        </div>
                                        <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Items & Address */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Shipping */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                                <Truck size={20} className="text-gray-400" /> Delivery Address
                            </h2>
                            <div className="pl-7">
                                <h3 className="font-bold text-primary">{order.user_name || 'User'}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mt-1">
                                    {order.shipping_address?.address},<br />
                                    {order.shipping_address?.city} - {order.shipping_address?.postalCode},<br />
                                    {order.shipping_address?.country}
                                </p>
                                <p className="text-sm font-bold mt-2 text-gray-800">
                                    Phone: {order.shipping_address?.phone || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                                <Package size={20} className="text-gray-400" /> Items
                            </h2>
                            <div className="space-y-6">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                        <div className="w-20 h-24 bg-gray-50 rounded border flex items-center justify-center overflow-hidden">
                                            <img src={item.image || 'https://placehold.co/100?text=No+Img'} alt={item.title} className="max-w-full max-h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <Link to={`/product/${item.product_id}`} className="font-bold text-primary hover:text-accent transition-colors line-clamp-2">
                                                {item.title}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-1">Seller: TrendKart Retail</p>
                                            <p className="font-bold text-lg mt-2">₹{item.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm text-green-600 mt-1">Offers Applied</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Price Details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                                <CreditCard size={20} className="text-gray-400" /> Payment
                            </h2>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Payment Method</span>
                                    <span className="font-bold uppercase">{order.payment_method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Payment Status</span>
                                    <span className={`font-bold ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-dashed my-4"></div>

                            <h3 className="font-bold mb-3 text-gray-800">Order Summary</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Items Total</span>
                                    <span>₹{order.total_amount + (order.discount || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-accent font-bold">
                                        <span>Discount</span>
                                        <span>-₹{order.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-primary pt-3 border-t">
                                    <span>Order Total</span>
                                    <span>₹{order.total_amount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Help */}
                        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                            <p className="text-sm text-gray-500 mb-4">Need help with this order?</p>
                            <button className="text-accent font-bold hover:underline">Contact Support</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
