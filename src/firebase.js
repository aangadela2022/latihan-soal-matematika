import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export let firebaseApp = null;
export let db = null;

// The config will be loaded from localStorage when the app boots
export const initFirebase = () => {
    const storedConfig = localStorage.getItem("firebaseConfig");
    if (!storedConfig) return false;

    try {
        const config = JSON.parse(storedConfig);
        if (!getApps().length) {
            firebaseApp = initializeApp(config);
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

// Also expose a function to save config
export const saveFirebaseConfig = (configStr) => {
    localStorage.setItem("firebaseConfig", configStr);
    return initFirebase();
};
