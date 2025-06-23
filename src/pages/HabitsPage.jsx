// import React, { useState } from 'react';
// import { useHabits } from '../context/HabitContext';
// import HabitCard from '../components/habits/HabitCard';
// import HabitForm from '../components/habits/HabitForm';

// const HabitsPage = () => {
//   const { habits } = useHabits();
//   const [showForm, setShowForm] = useState(false);
//   const [editingHabit, setEditingHabit] = useState(null);

//   const handleEditHabit = (habit) => {
//     setEditingHabit(habit);
//     setShowForm(true);
//   };

//   const handleCloseForm = () => {
//     setEditingHabit(null);
//     setShowForm(false);
//   };

//   return (
//     <div className="habits-page">
//       <div className="page-header">
//         <h1>🗓️ My Habits</h1>
//         <button 
//           className="add-habit-btn"
//           onClick={() => { setEditingHabit(null); setShowForm(true); }}
//         >
//           ➕ Add Habit
//         </button>
//       </div>

//       <div className="habits-grid">
//         {habits.length === 0 ? (
//           <div className="empty-state">
//             <h3>No habits yet 💤</h3>
//             <p>Start building better routines by creating your first one!</p>
//             <button onClick={() => { setEditingHabit(null); setShowForm(true); }}>
//               🚀 Create Your First Habit
//             </button>
//           </div>
//         ) : (
//           habits.map(habit => (
//             <HabitCard key={habit.id} habit={habit} onEdit={handleEditHabit} />
//           ))
//         )}
//       </div>

//       {showForm && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <HabitForm 
//               onClose={handleCloseForm}
//               initialData={editingHabit}
//               isEdit={!!editingHabit}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HabitsPage;
import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import HabitCard from '../components/habits/HabitCard';
import HabitForm from '../components/habits/HabitForm';

const HabitsPage = () => {
  const { habits, loading, error } = useHabits();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingHabit(null);
    setShowForm(false);
  };

  // Show loading state
  if (loading && habits.length === 0) {
    return (
      <div className="habits-page">
        <div className="loading-state">
          <h3>Loading habits...</h3>
          <div className="spinner">⏳</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && habits.length === 0) {
    return (
      <div className="habits-page">
        <div className="error-state">
          <h3>Error loading habits</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="habits-page">
      <div className="page-header">
        <h1>🗓️ My Habits</h1>
        <button 
          className="add-habit-btn"
          onClick={() => { setEditingHabit(null); setShowForm(true); }}
          disabled={loading}
        >
          ➕ Add Habit
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="habits-grid">
        {habits.length === 0 ? (
          <div className="empty-state">
            <h3>No habits yet 💤</h3>
            <p>Start building better routines by creating your first one!</p>
            <button onClick={() => { setEditingHabit(null); setShowForm(true); }}>
              🚀 Create Your First Habit
            </button>
          </div>
        ) : (
          habits.map(habit => (
            <HabitCard key={habit._id} habit={habit} onEdit={handleEditHabit} />
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <HabitForm 
              onClose={handleCloseForm}
              initialData={editingHabit}
              isEdit={!!editingHabit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsPage;
