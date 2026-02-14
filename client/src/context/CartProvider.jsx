import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, where, writeBatch } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [coupon, setCoupon] = useState(null);
    const [finalTotal, setFinalTotal] = useState(0);

    // Calculate totals whenever cart or coupon changes
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + (Number(item.selling_price || item.price) * item.quantity), 0);
        setCartTotal(total);

        if (coupon) {
            const discountAmount = (total * coupon.discount_percentage) / 100;
            // Check usage limit if applicable (optional enforcement here, strict enforcement on checkout)
            setFinalTotal(Math.max(0, total - discountAmount));
        } else {
            setFinalTotal(total);
        }
    }, [cartItems, coupon]);

    // Firestore Sync for Logged-in Users
    useEffect(() => {
        let unsubscribe;

        const syncCart = async () => {
            if (user) {
                // Merge Logic (Simplified for Array)
                const localCart = JSON.parse(localStorage.getItem('cartItems')) || [];
                if (localCart.length > 0) {
                    await mergeLocalCart(user.uid, localCart);
                    localStorage.removeItem('cartItems');
                }

                // Listen to User Document
                const userRef = doc(db, 'users', user.uid);
                unsubscribe = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setCartItems(docSnap.data().cart || []);
                    } else {
                        setCartItems([]);
                    }
                });
            } else {
                const localCart = JSON.parse(localStorage.getItem('cartItems')) || [];
                setCartItems(localCart);
            }
        };

        syncCart();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    const mergeLocalCart = async (uid, localItems) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            let currentCart = userSnap.exists() ? (userSnap.data().cart || []) : [];

            // Basic merge: Add local items to current cart
            // If item exists, overwrite/sum quantity? Let's just push local items if not exist, or update.
            // Simplified: Re-run addToCart logic manually or just stupid merge for now.
            // Better: For each local item, update currentCart
            localItems.forEach(localItem => {
                const index = currentCart.findIndex(i => i.productId === localItem.productId);
                if (index > -1) {
                    currentCart[index].quantity += localItem.quantity;
                } else {
                    currentCart.push(localItem);
                }
            });

            await setDoc(userRef, { cart: currentCart }, { merge: true });
        } catch (error) {
            console.error("Merge failed", error);
        }
    };

    // --- Actions ---

    const addToCart = async (product) => {
        // Standardize product structure for cart
        const cartItem = {
            title: product.title,
            price: Number(product.selling_price || product.price),
            selling_price: Number(product.selling_price || product.price),
            image: product.images?.[0] || product.image || '',
            quantity: 1,
            productId: product.id,
            id: product.id // redundant but safe
        };

        if (user) {
            try {
                // Sanitize undefined
                const safeCartItem = {
                    title: cartItem.title || 'Untitled Product',
                    price: cartItem.price || 0,
                    selling_price: cartItem.selling_price || 0,
                    image: cartItem.image || '',
                    quantity: 1,
                    productId: product.id,
                    id: product.id
                };

                // Remove undefined keys just in case
                Object.keys(safeCartItem).forEach(key => safeCartItem[key] === undefined && delete safeCartItem[key]);

                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                let currentCart = userSnap.exists() ? (userSnap.data().cart || []) : [];

                if (!Array.isArray(currentCart)) currentCart = []; // Safety check

                const index = currentCart.findIndex(item => item.productId === product.id);

                if (index > -1) {
                    // Update existing
                    currentCart[index] = {
                        ...currentCart[index],
                        quantity: (currentCart[index].quantity || 0) + 1,
                        // Refresh details
                        title: safeCartItem.title,
                        price: safeCartItem.price,
                        selling_price: safeCartItem.selling_price,
                        image: safeCartItem.image
                    };
                } else {
                    // Add new
                    currentCart.push(safeCartItem);
                }

                await setDoc(userRef, { cart: currentCart }, { merge: true });
                console.log("Cart updated successfully");
            } catch (error) {
                console.error("Add to cart error details:", error);
                alert("Failed to add to cart. Error: " + (error.message || "Unknown Error"));
            }
        } else {
            setCartItems(prev => {
                const existingIndex = prev.findIndex(item => item.id === product.id);
                let newCart = [...prev];

                if (existingIndex > -1) {
                    newCart[existingIndex] = {
                        ...newCart[existingIndex],
                        quantity: newCart[existingIndex].quantity + 1,
                        title: cartItem.title,
                        price: cartItem.price,
                        selling_price: cartItem.selling_price,
                        image: cartItem.image
                    };
                } else {
                    newCart.push({ ...cartItem, id: product.id });
                }
                localStorage.setItem('cartItems', JSON.stringify(newCart));
                return newCart;
            });
        }
    };

    const removeFromCart = async (productId) => {
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    let currentCart = userSnap.data().cart || [];
                    const newCart = currentCart.filter(item => item.productId !== productId);
                    await updateDoc(userRef, { cart: newCart });
                }
            } catch (error) {
                console.error("Remove failed", error);
            }
        } else {
            setCartItems(prev => {
                const newCart = prev.filter(item => item.id !== productId);
                localStorage.setItem('cartItems', JSON.stringify(newCart));
                return newCart;
            });
        }
    };

    const updateQuantity = async (productId, delta) => {
        // Optimistic UI for guest, but for Cloud we need full logic

        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    let currentCart = userSnap.data().cart || [];
                    const index = currentCart.findIndex(item => item.productId === productId);

                    if (index > -1) {
                        const newQty = currentCart[index].quantity + delta;
                        if (newQty <= 0) {
                            currentCart = currentCart.filter(item => item.productId !== productId);
                        } else {
                            currentCart[index].quantity = newQty;
                        }
                        await updateDoc(userRef, { cart: currentCart });
                    }
                }
            } catch (error) {
                console.error("Update quantity failed", error);
            }
        } else {
            setCartItems(prev => {
                const index = prev.findIndex(item => item.id === productId);
                if (index === -1) return prev; // Should not happen

                let newCart = [...prev];
                const newQty = newCart[index].quantity + delta;

                if (newQty <= 0) {
                    newCart = newCart.filter(item => item.id !== productId);
                } else {
                    newCart[index] = { ...newCart[index], quantity: newQty };
                }
                localStorage.setItem('cartItems', JSON.stringify(newCart));
                return newCart;
            });
        }
    };

    const clearCart = async () => {
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { cart: [] });
            } catch (error) {
                console.error("Clear cart failed", error);
            }
        } else {
            setCartItems([]);
            localStorage.removeItem('cartItems');
        }
    };

    const applyCoupon = async (code) => {
        try {
            // Firestore validation
            const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setCoupon(null);
                return { success: false, message: 'Invalid coupon code' };
            }

            const couponData = snapshot.docs[0].data();

            // Check Expiry
            if (new Date(couponData.expiry_date) < new Date()) {
                return { success: false, message: 'Coupon expired' };
            }

            // Check Usage Limit (Simple check, concurrency issues possible but acceptable for now)
            if (couponData.usage_limit && couponData.usage_count >= couponData.usage_limit) {
                return { success: false, message: 'Coupon usage limit reached' };
            }

            setCoupon({ id: snapshot.docs[0].id, ...couponData });
            return { success: true, message: 'Coupon applied!' };
        } catch (error) {
            console.error("Coupon error", error);
            setCoupon(null);
            return { success: false, message: 'Error validating coupon' };
        }
    };

    const removeCoupon = () => {
        setCoupon(null);
    };

    return (
        <CartContext.Provider value={{ cartItems, cartTotal, finalTotal, coupon, applyCoupon, removeCoupon, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
