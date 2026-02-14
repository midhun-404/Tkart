import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import DealSection from '../components/home/DealSection';
import CategoryGrid from '../components/home/CategoryGrid';

const Home = () => {
    const [latestProducts, setLatestProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="flex flex-col w-full bg-background">

            {/* Hero Section */}
            <section className="relative h-[85vh] w-full flex items-center bg-primary overflow-hidden">
                {/* Background Shapes */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-dark/30 skew-x-12 -mr-32"></div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 space-y-8 animate-fade-in-up">
                        <div className="inline-block px-4 py-1 border border-accent/30 rounded-full bg-accent/10">
                            <span className="text-accent text-sm font-bold tracking-wider uppercase">New Collection 2026</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight">
                            Elevate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-200">Lifestyle</span>
                        </h1>
                        <p className="text-gray-300 text-lg max-w-lg leading-relaxed">
                            Discover a world of premium products curated for the modern individual. Quality, style, and innovation in every item.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link to="/catalog" className="px-8 py-4 bg-accent text-primary font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 shadow-lg shadow-accent/20 flex items-center gap-2">
                                Start Shopping <ArrowRight size={20} />
                            </Link>
                            <Link to="/about" className="px-8 py-4 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300">
                                Our Story
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image / Placeholder for visual impact */}
                    <div className="md:w-1/2 relative h-[500px] hidden md:flex items-center justify-center">
                        <div className="absolute inset-0 bg-accent/20 rounded-full blur-[100px]"></div>
                        <img
                            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
                            alt="Featured Product"
                            className="relative z-10 w-full max-w-md object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>
            </section>

            {/* Features Row */}
            <section className="bg-white py-12 border-b border-gray-100">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Truck size={24} /></div>
                        <div>
                            <h4 className="font-bold text-primary">Free Shipping</h4>
                            <p className="text-sm text-gray-500">On all orders over ₹999</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full"><ShieldCheck size={24} /></div>
                        <div>
                            <h4 className="font-bold text-primary">Secure Payment</h4>
                            <p className="text-sm text-gray-500">100% secure transactions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Star size={24} /></div>
                        <div>
                            <h4 className="font-bold text-primary">Premium Quality</h4>
                            <p className="text-sm text-gray-500">Certified top-tier products</p>
                        </div>
                    </div>
                </div>
            </section>

            <CategoryGrid />
            <DealSection />

            {/* Featured Collection */}
            <section className="py-20 container mx-auto px-6">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <span className="text-accent font-bold tracking-wider uppercase text-sm">Shop Now</span>
                        <h2 className="text-4xl font-serif text-primary mt-2">Latest Arrivals</h2>
                    </div>
                    <Link to="/catalog" className="hidden md:flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors border-b border-transparent hover:border-accent">
                        View All <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {latestProducts.length > 0 ? (
                        latestProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            Loading premium products...
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link to="/catalog" className="inline-block px-8 py-3 bg-primary text-white rounded-full font-medium">
                        View All Products
                    </Link>
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="bg-primary py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-serif mb-6">Join the Community</h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
                        Subscribe to receive updates, access to exclusive deals, and more.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-accent flex-grow"
                        />
                        <button className="px-8 py-4 bg-accent text-primary font-bold rounded-full hover:bg-yellow-400 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
