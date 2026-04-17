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
    // Batch size 200: cukup besar agar efisien, cukup kecil agar progress keliatan
    const BATCH_SIZE = 200;
    const chunks = [];
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
        chunks.push(users.slice(i, i + BATCH_SIZE));
    }

    // Siapkan semua batch terlebih dahulu (proses client-side, sangat cepat)
    let completed = 0;
    const commitPromises = chunks.map((chunk, chunkIdx) => {
        const batch = writeBatch(db);
        const startIdx = chunkIdx * BATCH_SIZE;
        chunk.forEach((user, idx) => {
            const userId = user.id || `${Date.now()}-${startIdx + idx}-${Math.random().toString(36).substr(2, 6)}`;
            const userRef = doc(db, "users", userId);
            // Hanya simpan data inti — analytics/history dibuat saat pertama login
            const dataToSave = {
                nama: user.nama,
                role: user.role,
                kelas: user.kelas || 'Umum',
                xp: 0,
                level: 1,
            };
            if (user.id) dataToSave.id = user.id;
            batch.set(userRef, dataToSave);
        });
        return { batch, size: chunk.length };
    });

    // OPTIMISTIC UI: Update progress sebelum nunggu konfirmasi server
    // Ini membuat tampilan langsung update tanpa nunggu latensi jaringan ke Firebase
    if (onProgress) onProgress(users.length);

    // Kirim semua batch ke Firebase secara paralel di background dengan timeout
    const errors = [];
    const TIMEOUT_MS = 15000;
    
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout: Gagal terhubung ke database. Cek apakah Firestore sudah diaktifkan di Firebase Console, atau cek koneksi internet Anda.")), TIMEOUT_MS)
    );

    await Promise.all(
        commitPromises.map(({ batch }) =>
            Promise.race([batch.commit(), timeoutPromise])
                .catch(e => { errors.push(e.message); })
        )
    );

    if (errors.length > 0) {
        throw new Error(`Gagal menyimpan ${errors.length} batch ke server: ${errors[0]}`);
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
