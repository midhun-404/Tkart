import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBRunXc5Bz0JQpgXqKL4Q70MdfRtLU8acw",
    authDomain: "trendkart-53484.firebaseapp.com",
    projectId: "trendkart-53484",
    storageBucket: "trendkart-53484.firebasestorage.app",
    messagingSenderId: "650882971081",
    appId: "1:650882971081:web:d12419259703a787366418"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
