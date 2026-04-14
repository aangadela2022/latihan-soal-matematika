import React, { useState, useEffect } from 'react';
import LoginUI from './components/LoginUI';
import AdminUI from './components/AdminUI';
import StudentUI from './components/StudentUI';
import TeacherUI from './components/TeacherUI';
import PracticeUI from './components/PracticeUI';
import ConfigUI from './components/ConfigUI';

import { fetchUsers, addUser } from './dbServices';
import { initAI } from './aiConfig';
import { initFirebase } from './firebase';

  const [view, setView] = useState(() => {
     const hasKey = localStorage.getItem("geminiApiKey");
     if (hasKey) {
        // Run initializations early
        initAI();
        initFirebase();
        return 'login';
     }
     return 'config';
  });
  const [currentUser, setCurrentUser] = useState(null);

  const initLocalApp = async () => {
    setView('loading');
    try {
      let users = await fetchUsers();
      if (!users || users.length === 0) {
        // Otomatis buat Siswa Utama pertama kali
        const INIT_TOPICS = () => ({ "Bilangan": { total: 0, correct: 0 }, "Aljabar": { total: 0, correct: 0 }, "Geometri": { total: 0, correct: 0 }, "Statistika": { total: 0, correct: 0 }, "Peluang": { total: 0, correct: 0 } });
        const defaultUser = {
          nama: 'Siswa Utama',
          role: 'siswa',
          kelas: 'Lokal',
          level: 1,
          xp: 0,
          analytics: INIT_TOPICS(),
          history: []
        };
        const createdUser = await addUser(defaultUser);
        handleLogin(createdUser);
      } else {
        const student = users.find(u => u.role === 'siswa');
        handleLogin(student || users[0]);
      }
    } catch (err) {
      console.error("Initialization failed", err);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setView(user.role === 'siswa' ? 'student_dash' : 'teacher_dash');
  };

  const handleLogout = () => {
    // Kembali ke login jika logout
    setView('login');
    setCurrentUser(null);
  };

  if (view === 'config') return <ConfigUI onConfigComplete={() => setView('login')} />;

  if (view === 'login') return <LoginUI onLoginSuccess={initLocalApp} onOpenAdmin={() => setView('admin')} />;

  if (view === 'loading') {
     return <div className="animate-fade-in text-center mt-20 subtitle">Menyiapkan memori lokal aplikasi...</div>;
  }

  // Jika perlu mode seeding untuk admin
  if (view === 'admin') return <AdminUI onBack={() => setView('login')} />;

  if (view === 'teacher_dash') return <TeacherUI user={currentUser} onLogout={handleLogout} />;

  if (view === 'student_dash') return <StudentUI user={currentUser} onLogout={handleLogout} onStartPractice={() => setView('practice')} />;

  if (view === 'practice') return <PracticeUI user={currentUser} onEndSession={() => setView('student_dash')} />;

  return null;
}

export default App;

