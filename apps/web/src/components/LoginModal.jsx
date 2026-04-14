import React, { useState } from 'react';
import { X, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { auth } from '../config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

// Modes: 'login' | 'signup' | 'forgot'
const LoginModal = () => {
    const { showLoginModal, closeLogin, login, signup, googleLogin } = useAuth();
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Forgot password state
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    if (!showLoginModal) return null;

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '' });
        setError('');
        setResetEmail('');
        setResetSent(false);
        setLoading(false);
    };

    const switchMode = (newMode) => {
        resetForm();
        setMode(newMode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        let res;
        if (mode === 'login') {
            res = await login(formData.email, formData.password);
        } else {
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters.');
                setLoading(false);
                return;
            }
            res = await signup(formData.name, formData.email, formData.password);
        }
        setLoading(false);

        if (!res.success) {
            setError(res.message);
        } else {
            if (res.user && res.user.role === 'admin') {
                window.location.href = '/admin';
            }
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail.trim()) { setError('Please enter your email address.'); return; }
        setError('');
        setResetLoading(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail.trim());
            setResetSent(true);
        } catch (err) {
            console.error('Password reset error:', err);
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setResetLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        const res = await googleLogin();
        if (res && !res.success && res.message) {
            setError(res.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-accent via-yellow-400 to-amber-300" />

                <div className="p-8">
                    {/* Close button */}
                    <button
                        onClick={closeLogin}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* ─── FORGOT PASSWORD MODE ─── */}
                    {mode === 'forgot' && (
                        <div>
                            <button
                                onClick={() => switchMode('login')}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </button>
                            <h2 className="text-2xl font-bold text-primary mb-2 font-serif">Reset Password</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Enter your email and we'll send you a link to reset your password.
                            </p>

                            {resetSent ? (
                                <div className="text-center space-y-4 py-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle size={32} className="text-green-500" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">Email Sent!</h3>
                                    <p className="text-gray-500 text-sm">
                                        We've sent a password reset link to <strong>{resetEmail}</strong>.
                                        Check your inbox (and spam folder).
                                    </p>
                                    <button
                                        onClick={() => switchMode('login')}
                                        className="mt-4 w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    {error && <ErrorBox message={error} />}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                                            placeholder="you@example.com"
                                            value={resetEmail}
                                            onChange={e => setResetEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={resetLoading}
                                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {resetLoading && <Loader2 size={16} className="animate-spin" />}
                                        {resetLoading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ─── LOGIN / SIGNUP MODE ─── */}
                    {(mode === 'login' || mode === 'signup') && (
                        <>
                            <h2 className="text-2xl font-bold text-primary mb-1 font-serif">
                                {mode === 'login' ? 'Welcome Back! 👋' : 'Create Account'}
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">
                                {mode === 'login' ? 'Sign in to continue shopping' : 'Join TrendKart for exclusive deals'}
                            </p>

                            {error && <ErrorBox message={error} />}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'signup' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                                            placeholder="Your full name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                                            placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {mode === 'login' && (
                                        <div className="text-right mt-1.5">
                                            <button
                                                type="button"
                                                onClick={() => switchMode('forgot')}
                                                className="text-xs text-accent hover:underline font-semibold"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create Account')}
                                </button>
                            </form>

                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-white text-gray-400 font-medium">Or continue with</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-3 shadow-sm"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                Continue with Google
                            </button>

                            <p className="mt-6 text-center text-sm text-gray-500">
                                {mode === 'login' ? "New to TrendKart? " : "Already have an account? "}
                                <button
                                    onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                                    className="text-accent font-bold hover:underline"
                                >
                                    {mode === 'login' ? 'Create Account' : 'Login'}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const ErrorBox = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2">
        <span className="mt-0.5 flex-shrink-0">⚠</span>
        <span>{message}</span>
    </div>
);

export default LoginModal;
