import React from 'react';
import { Star } from 'lucide-react';

const ReviewSection = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Customer Reviews</h2>

            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                <div className="flex justify-center mb-4 text-gray-300">
                    <Star size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500">Be the first to review this product!</p>
            </div>
        </div>
    );
};

export default ReviewSection;
