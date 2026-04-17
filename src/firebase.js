import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export let firebaseApp = null;
export let db = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const initFirebase = () => {
    try {
        if (!firebaseConfig.apiKey) {
            throw new Error("Konfigurasi Firebase (API Key) tidak ditemukan. Jika Anda baru membuat file .env, pastikan untuk me-restart server Vite (npm run dev).");
        }
        if (!getApps().length) {
            firebaseApp = initializeApp(firebaseConfig);
        } else {
            firebaseApp = getApps()[0];
        }
        db = getFirestore(firebaseApp);
        return true;
    } catch (e) {
        console.error("Gagal inisialisasi Firebase", e);
        return false;
    }
};

// Expose a dummy function to keep compatibility with App.jsx
export const saveFirebaseConfig = (configStr) => {
    return initFirebase();
};
