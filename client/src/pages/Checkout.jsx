import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { db } from '../firebaseConfig';
import { collection, addDoc, runTransaction, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { user, openLogin } = useAuth();
    const { cartItems, cartTotal, finalTotal, coupon, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address: '',
        city: '',
        zip: '',
        paymentMethod: 'cod'
    });

    const [isSdkReady, setSdkReady] = useState(false);

    useEffect(() => {
        if (!user) {
            openLogin();
            navigate('/cart');
            return;
        }

        // Pre-load Razorpay SDK
        const loadRazorpayInfo = async () => {
            if (window.Razorpay) {
                setSdkReady(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => setSdkReady(true);
            script.onerror = () => {
                console.error("Razorpay SDK failed to load");
                setSdkReady(false);
            };
            document.body.appendChild(script);
        };
        loadRazorpayInfo();

    }, [user, navigate, openLogin]);

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
                    price: item.price,
                    title: item.title,
                    image: item.image
                })),
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.zip,
                    country: 'India'
                },
                paymentMethod: formData.paymentMethod === 'razorpay' ? 'razorpay' : 'COD',
                couponCode: coupon?.code || null,
                userName: formData.name, // Pass user details if not fully in req.user
                ...paymentDetails // razorpay_order_id, razorpay_payment_id, etc.
            };

            // Call Backend API
            const response = await api.post('/orders', orderPayload); // POST /api/orders

            if (response.status === 201) {
                await clearCart();
                alert('Order Placed Successfully!');
                navigate('/dashboard');
            } else {
                throw new Error(response.data.message || 'Order placement failed');
            }

        } catch (error) {
            console.error("Order Placement Failed:", error);
            const msg = error.response?.data?.message || error.message || "Unknown Error";
            alert(`Order Failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        if (formData.paymentMethod === 'razorpay') {
            try {
                if (!isSdkReady) {
                    alert('Razorpay SDK is not loaded. Please check your internet connection or refresh the page.');
                    return;
                }

                if (!finalTotal || finalTotal <= 0) {
                    alert("Cannot place order with ₹0 total.");
                    return;
                }

                // 1. Create Razorpay Order (Backend)
                console.log("Initiating payment for amount:", finalTotal);
                const orderRes = await api.post('/payment/create-order', { amount: finalTotal });
                console.log("Order Response:", orderRes.data);

                // Use key directly to ensure loading
                const keyId = "rzp_test_S8X93NUrtx5Pm3";
                const { id: order_id, amount, currency } = orderRes.data;

                if (!order_id) {
                    throw new Error("Backend failed to return Order ID");
                }

                const options = {
                    key: keyId,
                    amount: amount,
                    currency: currency,
                    name: "TrendKart",
                    description: "Order Payment",
                    order_id: order_id,
                    handler: async function (response) {
                        try {
                            console.log("Payment Success. Verifying...", response);
                            // 2. Verify Payment (Backend)
                            await api.post('/payment/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            // 3. Save Order (Backend)
                            await placeOrder({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });
                        } catch (verifyError) {
                            console.error("Payment Verification Failed", verifyError);
                            alert("Payment verification failed. Please contact support if money was deducted.");
                        }
                    },
                    prefill: {
                        name: formData.name,
                        email: formData.email
                    },
                    theme: { color: "#0F172A" },
                    modal: {
                        ondismiss: function () {
                            console.log('Payment modal closed');
                        }
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.on('payment.failed', function (response) {
                    alert(`Payment Failed: ${response.error.description || "Unknown Error"}`);
                    console.error("Razorpay Payment Failed:", response.error);
                });
                paymentObject.open();

            } catch (error) {
                console.error("Payment Initiation Error:", error);
                const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Unknown Error";
                alert(`Failed to initiate payment: ${errorMessage}. Check console for details.`);
            }
        } else {
            // COD
            // COD
            await placeOrder();
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-8">Checkout</h1>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
                {/* Shipping Details */}
                <div className="lg:w-2/3 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold font-serif mb-6">Shipping Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded px-3 py-2 outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded px-3 py-2 outline-none" required />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-bold">Address</label>
                            <input type="text" name="address" onChange={handleChange} className="w-full border rounded px-3 py-2 outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">City</label>
                            <input type="text" name="city" onChange={handleChange} className="w-full border rounded px-3 py-2 outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">ZIP Code</label>
                            <input type="text" name="zip" onChange={handleChange} className="w-full border rounded px-3 py-2 outline-none" required />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold font-serif mb-4 mt-8">Payment Method</h2>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="paymentMethod" value="razorpay" onChange={handleChange} checked={formData.paymentMethod === 'razorpay'} className="text-primary" />
                            <span className="font-bold">Pay with Razorpay (Secure)</span>
                        </label>
                        <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="paymentMethod" value="cod" onChange={handleChange} checked={formData.paymentMethod === 'cod'} className="text-primary" />
                            <span className="font-bold">Cash on Delivery</span>
                        </label>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold font-serif mb-4">Your Order</h2>
                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            {coupon && (
                                <div className="flex justify-between text-accent">
                                    <span>Discount</span>
                                    <span>-₹{(cartTotal - finalTotal).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-primary pt-2 border-t">
                                <span>Total</span>
                                <span>₹{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-accent text-primary py-3 rounded font-bold hover:bg-yellow-400 transition-colors shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
