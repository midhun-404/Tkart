import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Package, Truck, CheckCircle, CreditCard, ArrowLeft, Printer } from 'lucide-react';

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
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch order', error);
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handlePrintInvoice = () => {
        window.print();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <Package size={48} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">Order not found</h2>
            <Link to="/dashboard" className="mt-4 text-accent font-bold hover:underline">← Back to Orders</Link>
        </div>
    );

    // Tracking Logic
    const steps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
    const currentStep = steps.indexOf(order.order_status) !== -1 ? steps.indexOf(order.order_status) : 0;
    const isCancelled = order.order_status === 'Cancelled';

    return (
        <>
            {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-invoice, #printable-invoice * { visibility: visible; }
                    #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 no-print">
                        <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium">
                            <ArrowLeft size={20} /> Back to Orders
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 hidden sm:block">Order: #{order.id?.slice(0, 12).toUpperCase()}</span>
                            <button
                                onClick={handlePrintInvoice}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-white hover:border-primary hover:text-primary transition-all"
                            >
                                <Printer size={16} /> Print Invoice
                            </button>
                        </div>
                    </div>

                    {/* Printable Invoice Section */}
                    <div id="printable-invoice">
                        {/* Print Header */}
                        <div className="hidden print:block mb-8 pb-6 border-b-2 border-gray-300">
                            <h1 className="text-3xl font-bold">TRENDKART — Invoice</h1>
                            <p className="text-gray-500 mt-1">Order #{order.id} | {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'N/A'}</p>
                        </div>

                        {/* Order Status Tracking */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold font-serif mb-6 text-primary">Order Status</h2>

                            {isCancelled ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                                    <CheckCircle size={22} />
                                    <span className="font-bold">This order has been cancelled.</span>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Progress line */}
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 ml-0" style={{ height: '100%' }}></div>
                                    <div className="space-y-0">
                                        {steps.map((step, index) => {
                                            const isCompleted = index <= currentStep;
                                            const isCurrent = index === currentStep;
                                            return (
                                                <div key={step} className="flex items-start gap-4 pb-7 last:pb-0 relative">
                                                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
                                                        ${isCompleted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}
                                                        ${isCurrent ? 'ring-4 ring-green-100' : ''}
                                                    `}>
                                                        {isCompleted
                                                            ? <CheckCircle size={14} className="text-white" />
                                                            : <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                                                        }
                                                    </div>
                                                    <div className="mt-1">
                                                        <p className={`font-bold text-sm ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>{step}</p>
                                                        {isCurrent && (
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {step === 'Placed' && 'Your order has been placed successfully.'}
                                                                {step === 'Processing' && 'We are preparing your order.'}
                                                                {step === 'Shipped' && 'Your order is on its way!'}
                                                                {step === 'Delivered' && 'Your order has been delivered.'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left: Items + Address */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Delivery Address */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                                        <Truck size={18} className="text-gray-400" /> Delivery Address
                                    </h2>
                                    <div className="text-sm text-gray-600 space-y-1 pl-7">
                                        <p className="font-bold text-gray-800">{order.shipping_address?.name || order.user_name || 'Customer'}</p>
                                        <p>{order.shipping_address?.address}</p>
                                        <p>{order.shipping_address?.city}{order.shipping_address?.state ? `, ${order.shipping_address.state}` : ''} — {order.shipping_address?.postalCode}</p>
                                        <p>{order.shipping_address?.country || 'India'}</p>
                                        {order.shipping_address?.phone && (
                                            <p className="font-semibold mt-2">📞 {order.shipping_address.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                                        <Package size={18} className="text-gray-400" /> Items Ordered
                                    </h2>
                                    <div className="space-y-5">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                                                <div className="w-20 h-24 bg-gray-50 rounded-xl border overflow-hidden flex items-center justify-center flex-shrink-0">
                                                    <img
                                                        src={item.image || 'https://placehold.co/80x96?text=No+Img'}
                                                        alt={item.title}
                                                        className="max-w-full max-h-full object-cover"
                                                        onError={e => { e.target.src = 'https://placehold.co/80x96?text=No+Img'; }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link to={`/product/${item.product_id || item.product}`} className="font-bold text-primary hover:text-accent transition-colors text-sm line-clamp-2">
                                                        {item.title}
                                                    </Link>
                                                    <p className="text-xs text-gray-400 mt-1">Sold by: TrendKart Retail</p>
                                                    <p className="font-bold text-lg mt-2">₹{Number(item.price)?.toLocaleString('en-IN')}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-bold text-gray-600">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-bold text-primary mt-1">
                                                        Total: ₹{(Number(item.price) * item.quantity)?.toLocaleString('en-IN')}
                                                    </p>
                                                    {order.order_status === 'Delivered' && (
                                                        <span className="text-xs text-green-600 font-bold mt-1 block">✓ Delivered</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Payment & Summary */}
                            <div className="space-y-6">
                                {/* Payment Details */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                                        <CreditCard size={18} className="text-gray-400" /> Payment
                                    </h2>
                                    <div className="space-y-2.5 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Method</span>
                                            <span className="font-bold uppercase">{order.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status</span>
                                            <span className={`font-bold ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                                {order.payment_status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-dashed my-4"></div>

                                    <h3 className="font-bold mb-3 text-sm text-gray-800">Order Summary</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Items Total</span>
                                            <span>₹{(order.total_amount + (order.discount || 0))?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Delivery</span>
                                            <span className="text-green-600 font-medium">Free</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between text-accent font-bold">
                                                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                                                <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-base font-bold text-primary pt-3 border-t border-gray-200 mt-2">
                                            <span>Order Total</span>
                                            <span>₹{order.total_amount?.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Help */}
                                <div className="bg-white rounded-2xl shadow-sm p-6 text-center no-print">
                                    <p className="text-sm text-gray-500 mb-3">Need help with this order?</p>
                                    <Link to="/contact" className="text-accent font-bold hover:underline text-sm">Contact Support →</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderDetail;
