import React, { useState, useEffect } from 'react';
import { User, Award, TrendingUp, ChevronRight, Brain, LayoutDashboard, History, Trophy, Medal } from 'lucide-react';
import HistoryUI from './HistoryUI';
import { fetchUsers } from '../dbServices';

export default function StudentUI({ user, onLogout, onStartPractice }) {
  const [activeTab, setActiveTab] = useState('beranda');
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRankInfo, setMyRankInfo] = useState(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const users = await fetchUsers();
        const students = users.filter(u => u.role === 'siswa');
        
        const rankedStudents = students.map(s => {
          const totalSessions = s.history ? s.history.length : 0;
          let totalScore = 0;
          if (s.history && s.history.length > 0) {
             s.history.forEach(h => {
                totalScore += (h.jumlahBenar / h.totalSoal) * 100;
             });
          }
          const averageScore = totalSessions > 0 ? (totalScore / totalSessions) : 0;
          const xp = s.xp || 0;
          
          return {
             ...s,
             totalSessions,
             averageScore,
             xp
          };
        });

        // Urutkan berdasarkan: 1. XP, 2. Rata-rata Nilai, 3. Total Sesi Latihan
        rankedStudents.sort((a, b) => {
           if (b.xp !== a.xp) return b.xp - a.xp;
           if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
           return b.totalSessions - a.totalSessions;
        });

        setLeaderboard(rankedStudents);
        
        const myIndex = rankedStudents.findIndex(s => s.id === user.id);
        if (myIndex !== -1) {
           setMyRankInfo({ rank: myIndex + 1, total: rankedStudents.length });
        }
      } catch (err) {
        console.error("Gagal memuat leaderboard", err);
      }
    };
    
    if (activeTab === 'beranda') {
       loadLeaderboard();
    }
  }, [activeTab, user.id, user.history]); // Dependensi user.history agar rank update usai latihan

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
               <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Kelas {user.kelas} • Level Numerasi: {user.level}</p>
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

            {/* Papan Peringkat */}
            {leaderboard.length > 0 && (
               <div className="glass-panel mb-8" style={{border: '1px solid rgba(255,215,0,0.3)'}}>
                  <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-3">
                        <Trophy size={24} color="#FFD700" className="glow-effect-subtle" />
                        <h3 style={{fontWeight: 700, fontSize: '1.2rem', color: '#FFD700'}}>Papan Peringkat Top 5</h3>
                     </div>
                     {myRankInfo && (
                        <div className="badge" style={{background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.4)', padding: '0.5rem 1rem'}}>
                           Peringkat Anda: <strong className="ml-1">#{myRankInfo.rank}</strong> <span className="opacity-80 ml-1">dari {myRankInfo.total} Siswa</span>
                        </div>
                     )}
                  </div>
                  
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-black/40 text-gray-400">
                           <tr>
                              <th className="px-4 py-3 rounded-tl-lg w-16 text-center">Rank</th>
                              <th className="px-4 py-3">Nama Siswa</th>
                              <th className="px-4 py-3">Kelas</th>
                              <th className="px-4 py-3 text-center">XP</th>
                              <th className="px-4 py-3 text-center">Rata-rata</th>
                              <th className="px-4 py-3 text-center rounded-tr-lg">Latihan</th>
                           </tr>
                        </thead>
                        <tbody>
                           {leaderboard.slice(0, 5).map((student, index) => {
                              const isMe = student.id === user.id;
                              let rankIcon = <span className="text-gray-400 font-bold">#{index + 1}</span>;
                              if (index === 0) rankIcon = <Medal size={22} color="#FFD700" />;
                              else if (index === 1) rankIcon = <Medal size={22} color="#C0C0C0" />;
                              else if (index === 2) rankIcon = <Medal size={22} color="#CD7F32" />;

                              return (
                                 <tr key={student.id} className={`border-b border-gray-800 ${isMe ? 'bg-primary/20' : 'hover:bg-black/20'}`}>
                                    <td className="px-4 py-3 flex items-center justify-center">{rankIcon}</td>
                                    <td className={`px-4 py-3 font-medium ${isMe ? 'text-white' : 'text-gray-200'}`}>
                                       {student.nama} {isMe && <span className="text-[10px] ml-2 bg-primary/40 px-1.5 py-0.5 rounded text-primary-content uppercase tracking-wider">Saya</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{student.kelas}</td>
                                    <td className="px-4 py-3 text-center font-bold text-secondary">{student.xp}</td>
                                    <td className="px-4 py-3 text-center text-gray-300">{Math.round(student.averageScore)}%</td>
                                    <td className="px-4 py-3 text-center text-gray-300">{student.totalSessions}</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            <div className="glass-panel text-center hover-glow" style={{padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(236,72,153,0.1))'}}>
              <TrendingUp size={48} color="var(--primary)" style={{margin: '0 auto 1.5rem'}} />
              <h1 className="title" style={{fontSize: '2.2rem'}}>Generative Adaptive Module</h1>
              <p className="subtitle" style={{maxWidth: '550px', margin: '0 auto 1.5rem'}}>
                 Pilih topik, dan akan disajikan studi kasus dunia nyata khusus untuk levelmu.
              </p>
              <p style={{color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '2rem'}}>
                 "Kerjakan setiap hari, dan kamu akan menguasainya"
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
