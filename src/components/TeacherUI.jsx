import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../dbServices';
import { PieChart, LogOut, RefreshCcw, Users, User, BarChart2, TrendingUp, Target } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, ScatterChart, Scatter, Cell, AreaChart, Area 
} from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function TeacherUI({ user, onLogout }) {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('class'); // 'class' or 'student'
  
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
       <div className="flex gap-4 mb-6">
          <button 
            className={`btn flex-1 flex items-center justify-center gap-2 ${view === 'class' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('class')}
          >
            <Users size={18} /> Monitoring Kelas
          </button>
          <button 
            className={`btn flex-1 flex items-center justify-center gap-2 ${view === 'student' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('student')}
          >
            <User size={18} /> Monitoring Siswa
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

         </div>
       )}
    </div>
  );
}
