import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartProvider';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    // Use the first image from the array or a placeholder
    const productImage = product.images?.[0] || 'https://placehold.co/400x500?text=No+Image';

    return (
        <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Image Container */}
            <div className="aspect-[3/4] w-full overflow-hidden bg-[#F0F0F0] relative">
                <img
                    src={productImage}
                    alt={product.title}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Quick Add Button */}
                <button
                    onClick={() => addToCart(product)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 bg-white text-primary px-6 py-2 shadow-lg hover:bg-primary hover:text-white transition-all duration-300 font-medium text-sm whitespace-nowrap rounded-full flex items-center gap-2 z-10"
                >
                    <ShoppingBag size={16} /> Add to Cart
                </button>
            </div>

            {/* Content */}
            <div className="p-4 text-center space-y-2">
                <h3 className="text-lg font-serif text-primary truncate hover:text-accent transition-colors px-2">
                    <Link to={`/product/${product.id}`}>
                        {product.title}
                    </Link>
                </h3>
                <div className="flex items-center justify-center space-x-2">
                    <span className="text-base font-bold text-primary">₹{product.selling_price}</span>
                    {product.discount_percentage > 0 && (
                        <span className="text-xs text-red-500 font-bold">-{product.discount_percentage}%</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
