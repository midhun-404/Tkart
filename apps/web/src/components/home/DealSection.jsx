import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Timer, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const DealSection = () => {
    const [deal, setDeal] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

    useEffect(() => {
        const fetchDeal = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/deals`);
                console.log("DealSection raw response:", data);
                // Check if data is nested under 'deal' or direct
                const dealData = data.deal || data;
                if (dealData && (dealData.endTime || dealData.end_time)) {
                    console.log("Deal found:", dealData);
                    setDeal(dealData);
                } else {
                    console.log("No valid deal found in response");
                    setDeal(null);
                }
            } catch (error) {
                console.error("Error fetching deal result:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeal();
    }, []);

    useEffect(() => {
        if (!deal) return;

        const calculateTimeLeft = () => {
            try {
                const now = new Date();
                const endTimeStr = deal.end_time || deal.endTime;

                // Fallback robust parsing (in case iOS/Safari doesn't like the format)
                const end = new Date(endTimeStr);

                // Check if the date is actually valid before math
                if (isNaN(end.getTime())) {
                    console.error("Invalid end time format received:", endTimeStr);
                    return;
                }

                const difference = end - now;

                if (difference <= 0) {
                    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                    if (difference < -3600000) { // Hide after 1 hour
                        setDeal(null);
                    }
                } else {
                    setTimeLeft({
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60)
                    });
                }
            } catch (err) {
                console.error("Deal duration error:", err);
            }
        };

        calculateTimeLeft(); // Run immediately to avoid 1s delay
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [deal]);

    if (loading || !deal) return null;

    // Use snake_case fields from backend
    const originalPrice = deal.original_price || (deal.discount_price * 1.5) || 0; // Fallback if regular price missing
    const discountPrice = deal.discount_price;
    const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);

    return (
        <section className="py-20 bg-gradient-to-br from-gray-900 to-primary text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
                {/* Text Content */}
                <div className="md:w-1/2 space-y-8 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-accent font-bold tracking-widest uppercase text-sm">
                        <Timer size={18} />
                        <span>Deal of the Day</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                        {deal.title}
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Get this exclusive deal before the timer runs out. Limited stock available!
                    </p>

                    {/* Countdown */}
                    <div className="flex justify-center md:justify-start gap-4">
                        {['Hours', 'Minutes', 'Seconds'].map((unit, index) => {
                            const val = unit === 'Hours' ? timeLeft.hours : unit === 'Minutes' ? timeLeft.minutes : timeLeft.seconds;
                            return (
                                <div key={unit} className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm border border-white/10 w-20 h-20 rounded-lg">
                                    <span className="text-2xl font-bold text-white">{val || 0}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400">{unit}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-4 flex flex-col items-center md:items-start">
                        <div className="flex items-end gap-4 mb-6">
                            <span className="text-4xl font-bold text-white">₹{discountPrice}</span>
                            <span className="text-xl text-gray-500 line-through mb-1">₹{originalPrice}</span>
                            <span className="bg-accent text-primary px-2 py-1 rounded text-xs font-bold mb-2">-{discountPercentage}%</span>
                        </div>
                        <Link to={`/product/${deal.product_id}`} className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-primary font-bold rounded-full hover:bg-yellow-400 transition-all shadow-lg shadow-accent/20">
                            <ShoppingBag size={20} /> Shop Now
                        </Link>
                    </div>
                </div>

                {/* Image Content */}
                <div className="md:w-1/2 relative flex justify-center">
                    <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full"></div>
                    <img
                        src={deal.image}
                        alt={deal.title}
                        className="relative z-10 w-full max-w-md object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 rounded-xl bg-white p-4"
                    />
                </div>
            </div>
        </section>
    );
};

export default DealSection;
