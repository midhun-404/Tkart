import { getAccessToken } from './googleAuth';

export class Firestore {
    constructor(env) {
        this.env = env;
        this.projectId = env.FIREBASE_PROJECT_ID || 'trendkart-53484';
        this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
    }

    async getAuthHeaders() {
        const token = await getAccessToken(this.env);
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async getCollection(collectionName) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseUrl}/${collectionName}`, { headers });
        const data = await response.json();

        if (data.documents) {
            return data.documents.map(doc => this.mapDocument(doc));
        }
        return [];
    }

    async getDocument(collectionName, id) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseUrl}/${collectionName}/${id}`, { headers });
        if (!response.ok) return null;
        const doc = await response.json();
        return this.mapDocument(doc);
    }

    async addDocument(collectionName, data) {
        const headers = await this.getAuthHeaders();
        const firestoreData = this.toFirestoreValue(data);
        const body = { fields: firestoreData };

        const response = await fetch(`${this.baseUrl}/${collectionName}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        return await response.json();
    }

    async deleteDocument(collectionName, id) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseUrl}/${collectionName}/${id}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete document: ${errorText}`);
        }

        return true;
    }

    async runQuery(collectionName, whereConditions = []) {
        const headers = await this.getAuthHeaders();

        const structuredQuery = {
            from: [{ collectionId: collectionName }]
        };

        if (whereConditions.length > 0) {
            if (whereConditions.length === 1) {
                structuredQuery.where = {
                    fieldFilter: {
                        field: { fieldPath: whereConditions[0].field },
                        op: whereConditions[0].op || 'EQUAL',
                        value: this.encodeValue(whereConditions[0].value)
                    }
                };
            } else {
                structuredQuery.where = {
                    compositeFilter: {
                        op: 'AND',
                        filters: whereConditions.map(cond => ({
                            fieldFilter: {
                                field: { fieldPath: cond.field },
                                op: cond.op || 'EQUAL',
                                value: this.encodeValue(cond.value)
                            }
                        }))
                    }
                };
            }
        }

        const response = await fetch(`${this.baseUrl}:runQuery`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ structuredQuery })
        });

        const data = await response.json();
        // runQuery returns a stream of results [{document: ..., readTime: ...}, ...]
        if (Array.isArray(data)) {
            return data
                .filter(item => item.document)
                .map(item => this.mapDocument(item.document));
        }
        return [];
    }

    mapDocument(doc) {
        const id = doc.name.split('/').pop();
        const data = {};
        for (const [key, value] of Object.entries(doc.fields || {})) {
            data[key] = this.fromFirestoreValue(value);
        }
        return { id, ...data };
    }

    fromFirestoreValue(value) {
        if (value.stringValue !== undefined) return value.stringValue;
        if (value.integerValue !== undefined) return parseInt(value.integerValue);
        if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
        if (value.booleanValue !== undefined) return value.booleanValue;
        if (value.arrayValue !== undefined) return (value.arrayValue.values || []).map(v => this.fromFirestoreValue(v));
        if (value.mapValue !== undefined) {
            const map = {};
            for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
                map[k] = this.fromFirestoreValue(v);
            }
            return map;
        }
        return null;
    }

    toFirestoreValue(data) {
        const fields = {};
        for (const [key, value] of Object.entries(data)) {
            fields[key] = this.encodeValue(value);
        }
        return fields;
    }

    encodeValue(value) {
        if (typeof value === 'string') return { stringValue: value };
        if (typeof value === 'number') {
            if (Number.isInteger(value)) return { integerValue: value.toString() };
            return { doubleValue: value };
        }
        if (typeof value === 'boolean') return { booleanValue: value };
        if (Array.isArray(value)) return { arrayValue: { values: value.map(v => this.encodeValue(v)) } };
        if (typeof value === 'object' && value !== null) return { mapValue: { fields: this.toFirestoreValue(value) } };
        return { nullValue: null };
    }
}
