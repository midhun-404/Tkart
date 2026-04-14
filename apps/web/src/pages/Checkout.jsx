import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, CreditCard, Package, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

const InputField = ({ label, name, type = 'text', value, onChange, required, placeholder, pattern }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            pattern={pattern}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-gray-50/50"
        />
    </div>
);

const Checkout = () => {
    const { user, openLogin } = useAuth();
    const { cartItems, cartTotal, finalTotal, coupon, clearCart } = useCart();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [isSdkReady, setSdkReady] = useState(false);
    const [step, setStep] = useState(1); // 1: address, 2: payment

    const [formData, setFormData] = useState({
        name: user?.name || user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        paymentMethod: 'cod'
    });

    useEffect(() => {
        if (!user) {
            openLogin();
            navigate('/cart');
            return;
        }

        // Pre-fill saved address from Firestore
        const loadSavedAddress = async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    const data = snap.data();
                    const saved = data.savedAddress;
                    if (saved) {
                        setFormData(prev => ({
                            ...prev,
                            name: data.name || user.displayName || prev.name,
                            email: user.email || prev.email,
                            phone: saved.phone || prev.phone,
                            address: saved.address || prev.address,
                            city: saved.city || prev.city,
                            state: saved.state || prev.state,
                            zip: saved.postalCode || prev.zip,
                        }));
                    } else {
                        setFormData(prev => ({
                            ...prev,
                            name: data.name || user.displayName || prev.name,
                            email: user.email || prev.email,
                        }));
                    }
                }
            } catch (e) {
                console.error('Failed to load saved address:', e);
            }
        };
        loadSavedAddress();

        // Pre-load Razorpay SDK
        if (window.Razorpay) { setSdkReady(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => setSdkReady(true);
        script.onerror = () => setSdkReady(false);
        document.body.appendChild(script);
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const placeOrder = async (paymentDetails = {}) => {
        try {
            setLoading(true);
            const orderPayload = {
                orderItems: cartItems.map(item => ({
                    product: item.productId,
                    quantity: item.quantity,
                    price: item.selling_price || item.price,
                    title: item.title,
                    image: item.image
                })),
                shippingAddress: {
                    name: formData.name,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.zip,
                    phone: formData.phone,
                    country: 'India'
                },
                paymentMethod: formData.paymentMethod === 'razorpay' ? 'razorpay' : 'COD',
                couponCode: coupon?.code || null,
                user: user ? { id: user.uid, email: user.email, name: formData.name } : null,
                userName: formData.name,
                totalAmount: finalTotal,
                ...paymentDetails
            };

            const response = await api.post('/orders', orderPayload);

            if (response.status === 201) {
                await clearCart();
                const orderId = response.data?.order?.id || response.data?.orderId || response.data?._id || 'new';
                navigate(`/order-success/${orderId}`);
            } else {
                throw new Error(response.data.message || 'Order placement failed');
            }
        } catch (error) {
            console.error('Order Placement Failed:', error);
            const msg = error.response?.data?.message || error.message || 'Unknown Error';
            toast.error(`Order failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) { toast.warning('Your cart is empty!'); return; }

        if (formData.paymentMethod === 'razorpay') {
            try {
                if (!isSdkReady) {
                    toast.error('Razorpay SDK not loaded. Please check your internet connection.');
                    return;
                }
                if (!finalTotal || finalTotal <= 0) {
                    toast.error('Cannot place order with ₹0 total.');
                    return;
                }

                const orderRes = await api.post('/payment/create-order', { amount: finalTotal });
                const keyId = 'rzp_test_S8X93NUrtx5Pm3';
                const { id: order_id, amount, currency } = orderRes.data;
                if (!order_id) throw new Error('Backend failed to return Order ID');

                const options = {
                    key: keyId,
                    amount,
                    currency,
                    name: 'TrendKart',
                    description: 'Order Payment',
                    order_id,
                    handler: async (response) => {
                        try {
                            await api.post('/payment/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });
                            await placeOrder({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });
                        } catch (verifyError) {
                            console.error('Payment Verification Failed', verifyError);
                            toast.error('Payment verification failed. Contact support if money was deducted.');
                        }
                    },
                    prefill: { name: formData.name, email: formData.email, contact: formData.phone },
                    theme: { color: '#0F172A' },
                    modal: { ondismiss: () => console.log('Payment modal closed') }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.on('payment.failed', (response) => {
                    toast.error(`Payment failed: ${response.error.description || 'Unknown Error'}`);
                });
                paymentObject.open();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Unknown Error';
                toast.error(`Failed to initiate payment: ${errorMessage}`);
            }
        } else {
            await placeOrder();
        }
    };

    if (!user) return null;

    const shippingFee = finalTotal >= 999 ? 0 : 49;
    const grandTotal = finalTotal + shippingFee;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-primary">Checkout</h1>
                    <p className="text-gray-500 text-sm mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Left: Details */}
                        <div className="lg:w-3/5 space-y-6">

                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="text-accent" />
                                        <h2 className="font-bold text-primary">Delivery Address</h2>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Rahul Sharma" />
                                    <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" pattern="[0-9+\-\s]{10,14}" />
                                    <div className="sm:col-span-2">
                                        <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <InputField label="Street Address" name="address" value={formData.address} onChange={handleChange} required placeholder="House No, Street, Area" />
                                    </div>
                                    <InputField label="City" name="city" value={formData.city} onChange={handleChange} required placeholder="Mumbai" />
                                    <InputField label="State" name="state" value={formData.state} onChange={handleChange} required placeholder="Maharashtra" />
                                    <InputField label="PIN Code" name="zip" value={formData.zip} onChange={handleChange} required placeholder="400001" pattern="[0-9]{6}" />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={18} className="text-accent" />
                                        <h2 className="font-bold text-primary">Payment Method</h2>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'razorpay' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="razorpay" onChange={handleChange} checked={formData.paymentMethod === 'razorpay'} className="w-4 h-4 accent-primary" />
                                        <div className="flex-1">
                                            <span className="font-bold text-gray-800">Pay Online with Razorpay</span>
                                            <p className="text-xs text-gray-500 mt-0.5">Cards, UPI, Net Banking, Wallets</p>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Secure</span>
                                    </label>
                                    <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="cod" onChange={handleChange} checked={formData.paymentMethod === 'cod'} className="w-4 h-4 accent-primary" />
                                        <div className="flex-1">
                                            <span className="font-bold text-gray-800">Cash on Delivery</span>
                                            <p className="text-xs text-gray-500 mt-0.5">Pay when your order arrives</p>
                                        </div>
                                        <Package size={18} className="text-gray-400" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="lg:w-2/5">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-bold text-primary flex items-center gap-2">
                                        <Package size={18} className="text-accent" /> Order Summary
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {/* Items */}
                                    <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                                        {cartItems.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img src={item.image || 'https://placehold.co/48x56?text=P'} alt={item.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-bold text-primary flex-shrink-0">
                                                    ₹{((item.selling_price || item.price) * item.quantity).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        {coupon && (
                                            <div className="flex justify-between text-green-600 font-medium">
                                                <span>Discount ({coupon.code})</span>
                                                <span>-₹{(cartTotal - finalTotal).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                                                {shippingFee === 0 ? 'Free' : `₹${shippingFee}`}
                                            </span>
                                        </div>
                                        {shippingFee === 0 && (
                                            <p className="text-xs text-green-600">🎉 You qualify for free shipping!</p>
                                        )}
                                        <div className="flex justify-between text-base font-bold text-primary pt-3 border-t border-gray-200">
                                            <span>Grand Total</span>
                                            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || cartItems.length === 0}
                                        className={`mt-6 w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg
                                            ${loading || cartItems.length === 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-accent text-primary hover:bg-yellow-400 shadow-accent/20'
                                            }`}
                                    >
                                        {loading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                        ) : (
                                            <>Place Order <ChevronRight size={18} /></>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-gray-400 mt-3">
                                        🔒 Secured by industry-standard SSL encryption
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
