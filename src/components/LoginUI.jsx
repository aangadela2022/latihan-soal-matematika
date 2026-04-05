import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../dbServices';
import { BookOpen, User, Users, ChevronRight, Settings } from 'lucide-react';

export default function LoginUI({ onLogin, onOpenAdmin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then(data => { setUsers(data); setLoading(false); })
      .catch(err => { console.error("Error fetching users", err); setLoading(false); });
  }, []);

  return (
    <div className="container flex flex-col items-center justify-center animate-fade-in" style={{minHeight: '100vh'}}>
      <div className="glass-panel" style={{maxWidth: '400px', width: '100%', textAlign: 'center'}}>
        <div className="flex justify-between items-start w-full">
           <div style={{width: '24px'}}></div> {/* Spacer */}
           <div style={{background: 'var(--primary)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem'}}>
             <BookOpen size={40} color="white" />
           </div>
           <button onClick={onOpenAdmin} className="text-muted hover:text-white transition-colors" title="Buka Mode Admin (Seeding)">
             <Settings size={20} />
           </button>
        </div>
        
        <h1 className="title" style={{fontSize: '2rem'}}>Numerasi Cerdas</h1>
        <p className="subtitle">Membangun Nalar Numerasi dengan AI</p>
        
        <div className="grid grid-cols-1 gap-4 mt-8">
          {loading ? (
             <p className="text-muted">Memuat akun pengguna...</p>
          ) : users.length === 0 ? (
             <div className="badge badge-warning p-3">Belum ada akun. Klik ikon gir di pojok kanan atas untuk menambah user (Admin Seeding).</div>
          ) : (
             users.map(u => (
                <button key={u.id} className="btn btn-outline flex items-center justify-between" onClick={() => onLogin(u)}>
                  <div className="flex items-center gap-2">
                    {u.role === 'guru' ? <Users size={20} /> : <User size={20} />}
                    <span>{u.nama} ({u.role})</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
             ))
          )}
        </div>
      </div>
    </div>
  );
}
