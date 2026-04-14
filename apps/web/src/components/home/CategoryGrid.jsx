import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Shirt, Home, Dumbbell, Sparkles, ChevronRight } from 'lucide-react';

const categories = [
    { title: 'Electronics', icon: Smartphone, color: 'bg-blue-100 text-blue-600', link: '/catalog?category=Electronics', count: '500+' },
    { title: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-600', link: '/catalog?category=Fashion', count: '1.2K+' },
    { title: 'Home & Kitchen', icon: Home, color: 'bg-orange-100 text-orange-600', link: '/catalog?category=Home', count: '300+' },
    { title: 'Fitness', icon: Dumbbell, color: 'bg-green-100 text-green-600', link: '/catalog?category=Sports', count: '200+' },
    { title: 'Beauty', icon: Sparkles, color: 'bg-purple-100 text-purple-600', link: '/catalog?category=Beauty', count: '400+' },
];

const CategoryGrid = () => {
    return (
        <section className="py-10 sm:py-14 lg:py-16 bg-gray-50/50">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-end justify-between mb-6 sm:mb-10">
                    <div>
                        <span className="text-accent font-bold tracking-wider uppercase text-xs sm:text-sm">Browse</span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mt-1">Shop by Category</h2>
                    </div>
                    <Link to="/catalog" className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-primary font-medium transition-colors">
                        All <ChevronRight size={14} />
                    </Link>
                </div>

                {/* Horizontal scroll on mobile, grid on tablet+ */}
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 snap-x snap-mandatory scrollbar-hide">
                    {categories.map((cat, idx) => (
                        <Link
                            key={idx}
                            to={cat.link}
                            className="group flex-shrink-0 w-36 sm:w-auto snap-start flex flex-col items-center justify-center py-6 px-4 sm:p-7 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-accent/30 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <cat.icon size={24} className="sm:w-7 sm:h-7" />
                            </div>
                            <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors text-sm sm:text-base text-center">{cat.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">{cat.count} items</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
