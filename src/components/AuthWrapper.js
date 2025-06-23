import React, { useEffect } from 'react';
// Remove these imports that might cause circular dependency:
// import { useTheme } from '../context/ThemeContext';

const AuthWrapper = ({ children }) => {
  useEffect(() => {
    console.log('AuthWrapper: Forcing light theme');
    
    // Force light theme without using context
    localStorage.removeItem('habit-tracker-theme');
    localStorage.removeItem('theme');
    
    // Remove dark theme classes
    document.body.classList.remove('dark-mode', 'dark', 'app-theme-dark');
    document.documentElement.classList.remove('dark-mode', 'dark', 'app-theme-dark');
    
    // Force light theme
    document.body.className = 'app-theme-light';
    document.documentElement.className = 'app-theme-light';
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <div className="auth-wrapper app-theme-light">
      {children}
    </div>
  );
};

export default AuthWrapper;
