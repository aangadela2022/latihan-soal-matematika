import React, { useState } from 'react';
import { addUser } from '../dbServices';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function AdminUI({ onBack }) {
  const [nama, setNama] = useState('');
  const [role, setRole] = useState('siswa');
  const [kelas, setKelas] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const INIT_TOPICS = () => ({ "Bilangan": { total: 0, correct: 0 }, "Aljabar": { total: 0, correct: 0 }, "Geometri": { total: 0, correct: 0 }, "Statistika": { total: 0, correct: 0 }, "Peluang": { total: 0, correct: 0 } });

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const userObj = {
         nama,
         role,
         kelas,
      };
      // Bila siswa, setup atribut latihan default
      if (role === 'siswa') {
         userObj.level = 1;
         userObj.xp = 0;
         userObj.analytics = INIT_TOPICS();
      }
      
      await addUser(userObj);
      setMessage(`Berhasil menambahkan ${role} ${nama}`);
      setNama('');
      setKelas('');
    } catch (err) {
      setMessage(`Gagal: ${err.message}`);
    }
    setLoading(false);
  };

  return (
     <div className="container animate-fade-in" style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div className="glass-panel" style={{maxWidth: '500px', width: '100%'}}>
           <div className="flex justify-between items-center mb-6">
              <button className="btn btn-outline flex items-center gap-2" onClick={onBack}>
                 <ArrowLeft size={16} /> Kembali
              </button>
              <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Manajemen Seeding Data</h2>
           </div>

           <form onSubmit={handleAdd}>
              <div className="mb-4">
                 <label className="block mb-2 text-sm">Nama Lengkap</label>
                 <input required type="text" className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white'}} value={nama} onChange={(e)=>setNama(e.target.value)} />
              </div>
              <div className="mb-4">
                 <label className="block mb-2 text-sm">Role/Akses</label>
                 <select className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.8)', border: '1px solid var(--surface-border)', color: 'white'}} value={role} onChange={(e)=>setRole(e.target.value)}>
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                 </select>
              </div>
              <div className="mb-6">
                 <label className="block mb-2 text-sm">Kelas (contoh: IX-A)</label>
                 <input required type="text" className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white'}} value={kelas} onChange={(e)=>setKelas(e.target.value)} />
              </div>

              {message && <div className={`badge ${message.startsWith('Gagal') ? 'badge-danger' : 'badge-success'} mb-4 p-3 w-full block text-center`}>{message}</div>}

              <button type="submit" disabled={loading} className="btn btn-primary w-full flex justify-center items-center gap-2">
                 <UserPlus size={20} /> {loading ? 'Memproses...' : 'Tambahkan Akun'}
              </button>
           </form>
        </div>
     </div>
  );
}
