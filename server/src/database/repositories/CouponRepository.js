const BaseRepository = require('./BaseRepository');

class CouponRepository extends BaseRepository {
    constructor() {
        super('coupons');
    }

    async findByCode(code) {
        return this.findOne('code = ?', [code]);
    }
}

module.exports = new CouponRepository();
