import React from 'react';
import { Calendar, CheckCircle, Clock, BrainCircuit, Target, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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

  // Stats calculation
  const chartHistory = [...history].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  
  const chartData = chartHistory.map((sess, index) => {
     const nilai = sess.totalSoal > 0 ? Math.round((sess.jumlahBenar / sess.totalSoal) * 100) : 0;
     return {
        name: `Latihan ${index + 1}`,
        Nilai: nilai,
     }
  });

  const totalLatihan = history.length;
  const rataRataNilai = chartData.length > 0 ? Math.round(chartData.reduce((acc, curr) => acc + curr.Nilai, 0) / chartData.length) : 0;

  let wrongByTopic = {};
  history.forEach(sess => {
     const wrongAnswers = sess.totalSoal - sess.jumlahBenar;
     if (wrongAnswers > 0) {
        wrongByTopic[sess.topik] = (wrongByTopic[sess.topik] || 0) + wrongAnswers;
     }
  });

  let mainWrongTopic = "-";
  let maxWrong = 0;
  Object.keys(wrongByTopic).forEach(topik => {
      if (wrongByTopic[topik] > maxWrong) {
          maxWrong = wrongByTopic[topik];
          mainWrongTopic = topik;
      }
  });

  // Sort history for display list (newest first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return (
    <div className="animate-fade-in delay-100 flex flex-col gap-6" style={{paddingBottom: '2rem'}}>
       
       <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={28} color="var(--primary)" />
          <h2 className="title" style={{fontSize: '1.8rem', margin: 0}}>Progress Belajar</h2>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel text-center" style={{padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)'}}>
             <h3 style={{fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Rata-rata Nilai</h3>
             <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)'}}>{rataRataNilai}</div>
          </div>
          <div className="glass-panel text-center" style={{padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)'}}>
             <h3 style={{fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Total Latihan</h3>
             <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)'}}>{totalLatihan}</div>
          </div>
       </div>

       <div className="glass-panel text-center" style={{padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)'}}>
          <h3 style={{fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Topik Paling Sering Salah</h3>
          <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--danger)'}}>{mainWrongTopic}</div>
       </div>

       <div className="glass-panel" style={{padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)'}}>
          <h3 style={{fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center'}}>Grafik Nilai</h3>
          <div style={{height: '300px', width: '100%'}}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorNilai" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                     <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                 <XAxis dataKey="name" stroke="var(--text-muted)" />
                 <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                 <Tooltip contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'white'}} />
                 <Area type="monotone" dataKey="Nilai" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorNilai)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>

       <h3 style={{fontSize: '1.2rem', color: 'var(--text-main)', marginTop: '1rem'}}>Rincian Riwayat</h3>
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
