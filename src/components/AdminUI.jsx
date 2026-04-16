import React, { useState } from 'react';
import { addUser, bulkAddUsers } from '../dbServices';
import { UserPlus, ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function AdminUI({ onBack }) {
  const [nama, setNama] = useState('');
  const [role, setRole] = useState('siswa');
  const [kelas, setKelas] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [importStatus, setImportStatus] = useState({ loading: false, syncing: false, success: 0, total: 0, error: '' });
  const [manualMode, setManualMode] = useState('single'); // 'single' or 'bulk'
  const [bulkData, setBulkData] = useState('');

  const INIT_TOPICS = () => ({ "Bilangan": { total: 0, correct: 0 }, "Aljabar": { total: 0, correct: 0 }, "Geometri": { total: 0, correct: 0 }, "Statistika": { total: 0, correct: 0 }, "Peluang": { total: 0, correct: 0 } });

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (manualMode === 'single') {
        const userObj = {
           nama,
           role,
           kelas,
        };
        if (role === 'siswa') {
           userObj.level = 1;
           userObj.xp = 0;
           userObj.analytics = INIT_TOPICS();
        }
        await addUser(userObj);
        setMessage(`Berhasil menambahkan ${role} ${nama}`);
        setNama('');
        setKelas('');
      } else {
        // Bulk mode
        const lines = bulkData.split('\n').filter(l => l.trim());
        if (lines.length === 0) throw new Error('Data massal kosong');
        
        const usersToImport = lines.map(line => {
           // Format: Nama|Kelas or just Nama
           const parts = line.split(/[|,\t]/).map(p => p.trim());
           const userObj = {
              nama: parts[0],
              role,
              kelas: parts[1] || kelas || 'Umum',
           };
           if (role === 'siswa') {
              userObj.level = 1;
              userObj.xp = 0;
              userObj.analytics = INIT_TOPICS();
           }
           return userObj;
        });
        
        await bulkAddUsers(usersToImport);
        setMessage(`Berhasil menambahkan ${usersToImport.length} ${role} secara massal`);
        setBulkData('');
      }
    } catch (err) {
      setMessage(`Gagal: ${err.message}`);
    }
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportStatus({ loading: true, success: 0, total: 0, error: '' });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        setImportStatus({ loading: true, syncing: false, success: 0, total: data.length, error: '' });

        try {
          const usersToImport = data.map(row => {
            const getVal = (variants) => {
              const key = Object.keys(row).find(k => variants.some(v => v.toLowerCase() === k.toLowerCase()));
              return key ? row[key] : null;
            };

            const id = getVal(['NIS/NIP', 'nip', 'nis', 'id']);
            const nama = getVal(['Nama', 'nama']);
            const kelas = getVal(['Kelas', 'kelas', 'grade']);
            const statusRaw = (getVal(['Status', 'status', 'role']) || 'siswa').toLowerCase();
            const role = statusRaw.includes('guru') ? 'guru' : 'siswa';

            if (id && nama) {
              const userObj = { id, nama, kelas: kelas || 'Umum', role };
              if (role === 'siswa') {
                userObj.level = 1;
                userObj.xp = 0;
                userObj.analytics = INIT_TOPICS();
              }
              return userObj;
            }
            return null;
          }).filter(u => u !== null);

          await bulkAddUsers(usersToImport, (completed) => {
             // Optimistic: progress langsung penuh, lanjut sinkronisasi ke server
             setImportStatus(prev => ({ ...prev, success: completed, syncing: true }));
          });
          
          // Server konfirmasi selesai
          setImportStatus(prev => ({ ...prev, loading: false, syncing: false }));
        } catch (err) {
          setImportStatus(prev => ({ ...prev, loading: false, syncing: false, error: 'Terjadi kesalahan: ' + err.message }));
        }
      },
      error: (err) => {
        setImportStatus({ loading: false, syncing: false, success: 0, total: 0, error: 'Gagal membaca file: ' + err.message });
      }
    });
  };

  return (
     <div className="container animate-fade-in" style={{minHeight: '100vh', padding: '2rem 0'}}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{maxWidth: '1100px', margin: '0 auto'}}>
           
           {/* Form Input Manual */}
           <div className="glass-panel" style={{height: 'fit-content'}}>
              <div className="flex justify-between items-center mb-6">
                 <button className="btn btn-outline flex items-center gap-2" onClick={onBack}>
                    <ArrowLeft size={16} /> Logout Admin
                 </button>
                 <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Input Data Manual</h2>
              </div>

              <form onSubmit={handleAdd}>
                 <div className="flex bg-black/30 p-1 rounded-lg mb-6">
                    <button type="button" onClick={()=>setManualMode('single')} className={`flex-1 py-2 text-sm rounded ${manualMode==='single' ? 'bg-primary text-white' : 'text-muted'}`}>Satu per Satu</button>
                    <button type="button" onClick={()=>setManualMode('bulk')} className={`flex-1 py-2 text-sm rounded ${manualMode==='bulk' ? 'bg-primary text-white' : 'text-muted'}`}>Tempel Massal</button>
                 </div>

                 <div className="mb-4">
                    <label className="block mb-1 text-sm text-muted">Role/Status</label>
                    <select className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.8)', border: '1px solid var(--surface-border)', color: 'white'}} value={role} onChange={(e)=>setRole(e.target.value)}>
                       <option value="siswa">Siswa</option>
                       <option value="guru">Guru</option>
                    </select>
                 </div>

                 {manualMode === 'single' ? (
                   <>
                     <div className="mb-4">
                        <label className="block mb-1 text-sm text-muted">Nama Lengkap</label>
                         <input required type="text" className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white'}} value={nama} onChange={(e)=>setNama(e.target.value)} />
                      </div>
                      <div className="mb-6">
                         <label className="block mb-1 text-sm text-muted">Kelas / Penempatan</label>
                         <input required type="text" className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white'}} value={kelas} onChange={(e)=>setKelas(e.target.value)} />
                      </div>
                   </>
                 ) : (
                   <div className="mb-6">
                      <label className="block mb-1 text-sm text-muted">Daftar Nama (Satu per baris)</label>
                      <p className="text-xs text-muted mb-2">Format: "Nama" atau "Nama, Kelas"</p>
                      <textarea 
                        className="w-full p-3 rounded h-32" 
                        style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', fontFamily: 'monospace'}} 
                        placeholder="Contoh:&#10;Andi Saputra&#10;Budi Santoso, 7A&#10;Citra Lestari"
                        value={bulkData}
                        onChange={(e)=>setBulkData(e.target.value)}
                      />
                      <div className="mt-4">
                         <label className="block mb-1 text-sm text-muted">Kelas Default (Jika tidak diisi di atas)</label>
                         <input type="text" className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white'}} value={kelas} onChange={(e)=>setKelas(e.target.value)} />
                      </div>
                   </div>
                 )}

                 {message && <div className={`badge ${message.startsWith('Gagal') ? 'badge-danger' : 'badge-success'} mb-4 p-3 w-full block text-center`}>{message}</div>}

                 <button type="submit" disabled={loading} className="btn btn-primary w-full flex justify-center items-center gap-2">
                    <UserPlus size={20} /> {loading ? 'Memproses...' : 'Tambahkan Akun'}
                 </button>
              </form>
           </div>

           {/* Import via CSV */}
           <div className="glass-panel" style={{height: 'fit-content'}}>
              <div className="flex items-center gap-2 mb-6">
                 <FileSpreadsheet size={24} color="var(--primary)" />
                 <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Import Data Siswa/Guru</h2>
              </div>

              <p className="text-sm mb-6" style={{color: 'var(--text-muted)', lineHeight: 1.6}}>
                 Unggah file CSV dengan format kolom: <br/>
                 <code style={{background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--secondary)'}}>
                    NIS/NIP, Nama, Kelas, Status
                 </code>
              </p>

              <div style={{border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem', textAlign: 'center', position: 'relative'}}>
                 <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload}
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}}
                    disabled={importStatus.loading}
                 />
                 <Upload size={48} color="var(--primary)" style={{margin: '0 auto 1rem', opacity: 0.7}} />
                 <p style={{fontWeight: 600}}>Klik atau Seret file CSV ke sini</p>
                 <p className="text-xs text-muted mt-2">Pastikan format file tepat dan tidak kosong</p>
              </div>

              {importStatus.total > 0 && (
                 <div className="mt-6 p-4 rounded" style={{background: 'rgba(255,255,255,0.05)', borderLeft: `4px solid ${!importStatus.loading && !importStatus.syncing ? 'var(--success)' : 'var(--primary)'}`}}>
                    <div className="flex items-center gap-3 mb-3">
                       {(!importStatus.loading && !importStatus.syncing) ? (
                          <CheckCircle size={20} color="var(--success)" />
                       ) : (
                          <div className="animate-spin" style={{width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', flexShrink: 0}}></div>
                       )}
                       <p className="text-sm" style={{fontWeight: 600}}>
                          {importStatus.syncing
                            ? `✅ ${importStatus.success} data divalidasi — menyimpan ke server...`
                            : importStatus.loading
                            ? `Membaca file CSV...`
                            : `✅ Berhasil tersimpan ${importStatus.success} dari ${importStatus.total} data ke server!`
                          }
                       </p>
                    </div>
                    {/* Progress bar */}
                    <div style={{background: 'rgba(255,255,255,0.1)', borderRadius: '99px', height: '6px', overflow: 'hidden'}}>
                       <div style={{
                          height: '100%',
                          width: importStatus.success > 0 ? '100%' : '0%',
                          background: (!importStatus.loading && !importStatus.syncing) ? 'var(--success)' : 'var(--primary)',
                          borderRadius: '99px',
                          transition: 'width 0.4s ease',
                          animation: importStatus.syncing ? 'pulse 1.5s infinite' : 'none'
                       }}></div>
                    </div>
                    {importStatus.syncing && (
                       <p className="text-xs mt-2" style={{color: 'var(--text-muted)'}}>
                          Data sudah diproses secara lokal, sedang disinkronkan ke cloud Firebase...
                       </p>
                    )}
                 </div>
              )}

              {importStatus.error && (
                 <div className="mt-4 p-4 rounded badge-danger flex items-center gap-2">
                    <AlertCircle size={18} />
                    <p className="text-sm">{importStatus.error}</p>
                 </div>
              )}
           </div>
        </div>
     </div>
  );
}
