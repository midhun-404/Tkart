import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, CheckCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import DealSection from '../components/home/DealSection';
import CategoryGrid from '../components/home/CategoryGrid';
import Slideshow from '../components/home/Slideshow';

// Skeleton card for loading state
const ProductSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
        <div className="aspect-[3/4] bg-gray-200"></div>
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
    </div>
);

const Home = () => {
    const [latestProducts, setLatestProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const q = query(
                    collection(db, 'products'),
                    where('is_active', '==', true),
                    orderBy('createdAt', 'desc'),
                    limit(8)
                );
                const querySnapshot = await getDocs(q);
                const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLatestProducts(prods);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch products", error);
                setLoading(false);
            }
        };
        fetchLatest();
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 4000);
    };

    return (
        <div className="flex flex-col w-full bg-background overflow-x-hidden">

            {/* Hero Section / Slideshow */}
            <section className="w-full">
                <Slideshow />
            </section>

            {/* Features Row - Horizontal scroll on mobile */}
            <section className="bg-white py-8 sm:py-12 border-b border-gray-100">
                <div className="container mx-auto pl-4 pr-0 sm:px-6">
                    <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-8 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-hide pr-4 sm:pr-0">
                        <div className="flex items-center gap-3 sm:gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 min-w-[280px] sm:min-w-0 flex-shrink-0 snap-start">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full flex-shrink-0"><Truck size={24} className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                            <div>
                                <h4 className="font-bold text-primary text-sm sm:text-base">Free Shipping</h4>
                                <p className="text-xs sm:text-sm text-gray-500">On all orders over ₹999</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 min-w-[280px] sm:min-w-0 flex-shrink-0 snap-start">
                            <div className="p-3 bg-green-100 text-green-600 rounded-full flex-shrink-0"><ShieldCheck size={24} className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                            <div>
                                <h4 className="font-bold text-primary text-sm sm:text-base">Secure Payment</h4>
                                <p className="text-xs sm:text-sm text-gray-500">100% secure transactions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 min-w-[280px] sm:min-w-0 flex-shrink-0 snap-start">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-full flex-shrink-0"><Star size={24} className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                            <div>
                                <h4 className="font-bold text-primary text-sm sm:text-base">Premium Quality</h4>
                                <p className="text-xs sm:text-sm text-gray-500">Certified top-tier products</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CategoryGrid />
            <DealSection />

            {/* Featured Collection */}
            <section className="py-12 sm:py-20 container mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-0">
                    <div>
                        <span className="text-accent font-bold tracking-wider uppercase text-xs sm:text-sm">Shop Now</span>
                        <h2 className="text-3xl sm:text-4xl font-serif text-primary mt-1">Latest Arrivals</h2>
                    </div>
                    <Link to="/catalog" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1 self-end sm:self-auto uppercase tracking-wider">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-7">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))
                    ) : latestProducts.length > 0 ? (
                        latestProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-xl font-bold mb-2">No products yet</p>
                            <p className="text-sm">Products will appear here once added by admin.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="bg-primary py-16 sm:py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center text-white">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 sm:mb-6 leading-tight">Join the Community</h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8 sm:mb-10 text-sm sm:text-lg">
                        Subscribe to receive updates, access to exclusive deals, and more.
                    </p>
                    {subscribed ? (
                        <div className="flex items-center justify-center gap-3 text-accent text-base sm:text-lg font-bold animate-fade-in bg-white/10 py-4 px-6 rounded-3xl w-max mx-auto border border-white/20">
                            <CheckCircle size={20} className="sm:w-6 sm:h-6" />
                            <span>You're subscribed! Welcome. 🎉</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto w-full">
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-accent w-full text-sm sm:text-base text-center sm:text-left"
                            />
                            <button type="submit" className="px-8 py-3.5 sm:py-4 bg-accent text-primary font-bold rounded-full hover:bg-yellow-400 transition-colors w-full sm:w-auto text-sm sm:text-base">
                                Subscribe
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
