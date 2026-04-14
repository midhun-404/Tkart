import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, X, Search } from 'lucide-react';
import Pagination from '../components/Pagination';

const Catalog = () => {
    const location = useLocation();
    const navigate = useNavigate();
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
    const itemsPerPage = 12;

    // Derived Data for Filters
    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    const brands = ['All', ...new Set(products.map(p => p.brand).filter(Boolean))];

    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';
    const categoryParam = searchParams.get('category') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const productsCol = collection(db, 'products');
                const productSnapshot = await getDocs(productsCol);
                // Filter only active products
                const productList = productSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(p => p.is_active !== false); // only active products
                setProducts(productList);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Update selected category from URL
    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        } else {
            setSelectedCategory('All');
        }
    }, [categoryParam]);

    // Filtering & Sorting Logic
    useEffect(() => {
        let result = [...products];

        // 1. Search
        if (searchQuery) {
            result = result.filter(product =>
                product.title?.toLowerCase().includes(searchQuery) ||
                product.description?.toLowerCase().includes(searchQuery) ||
                product.category?.toLowerCase().includes(searchQuery) ||
                product.brand?.toLowerCase().includes(searchQuery)
            );
        }

        // 2. Category
        if (selectedCategory !== 'All') {
            result = result.filter(product =>
                product.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // 3. Brand
        if (selectedBrand !== 'All') {
            result = result.filter(product => product.brand === selectedBrand);
        }

        // 4. Price
        result = result.filter(product => {
            const price = Number(product.selling_price || product.price || 0);
            return price <= priceRange;
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
            case 'discount':
                result.sort((a, b) => (Number(b.discount_percentage || 0) - Number(a.discount_percentage || 0)));
                break;
            default: // Newest
                result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
        }

        setFilteredProducts(result);
        setCurrentPage(1);
    }, [products, selectedCategory, selectedBrand, priceRange, sortBy, onlyInStock, searchQuery]);

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
        navigate('/catalog'); // clear URL too
    };

    const hasActiveFilters = selectedCategory !== 'All' || selectedBrand !== 'All' || priceRange < 100000 || onlyInStock || searchQuery;

    const removeFilter = (type) => {
        if (type === 'category') setSelectedCategory('All');
        if (type === 'brand') setSelectedBrand('All');
        if (type === 'price') setPriceRange(100000);
        if (type === 'stock') setOnlyInStock(false);
        if (type === 'search') navigate('/catalog');
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">

                {/* Page Title */}
                <div className="mb-6">
                    <h1 className="text-3xl font-serif font-bold text-primary">
                        {searchQuery ? `Search: "${searchQuery}"` : selectedCategory !== 'All' ? selectedCategory : 'All Products'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
                </div>

                {/* Active Filter Pills */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {searchQuery && (
                            <FilterPill label={`Search: "${searchQuery}"`} onRemove={() => removeFilter('search')} />
                        )}
                        {selectedCategory !== 'All' && (
                            <FilterPill label={`Category: ${selectedCategory}`} onRemove={() => removeFilter('category')} />
                        )}
                        {selectedBrand !== 'All' && (
                            <FilterPill label={`Brand: ${selectedBrand}`} onRemove={() => removeFilter('brand')} />
                        )}
                        {priceRange < 100000 && (
                            <FilterPill label={`Max Price: ₹${priceRange.toLocaleString('en-IN')}`} onRemove={() => removeFilter('price')} />
                        )}
                        {onlyInStock && (
                            <FilterPill label="In Stock Only" onRemove={() => removeFilter('stock')} />
                        )}
                        <button onClick={clearFilters} className="text-xs text-red-500 font-bold hover:underline px-2">
                            Clear All
                        </button>
                    </div>
                )}

                {/* Mobile Filter Button */}
                <div className="md:hidden mb-4">
                    <button
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="flex items-center gap-2 w-full justify-center bg-white p-3 rounded-xl shadow-sm font-bold text-gray-700 border border-gray-200"
                    >
                        <Filter size={18} /> {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                        {hasActiveFilters && <span className="bg-accent text-primary text-xs font-bold px-2 py-0.5 rounded-full">Active</span>}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <aside className={`md:w-60 flex-shrink-0 ${mobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                                    <SlidersHorizontal size={18} className="text-accent" /> Filters
                                </h3>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="text-xs text-red-500 font-bold hover:underline">Clear All</button>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="mb-5 pb-5 border-b border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Category</h4>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                    {categories.map(cat => (
                                        <label key={cat} className="flex items-center space-x-2.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="w-3.5 h-3.5 accent-primary"
                                            />
                                            <span className={`text-sm ${selectedCategory === cat ? 'font-bold text-primary' : 'text-gray-600'}`}>
                                                {cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brands */}
                            {brands.length > 1 && (
                                <div className="mb-5 pb-5 border-b border-gray-100">
                                    <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Brand</h4>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                        {brands.map(brand => (
                                            <label key={brand} className="flex items-center space-x-2.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                                                <input
                                                    type="radio"
                                                    name="brand"
                                                    checked={selectedBrand === brand}
                                                    onChange={() => setSelectedBrand(brand)}
                                                    className="w-3.5 h-3.5 accent-primary"
                                                />
                                                <span className={`text-sm ${selectedBrand === brand ? 'font-bold text-primary' : 'text-gray-600'}`}>
                                                    {brand}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Slider */}
                            <div className="mb-5 pb-5 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Max Price</h4>
                                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">₹{priceRange.toLocaleString('en-IN')}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100000"
                                    step="500"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full h-1.5 rounded-lg cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>₹0</span>
                                    <span>₹1L</span>
                                </div>
                            </div>

                            {/* Availability */}
                            <div>
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={onlyInStock}
                                        onChange={(e) => setOnlyInStock(e.target.checked)}
                                        className="w-4 h-4 rounded accent-primary"
                                    />
                                    <span className="font-medium text-gray-700 text-sm">In Stock Only</span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {/* Sorting Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-5 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-3">
                            <p className="text-gray-500 text-sm">
                                Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> result{filteredProducts.length !== 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-white border p-2 focus:ring-2 focus:ring-accent/30 focus:outline-none cursor-pointer"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="discount">Biggest Discount</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                        <div className="aspect-[3/4] bg-gray-200" />
                                        <div className="p-4 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                                            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Search size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-xl text-gray-500 font-bold">No products found</p>
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
                                <button onClick={clearFilters} className="mt-4 text-accent font-bold hover:underline text-sm">Clear all filters</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

const FilterPill = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-full">
        {label}
        <button onClick={onRemove} className="hover:text-red-300 transition-colors">
            <X size={12} />
        </button>
    </span>
);

export default Catalog;
