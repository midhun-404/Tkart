import React, { useState, useEffect } from 'react';
import { Star, StarHalf, Send, Loader2 } from 'lucide-react';
import { db } from '../config/firebaseConfig';
import {
    collection, addDoc, query, where, orderBy, getDocs, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthProvider';

// Star rating input component
const StarRating = ({ rating, onRate }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        size={24}
                        fill={(hovered || rating) >= star ? '#F59E0B' : 'none'}
                        className={(hovered || rating) >= star ? 'text-amber-400' : 'text-gray-300'}
                    />
                </button>
            ))}
        </div>
    );
};

// Single review display
const ReviewCard = ({ review }) => {
    const date = review.createdAt?.toDate ? review.createdAt.toDate() : new Date(review.createdAt || Date.now());
    return (
        <div className="border border-gray-100 rounded-xl p-5 bg-gray-50 hover:bg-white transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(review.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{review.userName || 'Anonymous'}</p>
                        <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    size={14}
                                    fill={review.rating >= star ? '#F59E0B' : 'none'}
                                    className={review.rating >= star ? 'text-amber-400' : 'text-gray-200'}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 mt-1">
                    {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
        </div>
    );
};

const ReviewSection = ({ productId }) => {
    const { user, openLogin } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    const fetchReviews = async () => {
        if (!productId) return;
        try {
            setLoading(true);
            const q = query(
                collection(db, 'reviews'),
                where('productId', '==', productId),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            const reviewList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setReviews(reviewList);
            // Check if current user already reviewed
            if (user) {
                const already = reviewList.some(r => r.userId === user.uid);
                setHasReviewed(already);
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) { openLogin(); return; }
        if (userRating === 0) { setError('Please select a star rating.'); return; }
        if (!comment.trim()) { setError('Please write a review comment.'); return; }

        setError('');
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'reviews'), {
                productId,
                userId: user.uid,
                userName: user.name || user.displayName || 'Anonymous',
                rating: userRating,
                comment: comment.trim(),
                createdAt: serverTimestamp()
            });
            setSuccess(true);
            setComment('');
            setUserRating(0);
            setHasReviewed(true);
            await fetchReviews();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Review submit error:', err);
            setError('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl font-serif font-bold text-gray-900">Customer Reviews</h2>
                {avgRating && (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
                        <span className="text-3xl font-bold text-amber-500">{avgRating}</span>
                        <div>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={16} fill={Number(avgRating) >= s ? '#F59E0B' : 'none'} className={Number(avgRating) >= s ? 'text-amber-400' : 'text-gray-200'} />
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Write a Review */}
            {!hasReviewed && (
                <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-800 mb-4">
                        {user ? 'Write a Review' : (
                            <span>
                                <button onClick={openLogin} className="text-accent hover:underline font-bold">Login</button> to write a review
                            </span>
                        )}
                    </h3>
                    {user && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
                                <StarRating rating={userRating} onRate={setUserRating} />
                            </div>
                            <div>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Share your experience with this product..."
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none bg-white"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {success && <p className="text-green-600 text-sm font-bold">✓ Review submitted successfully!</p>}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 text-sm"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </div>
            )}
            {hasReviewed && (
                <div className="mb-6 bg-green-50 border border-green-100 rounded-xl p-4 text-green-700 text-sm font-medium">
                    ✓ You've already reviewed this product. Thank you!
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="flex justify-center mb-4 text-gray-300">
                        <Star size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-600 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500 text-sm">Be the first to review this product!</p>
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
