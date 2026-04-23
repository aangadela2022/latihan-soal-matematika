import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../dbServices';
import { PieChart, LogOut, RefreshCcw, Users, User, BarChart2, TrendingUp, Target, Download, FileText, Trophy, Medal, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, ScatterChart, Scatter, Cell, AreaChart, Area 
} from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function TeacherUI({ user, onLogout }) {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('class'); // 'class', 'student', 'recap', 'ranking'
  const [rankPage, setRankPage] = useState(1);
  const RANK_PER_PAGE = 30;
  
  // Selection States
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const loadData = async () => {
     setLoading(true);
     try {
       const all = await fetchUsers();
       const sts = all.filter(u => u.role === 'siswa');
       setAllStudents(sts);
       
       // Default selection if empty
       const classes = [...new Set(sts.map(s => s.kelas))].sort();
       if (classes.length > 0 && !selectedClass) {
         setSelectedClass(classes[0]);
       }
     } catch (e) {
       console.error("error fetching", e);
     }
     setLoading(false);
  };

  useEffect(() => {
     loadData();
  }, []);

  const availableClasses = [...new Set(allStudents.map(s => s.kelas))].sort();
  const filteredStudentsByClass = allStudents.filter(s => s.kelas === selectedClass);
  const selectedStudent = allStudents.find(s => s.id === selectedStudentId);

  // --- ANALYTICS CALCULATIONS (CLASS) ---
  const calculateClassStats = () => {
    if (filteredStudentsByClass.length === 0) return null;

    const topics = ["Bilangan", "Aljabar", "Geometri", "Statistika", "Peluang"];
    const topicStats = topics.map(topic => {
       let totalScore = 0;
       let sessionCount = 0;
       
       filteredStudentsByClass.forEach(s => {
         const sessions = s.history?.filter(h => h.topik === topic) || [];
         sessions.forEach(sess => {
            const score = sess.totalSoal > 0 ? (sess.jumlahBenar / sess.totalSoal) * 100 : 0;
            totalScore += score;
            sessionCount++;
         });
       });

       return {
         topic,
         average: sessionCount > 0 ? Math.round(totalScore / sessionCount) : 0,
         totalSesi: sessionCount
       };
    });

    const totalClassScore = topicStats.reduce((acc, t) => acc + (t.average * t.totalSesi), 0);
    const totalClassSessions = topicStats.reduce((acc, t) => acc + t.totalSesi, 0);
    const classAvg = totalClassSessions > 0 ? Math.round(totalClassScore / totalClassSessions) : 0;

    return { classAvg, topicStats, totalClassSessions };
  };

  const classData = calculateClassStats();

  // --- ANALYTICS CALCULATIONS (STUDENT) ---
  const getStudentStats = () => {
    if (!selectedStudent) return null;
    
    const history = selectedStudent.history || [];
    const topics = ["Bilangan", "Aljabar", "Geometri", "Statistika", "Peluang"];
    
    const topicBreakdown = topics.map(topic => {
      const sess = history.filter(h => h.topik === topic);
      const avg = sess.length > 0 ? Math.round(sess.reduce((acc, s) => acc + (s.jumlahBenar / s.totalSoal * 100), 0) / sess.length) : 0;
      return { topic, total: sess.length, avg };
    });

    const overallAvg = history.length > 0 ? Math.round(history.reduce((acc, s) => acc + (s.jumlahBenar / s.totalSoal * 100), 0) / history.length) : 0;

    const chartData = [...history]
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
      .map((s, i) => ({
        name: `Sesi ${i+1}`,
        Nilai: Math.round(s.jumlahBenar / s.totalSoal * 100),
        topik: s.topik
      }));

    return { topicBreakdown, overallAvg, total: history.length, chartData };
  };

  const studentData = getStudentStats();

  // --- EXPORT CSV (REKAP KELAS) ---
  const handleExportClassData = () => {
     if (filteredStudentsByClass.length === 0) return;
     
     let csvContent = "data:text/csv;charset=utf-8,";
     csvContent += "NIS/NIP,Nama Lengkap,Kelas,Rata-rata Keseluruhan,Total Sesi\n";
     
     filteredStudentsByClass.forEach(s => {
        const history = s.history || [];
        const avg = history.length > 0 ? Math.round(history.reduce((acc, sess) => acc + (sess.jumlahBenar / sess.totalSoal * 100), 0) / history.length) : 0;
        csvContent += `${s.id},"${s.nama}",${s.kelas},${avg},${history.length}\n`;
     });
     
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `Rekap_Nilai_Kelas_${selectedClass}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="container animate-fade-in" style={{maxWidth: '1200px', margin: '1rem auto', paddingBottom: '4rem'}}>
       <header className="flex justify-between items-center mb-6 glass-panel" style={{padding: '1rem 2rem'}}>
          <div className="flex items-center gap-3">
            <PieChart size={28} color="var(--primary)" />
            <h2 style={{fontSize: '1.4rem', fontWeight: 700, margin: 0}}>Monitoring Guru</h2>
          </div>
          <div className="flex items-center gap-4">
             <span className="hidden md:block text-muted">Guru {user.nama}</span>
             <button onClick={loadData} className="btn btn-outline p-2" title="Refresh Data"><RefreshCcw size={18}/></button>
             <button className="btn btn-outline" onClick={onLogout} style={{padding: '0.5rem 1rem'}}><LogOut size={18}/></button>
          </div>
       </header>

       {/* Navigation Tabs */}
       <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button 
            className={`btn whitespace-nowrap flex items-center justify-center gap-2 ${view === 'class' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('class')}
          >
            <Users size={18} /> Monitoring Kelas
          </button>
          <button 
            className={`btn whitespace-nowrap flex items-center justify-center gap-2 ${view === 'student' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('student')}
          >
            <User size={18} /> Monitoring Siswa
          </button>
          <button 
            className={`btn whitespace-nowrap flex items-center justify-center gap-2 ${view === 'recap' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('recap')}
          >
            <FileText size={18} /> Rekap Nilai
          </button>
          <button 
            className={`btn whitespace-nowrap flex items-center justify-center gap-2 ${view === 'ranking' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setView('ranking'); setRankPage(1); }}
          >
            <Trophy size={18} /> Ranking
          </button>
       </div>

       {loading ? (
         <div className="text-center py-20">
           <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
           <p className="text-muted">Sinkronisasi data Firestore...</p>
         </div>
       ) : (
         <div className="animate-fade-in">
           
           {/* VIEW: MONITORING KELAS */}
           {view === 'class' && (
              <div className="flex flex-col gap-6">
                 <div className="glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                       <h3 style={{fontSize: '1.2rem', marginBottom: '0.2rem'}}>Analisis Perkembangan Kelas</h3>
                       <p className="text-sm text-muted">Melihat performa rata-rata keseluruhan siswa per kelas</p>
                    </div>
                    <select 
                      className="p-3 rounded bg-black border border-surface-border text-white min-w-[200px]"
                      value={selectedClass} 
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {availableClasses.length === 0 ? <option>Tunggu Data...</option> : availableClasses.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                    </select>
                 </div>

                 {classData ? (
                   <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="glass-panel text-center">
                          <p className="text-xs text-muted uppercase tracking-wider mb-1">Rerata Kelas</p>
                          <h4 style={{fontSize: '2rem', fontWeight: 800}}>{classData.classAvg}%</h4>
                       </div>
                       <div className="glass-panel text-center">
                          <p className="text-xs text-muted uppercase tracking-wider mb-1">Siswa Terdata</p>
                          <h4 style={{fontSize: '2rem', fontWeight: 800}}>{filteredStudentsByClass.length}</h4>
                       </div>
                       <div className="glass-panel text-center">
                          <p className="text-xs text-muted uppercase tracking-wider mb-1">Total Latihan</p>
                          <h4 style={{fontSize: '2rem', fontWeight: 800}}>{classData.totalClassSessions}</h4>
                       </div>
                       <div className="glass-panel text-center">
                          <p className="text-xs text-muted uppercase tracking-wider mb-1">Status</p>
                          <h4 style={{fontSize: '1.1rem', fontWeight: 600, color: 'var(--success)', marginTop: '0.8rem'}}>AKTIF</h4>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       <div className="glass-panel" style={{height: '400px'}}>
                          <h4 className="flex items-center gap-2 mb-6"><BarChart2 size={18}/> Grafik Rerata Kelas Per Topik</h4>
                          <ResponsiveContainer width="100%" height="80%">
                             <BarChart data={classData.topicStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="topic" stroke="var(--text-muted)" tick={{fontSize: 10}} />
                                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                                <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                                   {classData.topicStats.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                   ))}
                                </Bar>
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="glass-panel">
                          <h4 className="flex items-center gap-2 mb-4"><TrendingUp size={18}/> Detail Rerata Per Topik</h4>
                          <div className="flex flex-col gap-3">
                             {classData.topicStats.map((t, idx) => (
                                <div key={t.topic} className="flex items-center justify-between p-3 rounded" style={{background: 'rgba(255,255,255,0.03)'}}>
                                   <div className="flex items-center gap-3">
                                      <div style={{width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length]}}></div>
                                      <span>{t.topic}</span>
                                   </div>
                                   <div className="flex items-center gap-4">
                                      <span className="text-xs text-muted">{t.totalSesi} Sesi</span>
                                      <span style={{fontWeight: 700, color: t.average >= 70 ? 'var(--success)' : 'var(--warning)'}}>{t.average}%</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                   </>
                 ) : (
                   <div className="glass-panel text-center py-12">
                      <p className="text-muted">Tidak ada data latihan untuk kelas ini.</p>
                   </div>
                 )}
              </div>
           )}

           {/* VIEW: MONITORING SISWA */}
           {view === 'student' && (
              <div className="flex flex-col gap-6">
                 <div className="glass-panel flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                       <h3 style={{fontSize: '1.2rem'}}>Monitoring Individual Siswa</h3>
                    </div>
                    <div className="flex gap-4">
                       <select 
                         className="p-3 rounded bg-black border border-surface-border text-white min-w-[150px]"
                         value={selectedClass} 
                         onChange={(e) => {
                            setSelectedClass(e.target.value);
                            setSelectedStudentId('');
                         }}
                       >
                         {availableClasses.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                       </select>
                       <select 
                         className="p-3 rounded bg-black border border-surface-border text-white min-w-[200px]"
                         value={selectedStudentId} 
                         onChange={(e) => setSelectedStudentId(e.target.value)}
                       >
                         <option value="">-- Pilih Siswa --</option>
                         {filteredStudentsByClass.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                       </select>
                    </div>
                 </div>

                 {studentData ? (
                   <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="md:col-span-1 flex flex-col gap-6">
                          <div className="glass-panel text-center hover-glow" style={{border: '1px solid var(--primary)'}}>
                             <p className="text-xs text-muted mb-2 uppercase">Nilai Rata-rata</p>
                             <div style={{fontSize: '3rem', fontWeight: 900}}>{studentData.overallAvg}%</div>
                             <p className="text-primary text-sm mt-2">Level {selectedStudent.level || 1}</p>
                          </div>
                          <div className="glass-panel">
                             <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-muted">Statistik per Topik</h4>
                             <div className="flex flex-col gap-4">
                                {studentData.topicBreakdown.map((t, idx) => (
                                   <div key={t.topic}>
                                      <div className="flex justify-between text-sm mb-1">
                                         <span>{t.topic} ({t.total})</span>
                                         <span>{t.avg}%</span>
                                      </div>
                                      <div style={{height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden'}}>
                                         <div style={{width: `${t.avg}%`, height: '100%', background: COLORS[idx % COLORS.length], transition: 'width 1s'}}></div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="md:col-span-2 flex flex-col gap-6">
                          <div className="glass-panel" style={{height: '350px'}}>
                             <h4 className="flex items-center gap-2 mb-6"><Target size={18}/> Grafik Titik Kemajuan</h4>
                             <ResponsiveContainer width="100%" height="80%">
                                <ScatterChart margin={{ bottom: 20 }}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                   <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 10}} hide />
                                   <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
                                   <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{background: '#0f172a', border: 'none', borderRadius: '12px'}} />
                                   <Scatter name="Nilai" data={studentData.chartData}>
                                      {studentData.chartData.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                   </Scatter>
                                </ScatterChart>
                             </ResponsiveContainer>
                          </div>
                          
                          <div className="glass-panel">
                             <h4 className="flex items-center gap-2 mb-4"><RefreshCcw size={18}/> Riwayat Sesi Terbaru</h4>
                             <div className="grid gap-3">
                                {[...selectedStudent.history].reverse().slice(0, 5).map((h, i) => (
                                   <div key={i} className="flex justify-between items-center p-3 rounded" style={{background: 'rgba(255,255,255,0.03)'}}>
                                      <div>
                                         <p className="font-bold text-sm">{h.topik}</p>
                                         <p className="text-xs text-muted">{new Date(h.tanggal).toLocaleDateString()}</p>
                                      </div>
                                      <div className="text-right">
                                         <p className="font-black" style={{color: (h.jumlahBenar / h.totalSoal) >= 0.7 ? 'var(--success)' : 'var(--warning)'}}>
                                            {h.jumlahBenar}/{h.totalSoal}
                                         </p>
                                         <p className="text-[10px] text-muted">+{h.xpDidapat || 0} XP</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                   </>
                 ) : (
                   <div className="glass-panel text-center py-20">
                      <User size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-muted">Silakan pilih siswa untuk melihat detail performa.</p>
                   </div>
                 )}
              </div>
           )}

            {/* VIEW: REKAP NILAI SISWA */}
            {view === 'recap' && (
               <div className="flex flex-col gap-6">
                  <div className="glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <h3 style={{fontSize: '1.2rem', marginBottom: '0.2rem'}}>Rekap Nilai Siswa</h3>
                        <p className="text-sm text-muted">Melihat dan mengunduh rekap nilai rata-rata siswa per kelas</p>
                     </div>
                     <div className="flex flex-col md:flex-row gap-4">
                        <select 
                          className="p-3 rounded bg-black border border-surface-border text-white min-w-[200px]"
                          value={selectedClass} 
                          onChange={(e) => setSelectedClass(e.target.value)}
                        >
                          {availableClasses.length === 0 ? <option>Tunggu Data...</option> : availableClasses.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                        </select>
                        <button onClick={handleExportClassData} disabled={filteredStudentsByClass.length === 0} className="btn btn-primary flex items-center justify-center gap-2">
                           <Download size={18} /> Ekspor CSV
                        </button>
                     </div>
                  </div>

                  {filteredStudentsByClass.length > 0 ? (
                     <div className="glass-panel overflow-x-auto" style={{padding: '1rem'}}>
                        <table className="w-full text-sm text-left text-gray-300">
                           <thead className="text-xs uppercase bg-black/50 border-b border-gray-700">
                              <tr>
                                 <th className="px-4 py-4">NIS/NIP</th>
                                 <th className="px-4 py-4">Nama Lengkap</th>
                                 <th className="px-4 py-4">Kelas</th>
                                 <th className="px-4 py-4">Rata-rata Nilai</th>
                                 <th className="px-4 py-4">Total Sesi</th>
                              </tr>
                           </thead>
                           <tbody>
                              {filteredStudentsByClass.map((s, i) => {
                                 const history = s.history || [];
                                 const avg = history.length > 0 ? Math.round(history.reduce((acc, sess) => acc + (sess.jumlahBenar / sess.totalSoal * 100), 0) / history.length) : 0;
                                 return (
                                    <tr key={i} className="border-b border-gray-800 hover:bg-black/20">
                                       <td className="px-4 py-3">{s.id}</td>
                                       <td className="px-4 py-3 font-medium text-white">{s.nama}</td>
                                       <td className="px-4 py-3">{s.kelas}</td>
                                       <td className="px-4 py-3">
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${avg >= 70 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                             {avg}%
                                          </span>
                                       </td>
                                       <td className="px-4 py-3">{history.length}</td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  ) : (
                     <div className="glass-panel text-center py-12">
                        <p className="text-muted">Tidak ada siswa untuk kelas ini.</p>
                     </div>
                  )}
               </div>
            )}

           {/* VIEW: RANKING SELURUH SISWA */}
           {view === 'ranking' && (() => {
             // Hitung statistik semua siswa
             const ranked = allStudents.map(s => {
               const history = s.history || [];
               const totalSessions = history.length;
               const totalScore = history.reduce((acc, h) => acc + (h.jumlahBenar / h.totalSoal) * 100, 0);
               const averageScore = totalSessions > 0 ? totalScore / totalSessions : 0;
               const xp = s.xp || 0;
               return { ...s, totalSessions, averageScore, xp };
             }).sort((a, b) => {
               if (b.xp !== a.xp) return b.xp - a.xp;
               if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
               return b.totalSessions - a.totalSessions;
             });

             const totalPages = Math.ceil(ranked.length / 30);
             const pageData = ranked.slice((rankPage - 1) * 30, rankPage * 30);

             return (
               <div className="flex flex-col gap-6 animate-fade-in">
                 <div className="glass-panel" style={{border: '1px solid rgba(255,215,0,0.2)'}}>
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                     <div className="flex items-center gap-3">
                       <Trophy size={26} color="#FFD700" className="glow-effect-subtle" />
                       <div>
                         <h3 style={{fontWeight: 700, fontSize: '1.2rem', color: '#FFD700'}}>Papan Peringkat Seluruh Siswa</h3>
                         <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Diurutkan: XP → Rata-rata → Total Latihan · {ranked.length} siswa terdaftar</p>
                       </div>
                     </div>
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
                           const globalIdx = (rankPage - 1) * 30 + idx;
                           let rankDisplay;
                           if (globalIdx === 0) rankDisplay = <Medal size={20} color="#FFD700" />;
                           else if (globalIdx === 1) rankDisplay = <Medal size={20} color="#C0C0C0" />;
                           else if (globalIdx === 2) rankDisplay = <Medal size={20} color="#CD7F32" />;
                           else rankDisplay = <span style={{color: '#6b7280', fontWeight: 700}}>#{globalIdx + 1}</span>;

                           const avg = Math.round(student.averageScore);

                           return (
                             <tr
                               key={student.id}
                               style={{
                                 borderBottom: '1px solid rgba(255,255,255,0.05)',
                                 background: 'transparent',
                                 transition: 'background 0.2s',
                                 cursor: 'pointer'
                               }}
                               onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                             >
                               <td className="px-4 py-3" style={{textAlign: 'center'}}>
                                 <span className="flex items-center justify-center">{rankDisplay}</span>
                               </td>
                               <td className="px-4 py-3" style={{fontWeight: 500, color: '#e5e7eb'}}>{student.nama}</td>
                               <td className="px-4 py-3">
                                 <span style={{background: 'rgba(79,70,229,0.15)', color: '#a5b4fc', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600}}>
                                   {student.kelas}
                                 </span>
                               </td>
                               <td className="px-4 py-3 text-center" style={{fontWeight: 700, color: 'var(--secondary)'}}>{student.xp}</td>
                               <td className="px-4 py-3 text-center">
                                 <span style={{color: avg >= 70 ? 'var(--success)' : avg >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 600}}>
                                   {avg}%
                                 </span>
                               </td>
                               <td className="px-4 py-3 text-center" style={{color: '#9ca3af'}}>{student.totalSessions}</td>
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
                         Halaman {rankPage} dari {totalPages} · Total {ranked.length} siswa
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

         </div>
       )}
    </div>
  );
}
