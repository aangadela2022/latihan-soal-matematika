import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export let supabase = null;

export const initSupabase = () => {
    try {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error("Konfigurasi Supabase (URL / Anon Key) tidak ditemukan di file .env.");
        }
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
    } catch (e) {
        console.error("Gagal inisialisasi Supabase:", e);
        return false;
    }
};

// Backward-compatibility dengan ConfigUI.jsx
export const saveSupabaseConfig = () => {
    return initSupabase();
};
