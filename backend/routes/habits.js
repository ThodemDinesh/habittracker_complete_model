// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware'); // Fixed path - removed 's'
// const {
//   getHabits,
//   createHabit,
//   updateHabit,
//   deleteHabit,
//   completeHabit,
//   uncompleteHabit,
//   getHabitAnalytics,
//   getUserAnalytics
// } = require('../controllers/habitController');

// // Apply auth middleware to all routes
// router.use(authMiddleware);

// // Logging middleware for debugging
// router.use((req, res, next) => {
//   console.log(`Habit API: ${req.method} ${req.path} - User: ${req.user?.id}`);
//   next();
// });

// // Routes
// router.get('/', getHabits);
// router.post('/', createHabit);
// router.put('/:id', updateHabit);
// router.delete('/:id', deleteHabit);
// router.post('/:id/complete', completeHabit);
// router.post('/:id/uncomplete', uncompleteHabit);
// router.get('/:id/analytics', getHabitAnalytics);
// router.get('/analytics/user', getUserAnalytics);

// module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
  getAnalytics,
  getHabitStats,
  getHabitById,
  getHabitCompletions,
  bulkUpdateHabits,
  archiveHabit,
  restoreHabit,
  getArchivedHabits
} = require('../controllers/habitController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`Habit API: ${req.method} ${req.path} - User: ${req.user?.id}`);
  next();
});

// Error handling middleware for route-specific errors
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// SPECIFIC ROUTES FIRST (before parameterized routes)
// Analytics Routes - must come before /:id routes
router.get('/analytics/user', getAnalytics);
router.get('/analytics/stats', getHabitStats);

// Other specific routes
router.get('/completions', getHabitCompletions);
router.get('/archived', getArchivedHabits);

// Bulk operations - specific routes
router.put('/bulk/update', bulkUpdateHabits);

// Basic CRUD Routes
router.get('/', getHabits);
router.post('/', createHabit);

// PARAMETERIZED ROUTES LAST (after all specific routes)
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

// Completion Routes
router.post('/:id/toggle', toggleHabitCompletion);

// Archive Routes
router.post('/:id/archive', archiveHabit);
router.post('/:id/restore', restoreHabit);

// Response time logging middleware
router.use((req, res, next) => {
  const duration = Date.now() - req.startTime;
  console.log(`Habit API: ${req.method} ${req.path} completed in ${duration}ms`);
  next();
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Habit Route Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    message: 'Internal server error in habit routes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;
