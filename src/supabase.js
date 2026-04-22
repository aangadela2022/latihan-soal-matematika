import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;

export const initSupabase = () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("Konfigurasi Supabase (URL / Anon Key) tidak ditemukan di file .env.");
        return false;
    }
    return true;
};

// Backward-compatibility dengan ConfigUI.jsx
export const saveSupabaseConfig = () => {
    return initSupabase();
};
