import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const fetchUsers = async () => {
    if (!db) throw new Error("Database belum diinisialisasi");
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addUser = async (userObj) => {
    if (!db) throw new Error("Database belum diinisialisasi");
    const docRef = await addDoc(collection(db, "users"), userObj);
    return { id: docRef.id, ...userObj };
};

export const updateUserStats = async (userId, xp, analytics, level) => {
    if (!db) throw new Error("Database belum diinisialisasi");
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { xp, analytics, level });
};

export const addSessionHistory = async (userId, sessionData) => {
    if (!db) throw new Error("Database belum diinisialisasi");
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        history: arrayUnion(sessionData)
    });
};
