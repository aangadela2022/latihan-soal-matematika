import React, { useState, useEffect } from 'react';
import ConfigUI from './components/ConfigUI';
import AdminUI from './components/AdminUI';
import StudentUI from './components/StudentUI';
import TeacherUI from './components/TeacherUI';
import PracticeUI from './components/PracticeUI';

import { initFirebase } from './firebase';
import { initAI } from './aiConfig';
import { fetchUsers } from './dbServices';

function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [view, setView] = useState('loading'); // loading, config, admin, student_dash, teacher_dash, practice
  const [currentUser, setCurrentUser] = useState(null);

  const bypassLogin = async () => {
    try {
      const users = await fetchUsers();
      if (users && users.length > 0) {
        const student = users.find(u => u.role === 'siswa');
        handleLogin(student || users[0]);
      } else {
        handleLogin({ id: 'guest', nama: 'Siswa Tamu', role: 'siswa', level: 1, xp: 0, analytics: {}, history: [] });
      }
    } catch (err) {
      console.error("Bypass login failed", err);
      handleLogin({ id: 'guest', nama: 'Siswa Tamu', role: 'siswa', level: 1, xp: 0, analytics: {}, history: [] });
    }
  };

  useEffect(() => {
    // Check local storage 
    const isFb = initFirebase();
    const isAi = initAI();

    if (isFb && isAi) {
       setIsConfigured(true);
       bypassLogin();
    } else {
       setView('config');
    }
  }, []);

  const handleConfigComplete = () => {
    setIsConfigured(true);
    bypassLogin();
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setView(user.role === 'siswa' ? 'student_dash' : 'teacher_dash');
  };

  const handleLogout = () => {
    // Reload halaman jika logout karena tidak ada login page
    window.location.reload();
  };

  if (view === 'loading') {
     return <div className="animate-fade-in text-center mt-20 subtitle">Memuat konfigurasi keamanan...</div>;
  }

  if (view === 'config') return <ConfigUI onConfigComplete={handleConfigComplete} />;
  
  if (view === 'admin') return <AdminUI onBack={bypassLogin} />;

  if (view === 'teacher_dash') return <TeacherUI user={currentUser} onLogout={handleLogout} />;

  if (view === 'student_dash') return <StudentUI user={currentUser} onLogout={handleLogout} onStartPractice={() => setView('practice')} />;

  if (view === 'practice') return <PracticeUI user={currentUser} onEndSession={() => setView('student_dash')} />;

  return null;
}

export default App;
