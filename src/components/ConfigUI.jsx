import React, { useState } from 'react';
import { saveFirebaseConfig } from '../firebase';
import { saveGeminiKey } from '../aiConfig';
import { Key, CheckCircle } from 'lucide-react';

export default function ConfigUI({ onConfigComplete }) {
  const [gkConfig, setGkConfig] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!gkConfig.trim()) {
      setError('Gemini API Key tidak boleh kosong.');
      return;
    }

    try {
       // Firebase is hardcoded now, we just call saveFirebaseConfig to trigger init
       const fbSuccess = saveFirebaseConfig();
       const genSuccess = saveGeminiKey(gkConfig);

       if (fbSuccess && genSuccess) {
          onConfigComplete();
       } else {
          setError('Gagal menginisialisasi. Pastikan API Key valid.');
       }
    } catch (e) {
       setError('Terjadi kesalahan saat menyimpan konfigurasi.');
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center animate-fade-in" style={{minHeight: '100vh'}}>
      <div className="glass-panel" style={{maxWidth: '600px', width: '100%'}}>
        <div className="flex justify-center mb-4">
          <div style={{background: 'var(--primary)', padding: '1rem', borderRadius: '50%'}}>
            <Key size={40} color="white" />
          </div>
        </div>
        <h1 className="title text-center" style={{fontSize: '2rem'}}>Setup Workspace (Lokal)</h1>
        <p className="subtitle text-center" style={{marginBottom: '2rem'}}>Firebase sudah disiapkan. Silakan masukkan Gemini API Key Anda untuk melanjutkan.</p>
        
        {error && <div className="badge badge-danger mb-4 w-full p-4">{error}</div>}

        <div className="mb-6">
           <label className="block text-sm mb-2" style={{color: 'var(--text-muted)'}}>
             Gemini API Key (Untuk Engine Generasi Soal)
           </label>
           <div className="flex items-center" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 1rem'}}>
             <Key size={20} color="var(--text-muted)" className="mr-2" />
             <input 
               type="text" 
               className="w-full bg-transparent outline-none" 
               style={{color: 'white', padding: '0.5rem'}}
               placeholder="AIzaSyA..."
               value={gkConfig}
               onChange={(e) => setGkConfig(e.target.value)}
             />
           </div>
        </div>

        <button className="btn btn-primary w-full flex justify-center items-center gap-2" onClick={handleSave}>
           <CheckCircle size={20} /> Simpan Config & Masuk
        </button>
      </div>
    </div>
  );
}
