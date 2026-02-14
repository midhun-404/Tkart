import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Shirt, Home, Dumbbell, Sparkles } from 'lucide-react';

const categories = [
    { title: 'Electronics', icon: Smartphone, color: 'bg-blue-100 text-blue-600', link: '/catalog?category=Electronics' },
    { title: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-600', link: '/catalog?category=Fashion' },
    { title: 'Home & Kitchen', icon: Home, color: 'bg-orange-100 text-orange-600', link: '/catalog?category=Home' },
    { title: 'Fitness', icon: Dumbbell, color: 'bg-green-100 text-green-600', link: '/catalog?category=Sports' },
    { title: 'Beauty', icon: Sparkles, color: 'bg-purple-100 text-purple-600', link: '/catalog?category=Beauty' },
];

const CategoryGrid = () => {
    return (
        <section className="py-16 container mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold text-primary mb-10 text-center">Shop by Category</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {categories.map((cat, idx) => (
                    <Link
                        key={idx}
                        to={cat.link}
                        className="group flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-accent/30 transition-all duration-300"
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                            <cat.icon size={28} />
                        </div>
                        <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{cat.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">View All</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategoryGrid;
