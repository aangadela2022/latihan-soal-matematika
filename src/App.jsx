import React, { useState, useEffect } from 'react';
import ConfigUI from './components/ConfigUI';
import AdminUI from './components/AdminUI';
import LoginUI from './components/LoginUI';
import StudentUI from './components/StudentUI';
import TeacherUI from './components/TeacherUI';
import PracticeUI from './components/PracticeUI';

import { initFirebase } from './firebase';
import { initAI } from './aiConfig';

function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [view, setView] = useState('loading'); // loading, config, login, admin, student_dash, teacher_dash, practice
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check local storage 
    const isFb = initFirebase();
    const isAi = initAI();

    if (isFb && isAi) {
       setIsConfigured(true);
       setView('login');
    } else {
       setView('config');
    }
  }, []);

  const handleConfigComplete = () => {
    setIsConfigured(true);
    setView('login');
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setView(user.role === 'siswa' ? 'student_dash' : 'teacher_dash');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  if (view === 'loading') {
     return <div className="animate-fade-in text-center mt-20 subtitle">Memuat konfigurasi keamanan...</div>;
  }

  if (view === 'config') return <ConfigUI onConfigComplete={handleConfigComplete} />;
  
  if (view === 'admin') return <AdminUI onBack={() => setView('login')} />;

  if (view === 'login') return <LoginUI onLogin={handleLogin} onOpenAdmin={() => setView('admin')} />;

  if (view === 'teacher_dash') return <TeacherUI user={currentUser} onLogout={handleLogout} />;

  if (view === 'student_dash') return <StudentUI user={currentUser} onLogout={handleLogout} onStartPractice={() => setView('practice')} />;

  if (view === 'practice') return <PracticeUI user={currentUser} onEndSession={() => setView('student_dash')} />;

  return null;
}

export default App;
