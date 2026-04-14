const ProductRepository = require('../database/repositories/ProductRepository');
const ProductImageRepository = require('../database/repositories/ProductImageRepository');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

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
        const files = req.files; // Array of files (buffers)

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

        // 2. Upload to Cloudinary and Save URLs
        if (files && files.length > 0) {
            // Upload images in parallel
            const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, 'trendkart/products'));
            const imageUrls = await Promise.all(uploadPromises);

            // Save URLs to DB
            const dbPromises = imageUrls.map(url =>
                ProductImageRepository.create({ product_id: product.id, image_url: url })
            );
            await Promise.all(dbPromises);
        }

        res.status(201).json(product);
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // 1. Find images associated with product
        const images = await ProductImageRepository.findByProductId(productId);

        // 2. Delete images from Cloudinary
        if (images.length > 0) {
            const deletePromises = images.map(img => deleteFromCloudinary(img.image_url));
            await Promise.all(deletePromises);
        }

        // 3. Delete from DB
        await ProductRepository.delete(productId);

        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProducts, getProductById, createProduct, deleteProduct };
