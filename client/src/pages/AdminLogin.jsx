import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const res = await login(email, password);

        if (res.success) {
            // Check if user is actually admin
            if (res.user.role === 'admin') {
                // Use window.location.href to ensure a clean state for admin dashboard
                window.location.href = '/admin';
            } else {
                setError('Access Denied. You are not an Admin.');
            }
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-slate-100 rounded-full text-primary">
                        <Shield size={40} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2 font-serif">Admin Portal</h2>
                <p className="text-center text-gray-500 mb-8">Secure Access Only</p>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center font-bold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Admin Email</label>
                        <input
                            type="email"
                            className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@trendkart.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full bg-primary text-white py-4 rounded-lg font-bold hover:bg-slate-800 transition-colors duration-300 shadow-lg mt-4">
                        ENTER DASHBOARD
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-gray-400 hover:text-gray-600">Back to Website</a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
