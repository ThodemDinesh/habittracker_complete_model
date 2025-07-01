// const Habit = require('../models/Habit');

// // Get all habits for authenticated user
// exports.getHabits = async (req, res) => {
//   try {
//     console.log('Getting habits for user:', req.user.id);
    
//     const habits = await Habit.find({ 
//       userId: req.user.id,
//       isActive: true 
//     }).sort({ createdAt: -1 });
    
//     console.log(`Found ${habits.length} habits`);
//     res.json(habits);
//   } catch (error) {
//     console.error('Get habits error:', error);
//     res.status(500).json({ message: 'Failed to fetch habits', error: error.message });
//   }
// };

// // Create a new habit for authenticated user
// exports.createHabit = async (req, res) => {
//   try {
//     console.log('Creating habit for user:', req.user.id);
//     console.log('Request body:', req.body);
    
//     const { name, category, frequency,  color, icon } = req.body;
    
//     // Enhanced validation
//     if (!name || !name.trim()) {
//       console.log('Validation failed: Missing name');
//       return res.status(400).json({ message: 'Habit name is required' });
//     }

//     // Validate and sanitize category
//     const allowedCategories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity', 'other'];
//     const validCategory = allowedCategories.includes(category) ? category : 'other';

//     // Validate and sanitize frequency  
//     const allowedFrequencies = ['daily', 'weekly', 'weekdays', 'monthly'];
//     const validFrequency = allowedFrequencies.includes(frequency) ? frequency : 'daily';

//     const habitData = {
//       userId: req.user.id,
//       name: name.trim(),
//       category: validCategory,
//       frequency: validFrequency,
//       color: color || '#6366f1',
//       icon: icon || 'ðŸŽ¯'
//     };

//     console.log('Creating habit with validated data:', habitData);
    
//     const habit = new Habit(habitData);
//     const savedHabit = await habit.save();
    
//     console.log('Habit created successfully:', savedHabit._id);
//     res.status(201).json(savedHabit);
    
//   } catch (error) {
//     console.error('Create habit error:', error);
    
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(e => e.message);
//       console.log('Validation errors:', validationErrors);
//       return res.status(400).json({ 
//         message: 'Validation failed', 
//         errors: validationErrors,
//         details: error.message
//       });
//     }
    
//     res.status(500).json({ 
//       message: 'Failed to create habit', 
//       error: error.message 
//     });
//   }
// };

// // Update a habit
// exports.updateHabit = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
    
//     console.log('Updating habit:', id, 'for user:', req.user.id);
    
//     // Remove fields that shouldn't be updated directly
//     delete updates.userId;
//     delete updates.completions;
//     delete updates.streak;
//     delete updates.createdAt;
    
//     // Validate category and frequency if provided
//     if (updates.category) {
//       const allowedCategories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity', 'other'];
//       if (!allowedCategories.includes(updates.category)) {
//         updates.category = 'other';
//       }
//     }
    
//     if (updates.frequency) {
//       const allowedFrequencies = ['daily', 'weekly', 'weekdays', 'monthly'];
//       if (!allowedFrequencies.includes(updates.frequency)) {
//         updates.frequency = 'daily';
//       }
//     }
    
//     const habit = await Habit.findOneAndUpdate(
//       { _id: id, userId: req.user.id },
//       { ...updates, updatedAt: new Date() },
//       { new: true, runValidators: true }
//     );
    
//     if (!habit) {
//       return res.status(404).json({ message: 'Habit not found or access denied' });
//     }
    
//     console.log('Habit updated successfully');
//     res.json(habit);
//   } catch (error) {
//     console.error('Update habit error:', error);
    
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ 
//         message: 'Validation failed', 
//         errors: Object.values(error.errors).map(e => e.message)
//       });
//     }
    
//     res.status(500).json({ message: 'Failed to update habit', error: error.message });
//   }
// };

// // Delete a habit
// exports.deleteHabit = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     console.log('Deleting habit:', id, 'for user:', req.user.id);
    
