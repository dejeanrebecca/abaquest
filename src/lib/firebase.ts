import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

// Dynamic database selection based on environment
const getDatabaseId = () => {
    // Check if we are in a browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname.includes('uat') || hostname.includes('abaquest-app-uat')) {
            return 'database-uat';
        }
    }
    // Fallback to environment variable (build-time) or default
    return import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)";
};

export const db = getFirestore(app, getDatabaseId());
