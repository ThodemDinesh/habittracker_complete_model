// import React, { useState, useEffect } from 'react';
// import { useHabits } from '../../context/HabitContext';
// import { generateId } from '../../utils/habitUtils';

// const colors = [
//   { name: 'blue', value: '#3b82f6' },
//   { name: 'green', value: '#10b981' },
//   { name: 'purple', value: '#8b5cf6' },
//   { name: 'red', value: '#ef4444' },
//   { name: 'orange', value: '#f59e0b' },
//   { name: 'pink', value: '#ec4899' }
// ];

// const icons = ['🎯', '💪', '📚', '🧘', '🏃', '💧', '🌱', '✍️', '🎨', '🎵', '🍎', '😴'];
// const defaultCategories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity'];

// const HabitForm = ({ onClose, initialData = null, isEdit = false }) => {
//   const { addHabit, updateHabit } = useHabits();

//   const [formData, setFormData] = useState({
//     title: '',
//     color: 'blue',
//     icon: '🎯',
//     frequency: 'daily',
//     customFrequency: '',
//     category: 'health',
//     customCategory: ''
//   });

//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         title: initialData.title || '',
//         color: initialData.color || 'blue',
//         icon: initialData.icon || '🎯',
//         frequency: defaultCategories.includes(initialData.frequency) ? initialData.frequency : 'other',
//         customFrequency: !['daily', 'weekly', 'weekdays'].includes(initialData.frequency) ? initialData.frequency : '',
//         category: defaultCategories.includes(initialData.category) ? initialData.category : 'other',
//         customCategory: !defaultCategories.includes(initialData.category) ? initialData.category : ''
//       });
//     }
//   }, [initialData]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.title.trim()) return;

//     // Determine final frequency and category
//     const finalFrequency = formData.frequency === 'other' ? formData.customFrequency.trim() : formData.frequency;
//     const finalCategory = formData.category === 'other' ? formData.customCategory.trim() : formData.category;

//     if (!finalFrequency) return; // Require frequency
//     if (!finalCategory) return; // Require category

//     const habitData = {
//       ...formData,
//       frequency: finalFrequency,
//       category: finalCategory
//     };

//     if (isEdit && initialData) {
//       updateHabit(initialData.id, {
//         ...initialData,
//         ...habitData
//       });
//     } else {
//       addHabit({
//         id: generateId(),
//         ...habitData,
//         createdAt: new Date().toISOString(),
//         completions: {}
//       });
//     }
//     onClose();
//   };

//   return (
//     <div className="habit-form fade-in">
//       <h2>{isEdit ? '✏️ Edit Habit' : '✨ Create New Habit'}</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>What habit do you want to {isEdit ? 'edit' : 'build'}?</label>
//           <input
//             type="text"
//             value={formData.title}
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//             placeholder="e.g., Drink 8 glasses of water"
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Choose an icon</label>
//           <div className="icon-grid">
//             {icons.map((icon) => (
//               <button
//                 key={icon}
//                 type="button"
//                 className={`icon-btn ${formData.icon === icon ? 'selected' : ''}`}
//                 onClick={() => setFormData({ ...formData, icon })}
//               >
//                 {icon}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="form-group">
//           <label>Pick a color</label>
//           <div className="color-grid">
//             {colors.map((color) => (
//               <button
//                 key={color.name}
//                 type="button"
//                 className={`color-btn ${color.name} ${formData.color === color.name ? 'selected' : ''}`}
//                 onClick={() => setFormData({ ...formData, color: color.name })}
//                 title={color.name}
//                 style={{ background: color.value }}
//               />
//             ))}
//           </div>
//         </div>

//         <div className="form-group">
//           <label>How often?</label>
//           <select
//             value={formData.frequency}
//             onChange={(e) => setFormData({ ...formData, frequency: e.target.value, customFrequency: '' })}
//           >
//             <option value="daily">Every day</option>
//             <option value="weekly">Once a week</option>
//             <option value="weekdays">Weekdays only</option>
//             <option value="other">Other...</option>
//           </select>
//           {formData.frequency === 'other' && (
//             <input
//               type="text"
//               value={formData.customFrequency}
//               onChange={(e) => setFormData({ ...formData, customFrequency: e.target.value })}
//               placeholder="Describe frequency (e.g., Every 3 days, Twice a month)"
//               required
//             />
//           )}
//         </div>

//         <div className="form-group">
//           <label>Category</label>
//           <select
//             value={formData.category}
//             onChange={(e) => setFormData({ ...formData, category: e.target.value, customCategory: '' })}
//           >
//             {defaultCategories.map((cat) => (
//               <option key={cat} value={cat}>
//                 {cat.charAt(0).toUpperCase() + cat.slice(1)}
//               </option>
//             ))}
//             <option value="other">Other...</option>
//           </select>
//           {formData.category === 'other' && (
//             <input
//               type="text"
//               value={formData.customCategory}
//               onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
//               placeholder="Enter your own category"
//               required
//             />
//           )}
//         </div>

