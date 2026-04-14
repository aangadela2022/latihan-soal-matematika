import React, { useState } from 'react';
import { BookOpen, LogIn, ShieldAlert } from 'lucide-react';
import { findUserByName } from '../dbServices';

export default function LoginUI({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const unameLower = username.toLowerCase();

    // 1. Admin Check (Hardcoded)
    if (unameLower === 'admin' && pass1 === 'serang12345') {
      onLoginSuccess({ nama: 'Administrator', role: 'admin' });
      setLoading(false);
      return;
    }

    // 2. Guru/Siswa Check (Firestore)
    try {
      if (!username || !pass1 || !pass2) {
        setError('Semua field harus diisi.');
        setLoading(false);
        return;
      }

      const user = await findUserByName(username);
      
      if (user) {
        // Cek Password 1 (NIS/NIP) dan Password 2 (matematikamudah)
        if (pass1 === user.id && pass2 === 'matematikamudah') {
          onLoginSuccess(user);
        } else {
          setError('Password 1 (NIS/NIP) atau Password 2 salah.');
        }
      } else {
        setError('Pengguna tidak ditemukan.');
      }
    } catch (err) {
      setError('Terjadi gangguan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center animate-fade-in" style={{minHeight: '100vh'}}>
      <div className="glass-panel hover-glow" style={{maxWidth: '430px', width: '100%', textAlign: 'center'}}>
        <div className="flex justify-center w-full mb-6">
           <div style={{background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '1.2rem', borderRadius: '50%', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'}}>
             <BookOpen size={48} color="white" />
           </div>
        </div>
        
        <h1 className="title" style={{fontSize: '2.2rem', marginBottom: '0.5rem'}}>Numerasi Cerdas</h1>
        <p className="subtitle mb-8" style={{fontSize: '1rem'}}>Platform Pelatihan Matematika Logis</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          
          {error && <div className="badge badge-danger p-3 text-center flex items-center justify-center gap-2"><ShieldAlert size={16}/> {error}</div>}
          
          <div>
             <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 rounded text-white" 
                style={{background: 'rgba(0,0,0,0.5)', border: '1px solid var(--surface-border)', outline: 'none', color: 'white'}}
                placeholder="Username"
                autoComplete="off"
                required
             />
          </div>
          
          <div>
             <input 
                type="text" 
                value={pass1}
                onChange={(e) => setPass1(e.target.value)}
                className="w-full p-4 rounded text-white" 
                style={{background: 'rgba(0,0,0,0.5)', border: '1px solid var(--surface-border)', outline: 'none', color: 'white'}}
                placeholder="Password 1"
                required
             />
          </div>

          <div>
             <input 
                type="text" 
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                className="w-full p-4 rounded text-white" 
                style={{background: 'rgba(0,0,0,0.5)', border: '1px solid var(--surface-border)', outline: 'none', color: 'white'}}
                placeholder="Password 2"
                disabled={username.toLowerCase() === 'admin'}
                required={username.toLowerCase() !== 'admin'}
             />
          </div>
          
          <button type="submit" className="btn btn-primary shadow-glow mt-2 p-4 text-lg flex items-center justify-center gap-2" disabled={loading}>
             {loading ? 'Memverifikasi...' : <><LogIn size={20} /> Masuk</>}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-sm text-center" style={{color: 'var(--text-muted)'}}>
        &copy; {new Date().getFullYear()} Numerasi Cerdas<br />
        created by Aang Adela, S.Si.
      </p>
    </div>
  );
}
