import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  // Updated signup function to include username
  const signup = async (username, email, password) => {
    setLoading(true);
    console.log('AuthContext: Attempting signup for:', { username, email });
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      console.log('Signup response status:', res.status);
      const data = await res.json();
      console.log('Signup response data:', data);
      
      if (!res.ok) {
        throw new Error(data.message || `Signup failed with status ${res.status}`);
      }
      
      console.log('Signup successful');
      return true;
    } catch (err) {
      console.error('Signup error in AuthContext:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Updated login function (can use username or email)
  const login = async (login, password) => {
    setLoading(true);
    console.log('AuthContext: Attempting login for:', login);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      
      console.log('Login response status:', res.status);
      const data = await res.json();
      console.log('Login response data:', data);
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      console.log('Login successful');
      return true;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED: Complete logout function with comprehensive theme reset
  const logout = () => {
    console.log('AuthContext: Starting logout process...');
    
    // Clear auth data
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('habitTrackerSettings');
    
    // Clear ALL possible theme-related localStorage keys
    const themeKeys = [
      'habit-tracker-theme',
      'darkMode',
      'theme',
      'themeMode',
      'isDarkMode',
      'userTheme',
      'preferredTheme'
    ];
    
    themeKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared localStorage key: ${key}`);
    });
    
    // Remove ALL possible theme classes
    const themeClasses = [
      'dark-mode', 'dark', 'dark-theme', 'app-theme-dark',
      'light-mode', 'light', 'light-theme'
    ];
    
    themeClasses.forEach(className => {
      document.body.classList.remove(className);
      document.documentElement.classList.remove(className);
    });
    
    // Force light theme classes and attributes
    document.body.className = 'app-theme-light';
    document.documentElement.className = 'app-theme-light';
    document.documentElement.setAttribute('data-theme', 'light');
    
    // Reset ALL possible CSS variables to light theme defaults
    const cssVars = {
      '--bg-color': '#ffffff',
      '--text-color': '#1e293b',
      '--card-bg': '#ffffff',
      '--border-color': '#e2e8f0',
      '--primary-color': '#6366f1',
      '--accent-color': '#6366f1',
      '--surface': '#f8fafc',
      '--text-primary': '#1e293b',
      '--text-secondary': '#64748b',
      '--text-light': '#94a3b8'
    };
    
    Object.entries(cssVars).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    
    console.log('AuthContext: Theme reset completed');
    console.log('AuthContext: Redirecting to login...');
    
    // Small delay to ensure all changes are applied
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
