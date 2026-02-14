import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';
import { Calendar, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';

const AdminSalesAnalytics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [groupBy, setGroupBy] = useState('day'); // 'day' or 'month'

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, groupBy]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
            const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Grouping Logic
            const groups = {};
            orders.forEach(order => {
                const date = new Date(order.createdAt);
                let key = '';
                if (groupBy === 'day') {
                    key = date.toLocaleDateString('en-GB'); // DD/MM/YYYY
                } else {
                    key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                }

                if (!groups[key]) {
                    groups[key] = { date: key, revenue: 0, profit: 0, orders: 0, timestamp: date.getTime() };
                }
                groups[key].revenue += Number(order.total_amount) || 0;
                groups[key].profit += Number(order.total_profit) || 0;
                groups[key].orders += 1;
            });

            const sortedData = Object.values(groups).sort((a, b) => a.timestamp - b.timestamp);
            setData(sortedData);
            setLoading(false);
        } catch (error) {
            console.error("Analytics Fetch Error", error);
            setLoading(false);
        }
    };

    // Calculate Summaries
    const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalProfit = data.reduce((acc, curr) => acc + curr.profit, 0);
    const totalOrders = data.reduce((acc, curr) => acc + curr.orders, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold font-serif text-charcoal">Sales Analytics</h1>

                {/* Controls */}
                <div className="bg-white p-2 rounded shadow-sm flex flex-wrap gap-2 items-center">
                    <div className="flex bg-gray-100 rounded p-1">
                        <button
                            onClick={() => setGroupBy('day')}
                            className={`px-3 py-1 rounded text-sm font-bold ${groupBy === 'day' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setGroupBy('month')}
                            className={`px-3 py-1 rounded text-sm font-bold ${groupBy === 'month' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                        >
                            Monthly
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    <div className="flex gap-2 items-center">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-accent"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-accent"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase">Total Revenue</div>
                        <div className="text-2xl font-bold text-slate-800">₹{totalRevenue.toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase">Total Profit</div>
                        <div className="text-2xl font-bold text-slate-800">₹{totalProfit.toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase">Total Orders</div>
                        <div className="text-2xl font-bold text-slate-800">{totalOrders}</div>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-slate-700 mb-6">Revenue & Profit Trend</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            <Bar dataKey="orders" name="Orders" barSize={20} fill="#3B82F6" opacity={0.3} yAxisId={0} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            <Line type="monotone" dataKey="profit" name="Profit" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminSalesAnalytics;
