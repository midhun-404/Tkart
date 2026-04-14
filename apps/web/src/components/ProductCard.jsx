import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartProvider';
import { useWishlist } from '../context/WishlistProvider';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const navigate = useNavigate();

    const wishlisted = isWishlisted(product.id);

    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        navigate('/checkout');
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    const productImage = product.images?.[0] || 'https://placehold.co/400x500?text=No+Image';
    const sellingPrice = Number(product.selling_price || product.price || 0);
    const discountPct = Number(product.discount_percentage || 0);
    const mrpPrice = discountPct > 0 ? Math.round(sellingPrice / (1 - discountPct / 100)) : null;

    return (
        <div className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-accent/20">
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '3/4' }}>
                <Link to={`/product/${product.id}`} className="block h-full w-full">
                    <img
                        src={productImage}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e) => { e.target.src = 'https://placehold.co/400x500?text=No+Image'; }}
                    />
                </Link>

                {/* Discount Badge */}
                {discountPct > 0 && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        -{discountPct}%
                    </div>
                )}

                {/* Wishlist — always on mobile (bottom right), hover on desktop (top right) */}
                <button
                    onClick={handleWishlist}
                    className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 z-10
                        ${wishlisted
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-gray-400 hover:bg-red-50 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100'
                        }`}
                    aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                    <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>

                {/* Quick Action Buttons — slide up on hover (desktop only) */}
                <div className="hidden sm:flex absolute w-[90%] bottom-3 left-1/2 -translate-x-1/2 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 shadow-lg rounded-xl overflow-hidden transition-all duration-300 z-10">
                    <button
                        onClick={handleAddToCart}
                        className="bg-white text-primary flex-1 py-2.5 hover:bg-gray-100 transition-colors font-semibold text-xs flex items-center justify-center gap-1.5 border-r border-gray-200"
                    >
                        <ShoppingBag size={13} /> Add to Cart
                    </button>
                    <button
                        onClick={handleBuyNow}
                        className="bg-primary text-white flex-1 py-2.5 hover:bg-slate-800 transition-colors font-bold text-xs flex items-center justify-center"
                    >
                        Buy Now
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 text-center space-y-1">
                <h3 className="text-sm sm:text-base font-serif text-primary truncate hover:text-accent transition-colors px-1">
                    <Link to={`/product/${product.id}`}>
                        {product.title}
                    </Link>
                </h3>
                {product.brand && (
                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">{product.brand}</p>
                )}
                <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm sm:text-base font-bold text-primary">₹{sellingPrice.toLocaleString('en-IN')}</span>
                    {mrpPrice && mrpPrice > sellingPrice && (
                        <span className="text-xs text-gray-400 line-through">₹{mrpPrice.toLocaleString('en-IN')}</span>
                    )}
                </div>

                {/* Mobile-only Add to Cart button (always visible) */}
                <button
                    onClick={handleAddToCart}
                    className="sm:hidden w-full mt-2 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                    <ShoppingBag size={12} /> Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
