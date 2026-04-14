const CartRepository = require('../database/repositories/CartRepository');
const ProductRepository = require('../database/repositories/ProductRepository');

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        let cart = await CartRepository.getCartByUserId(userId);

        if (!cart) {
            cart = await CartRepository.createCart(userId);
        }

        const items = await CartRepository.getCartItems(cart.id);

        // Calculate totals
        let subtotal = 0;
        items.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        res.json({ cart, items, subtotal });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching cart' });
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and quantity required' });
        }

        let cart = await CartRepository.getCartByUserId(userId);
        if (!cart) {
            cart = await CartRepository.createCart(userId);
        }

        const item = await CartRepository.addItem(cart.id, productId, quantity);
        res.json({ message: 'Item added to cart', item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding to cart' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        let cart = await CartRepository.getCartByUserId(userId);
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        await CartRepository.updateItemQuantity(cart.id, productId, quantity);
        const items = await CartRepository.getCartItems(cart.id); // Return updated items
        res.json({ message: 'Cart updated', items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating cart' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        let cart = await CartRepository.getCartByUserId(userId);
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        await CartRepository.removeItem(cart.id, productId);
        res.json({ message: 'Item removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error removing item' });
    }
};

const mergeCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { localItems } = req.body; // Array of { productId, quantity }

        if (!Array.isArray(localItems)) {
            return res.status(400).json({ message: 'Invalid items format' });
        }

        let cart = await CartRepository.getCartByUserId(userId);
        if (!cart) {
            cart = await CartRepository.createCart(userId);
        }

        for (const item of localItems) {
            await CartRepository.addItem(cart.id, item.productId, item.quantity);
        }

        const items = await CartRepository.getCartItems(cart.id);
        res.json({ message: 'Cart merged successfully', items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error merging cart' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    mergeCart
};
