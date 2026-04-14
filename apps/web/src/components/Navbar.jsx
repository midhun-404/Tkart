import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Menu, User, LogIn, Heart, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { useWishlist } from '../context/WishlistProvider';

const categories = [
    { label: 'Electronics', path: '/catalog?category=Electronics' },
    { label: 'Fashion', path: '/catalog?category=Fashion' },
    { label: 'Home & Kitchen', path: '/catalog?category=Home' },
    { label: 'Sports & Fitness', path: '/catalog?category=Sports' },
    { label: 'Beauty & Care', path: '/catalog?category=Beauty' },
];

const Navbar = () => {
    const { user, openLogin, logout } = useAuth();
    const { cartItems } = useCart();
    const { wishlist } = useWishlist();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoryDropdown, setCategoryDropdown] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [userDropdown, setUserDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const wishlistCount = wishlist.length;

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setUserDropdown(false);
    }, [location.pathname, location.search]);

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);

    // Close user dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
            setSearchOpen(false);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 bg-primary text-white shadow-lg">
            {/* ─── Main Navbar ─── */}
            <nav className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">

                {/* Left: Hamburger + Logo */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        className="lg:hidden text-white hover:text-accent transition-colors p-1.5 rounded-lg"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                    <Link to="/" className="text-lg sm:text-xl lg:text-2xl font-serif font-bold tracking-wider text-white flex-shrink-0">
                        <span className="text-accent">TREND</span>KART
                    </Link>
                </div>

                {/* Center: Desktop Nav — hidden on mobile/tablet */}
                <div className="hidden lg:flex items-center gap-6 text-sm font-medium tracking-wide text-gray-300">
                    <Link to="/" className={`hover:text-accent transition-colors py-1 border-b-2 ${isActive('/') ? 'border-accent text-white' : 'border-transparent'}`}>
                        HOME
                    </Link>
                    <Link to="/catalog" className={`hover:text-accent transition-colors py-1 border-b-2 ${isActive('/catalog') ? 'border-accent text-white' : 'border-transparent'}`}>
                        PRODUCTS
                    </Link>

                    {/* Categories Dropdown */}
                    <div className="relative" onMouseEnter={() => setCategoryDropdown(true)} onMouseLeave={() => setCategoryDropdown(false)}>
                        <button className={`flex items-center gap-1 hover:text-accent transition-colors uppercase py-1 border-b-2 ${categoryDropdown ? 'border-accent text-white' : 'border-transparent'}`}>
                            CATEGORIES <ChevronDown size={13} className={`transition-transform ${categoryDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {categoryDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-2xl py-1.5 border border-gray-100 z-50 animate-scale-in">
                                {categories.map(cat => (
                                    <Link
                                        key={cat.label}
                                        to={cat.path}
                                        className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent/10 hover:text-primary font-medium transition-colors"
                                    >
                                        {cat.label}
                                        <ChevronRight size={14} className="text-gray-400" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link to="/deals" className={`hover:text-accent transition-colors py-1 border-b-2 ${isActive('/deals') ? 'border-accent text-white' : 'border-transparent'}`}>
                        DEALS
                    </Link>
                </div>

                {/* Desktop Search */}
                <form onSubmit={handleSearch} className="hidden md:flex items-center relative flex-1 max-w-xs lg:max-w-sm">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800/80 text-white border border-slate-700 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-accent/70 text-sm placeholder-gray-500 transition-colors"
                    />
                    <button type="submit" className="absolute right-3 text-gray-400 hover:text-accent transition-colors">
                        <Search size={15} />
                    </button>
                </form>

                {/* Right Actions */}
                <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
                    {/* Mobile Search Toggle */}
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="md:hidden text-gray-300 hover:text-accent transition-colors p-2 rounded-lg"
                        aria-label="Search"
                    >
                        <Search size={20} />
                    </button>

                    {/* Wishlist */}
                    <Link to="/wishlist" className="relative text-gray-300 hover:text-accent transition-colors p-2 rounded-lg" title="Wishlist">
                        <Heart size={20} />
                        {wishlistCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                {wishlistCount > 9 ? '9+' : wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" className="relative text-gray-300 hover:text-accent transition-colors p-2 rounded-lg" title="Cart">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 bg-accent text-primary text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* User */}
                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserDropdown(!userDropdown)}
                                className="flex items-center gap-1.5 text-gray-300 hover:text-accent transition-colors p-1 rounded-lg"
                                aria-label="Account menu"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold text-sm">
                                    {(user.name || user.displayName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <ChevronDown size={12} className={`hidden sm:block transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {userDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scale-in">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <p className="font-bold text-primary text-sm truncate">{user.name || user.displayName || 'Account'}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors">
                                            <User size={15} className="text-gray-400" /> My Account
                                        </Link>
                                        <Link to="/wishlist" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors">
                                            <Heart size={15} className="text-gray-400" /> Wishlist
                                            {wishlistCount > 0 && <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{wishlistCount}</span>}
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-purple-600 font-bold text-sm hover:bg-purple-50 transition-colors">
                                                ⚡ Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => { logout(); setUserDropdown(false); }}
                                            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 text-sm font-medium border-t border-gray-100 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={openLogin}
                            className="flex items-center gap-1.5 bg-accent text-primary font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm hover:bg-yellow-400 transition-colors"
                        >
                            <LogIn size={14} />
                            <span>Login</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* ─── Mobile Search Bar (expands below navbar) ─── */}
            {searchOpen && (
                <div className="md:hidden border-t border-slate-700 bg-slate-900 px-4 py-3 animate-fade-in">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search for products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-accent text-sm"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-accent">
                            <Search size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* ─── Mobile Menu Drawer ─── */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-slate-800 bg-slate-900 animate-fade-in">
                    <div className="px-3 py-4 space-y-1">
                        <MobileNavLink to="/" label="🏠 Home" onClick={() => setMobileMenuOpen(false)} />
                        <MobileNavLink to="/catalog" label="🛍 All Products" onClick={() => setMobileMenuOpen(false)} />
                        <MobileNavLink to="/deals" label="🔥 Deals" onClick={() => setMobileMenuOpen(false)} />

                        {/* Category sub-nav */}
                        <div className="px-3 pt-2 pb-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Categories</p>
                            <div className="grid grid-cols-2 gap-1">
                                {categories.map(cat => (
                                    <Link
                                        key={cat.label}
                                        to={cat.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2 text-gray-300 hover:text-accent text-sm py-2 px-2 rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        <ChevronRight size={12} className="text-accent" /> {cat.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-slate-700 pt-3 mt-2">
                            {user ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 px-3 py-2 mb-1">
                                        <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold">
                                            {(user.name || user.displayName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-sm truncate">{user.name || user.displayName}</p>
                                            <p className="text-gray-400 text-xs truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <MobileNavLink to="/dashboard" label="👤 My Account" onClick={() => setMobileMenuOpen(false)} />
                                    <MobileNavLink to="/wishlist" label={`❤️ Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ''}`} onClick={() => setMobileMenuOpen(false)} />
                                    {user.role === 'admin' && (
                                        <MobileNavLink to="/admin" label="⚡ Admin Panel" onClick={() => setMobileMenuOpen(false)} />
                                    )}
                                    <button
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="block w-full text-left px-4 py-2.5 text-red-400 hover:text-red-300 text-sm font-medium rounded-xl mt-1"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { openLogin(); setMobileMenuOpen(false); }}
                                    className="w-full bg-accent text-primary font-bold py-3 rounded-xl text-sm"
                                >
                                    Login / Sign Up
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

const MobileNavLink = ({ to, label, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className="block w-full text-left px-4 py-2.5 text-gray-200 hover:text-accent hover:bg-slate-800 font-medium rounded-xl text-sm transition-colors"
    >
        {label}
    </Link>
);

export default Navbar;
