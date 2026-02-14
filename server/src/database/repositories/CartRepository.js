const BaseRepository = require('./BaseRepository');

class CartRepository extends BaseRepository {
    constructor() {
        super('carts');
    }

    async getCartByUserId(userId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM carts WHERE user_id = ?`;
            this.db.get(query, [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    async createCart(userId) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO carts (user_id) VALUES (?)`;
            this.db.run(query, [userId], function (err) {
                if (err) reject(err);
                resolve({ id: this.lastID, user_id: userId });
            });
        });
    }

    async getCartItems(cartId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT ci.*, p.title, p.selling_price as price, p.image_url 
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.cart_id = ?
            `;
            this.db.all(query, [cartId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    async addItem(cartId, productId, quantity) {
        return new Promise((resolve, reject) => {
            // Check if item exists
            const checkQuery = `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`;
            this.db.get(checkQuery, [cartId, productId], (err, row) => {
                if (err) return reject(err);

                if (row) {
                    // Update quantity
                    const updateQuery = `UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`;
                    this.db.run(updateQuery, [quantity, row.id], function (err) {
                        if (err) reject(err);
                        resolve({ id: row.id, cart_id: cartId, product_id: productId, quantity: row.quantity + quantity });
                    });
                } else {
                    // Insert new item
                    const insertQuery = `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`;
                    this.db.run(insertQuery, [cartId, productId, quantity], function (err) {
                        if (err) reject(err);
                        resolve({ id: this.lastID, cart_id: cartId, product_id: productId, quantity });
                    });
                }
            });
        });
    }

    async updateItemQuantity(cartId, productId, quantity) {
        return new Promise((resolve, reject) => {
            if (quantity <= 0) {
                // Remove item
                const deleteQuery = `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`;
                this.db.run(deleteQuery, [cartId, productId], function (err) {
                    if (err) reject(err);
                    resolve({ deleted: true });
                });
            } else {
                // Update
                const updateQuery = `UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?`;
                this.db.run(updateQuery, [quantity, cartId, productId], function (err) {
                    if (err) reject(err);
                    resolve({ updated: true });
                });
            }
        });
    }

    async removeItem(cartId, productId) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`;
            this.db.run(query, [cartId, productId], function (err) {
                if (err) reject(err);
                resolve({ deleted: true });
            });
        });
    }

    async clearCart(cartId) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM cart_items WHERE cart_id = ?`;
            this.db.run(query, [cartId], function (err) {
                if (err) reject(err);
                resolve({ cleared: true });
            });
        });
    }
}

module.exports = new CartRepository();
