const BaseRepository = require('./BaseRepository');

class ProductImageRepository extends BaseRepository {
    constructor() {
        super('product_images');
    }

    async findByProductId(productId) {
        try {
            const snapshot = await this.collection.where('product_id', '==', productId).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`FindByProductId Error: ${error.message}`);
        }
    }
}

module.exports = new ProductImageRepository();
