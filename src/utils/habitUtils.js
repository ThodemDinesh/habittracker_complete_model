import { formatDate } from './dateUtils';

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateStreak = (completions) => {
  if (!completions) return 0;
  
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const dateStr = formatDate(currentDate);
    if (completions[dateStr]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateCompletionRate = (habit, days = 30) => {
  if (!habit.completions) return 0;
  
  const completedDays = Object.keys(habit.completions).length;
  return Math.round((completedDays / days) * 100);
};

export const getHabitsByCategory = (habits, category) => {
  return habits.filter(habit => habit.category === category);
};

export const getTodaysHabits = (habits) => {
  const today = new Date().getDay();
  return habits.filter(habit => {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekdays' && today >= 1 && today <= 5) return true;
    return false;
  });
};
