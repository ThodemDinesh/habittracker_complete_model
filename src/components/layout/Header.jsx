import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/habits', label: 'Habits' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/settings', label: 'Settings' }
  ];

  const handleLogout = () => {
    console.log('Header: Logout button clicked');
    
    // Use the logout function from AuthContext which handles theme reset
    logout();
    
    // Note: No need to navigate here as AuthContext logout() handles redirect
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/dashboard" className="logo">
          <h1>HabitTracker</h1>
        </Link>
        
        <nav className="main-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <button 
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout from your account"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
