import React, { useState } from 'react';
import { saveFirebaseConfig } from '../firebase';
import { saveGeminiKey } from '../aiConfig';
import { Database, Key, CheckCircle } from 'lucide-react';

export default function ConfigUI({ onConfigComplete }) {
  const [fbConfig, setFbConfig] = useState('');
  const [gkConfig, setGkConfig] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    try {
       // Validate JSON
       JSON.parse(fbConfig);
       
       const fbSuccess = saveFirebaseConfig(fbConfig);
       const genSuccess = saveGeminiKey(gkConfig);

       if (fbSuccess && genSuccess) {
          onConfigComplete();
       } else {
          setError('Gagal menginisialisasi. Cek format config JSON dan pastikan API Key tidak kosong.');
       }
    } catch (e) {
       setError('Format Firebase Config harus berupa JSON valid dari Firebase Console.');
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center animate-fade-in" style={{minHeight: '100vh'}}>
      <div className="glass-panel" style={{maxWidth: '600px', width: '100%'}}>
        <div className="flex justify-center mb-4">
          <div style={{background: 'var(--primary)', padding: '1rem', borderRadius: '50%'}}>
            <Database size={40} color="white" />
          </div>
        </div>
        <h1 className="title text-center" style={{fontSize: '2rem'}}>Setup Workspace (Lokal)</h1>
        <p className="subtitle text-center" style={{marginBottom: '2rem'}}>Amankan konfigurasi Anda di browser ini, 100% aman tanpa eksposur kode server.</p>
        
        {error && <div className="badge badge-danger mb-4 w-full p-4">{error}</div>}

        <div className="mb-4">
           <label className="block text-sm mb-2" style={{color: 'var(--text-muted)'}}>
             Firebase Configuration JSON Object (Copy from Console)
           </label>
           <textarea 
             className="w-full p-4" 
             style={{background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', minHeight: '150px'}}
             placeholder='{"apiKey": "AIz...", "authDomain": "...", ...}'
             value={fbConfig}
             onChange={(e) => setFbConfig(e.target.value)}
           ></textarea>
        </div>

        <div className="mb-6">
           <label className="block text-sm mb-2" style={{color: 'var(--text-muted)'}}>
             Gemini API Key (Untuk Engine Generasi Soal)
           </label>
           <div className="flex items-center" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 1rem'}}>
             <Key size={20} color="var(--text-muted)" className="mr-2" />
             <input 
               type="password" 
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
