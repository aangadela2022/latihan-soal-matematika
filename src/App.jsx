import React, { useState, useEffect } from 'react';
import ConfigUI from './components/ConfigUI';
import AdminUI from './components/AdminUI';
import StudentUI from './components/StudentUI';
import TeacherUI from './components/TeacherUI';
import PracticeUI from './components/PracticeUI';

import { fetchUsers, addUser } from './dbServices';

function App() {
  const [view, setView] = useState('loading'); // loading, admin, student_dash, teacher_dash, practice
  const [currentUser, setCurrentUser] = useState(null);

  const initLocalApp = async () => {
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

  useEffect(() => {
    initLocalApp();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setView(user.role === 'siswa' ? 'student_dash' : 'teacher_dash');
  };

  const handleLogout = () => {
    // Reload halaman jika logout
    window.location.reload();
  };

  if (view === 'loading') {
     return <div className="animate-fade-in text-center mt-20 subtitle">Menyiapkan memori lokal aplikasi...</div>;
  }

  // Jika perlu mode seeding untuk admin
  if (view === 'admin') return <AdminUI onBack={initLocalApp} />;

  if (view === 'teacher_dash') return <TeacherUI user={currentUser} onLogout={handleLogout} />;

  if (view === 'student_dash') return <StudentUI user={currentUser} onLogout={handleLogout} onStartPractice={() => setView('practice')} />;

  if (view === 'practice') return <PracticeUI user={currentUser} onEndSession={() => setView('student_dash')} />;

  return null;
}

export default App;

