import React, { useState, useEffect } from 'react';
import { useHabits } from '../../context/HabitContext';
import { generateId } from '../../utils/habitUtils';

const colors = [
  { name: 'blue', value: '#3b82f6' },
  { name: 'green', value: '#10b981' },
  { name: 'purple', value: '#8b5cf6' },
  { name: 'red', value: '#ef4444' },
  { name: 'orange', value: '#f59e0b' },
  { name: 'pink', value: '#ec4899' }
];

const icons = ['🎯', '💪', '📚', '🧘', '🏃', '💧', '🌱', '✍️', '🎨', '🎵', '🍎', '😴'];
const categories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity'];

const HabitForm = ({ onClose, initialData = null, isEdit = false }) => {
  const { addHabit, updateHabit } = useHabits();

  const [formData, setFormData] = useState({
    title: '',
    color: 'blue',
    icon: '🎯',
    frequency: 'daily',
    category: 'health'
  });

  // If editing, pre-fill the form with the habit's data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        color: initialData.color || 'blue',
        icon: initialData.icon || '🎯',
        frequency: initialData.frequency || 'daily',
        category: initialData.category || 'health'
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (isEdit && initialData) {
      // Update existing habit (preserve completions and createdAt)
      updateHabit(initialData.id, {
        ...initialData,
        ...formData
      });
    } else {
      // Create new habit
      addHabit({
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
        completions: {}
      });
    }
    onClose();
  };

  return (
    <div className="habit-form fade-in">
      <h2>{isEdit ? '✏️ Edit Habit' : '✨ Create New Habit'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>What habit do you want to {isEdit ? 'edit' : 'build'}?</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Drink 8 glasses of water"
            required
          />
        </div>

        <div className="form-group">
          <label>Choose an icon</label>
          <div className="icon-grid">
            {icons.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`icon-btn ${formData.icon === icon ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, icon })}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Pick a color</label>
          <div className="color-grid">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                className={`color-btn ${color.name} ${formData.color === color.name ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, color: color.name })}
                title={color.name}
                style={{ background: color.value }}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>How often?</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          >
            <option value="daily">Every day</option>
            <option value="weekly">Once a week</option>
            <option value="weekdays">Weekdays only</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">{isEdit ? 'Update Habit' : 'Create Habit'}</button>
        </div>
      </form>
    </div>
  );
};

export default HabitForm;
