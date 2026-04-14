import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, BarChart2,
    Ticket, Users, Layers, Settings, LogOut, Menu, X,
    Bell, Search, Image as ImageIcon, Tag, ChevronRight,
    Store, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

const navGroups = [
    {
        label: 'Overview',
        items: [
            { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        ]
    },
    {
        label: 'Catalog',
        items: [
            { path: '/admin/products', icon: Package, label: 'Products' },
            { path: '/admin/inventory', icon: Layers, label: 'Categories' },
            { path: '/admin/slideshow', icon: ImageIcon, label: 'Slideshow' },
        ]
    },
    {
        label: 'Commerce',
        items: [
            { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
            { path: '/admin/coupons', icon: Ticket, label: 'Coupons' },
            { path: '/admin/deals', icon: Tag, label: 'Deals' },
        ]
    },
    {
        label: 'Insights',
        items: [
            { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
            { path: '/admin/users', icon: Users, label: 'Users' },
        ]
    },
    {
        label: 'System',
        items: [
            { path: '/admin/settings', icon: Settings, label: 'Settings' },
        ]
    }
];

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleAdminSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim().toLowerCase();
        if (!q) return;
        if (q.includes('order') || q.includes('purchase')) return navigate('/admin/orders');
        if (q.includes('user') || q.includes('customer')) return navigate('/admin/users');
        if (q.includes('product') || q.includes('item') || q.includes('stock')) return navigate('/admin/products');
        if (q.includes('coupon') || q.includes('discount') || q.includes('code')) return navigate('/admin/coupons');
        if (q.includes('deal') || q.includes('offer')) return navigate('/admin/deals');
        if (q.includes('slide') || q.includes('banner')) return navigate('/admin/slideshow');
        if (q.includes('analytic') || q.includes('sales') || q.includes('revenue')) return navigate('/admin/analytics');
        if (q.includes('setting') || q.includes('config')) return navigate('/admin/settings');
        navigate('/admin/products');
        setSearchQuery('');
    };

    // Get current page label for breadcrumb
    const currentNav = navGroups.flatMap(g => g.items).find(i => i.path === location.pathname);

    const Sidebar = () => (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
            {/* Brand */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
                <Link to="/admin" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Store size={16} className="text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-gray-900 text-sm">TrendKart</span>
                        <span className="block text-[10px] text-indigo-500 font-semibold uppercase tracking-widest leading-none">Admin Console</span>
                    </div>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                    <X size={18} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {navGroups.map(group => (
                    <div key={group.label}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1.5">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map(item => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                                            ${isActive
                                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon size={17} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                                        {item.label}
                                        {isActive && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer: View Store + User */}
            <div className="border-t border-gray-100 p-3 space-y-3">
                <Link to="/" target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium">
                    <ExternalLink size={15} />
                    View Store
                </Link>
                <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{user?.name || 'Admin'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout}
                        title="Logout"
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="w-64 flex flex-col h-screen sticky top-0">
                    <Sidebar />
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 z-30 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        {/* Breadcrumb */}
                        <div className="hidden md:flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Admin</span>
                            <ChevronRight size={14} className="text-gray-300" />
                            <span className="font-semibold text-gray-800">{currentNav?.label || 'Dashboard'}</span>
                        </div>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleAdminSearch}
                        className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-72 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                        <Search size={15} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
                        />
                        {searchQuery && (
                            <kbd className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">↵</kbd>
                        )}
                    </form>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        </button>
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold cursor-pointer">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-5 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
