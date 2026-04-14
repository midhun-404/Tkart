import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db, googleProvider } from '../config/firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle redirect result for mobile google login
        const handleRedirectResult = async () => {
            try {
                const res = await getRedirectResult(auth);
                if (res && res.user) {
                    const user = res.user;
                    console.log("Redirect login successful for:", user.email);
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (!userDoc.exists()) {
                        await setDoc(doc(db, "users", user.uid), {
                            uid: user.uid,
                            name: user.displayName || 'User',
                            email: user.email,
                            role: 'user',
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            } catch (error) {
                console.error("Redirect login error:", error);
            }
        };

        // Execute once heavily when app mounts
        handleRedirectResult();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true); // Ensure loading is true while we process the user
            if (firebaseUser) {
                console.log("Auth state changed: User detected", firebaseUser.email);

                // Get and save token for API usage
                const token = await firebaseUser.getIdToken();
                localStorage.setItem('token', token);

                // CRITICAL: If it's the admin, set state IMMEDIATELY to bypass loading screen
                if (firebaseUser.email === 'midhunjr2222@gmail.com' || firebaseUser.email === 'midhun23@gmail.com') {
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
            if (email === 'midhunjr2222@gmail.com' || email === 'midhun23@gmail.com') {
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

    const signup = async (name, email, password, explicitRole = 'user') => {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const user = res.user;

            // Explicitly allow midhun23@gmail.com to be admin if signing up
            let assignedRole = explicitRole;
            if (email === 'midhunjr2222@gmail.com' || email === 'midhun23@gmail.com') {
                assignedRole = 'admin';
            }

            // Create user doc in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: assignedRole, // Use explicit or verified default role
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
            // Primarily try popup. It's safer and less prone to looping issues than redirect on modern browsers.
            const res = await signInWithPopup(auth, googleProvider);
            const user = res.user;

            // Check if doc exists, if not create
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: user.displayName || 'User',
                    email: user.email,
                    role: 'user',
                    createdAt: new Date().toISOString()
                });
            }
            setShowLoginModal(false);
            return { success: true };
        } catch (error) {
            console.error("Google Login failed", error);
            
            // Handle popup blocked (usually on mobile browsers or strictly configured browsers)
            if (error.code === 'auth/popup-blocked') {
                return { 
                    success: false, 
                    message: "Popup was blocked by your browser. Please try again or use email login." 
                };
            }
            
            // Handle missing domain configuration
            if (error.code === 'auth/unauthorized-domain') {
                return {
                    success: false,
                    message: "Current domain is not authorized in Firebase Console."
                };
            }

            // Omit user cancellations
            if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                return {
                    success: false,
                    message: error.message
                };
            }
            return { success: false, message: '' }; // silently fail for cancellations
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
