import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './AuthContext';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';

// PUBLIC_INTERFACE
function App() {
  // THEME HANDLING
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header theme={theme} toggleTheme={toggleTheme} />
          <main style={{ minHeight: '80vh' }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/game/:id" element={
                <ProtectedRoute><GamePage /></ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute><HistoryPage /></ProtectedRoute>
              } />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/" element={
                <ProtectedRoute><GamePage autoStart={true} /></ProtectedRoute>
              } />
            </Routes>
          </main>
          <footer style={{ padding: 12, color: 'var(--text-secondary)' }}>
            <span>© {new Date().getFullYear()} Tic Tac Toe Platform</span>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

// HEADER
function Header({ theme, toggleTheme }) {
  const { user, logout } = useAuth();

  return (
    <header className="App-header" style={{ minHeight: 'unset', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2 style={{ margin: 0, fontWeight: 700 }}>
          <Link style={{ color: 'var(--text-primary)', textDecoration: 'none' }} to="/">Tic Tac Toe</Link>
        </h2>
        <Link className="App-link" to="/leaderboard">Leaderboard</Link>
        {user && <Link className="App-link" to="/history">My Games</Link>}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        {user ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500 }}>{user.username}</span>
            <button className="theme-toggle" onClick={logout} style={{ padding: '8px 16px', fontSize: 14 }}>Logout</button>
          </span>
        ) : (
          <span>
            <Link className="App-link" to="/login">Login</Link>
            <span> | </span>
            <Link className="App-link" to="/register">Register</Link>
          </span>
        )}
      </div>
    </header>
  );
}

// ROUTE GUARD
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default App;
