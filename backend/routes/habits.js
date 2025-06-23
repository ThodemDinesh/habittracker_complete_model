const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Fixed path - removed 's'
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
  getHabitAnalytics,
  getUserAnalytics
} = require('../controllers/habitController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`Habit API: ${req.method} ${req.path} - User: ${req.user?.id}`);
  next();
});

// Routes
router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/complete', completeHabit);
router.post('/:id/uncomplete', uncompleteHabit);
router.get('/:id/analytics', getHabitAnalytics);
router.get('/analytics/user', getUserAnalytics);

module.exports = router;
