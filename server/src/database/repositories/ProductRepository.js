const BaseRepository = require('./BaseRepository');

class ProductRepository extends BaseRepository {
    constructor() {
        super('products');
    }

    async findByCategory(category) {
        try {
            const snapshot = await this.collection.where('category', '==', category).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async findFeatured() {
        try {
            const snapshot = await this.collection.where('is_featured', '==', 1).get(); // stored as number 1/0
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async findAllWithFilters(filters) {
        try {
            // Firestore has limitations on multiple field filters. 
            // We will fetch based on the most selective filter (Category > Brand) 
            // and perform remaining filtering in memory.

            let query = this.collection;

            if (filters.category) {
                query = query.where('category', '==', filters.category);
            } else if (filters.brand) {
                query = query.where('brand', '==', filters.brand);
            }

            const snapshot = await query.get();
            let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // In-Memory Filtering for remaining fields
            if (filters.brand && filters.category) {
                products = products.filter(p => p.brand === filters.brand);
            }

            if (filters.minPrice) {
                products = products.filter(p => p.selling_price >= parseFloat(filters.minPrice));
            }

            if (filters.maxPrice) {
                products = products.filter(p => p.selling_price <= parseFloat(filters.maxPrice));
            }

            if (filters.search) {
                const term = filters.search.toLowerCase();
                products = products.filter(p =>
                    p.title.toLowerCase().includes(term) ||
                    (p.description && p.description.toLowerCase().includes(term))
                );
            }

            // Sorting
            if (filters.sort === 'price_low') {
                products.sort((a, b) => a.selling_price - b.selling_price);
            } else if (filters.sort === 'price_high') {
                products.sort((a, b) => b.selling_price - a.selling_price);
            } else if (filters.sort === 'newest') {
                products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }

            return products;
        } catch (error) {
            throw new Error(`FindProducts Error: ${error.message}`);
        }
    }
}

module.exports = new ProductRepository();
