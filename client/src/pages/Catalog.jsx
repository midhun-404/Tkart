import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import Pagination from '../components/Pagination';

const Catalog = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Filter States
    const [priceRange, setPriceRange] = useState(100000);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [onlyInStock, setOnlyInStock] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Derived Data for Filters
    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    const brands = ['All', ...new Set(products.map(p => p.brand).filter(Boolean))];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const productsCol = collection(db, 'products');
                const productSnapshot = await getDocs(productsCol);
                const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(productList);
                setFilteredProducts(productList);

                // Initial URL Filter
                const searchParams = new URLSearchParams(location.search);
                const categoryParam = searchParams.get('category');

                if (categoryParam) {
                    setSelectedCategory(categoryParam);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [location.search]);

    // Filtering & Sorting Logic
    useEffect(() => {
        let result = [...products];
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search')?.toLowerCase() || '';

        // 1. Search
        if (searchQuery) {
            result = result.filter(product =>
                product.title.toLowerCase().includes(searchQuery) ||
                product.description?.toLowerCase().includes(searchQuery) ||
                product.category?.toLowerCase().includes(searchQuery) ||
                product.brand?.toLowerCase().includes(searchQuery)
            );
        }

        // 2. Category
        if (selectedCategory !== 'All') {
            result = result.filter(product => product.category === selectedCategory);
        }

        // 3. Brand
        if (selectedBrand !== 'All') {
            result = result.filter(product => product.brand === selectedBrand);
        }

        // 4. Price
        result = result.filter(product => {
            const price = product.selling_price || product.price || 0;
            return Number(price) <= priceRange;
        });

        // 5. Availability
        if (onlyInStock) {
            result = result.filter(product => Number(product.stock) > 0);
        }

        // 6. Sorting
        switch (sortBy) {
            case 'price_low':
                result.sort((a, b) => (Number(a.selling_price || a.price) - Number(b.selling_price || b.price)));
                break;
            case 'price_high':
                result.sort((a, b) => (Number(b.selling_price || b.price) - Number(a.selling_price || a.price)));
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default: // Newest
                // Assuming createdAt or just default order
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        setFilteredProducts(result);
        setCurrentPage(1); // Reset page on filter change
    }, [products, selectedCategory, selectedBrand, priceRange, sortBy, onlyInStock, location.search]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const clearFilters = () => {
        setSelectedCategory('All');
        setSelectedBrand('All');
        setPriceRange(100000);
        setSortBy('newest');
        setOnlyInStock(false);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">

                {/* Mobile Filter Button */}
                <div className="md:hidden mb-4">
                    <button
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="flex items-center gap-2 w-full justify-center bg-white p-3 rounded-lg shadow-sm font-bold text-gray-700 border"
                    >
                        <Filter size={18} /> {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`md:w-1/4 ${mobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-serif font-bold text-xl flex items-center gap-2">
                                    <SlidersHorizontal size={20} /> Filters
                                </h3>
                                {(selectedCategory !== 'All' || selectedBrand !== 'All' || priceRange < 100000 || onlyInStock) && (
                                    <button onClick={clearFilters} className="text-xs text-red-500 font-bold hover:underline">Clear All</button>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-800 mb-3">Category</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {categories.map(cat => (
                                        <label key={cat} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="text-primary focus:ring-primary h-4 w-4"
                                            />
                                            <span className={`text-sm ${selectedCategory === cat ? 'font-bold text-primary' : 'text-gray-600'}`}>
                                                {cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brands */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-800 mb-3">Brand</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                    {brands.map(brand => (
                                        <label key={brand} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                            <input
                                                type="radio"
                                                name="brand"
                                                checked={selectedBrand === brand}
                                                onChange={() => setSelectedBrand(brand)}
                                                className="text-primary focus:ring-primary h-4 w-4"
                                            />
                                            <span className={`text-sm ${selectedBrand === brand ? 'font-bold text-primary' : 'text-gray-600'}`}>
                                                {brand}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Slider */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-gray-800">Max Price</h4>
                                    <span className="text-sm font-bold text-primary">₹{priceRange}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100000"
                                    step="1000"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>₹0</span>
                                    <span>₹1L</span>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="mb-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={onlyInStock}
                                        onChange={(e) => setOnlyInStock(e.target.checked)}
                                        className="rounded text-primary focus:ring-primary h-4 w-4"
                                    />
                                    <span className="font-medium text-gray-700">In Stock Only</span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {/* Sorting Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm mb-4 sm:mb-0">
                                Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> Results
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort By:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-gray-50 border p-2 focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentProducts.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-xl text-gray-400 font-bold">No products found</p>
                                <button onClick={clearFilters} className="text-primary hover:underline mt-2">Clear all filters</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Catalog;
