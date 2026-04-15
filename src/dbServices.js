import { db } from './firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    doc, 
    query, 
    where, 
    setDoc, 
    getDoc,
    arrayUnion,
    writeBatch
} from "firebase/firestore";

export const fetchUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error fetching users from Firestore", e);
        return [];
    }
};

export const findUserByName = async (nama) => {
    try {
        const q = query(collection(db, "users"), where("nama", "==", nama));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
    } catch (e) {
        console.error("Error finding user", e);
        return null;
    }
};

export const addUser = async (userObj) => {
    try {
        // use specific ID (NIS/NIP) if provided, otherwise let Firebase generate one
        const userId = userObj.id || Date.now().toString();
        const userRef = doc(db, "users", userId);
        
        const dataToSave = { 
            ...userObj, 
            xp: userObj.xp || 0,
            level: userObj.level || 1,
            analytics: userObj.analytics || {},
            history: userObj.history || []
        };
        
        await setDoc(userRef, dataToSave);
        return { id: userId, ...dataToSave };
    } catch (e) {
        console.error("Error adding user to Firestore", e);
        throw e;
    }
};

export const bulkAddUsers = async (users, onProgress) => {
    try {
        const chunks = [];
        for (let i = 0; i < users.length; i += 500) {
            chunks.push(users.slice(i, i + 500));
        }

        let completed = 0;
        const promises = chunks.map(async (chunk) => {
            const batch = writeBatch(db);
            chunk.forEach(user => {
                const userId = user.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const userRef = doc(db, "users", userId);
                const dataToSave = {
                    ...user,
                    xp: user.xp || 0,
                    level: user.level || 1,
                    analytics: user.analytics || {},
                    history: user.history || []
                };
                batch.set(userRef, dataToSave);
            });
            await batch.commit();
            completed += chunk.length;
            if (onProgress) onProgress(completed);
        });

        await Promise.all(promises);
    } catch (e) {
        console.error("Error in bulkAddUsers", e);
        throw e;
    }
};

export const updateUserStats = async (userId, xp, analytics, level) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            xp: xp,
            analytics: analytics,
            level: level
        });
    } catch (e) {
        console.error("Error updating user stats", e);
    }
};

export const addSessionHistory = async (userId, sessionData) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            history: arrayUnion(sessionData)
        });
    } catch (e) {
        console.error("Error adding session history", e);
    }
};
