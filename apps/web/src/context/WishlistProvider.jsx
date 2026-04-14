import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);

    // Sync wishlist — Firestore for logged-in, localStorage for guests
    useEffect(() => {
        let unsubscribe;

        const syncWishlist = async () => {
            if (user) {
                // Merge any local wishlist into Firestore
                const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                const userRef = doc(db, 'users', user.uid);

                if (localWishlist.length > 0) {
                    const userSnap = await getDoc(userRef);
                    const currentWishlist = userSnap.exists() ? (userSnap.data().wishlist || []) : [];
                    const merged = [...currentWishlist];
                    localWishlist.forEach(item => {
                        if (!merged.find(i => i.id === item.id)) merged.push(item);
                    });
                    await setDoc(userRef, { wishlist: merged }, { merge: true });
                    localStorage.removeItem('wishlist');
                }

                // Listen to wishlist changes
                unsubscribe = onSnapshot(userRef, (snap) => {
                    if (snap.exists()) {
                        setWishlist(snap.data().wishlist || []);
                    } else {
                        setWishlist([]);
                    }
                });
            } else {
                const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                setWishlist(localWishlist);
            }
        };

        syncWishlist();
        return () => { if (unsubscribe) unsubscribe(); };
    }, [user]);

    const isWishlisted = useCallback((productId) => {
        return wishlist.some(item => item.id === productId);
    }, [wishlist]);

    const addToWishlist = async (product) => {
        const item = {
            id: product.id,
            title: product.title,
            price: Number(product.selling_price || product.price),
            image: product.images?.[0] || product.image || '',
            category: product.category || '',
        };

        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                const currentWishlist = userSnap.exists() ? (userSnap.data().wishlist || []) : [];
                if (!currentWishlist.find(i => i.id === item.id)) {
                    await setDoc(userRef, { wishlist: [...currentWishlist, item] }, { merge: true });
                }
            } catch (err) {
                console.error('Add to wishlist failed:', err);
            }
        } else {
            setWishlist(prev => {
                if (prev.find(i => i.id === item.id)) return prev;
                const newList = [...prev, item];
                localStorage.setItem('wishlist', JSON.stringify(newList));
                return newList;
            });
        }
    };

    const removeFromWishlist = async (productId) => {
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                const currentWishlist = userSnap.exists() ? (userSnap.data().wishlist || []) : [];
                const newList = currentWishlist.filter(i => i.id !== productId);
                await updateDoc(userRef, { wishlist: newList });
            } catch (err) {
                console.error('Remove from wishlist failed:', err);
            }
        } else {
            setWishlist(prev => {
                const newList = prev.filter(i => i.id !== productId);
                localStorage.setItem('wishlist', JSON.stringify(newList));
                return newList;
            });
        }
    };

    const toggleWishlist = async (product) => {
        if (isWishlisted(product.id)) {
            await removeFromWishlist(product.id);
        } else {
            await addToWishlist(product);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
