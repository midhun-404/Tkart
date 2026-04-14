import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Headphones, Heart, Star, Award, Users } from 'lucide-react';

const About = () => {
    const promises = [
        { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping on orders over ₹999. Express delivery available in major cities.', color: 'bg-blue-100 text-blue-600' },
        { icon: ShieldCheck, title: 'Secure Shopping', desc: '100% secure transactions with end-to-end encryption and buyer protection.', color: 'bg-green-100 text-green-600' },
        { icon: RefreshCw, title: 'Easy Returns', desc: 'Hassle-free 30-day return policy. No questions asked.', color: 'bg-purple-100 text-purple-600' },
        { icon: Headphones, title: '24/7 Support', desc: 'Our support team is always ready to help you with any queries.', color: 'bg-orange-100 text-orange-600' },
    ];

    const stats = [
        { value: '50K+', label: 'Happy Customers', icon: Users },
        { value: '10K+', label: 'Products', icon: Star },
        { value: '99.9%', label: 'Satisfaction Rate', icon: Heart },
        { value: '3+', label: 'Years of Trust', icon: Award },
    ];

    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary to-slate-800 text-white py-24 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="text-accent font-bold uppercase tracking-widest text-sm">Our Story</span>
                    <h1 className="text-5xl font-serif font-bold mt-3 mb-6">
                        Premium Shopping, <br />Reimagined for India
                    </h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        TrendKart was born with a simple mission — to bring world-class products to every doorstep across India, with unmatched quality, value, and service.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map(({ value, label, icon: Icon }) => (
                            <div key={label} className="text-center">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Icon size={26} className="text-primary" />
                                </div>
                                <p className="text-3xl font-black text-primary font-serif">{value}</p>
                                <p className="text-gray-500 text-sm mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <span className="text-accent font-bold uppercase tracking-widest text-sm">Our Mission</span>
                    <h2 className="text-4xl font-serif font-bold text-primary mt-3 mb-6">
                        Quality Products at Honest Prices
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        We believe that everyone deserves access to premium products without premium price tags. That's why we work directly with manufacturers and trusted brands to cut out the middlemen and pass the savings on to you.
                    </p>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        From electronics to fashion, fitness to beauty — TrendKart is your one-stop shop for everything you need to live your best life.
                    </p>
                </div>
            </section>

            {/* Our Promises */}
            <section className="py-20 bg-gray-50 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-accent font-bold uppercase tracking-widest text-sm">Why TrendKart?</span>
                        <h2 className="text-4xl font-serif font-bold text-primary mt-3">Our Promise to You</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {promises.map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
                                    <Icon size={26} />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shipping Policy */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl font-serif font-bold text-primary mb-8 text-center">Shipping & Returns</h2>
                    <div className="space-y-6">
                        {[
                            { title: 'Free Shipping', body: 'We offer free standard shipping on all orders above ₹999. Orders below ₹999 incur a flat ₹49 shipping fee.' },
                            { title: 'Delivery Time', body: 'Standard delivery takes 5–7 business days. Express delivery (2–3 days) is available in major cities at a nominal charge.' },
                            { title: 'Return Policy', body: 'We accept returns within 30 days of delivery. Products must be unused and in their original packaging. Contact our support team to initiate a return.' },
                            { title: 'Refunds', body: 'Refunds are processed within 5–7 business days after the return is received and verified. Amount is credited to your original payment method.' },
                        ].map(({ title, body }) => (
                            <div key={title} className="border-l-4 border-accent pl-6 py-2">
                                <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-primary text-white py-20 px-4 text-center">
                <h2 className="text-4xl font-serif font-bold mb-4">Ready to Start Shopping?</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">Explore thousands of products across all categories and enjoy exclusive deals every day.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/catalog" className="px-8 py-3.5 bg-accent text-primary font-bold rounded-full hover:bg-yellow-400 transition-colors">
                        Shop Now
                    </Link>
                    <Link to="/contact" className="px-8 py-3.5 border-2 border-white/30 text-white font-bold rounded-full hover:border-accent hover:text-accent transition-all">
                        Contact Us
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default About;
