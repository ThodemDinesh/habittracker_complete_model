// import React from 'react';
// import { useAuthContext } from '../context/AuthContext';

// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuthContext();

//   // Show loading while checking authentication
//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner">
//           <div className="spinner"></div>
//           <p>Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // If no user is authenticated, redirect to main app sign-in
//   if (!user) {
//     const MAIN_APP_URL = process.env.REACT_APP_MAIN_APP_URL || 'http://localhost:3000';
//     window.location.href = `${MAIN_APP_URL}/signin`;
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner">
//           <p>Redirecting to sign in...</p>
//         </div>
//       </div>
//     );
//   }

//   // If user is authenticated, render the protected content
//   return children;
// };

// export default ProtectedRoute;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Checking authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
