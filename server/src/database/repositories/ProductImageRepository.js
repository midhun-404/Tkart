const BaseRepository = require('./BaseRepository');

class ProductImageRepository extends BaseRepository {
    constructor() {
        super('product_images');
    }
}

module.exports = new ProductImageRepository();
