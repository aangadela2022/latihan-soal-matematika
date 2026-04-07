import React, { useState } from 'react';
import { generateQuestions } from '../aiGeneration';
import { updateUserStats, addSessionHistory } from '../dbServices';
import { Award, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

export default function PracticeUI({ user, onEndSession }) {
  const [loadingAI, setLoadingAI] = useState(false);
  const [sessionQs, setSessionQs] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [localXp, setLocalXp] = useState(user.xp || 0);
  const [localAnalytics, setLocalAnalytics] = useState(user.analytics ? JSON.parse(JSON.stringify(user.analytics)) : {});

  // Kumpulkan statistik untuk sesi ini (skenario Riwayat)
  const [sessionScore, setSessionScore] = useState({ benar: 0, totalXpDidapat: 0 });

  const TOPICS = ["Bilangan", "Aljabar", "Geometri", "Statistika", "Peluang"];
  const [selectedTopic, setSelectedTopic] = useState("Bilangan");

  const startAIGeneration = async () => {
     setLoadingAI(true);
     try {
        const generated = await generateQuestions(selectedTopic, user.level);
        setSessionQs(generated);
     } catch (err) {
        alert("Gagal menggenerate pertanyaan dari AI: " + err.message);
     }
     setLoadingAI(false);
  };

  if (sessionQs.length === 0) {
     return (
        <div className="container animate-fade-in flex flex-col items-center justify-center min-vh-100 mt-10">
           <div className="glass-panel hover-glow" style={{maxWidth: '600px', width: '100%', textAlign: 'center'}}>
              <h2 className="title mb-4">Pilih Topik Latihan</h2>
              <p className="subtitle mb-6">AI akan membuatkan 10 soal unik dengan konteks dunia nyata berdasarkan levelmu (Lvl {user.level}).</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                 {TOPICS.map(topic => (
                    <button key={topic} className={`btn ${selectedTopic === topic ? 'btn-primary shadow-glow' : 'btn-outline shadow-none'}`} onClick={() => setSelectedTopic(topic)}>
                       {topic}
                    </button>
                 ))}
              </div>

              <div className="flex gap-4">
                 <button className="btn btn-outline flex-1 shadow-none" onClick={onEndSession} disabled={loadingAI}>Batal</button>
                 <button className="btn btn-primary flex-1 shadow-glow" onClick={startAIGeneration} disabled={loadingAI}>
                    {loadingAI ? 'AI Sedang Memikirkan Soal...' : `Mulai Generate - ${selectedTopic}`}
                 </button>
              </div>
           </div>
        </div>
     );
  }

  const q = sessionQs[currentQIndex];
  const isCorrect = selectedOpt === q?.jawabanBenarIndex;

  const handleAnswer = (index) => {
     if (showFeedback) return;
     setSelectedOpt(index);
     setShowFeedback(true);
     
     let nxp = localXp;
     let curSessScore = { ...sessionScore };
     let nAnalytics = { ...localAnalytics };
     if (!nAnalytics[selectedTopic]) {
        nAnalytics[selectedTopic] = { total: 0, correct: 0 };
     }

     nAnalytics[selectedTopic].total += 1;
     
     if (index === q.jawabanBenarIndex) {
        nxp += 50;
        nAnalytics[selectedTopic].correct += 1;
        curSessScore.benar += 1;
        curSessScore.totalXpDidapat += 50;
     } else {
        nxp += 10; 
        curSessScore.totalXpDidapat += 10;
     }
     
     setLocalXp(nxp);
     setLocalAnalytics(nAnalytics);
     setSessionScore(curSessScore);
  };

  const nextQ = async () => {
    if (currentQIndex < sessionQs.length - 1) {
       setCurrentQIndex(prev => prev + 1);
       setSelectedOpt(null);
       setShowFeedback(false);
    } else {
       try {
           const sessAnalytics = localAnalytics[selectedTopic];
           let newLevel = user.level;
           if (sessAnalytics.total >= 10 && sessAnalytics.correct / sessAnalytics.total >= 0.7 && user.level < 3) {
              newLevel += 1;
           } else if (sessAnalytics.total >= 10 && sessAnalytics.correct / sessAnalytics.total <= 0.3 && user.level > 1) {
              newLevel -= 1;
           }

           await updateUserStats(user.id, localXp, localAnalytics, newLevel);
           
           // Penambahan Riwayat
           const historyObj = {
              tanggal: new Date().toISOString(),
              topik: selectedTopic,
              jumlahBenar: sessionScore.benar,
              totalSoal: sessionQs.length,
              xpDidapat: sessionScore.totalXpDidapat
           };
           
           await addSessionHistory(user.id, historyObj);

           // Update user di memory untuk komponen lain
           user.xp = localXp;
           user.analytics = localAnalytics;
           user.level = newLevel;
           if (!user.history) user.history = [];
           user.history.push(historyObj);

           alert(`Sesi Selesai! XP mu: ${localXp}. Level mu sekarang: ${newLevel}`);
           onEndSession();
       } catch (e) {
           console.error("Gagal save", e);
           alert("Selesai, namun gagal menyimpan progres ke database.");
           onEndSession();
       }
    }
  };

  const progressPercent = ((currentQIndex) / sessionQs.length) * 100;

  return (
     <div className="container animate-fade-in mt-10" style={{maxWidth: '800px', margin: '2rem auto'}}>
         <div className="flex justify-between items-center mb-6">
            <button className="btn btn-outline shadow-none" onClick={onEndSession} disabled={showFeedback && currentQIndex === sessionQs.length-1}>Akhiri Latihan (Tanpa Save)</button>
            <div className="flex gap-4 items-center">
              <span style={{fontWeight: 600, color: 'var(--text-muted)'}}>Soal {currentQIndex + 1} / {sessionQs.length}</span>
              <div className="flex items-center gap-2 badge badge-warning glow-effect-subtle shadow-glow" style={{background: 'var(--warning)'}}>
                 <Award size={14}/> {localXp} XP
              </div>
            </div>
         </div>
         
         <div className="progress-bar glow-effect-subtle">
            <div className="progress-fill" style={{width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--secondary), #a855f7)'}}></div>
         </div>

         <div className="glass-panel mt-8 hover-glow">
            <div className="flex justify-between mb-6">
              <span className="badge badge-warning">Topik: {selectedTopic}</span>
              <span className="badge badge-success">Konteks: {q.konteks}</span>
            </div>
            
            <h2 style={{fontSize: '1.4rem', lineHeight: '1.6', marginBottom: '2rem'}} dangerouslySetInnerHTML={{__html: q.pertanyaan.replace(/\\n/g, '<br/>')}}>
            </h2>

            <div className="grid gap-4">
               {q.opsi.map((opt, i) => {
                 let classes = "option-btn";
                 if (showFeedback) {
                    if (i === q.jawabanBenarIndex) classes += " correct shadow-glow-success border-none";
                    else if (i === selectedOpt) classes += " wrong border-none";
                 } else {
                    if (i === selectedOpt) classes += " selected";
                 }

                 return (
                   <button key={i} className={classes} onClick={() => handleAnswer(i)}>
                     {opt}
                   </button>
                 );
               })}
            </div>

            {showFeedback && (
               <div className="animate-fade-in mt-8 glow-effect-subtle" style={{background: 'rgba(15,23,42,0.8)', padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`}}>
                 <div className="flex items-center gap-2 mb-2" style={{color: isCorrect ? 'var(--success)' : 'var(--danger)'}}>
                   {isCorrect ? <CheckCircle /> : <XCircle />}
                   <h3 style={{fontWeight: 700}}>{isCorrect ? 'Tepat Sekali! +50 XP' : 'Kurang Tepat (+10 XP) - Belajar dari pembahasan'}</h3>
                 </div>
                 <p style={{lineHeight: 1.6, marginTop: '0.5rem', color: 'var(--text-main)'}}>
                   <strong>Pembahasan Logis:</strong><br/>
                   <span dangerouslySetInnerHTML={{__html: q.pembahasan.replace(/\\n/g, '<br/>')}}></span>
                 </p>
                 
                 <button className="btn btn-primary mt-4 w-full shadow-glow" onClick={nextQ}>
                   {currentQIndex < sessionQs.length - 1 ? 'Soal Selanjutnya' : 'Simpan Progres & Selesai'} 
                   <ChevronRight />
                 </button>
               </div>
            )}
         </div>
     </div>
  );
}
