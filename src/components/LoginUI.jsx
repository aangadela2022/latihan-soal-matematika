import React, { useState } from 'react';
import { BookOpen, LogIn } from 'lucide-react';

export default function LoginUI({ onLoginSuccess, onOpenAdmin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.toLowerCase() === 'matematika' && password === 'mudah') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center animate-fade-in" style={{minHeight: '100vh'}}>
      <div className="glass-panel hover-glow" style={{maxWidth: '430px', width: '100%', textAlign: 'center'}}>
        <div className="flex justify-between items-start w-full mb-6">
           <div style={{width: '24px'}}></div> {/* Spacer */}
           <div style={{background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '1.2rem', borderRadius: '50%', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'}}>
             <BookOpen size={48} color="white" />
           </div>
           <div style={{width: '24px'}}></div> {/* Spacer */}
        </div>
        
        <h1 className="title" style={{fontSize: '2.2rem', marginBottom: '0.5rem'}}>Numerasi Cerdas</h1>
        <p className="subtitle mb-8" style={{fontSize: '1rem'}}>Platform Pelatihan Matematika Logis</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          
          {error && <div className="badge badge-danger p-3 text-center">{error}</div>}
          
          <div>
             <label className="block text-sm mb-2" style={{color: 'var(--text-muted)'}}>Username</label>
             <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 rounded" 
                style={{background: 'rgba(0,0,0,0.5)', border: '1px solid var(--surface-border)', color: 'white', outlint: 'none', transition: 'border 0.3s'}}
                placeholder="Masukkan username..."
                autoComplete="off"
             />
          </div>
          
          <div>
             <label className="block text-sm mb-2" style={{color: 'var(--text-muted)'}}>Password</label>
             <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded" 
                style={{background: 'rgba(0,0,0,0.5)', border: '1px solid var(--surface-border)', color: 'white'}}
                placeholder="Masukkan password..."
             />
          </div>
          
          <button type="submit" className="btn btn-primary shadow-glow mt-4 p-4 text-lg flex items-center justify-center gap-2">
             <LogIn size={20} /> Masuk ke Aplikasi
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