//     const habit = await Habit.findOneAndUpdate(
//       { _id: id, userId: req.user.id },
//       { isActive: false, updatedAt: new Date() },
//       { new: true }
//     );
    
//     if (!habit) {
//       return res.status(404).json({ message: 'Habit not found or access denied' });
//     }
    
//     console.log('Habit deleted successfully');
//     res.json({ message: 'Habit deleted successfully' });
//   } catch (error) {
//     console.error('Delete habit error:', error);
//     res.status(500).json({ message: 'Failed to delete habit', error: error.message });
//   }
// };

// // Mark habit as completed
// exports.completeHabit = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { date, count = 1, notes } = req.body;
    
//     console.log('Completing habit:', id, 'for user:', req.user.id);
    
//     const habit = await Habit.findOne({ _id: id, userId: req.user.id });
    
//     if (!habit) {
//       return res.status(404).json({ message: 'Habit not found or access denied' });
//     }
    
//     const completionDate = new Date(date || Date.now());
//     completionDate.setHours(0, 0, 0, 0);
    
//     const existingCompletionIndex = habit.completions.findIndex(c => {
//       const cDate = new Date(c.date);
//       cDate.setHours(0, 0, 0, 0);
//       return cDate.getTime() === completionDate.getTime();
//     });
    
//     if (existingCompletionIndex !== -1) {
//       habit.completions[existingCompletionIndex].count += count;
//       if (notes) habit.completions[existingCompletionIndex].notes = notes;
//       habit.completions[existingCompletionIndex].completedAt = new Date();
//     } else {
//       habit.completions.push({
//         date: completionDate,
//         count,
//         notes: notes || '',
//         completedAt: new Date()
//       });
//     }
    
//     habit.updateStreak();
//     await habit.save();
    
//     console.log('Habit completed successfully');
//     res.json(habit);
//   } catch (error) {
//     console.error('Complete habit error:', error);
//     res.status(500).json({ message: 'Failed to complete habit', error: error.message });
//   }
// };

// // Remove habit completion
// exports.uncompleteHabit = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { date } = req.body;
    
//     console.log('Uncompleting habit:', id, 'for user:', req.user.id);
    
//     const habit = await Habit.findOne({ _id: id, userId: req.user.id });
    
//     if (!habit) {
//       return res.status(404).json({ message: 'Habit not found or access denied' });
//     }
    
//     const completionDate = new Date(date);
//     completionDate.setHours(0, 0, 0, 0);
    
//     habit.completions = habit.completions.filter(c => {
//       const cDate = new Date(c.date);
//       cDate.setHours(0, 0, 0, 0);
//       return cDate.getTime() !== completionDate.getTime();
//     });
    
//     habit.updateStreak();
//     await habit.save();
    
//     console.log('Habit uncompleted successfully');
//     res.json(habit);
//   } catch (error) {
//     console.error('Uncomplete habit error:', error);
//     res.status(500).json({ message: 'Failed to uncomplete habit', error: error.message });
//   }
// };

// // Get habit analytics
// exports.getHabitAnalytics = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { startDate, endDate } = req.query;
    
//     const habit = await Habit.findOne({ _id: id, userId: req.user.id });
    
//     if (!habit) {
//       return res.status(404).json({ message: 'Habit not found or access denied' });
//     }
    
