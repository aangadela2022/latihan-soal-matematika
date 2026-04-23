import { supabase } from './supabase';

export const fetchUsers = async () => {
    try {
        if (!supabase) throw new Error("Koneksi Supabase belum terinisialisasi.");
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching users from Supabase:", e);
        return [];
    }
};

export const findUserByName = async (nama) => {
    try {
        if (!supabase) throw new Error("Koneksi Supabase belum terinisialisasi.");
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .ilike('nama', nama)
            .limit(1);
        if (error) throw error; 
        return data && data.length > 0 ? data[0] : null;
    } catch (e) {
        console.error("Error finding user:", e);
        return null;
    }
};

export const addUser = async (userObj) => {
    try {
        if (!supabase) throw new Error("Koneksi Supabase belum terinisialisasi. Pastikan VITE_SUPABASE_URL ada di .env dan restart server.");
        const userId = userObj.id || Date.now().toString();
        const dataToSave = {
            id: userId,
            nama: userObj.nama,
            role: userObj.role,
            kelas: userObj.kelas || 'Umum',
            xp: userObj.xp ?? 0,
            level: userObj.level ?? 1,
            analytics: userObj.analytics ?? {},
            history: userObj.history ?? [],
        };

        const { data, error } = await supabase
            .from('users')
            .upsert(dataToSave)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (e) {
        console.error("Error adding user to Supabase:", e);
        throw e;
    }
};

export const bulkAddUsers = async (users, onProgress) => {
    try {
        if (!supabase) {
            throw new Error("Koneksi Supabase belum terinisialisasi. Jika Anda baru saja menambahkan file .env, mohon restart server Vite Anda (Ctrl+C lalu npm run dev). Atau pastikan VITE_SUPABASE_URL telah diatur.");
        }

        const dataToInsert = users.map((user, idx) => ({
            id: user.id || `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
            nama: user.nama,
            role: user.role,
            kelas: user.kelas || 'Umum',
            xp: 0,
            level: 1,
            analytics: user.analytics ?? {},
            history: [],
        }));

        // Deduplicate within import batch itself (keep last occurrence)
        const uniqueDataMap = new Map();
        for (const item of dataToInsert) {
            uniqueDataMap.set(item.id, item);
        }
        const uniqueDataToInsert = Array.from(uniqueDataMap.values());

        // Fetch all existing IDs from DB to avoid overwriting existing data
        const { data: existingRows, error: fetchError } = await supabase
            .from('users')
            .select('id');
        if (fetchError) throw fetchError;

        const existingIds = new Set((existingRows || []).map(r => String(r.id)));

        // Only keep truly new records (skip if ID already exists)
        const newData = uniqueDataToInsert.filter(item => !existingIds.has(String(item.id)));
        const skippedCount = uniqueDataToInsert.length - newData.length;

        if (onProgress) onProgress(newData.length);

        if (newData.length === 0) {
            // Nothing new to insert
            return { added: 0, skipped: skippedCount };
        }

        const CHUNK_SIZE = 500;
        const chunks = [];
        for (let i = 0; i < newData.length; i += CHUNK_SIZE) {
            chunks.push(newData.slice(i, i + CHUNK_SIZE));
        }

        const errors = [];
        await Promise.all(
            chunks.map(async (chunk) => {
                const { error } = await supabase
                    .from('users')
                    .insert(chunk);
                if (error) errors.push(error.message);
            })
        );

        if (errors.length > 0) {
            throw new Error(`Gagal menyimpan ke Supabase: ${errors[0]}`);
        }

        return { added: newData.length, skipped: skippedCount };
    } catch (e) {
        console.error("Error bulk adding users:", e);
        throw e;
    }
};

export const updateUserStats = async (userId, xp, analytics, level) => {
    try {
        if (!supabase) throw new Error("Koneksi Supabase belum terinisialisasi.");
        const { error } = await supabase
            .from('users')
            .update({ xp, analytics, level })
            .eq('id', userId);
        if (error) throw error;
    } catch (e) {
        console.error("Error updating user stats:", e);
    }
};

export const addSessionHistory = async (userId, sessionData) => {
    try {
        if (!supabase) throw new Error("Koneksi Supabase belum terinisialisasi.");
        // Ambil history lama lalu append
        const { data: userData, error: fetchErr } = await supabase
            .from('users')
            .select('history')
            .eq('id', userId)
            .single();

        if (fetchErr) throw fetchErr;

        const currentHistory = userData?.history || [];
        const updatedHistory = [...currentHistory, sessionData];

        const { error } = await supabase
            .from('users')
            .update({ history: updatedHistory })
            .eq('id', userId);

        if (error) throw error;
    } catch (e) {
        console.error("Error adding session history:", e);
    }
};

export const deleteAllUsers = async () => {
    try {
        if (!supabase) throw new Error("Koneksi Supabase belum terinisialisasi.");
        const { error } = await supabase
            .from('users')
            .delete()
            .neq('id', ''); // Delete all rows where id is not empty (effectively all rows)

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error deleting all users:", e);
        throw e;
    }
};

export const updateUserProfile = async (userId, dataBaru) => {
    try {
        if (!supabase) throw new Error("Koneksi Supabase belum terinisialisasi.");
        const { error } = await supabase
            .from('users')
            .update(dataBaru)
            .eq('id', userId);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error updating user profile:", e);
        throw e;
    }
};

export const resetAllPracticeData = async () => {
    try {
        if (!supabase) throw new Error("Koneksi Supabase belum terinisialisasi.");
        const INIT_TOPICS = { "Bilangan": { total: 0, correct: 0 }, "Aljabar": { total: 0, correct: 0 }, "Geometri": { total: 0, correct: 0 }, "Statistika": { total: 0, correct: 0 }, "Peluang": { total: 0, correct: 0 } };
        
        const { error } = await supabase
            .from('users')
            .update({
                xp: 0,
                level: 1,
                history: [],
                analytics: INIT_TOPICS
            })
            .neq('id', ''); // update all

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error resetting practice data:", e);
        throw e;
    }
};
