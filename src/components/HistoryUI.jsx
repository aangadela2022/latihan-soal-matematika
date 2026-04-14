import React from 'react';
import { Calendar, CheckCircle, Clock, BrainCircuit, Target, TrendingUp, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, Cell } from 'recharts';

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

  // Global Sort (chronological)
  const chartHistory = [...history].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  
  const globalChartData = chartHistory.map((sess, index) => {
     const nilai = sess.totalSoal > 0 ? Math.round((sess.jumlahBenar / sess.totalSoal) * 100) : 0;
     return {
        name: `L#${index + 1}`,
        Nilai: nilai,
        topik: sess.topik
     }
  });

  const totalLatihan = history.length;
  const rataRataNilai = globalChartData.length > 0 ? Math.round(globalChartData.reduce((acc, curr) => acc + curr.Nilai, 0) / globalChartData.length) : 0;

  // Aggregate by topic
  const historyByTopic = {};
  history.forEach(sess => {
    if (!historyByTopic[sess.topik]) historyByTopic[sess.topik] = [];
    historyByTopic[sess.topik].push(sess);
  });

  const topicSummary = Object.keys(historyByTopic).map(topik => {
    const sessions = [...historyByTopic[topik]].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    const total = sessions.length;
    const avg = Math.round(sessions.reduce((acc, s) => acc + (s.totalSoal > 0 ? (s.jumlahBenar / s.totalSoal) * 100 : 0), 0) / total);
    const topicChartData = sessions.map((s, idx) => ({
      name: `${idx + 1}`,
      Nilai: Math.round((s.jumlahBenar / s.totalSoal) * 100)
    }));
    return { topik, total, avg, topicChartData };
  });

  // Sort history for display list (newest first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="animate-fade-in delay-100 flex flex-col gap-6" style={{paddingBottom: '2rem'}}>
       
       <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={28} color="var(--primary)" />
          <h2 className="title" style={{fontSize: '1.8rem', margin: 0}}>Progress Belajar</h2>
       </div>

       {/* Global Summary Cards */}
       <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel text-center hover-glow" style={{padding: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)'}}>
             <h3 style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Rata-rata Keseluruhan</h3>
             <div style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', textShadow: '0 0 10px rgba(255,255,255,0.2)'}}>{rataRataNilai}%</div>
          </div>
          <div className="glass-panel text-center hover-glow" style={{padding: '1.5rem', border: '1px solid rgba(236, 72, 153, 0.2)'}}>
             <h3 style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Total Latihan</h3>
             <div style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', textShadow: '0 0 10px rgba(255,255,255,0.2)'}}>{totalLatihan}</div>
          </div>
       </div>

       {/* Overall Progress Chart */}
       <div className="glass-panel" style={{padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)'}}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={20} color="var(--primary)" />
            <h3 style={{fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600}}>Grafik Titik Kemajuan Global</h3>
          </div>
          <div style={{height: '300px', width: '100%'}}>
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                 <XAxis type="category" dataKey="name" stroke="var(--text-muted)" tick={{fontSize: 12}} label={{ value: 'Urutan Latihan', position: 'insideBottom', offset: -10, fill: 'var(--text-muted)', fontSize: 12 }} />
                 <YAxis type="number" dataKey="Nilai" stroke="var(--text-muted)" domain={[0, 100]} label={{ value: 'Nilai (%)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }} />
                 <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--surface-border)', borderRadius: '12px', color: 'white'}} />
                 <Scatter name="Performa" data={globalChartData} fill="var(--primary)">
                    {globalChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Scatter>
               </ScatterChart>
             </ResponsiveContainer>
          </div>
       </div>

       {/* Per-Topic Sections */}
       <div className="flex items-center gap-2 mt-4">
          <Target size={24} color="var(--secondary)" />
          <h2 className="title" style={{fontSize: '1.5rem', margin: 0}}>Statistik Per Topik</h2>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topicSummary.map((topic, tIdx) => (
             <div key={topic.topik} className="glass-panel hover-glow" style={{padding: '1.5rem', border: `1px solid ${COLORS[tIdx % COLORS.length]}44`}}>
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h4 style={{fontSize: '1.2rem', fontWeight: 700, color: 'white'}}>{topic.topik}</h4>
                      <div className="flex gap-4 mt-2">
                         <div className="text-left">
                            <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Latihan</p>
                            <p style={{fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)'}}>{topic.total}</p>
                         </div>
                         <div className="text-left">
                            <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Rata-rata</p>
                            <p style={{fontSize: '1.1rem', fontWeight: 700, color: topic.avg >= 70 ? 'var(--success)' : 'var(--warning)'}}>{topic.avg}%</p>
                         </div>
                      </div>
                   </div>
                   <div style={{background: `${COLORS[tIdx % COLORS.length]}22`, padding: '0.5rem', borderRadius: '8px'}}>
                      <LineChart width={80} height={40} data={topic.topicChartData}>
                         <Line type="monotone" dataKey="Nilai" stroke={COLORS[tIdx % COLORS.length]} strokeWidth={2} dot={false} />
                      </LineChart>
                   </div>
                </div>

                <div style={{height: '180px', width: '100%', marginTop: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem'}}>
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={topic.topicChartData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                         <XAxis dataKey="name" hide />
                         <YAxis hide domain={[0, 100]} />
                         <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px'}} itemStyle={{color: COLORS[tIdx % COLORS.length]}} labelStyle={{display: 'none'}} />
                         <Line type="monotone" dataKey="Nilai" stroke={COLORS[tIdx % COLORS.length]} strokeWidth={3} dot={{ r: 4, fill: COLORS[tIdx % COLORS.length], strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      </LineChart>
                   </ResponsiveContainer>
                   <p style={{fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem'}}>Tren Kemajuan {topic.topik}</p>
                </div>
             </div>
          ))}
       </div>

       {/* Raw History Details */}
       <div className="flex items-center gap-2 mt-6">
          <Calendar size={24} color="var(--primary)" />
          <h2 className="title" style={{fontSize: '1.5rem', margin: 0}}>Rincian Riwayat</h2>
       </div>

       <div className="grid gap-4">
          {sortedHistory.map((sess, idx) => (
             <div key={idx} className="glass-panel flex-row justify-between items-center transition-all hover-glow" style={{padding: '1.2rem', display: 'flex', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)'}}>
                
                <div className="flex gap-4 items-center">
                   <div style={{background: 'rgba(79,70,229,0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--primary)', border: '1px solid rgba(79,70,229,0.2)'}}>
                      <Clock size={24} />
                   </div>
                   <div>
                      <h4 style={{fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)'}}>{sess.topik}</h4>
                      <div className="flex gap-3 mt-1" style={{color: 'var(--text-muted)', fontSize: '0.8rem', alignItems: 'center'}}>
                         <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(sess.tanggal).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                         <span className="flex items-center gap-1" style={{color: 'var(--secondary)'}}><Target size={12}/> +{sess.xpDidapat || 0} XP</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2" style={{color: (sess.jumlahBenar / sess.totalSoal) >= 0.7 ? 'var(--success)' : (sess.jumlahBenar / sess.totalSoal) >= 0.4 ? 'var(--warning)' : 'var(--danger)', fontSize: '1.3rem', fontWeight: 800}}>
                      {sess.jumlahBenar} <span style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400}}>/ {sess.totalSoal}</span>
                   </div>
                   <p style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Jawaban Benar</p>
                </div>

             </div>
          ))}
       </div>
    </div>
  );
}
