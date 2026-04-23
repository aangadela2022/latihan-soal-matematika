import React, { useState, useEffect } from 'react';
import { addUser, bulkAddUsers, fetchUsers, deleteAllUsers, updateUserProfile, resetAllPracticeData } from '../dbServices';
import { UserPlus, ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Trash2, Database, Search, Edit2, RotateCcw } from 'lucide-react';
import Papa from 'papaparse';

const CLASS_OPTIONS = [
  "Guru",
  "X NKPI 1", "X NKPI 2", "X APHP 1", "X APHP 2", "X TKJ 1", "X TKJ 2", "X TKJ 3", "X RPL 1", "X RPL 2", "X TAB 1", "X TAB 2", "X TAB 3", "X KULINER 1", "X KULINER 2", "X KULINER 3", "X APPL", "X TP 1", "X TP 2",
  "XI NKPI 1", "XI NKPI 2", "XI APHP 1", "XI APHP 2", "XI TKJ 1", "XI TKJ 2", "XI TKJ 3", "XI RPL 1", "XI RPL 2", "XI TAB 1", "XI TAB 2", "XI TAB 3", "XI KULINER 1", "XI KULINER 2", "XI KULINER 3", "XI APPL", "XI TP 1", "XI TP 2"
];

const CONFIRM_KEYWORD = 'serang12345';

