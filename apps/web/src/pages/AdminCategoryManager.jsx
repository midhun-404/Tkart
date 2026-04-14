import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Trash2, Plus, Edit2, X, Wifi } from 'lucide-react';

const AdminCategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('categories');
    const [lastUpdated, setLastUpdated] = useState(null);

    // Form States
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', image_url: '', logo_url: '' });

    // ── Real-time listeners ────────────────────────────────────────────────────
    useEffect(() => {
        let catReady = false, brandReady = false;
        const checkDone = () => { if (catReady && brandReady) setLoading(false); };

        const unsubCat = onSnapshot(
            query(collection(db, 'categories'), orderBy('name')),
            (snap) => {
                setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLastUpdated(new Date());
                catReady = true; checkDone();
            },
            (err) => { console.error('Categories listener:', err); catReady = true; checkDone(); }
        );

        const unsubBrand = onSnapshot(
            query(collection(db, 'brands'), orderBy('name')),
            (snap) => {
                setBrands(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                brandReady = true; checkDone();
            },
            (err) => { console.error('Brands listener:', err); brandReady = true; checkDone(); }
        );

        return () => { unsubCat(); unsubBrand(); };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const collectionName = activeTab === 'categories' ? 'categories' : 'brands';
        const isEdit = !!editItem;
        const payload = activeTab === 'categories'
            ? { name: formData.name, image_url: formData.image_url, updatedAt: new Date().toISOString() }
            : { name: formData.name, logo_url: formData.logo_url, updatedAt: new Date().toISOString() };

        try {
            if (isEdit) {
                await updateDoc(doc(db, collectionName, editItem.id), payload);
            } else {
                payload.createdAt = new Date().toISOString();
                await addDoc(collection(db, collectionName), payload);
            }
            setShowModal(false);
            setEditItem(null);
            setFormData({ name: '', image_url: '', logo_url: '' });
            // onSnapshot auto-refreshes the list
        } catch (error) {
            console.error('Operation failed', error);
            alert('Failed to save. Check your connection.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This might affect products using this category.')) return;
        const collectionName = activeTab === 'categories' ? 'categories' : 'brands';
        try {
            await deleteDoc(doc(db, collectionName, id));
            // onSnapshot auto-refreshes
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const openModal = (item = null) => {
        setEditItem(item);
        if (item) {
            setFormData({
                name: item.name,
                image_url: item.image_url || '',
                logo_url: item.logo_url || ''
            });
        } else {
            setFormData({ name: '', image_url: '', logo_url: '' });
        }
        setShowModal(true);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;

    const dataList = activeTab === 'categories' ? categories : brands;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-serif text-slate-800">Inventory Attributes</h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                        <Wifi size={14} className="animate-pulse" /> LIVE
                    </div>
                    <button onClick={() => openModal()}
                        className="flex items-center gap-2 bg-accent text-primary px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                        <Plus size={18} />
                        Add {activeTab === 'categories' ? 'Category' : 'Brand'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'categories' ? 'border-b-2 border-accent text-primary' : 'text-gray-500 hover:text-primary'}`}
                >
                    Categories
                </button>
                <button
                    onClick={() => setActiveTab('brands')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'brands' ? 'border-b-2 border-accent text-primary' : 'text-gray-500 hover:text-primary'}`}
                >
                    Brands
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700">ID</th>
                            {activeTab === 'categories' && <th className="p-4 font-bold text-slate-700">Image</th>}
                            {activeTab === 'brands' && <th className="p-4 font-bold text-slate-700">Logo</th>}
                            <th className="p-4 font-bold text-slate-700">Name</th>
                            <th className="p-4 font-bold text-slate-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataList.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No items found. Add one!</td></tr>
                        ) : (
                            dataList.map(item => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-gray-500">#{item.id}</td>
                                    {activeTab === 'categories' && (
                                        <td className="p-4">
                                            {item.image_url ? <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded" /> : '-'}
                                        </td>
                                    )}
                                    {activeTab === 'brands' && (
                                        <td className="p-4">
                                            {item.logo_url ? <img src={item.logo_url} alt={item.name} className="w-10 h-10 object-contain" /> : '-'}
                                        </td>
                                    )}
                                    <td className="p-4 font-medium text-slate-800">{item.name}</td>
                                    <td className="p-4 text-right space-x-3">
                                        <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-6">
                            {editItem ? `Edit ${activeTab === 'categories' ? 'Category' : 'Brand'}` : `Add ${activeTab === 'categories' ? 'Category' : 'Brand'}`}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    className="w-full border p-2 rounded focus:outline-accent"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            {activeTab === 'categories' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                                    <input
                                        className="w-full border p-2 rounded focus:outline-accent"
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            )}
                            {activeTab === 'brands' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
                                    <input
                                        className="w-full border p-2 rounded focus:outline-accent"
                                        value={formData.logo_url}
                                        onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            )}
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-slate-800">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoryManager;
