import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
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
            alert(res.message); // Could use useToast here if imported, keeping alert for now to avoid Context errors if Toast isn't wrapped properly
        } else {
            setCouponCode('');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8 sm:py-12 pb-32 lg:pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-6 sm:mb-10 text-center lg:text-left">
                    Your Shopping Cart
                </h1>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Cart Items Area */}
                    <div className="lg:w-2/3 space-y-4 sm:space-y-6">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShoppingBag size={36} className="text-gray-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-600 font-serif mb-2">Cart is empty</h2>
                                <p className="text-gray-400 mb-8 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet.</p>
                                <Link to="/catalog" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-slate-800 transition-colors">
                                    Start Shopping <ArrowRight size={18} />
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {cartItems.map(item => {
                                    const itemKey = item.productId || item.id;
                                    return (
                                        <div key={itemKey} className="flex gap-4 sm:gap-6 p-4 sm:p-6 border-b border-gray-50 last:border-0 relative hover:bg-gray-50/50 transition-colors">
                                            {/* Item Image */}
                                            <div className="w-24 h-32 sm:w-32 sm:h-40 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                                <img
                                                    src={item.image || 'https://placehold.co/400x500?text=No+Img'}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/400x500?text=No+Img'; }}
                                                />
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div className="pr-8">
                                                    <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-2 leading-tight mb-1 hover:text-accent transition-colors cursor-pointer" onClick={() => navigate(`/product/${item.productId || item.id}`)}>
                                                        {item.title}
                                                    </h3>
                                                    {item.category && <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{item.category}</p>}
                                                    <p className="font-bold text-primary text-lg sm:text-xl">
                                                        ₹{((item.selling_price || item.price || 0)).toLocaleString('en-IN')}
                                                    </p>
                                                </div>

                                                <div className="flex items-end justify-between mt-4">
                                                    {/* Quantity Control */}
                                                    <div className="flex items-center border border-gray-200 rounded-lg bg-white h-9 sm:h-10">
                                                        <button
                                                            onClick={() => updateQuantity(itemKey, -1)}
                                                            className="w-8 sm:w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors rounded-l-lg"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 sm:w-10 text-center text-sm font-bold text-gray-800 select-none">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(itemKey, 1)}
                                                            className="w-8 sm:w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors rounded-r-lg"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    <p className="hidden sm:block font-bold text-gray-800">
                                                        Total: ₹{((item.selling_price || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Remove Button (Absolute on mobile, regular on desktop) */}
                                            <button
                                                onClick={() => removeFromCart(itemKey)}
                                                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-300 hover:text-red-500 transition-colors p-2 md:p-1 rounded-full hover:bg-red-50"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={20} className="sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    {cartItems.length > 0 && (
                        <div className="lg:w-1/3">
                            <div className="sticky top-24 space-y-6">
                                {/* Order Summary */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                    <h2 className="text-xl font-bold font-serif mb-6 text-primary border-b border-gray-100 pb-4">Order Summary</h2>

                                    <div className="space-y-4 mb-6 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Subtotal ({cartItems.length} items)</span>
                                            <span className="font-bold text-gray-800">₹{cartTotal.toLocaleString('en-IN')}</span>
                                        </div>

                                        {coupon && (
                                            <div className="flex justify-between text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-100">
                                                <span className="font-bold flex items-center gap-1">Discount ({coupon.code})</span>
                                                <div className="flex items-center gap-2 font-bold">
                                                    <span>-₹{(cartTotal - finalTotal).toLocaleString('en-IN')}</span>
                                                    <button onClick={removeCoupon} className="hover:text-red-500 ml-1 p-0.5 rounded-full hover:bg-red-100 transition-colors">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                                            <span>Shipping Fee</span>
                                            <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Free</span>
                                        </div>

                                        <div className="flex justify-between text-xl font-bold text-primary pt-2">
                                            <span>Total</span>
                                            <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    {/* Desktop Checkout Button */}
                                    <button
                                        onClick={handleCheckout}
                                        className="hidden lg:flex w-full bg-accent text-primary items-center justify-center gap-2 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-accent/20"
                                    >
                                        Proceed to Checkout <ArrowRight size={18} />
                                    </button>
                                </div>

                                {/* Coupon Section */}
                                {!coupon && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="font-bold text-primary mb-3 text-sm">Have a coupon code?</h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm bg-gray-50 uppercase transition-all"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Fixed Checkout Bar (Hidden on LG) */}
            {cartItems.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-30">
                    <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</span>
                            <span className="text-xl font-bold text-primary">₹{finalTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="flex-1 bg-accent text-primary flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold hover:bg-yellow-400 max-w-[200px]"
                        >
                            Checkout <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
