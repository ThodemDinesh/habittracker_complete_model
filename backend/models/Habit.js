const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },

  category: {
    type: String,
    required: true,
    enum: ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity', 'other'],
    default: 'other'
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'weekdays', 'monthly'],
    default: 'daily'
  },
//   targetCount: {
//     type: Number,
//     default: 1,
//     min: 1
//   },
  color: {
    type: String,
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: '🎯'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 }
  },
  completions: [{
    date: {
      type: Date,
      required: true
    },
    count: {
      type: Number,
      default: 1
    },
    notes: {
      type: String,
      maxlength: 200
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index for better query performance
habitSchema.index({ userId: 1, createdAt: -1 });
habitSchema.index({ userId: 1, isActive: 1 });

// Method to update streak
habitSchema.methods.updateStreak = function() {
  if (this.completions.length === 0) {
    this.streak.current = 0;
    return;
  }

  const sortedCompletions = this.completions
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let currentStreak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedCompletions.length; i++) {
    const completionDate = new Date(sortedCompletions[i].date);
    completionDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - completionDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === currentStreak) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  this.streak.current = currentStreak;
  if (currentStreak > this.streak.longest) {
    this.streak.longest = currentStreak;
  }
};

module.exports = mongoose.model('Habit', habitSchema);
