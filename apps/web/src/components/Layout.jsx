import React, { useState } from 'react';
import Navbar from './Navbar';
import LoginModal from './LoginModal';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { X, Megaphone, Instagram, Twitter, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const Layout = () => {
    const { user, openLogin } = useAuth();
    const [siteBanner, setSiteBanner] = useState('');
    const [bannerDismissed, setBannerDismissed] = useState(false);

    // Load site banner from admin settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'global');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().site_banner) {
                    setSiteBanner(docSnap.data().site_banner);
                }
            } catch (error) {
                console.error('Failed to load site banner:', error);
            }
        };
        fetchSettings();
    }, []);

    const showBanner = siteBanner && !bannerDismissed;

    return (
        <div className="min-h-screen bg-background font-sans text-primary flex flex-col">
            {/* Site-wide Announcement Banner */}
            {showBanner && (
                <div className="bg-accent text-primary py-2 px-4 flex items-center justify-center gap-3 relative text-sm font-bold shadow-sm">
                    <Megaphone size={16} className="flex-shrink-0" />
                    <span className="text-center">{siteBanner}</span>
                    <button
                        onClick={() => setBannerDismissed(true)}
                        className="absolute right-4 hover:opacity-70 transition-opacity"
                        aria-label="Dismiss banner"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <LoginModal />
            <Navbar />
            <main className="flex-grow w-full">
                <Outlet />
            </main>

            {/* ─────────────── FOOTER ─────────────── */}
            <footer className="bg-primary text-gray-400">
                <div className="container mx-auto px-6 pt-16 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                        {/* Brand */}
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-white mb-4">
                                <span className="text-accent">TREND</span>KART
                            </h3>
                            <p className="text-sm leading-relaxed text-gray-400 mb-5">
                                Your one-stop destination for premium trends, lifestyle products and exclusive deals. Shop smart, live better.
                            </p>
                            <div className="flex gap-3 mt-2">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 bg-white/10 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                    aria-label="Instagram">
                                    <Instagram size={16} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 bg-white/10 hover:bg-sky-500 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                    aria-label="Twitter">
                                    <Twitter size={16} />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 bg-white/10 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                    aria-label="Facebook">
                                    <Facebook size={16} />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 bg-white/10 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                    aria-label="YouTube">
                                    <Youtube size={16} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Shop */}
                        <div>
                            <h4 className="text-white font-bold mb-5 uppercase text-xs tracking-widest">Quick Shop</h4>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/catalog" className="hover:text-accent transition-colors hover:pl-1 transition-all">New Arrivals</Link></li>
                                <li><Link to="/catalog?sort=rating" className="hover:text-accent transition-colors hover:pl-1 transition-all">Best Sellers</Link></li>
                                <li><Link to="/deals" className="hover:text-accent transition-colors hover:pl-1 transition-all">Deals & Offers</Link></li>
                                <li><Link to="/catalog?category=Electronics" className="hover:text-accent transition-colors hover:pl-1 transition-all">Electronics</Link></li>
                                <li><Link to="/catalog?category=Fashion" className="hover:text-accent transition-colors hover:pl-1 transition-all">Fashion</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-white font-bold mb-5 uppercase text-xs tracking-widest">Support</h4>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link to="/about" className="hover:text-accent transition-colors hover:pl-1 transition-all">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-accent transition-colors hover:pl-1 transition-all">Contact Us</Link></li>
                                <li><Link to="/contact" className="hover:text-accent transition-colors hover:pl-1 transition-all">Help Center</Link></li>
                                <li><Link to="/about" className="hover:text-accent transition-colors hover:pl-1 transition-all">Shipping & Returns</Link></li>
                                <li><Link to="/dashboard" className="hover:text-accent transition-colors hover:pl-1 transition-all">Track Order</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="text-white font-bold mb-5 uppercase text-xs tracking-widest">Get In Touch</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2.5">
                                    <MapPin size={16} className="flex-shrink-0 mt-0.5 text-accent" />
                                    <span>123 Commerce St,<br />Mumbai, Maharashtra 400001</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Phone size={16} className="flex-shrink-0 text-accent" />
                                    <a href="tel:+919876543210" className="hover:text-accent transition-colors">+91 98765 43210</a>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Mail size={16} className="flex-shrink-0 text-accent" />
                                    <a href="mailto:support@trendkart.in" className="hover:text-accent transition-colors">support@trendkart.in</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                        <p>&copy; {new Date().getFullYear()} TrendKart. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <Link to="/about" className="hover:text-accent transition-colors">Privacy Policy</Link>
                            <Link to="/about" className="hover:text-accent transition-colors">Terms of Service</Link>
                            {user && user.role === 'admin' ? (
                                <Link to="/admin" className="text-purple-400 hover:text-accent transition-colors font-bold">Admin Panel</Link>
                            ) : (
                                <button onClick={openLogin} className="text-gray-500 hover:text-accent transition-colors text-xs">Admin</button>
                            )}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