//         <div className="form-actions">
//           <button type="button" onClick={onClose}>Cancel</button>
//           <button type="submit">{isEdit ? 'Update Habit' : 'Create Habit'}</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default HabitForm;
  import React, { useState, useEffect } from 'react';
  import { useHabits } from '../../context/HabitContext';

  const colors = [
    { name: 'blue', value: '#3b82f6' },
    { name: 'green', value: '#10b981' },
    { name: 'purple', value: '#8b5cf6' },
    { name: 'red', value: '#ef4444' },
    { name: 'orange', value: '#f59e0b' },
    { name: 'pink', value: '#ec4899' }
  ];

  const icons = ['🎯', '💪', '📚', '🧘', '🏃', '💧', '🌱', '✍️', '🎨', '🎵', '🍎', '😴'];
  const defaultCategories = ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'creativity'];
  const defaultFrequencies = ['daily', 'weekly', 'weekdays', 'monthly'];

  const HabitForm = ({ onClose, initialData = null, isEdit = false }) => {
    const { addHabit, updateHabit } = useHabits();

    const [formData, setFormData] = useState({
      name: '',
      color: 'blue',
      icon: '🎯',
      frequency: 'daily',
      customFrequency: '',
      category: 'health',
      customCategory: '',
      // targetCount: 1
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          color: initialData.color || 'blue',
          icon: initialData.icon || '🎯',
          frequency: defaultFrequencies.includes(initialData.frequency) ? initialData.frequency : 'other',
          customFrequency: !defaultFrequencies.includes(initialData.frequency) ? initialData.frequency : '',
          category: defaultCategories.includes(initialData.category) ? initialData.category : 'other',
          customCategory: !defaultCategories.includes(initialData.category) ? initialData.category : '',
          // targetCount: initialData.targetCount || 1
        });
      }
    }, [initialData]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.name.trim()) {
        setError('Habit name is required');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // FIXED: Determine final frequency and category properly
        let finalFrequency = formData.frequency;
        let finalCategory = formData.category;

        if (formData.frequency === 'other') {
          finalFrequency = formData.customFrequency.trim();
          if (!finalFrequency) {
            setError('Please specify the frequency');
            setLoading(false);
            return;
          }
          // Keep the custom frequency as is, don't default to 'daily'
        }

        if (formData.category === 'other') {
          finalCategory = formData.customCategory.trim();
          if (!finalCategory) {
            setError('Please specify the category');
            setLoading(false);
            return;
          }
          // Keep the custom category as is, don't default to 'other'
        }

        const habitData = {
          name: formData.name.trim(),
          category: finalCategory,
          frequency: finalFrequency,
          // targetCount: parseInt(formData.targetCount) || 1,
          color: formData.color,
          icon: formData.icon
        };

        console.log('Submitting habit data:', habitData);

        if (isEdit && initialData) {
          await updateHabit(initialData._id, habitData);
        } else {
          await addHabit(habitData);
        }
        
        onClose();
      } catch (err) {
        console.error('Error saving habit:', err);
        setError(err.message || 'Failed to save habit. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="habit-form fade-in">
        <h2>{isEdit ? '✏️ Edit Habit' : '✨ Create New Habit'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>What habit do you want to {isEdit ? 'edit' : 'build'}?</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Drink 8 glasses of water"
              required
              maxLength={100}
            />
          </div>

          {/* <div className="form-group">
            <label>Target count per day</label>
            <div className="target-count-container">
              <input
                type="number"
                min="1"
                max="100"
                value={formData.targetCount}
                onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 1 })}
              />
              <span className="count-label">
                {formData.targetCount === 1 ? 'time per day' : 'times per day'}
              </span>
            </div>
            <small className="form-hint">
              Set how many times you want to complete this habit daily
            </small>
          </div> */}

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
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value, customFrequency: '' })}
            >
              <option value="daily">Every day</option>
              <option value="weekly">Once a week</option>
              <option value="weekdays">Weekdays only</option>
              <option value="monthly">Once a month</option>
              <option value="other">Custom frequency...</option>
            </select>
            {formData.frequency === 'other' && (
              <input
                type="text"
                value={formData.customFrequency}
                onChange={(e) => setFormData({ ...formData, customFrequency: e.target.value })}
                placeholder="e.g., Every 3 days, Twice a week"
                required
                maxLength={50}
              />
            )}
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, customCategory: '' })}
            >
              {defaultCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
              <option value="other">Custom category...</option>
            </select>
            {formData.category === 'other' && (
              <input
                type="text"
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                placeholder="e.g., Personal, Work, Hobbies"
                required
                maxLength={30}
              />
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Habit' : 'Create Habit')}
            </button>
          </div>
        </form>
      </div>
    );
  };

  export default HabitForm;
