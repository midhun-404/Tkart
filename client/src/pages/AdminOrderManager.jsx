import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import {
    Filter, Calendar, DollarSign, CheckCircle, Clock, XCircle, Truck, Eye, RefreshCw
} from 'lucide-react';

const AdminOrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState(''); // Payment Method
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, paymentFilter, dateRange]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const ordersRef = collection(db, 'orders');
            let q = query(ordersRef, orderBy('created_at', 'desc'));

            // Simple status filter via query
            if (statusFilter) {
                q = query(ordersRef, where('order_status', '==', statusFilter), orderBy('created_at', 'desc'));
            }

            const querySnapshot = await getDocs(q);
            let ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // In-memory filtering for remaining criteria to avoid complex index requirements
            if (paymentFilter) {
                ordersList = ordersList.filter(o => o.payment_method === paymentFilter);
            }
            if (dateRange.start) {
                ordersList = ordersList.filter(o => new Date(o.createdAt) >= new Date(dateRange.start));
            }
            if (dateRange.end) {
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59);
                ordersList = ordersList.filter(o => new Date(o.createdAt) <= endDate);
            }

            setOrders(ordersList);
            setLoading(false);
        } catch (error) {
            console.error("Order Fetch Error", error);
            setLoading(false);
            // Fallback for missing index error
            if (error.message?.includes('index')) {
                console.warn("Falling back to full fetch due to missing index");
                const querySnapshot = await getDocs(query(collection(db, 'orders'), orderBy('created_at', 'desc')));
                setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            }
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const orderRef = doc(db, 'orders', id);
            await updateDoc(orderRef, { order_status: newStatus, updatedAt: new Date().toISOString() });
            // Optimistic Update
            setOrders(orders.map(o => o.id === id ? { ...o, order_status: newStatus } : o));
        } catch (error) {
            console.error("Status Update Error", error);
            alert("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Placed': return 'bg-blue-100 text-blue-700'; // Initial state
            case 'Processing': return 'bg-indigo-100 text-indigo-700';
            case 'Shipped': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Helper for payment badge
    const PaymentBadge = ({ method, status }) => (
        <div className="flex flex-col items-start">
            <span className="font-bold text-xs uppercase text-slate-700">{method}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {status}
            </span>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-serif text-charcoal">Order Management</h1>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-accent w-40"
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
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
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-accent w-40"
                        >
                            <option value="">All Methods</option>
                            <option value="COD">COD</option>
                            <option value="razorpay">Online (Razorpay)</option>
                        </select>
                        <DollarSign size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Date Range</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-accent"
                        />
                        <span className="self-center text-gray-400">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-accent"
                        />
                    </div>
                </div>

                <button
                    onClick={() => { setStatusFilter(''); setPaymentFilter(''); setDateRange({ start: '', end: '' }); }}
                    className="ml-auto text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                    <RefreshCw size={14} /> Reset
                </button>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700">Order ID</th>
                            <th className="p-4 font-bold text-slate-700">Customer</th>
                            <th className="p-4 font-bold text-slate-700">Date</th>
                            <th className="p-4 font-bold text-slate-700">Amount</th>
                            <th className="p-4 font-bold text-slate-700">Payment</th>
                            <th className="p-4 font-bold text-slate-700">Status</th>
                            <th className="p-4 font-bold text-slate-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center">Loading Orders...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">No orders found matching filters.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-slate-600">#{order.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{order.user_name || 'Guest/Unknown'}</div>
                                        <div className="text-xs text-gray-500">{order.user_email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {(order.createdAt || order.created_at) ? (
                                            <>
                                                {new Date(order.createdAt || order.created_at).toLocaleDateString()}
                                                <div className="text-xs text-gray-400">{new Date(order.createdAt || order.created_at).toLocaleTimeString()}</div>
                                            </>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">₹{order.total_amount}</div>
                                        <div className="text-xs text-green-600 font-medium">Profit: ₹{order.total_profit}</div>
                                    </td>
                                    <td className="p-4">
                                        <PaymentBadge method={order.payment_method} status={order.payment_status} />
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={order.order_status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            className={`text-xs font-bold px-2 py-1 rounded cursor-pointer border-none focus:ring-2 focus:ring-accent ${getStatusColor(order.order_status)}`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50" title="View Details (Coming Soon)">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrderManager;
