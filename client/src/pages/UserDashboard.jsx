import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, User, LogOut, ChevronRight, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            console.log("Fetching orders for User UID:", user.uid);
            const q = query(
                collection(db, 'orders'),
                where('user_id', '==', user.uid),
                orderBy('created_at', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Orders found:", userOrders.length, userOrders);
            setOrders(userOrders);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                order_status: 'Cancelled',
                updatedAt: new Date().toISOString()
            });
            // Update local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: 'Cancelled' } : o));
            alert("Order cancelled details.");
        } catch (error) {
            console.error("Cancel failed", error);
            alert("Failed to cancel order.");
        }
    };

    if (!user) return <div className="p-8 text-center text-xl">Please login to view dashboard.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-8">My Account</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-1/4 bg-white rounded-lg shadow-sm p-6 h-fit border border-gray-100">
                    <div className="flex items-center space-x-3 mb-8 pb-6 border-b">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold font-serif">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-primary truncate">{user.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <nav className="space-y-2">
                        <button className="flex items-center space-x-3 w-full p-3 rounded-lg bg-accent/10 text-accent font-bold">
                            <Package size={20} />
                            <span>My Orders</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                            <User size={20} />
                            <span>Profile Details</span>
                        </button>
                        <button onClick={logout} className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 text-red-500 mt-4 border-t pt-4 transition-colors">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h2 className="text-2xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
                        <Package /> Order History
                    </h2>

                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="grid gap-6">
                            {orders.map(order => (
                                <div key={order.id} className="border rounded-lg p-5 hover:border-primary/30 transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Order Placed</p>
                                            <p className="font-bold text-gray-800">
                                                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                                            <p className="font-bold text-gray-800">₹{order.total_amount?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Order #</p>
                                            <p className="font-mono text-sm text-gray-600">{order.id.slice(0, 8)}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${order.order_status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.order_status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                    order.order_status === 'Placed' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.order_status}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {item.image && (
                                                        <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded border" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-800 line-clamp-1">{item.title}</p>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-medium">₹{item.price}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                                        <Link
                                            to={`/account/orders/${order.id}`}
                                            className="flex items-center gap-2 text-primary font-bold hover:bg-gray-50 px-4 py-2 rounded transition-colors border border-gray-200"
                                        >
                                            View Details <ChevronRight size={16} />
                                        </Link>
                                        {(order.order_status === 'Pending' || order.order_status === 'Placed') && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded transition-colors"
                                            >
                                                <Ban size={16} /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Package size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-600 mb-2">No orders yet</h3>
                            <p className="text-gray-500">Looks like you haven't placed any orders yet.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserDashboard;
