import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import ProductCard from './ProductCard';

const RelatedProducts = ({ category, currentProductId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!category) return;

            try {
                const q = query(
                    collection(db, 'products'),
                    where('category', '==', category),
                    limit(4)
                );

                const snapshot = await getDocs(q);
                const related = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(p => p.id !== currentProductId) // Exclude current product
                    .slice(0, 3); // Take top 3

                setProducts(related);
            } catch (error) {
                console.error("Error fetching related products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [category, currentProductId]);

    if (loading || products.length === 0) return null;

    return (
        <div className="mt-16">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-8">You May Also Like</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
