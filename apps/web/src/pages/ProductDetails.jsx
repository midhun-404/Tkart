import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import { Star, ShoppingCart, Truck, Minus, Plus, Package } from 'lucide-react';
import { useCart } from '../context/CartProvider';
import ReviewSection from '../components/ReviewSection';
import RelatedProducts from '../components/RelatedProducts';
import ErrorBoundary from '../components/ErrorBoundary';

const ProductDetailsContent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState(null);
    const [activeDeal, setActiveDeal] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                if (!id) throw new Error("Product ID is missing");

                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("Product not found");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        const fetchDeal = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/deals`);
                const dealData = data?.deal || data;
                if (dealData && (dealData.endTime || dealData.end_time)) {
                    const now = new Date();
                    const end = new Date(dealData.endTime || dealData.end_time);
                    if (now <= end && (dealData.productId === id || dealData.product_id === id)) {
                        setActiveDeal(dealData);
                    } else {
                        setActiveDeal(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching deal:", error);
            }
        };

        fetchProduct();
        fetchDeal();
        setQuantity(1);
    }, [id]);

    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (product && product.images?.length > 0) {
            setSelectedImage(product.images[0]);
        }
    }, [product]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600">{error || "Product not found."}</p>
            <button onClick={() => window.history.back()} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-slate-800 transition-colors">
                Go Back
            </button>
        </div>
    );

    // Defensive handling for all properties
    const displayImage = selectedImage || product.images?.[0] || 'https://placehold.co/600x800?text=No+Image';
    const title = product.title || "Untitled Product";
    const category = product.category || "Uncategorized";
    const brand = product.brand || "Generic";

    // Apply deal price if active deal matched this product
    const isDealPrice = !!activeDeal;
    const price = isDealPrice ? Number(activeDeal.discountPrice || activeDeal.discount_price) : (Number(product.selling_price) || 0);
    const stock = Number(product.stock) || 0;

    // Calculate display discount if deal is active, else use product discount
    const productDiscount = Number(product.discount_percentage) || 0;
    const originalPrice = isDealPrice ? (Number(product.selling_price) || 0) : Math.round(price / (1 - productDiscount / 100));
    const discount = isDealPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : productDiscount;

    const description = product.description || "No description available.";

    const handleQuantityChange = (type) => {
        if (type === 'inc') {
            if (quantity < stock) setQuantity(prev => prev + 1);
        } else {
            if (quantity > 1) setQuantity(prev => prev - 1);
        }
    }

    const handleAddToCart = () => {
        try {
            if (addToCart) {
                // Pass the effective price to context
                addToCart({ ...product, selling_price: price, price: price }, quantity);
            }
        } catch (e) {
            console.error("Add to cart failed:", e);
            alert("Could not add to cart. Please try again.");
        }
    };

    const handleBuyNow = () => {
        try {
            if (addToCart) {
                addToCart({ ...product, selling_price: price, price: price }, quantity);
                navigate('/checkout');
            }
        } catch (e) {
            console.error("Buy now failed:", e);
            alert("Could not process buy now. Please try again.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Image Gallery */}
                    <div className="w-full md:w-1/2 space-y-4">
                        <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 relative group">
                            <img
                                src={displayImage}
                                alt={title}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => e.target.src = 'https://placehold.co/600x800?text=Error'}
                            />
                        </div>
                        {product.images?.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedImage(img)}
                                        className={`aspect-square bg-white rounded-lg cursor-pointer transition-all overflow-hidden flex items-center justify-center p-2 shadow-sm
                                            ${selectedImage === img ? 'border-2 border-accent ring-2 ring-accent/20' : 'border border-transparent hover:border-gray-300'}
                                        `}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${i}`}
                                            className="max-w-full max-h-full object-contain"
                                            onError={(e) => e.target.src = 'https://placehold.co/100x100?text=Error'}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="w-full md:w-1/2 space-y-8">
                        <div>
                            <span className="text-accent font-bold text-xs uppercase tracking-widest bg-accent/10 px-2 py-1 rounded mb-4 inline-block">{category}</span>
                            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4 leading-tight">{title}</h1>

                            <div className="flex items-center space-x-4 text-sm text-gray-500 border-b border-gray-100 pb-6">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                                </div>
                                <span className="text-gray-400">|</span>
                                <span className="font-bold text-gray-700">{brand}</span>
                                <span className="text-gray-400">|</span>
                                <span className={stock > 0 ? "text-green-600 font-bold flex items-center gap-1" : "text-red-500 font-bold"}>
                                    {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-end space-x-4">
                            <span className="text-5xl font-bold text-primary">₹{price}</span>
                            {discount > 0 && (
                                <div className="flex flex-col mb-1">
                                    <span className="text-lg text-gray-400 line-through">
                                        ₹{originalPrice}
                                    </span>
                                    {isDealPrice && <span className="text-accent text-xs font-bold bg-accent/10 px-2 py-1 rounded inline-block mb-1 w-max">Deal of the Day!</span>}
                                    <span className="text-red-500 text-sm font-bold">Save {discount}%</span>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-600 leading-relaxed text-lg">
                            {description}
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
                                        disabled={quantity >= stock}
                                        className="px-4 h-full hover:bg-gray-100 transition-colors border-l border-gray-200 text-gray-600 disabled:opacity-50"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                {stock > 0 ? (
                                    <>
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-white text-primary border-2 border-primary h-14 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 shadow-sm"
                                        >
                                            <ShoppingCart size={20} />
                                            <span>ADD TO CART</span>
                                        </button>
                                        <button
                                            onClick={handleBuyNow}
                                            className="flex-1 bg-primary text-white h-14 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                                        >
                                            BUY NOW
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        disabled
                                        className="flex-1 bg-gray-300 text-gray-500 h-14 rounded-lg font-bold flex items-center justify-center cursor-not-allowed"
                                    >
                                        OUT OF STOCK
                                    </button>
                                )}
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
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Package size={20} /></div>
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
            <RelatedProducts category={category} currentProductId={id} />
        </div>
    );
};

const ProductDetails = () => (
    <ErrorBoundary>
        <ProductDetailsContent />
    </ErrorBoundary>
);

export default ProductDetails;
