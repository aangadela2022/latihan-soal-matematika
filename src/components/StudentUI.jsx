import React, { useState, useEffect } from 'react';
import { User, Award, TrendingUp, ChevronRight, Brain, LayoutDashboard, History, Trophy, Medal, ChevronLeft } from 'lucide-react';
import HistoryUI from './HistoryUI';
import { fetchUsers } from '../dbServices';

export default function StudentUI({ user, onLogout, onStartPractice }) {
  const [activeTab, setActiveTab] = useState('beranda');
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRankInfo, setMyRankInfo] = useState(null);
  const [rankPage, setRankPage] = useState(1);
  const RANK_PER_PAGE = 30;

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
    
    if (activeTab === 'beranda' || activeTab === 'ranking') {
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
         <button className={`btn ${activeTab === 'ranking' ? 'btn-primary shadow-glow' : 'btn-outline border-none text-muted'}`} onClick={() => { setActiveTab('ranking'); setRankPage(1); }} style={{padding: '0.5rem 1rem'}}>
            <Trophy size={18} /> Ranking
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

            {/* Papan Peringkat Mini (Top 3) */}
            {leaderboard.length > 0 && (
               <div className="glass-panel mb-8" style={{border: '1px solid rgba(255,215,0,0.3)'}}>
                  <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <Trophy size={22} color="#FFD700" className="glow-effect-subtle" />
                        <h3 style={{fontWeight: 700, fontSize: '1.1rem', color: '#FFD700'}}>Top 3 Peringkat</h3>
                     </div>
                     {myRankInfo && (
                        <div className="badge" style={{background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.4)', padding: '0.4rem 0.8rem', fontSize: '0.8rem'}}>
                           Peringkat Anda: <strong className="ml-1">#{myRankInfo.rank}</strong> <span className="opacity-80 ml-1">dari {myRankInfo.total}</span>
                        </div>
                     )}
                  </div>
                  <div className="flex flex-col gap-2">
                     {leaderboard.slice(0, 3).map((student, index) => {
                        const isMe = student.id === user.id;
                        const medals = ['#FFD700', '#C0C0C0', '#CD7F32'];
                        return (
                           <div key={student.id} className={`flex items-center gap-4 p-3 rounded-lg ${isMe ? 'bg-primary/20 border border-primary/40' : 'bg-black/20'}`}>
                              <Medal size={22} color={medals[index]} />
                              <span className="font-bold flex-1" style={{color: isMe ? 'white' : 'var(--text-main)'}}>{student.nama} {isMe && <span className="text-[10px] ml-2 bg-primary/40 px-1.5 py-0.5 rounded uppercase">Saya</span>}</span>
                              <span className="text-xs text-muted">{student.kelas}</span>
                              <span className="font-bold text-secondary text-sm">{student.xp} XP</span>
                           </div>
                        );
                     })}
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

      {/* TAB: RANKING LENGKAP */}
      {activeTab === 'ranking' && (() => {
        const totalPages = Math.ceil(leaderboard.length / RANK_PER_PAGE);
        const pageData = leaderboard.slice((rankPage - 1) * RANK_PER_PAGE, rankPage * RANK_PER_PAGE);
        return (
          <div className="animate-fade-in">
            <div className="glass-panel mb-4" style={{border: '1px solid rgba(255,215,0,0.2)'}}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Trophy size={26} color="#FFD700" className="glow-effect-subtle" />
                  <div>
                    <h3 style={{fontWeight: 700, fontSize: '1.2rem', color: '#FFD700'}}>Papan Peringkat Seluruh Siswa</h3>
                    <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Diurutkan berdasarkan XP → Rata-rata → Total Latihan</p>
                  </div>
                </div>
                {myRankInfo && (
                  <div style={{background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.35)', borderRadius: '10px', padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '0.9rem'}}>
                    Peringkat Saya: <strong>#{myRankInfo.rank}</strong> <span style={{opacity: 0.75}}>dari {myRankInfo.total} Siswa</span>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr style={{background: 'rgba(0,0,0,0.45)', color: '#9ca3af', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                      <th className="px-4 py-3 w-16 text-center rounded-tl-lg">Rank</th>
                      <th className="px-4 py-3">Nama Siswa</th>
                      <th className="px-4 py-3">Kelas</th>
                      <th className="px-4 py-3 text-center">XP</th>
                      <th className="px-4 py-3 text-center">Rata-rata</th>
                      <th className="px-4 py-3 text-center rounded-tr-lg">Latihan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((student, idx) => {
                      const globalIdx = (rankPage - 1) * RANK_PER_PAGE + idx;
                      const isMe = student.id === user.id;
                      let rankDisplay;
                      if (globalIdx === 0) rankDisplay = <Medal size={20} color="#FFD700" />;
                      else if (globalIdx === 1) rankDisplay = <Medal size={20} color="#C0C0C0" />;
                      else if (globalIdx === 2) rankDisplay = <Medal size={20} color="#CD7F32" />;
                      else rankDisplay = <span style={{color: '#6b7280', fontWeight: 700}}>#{globalIdx + 1}</span>;

                      return (
                        <tr
                          key={student.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: isMe ? 'rgba(79,70,229,0.18)' : 'transparent',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; }}
                          onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <td className="px-4 py-3" style={{textAlign: 'center'}}>
                            <span className="flex items-center justify-center">{rankDisplay}</span>
                          </td>
                          <td className="px-4 py-3" style={{fontWeight: isMe ? 700 : 500, color: isMe ? 'white' : '#e5e7eb'}}>
                            {student.nama}
                            {isMe && <span style={{fontSize: '0.65rem', marginLeft: '0.4rem', background: 'rgba(79,70,229,0.5)', color: '#a5b4fc', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Saya</span>}
                          </td>
                          <td className="px-4 py-3" style={{color: '#9ca3af'}}>{student.kelas}</td>
                          <td className="px-4 py-3 text-center" style={{fontWeight: 700, color: 'var(--secondary)'}}>{student.xp}</td>
                          <td className="px-4 py-3 text-center" style={{color: '#d1d5db'}}>{Math.round(student.averageScore)}%</td>
                          <td className="px-4 py-3 text-center" style={{color: '#d1d5db'}}>{student.totalSessions}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginasi */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4" style={{borderTop: '1px solid rgba(255,255,255,0.07)'}}>
                  <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                    Halaman {rankPage} dari {totalPages} · {leaderboard.length} siswa
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRankPage(p => Math.max(1, p - 1))}
                      disabled={rankPage === 1}
                      className="btn btn-outline p-2"
                      style={{opacity: rankPage === 1 ? 0.4 : 1}}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({length: totalPages}, (_, i) => i + 1).map(pg => (
                      <button
                        key={pg}
                        onClick={() => setRankPage(pg)}
                        className={`btn ${pg === rankPage ? 'btn-primary' : 'btn-outline'}`}
                        style={{padding: '0.35rem 0.75rem', minWidth: '2.2rem'}}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      onClick={() => setRankPage(p => Math.min(totalPages, p + 1))}
                      disabled={rankPage === totalPages}
                      className="btn btn-outline p-2"
                      style={{opacity: rankPage === totalPages ? 0.4 : 1}}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {activeTab === 'riwayat' && (
         <HistoryUI history={user.history || []} />
      )}
    </div>
  );
}
