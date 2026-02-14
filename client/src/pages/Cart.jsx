import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartProvider';
import { useAuth } from '../context/AuthProvider';

const Cart = () => {
    const { cartItems, cartTotal, finalTotal, updateQuantity, removeFromCart, applyCoupon, coupon, removeCoupon } = useCart();
    const { user, openLogin } = useAuth();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');

    const handleCheckout = () => {
        if (!user) {
            openLogin();
        } else {
            navigate('/checkout');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        const res = await applyCoupon(couponCode);
        if (!res.success) {
            alert(res.message);
        } else {
            setCouponCode('');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 bg-background min-h-[80vh]">
            <h1 className="text-4xl font-serif font-bold text-primary mb-12 text-center">Your Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="lg:w-2/3 bg-white rounded-xl shadow-lg p-8 space-y-8 border border-gray-100">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-6 text-lg">Your cart is currently empty.</p>
                            <Link to="/catalog" className="inline-block px-8 py-3 bg-accent text-primary font-bold rounded-full hover:bg-yellow-400 transition-colors">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-6 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 items-center">
                                <img
                                    src={item.image || 'https://placehold.co/400x500?text=No+Image'}
                                    alt={item.title}
                                    className="w-24 h-32 object-cover rounded-lg shadow-sm"
                                    onError={(e) => { e.target.src = 'https://placehold.co/400x500?text=No+Image'; }}
                                />
                                <div className="flex-1 w-full text-center sm:text-left">
                                    <h3 className="font-bold text-xl text-primary font-serif mb-1">{item.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4">Size: Standard</p>
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center border border-gray-200 rounded-full bg-gray-50">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-gray-200 rounded-l-full transition-colors"><Minus size={16} /></button>
                                            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-gray-200 rounded-r-full transition-colors"><Plus size={16} /></button>
                                        </div>
                                        <span className="font-bold text-primary text-lg">
                                            ₹{((item.selling_price || item.price || 0) * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Summary */}
                {cartItems.length > 0 && (
                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-primary text-white rounded-xl shadow-lg p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                            <h2 className="text-2xl font-bold font-serif mb-6 relative z-10">Order Summary</h2>
                            <div className="space-y-4 mb-8 text-sm text-gray-300 relative z-10">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toFixed(2)}</span>
                                </div>
                                {coupon && (
                                    <div className="flex justify-between text-accent">
                                        <span>Discount ({coupon.code})</span>
                                        <div className="flex items-center gap-2">
                                            <span>-₹{(cartTotal - finalTotal).toFixed(2)}</span>
                                            <button onClick={removeCoupon} className="hover:text-red-400"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-accent">Free</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
                                    <span>Total</span>
                                    <span>₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="block w-full bg-accent text-primary text-center py-4 rounded-full font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-accent/20 relative z-10"
                            >
                                Proceed to Checkout
                            </button>
                        </div>

                        {/* Coupon */}
                        {!coupon && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="font-bold text-primary mb-3">Have a coupon?</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-accent text-sm bg-gray-50 uppercase"
                                    />
                                    <button onClick={handleApplyCoupon} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-900 transition-colors">Apply</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
