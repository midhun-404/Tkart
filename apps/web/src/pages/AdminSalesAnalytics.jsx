import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
    ComposedChart, Area, Line, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag, Wifi } from 'lucide-react';

const AdminSalesAnalytics = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('day');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [lastUpdated, setLastUpdated] = useState(null);

    // ── Real-time listener ─────────────────────────────────────────────────────
    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLastUpdated(new Date());
            setLoading(false);
        }, err => {
            console.error('Analytics listener:', err);
            const fallback = onSnapshot(collection(db, 'orders'), (snap) => {
                setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false);
            });
            return fallback;
        });
        return unsub;
    }, []);

    // ── Derived chart data ─────────────────────────────────────────────────────
    const { chartData, totalRevenue, totalProfit, totalOrders } = useMemo(() => {
        let filtered = orders;

        if (dateRange.start) {
            filtered = filtered.filter(o => {
                const d = o.created_at || o.createdAt;
                return d ? new Date(d) >= new Date(dateRange.start) : false;
            });
        }
        if (dateRange.end) {
            const end = new Date(dateRange.end); end.setHours(23, 59, 59);
            filtered = filtered.filter(o => {
                const d = o.created_at || o.createdAt;
                return d ? new Date(d) <= end : false;
            });
        }

        const groups = {};
        filtered.forEach(order => {
            const rawDate = order.created_at || order.createdAt;
            if (!rawDate) return;
            const date = new Date(rawDate);
            let key = groupBy === 'day'
                ? date.toLocaleDateString('en-GB')
                : `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

            if (!groups[key]) {
                groups[key] = { date: key, revenue: 0, profit: 0, orders: 0, timestamp: date.getTime() };
            }
            groups[key].revenue += Number(order.total_amount) || 0;
            groups[key].profit += Number(order.total_profit) || 0;
            groups[key].orders += 1;
        });

        const chartData = Object.values(groups).sort((a, b) => a.timestamp - b.timestamp);
        const totalRevenue = filtered.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
        const totalProfit = filtered.reduce((s, o) => s + (Number(o.total_profit) || 0), 0);

        return { chartData, totalRevenue, totalProfit, totalOrders: filtered.length };
    }, [orders, groupBy, dateRange]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold font-serif text-slate-800">Sales Analytics</h1>
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                        <Wifi size={14} className="animate-pulse" /> LIVE
                        {lastUpdated && <span className="text-gray-400 font-normal">· {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white p-2 rounded-xl shadow-sm flex flex-wrap gap-2 items-center border border-gray-100">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setGroupBy('day')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${groupBy === 'day' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                            Daily
                        </button>
                        <button onClick={() => setGroupBy('month')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${groupBy === 'month' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                            Monthly
                        </button>
                    </div>
                    <div className="h-5 w-px bg-gray-200" />
                    <input type="date" value={dateRange.start}
                        onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                    <span className="text-gray-400">–</span>
                    <input type="date" value={dateRange.end}
                        onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                    {(dateRange.start || dateRange.end) && (
                        <button onClick={() => setDateRange({ start: '', end: '' })}
                            className="text-xs text-red-500 hover:text-red-700 font-bold px-2">Clear</button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full"><DollarSign size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-800">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><TrendingUp size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Profit</p>
                        <p className="text-2xl font-bold text-slate-800">₹{totalProfit.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><ShoppingBag size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-800">{totalOrders}</p>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-slate-700 mb-6">Revenue & Profit Trend</h3>
                {loading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[400px] flex items-center justify-center text-gray-400">
                        No order data for the selected period.
                    </div>
                ) : (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v.toLocaleString()}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value, name) => name === 'orders' ? value : `₹${value.toLocaleString()}`}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="orders" name="Orders" barSize={16} fill="#3B82F6" opacity={0.25} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Line type="monotone" dataKey="profit" name="Profit" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSalesAnalytics;
