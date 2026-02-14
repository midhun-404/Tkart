import React, { useState } from 'react';
import { ShoppingCart, Search, Menu, User, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';

const Navbar = () => {
    const { user, openLogin, logout } = useAuth();
    const { cartItems } = useCart();

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <nav className="sticky top-0 z-40 bg-primary text-white border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Mobile Menu & Logo */}
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-white hover:text-accent transition-colors">
                        <Menu size={24} />
                    </button>
                    <Link to="/" className="text-2xl font-serif font-bold tracking-wider text-white">
                        <span className="text-accent">TREND</span>KART
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide text-gray-300">
                    <Link to="/" className="hover:text-accent transition-colors">HOME</Link>
                    <Link to="/catalog" className="hover:text-accent transition-colors">PRODUCTS</Link>
                    <Link to="/about" className="hover:text-accent transition-colors">ABOUT</Link>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="hidden md:flex items-center relative mx-4 flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-accent"
                    />
                    <button type="submit" className="absolute right-3 text-gray-400 hover:text-white">
                        <Search size={18} />
                    </button>
                </form>

                {/* Right Actions */}
                <div className="flex items-center space-x-6">

                    {user ? (
                        <div className="relative group">
                            <Link
                                to={user.role === 'admin' ? "/admin" : "/dashboard"}
                                className="flex items-center gap-2 text-gray-300 hover:text-accent transition-colors"
                            >
                                <User size={22} />
                                <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                            </Link>
                            {/* Dropdown for Logout */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                                <div className="py-2">
                                    {/* Admin link hidden here, access via /admin/login */}
                                    <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Dashboard</Link>
                                    <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Logout</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/admin/login" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors">
                                Admin
                            </Link>
                            <button onClick={openLogin} className="flex items-center gap-2 text-gray-300 hover:text-accent transition-colors">
                                <LogIn size={22} />
                                <span className="hidden md:inline">Login</span>
                            </button>
                        </div>
                    )}

                    <Link to="/cart" className="relative text-gray-300 hover:text-accent transition-colors">
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-accent text-primary text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center transform scale-100 transition-transform">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
