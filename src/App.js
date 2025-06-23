import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { HabitProvider } from './context/HabitContext';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Habits from './pages/HabitsPage';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import AuthWrapper from './components/AuthWrapper'; 
import './App.css';

function AppContentInner() {
  const { theme, resetTheme } = useTheme();
  const location = useLocation();

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Force light theme if not logged in
      resetTheme();
    }
  }, [resetTheme]);

  // Only show header and main layout for protected routes
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className={`app app-theme-${theme}`}>
      {!isAuthPage && <Header />}
      <main className="main-content">
        <Routes>
          {/* Auth pages - wrapped with AuthWrapper to force light mode */}
          <Route path="/login" element={
            <AuthWrapper>
              <Login />
            </AuthWrapper>
          } />
          <Route path="/signup" element={
            <AuthWrapper>
              <Signup />
            </AuthWrapper>
          } />

          {/* Protected pages - with header and main layout */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/habits"
            element={
              <ProtectedRoute>
                <Habits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <HabitProvider>
        <AppContentInner />
      </HabitProvider>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