//     let completions = habit.completions;
    
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       completions = completions.filter(c => 
//         new Date(c.date) >= start && new Date(c.date) <= end
//       );
//     }
    
//     const analytics = {
//       habitId: habit._id,
//       habitName: habit.name,
//       totalCompletions: completions.length,
//       totalCount: completions.reduce((sum, c) => sum + c.count, 0),
//       currentStreak: habit.streak.current,
//       longestStreak: habit.streak.longest,
//       frequency: habit.frequency,
//       completions: completions.sort((a, b) => new Date(b.date) - new Date(a.date))
//     };
    
//     res.json(analytics);
//   } catch (error) {
//     console.error('Get analytics error:', error);
//     res.status(500).json({ message: 'Failed to get analytics', error: error.message });
//   }
// };

// // Get user analytics
// exports.getUserAnalytics = async (req, res) => {
//   try {
//     const habits = await Habit.find({ 
//       userId: req.user.id,
//       isActive: true 
//     });
    
//     const analytics = {
//       totalHabits: habits.length,
//       activeHabits: habits.filter(h => h.isActive).length,
//       totalStreaks: habits.reduce((sum, h) => sum + h.streak.current, 0),
//       longestStreak: Math.max(...habits.map(h => h.streak.longest), 0),
//       totalCompletions: habits.reduce((sum, h) => sum + h.completions.length, 0),
//       habitsByCategory: {},
//       recentActivity: []
//     };
    
//     habits.forEach(habit => {
//       analytics.habitsByCategory[habit.category] = 
//         (analytics.habitsByCategory[habit.category] || 0) + 1;
//     });
    
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
//     habits.forEach(habit => {
//       const recentCompletions = habit.completions.filter(c => 
//         new Date(c.date) >= sevenDaysAgo
//       );
      
//       recentCompletions.forEach(completion => {
//         analytics.recentActivity.push({
//           habitId: habit._id,
//           habitName: habit.name,
//           date: completion.date,
//           count: completion.count,
//           notes: completion.notes
//         });
//       });
//     });
    
//     analytics.recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
//     res.json(analytics);
//   } catch (error) {
//     console.error('Get user analytics error:', error);
//     res.status(500).json({ message: 'Failed to get user analytics', error: error.message });
//   }
// };
const Habit = require('../models/Habit');
const mongoose = require('mongoose');

// Get all habits for a user
exports.getHabits = async (req, res) => {
  try {
    console.log('Fetching habits for user:', req.user.id);
    
    const habits = await Habit.find({ 
      userId: req.user.id,
      isActive: true  // Only get active habits
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${habits.length} active habits`);
    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch habits', 
      error: error.message 
    });
  }
};

// Get single habit by ID
exports.getHabitById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid habit ID' });
    }
    
    const habit = await Habit.findOne({ 
      _id: id, 
      userId: req.user.id, 
      isActive: true 
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    res.json(habit);
  } catch (error) {
    console.error('Get habit by ID error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch habit', 
      error: error.message 
    });
  }
};

// Create new habit
exports.createHabit = async (req, res) => {
  try {
    const { name, category, frequency, color, icon } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Habit name is required' });
    }
    
    if (name.length > 100) {
      return res.status(400).json({ message: 'Habit name cannot exceed 100 characters' });
    }
    
    const validCategories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity', 'other'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    const validFrequencies = ['daily', 'weekly', 'weekdays', 'monthly'];
    if (frequency && !validFrequencies.includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency' });
    }
    
    const habit = new Habit({
      userId: req.user.id,
      name: name.trim(),
      category: category || 'other',
      frequency: frequency || 'daily',
      color: color || '#6366f1',
      icon: icon || '🎯',
      isActive: true
    });
    
    await habit.save();
    console.log('Habit created:', habit.name);
    res.status(201).json(habit);
  } catch (error) {
    console.error('Create habit error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to create habit', 
      error: error.message 
    });
  }
};

// Update habit
exports.updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid habit ID' });
    }
    
    // Remove fields that shouldn't be updated directly
    delete updates.userId;
    delete updates.completions;
    delete updates.streak;
    delete updates.createdAt;
    
    // Validation for updates
    if (updates.name && (!updates.name.trim() || updates.name.length > 100)) {
      return res.status(400).json({ message: 'Invalid habit name' });
    }
    
    if (updates.category) {
      const validCategories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity', 'other'];
      if (!validCategories.includes(updates.category)) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }
    
    if (updates.frequency) {
      const validFrequencies = ['daily', 'weekly', 'weekdays', 'monthly'];
      if (!validFrequencies.includes(updates.frequency)) {
        return res.status(400).json({ message: 'Invalid frequency' });
      }
    }
    
    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.user.id, isActive: true },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    console.log('Habit updated:', habit.name);
    res.json(habit);
  } catch (error) {
    console.error('Update habit error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ 
      message: 'Failed to update habit', 
      error: error.message 
    });
  }
};

// Delete habit (hard delete)
exports.deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting habit:', id, 'for user:', req.user.id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid habit ID' });
    }
    
    // Hard delete - actually removes from database
    const habit = await Habit.findOneAndDelete({
      _id: id, 
      userId: req.user.id
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    console.log('Habit deleted successfully:', habit.name);
    res.json({ 
      message: 'Habit deleted successfully',
      deletedHabit: {
        id: habit._id,
        name: habit.name
      }
    });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ 
      message: 'Failed to delete habit', 
      error: error.message 
    });
  }
};

// Toggle habit completion
exports.toggleHabitCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid habit ID' });
    }
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const habit = await Habit.findOne({ 
      _id: id, 
      userId: req.user.id, 
      isActive: true 
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    const completionDate = new Date(date);
    if (isNaN(completionDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    const existingCompletion = habit.completions.find(comp => {
      const compDate = new Date(comp.date);
      return compDate.toDateString() === completionDate.toDateString();
    });
    
    if (existingCompletion) {
      // Remove completion
      habit.completions = habit.completions.filter(comp => {
        const compDate = new Date(comp.date);
        return compDate.toDateString() !== completionDate.toDateString();
      });
    } else {
      // Add completion
      habit.completions.push({
        date: completionDate,
        count: 1,
        completedAt: new Date()
      });
    }
    
    // Update streak
    habit.updateStreak();
    await habit.save();
    
    console.log('Habit completion toggled:', habit.name);
    res.json(habit);
  } catch (error) {
    console.error('Toggle completion error:', error);
    res.status(500).json({ 
      message: 'Failed to toggle habit completion', 
      error: error.message 
    });
  }
};

// Get habit completions for a date range
exports.getHabitCompletions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    const habits = await Habit.find({ 
      userId: req.user.id, 
      isActive: true 
    });
    
    const completions = {};
    
    habits.forEach(habit => {
      completions[habit._id] = habit.completions.filter(comp => {
        const compDate = new Date(comp.date);
        return compDate >= start && compDate <= end;
      });
    });
    
    res.json(completions);
  } catch (error) {
    console.error('Get completions error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch completions', 
      error: error.message 
    });
  }
};

// Get habit statistics
exports.getHabitStats = async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user.id, 
      isActive: true 
    });
    
    const stats = {
      totalHabits: habits.length,
      totalCompletions: 0,
      averageStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      categoriesCount: {},
      frequencyCount: {},
      recentActivity: []
    };
    
    let totalStreaks = 0;
    let totalPossibleCompletions = 0;
    
    habits.forEach(habit => {
      // Count completions
      stats.totalCompletions += habit.completions.length;
      
      // Track streaks
      totalStreaks += habit.streak.current;
      if (habit.streak.longest > stats.longestStreak) {
        stats.longestStreak = habit.streak.longest;
      }
      
      // Count categories
      stats.categoriesCount[habit.category] = (stats.categoriesCount[habit.category] || 0) + 1;
      
      // Count frequencies
      stats.frequencyCount[habit.frequency] = (stats.frequencyCount[habit.frequency] || 0) + 1;
      
      // Calculate possible completions (rough estimate based on creation date)
      const daysSinceCreation = Math.floor((new Date() - habit.createdAt) / (1000 * 60 * 60 * 24)) + 1;
      totalPossibleCompletions += daysSinceCreation;
      
      // Add recent completions to activity
      habit.completions.slice(-5).forEach(comp => {
        stats.recentActivity.push({
          habitName: habit.name,
          date: comp.date,
          completedAt: comp.completedAt
        });
      });
    });
    
    // Calculate averages
    if (habits.length > 0) {
      stats.averageStreak = Math.round(totalStreaks / habits.length * 100) / 100;
      stats.completionRate = Math.round((stats.totalCompletions / totalPossibleCompletions) * 100 * 100) / 100;
    }
    
    // Sort recent activity by date
    stats.recentActivity.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    stats.recentActivity = stats.recentActivity.slice(0, 10);
    
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch statistics', 
      error: error.message 
    });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    
    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({ message: 'Invalid period. Must be between 1 and 365 days' });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const habits = await Habit.find({ 
      userId: req.user.id, 
      isActive: true 
    });
    
    const analytics = {
      period: days,
      totalHabits: habits.length,
      dailyCompletions: {},
      habitPerformance: [],
      streakData: [],
      completionTrends: []
    };
    
    // Initialize daily completions
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      analytics.dailyCompletions[dateStr] = 0;
    }
    
    habits.forEach(habit => {
      const habitData = {
        id: habit._id,
        name: habit.name,
        category: habit.category,
        currentStreak: habit.streak.current,
        longestStreak: habit.streak.longest,
        totalCompletions: 0,
        completionRate: 0,
        recentCompletions: []
      };
      
      // Filter completions within the period
      const recentCompletions = habit.completions.filter(comp => {
        const compDate = new Date(comp.date);
        return compDate >= startDate;
      });
      
      habitData.totalCompletions = recentCompletions.length;
      habitData.completionRate = Math.round((recentCompletions.length / days) * 100 * 100) / 100;
      
      // Add to daily completions
      recentCompletions.forEach(comp => {
        const dateStr = new Date(comp.date).toISOString().split('T')[0];
        if (analytics.dailyCompletions.hasOwnProperty(dateStr)) {
          analytics.dailyCompletions[dateStr]++;
        }
      });
      
      analytics.habitPerformance.push(habitData);
    });
    
    // Sort habits by performance
    analytics.habitPerformance.sort((a, b) => b.completionRate - a.completionRate);
    
    // Generate completion trends
    const dates = Object.keys(analytics.dailyCompletions).sort();
    analytics.completionTrends = dates.map(date => ({
      date,
      completions: analytics.dailyCompletions[date]
    }));
    
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch analytics', 
      error: error.message 
    });
  }
};

// Bulk update habits
exports.bulkUpdateHabits = async (req, res) => {
  try {
    const { habitIds, updates } = req.body;
    
    if (!Array.isArray(habitIds) || habitIds.length === 0) {
      return res.status(400).json({ message: 'Habit IDs array is required' });
    }
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: 'Updates object is required' });
    }
    
    // Validate all habit IDs
    const invalidIds = habitIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: 'Invalid habit IDs found' });
    }
    
    // Remove fields that shouldn't be updated
    delete updates.userId;
    delete updates.completions;
    delete updates.streak;
    delete updates.createdAt;
    
    const result = await Habit.updateMany(
      { 
        _id: { $in: habitIds }, 
        userId: req.user.id, 
        isActive: true 
      },
      { ...updates, updatedAt: new Date() }
    );
    
    res.json({
      message: 'Habits updated successfully',
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ 
      message: 'Failed to update habits', 
      error: error.message 
    });
  }
};

// Archive habit (soft delete alternative)
exports.archiveHabit = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid habit ID' });
    }
    
    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    console.log('Habit archived:', habit.name);
    res.json({ 
      message: 'Habit archived successfully',
      habit 
    });
  } catch (error) {
    console.error('Archive habit error:', error);
    res.status(500).json({ 
      message: 'Failed to archive habit', 
      error: error.message 
    });
  }
};

// Restore archived habit
exports.restoreHabit = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid habit ID' });
    }
    
    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isActive: true, updatedAt: new Date() },
      { new: true }
    );
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    console.log('Habit restored:', habit.name);
    res.json({ 
      message: 'Habit restored successfully',
      habit 
    });
  } catch (error) {
    console.error('Restore habit error:', error);
    res.status(500).json({ 
      message: 'Failed to restore habit', 
      error: error.message 
    });
  }
};

// Get archived habits
exports.getArchivedHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user.id,
      isActive: false
    }).sort({ updatedAt: -1 });
    
    res.json(habits);
  } catch (error) {
    console.error('Get archived habits error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch archived habits', 
      error: error.message 
    });
  }
};

module.exports = exports;
