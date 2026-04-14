import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { db } from '../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await addDoc(collection(db, 'contact_requests'), {
                ...form,
                status: 'new',
                createdAt: serverTimestamp(),
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Failed to submit contact form:', err);
            setError('Failed to send your message. Please try again or email us directly.');
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        { icon: MapPin, label: 'Address', value: '123 Commerce Street, Andheri West, Mumbai, Maharashtra 400053' },
        { icon: Phone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
        { icon: Mail, label: 'Email', value: 'support@trendkart.in', href: 'mailto:support@trendkart.in' },
        { icon: Clock, label: 'Support Hours', value: 'Mon–Sat: 9 AM – 8 PM IST' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-primary text-white py-16 px-4 text-center">
                <h1 className="text-4xl font-serif font-bold mb-3">Contact Us</h1>
                <p className="text-gray-300 max-w-lg mx-auto">Have a question, concern, or feedback? We'd love to hear from you. Our team is ready to help!</p>
            </section>

            <section className="py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-serif font-bold text-primary">Get in Touch</h2>
                            {contactInfo.map(({ icon: Icon, label, value, href }) => (
                                <div key={label} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-accent/30 transition-all">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon size={18} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                                        {href ? (
                                            <a href={href} className="text-sm font-medium text-gray-800 hover:text-accent transition-colors mt-0.5 block">{value}</a>
                                        ) : (
                                            <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* FAQ Hint */}
                            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
                                <p className="text-sm font-bold text-primary mb-1">💡 Quick Tip</p>
                                <p className="text-sm text-gray-600">For order-related queries, please include your Order ID in the message for faster resolution.</p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                {submitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                            <CheckCircle size={40} className="text-green-500" />
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Message Sent!</h3>
                                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                            Thank you for reaching out! We'll respond to <strong>{form.email}</strong> within 24 hours.
                                        </p>
                                        <button
                                            onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                                            className="mt-6 text-accent font-bold hover:underline text-sm"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-serif font-bold text-primary mb-6">Send us a Message</h2>
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
                                                {error}
                                            </div>
                                        )}
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Your Name <span className="text-red-400">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={form.name}
                                                        onChange={handleChange}
                                                        placeholder="Rahul Sharma"
                                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-gray-50/50"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address <span className="text-red-400">*</span></label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={form.email}
                                                        onChange={handleChange}
                                                        placeholder="you@example.com"
                                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-gray-50/50"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                                                <select
                                                    name="subject"
                                                    value={form.subject}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-gray-50/50"
                                                >
                                                    <option value="">Select a topic...</option>
                                                    <option value="order">Order Issue</option>
                                                    <option value="return">Return / Refund</option>
                                                    <option value="product">Product Query</option>
                                                    <option value="payment">Payment Issue</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message <span className="text-red-400">*</span></label>
                                                <textarea
                                                    name="message"
                                                    value={form.message}
                                                    onChange={handleChange}
                                                    rows={5}
                                                    placeholder="Describe your issue or question in detail..."
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-gray-50/50 resize-none"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm disabled:opacity-60"
                                            >
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                {loading ? 'Sending...' : 'Send Message'}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
