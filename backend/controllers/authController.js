const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  console.log('Signup request received:', req.body);
  
  const { username, email, password } = req.body;
  
  // Input validation
  if (!username || !email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      message: 'Username, email, and password are required' 
    });
  }
  
  // Username validation
  if (username.length < 3) {
    return res.status(400).json({ 
      message: 'Username must be at least 3 characters long' 
    });
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ 
      message: 'Username can only contain letters, numbers, and underscores' 
    });
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('Invalid email format');
    return res.status(400).json({ 
      message: 'Please provide a valid email address' 
    });
  }
  
  // Password length validation
  if (password.length < 6) {
    console.log('Password too short');
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters long' 
    });
  }
  
  try {
    console.log('Checking for existing user...');
    
    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('Username already exists');
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log('Email already exists');
      return res.status(400).json({ message: 'Email already registered' });
    }

    console.log('Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating new user...');
    // Create user
    const user = new User({ username, email, password: hashedPassword });
    
    console.log('Saving user to database...');
    const savedUser = await user.save();
    
    // Verify user was saved
    if (!savedUser) {
      console.log('Failed to save user');
      return res.status(500).json({ message: 'Failed to create user' });
    }

    console.log('User saved successfully, generating JWT token...');
    // Create JWT
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username, email: savedUser.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    console.log('Signup successful');
    res.status(201).json({ 
      token, 
      user: { 
        id: savedUser._id, 
        username: savedUser.username, 
        email: savedUser.email 
      } 
    });
    
  } catch (err) {
    console.error('Signup error details:', err);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      if (err.keyPattern.username) {
        return res.status(400).json({ message: 'Username already taken' });
      } else if (err.keyPattern.email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      return res.status(400).json({ message: 'User already exists' });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        details: err.message 
      });
    }
    
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// Update login to work with either username or email
exports.login = async (req, res) => {
  console.log('Login request received:', req.body);
  
  const { login, password } = req.body; // 'login' can be username or email
  
  // Input validation
  if (!login || !password) {
    return res.status(400).json({ 
      message: 'Username/email and password are required' 
    });
  }
  
  try {
    console.log('Finding user...');
    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: login },
        { email: login.toLowerCase() }
      ]
    });
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Comparing password...');
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Generating JWT token...');
    // Create JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    console.log('Login successful');
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      } 
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
