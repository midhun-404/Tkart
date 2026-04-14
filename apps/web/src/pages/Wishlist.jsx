import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistProvider';
import { useCart } from '../context/CartProvider';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (item) => {
        addToCart({
            id: item.id,
            title: item.title,
            selling_price: item.price,
            price: item.price,
            images: [item.image],
            image: item.image,
            category: item.category,
        });
        removeFromWishlist(item.id);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
                            <Heart className="text-red-400" size={30} /> My Wishlist
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
                    </div>
                    {wishlist.length > 0 && (
                        <Link to="/catalog" className="text-sm text-primary font-bold hover:text-accent flex items-center gap-1 transition-colors">
                            Continue Shopping <ArrowRight size={16} />
                        </Link>
                    )}
                </div>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={36} className="text-red-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-600 font-serif mb-2">Your Wishlist is Empty</h2>
                        <p className="text-gray-400 mb-8">Discover products you'll love and save them here!</p>
                        <Link
                            to="/catalog"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-slate-800 transition-colors"
                        >
                            <ShoppingBag size={18} /> Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {wishlist.map(item => (
                            <div key={item.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary/20 transition-all">
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                                    <Link to={`/product/${item.id}`}>
                                        <img
                                            src={item.image || 'https://placehold.co/400x300?text=Product'}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={e => { e.target.src = 'https://placehold.co/400x300?text=Product'; }}
                                        />
                                    </Link>
                                    <button
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Remove from Wishlist"
                                    >
                                        <Heart size={16} fill="currentColor" />
                                    </button>
                                </div>
                                <div className="p-5">
                                    <Link to={`/product/${item.id}`}>
                                        <h3 className="font-bold text-gray-800 line-clamp-2 hover:text-accent transition-colors mb-1">{item.title}</h3>
                                    </Link>
                                    {item.category && (
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">{item.category}</p>
                                    )}
                                    <p className="text-xl font-bold text-primary mb-4">₹{item.price?.toLocaleString('en-IN')}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleMoveToCart(item)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
                                        >
                                            <ShoppingBag size={15} /> Move to Cart
                                        </button>
                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="w-10 flex items-center justify-center border border-gray-200 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                            title="Remove"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
