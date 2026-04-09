import React, { useState } from 'react';
import { User, Award, TrendingUp, ChevronRight, Brain, LayoutDashboard, History } from 'lucide-react';
import HistoryUI from './HistoryUI';

export default function StudentUI({ user, onLogout, onStartPractice }) {
  const [activeTab, setActiveTab] = useState('beranda');

  const calculateStudentWeakness = (analyticsObj) => {
    let weakestTopic = null;
    let lowestRate = 1.1; 
    let totalAttempted = 0;
  
    for (const [topic, stats] of Object.entries(analyticsObj || {})) {
      if (stats.total > 0) {
        totalAttempted += stats.total;
        const rate = stats.correct / stats.total;
        if (rate < lowestRate) {
          lowestRate = rate;
          weakestTopic = topic;
        }
      }
    }
    
    if (totalAttempted === 0) return "Sistem AI lokal mendeteksi Anda belum mengerjakan tes. Mulailah berlatih agar kami bisa memetakan profil kognitif Anda!";
    if (lowestRate >= 0.8) return "Daya analitis dan adaptasi Anda luar biasa di seluruh topik. Teruskan momentum ini!";
    
    const percentage = Math.round(lowestRate * 100);
    return `Terdeteksi kelemahan struktural pada konsep ${weakestTopic} (Akurasi: ${percentage}%). Sangat disarankan Anda berlatih topik tersebut.`;
  };

  return (
    <div className="container animate-fade-in mt-10" style={{maxWidth: '1000px', margin: '2rem auto'}}>
      {/* Header Profile */}
      <header className="flex justify-between items-center mb-6 glass-panel" style={{padding: '1rem 2rem'}}>
        <div className="flex items-center gap-4">
           <div style={{background: 'rgba(79,70,229,0.2)', padding:'0.8rem', borderRadius:'50%', border: '1px solid rgba(79,70,229,0.5)'}} className="glow-effect-subtle">
              <User size={28} color="var(--primary)" />
           </div>
           <div>
              <h2 style={{fontSize: '1.2rem', fontWeight: 600}}>{user.nama}</h2>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Level Numerasi: {user.level}</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 glow-effect-subtle" style={{background: 'rgba(236,72,153,0.2)', color: 'var(--secondary)', padding: '0.4rem 0.8rem', borderRadius: '16px', fontWeight: 600, border: '1px solid rgba(236,72,153,0.3)'}}>
             <Award size={18} /> {user.xp} XP
           </div>
           <button className="btn btn-outline hover-glow" onClick={onLogout} style={{padding: '0.5rem 1rem'}}>Logout</button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 p-1 glass-panel" style={{width: 'fit-content', padding: '0.5rem', borderRadius: '12px'}}>
         <button className={`btn ${activeTab === 'beranda' ? 'btn-primary shadow-glow' : 'btn-outline border-none text-muted'}`} onClick={() => setActiveTab('beranda')} style={{padding: '0.5rem 1rem'}}>
            <LayoutDashboard size={18} /> Beranda
         </button>
         <button className={`btn ${activeTab === 'riwayat' ? 'btn-primary shadow-glow' : 'btn-outline border-none text-muted'}`} onClick={() => setActiveTab('riwayat')} style={{padding: '0.5rem 1rem'}}>
            <History size={18} /> Riwayat Saya
         </button>
      </div>

      {activeTab === 'beranda' && (
         <div className="animate-fade-in">
            <div className="glass-panel mb-8 hover-glow" style={{background: 'linear-gradient(to right, rgba(15,23,42,0.8), rgba(79,70,229,0.1))', borderLeft: '4px solid var(--primary)'}}>
               <div className="flex items-center gap-3 mb-2">
                  <Brain color="var(--primary)" size={20} className="glow-effect-subtle" />
                  <h3 style={{fontWeight: 700, color: 'var(--primary)'}}>Personal Learning Coach</h3>
               </div>
               <p style={{color: 'var(--text-main)', lineHeight: 1.6}}>
                  {calculateStudentWeakness(user.analytics)}
               </p>
            </div>

            <div className="glass-panel text-center hover-glow" style={{padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(236,72,153,0.1))'}}>
              <TrendingUp size={48} color="var(--primary)" style={{margin: '0 auto 1.5rem'}} />
              <h1 className="title" style={{fontSize: '2.2rem'}}>Generative Adaptive Module</h1>
              <p className="subtitle" style={{maxWidth: '550px', margin: '0 auto 2rem'}}>
                 Pilih topik, dan akan disajikan studi kasus dunia nyata khusus untuk levelmu.
              </p>
              <button className="btn btn-primary shadow-glow" style={{fontSize: '1.2rem', padding: '1rem 2.5rem', borderRadius: '50px'}} onClick={onStartPractice}>
                 Mulai Misi Numerasi <ChevronRight />
              </button>
            </div>
         </div>
      )}

      {activeTab === 'riwayat' && (
         <HistoryUI history={user.history || []} />
      )}
    </div>
  );
}
