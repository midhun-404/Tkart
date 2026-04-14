import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Slideshow = () => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const q = query(
                    collection(db, 'slideshow'),
                    where('isActive', '==', true),
                    orderBy('order', 'asc')
                );
                const querySnapshot = await getDocs(q);
                const sls = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSlides(sls);
            } catch (error) {
                console.error("Failed to fetch slideshow banners", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
    }, [slides.length]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
    };

    // Auto-scroll every 5 seconds
    useEffect(() => {
        if (slides.length <= 1) return;

        const intervalId = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [slides.length, nextSlide]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-4 md:px-6">
                <div className="w-full h-[250px] md:h-[400px] lg:h-[450px] bg-slate-100 animate-pulse rounded-lg shadow-sm" />
            </div>
        );
    }

    if (slides.length === 0) {
        return null; // Don't show anything if no active slides
    }

    return (
        <div className="container mx-auto px-4 py-4 md:px-6">
            <div className="relative w-full h-[250px] md:h-[400px] lg:h-[450px] bg-white rounded-lg shadow-sm overflow-hidden group">

                {/* Slides container */}
                <div
                    className="flex transition-transform duration-700 ease-in-out h-full w-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {slides.map((slide) => (
                        <div key={slide.id} className="w-full h-full flex-shrink-0 cursor-pointer relative bg-slate-50 flex items-center justify-center p-2" onClick={() => slide.link && (window.location.href = slide.link)}>
                            <img
                                src={slide.image}
                                alt={slide.title || 'Slideshow banner'}
                                className="w-full h-full object-contain object-center mix-blend-multiply"
                            />
                            {/* Optional overlay for title if we decide to show it later */}
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows (Show on hover for desktop) */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                            aria-label="Next slide"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Indicators */}
                {slides.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`transition-all duration-300 rounded-full ${currentIndex === index
                                    ? 'bg-accent w-6 h-2'
                                    : 'bg-white/60 hover:bg-white/90 w-2 h-2'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Slideshow;
