import React from 'react';
import Navbar from './Navbar';
import LoginModal from './LoginModal';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const Layout = () => {
    const { user, openLogin } = useAuth();
    return (
        <div className="min-h-screen bg-background font-sans text-primary flex flex-col">
            <LoginModal />
            <Navbar />
            <main className="flex-grow w-full">
                <Outlet />
            </main>
            <footer className="bg-primary text-gray-400 py-12 border-t border-white/10">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-4"><span className="text-accent">TREND</span>KART</h3>
                        <p className="text-sm leading-relaxed">
                            Your one-stop destination for premium trends and lifestyle products.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-accent transition-colors">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Best Sellers</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Deals</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-accent transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Stay Connected</h4>
                        <div className="flex space-x-4">
                            {/* Social Icons Placeholder */}
                            <div className="w-8 h-8 bg-white/10 rounded-full hover:bg-accent transition-colors cursor-pointer"></div>
                            <div className="w-8 h-8 bg-white/10 rounded-full hover:bg-accent transition-colors cursor-pointer"></div>
                            <div className="w-8 h-8 bg-white/10 rounded-full hover:bg-accent transition-colors cursor-pointer"></div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm flex flex-col md:flex-row justify-between items-center px-6">
                    <p>&copy; 2026 TrendKart. All rights reserved.</p>
                    <div className="mt-4 md:mt-0">
                        {user && user.role === 'admin' ? (
                            <Link to="/admin" className="text-gray-500 hover:text-accent transition-colors">Admin Panel</Link>
                        ) : (
                            <button onClick={openLogin} className="text-gray-500 hover:text-accent transition-colors">Admin Login</button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
