const Habit = require('../models/Habit');

// Get all habits for authenticated user
exports.getHabits = async (req, res) => {
  try {
    console.log('Getting habits for user:', req.user.id);
    
    const habits = await Habit.find({ 
      userId: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${habits.length} habits`);
    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Failed to fetch habits', error: error.message });
  }
};

// Create a new habit for authenticated user
exports.createHabit = async (req, res) => {
  try {
    console.log('Creating habit for user:', req.user.id);
    console.log('Request body:', req.body);
    
    const { name, category, frequency,  color, icon } = req.body;
    
    // Enhanced validation
    if (!name || !name.trim()) {
      console.log('Validation failed: Missing name');
      return res.status(400).json({ message: 'Habit name is required' });
    }

    // Validate and sanitize category
    const allowedCategories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity', 'other'];
    const validCategory = allowedCategories.includes(category) ? category : 'other';

    // Validate and sanitize frequency  
    const allowedFrequencies = ['daily', 'weekly', 'weekdays', 'monthly'];
    const validFrequency = allowedFrequencies.includes(frequency) ? frequency : 'daily';

    const habitData = {
      userId: req.user.id,
      name: name.trim(),
      category: validCategory,
      frequency: validFrequency,
      color: color || '#6366f1',
      icon: icon || 'ðŸŽ¯'
    };

    console.log('Creating habit with validated data:', habitData);
    
    const habit = new Habit(habitData);
    const savedHabit = await habit.save();
    
    console.log('Habit created successfully:', savedHabit._id);
    res.status(201).json(savedHabit);
    
  } catch (error) {
    console.error('Create habit error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors,
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create habit', 
      error: error.message 
    });
  }
};

// Update a habit
exports.updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('Updating habit:', id, 'for user:', req.user.id);
    
    // Remove fields that shouldn't be updated directly
    delete updates.userId;
    delete updates.completions;
    delete updates.streak;
    delete updates.createdAt;
    
    // Validate category and frequency if provided
    if (updates.category) {
      const allowedCategories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity', 'other'];
      if (!allowedCategories.includes(updates.category)) {
        updates.category = 'other';
      }
    }
    
    if (updates.frequency) {
      const allowedFrequencies = ['daily', 'weekly', 'weekdays', 'monthly'];
      if (!allowedFrequencies.includes(updates.frequency)) {
        updates.frequency = 'daily';
      }
    }
    
    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    console.log('Habit updated successfully');
    res.json(habit);
  } catch (error) {
    console.error('Update habit error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ message: 'Failed to update habit', error: error.message });
  }
};

// Delete a habit
exports.deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting habit:', id, 'for user:', req.user.id);
    
    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    console.log('Habit deleted successfully');
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Failed to delete habit', error: error.message });
  }
};

// Mark habit as completed
exports.completeHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, count = 1, notes } = req.body;
    
    console.log('Completing habit:', id, 'for user:', req.user.id);
    
    const habit = await Habit.findOne({ _id: id, userId: req.user.id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    const completionDate = new Date(date || Date.now());
    completionDate.setHours(0, 0, 0, 0);
    
    const existingCompletionIndex = habit.completions.findIndex(c => {
      const cDate = new Date(c.date);
      cDate.setHours(0, 0, 0, 0);
      return cDate.getTime() === completionDate.getTime();
    });
    
    if (existingCompletionIndex !== -1) {
      habit.completions[existingCompletionIndex].count += count;
      if (notes) habit.completions[existingCompletionIndex].notes = notes;
      habit.completions[existingCompletionIndex].completedAt = new Date();
    } else {
      habit.completions.push({
        date: completionDate,
        count,
        notes: notes || '',
        completedAt: new Date()
      });
    }
    
    habit.updateStreak();
    await habit.save();
    
    console.log('Habit completed successfully');
    res.json(habit);
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ message: 'Failed to complete habit', error: error.message });
  }
};

// Remove habit completion
exports.uncompleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    
    console.log('Uncompleting habit:', id, 'for user:', req.user.id);
    
    const habit = await Habit.findOne({ _id: id, userId: req.user.id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    const completionDate = new Date(date);
    completionDate.setHours(0, 0, 0, 0);
    
    habit.completions = habit.completions.filter(c => {
      const cDate = new Date(c.date);
      cDate.setHours(0, 0, 0, 0);
      return cDate.getTime() !== completionDate.getTime();
    });
    
    habit.updateStreak();
    await habit.save();
    
    console.log('Habit uncompleted successfully');
    res.json(habit);
  } catch (error) {
    console.error('Uncomplete habit error:', error);
    res.status(500).json({ message: 'Failed to uncomplete habit', error: error.message });
  }
};

// Get habit analytics
exports.getHabitAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const habit = await Habit.findOne({ _id: id, userId: req.user.id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or access denied' });
    }
    
    let completions = habit.completions;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      completions = completions.filter(c => 
        new Date(c.date) >= start && new Date(c.date) <= end
      );
    }
    
    const analytics = {
      habitId: habit._id,
      habitName: habit.name,
      totalCompletions: completions.length,
      totalCount: completions.reduce((sum, c) => sum + c.count, 0),
      currentStreak: habit.streak.current,
      longestStreak: habit.streak.longest,
      frequency: habit.frequency,
      completions: completions.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to get analytics', error: error.message });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user.id,
      isActive: true 
    });
    
    const analytics = {
      totalHabits: habits.length,
      activeHabits: habits.filter(h => h.isActive).length,
      totalStreaks: habits.reduce((sum, h) => sum + h.streak.current, 0),
      longestStreak: Math.max(...habits.map(h => h.streak.longest), 0),
      totalCompletions: habits.reduce((sum, h) => sum + h.completions.length, 0),
      habitsByCategory: {},
      recentActivity: []
    };
    
    habits.forEach(habit => {
      analytics.habitsByCategory[habit.category] = 
        (analytics.habitsByCategory[habit.category] || 0) + 1;
    });
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    habits.forEach(habit => {
      const recentCompletions = habit.completions.filter(c => 
        new Date(c.date) >= sevenDaysAgo
      );
      
      recentCompletions.forEach(completion => {
        analytics.recentActivity.push({
          habitId: habit._id,
          habitName: habit.name,
          date: completion.date,
          count: completion.count,
          notes: completion.notes
        });
      });
    });
    
    analytics.recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(analytics);
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ message: 'Failed to get user analytics', error: error.message });
  }
};