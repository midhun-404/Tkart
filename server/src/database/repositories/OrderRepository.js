const BaseRepository = require('./BaseRepository');

class OrderRepository extends BaseRepository {
    constructor() {
        super('orders');
    }

    async findByUserId(userId) {
        try {
            // Note: In Firestore, userId should match the field name we save.
            const snapshot = await this.collection.where('user_id', '==', userId).get(); // Removed orderBy to avoid index requirement errors initially
            // We can sort in memory
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } catch (error) {
            throw new Error(`FindByUser Error: ${error.message}`);
        }
    }

    async findAllWithFilters(filters) {
        try {
            let query = this.collection;

            // Basic Status Filters can likely be done purely in Firestore if indexes exist,
            // but for safety/flexibility without deployment delays, we fetch all (or recent) and filter in memory.
            // optimization: Filter by status if provided
            if (filters.status) {
                query = query.where('order_status', '==', filters.status);
            }

            const snapshot = await query.get();
            let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Memory Filters
            if (filters.paymentStatus) {
                orders = orders.filter(o => o.payment_status === filters.paymentStatus);
            }
            if (filters.paymentMethod) {
                orders = orders.filter(o => o.payment_method === filters.paymentMethod);
            }
            if (filters.startDate) {
                orders = orders.filter(o => new Date(o.created_at) >= new Date(filters.startDate));
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59);
                orders = orders.filter(o => new Date(o.created_at) <= end);
            }

            // Sort
            orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return orders;
        } catch (error) {
            throw new Error(`FindAllOrders Error: ${error.message}`);
        }
    }

    async createOrderWithItems(orderData, items) {
        try {
            // In NoSQL, we embed items directly in the order document
            // We also should embed basic user info if possible, but the controller handles inputs.
            // The controller might need to fetch user info to pass it here if we want it denormalized.
            // For now, we save what we have.

            const fullOrder = {
                ...orderData,
                items: items, // Embed items
                created_at: new Date().toISOString()
            };

            const docRef = await this.collection.add(fullOrder);
            return { id: docRef.id, ...fullOrder };
        } catch (error) {
            throw new Error(`CreateOrder Error: ${error.message}`);
        }
    }
}

module.exports = new OrderRepository();
