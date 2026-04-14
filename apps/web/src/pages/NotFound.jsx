import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* 404 Visual */}
                <div className="relative mb-8">
                    <p className="text-[10rem] font-black text-gray-100 leading-none select-none">404</p>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white rounded-2xl shadow-lg px-8 py-6 border border-gray-100">
                            <Search size={40} className="mx-auto text-accent mb-3" />
                            <p className="font-serif font-bold text-xl text-primary">Page Not Found</p>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-serif font-bold text-gray-700 mb-3">Oops! Lost in the Cart?</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-slate-800 transition-colors"
                    >
                        <Home size={18} /> Go Home
                    </Link>
                    <Link
                        to="/catalog"
                        className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all"
                    >
                        <Search size={18} /> Browse Products
                    </Link>
                </div>

                <button
                    onClick={() => window.history.back()}
                    className="mt-6 flex items-center gap-1.5 text-gray-400 hover:text-primary text-sm font-medium transition-colors mx-auto"
                >
                    <ArrowLeft size={14} /> Go back
                </button>
            </div>
        </div>
    );
};

export default NotFound;
