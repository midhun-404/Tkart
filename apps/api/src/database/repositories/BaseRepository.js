const { db } = require('../../config/firebaseAdmin');

class BaseRepository {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.collection = db.collection(collectionName);
    }

    async findAll() {
        try {
            const snapshot = await this.collection.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`FindAll Error: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            throw new Error(`FindById Error: ${error.message}`);
        }
    }

    async create(data) {
        try {
            // Add timestamp
            const dataWithTime = { ...data, created_at: new Date().toISOString() };
            const docRef = await this.collection.add(dataWithTime);
            return { id: docRef.id, ...dataWithTime };
        } catch (error) {
            throw new Error(`Create Error: ${error.message}`);
        }
    }

    async update(id, data) {
        try {
            await this.collection.doc(id).update(data);
            return { id, ...data };
        } catch (error) {
            throw new Error(`Update Error: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            await this.collection.doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Delete Error: ${error.message}`);
        }
    }
}

module.exports = BaseRepository;
