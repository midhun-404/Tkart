import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
    DollarSign, ShoppingCart, TrendingUp, Package,
    AlertCircle, Clock, XCircle, Users, Wifi
} from 'lucide-react';
import {
    LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];

const StatCard = ({ title, value, icon, colorClass, subValue }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {subValue && <p className="text-xs text-green-600 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
    </div>
);

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    // ── Real-time listeners ───────────────────────────────────────────────────
    useEffect(() => {
        let ordersReady = false, usersReady = false, productsReady = false;
        const checkReady = () => { if (ordersReady && usersReady && productsReady) setLoading(false); };

        const unsubOrders = onSnapshot(
            query(collection(db, 'orders'), orderBy('created_at', 'desc')),
            (snap) => {
                setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLastUpdated(new Date());
                ordersReady = true; checkReady();
            },
            (err) => { console.error('Orders listener:', err); ordersReady = true; checkReady(); }
        );

        const unsubUsers = onSnapshot(
            collection(db, 'users'),
            (snap) => {
                setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                usersReady = true; checkReady();
            },
            (err) => { console.error('Users listener:', err); usersReady = true; checkReady(); }
        );

        const unsubProducts = onSnapshot(
            collection(db, 'products'),
            (snap) => {
                setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                productsReady = true; checkReady();
            },
            (err) => { console.error('Products listener:', err); productsReady = true; checkReady(); }
        );

        return () => { unsubOrders(); unsubUsers(); unsubProducts(); };
    }, []);

    // ── Derived stats (re-computed whenever data changes) ─────────────────────
    const stats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const isToday = (o) => {
            const d = o.created_at || o.createdAt;
            return d ? new Date(d).getTime() >= today : false;
        };

        const totalRevenue = orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
        const totalProfit = orders.reduce((s, o) => s + (Number(o.total_profit) || 0), 0);
        const todayOrders = orders.filter(isToday);
        const todayRevenue = todayOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
        const pendingOrders = orders.filter(o => o.order_status === 'Pending').length;
        const cancelledOrders = orders.filter(o => o.order_status === 'Cancelled').length;
        const lowStockProducts = products.filter(p => (Number(p.stock) || 0) < 10).length;

        // Revenue trend: last 7 orders
        const revenueData = [...orders].slice(0, 7).reverse().map(o => {
            const d = o.created_at || o.createdAt;
            return {
                name: d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short' }) : 'N/A',
                revenue: Number(o.total_amount) || 0,
                profit: Number(o.total_profit) || 0
            };
        });

        // Pie chart data
        const orderStatusData = [
            { name: 'Pending', value: pendingOrders },
            { name: 'Shipped', value: orders.filter(o => o.order_status === 'Shipped').length },
            { name: 'Delivered', value: orders.filter(o => o.order_status === 'Delivered').length },
            { name: 'Cancelled', value: cancelledOrders },
        ];

        return {
            totalRevenue, totalProfit, totalOrders: orders.length,
            totalUsers: users.length, totalProducts: products.length,
            todayRevenue, todayOrders: todayOrders.length,
            pendingOrders, cancelledOrders, lowStockProducts,
            revenueData, orderStatusData
        };
    }, [orders, users, products]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Connecting to live data...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-serif text-slate-800">Dashboard Overview</h1>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                    <Wifi size={14} className="animate-pulse" />
                    LIVE
                    {lastUpdated && (
                        <span className="text-gray-400 font-normal">
                            · {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign size={24} className="text-emerald-600" />}
                    colorClass="bg-emerald-100"
                    subValue={`+₹${stats.todayRevenue.toLocaleString()} today`} />
                <StatCard title="Total Orders" value={stats.totalOrders}
                    icon={<ShoppingCart size={24} className="text-blue-600" />}
                    colorClass="bg-blue-100"
                    subValue={`+${stats.todayOrders} today`} />
                <StatCard title="Total Profit" value={`₹${stats.totalProfit.toLocaleString()}`}
                    icon={<TrendingUp size={24} className="text-amber-600" />}
                    colorClass="bg-amber-100" />
                <StatCard title="Total Users" value={stats.totalUsers}
                    icon={<Users size={24} className="text-purple-600" />}
                    colorClass="bg-purple-100" />
                <StatCard title="Total Products" value={stats.totalProducts}
                    icon={<Package size={24} className="text-indigo-600" />}
                    colorClass="bg-indigo-100" />
                <StatCard title="Pending Orders" value={stats.pendingOrders}
                    icon={<Clock size={24} className="text-orange-600" />}
                    colorClass="bg-orange-100" />
                <StatCard title="Cancelled" value={stats.cancelledOrders}
                    icon={<XCircle size={24} className="text-gray-600" />}
                    colorClass="bg-gray-100" />
                <StatCard title="Low Stock Items" value={stats.lowStockProducts}
                    icon={<AlertCircle size={24} className="text-red-600" />}
                    colorClass="bg-red-100" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Orders Trend</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Order Status</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.orderStatusData} cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    paddingAngle={4} dataKey="value"
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : null}
                                    labelLine={false}
                                >
                                    {stats.orderStatusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Orders Quick View */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="p-4 text-left">Order #</th>
                                <th className="p-4 text-left">Customer</th>
                                <th className="p-4 text-left">Amount</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.slice(0, 8).map(order => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-mono text-slate-600">#{order.id.slice(0, 8)}</td>
                                    <td className="p-4 font-medium">{order.user_name || 'Guest'}</td>
                                    <td className="p-4 font-bold text-slate-800">₹{order.total_amount}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase
                                            ${order.order_status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.order_status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                    order.order_status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                            {order.order_status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {(order.created_at || order.createdAt)
                                            ? new Date(order.created_at || order.createdAt).toLocaleDateString('en-IN')
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No orders yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
