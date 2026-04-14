const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
    constructor() {
        super('users'); // Collection name
    }

    async findByEmail(email) {
        try {
            const snapshot = await this.collection.where('email', '==', email).limit(1).get();
            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            throw new Error(`FindByEmail Error: ${error.message}`);
        }
    }
}

module.exports = new UserRepository();
