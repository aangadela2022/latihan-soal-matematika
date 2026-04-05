import React, { useEffect, useState, useRef } from 'react';
import { fetchUsers } from '../dbServices';
import { PieChart, LogOut, RefreshCcw } from 'lucide-react';

export default function TeacherUI({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // We load list again to get real-time info when teacher clicks refresh
  const loadData = async () => {
     setLoading(true);
     try {
       const all = await fetchUsers();
       const sts = all.filter(u => u.role === 'siswa');
       setStudents(sts);
     } catch (e) {
       console.error("error fetching", e);
     }
     setLoading(false);
  };

  useEffect(() => {
     loadData();
  }, []);

  const diagnosticMsg = () => {
    let INIT_TOPICS = () => ({ "Bilangan": { total: 0, correct: 0 }, "Aljabar": { total: 0, correct: 0 }, "Geometri": { total: 0, correct: 0 }, "Statistika": { total: 0, correct: 0 }, "Peluang": { total: 0, correct: 0 } });
    let aggregateRaw = INIT_TOPICS();
    for (let s of students) {
       if (!s.analytics) continue;
       for (const [topic, stats] of Object.entries(s.analytics)) {
         if (aggregateRaw[topic]) {
            aggregateRaw[topic].total += stats.total;
            aggregateRaw[topic].correct += stats.correct;
         }
       }
    }
    let weakestTopic = null; let lowestAcc = 1.1;
    let topTopic = null; let highestAcc = -0.1;
    for (const [topic, stats] of Object.entries(aggregateRaw)) {
       if (stats.total > 0) {
         let acc = stats.correct / stats.total;
         if (acc < lowestAcc) { lowestAcc = acc; weakestTopic = topic; }
         if (acc > highestAcc) { highestAcc = acc; topTopic = topic; }
       }
    }
    if (!weakestTopic) return "Belum ada dataset cukup dari riwayat aktivitas siswa kelas.";
    return `Diagnostic AI 🤖: Sekitar ${100 - Math.round(lowestAcc*100)}% percobaan kelas gagal pada konteks ${weakestTopic}. Topik terkuat dipegang oleh ${topTopic} (${Math.round(highestAcc*100)}%).`;
  };

  return (
    <div className="container animate-fade-in mt-10" style={{maxWidth: '1200px', margin: '2rem auto'}}>
       <header className="flex justify-between items-center mb-8 glass-panel" style={{padding: '1rem 2rem'}}>
          <div className="flex items-center gap-4">
            <PieChart size={28} color="var(--primary)" />
            <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>Advanced Analytics Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
             <span>Guru {user.nama}</span>
             <button onClick={loadData} className="btn btn-outline p-2" title="Refresh Data"><RefreshCcw size={18}/></button>
             <button className="btn btn-outline" onClick={onLogout} style={{padding: '0.5rem 1rem'}}><LogOut size={18}/></button>
          </div>
       </header>

       <div className="glass-panel mb-8" style={{background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(30,41,59,0.8) 100%)'}}>
          <p style={{lineHeight: 1.6, fontSize: '1rem', color: 'var(--text-main)', fontWeight: 300}}>
             {diagnosticMsg()}
          </p>
       </div>

       <div className="glass-panel">
          <h3 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Data Satuan Siswa</h3>
          <div className="grid gap-4">
             {loading ? <p>Memuat data...</p> : students.length === 0 ? <p className="text-muted">Belum ada siswa terdaftar.</p> : students.map(s => (
                <div key={s.id} className="flex justify-between items-center" style={{padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                    <div>
                       <p style={{fontWeight: 600, fontSize: '1.1rem'}}>{s.nama}</p>
                       <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem'}}>XP: {s.xp || 0} | Kelas: {s.kelas}</p>
                    </div>
                    <div>
                       {s.level === 1 ? <span className="badge badge-danger">Remedial (Lvl 1)</span> : ''}
                       {s.level === 2 ? <span className="badge badge-warning">Aplikasi (Lvl 2)</span> : ''}
                       {s.level === 3 ? <span className="badge badge-success">HOTS (Lvl 3)</span> : ''}
                    </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
