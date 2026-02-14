const ProductRepository = require('../database/repositories/ProductRepository');

const getProducts = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            brand: req.query.brand,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            search: req.query.search,
            sort: req.query.sort
        };
        const products = await ProductRepository.findAllWithFilters(filters);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await ProductRepository.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createProduct = async (req, res) => {
    try {
        const {
            title, description,
            selling_price, supplier_price, stock,
            category, brand,
            discount_percentage, is_active, is_featured, is_deal
        } = req.body;
        const images = req.files;

        // Helper to parse booleans from FormData strings
        const parseBool = (val) => val === 'true' || val === true ? 1 : 0;

        // 1. Create Product
        const productData = {
            title,
            description,
            selling_price: parseFloat(selling_price) || 0,
            supplier_price: parseFloat(supplier_price) || 0,
            stock: parseInt(stock) || 0,
            category: category || 'Uncategorized',
            brand: brand || 'Generic',
            discount_percentage: parseFloat(discount_percentage) || 0,
            is_active: parseBool(is_active),
            is_featured: parseBool(is_featured),
            is_deal: parseBool(is_deal)
        };
        const product = await ProductRepository.create(productData);

        // 2. Save Images
        if (images && images.length > 0) {
            const imagePromises = images.map(file => {
                const imageUrl = `/uploads/${file.filename}`;
                return require('../database/repositories/ProductImageRepository').create({ product_id: product.id, image_url: imageUrl });
            });
            await Promise.all(imagePromises);
        }

        res.status(201).json(product);
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await ProductRepository.delete(req.params.id);
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProducts, getProductById, createProduct, deleteProduct };
