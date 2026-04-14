import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { Filter, DollarSign, Wifi, Eye } from 'lucide-react';

const getStatusColor = (status) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-700';
        case 'Placed': return 'bg-blue-100 text-blue-700';
        case 'Processing': return 'bg-indigo-100 text-indigo-700';
        case 'Shipped': return 'bg-purple-100 text-purple-700';
        case 'Delivered': return 'bg-green-100 text-green-700';
        case 'Cancelled': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const PaymentBadge = ({ method, status }) => (
    <div className="flex flex-col items-start gap-0.5">
        <span className="font-bold text-xs uppercase text-slate-700">{method || '—'}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {status || 'Pending'}
        </span>
    </div>
);

const AdminOrderManager = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [lastUpdated, setLastUpdated] = useState(null);

    // ── Real-time listener ─────────────────────────────────────────────────────
    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setAllOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLastUpdated(new Date());
            setLoading(false);
        }, (err) => {
            console.error('Orders listener error:', err);
            // Fallback without ordering if index missing
            const fallback = onSnapshot(collection(db, 'orders'), (snap) => {
                setAllOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false);
            });
            return fallback;
        });
        return unsub;
    }, []);

    // ── Client-side filtering ──────────────────────────────────────────────────
    const orders = useMemo(() => {
        let result = [...allOrders];
        if (statusFilter) result = result.filter(o => o.order_status === statusFilter);
        if (paymentFilter) result = result.filter(o => o.payment_method === paymentFilter);
        if (dateRange.start) result = result.filter(o => {
            const d = o.created_at || o.createdAt;
            return d ? new Date(d) >= new Date(dateRange.start) : false;
        });
        if (dateRange.end) {
            const end = new Date(dateRange.end); end.setHours(23, 59, 59);
            result = result.filter(o => {
                const d = o.created_at || o.createdAt;
                return d ? new Date(d) <= end : false;
            });
        }
        return result;
    }, [allOrders, statusFilter, paymentFilter, dateRange]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'orders', id), {
                order_status: newStatus,
                updatedAt: new Date().toISOString()
            });
            // onSnapshot auto-updates the list
        } catch (error) {
            console.error('Status Update Error', error);
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-serif text-slate-800">Order Management</h1>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                    <Wifi size={14} className="animate-pulse" /> LIVE
                    {lastUpdated && (
                        <span className="text-gray-400 font-normal">
                            · {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-end border border-gray-100">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                    <div className="relative">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent w-40">
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Placed">Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <Filter size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Payment</label>
                    <div className="relative">
                        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent w-40">
                            <option value="">All Methods</option>
                            <option value="COD">COD</option>
                            <option value="razorpay">Online (Razorpay)</option>
                        </select>
                        <DollarSign size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Date Range</label>
                    <div className="flex gap-2 items-center">
                        <input type="date" value={dateRange.start}
                            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                        <span className="text-gray-400">–</span>
                        <input type="date" value={dateRange.end}
                            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    </div>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    <span className="text-sm text-gray-500 font-medium">
                        Showing <strong>{orders.length}</strong> of <strong>{allOrders.length}</strong> orders
                    </span>
                    <button onClick={() => { setStatusFilter(''); setPaymentFilter(''); setDateRange({ start: '', end: '' }); }}
                        className="text-sm text-red-500 hover:text-red-700 font-bold">
                        Reset
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="p-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="6" className="p-10 text-center text-gray-400">No orders match the current filters.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono text-sm text-slate-600">#{order.id.slice(0, 8)}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{order.user_name || 'Guest'}</div>
                                            <div className="text-xs text-gray-400">{order.user_email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {(order.created_at || order.createdAt)
                                                ? new Date(order.created_at || order.createdAt).toLocaleDateString('en-IN')
                                                : '—'}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">₹{order.total_amount}</div>
                                            {order.total_profit > 0 && <div className="text-xs text-green-600">Profit: ₹{order.total_profit}</div>}
                                        </td>
                                        <td className="p-4"><PaymentBadge method={order.payment_method} status={order.payment_status} /></td>
                                        <td className="p-4">
                                            <select value={order.order_status || 'Pending'}
                                                onChange={e => handleStatusUpdate(order.id, e.target.value)}
                                                className={`text-xs font-bold px-2 py-1.5 rounded-lg cursor-pointer border-0 focus:ring-2 focus:ring-accent ${getStatusColor(order.order_status)}`}>
                                                <option value="Pending">Pending</option>
                                                <option value="Placed">Placed</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderManager;
