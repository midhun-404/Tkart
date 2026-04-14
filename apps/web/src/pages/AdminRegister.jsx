import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const AdminRegister = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminPasscode, setAdminPasscode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hardcoded secret passcode to prevent public users from creating admin accounts
    const SECRET_PASSCODE = "TRENDKART_ADMIN_2026";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (adminPasscode !== SECRET_PASSCODE) {
            setError('Invalid Admin Passcode. Registration denied.');
            return;
        }

        setLoading(true);

        // Pass 'admin' as the explicit role during signup
        const res = await signup(name, email, password, 'admin');

        if (res.success) {
            // Redirect to admin dashboard on success
            window.location.href = '/admin';
        } else {
            setError(res.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 rounded-full text-red-600">
                        <ShieldAlert size={40} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2 font-serif">Admin Registration</h2>
                <p className="text-center text-gray-500 mb-8">Authorized Personnel Only</p>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center font-bold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Admin Email</label>
                        <input
                            type="email"
                            className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="newadmin@trendkart.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 text-red-600">Secret Admin Passcode</label>
                        <input
                            type="password"
                            className="w-full border-2 border-red-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 transition-colors bg-red-50"
                            value={adminPasscode}
                            onChange={(e) => setAdminPasscode(e.target.value)}
                            placeholder="Required for admin access"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-4 rounded-lg font-bold hover:bg-red-700 transition-colors duration-300 shadow-lg mt-6 disabled:opacity-50"
                    >
                        {loading ? 'REGISTERING...' : 'REGISTER NEW ADMIN'}
                    </button>
                </form>

                <div className="mt-6 flex justify-between items-center text-sm">
                    <a href="/" className="text-gray-400 hover:text-gray-600">Back to Website</a>
                    <a href="/admin/login" className="text-primary hover:text-slate-800 font-bold">Existing Admin? Login</a>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
