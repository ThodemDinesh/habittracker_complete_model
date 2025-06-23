// const jwt = require('jsonwebtoken');

// function authMiddleware(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer '))
//     return res.status(401).json({ message: 'No token provided' });

//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// }

// module.exports = authMiddleware;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function authMiddleware(req, res, next) {
  console.log('Auth middleware called for:', req.path);
  console.log('Headers:', req.headers.authorization);
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or invalid format');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.log('Token is empty');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully for user:', decoded.id);
    
    // Add user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      return res.status(401).json({ message: 'Token verification failed' });
    }
  }
}

module.exports = authMiddleware;
