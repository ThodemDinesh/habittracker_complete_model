
// import React, { useState, useRef, useEffect } from 'react';
// import { useHabits } from '../../context/HabitContext';
// import { formatDate } from '../../utils/dateUtils';

// const HabitCard = ({ habit, onEdit }) => {
//   const { toggleHabitCompletion, deleteHabit } = useHabits();
//   const [showOptions, setShowOptions] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const optionsRef = useRef();
//   const btnRef = useRef();

//   const today = formatDate(new Date());
  
//   // Check if completed today using MongoDB completions array
//   const isCompletedToday = habit.completions && habit.completions.some(completion => {
//     const completionDate = formatDate(new Date(completion.date));
//     return completionDate === today;
//   });

//   // Get current streak from MongoDB data
//   const currentStreak = habit.streak ? habit.streak.current : 0;

//   const handleToggleCompletion = async () => {
//     if (isProcessing) return;
    
//     setIsProcessing(true);
//     try {
//       await toggleHabitCompletion(habit._id, today);
//     } catch (error) {
//       console.error('Error toggling completion:', error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleDelete = async () => {
//     setShowOptions(false);
//     if (window.confirm('Are you sure you want to delete this habit?')) {
//       try {
//         await deleteHabit(habit._id);
//       } catch (error) {
//         console.error('Error deleting habit:', error);
//         alert('Failed to delete habit. Please try again.');
//       }
//     }
//   };

//   const handleEdit = () => {
//     setShowOptions(false);
//     if (onEdit) onEdit(habit);
//   };

//   // Close options on outside click
//   useEffect(() => {
//     if (!showOptions) return;

//     const handleClickOutside = (event) => {
//       if (
//         optionsRef.current &&
//         !optionsRef.current.contains(event.target) &&
//         btnRef.current &&
//         !btnRef.current.contains(event.target)
//       ) {
//         setShowOptions(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [showOptions]);

//   return (
//     <div className={`habit-card ${habit.color}`}>
//       <div className="habit-header">
//         <div className="habit-icon">{habit.icon}</div>
//         <h3 className="habit-title">{habit.name}</h3>
//         <button 
//           className="options-btn"
//           ref={btnRef}
//           onClick={() => setShowOptions((v) => !v)}
//           aria-label="More options"
//         >
//           ⋮
//         </button>
//         {showOptions && (
//           <div className="habit-options" ref={optionsRef}>
//             <button onClick={handleEdit}>Edit</button>
//             <button onClick={handleDelete} className="delete-btn">Delete</button>
//           </div>
//         )}
//       </div>
      
//       <div className="habit-stats">
//         <span className="streak">🔥 {currentStreak} day streak</span>
//         <span className="frequency">{habit.frequency}</span>
//       </div>

//       <div className="habit-actions">
//         <button 
//           className={`complete-btn ${isCompletedToday ? 'completed' : ''} ${isProcessing ? 'processing' : ''}`}
//           onClick={handleToggleCompletion}
//           disabled={isProcessing}
//         >
//           {isProcessing ? '⏳ Processing...' : (isCompletedToday ? '✓ Done' : 'Mark Complete')}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default HabitCard;
import React, { useState, useRef, useEffect } from 'react';
import { useHabits } from '../../context/HabitContext';
import { formatDate } from '../../utils/dateUtils';

const HabitCard = ({ habit, onEdit }) => {
  const { toggleHabitCompletion, deleteHabit, fetchHabits } = useHabits();
  const [showOptions, setShowOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const optionsRef = useRef();
  const btnRef = useRef();

  const today = formatDate(new Date());
  
  // Check if completed today using MongoDB completions array
  const isCompletedToday = habit.completions && habit.completions.some(completion => {
    const completionDate = formatDate(new Date(completion.date));
    return completionDate === today;
  });

  // Get current streak from MongoDB data
  const currentStreak = habit.streak ? habit.streak.current : 0;

  const handleToggleCompletion = async () => {
    if (isProcessing || isDeleting) return;
    
    setIsProcessing(true);
    try {
      await toggleHabitCompletion(habit._id, today);
    } catch (error) {
      console.error('Error toggling completion:', error);
      alert('Failed to update habit. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setShowOptions(false);
    
    if (window.confirm(`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      
      try {
        console.log('Deleting habit:', habit.name);
        await deleteHabit(habit._id);
        
        // Refresh the habits list to ensure UI is updated
        await fetchHabits();
        
        console.log('Habit deleted successfully');
      } catch (error) {
        console.error('Error deleting habit:', error);
        alert('Failed to delete habit. Please try again.');
        setIsDeleting(false); // Reset deleting state on error
      }
      // Note: Don't reset isDeleting on success, component will unmount
    }
  };

  const handleEdit = () => {
    if (isDeleting) return;
    
    setShowOptions(false);
    if (onEdit) onEdit(habit);
  };

  // Close options on outside click
  useEffect(() => {
    if (!showOptions) return;

    const handleClickOutside = (event) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target) &&
        btnRef.current &&
        !btnRef.current.contains(event.target)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

  // Show deleting state
  if (isDeleting) {
    return (
      <div className="habit-card deleting">
        <div className="habit-header">
          <div className="habit-icon">⏳</div>
          <h3 className="habit-title">Deleting "{habit.name}"...</h3>
        </div>
        <div className="deleting-message">
          <p>Please wait while we delete this habit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`habit-card ${habit.color}`}>
      <div className="habit-header">
        <div className="habit-icon">{habit.icon}</div>
        <h3 className="habit-title">{habit.name}</h3>
        <button 
          className="options-btn"
          ref={btnRef}
          onClick={() => setShowOptions((v) => !v)}
          aria-label="More options"
          disabled={isDeleting}
        >
          ⋮
        </button>
        {showOptions && !isDeleting && (
          <div className="habit-options" ref={optionsRef}>
            <button onClick={handleEdit} disabled={isDeleting}>
              <span>✏️</span> Edit
            </button>
            <button onClick={handleDelete} className="delete-btn" disabled={isDeleting}>
              <span>🗑️</span> Delete
            </button>
          </div>
        )}
      </div>
      
      <div className="habit-stats">
        <span className="streak">🔥 {currentStreak} day streak</span>
        <span className="frequency">{habit.frequency}</span>
      </div>

      <div className="habit-actions">
        <button 
          className={`complete-btn ${isCompletedToday ? 'completed' : ''} ${isProcessing ? 'processing' : ''}`}
          onClick={handleToggleCompletion}
          disabled={isProcessing || isDeleting}
        >
          {isProcessing ? '⏳ Processing...' : (isCompletedToday ? '✓ Done' : 'Mark Complete')}
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
