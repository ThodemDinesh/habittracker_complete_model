console.log('=== Starting Habit Tracker Backend ===');

// Load environment variables
require('dotenv').config();
console.log('✓ Environment variables loaded');

// Check required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET not found in environment variables');
  process.exit(1);
}

console.log('✓ Required environment variables found');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

console.log('✓ Dependencies loaded');

// Import routes
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');

console.log('✓ Routes imported');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

console.log('✓ Middleware configured');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('/*catchall', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

console.log('✓ Routes and error handlers configured');

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log('📋 Available routes:');
      console.log('  🔐 POST /api/auth/signup');
      console.log('  🔐 POST /api/auth/login');
      console.log('  📝 GET /api/habits');
      console.log('  📝 POST /api/habits');
      console.log('  📝 PUT /api/habits/:id');
      console.log('  📝 DELETE /api/habits/:id');
      console.log('  ✅ POST /api/habits/:id/complete');
      console.log('  ❌ POST /api/habits/:id/uncomplete');
      console.log('  📊 GET /api/habits/:id/analytics');
      console.log('  📈 GET /api/habits/analytics/user');
      console.log('  🧪 GET /api/test');
      console.log('  ❤️ GET /api/health');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

console.log('✓ Error handlers configured');
console.log('🔄 Starting database connection...');

// Connect to database
connectDB();
