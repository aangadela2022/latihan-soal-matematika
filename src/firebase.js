import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export let firebaseApp = null;
export let db = null;

const firebaseConfig = {
  apiKey: "AIzaSyA-FGwJ-XaVGAve7Mhpz8aMtemZEEVhOEE",
  authDomain: "latihan-soal-matematika.firebaseapp.com",
  projectId: "latihan-soal-matematika",
  storageBucket: "latihan-soal-matematika.firebasestorage.app",
  messagingSenderId: "684723272865",
  appId: "1:684723272865:web:f0c254f795075b675c04e0",
  measurementId: "G-H874VNBW7P"
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
