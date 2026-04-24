import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import './styles/index.css';

function App() {
  const [view, setView] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('gold_token');
    const adminFlag = localStorage.getItem('is_admin');
    if (token) {
      setIsAuthenticated(true);
      if (adminFlag === 'true') {
        setIsAdmin(true);
        setView('admin');
      } else {
        setView('dashboard');
      }
    }
  }, []);

  const handleLoginSuccess = (token, userData) => {
    localStorage.setItem('token', token);
    // Detectar si es cuenta de admin por email
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@banco.cl';
    const userIsAdmin = userData?.email === adminEmail;
    if (userIsAdmin) {
      localStorage.setItem('is_admin', 'true');
      setIsAdmin(true);
      setIsAuthenticated(true);
      setView('admin');
    } else {
      localStorage.removeItem('is_admin');
      setIsAdmin(false);
      setIsAuthenticated(true);
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('gold_token');
    localStorage.removeItem('gold_user');
    localStorage.removeItem('is_admin');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setView('landing');
  };

  return (
    <div className="App" style={{ background: '#020202', minHeight: '100vh', color: '#fff' }}>

      {view === 'landing' && (
        <Landing
          onGoToLogin={() => setView('login')}
          onGoToRegister={() => setView('register')}
        />
      )}

      {view === 'register' && (
        <Register
          onBack={() => setView('landing')}
          onRegisterSuccess={() => setView('login')}
        />
      )}

      {view === 'login' && (
        <Login
          onLogin={handleLoginSuccess}
          onBack={() => setView('landing')}
          onGoToRegister={() => setView('register')}
        />
      )}

      {view === 'dashboard' && isAuthenticated && !isAdmin && (
        <Dashboard onLogout={handleLogout} />
      )}

      {view === 'admin' && isAuthenticated && isAdmin && (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
