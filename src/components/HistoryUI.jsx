import React from 'react';
import { Calendar, CheckCircle, Clock, BrainCircuit, Target } from 'lucide-react';

export default function HistoryUI({ history = [] }) {
  if (!history || history.length === 0) {
     return (
        <div className="glass-panel text-center py-12">
           <BrainCircuit size={48} color="var(--text-muted)" style={{margin: '0 auto 1.5rem'}} />
           <h3 style={{fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem'}}>Jejak Anda Masih Kosong</h3>
           <p style={{color: 'var(--text-muted)'}}>Mari selesaikan sesi latihan AI pertamamu untuk mulai membangun riwayat analitik.</p>
        </div>
     );
  }

  // Sort history from newest to oldest
  const sortedHistory = [...history].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return (
    <div className="animate-fade-in delay-100">
       <div className="grid gap-4">
          {sortedHistory.map((sess, idx) => (
             <div key={idx} className="glass-panel flex-row justify-between items-center transition-all hover-glow" style={{padding: '1.5rem', display: 'flex', gap: '1rem'}}>
                
                <div className="flex gap-4 items-center">
                   <div style={{background: 'rgba(79,70,229,0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)', border: '1px solid rgba(79,70,229,0.3)'}}>
                      <Calendar size={28} />
                   </div>
                   <div>
                      <h4 style={{fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)'}}>{sess.topik}</h4>
                      <div className="flex gap-3 mt-1" style={{color: 'var(--text-muted)', fontSize: '0.9rem', alignItems: 'center'}}>
                         <span className="flex items-center gap-1"><Clock size={14}/> {new Date(sess.tanggal).toLocaleString('id-ID', {dateStyle: 'medium', timeStyle: 'short'})}</span>
                         <span className="flex items-center gap-1" style={{color: 'var(--secondary)'}}><Target size={14}/> +{sess.xpDidapat || 0} XP</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2" style={{color: (sess.jumlahBenar / sess.totalSoal) >= 0.7 ? 'var(--success)' : (sess.jumlahBenar / sess.totalSoal) >= 0.4 ? 'var(--warning)' : 'var(--danger)', fontSize: '1.5rem', fontWeight: 700}}>
                      {sess.jumlahBenar} <span style={{fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400}}>/ {sess.totalSoal}</span>
                   </div>
                   <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Jawaban Benar</p>
                </div>

             </div>
          ))}
       </div>
    </div>
  );
}
