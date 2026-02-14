import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import {
    DollarSign, ShoppingCart, TrendingUp, Package, AlertCircle, Clock, XCircle
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


const StatCard = ({ title, value, icon, color, subValue }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {subValue && <p className="text-xs text-green-600 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            {icon}
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalProfit: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        todayRevenue: 0,
        todayOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        lowStockProducts: 0,
        revenueData: [],
        orderStatusData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch all necessary data via Client SDK to bypass Backend/ServiceAccount issues
            const [ordersSnap, usersSnap, productsSnap] = await Promise.all([
                getDocs(collection(db, 'orders')),
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'products'))
            ]);

            const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            // Helper to check if date is today
            const isToday = (o) => {
                const dateVal = o.createdAt || o.created_at;
                if (!dateVal) return false;
                const date = new Date(dateVal).getTime();
                return date >= today;
            };

            // General Stats
            const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
            const totalProfit = orders.reduce((sum, order) => sum + (Number(order.total_profit) || 0), 0);
            const totalOrders = orders.length;
            const totalUsers = users.length;
            const totalProducts = products.length;

            // Today's Stats
            const todayOrdersList = orders.filter(o => isToday(o));
            const todayRevenue = todayOrdersList.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
            const todayOrdersCount = todayOrdersList.length;

            // Status Counts
            const pendingOrders = orders.filter(o => o.order_status === 'Pending').length;
            const cancelledOrders = orders.filter(o => o.order_status === 'Cancelled').length;

            // Low Stock (Threshold < 10)
            const lowStockProducts = products.filter(p => (Number(p.stock) || 0) < 10).length;

            // Revenue Data (Last 7 orders for simplicity safely)
            const revenueData = orders.slice(-7).map(order => {
                const dateVal = order.createdAt || order.created_at;
                return {
                    name: dateVal ? new Date(dateVal).toLocaleDateString('en-US', { weekday: 'short' }) : 'N/A',
                    revenue: Number(order.total_amount) || 0,
                    profit: Number(order.total_profit) || 0
                };
            });

            // Order Status Data
            const orderStatusData = [
                { name: 'Pending', value: pendingOrders },
                { name: 'Shipped', value: orders.filter(o => o.order_status === 'Shipped').length },
                { name: 'Delivered', value: orders.filter(o => o.order_status === 'Delivered').length },
                { name: 'Cancelled', value: cancelledOrders },
            ];

            setStats({
                totalRevenue,
                totalProfit,
                totalOrders,
                totalUsers,
                totalProducts,
                todayRevenue,
                todayOrders: todayOrdersCount,
                pendingOrders,
                cancelledOrders,
                lowStockProducts,
                revenueData,
                orderStatusData
            });

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch stats", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-serif text-slate-800">Dashboard Overview</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign size={24} className="text-emerald-600" />}
                    color="bg-emerald-100"
                    subValue={`+₹${stats.todayRevenue.toLocaleString()} Today`}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={<ShoppingCart size={24} className="text-blue-600" />}
                    color="bg-blue-100"
                    subValue={`+${stats.todayOrders} Today`}
                />
                <StatCard
                    title="Total Profit"
                    value={`₹${stats.totalProfit.toLocaleString()}`}
                    icon={<TrendingUp size={24} className="text-amber-600" />}
                    color="bg-amber-100"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStockProducts}
                    icon={<AlertCircle size={24} className="text-red-600" />}
                    color="bg-red-100"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon={<Clock size={24} className="text-orange-600" />}
                    color="bg-orange-100"
                />
                <StatCard
                    title="Cancelled"
                    value={stats.cancelledOrders}
                    icon={<XCircle size={24} className="text-gray-600" />}
                    color="bg-gray-100"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Orders Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Order Status</h3>
                    <div className="h-80 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
