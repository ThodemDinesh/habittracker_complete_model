import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login: loginUser, loading } = useAuthContext();
  const { resetTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  
  // Get success message from signup redirect
  const successMessage = location.state?.message;

  // Force light theme on login page
  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await loginUser(login, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-split-page">
      <div className="auth-brand-side">
        <div className="brand-logo">HabitTracker</div>
        <div className="brand-tagline">
          Small steps, big change.<br />
          <span>Track. Improve. Succeed.</span>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Login</h2>
            <p>Welcome back</p>
          </div>
          
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login">Username or Email</label>
              <input
                type="text"
                id="login"
                value={login}
                autoComplete="username"
                onChange={e => setLogin(e.target.value.trim())}
                placeholder="Enter your username or email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
