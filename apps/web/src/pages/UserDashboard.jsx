import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, User, LogOut, ChevronRight, Ban, Edit3, Save, X, Loader2,
    Heart, MapPin, Plus, Trash2, Star, ShoppingBag, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { useWishlist } from '../context/WishlistProvider';
import { useCart } from '../context/CartProvider';
import { db } from '../config/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;

// ─── Order History Tab ────────────────────────────────────────────────────────
const OrdersTab = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const q = query(collection(db, 'orders'), where('user_id', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const userOrders = querySnapshot.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setOrders(userOrders);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                order_status: 'Cancelled',
                updatedAt: new Date().toISOString()
            });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: 'Cancelled' } : o));
        } catch (error) {
            console.error('Cancel failed', error);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            Delivered: 'bg-green-100 text-green-700',
            Cancelled: 'bg-red-100 text-red-700',
            Placed: 'bg-blue-100 text-blue-700',
            Processing: 'bg-purple-100 text-purple-700',
            Shipped: 'bg-indigo-100 text-indigo-700',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[status] || 'bg-yellow-100 text-yellow-700'}`}>
                {status}
            </span>
        );
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
    );

    if (orders.length === 0) return (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-6">Looks like you haven't placed any orders yet.</p>
            <Link to="/catalog" className="inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm">
                Start Shopping
            </Link>
        </div>
    );

    return (
        <div className="space-y-4">
            {orders.map(order => (
                <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-md transition-all">
                    <div className="flex flex-wrap justify-between items-center px-5 py-3 bg-gray-50 border-b border-gray-100 gap-2">
                        <div className="flex items-center gap-6 text-xs text-gray-500">
                            <div>
                                <span className="uppercase tracking-wide font-bold">Order Placed</span>
                                <p className="font-bold text-gray-700 mt-0.5">
                                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="uppercase tracking-wide font-bold">Total</span>
                                <p className="font-bold text-gray-700 mt-0.5">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <span className="uppercase tracking-wide font-bold">Order #</span>
                                <p className="font-mono text-gray-700 mt-0.5">{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>
                        <StatusBadge status={order.order_status} />
                    </div>
                    <div className="p-5">
                        <div className="space-y-3 mb-4">
                            {order.items?.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    {item.image && (
                                        <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-400">Qty: {item.quantity} — ₹{item.price?.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                            {order.items?.length > 2 && (
                                <p className="text-xs text-gray-400">+{order.items.length - 2} more item(s)</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Link
                                to={`/account/orders/${order.id}`}
                                className="flex items-center gap-1.5 text-primary font-bold hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors border border-gray-200 text-sm"
                            >
                                View Details <ChevronRight size={14} />
                            </Link>
                            {(order.order_status === 'Pending' || order.order_status === 'Placed') && (
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="flex items-center gap-1.5 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors text-sm"
                                >
                                    <Ban size={14} /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Wishlist Tab ─────────────────────────────────────────────────────────────
const WishlistTab = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (item) => {
        addToCart({ id: item.id, title: item.title, selling_price: item.price, images: [item.image], image: item.image, category: item.category });
        removeFromWishlist(item.id);
    };

    if (wishlist.length === 0) return (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 text-sm mb-6">Save items you love for later!</p>
            <Link to="/catalog" className="inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm">
                Browse Products
            </Link>
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlist.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-primary/20 transition-all">
                    <Link to={`/product/${item.id}`} className="w-20 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={item.image || 'https://placehold.co/80x96?text=P'} alt={item.title} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`}>
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-2 hover:text-accent transition-colors">{item.title}</h4>
                        </Link>
                        <p className="font-bold text-primary mt-1">₹{item.price?.toLocaleString('en-IN')}</p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => handleMoveToCart(item)}
                                className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                            >
                                <ShoppingBag size={12} /> Move to Cart
                            </button>
                            <button
                                onClick={() => removeFromWishlist(item.id)}
                                className="flex items-center gap-1 text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                            >
                                <Trash2 size={12} /> Remove
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Addresses Tab ────────────────────────────────────────────────────────────
const AddressesTab = ({ user }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', city: '', state: '', zip: '' });

    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    setAddresses(snap.data().addresses || []);
                }
            } catch (e) {
                console.error('Failed to load addresses:', e);
            } finally {
                setLoading(false);
            }
        };
        loadAddresses();
    }, [user.uid]);

    const handleSave = async () => {
        if (!newAddress.address || !newAddress.city || !newAddress.phone) {
            alert('Please fill all required fields.');
            return;
        }
        setSaving(true);
        const updated = [...addresses, { ...newAddress, id: Date.now().toString(), isDefault: addresses.length === 0 }];
        try {
            await setDoc(doc(db, 'users', user.uid), { addresses: updated }, { merge: true });
            setAddresses(updated);
            setAdding(false);
            setNewAddress({ name: '', phone: '', address: '', city: '', state: '', zip: '' });
        } catch (e) {
            console.error('Failed to save address:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const updated = addresses.filter(a => a.id !== id);
        try {
            await setDoc(doc(db, 'users', user.uid), { addresses: updated }, { merge: true });
            setAddresses(updated);
        } catch (e) {
            console.error('Failed to delete address:', e);
        }
    };

    const handleSetDefault = async (id) => {
        const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
        try {
            await setDoc(doc(db, 'users', user.uid), { addresses: updated }, { merge: true });
            setAddresses(updated);
        } catch (e) {
            console.error('Failed to set default:', e);
        }
    };

    if (loading) return <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-28" />)}</div>;

    return (
        <div className="space-y-4">
            {addresses.length === 0 && !adding && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <MapPin size={44} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="font-bold text-gray-600 mb-1">No saved addresses</h3>
                    <p className="text-gray-400 text-sm">Add an address for faster checkout next time!</p>
                </div>
            )}

            {addresses.map(addr => (
                <div key={addr.id} className={`relative border rounded-2xl p-5 transition-all ${addr.isDefault ? 'border-accent bg-accent/5' : 'border-gray-200'}`}>
                    {addr.isDefault && (
                        <span className="absolute top-4 right-4 text-xs bg-accent text-primary font-bold px-2.5 py-1 rounded-full">Default</span>
                    )}
                    <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold text-gray-800">{addr.name || user.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{addr.address}, {addr.city}, {addr.state} - {addr.zip}</p>
                            <p className="text-sm text-gray-500">📞 {addr.phone}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4 pl-7">
                        {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-accent font-bold hover:underline">Set as Default</button>
                        )}
                        <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-400 hover:text-red-600 font-bold hover:underline">Delete</button>
                    </div>
                </div>
            ))}

            {adding ? (
                <div className="border border-accent/30 rounded-2xl p-5 bg-accent/5 space-y-3">
                    <h4 className="font-bold text-gray-800 mb-3">New Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { label: 'Name', key: 'name', placeholder: 'Full name' },
                            { label: 'Phone *', key: 'phone', placeholder: '+91 98765...' },
                            { label: 'Address *', key: 'address', placeholder: 'Street, area', span: true },
                            { label: 'City *', key: 'city', placeholder: 'Mumbai' },
                            { label: 'State', key: 'state', placeholder: 'Maharashtra' },
                            { label: 'PIN Code', key: 'zip', placeholder: '400001' },
                        ].map(({ label, key, placeholder, span }) => (
                            <div key={key} className={span ? 'sm:col-span-2' : ''}>
                                <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
                                <input
                                    value={newAddress[key]}
                                    onChange={e => setNewAddress(p => ({ ...p, [key]: e.target.value }))}
                                    placeholder={placeholder}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors disabled:opacity-60">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {saving ? 'Saving...' : 'Save Address'}
                        </button>
                        <button onClick={() => setAdding(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-2xl hover:border-primary hover:text-primary transition-all w-full justify-center text-sm">
                    <Plus size={16} /> Add New Address
                </button>
            )}
        </div>
    );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = ({ user }) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || user?.displayName || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!name.trim()) { setError('Name cannot be empty.'); return; }
        setSaving(true);
        setError('');
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { name: name.trim() }, { merge: true });
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Profile update failed:', err);
            setError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-lg space-y-6">
            {saved && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                    <CheckCircle size={16} /> Profile updated successfully!
                </div>
            )}

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold font-serif">
                        {(user.name || user.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{user.name || user.displayName || 'User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>

                {/* Display Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Display Name</label>
                    {editing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border border-accent rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    ) : (
                        <p className="text-gray-800 font-bold text-lg">{name || '—'}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <p className="text-gray-800 font-medium">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
                </div>

                {/* Role */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Account Type</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user?.role === 'admin' ? '⚡ Administrator' : '👤 Customer'}
                    </span>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3">
                {editing ? (
                    <>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm disabled:opacity-60">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={() => { setEditing(false); setName(user?.name || user?.displayName || ''); setError(''); }} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                            <X size={14} /> Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        <Edit3 size={14} /> Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const TABS = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'profile', label: 'Profile', icon: User },
];

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const { wishlist } = useWishlist();
    const [activeTab, setActiveTab] = useState('orders');

    if (!user) return (
        <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
            <div>
                <User size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-600 mb-2">Please Login</h2>
                <p className="text-gray-400 text-sm">You need to be logged in to view your account.</p>
            </div>
        </div>
    );

    const displayName = user.name || user.displayName || 'User';
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-serif font-bold text-primary mb-8">My Account</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* User Card */}
                            <div className="p-6 bg-gradient-to-br from-primary to-slate-800 text-white">
                                <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-primary text-xl font-bold font-serif mb-3">
                                    {initials}
                                </div>
                                <h3 className="font-bold text-white truncate">{displayName}</h3>
                                <p className="text-sm text-gray-400 truncate">{user.email}</p>
                                {user.role === 'admin' && (
                                    <span className="inline-block mt-2 text-xs bg-purple-500/30 text-purple-200 font-bold px-2 py-0.5 rounded">Administrator</span>
                                )}
                            </div>
                            <nav className="p-3">
                                {TABS.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1
                                                ${activeTab === tab.id
                                                    ? 'bg-accent/15 text-primary font-bold'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                                                }`}
                                        >
                                            <Icon size={18} className={activeTab === tab.id ? 'text-accent' : ''} />
                                            <span>{tab.label}</span>
                                            {tab.id === 'wishlist' && wishlist.length > 0 && (
                                                <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{wishlist.length}</span>
                                            )}
                                        </button>
                                    );
                                })}
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all text-sm font-medium"
                                    >
                                        <LogOut size={18} /> Logout
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                        {activeTab === 'orders' && (
                            <>
                                <h2 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
                                    <Package size={22} className="text-accent" /> Order History
                                </h2>
                                <OrdersTab user={user} />
                            </>
                        )}
                        {activeTab === 'wishlist' && (
                            <>
                                <h2 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
                                    <Heart size={22} className="text-red-400" /> My Wishlist
                                </h2>
                                <WishlistTab />
                            </>
                        )}
                        {activeTab === 'addresses' && (
                            <>
                                <h2 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
                                    <MapPin size={22} className="text-accent" /> Saved Addresses
                                </h2>
                                <AddressesTab user={user} />
                            </>
                        )}
                        {activeTab === 'profile' && <ProfileTab user={user} />}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
