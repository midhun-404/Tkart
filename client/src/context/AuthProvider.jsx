import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db, googleProvider } from '../firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true); // Ensure loading is true while we process the user
            if (firebaseUser) {
                console.log("Auth state changed: User detected", firebaseUser.email);

                // Get and save token for API usage
                const token = await firebaseUser.getIdToken();
                localStorage.setItem('token', token);

                // CRITICAL: If it's the admin, set state IMMEDIATELY to bypass loading screen
                if (firebaseUser.email === 'midhunjr2222@gmail.com') {
                    console.log("!!! FAST ADMIN OVERRIDE !!!");
                    setUser({
                        ...firebaseUser,
                        role: 'admin',
                        name: firebaseUser.displayName || "Admin Midhun"
                    });
                    setLoading(false); // Stop loading immediately for admin

                    // Run the background sync without 'await' to not block the UI
                    setDoc(doc(db, "users", firebaseUser.uid), {
                        role: 'admin',
                        name: firebaseUser.displayName || "Admin Midhun"
                    }, { merge: true }).catch(err => console.error("Admin sync error:", err));

                    return; // Exit early since we've already done everything for admin
                }

                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    let userData = {};
                    if (userDoc.exists()) {
                        userData = userDoc.data();
                    }
                    setUser({ ...firebaseUser, ...userData, role: userData.role || 'user', name: userData.name || firebaseUser.displayName || 'User' });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(firebaseUser);
                }
            } else {
                console.log("Auth state changed: No user");
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            console.log("Attempting login for:", email);
            const res = await signInWithEmailAndPassword(auth, email, password);

            // Explicitly set role for immediate redirect check
            let role = 'user';
            if (email === 'midhunjr2222@gmail.com') {
                role = 'admin';
            }

            console.log("Login successful, role:", role);
            setShowLoginModal(false);
            return { success: true, user: { ...res.user, role } };
        } catch (error) {
            console.error("Login failed:", error.code, error.message);
            let msg = error.message;
            if (error.code === 'auth/invalid-credential') {
                msg = "Invalid Email or Password.";
            } else if (error.code === 'auth/user-not-found') {
                msg = "User not found. Please Sign Up.";
            }
            return {
                success: false,
                message: msg
            };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const user = res.user;

            // Create user doc in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: 'user', // Default role
                createdAt: new Date().toISOString()
            });

            setShowLoginModal(false);
            return { success: true };
        } catch (error) {
            console.error("Signup failed", error);
            return {
                success: false,
                message: error.message
            };
        }
    };

    const googleLogin = async () => {
        try {
            const res = await signInWithPopup(auth, googleProvider);
            const user = res.user;

            // Check if doc exists, if not create
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    role: 'user',
                    createdAt: new Date().toISOString()
                });
            }
            setShowLoginModal(false);
            return { success: true };
        } catch (error) {
            console.error("Google Login failed", error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('token');
        setUser(null);
    };

    const openLogin = () => setShowLoginModal(true);
    const closeLogin = () => setShowLoginModal(false);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            googleLogin,
            logout,
            loading,
            showLoginModal,
            openLogin,
            closeLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
};
