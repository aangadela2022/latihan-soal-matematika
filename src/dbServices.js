import { supabase } from './supabase';

export const fetchUsers = async () => {
    try {
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
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('nama', nama)
            .single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return data || null;
    } catch (e) {
        console.error("Error finding user:", e);
        return null;
    }
};

export const addUser = async (userObj) => {
    try {
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

        // Optimistic UI: langsung update progress
        if (onProgress) onProgress(users.length);

        const CHUNK_SIZE = 500;
        const chunks = [];
        for (let i = 0; i < dataToInsert.length; i += CHUNK_SIZE) {
            chunks.push(dataToInsert.slice(i, i + CHUNK_SIZE));
        }

        const errors = [];
        await Promise.all(
            chunks.map(async (chunk) => {
                const { error } = await supabase
                    .from('users')
                    .upsert(chunk, { onConflict: 'id' });
                if (error) errors.push(error.message);
            })
        );

        if (errors.length > 0) {
            throw new Error(`Gagal menyimpan ke Supabase: ${errors[0]}`);
        }
    } catch (e) {
        console.error("Error bulk adding users:", e);
        throw e;
    }
};

export const updateUserStats = async (userId, xp, analytics, level) => {
    try {
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
