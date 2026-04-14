import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';
import { Plus, Edit, Trash, X, Upload, CheckSquare, Square, Filter, ExternalLink } from 'lucide-react';

const AdminProductManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Filter State
    const [filterCategory, setFilterCategory] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        selling_price: '',
        supplier_price: '',
        stock: '',
        category: '',
        brand: '',
        discount_percentage: 0,
        is_featured: false,
        is_deal: false,
        is_active: true
    });
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(productsQuery);
            const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setProducts(prods);

            // Extract unique categories and brands from products for the filters
            const cats = [...new Set(prods.map(p => p.category).filter(Boolean))].map((name, index) => ({ id: `cat-${index}`, name }));
            const brnds = [...new Set(prods.map(p => p.brand).filter(Boolean))].map((name, index) => ({ id: `brand-${index}`, name }));

            setCategories(cats);
            setBrands(brnds);
            setLoading(false);
        } catch (error) {
            console.error("Fetch Error:", error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const base64Images = await Promise.all(files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }));
        setImages(base64Images);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const productData = {
            ...formData,
            selling_price: Number(formData.selling_price),
            supplier_price: Number(formData.supplier_price),
            stock: Number(formData.stock),
            discount_percentage: Number(formData.discount_percentage),
            images: images.length > 0 ? images : (formData.images || []),
            updatedAt: new Date().toISOString()
        };

        try {
            console.log("Submitting product data to Firestore:", productData);
            if (editMode) {
                const productRef = doc(db, 'products', currentId);
                await updateDoc(productRef, productData);
                console.log("Product updated successfully:", currentId);
            } else {
                productData.createdAt = new Date().toISOString();
                const docRef = await addDoc(collection(db, 'products'), productData);
                console.log("Product added successfully with ID:", docRef.id);
            }
            closeModal();
            fetchData();
        } catch (error) {
            console.error("CRITICAL Save Error:", error);
            // Check for potential Firestore document size limit error
            if (error.message?.includes('exceeds its maximum allowed size')) {
                alert("Error: Total product data (including images) is too large for Firestore (max 1MB). Please use smaller or fewer images.");
            } else {
                alert(`Error: ${error.message}`);
            }
        } finally {
            setSaving(false);
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteDoc(doc(db, 'products', id));
                fetchData();
            } catch (error) {
                console.error("Delete Error:", error);
                alert('Failed to delete');
            }
        }
    };

    const toggleSelect = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedProducts.length} items?`)) return;
        try {
            setSaving(true);
            await Promise.all(selectedProducts.map(id => deleteDoc(doc(db, 'products', id))));
            setSelectedProducts([]);
            fetchData();
            console.log("Bulk delete successful");
        } catch (error) {
            console.error("Bulk delete Error:", error);
            alert("Bulk delete failed");
        } finally {
            setSaving(false);
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setEditMode(true);
            setCurrentId(product.id);
            setImages(product.images || []);
            setFormData({
                title: product.title,
                description: product.description || '',
                selling_price: product.selling_price,
                supplier_price: product.supplier_price || 0,
                stock: product.stock,
                category: product.category,
                brand: product.brand,
                discount_percentage: product.discount_percentage || 0,
                is_featured: product.is_featured || false,
                is_deal: product.is_deal || false,
                is_active: product.is_active !== undefined ? product.is_active : true,
                images: product.images || []
            });
        } else {
            setEditMode(false);
            setCurrentId(null);
            setImages([]);
            setFormData({
                title: '', description: '', selling_price: '', supplier_price: '', stock: '',
                category: '', brand: '', discount_percentage: 0,
                is_featured: false, is_deal: false, is_active: true,
                images: []
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setImages([]);
    };

    const filteredProducts = filterCategory
        ? products.filter(p => p.category === filterCategory)
        : products;

    if (loading) return <div>Loading Products...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold font-serif text-primary">Product Management</h2>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-300 rounded px-4 py-2 pr-8 focus:outline-accent"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <Filter size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-emerald-800"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Add Product</span>
                    </button>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <div className="bg-slate-100 p-3 rounded flex items-center justify-between">
                    <span className="font-bold text-slate-700">{selectedProducts.length} Selected</span>
                    <button onClick={handleBulkDelete} className="text-red-600 font-bold hover:underline">
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Product List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                            <th className="p-4 w-10">
                                <button onClick={() => setSelectedProducts(selectedProducts.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id))}>
                                    {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Stats</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <button onClick={() => toggleSelect(product.id)}>
                                        {selectedProducts.includes(product.id) ? <CheckSquare size={18} className="text-accent" /> : <Square size={18} className="text-gray-400" />}
                                    </button>
                                </td>
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Upload size={16} /></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            {product.title}
                                            <Link to={`/product/${product.id}`} target="_blank" className="text-gray-400 hover:text-accent"><ExternalLink size={14} /></Link>
                                        </div>
                                        <div className="text-xs text-gray-500">{product.category} • {product.brand}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold">₹{product.selling_price}</div>
                                    {product.supplier_price && <div className="text-xs text-gray-400">Sup: ₹{product.supplier_price}</div>}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {product.stock} Units
                                    </span>
                                </td>
                                <td className="p-4 space-x-2">
                                    {product.is_featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Featured</span>}
                                    {product.is_deal && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Deal</span>}
                                    {!product.is_active && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Inactive</span>}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => openModal(product)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                    <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-700"><Trash size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto shadow-2xl">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold font-serif mb-6 text-slate-800">
                            {editMode ? 'Edit Product' : 'Add New Product'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Title</label>
                                    <input name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-accent" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full border p-2 rounded focus:ring-2 focus:ring-accent" />
                                </div>
                            </div>

                            {/* Classification */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                    <input
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="Enter Category"
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-accent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Brand</label>
                                    <input
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        placeholder="Enter Brand"
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-accent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Pricing & Stock */}
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price</label>
                                    <input name="selling_price" type="number" value={formData.selling_price} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-accent" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Supplier Price</label>
                                    <input name="supplier_price" type="number" value={formData.supplier_price} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-accent" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                                    <input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-accent" required />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex gap-6 border-t border-b py-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-medium">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-medium">Featured</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="is_deal" checked={formData.is_deal} onChange={handleChange} className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-medium">Deal of Day</span>
                                </label>
                            </div>

                            {/* Images */}
                            <div className="border border-dashed border-gray-300 p-6 rounded text-center hover:bg-gray-50 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="image-upload"
                                    accept="image/*"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center text-gray-500">
                                    <Upload size={32} className="mb-2 text-accent" />
                                    <span className="font-bold text-slate-700">Upload Images</span>
                                    <span className="text-xs">Supports multiple files</span>
                                </label>
                                {images.length > 0 && (
                                    <div className="mt-2 text-sm text-green-600 font-bold">
                                        {images.length} images selected
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full bg-primary text-white py-4 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <span>{editMode ? 'Update Product' : 'Create Product'}</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductManager;
