import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Star, ShoppingCart, Truck, RefreshCw, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartProvider';
import ReviewSection from '../components/ReviewSection';
import RelatedProducts from '../components/RelatedProducts';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such product!");
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchProduct();
        setQuantity(1); // Reset quantity on id change
    }, [id]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!product) return <div className="p-10 text-center">Product not found.</div>;

    const mainImage = product.images?.[0] || 'https://placehold.co/600x800?text=No+Image';

    const handleQuantityChange = (type) => {
        if (type === 'inc') {
            if (quantity < product.stock) setQuantity(prev => prev + 1);
        } else {
            if (quantity > 1) setQuantity(prev => prev - 1);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Image Gallery */}
                    <div className="w-full md:w-1/2 space-y-4">
                        <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 relative group">
                            <img src={mainImage} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images?.map((img, i) => (
                                <div key={i} className="aspect-square bg-white rounded-lg cursor-pointer hover:border-primary border-2 border-transparent transition-all overflow-hidden flex items-center justify-center p-2 shadow-sm">
                                    <img src={img} alt={`Thumbnail ${i}`} className="max-w-full max-h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="w-full md:w-1/2 space-y-8">
                        <div>
                            <span className="text-accent font-bold text-xs uppercase tracking-widest bg-accent/10 px-2 py-1 rounded mb-4 inline-block">{product.category}</span>
                            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4 leading-tight">{product.title}</h1>

                            <div className="flex items-center space-x-4 text-sm text-gray-500 border-b border-gray-100 pb-6">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                                </div>
                                <span className="text-gray-400">|</span>
                                <span className="font-bold text-gray-700">{product.brand}</span>
                                <span className="text-gray-400">|</span>
                                <span className={product.stock > 0 ? "text-green-600 font-bold flex items-center gap-1" : "text-red-500 font-bold"}>
                                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-end space-x-4">
                            <span className="text-5xl font-bold text-primary">₹{product.selling_price}</span>
                            {product.discount_percentage > 0 && (
                                <div className="flex flex-col mb-1">
                                    <span className="text-lg text-gray-400 line-through">
                                        ₹{Math.round(product.selling_price / (1 - product.discount_percentage / 100))}
                                    </span>
                                    <span className="text-red-500 text-sm font-bold">Save {product.discount_percentage}%</span>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-600 leading-relaxed text-lg">
                            {product.description}
                        </p>

                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-14 w-fit bg-gray-50">
                                    <button
                                        onClick={() => handleQuantityChange('dec')}
                                        disabled={quantity <= 1}
                                        className="px-4 h-full hover:bg-gray-100 transition-colors border-r border-gray-200 text-gray-600 disabled:opacity-50"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        readOnly
                                        className="w-16 text-center outline-none font-bold text-primary bg-transparent"
                                    />
                                    <button
                                        onClick={() => handleQuantityChange('inc')}
                                        disabled={quantity >= product.stock}
                                        className="px-4 h-full hover:bg-gray-100 transition-colors border-l border-gray-200 text-gray-600 disabled:opacity-50"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => addToCart({ ...product, quantity })}
                                    disabled={product.stock <= 0}
                                    className="flex-1 bg-primary text-white h-14 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart size={22} />
                                    <span>{product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 pt-6">
                            <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Truck size={20} /></div>
                                <div>
                                    <span className="block font-bold text-gray-900">Free Delivery</span>
                                    <span className="text-xs">2-3 Days Shipping</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg border border-green-100">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><RefreshCw size={20} /></div>
                                <div>
                                    <span className="block font-bold text-gray-900">Easy Returns</span>
                                    <span className="text-xs">30 Day Policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReviewSection productId={id} />
            <RelatedProducts category={product.category} currentProductId={id} />
        </div>
    );
};

export default ProductDetails;
