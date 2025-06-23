
// import React, { createContext, useContext, useState, useEffect } from 'react';

// const ThemeContext = createContext();

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState('light');

//   useEffect(() => {
//     const savedTheme = localStorage.getItem('habit-tracker-theme');
//     if (savedTheme) {
//       setTheme(savedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     // Apply theme to document body and html
//     document.body.className = `app-theme-${theme}`;
//     document.documentElement.className = `app-theme-${theme}`;
//     document.documentElement.setAttribute('data-theme', theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     const newTheme = theme === 'light' ? 'dark' : 'light';
//     setTheme(newTheme);
//     localStorage.setItem('habit-tracker-theme', newTheme);
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       <div className={`app-theme-${theme}`}>
//         {children}
//       </div>
//     </ThemeContext.Provider>
//   );
// };
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Only load saved theme if user is logged in
    const token = localStorage.getItem('token');
    const savedTheme = localStorage.getItem('habit-tracker-theme');
    
    if (token && savedTheme) {
      setTheme(savedTheme);
    } else {
      // Force light theme if no token (logged out)
      setTheme('light');
      localStorage.removeItem('habit-tracker-theme');
    }
  }, []);

  useEffect(() => {
    // Apply theme to document body and html
    document.body.className = `app-theme-${theme}`;
    document.documentElement.className = `app-theme-${theme}`;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also add/remove dark class for compatibility
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('habit-tracker-theme', newTheme);
  };

  // Add reset function for logout
  const resetTheme = () => {
    setTheme('light');
    localStorage.removeItem('habit-tracker-theme');
    
    // Force reset DOM classes
    document.body.className = 'app-theme-light';
    document.documentElement.className = 'app-theme-light';
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, resetTheme }}>
      <div className={`app-theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
