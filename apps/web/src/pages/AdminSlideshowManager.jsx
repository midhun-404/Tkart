import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';
import { Plus, Edit, Trash, X, Upload, CheckSquare, Square, Image as ImageIcon, Wifi } from 'lucide-react';

const AdminSlideshowManager = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedSlides, setSelectedSlides] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        link: '',
        isActive: true,
        order: 0,
    });
    const [image, setImage] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'slideshow'), orderBy('order', 'asc'));
        const unsub = onSnapshot(q, (snap) => {
            setSlides(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLastUpdated(new Date());
            setLoading(false);
        }, err => {
            console.error('Slideshow listener:', err);
            setLoading(false);
        });
        return unsub;
    }, []);

    // Remove old fetchData - not needed with onSnapshot

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert("Image is required.");
            return;
        }

        setSaving(true);

        const slideData = {
            ...formData,
            order: Number(formData.order) || 0,
            image: image,
            updatedAt: new Date().toISOString()
        };

        try {
            if (editMode) {
                await updateDoc(doc(db, 'slideshow', currentId), slideData);
            } else {
                slideData.createdAt = new Date().toISOString();
                await addDoc(collection(db, 'slideshow'), slideData);
            }
            closeModal();
            // onSnapshot auto-refreshes the list
        } catch (error) {
            console.error("Save Error:", error);
            if (error.message?.includes('exceeds its maximum allowed size')) {
                alert("Error: Image is too large for Firestore (max 1MB). Please use a smaller image.");
            } else {
                alert(`Error: ${error.message}`);
            }
        } finally {
            setSaving(false);
        }
    };

    const deleteSlide = async (id) => {
        if (!window.confirm('Delete this slide?')) return;
        try {
            await deleteDoc(doc(db, 'slideshow', id));
            // onSnapshot auto-refreshes
        } catch (error) {
            console.error('Delete Error:', error);
            alert('Failed to delete slide');
        }
    };

    const toggleSelect = (id) => {
        setSelectedSlides(prev =>
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedSlides.length} slide(s)?`)) return;
        try {
            setSaving(true);
            await Promise.all(selectedSlides.map(id => deleteDoc(doc(db, 'slideshow', id))));
            setSelectedSlides([]);
            // onSnapshot auto-refreshes
        } catch (error) {
            console.error('Bulk delete Error:', error);
            alert('Bulk delete failed');
        } finally {
            setSaving(false);
        }
    };

    const openModal = (slide = null) => {
        if (slide) {
            setEditMode(true);
            setCurrentId(slide.id);
            setImage(slide.image);
            setFormData({
                title: slide.title || '',
                link: slide.link || '',
                isActive: slide.isActive !== undefined ? slide.isActive : true,
                order: slide.order || 0
            });
        } else {
            setEditMode(false);
            setCurrentId(null);
            setImage('');
            setFormData({
                title: '',
                link: '',
                isActive: true,
                order: slides.length
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setImage('');
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold font-serif text-slate-800">Slideshow Management</h2>
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                        <Wifi size={14} className="animate-pulse" /> LIVE
                        {lastUpdated && <span className="text-gray-400 font-normal">· {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
                    </div>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-emerald-800 transition shadow"
                >
                    <Plus size={20} />
                    <span>Add Slide</span>
                </button>
            </div>

            {/* Bulk Actions */}
            {selectedSlides.length > 0 && (
                <div className="bg-slate-100 p-3 rounded flex items-center justify-between">
                    <span className="font-bold text-slate-700">{selectedSlides.length} Selected</span>
                    <button onClick={handleBulkDelete} className="text-red-600 font-bold hover:underline">
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Slide List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                            <th className="p-4 w-10">
                                <button onClick={() => setSelectedSlides(selectedSlides.length === slides.length ? [] : slides.map(s => s.id))}>
                                    {selectedSlides.length === slides.length && slides.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="p-4">Image</th>
                            <th className="p-4">Title & Link</th>
                            <th className="p-4">Order</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {slides.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-6 text-center text-gray-500">
                                    No slide banners found. Click "Add Slide" to create one.
                                </td>
                            </tr>
                        )}
                        {slides.map(slide => (
                            <tr key={slide.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <button onClick={() => toggleSelect(slide.id)}>
                                        {selectedSlides.includes(slide.id) ? <CheckSquare size={18} className="text-accent" /> : <Square size={18} className="text-gray-400" />}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <div className="w-32 h-16 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                                        {slide.image ? (
                                            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{slide.title || 'Untitled Slide'}</div>
                                    <div className="text-xs text-gray-500 max-w-xs truncate">{slide.link || 'No Link'}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold">{slide.order}</div>
                                </td>
                                <td className="p-4">
                                    {slide.isActive ? (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Active</span>
                                    ) : (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-medium">Inactive</span>
                                    )}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => openModal(slide)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                    <button onClick={() => deleteSlide(slide.id)} className="text-red-500 hover:text-red-700"><Trash size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 md:p-8 rounded-lg w-full max-w-xl relative max-h-[90vh] overflow-y-auto shadow-2xl">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold font-serif mb-6 text-slate-800">
                            {editMode ? 'Edit Slide' : 'Add New Slide'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Slide Image *</label>
                                <div className="border-2 border-dashed border-gray-300 p-6 rounded text-center hover:bg-gray-50 transition-colors relative">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                        required={!editMode && !image}
                                    />
                                    {image ? (
                                        <div className="flex flex-col items-center">
                                            <img src={image} alt="Preview" className="max-h-40 rounded shadow-md pointer-events-none" />
                                            <p className="text-sm text-gray-500 mt-2 pointer-events-none">Click or drag here to change image</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none pb-2 pt-2">
                                            <Upload size={32} className="mb-2 text-accent" />
                                            <span className="font-bold text-slate-700">Upload Banner Image</span>
                                            <span className="text-xs text-gray-400">Recommended size: 1200x400 (Max 1MB)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Title (Optional)</label>
                                    <input name="title" value={formData.title} onChange={handleChange} placeholder="Summer Sale" className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-accent" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Redirect Link (Optional)</label>
                                        <input name="link" value={formData.link} onChange={handleChange} placeholder="/catalog or https://..." className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-accent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Display Order</label>
                                        <input name="order" type="number" value={formData.order} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-accent" />
                                    </div>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex gap-6 border-t pt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-accent rounded" />
                                    <span className="text-sm font-medium">Show on Homepage (Active)</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full bg-primary text-white py-3.5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800 hover:-translate-y-0.5'}`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving Slide...</span>
                                    </>
                                ) : (
                                    <span>{editMode ? 'Update Slide' : 'Create Slide'}</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSlideshowManager;
