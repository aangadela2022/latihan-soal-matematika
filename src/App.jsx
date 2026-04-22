import React, { useState, useEffect } from 'react';
import LoginUI from './components/LoginUI';
import AdminUI from './components/AdminUI';
import StudentUI from './components/StudentUI';
import TeacherUI from './components/TeacherUI';
import PracticeUI from './components/PracticeUI';
import ConfigUI from './components/ConfigUI';

import { initAI } from './aiConfig';
import { initSupabase } from './supabase';

function App() {
  const [view, setView] = useState(() => {
     const hasKey = localStorage.getItem("geminiApiKey");
     if (hasKey) {
        initAI();
        initSupabase();
        return 'login';
     }
     return 'config';
  });
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setView('admin');
    } else if (user.role === 'guru') {
      setView('teacher_dash');
    } else {
      setView('student_dash');
    }
  };

  const handleLogout = () => {
    setView('login');
    setCurrentUser(null);
  };

  if (view === 'config') return <ConfigUI onConfigComplete={() => {
    initAI();
    initSupabase();
    setView('login');
  }} />;

  if (view === 'login') return <LoginUI onLoginSuccess={handleLogin} />;

  if (view === 'admin') return <AdminUI onBack={handleLogout} />;

  if (view === 'teacher_dash') return <TeacherUI user={currentUser} onLogout={handleLogout} />;

  if (view === 'student_dash') return <StudentUI user={currentUser} onLogout={handleLogout} onStartPractice={() => setView('practice')} />;

  if (view === 'practice') return <PracticeUI user={currentUser} onEndSession={() => setView('student_dash')} />;

  return null;
}

export default App;