export default function AdminUI({ onBack }) {
  const [nama, setNama] = useState('');
  const [nis, setNis] = useState('');
  const [role, setRole] = useState('siswa');
  const [kelas, setKelas] = useState(CLASS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [importStatus, setImportStatus] = useState({ loading: false, syncing: false, success: 0, skipped: 0, total: 0, error: '' });
  const [manualMode, setManualMode] = useState('single'); // 'single' or 'bulk'
  const [bulkData, setBulkData] = useState('');
  const [previewData, setPreviewData] = useState(null);
  
  // States for Edit Data
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'reset'|'delete', keyword: '' }
  const [confirmInput, setConfirmInput] = useState('');

  const INIT_TOPICS = () => ({ "Bilangan": { total: 0, correct: 0 }, "Aljabar": { total: 0, correct: 0 }, "Geometri": { total: 0, correct: 0 }, "Statistika": { total: 0, correct: 0 }, "Peluang": { total: 0, correct: 0 } });

  const loadAllUsers = async () => {
     try {
        const users = await fetchUsers();
        setAllUsers(users);
     } catch (err) {
        console.error(err);
     }
  };

  useEffect(() => {
     loadAllUsers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (manualMode === 'single') {
        const userObj = {
           id: nis || undefined,
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
        setNis('');
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

          setPreviewData(usersToImport);
          setImportStatus(prev => ({ ...prev, loading: false, syncing: false, total: usersToImport.length }));
        } catch (err) {
          setImportStatus(prev => ({ ...prev, loading: false, syncing: false, error: 'Terjadi kesalahan: ' + err.message }));
        }
      },
      error: (err) => {
        setImportStatus({ loading: false, syncing: false, success: 0, total: 0, error: 'Gagal membaca file: ' + err.message });
      }
    });
  };

  const handleConfirmImport = async () => {
    if (!previewData || previewData.length === 0) return;
    setImportStatus(prev => ({ ...prev, loading: true, syncing: true }));
    try {
      const result = await bulkAddUsers(previewData, (completed) => {
         setImportStatus(prev => ({ ...prev, success: completed }));
      });
      const added = result?.added ?? 0;
      const skipped = result?.skipped ?? 0;
      setImportStatus(prev => ({ ...prev, loading: false, syncing: false, success: added, skipped, total: previewData.length }));
      setPreviewData(null);
      loadAllUsers();
    } catch (err) {
      setImportStatus(prev => ({ ...prev, loading: false, syncing: false, error: 'Terjadi kesalahan: ' + err.message }));
    }
  };

  const handleExportAll = async () => {
     try {
        const users = await fetchUsers();
        if (users.length === 0) {
           alert("Tidak ada data di server.");
           return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "NIS/NIP,Nama Lengkap,Role,Kelas,Level,XP,Sesi Selesai\n";
        
        users.forEach(u => {
           const historyCount = u.history ? u.history.length : 0;
           csvContent += `${u.id},"${u.nama}",${u.role},${u.kelas},${u.level || 1},${u.xp || 0},${historyCount}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Backup_Data_Server_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
     } catch (err) {
        alert("Gagal mengekspor data: " + err.message);
     }
  };

  const handleResetData = () => {
     setConfirmInput('');
     setConfirmModal({ type: 'delete' });
  };

  const handleResetPracticeData = () => {
     setConfirmInput('');
     setConfirmModal({ type: 'reset' });
  };

  const handleConfirmAction = async () => {
     if (confirmInput !== CONFIRM_KEYWORD) return;
     const type = confirmModal.type;
     setConfirmModal(null);
     setConfirmInput('');
     try {
        if (type === 'delete') {
           await deleteAllUsers();
           setMessage('Seluruh akun berhasil dihapus dari server.');
           loadAllUsers();
        } else {
           await resetAllPracticeData();
           setMessage('Data latihan berhasil di-reset untuk seluruh pengguna.');
           loadAllUsers();
        }
     } catch (err) {
        setMessage(`Gagal: ${err.message}`);
     }
  };

  return (
     <div className="container animate-fade-in" style={{minHeight: '100vh', padding: '2rem 0'}}>

        {/* ── Confirmation Modal ── */}
        {confirmModal && (
           <div style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem'
           }}>
              <div className="glass-panel" style={{
                 maxWidth: '440px', width: '100%',
                 border: confirmModal.type === 'delete' ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(234,179,8,0.5)',
                 boxShadow: confirmModal.type === 'delete' ? '0 0 32px rgba(239,68,68,0.2)' : '0 0 32px rgba(234,179,8,0.2)'
              }}>
                 <div className="flex items-center gap-3 mb-4">
                    {confirmModal.type === 'delete'
                       ? <Trash2 size={28} color="#ef4444" />
                       : <RotateCcw size={28} color="#eab308" />}
                    <h3 style={{fontSize: '1.1rem', fontWeight: 700, color: confirmModal.type === 'delete' ? '#ef4444' : '#eab308'}}>
                       {confirmModal.type === 'delete' ? 'Hapus Seluruh Akun' : 'Reset Data Latihan'}
                    </h3>
                 </div>

                 <p className="text-sm mb-2" style={{color: 'var(--text-muted)', lineHeight: 1.6}}>
                    {confirmModal.type === 'delete'
                       ? 'Tindakan ini akan menghapus SEMUA akun siswa dan guru beserta seluruh riwayat latihan secara permanen dan tidak dapat dibatalkan.'
                       : 'Tindakan ini akan mereset XP, riwayat latihan, dan analitik seluruh siswa. Akun tidak akan dihapus.'}
                 </p>

                 <p className="text-sm mb-4" style={{color: 'white', fontWeight: 600}}>
                    Ketik <code style={{
                       background: 'rgba(255,255,255,0.1)', padding: '2px 8px',
                       borderRadius: '6px', letterSpacing: '0.05em',
                       color: confirmModal.type === 'delete' ? '#f87171' : '#fde047'
                    }}>{CONFIRM_KEYWORD}</code> untuk melanjutkan:
                 </p>

                 <input
                    type="text"
                    autoFocus
                    placeholder={`Ketik ${CONFIRM_KEYWORD}`}
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAction(); if (e.key === 'Escape') { setConfirmModal(null); setConfirmInput(''); } }}
                    style={{
                       width: '100%', padding: '0.75rem 1rem',
                       background: 'rgba(0,0,0,0.5)',
                       border: `1px solid ${confirmInput === CONFIRM_KEYWORD ? (confirmModal.type === 'delete' ? '#ef4444' : '#eab308') : 'var(--surface-border)'}`,
                       borderRadius: '8px', color: 'white', fontSize: '0.95rem',
                       outline: 'none', marginBottom: '1.25rem',
                       transition: 'border-color 0.2s'
                    }}
                 />

                 <div className="flex gap-3">
                    <button
                       onClick={() => { setConfirmModal(null); setConfirmInput(''); }}
                       className="btn btn-outline flex-1"
                    >
                       Batal
                    </button>
                    <button
                       onClick={handleConfirmAction}
                       disabled={confirmInput !== CONFIRM_KEYWORD}
                       className="btn flex-1"
                       style={{
                          background: confirmInput !== CONFIRM_KEYWORD
                             ? 'rgba(100,100,100,0.3)'
                             : confirmModal.type === 'delete' ? 'rgba(239,68,68,0.8)' : 'rgba(234,179,8,0.8)',
                          color: 'white',
                          cursor: confirmInput !== CONFIRM_KEYWORD ? 'not-allowed' : 'pointer',
                          opacity: confirmInput !== CONFIRM_KEYWORD ? 0.5 : 1,
                          transition: 'all 0.2s'
                       }}
                    >
                       {confirmModal.type === 'delete' ? 'Ya, Hapus Semua' : 'Ya, Reset Latihan'}
                    </button>
                 </div>
              </div>
           </div>
        )}

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
                        <label className="block mb-1 text-sm text-muted">NIS / NIP (Opsional)</label>
                        <input type="text" className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white'}} value={nis} onChange={(e)=>setNis(e.target.value)} />
                     </div>
                     <div className="mb-4">
                        <label className="block mb-1 text-sm text-muted">Nama Lengkap</label>
                         <input required type="text" className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white'}} value={nama} onChange={(e)=>setNama(e.target.value)} />
                      </div>
                      <div className="mb-6">
                         <label className="block mb-1 text-sm text-muted">Kelas / Penempatan</label>
                         <select className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.8)', border: '1px solid var(--surface-border)', color: 'white'}} value={kelas} onChange={(e)=>setKelas(e.target.value)}>
                            {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                         </select>
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
                          <select className="w-full p-3 rounded" style={{background: 'rgba(0,0,0,0.8)', border: '1px solid var(--surface-border)', color: 'white'}} value={kelas} onChange={(e)=>setKelas(e.target.value)}>
                             {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
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

              {previewData && previewData.length > 0 && (
                 <div className="mt-6">
                    <h3 className="mb-2 font-bold" style={{color: 'white'}}>Preview Data ({previewData.length} baris)</h3>
                    <div className="overflow-x-auto overflow-y-auto mb-4 rounded" style={{maxHeight: '300px', border: '1px solid var(--surface-border)'}}>
                       <table className="w-full text-sm text-left text-gray-300">
                          <thead className="text-xs uppercase bg-black/50 sticky top-0">
                             <tr>
                                <th className="px-4 py-3">NIS/NIP</th>
                                <th className="px-4 py-3">Nama</th>
                                <th className="px-4 py-3">Kelas</th>
                                <th className="px-4 py-3">Role</th>
                             </tr>
                          </thead>
                          <tbody>
                             {previewData.slice(0, 50).map((user, i) => (
                                <tr key={i} className="border-b border-gray-700 bg-black/20">
                                   <td className="px-4 py-2">{user.id}</td>
                                   <td className="px-4 py-2">{user.nama}</td>
                                   <td className="px-4 py-2">{user.kelas}</td>
                                   <td className="px-4 py-2">{user.role}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                       {previewData.length > 50 && <p className="text-center text-xs text-muted py-2">Menampilkan 50 baris pertama...</p>}
                    </div>
                    <div className="flex gap-4 mt-4">
                       <button onClick={() => setPreviewData(null)} className="btn btn-outline flex-1">Batal</button>
                       <button onClick={handleConfirmImport} disabled={importStatus.loading || importStatus.syncing} className="btn btn-primary flex-1 flex justify-center items-center gap-2">
                          <Upload size={18} /> Simpan ke Server
                       </button>
                    </div>
                 </div>
              )}

              {importStatus.total > 0 && !previewData && (
                 <div className="mt-6 p-4 rounded" style={{background: 'rgba(255,255,255,0.05)', borderLeft: `4px solid ${!importStatus.loading && !importStatus.syncing ? 'var(--success)' : 'var(--primary)'}`}}>
                    <div className="flex items-center gap-3 mb-3">
                       {(!importStatus.loading && !importStatus.syncing) ? (
                          <CheckCircle size={20} color="var(--success)" />
                       ) : (
                          <div className="animate-spin" style={{width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', flexShrink: 0}}></div>
                       )}
                       <p className="text-sm" style={{fontWeight: 600}}>
                          {importStatus.syncing
                            ? `Memeriksa & menyimpan data baru ke server...`
                            : importStatus.loading
                            ? `Membaca file CSV...`
                            : importStatus.success === 0 && importStatus.skipped > 0
                            ? `ℹ️ Semua ${importStatus.skipped} data sudah ada — tidak ada yang ditambahkan.`
                            : `✅ ${importStatus.success} data baru berhasil ditambahkan${importStatus.skipped > 0 ? ` · ${importStatus.skipped} dilewati (sudah ada)` : ''}`
                          }
                       </p>
                    </div>
                    {/* Progress bar */}
                    <div style={{background: 'rgba(255,255,255,0.1)', borderRadius: '99px', height: '6px', overflow: 'hidden'}}>
                       <div style={{
                          height: '100%',
                          width: importStatus.total > 0 ? `${(importStatus.success / importStatus.total) * 100}%` : '0%',
                          background: (!importStatus.loading && !importStatus.syncing) ? 'var(--success)' : 'var(--primary)',
                          borderRadius: '99px',
                          transition: 'width 0.4s ease',
                          animation: importStatus.syncing ? 'pulse 1.5s infinite' : 'none'
                       }}></div>
                    </div>
                    {importStatus.syncing && (
                       <p className="text-xs mt-2" style={{color: 'var(--text-muted)'}}>
                          Data sedang disinkronkan ke cloud...
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

            {/* Manajemen Basis Data */}
            <div className="glass-panel md:col-span-2" style={{height: 'fit-content'}}>
               <div className="flex items-center gap-2 mb-6">
                  <Database size={24} color="var(--primary)" />
                  <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Manajemen Basis Data Server</h2>
               </div>
               <p className="text-sm mb-6 text-muted">Gunakan fitur ini untuk membackup seluruh data akun (Siswa dan Guru) ke format Excel atau mengatur ulang (reset) server ke kondisi kosong awal.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button onClick={handleExportAll} className="btn btn-outline flex flex-col items-center justify-center gap-3 py-8 hover:bg-primary/20">
                     <Download size={32} />
                     <span>Ekspor Seluruh Data (CSV)</span>
                  </button>
                  <button onClick={handleResetPracticeData} className="btn flex flex-col items-center justify-center gap-3 py-8 bg-yellow-900/40 hover:bg-yellow-600/60 border border-yellow-500/50 text-yellow-200">
                     <RotateCcw size={32} />
                     <span>Reset Data Latihan</span>
                  </button>
                  <button onClick={handleResetData} className="btn flex flex-col items-center justify-center gap-3 py-8 bg-red-900/40 hover:bg-red-600/60 border border-red-500/50 text-red-200">
                     <Trash2 size={32} />
                     <span>Hapus Seluruh Akun</span>
                  </button>
               </div>
            </div>

            {/* Pencarian dan Edit Data */}
            <div className="glass-panel md:col-span-2" style={{height: 'fit-content', marginBottom: '4rem'}}>
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                     <Edit2 size={24} color="var(--primary)" />
                     <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>Edit Data Pengguna</h2>
                  </div>
                  <button onClick={loadAllUsers} className="btn btn-outline px-3 py-1 text-xs">Muat Ulang Data</button>
               </div>
               
               <div className="relative mb-6">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input 
                     type="text" 
                     className="w-full p-3 pl-10 rounded" 
                     style={{background: 'rgba(0,0,0,0.8)', border: '1px solid var(--surface-border)', color: 'white'}} 
                     placeholder="Cari berdasarkan NIS atau Nama..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>

               <div className="overflow-x-auto rounded" style={{maxHeight: '400px', border: '1px solid var(--surface-border)'}}>
                  <table className="w-full text-sm text-left text-gray-300">
                     <thead className="text-xs uppercase bg-black/50 sticky top-0 z-10">
                        <tr>
                           <th className="px-4 py-3">NIS/NIP</th>
                           <th className="px-4 py-3">Nama Lengkap</th>
                           <th className="px-4 py-3">Kelas</th>
                           <th className="px-4 py-3">Role</th>
                           <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                     </thead>
                     <tbody>
                        {allUsers.filter(u => u.nama.toLowerCase().includes(searchQuery.toLowerCase()) || String(u.id).toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 50).map(user => (
                           <tr key={user.id} className="border-b border-gray-800 hover:bg-black/20">
                              {editingUser?.originalId === user.id ? (
                                 <>
                                    <td className="px-4 py-2">
                                       <input className="p-1.5 rounded bg-black/50 border border-gray-600 text-white w-full" value={editingUser.id} onChange={(e) => setEditingUser({...editingUser, id: e.target.value})} />
                                    </td>
                                    <td className="px-4 py-2">
                                       <input className="p-1.5 rounded bg-black/50 border border-gray-600 text-white w-full" value={editingUser.nama} onChange={(e) => setEditingUser({...editingUser, nama: e.target.value})} />
                                    </td>
                                    <td className="px-4 py-2">
                                       <select className="p-1.5 rounded bg-black/50 border border-gray-600 text-white" value={editingUser.kelas} onChange={(e) => setEditingUser({...editingUser, kelas: e.target.value})}>
                                          {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                       </select>
                                    </td>
                                    <td className="px-4 py-2">
                                       <select className="p-1.5 rounded bg-black/50 border border-gray-600 text-white" value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}>
                                          <option value="siswa">siswa</option>
                                          <option value="guru">guru</option>
                                       </select>
                                    </td>
                                    <td className="px-4 py-2 text-center min-w-[150px]">
                                       <button onClick={async () => {
                                          try {
                                             await updateUserProfile(editingUser.originalId, { id: editingUser.id, nama: editingUser.nama, kelas: editingUser.kelas, role: editingUser.role });
                                             setAllUsers(allUsers.map(u => u.id === editingUser.originalId ? { ...editingUser, originalId: undefined } : u));
                                             setEditingUser(null);
                                          } catch (e) {
                                             alert("Gagal menyimpan: " + e.message);
                                          }
                                       }} className="btn btn-primary px-3 py-1 text-xs">Simpan</button>
                                       <button onClick={() => setEditingUser(null)} className="btn btn-outline px-3 py-1 text-xs ml-2">Batal</button>
                                    </td>
                                 </>
                              ) : (
                                 <>
                                    <td className="px-4 py-3">{user.id}</td>
                                    <td className="px-4 py-3 font-medium text-white">{user.nama}</td>
                                    <td className="px-4 py-3">{user.kelas}</td>
                                    <td className="px-4 py-3 capitalize">{user.role}</td>
                                    <td className="px-4 py-3 text-center">
                                       <button onClick={() => setEditingUser({...user, originalId: user.id})} className="btn btn-outline px-3 py-1 text-xs hover:bg-primary/20">Edit</button>
                                    </td>
                                 </>
                              )}
                           </tr>
                        ))}
                        {allUsers.length === 0 && (
                           <tr>
                              <td colSpan="5" className="text-center py-8 text-muted">Belum ada data atau data sedang dimuat...</td>
                           </tr>
                        )}
                        {allUsers.length > 0 && allUsers.filter(u => u.nama.toLowerCase().includes(searchQuery.toLowerCase()) || String(u.id).toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                           <tr>
                              <td colSpan="5" className="text-center py-8 text-muted">Tidak ditemukan data dengan pencarian "{searchQuery}"</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

         </div>
     </div>
  );
}
