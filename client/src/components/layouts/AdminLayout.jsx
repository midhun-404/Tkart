import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, BarChart2,
    Ticket, Users, Layers, Settings, LogOut, Menu, X, Bell, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
        { path: '/admin/analytics', icon: <BarChart2 size={20} />, label: 'Sales Analytics' },
        { path: '/admin/coupons', icon: <Ticket size={20} />, label: 'Coupons' },
        { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
        { path: '/admin/inventory', icon: <Layers size={20} />, label: 'Categories' },
        { path: '/admin/deals', icon: <Ticket size={20} />, label: 'Deals' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                        <span className="text-xl font-serif font-bold tracking-wider">
                            <span className="text-accent">TREND</span>Admin
                        </span>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 
                                    ${isActive
                                            ? 'bg-accent text-slate-900 font-bold shadow-md'
                                            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-slate-900 font-bold">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-gray-400 rounded-lg transition-colors text-sm"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden text-gray-600 hover:text-primary"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Search (Placeholder) */}
                    <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders, products, or users..."
                            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700"
                        />
                    </div>

                    {/* Notifications */}
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
