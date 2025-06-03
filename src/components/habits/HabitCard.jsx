import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { formatDate } from '../../utils/dateUtils';
import { calculateStreak } from '../../utils/habitUtils';

const HabitCard = ({ habit, onEdit }) => {
  const { toggleHabitCompletion, deleteHabit } = useHabits();
  const [showOptions, setShowOptions] = useState(false);

  const today = formatDate(new Date());
  const isCompletedToday = habit.completions && habit.completions[today];
  const currentStreak = calculateStreak(habit.completions);

  const handleToggleCompletion = () => {
    toggleHabitCompletion(habit.id, today);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habit.id);
    }
  };

  const handleEdit = () => {
    setShowOptions(false);
    if (onEdit) onEdit(habit);
  };

  return (
    <div className={`habit-card ${habit.color}`}>
      <div className="habit-header">
        <div className="habit-icon">{habit.icon}</div>
        <h3 className="habit-title">{habit.title}</h3>
        <button 
          className="options-btn"
          onClick={() => setShowOptions(!showOptions)}
        >
          ⋮
        </button>
      </div>
      
      <div className="habit-stats">
        <span className="streak">🔥 {currentStreak} day streak</span>
        <span className="frequency">{habit.frequency}</span>
      </div>

      <div className="habit-actions">
        <button 
          className={`complete-btn ${isCompletedToday ? 'completed' : ''}`}
          onClick={handleToggleCompletion}
        >
          {isCompletedToday ? '✓ Done' : 'Mark Complete'}
        </button>
      </div>

      {showOptions && (
        <div className="habit-options">
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        </div>
      )}
    </div>
  );
};

export default HabitCard;
