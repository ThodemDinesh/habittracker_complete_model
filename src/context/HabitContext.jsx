// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import { habitReducer, initialState } from '../reducers/habitReducer';
// import { loadHabits, saveHabits } from '../services/storageService';

// const HabitContext = createContext();

// export const useHabits = () => {
//   const context = useContext(HabitContext);
//   if (!context) {
//     throw new Error('useHabits must be used within a HabitProvider');
//   }
//   return context;
// };

// export const HabitProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(habitReducer, initialState);

//   // Load habits on mount
//   useEffect(() => {
//     const savedHabits = loadHabits();
//     if (savedHabits.length > 0) {
//       dispatch({ type: 'LOAD_HABITS', payload: savedHabits });
//     }
//   }, []);

//   // Save habits whenever state changes
//   useEffect(() => {
//     if (state.habits.length > 0) {
//       saveHabits(state.habits);
//     }
//   }, [state.habits]);

//   const addHabit = (habit) => {
//     dispatch({ type: 'ADD_HABIT', payload: habit });
//   };

//   const updateHabit = (id, updates) => {
//     dispatch({ type: 'UPDATE_HABIT', payload: { id, updates } });
//   };

//   const deleteHabit = (id) => {
//     dispatch({ type: 'DELETE_HABIT', payload: id });
//   };

//   const toggleHabitCompletion = (habitId, date) => {
//     dispatch({ 
//       type: 'TOGGLE_COMPLETION', 
//       payload: { 
//         habitId, 
//         date,
//         time: new Date().toISOString() // Add timestamp
//       } 
//     });
//   };

//   // Provide the current state and actions
//   const contextValue = {
//     habits: state.habits,
//     addHabit,
//     updateHabit,
//     deleteHabit,
//     toggleHabitCompletion
//   };

//   return (
//     <HabitContext.Provider value={contextValue}>
//       {children}
//     </HabitContext.Provider>
//   );
// };
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';

const HabitContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useAuthContext();

  // API call helper with auth token
  const apiCall = async (url, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  // Fetch habits from database
  const fetchHabits = async () => {
    if (!token || !user) {
      setHabits([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching habits for user:', user.id);
      const data = await apiCall('/api/habits');
      console.log('Habits fetched:', data);
      setHabits(data);
    } catch (err) {
      console.error('Fetch habits error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new habit - CLEANED (removed targetCount and description)
  const addHabit = async (habitData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Creating habit:', habitData);
      
      // Remove targetCount and description if they exist
      const { targetCount, description, ...cleanHabitData } = habitData;
      
      const data = await apiCall('/api/habits', {
        method: 'POST',
        body: JSON.stringify(cleanHabitData),
      });
      
      console.log('Habit created:', data);
      setHabits(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Create habit error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update habit - CLEANED (removed targetCount and description)
  const updateHabit = async (id, updates) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Updating habit:', id, updates);
      
      // Remove targetCount and description if they exist
      const { targetCount, description, ...cleanUpdates } = updates;
      
      const data = await apiCall(`/api/habits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cleanUpdates),
      });
      
      console.log('Habit updated:', data);
      setHabits(prev => prev.map(habit => 
        habit._id === id ? data : habit
      ));
      return data;
    } catch (err) {
      console.error('Update habit error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete habit
  const deleteHabit = async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Deleting habit:', id);
      
      await apiCall(`/api/habits/${id}`, {
        method: 'DELETE',
      });
      
      console.log('Habit deleted');
      setHabits(prev => prev.filter(habit => habit._id !== id));
    } catch (err) {
      console.error('Delete habit error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Complete habit - SIMPLIFIED (removed count parameter since no targetCount)
  const completeHabit = async (id, date = new Date(), notes = '') => {
    try {
      console.log('Completing habit:', id, date);
      
      const data = await apiCall(`/api/habits/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ 
          date, 
          count: 1, // Always 1 since we removed targetCount
          notes 
        }),
      });
      
      console.log('Habit completed:', data);
      setHabits(prev => prev.map(habit => 
        habit._id === id ? data : habit
      ));
      return data;
    } catch (err) {
      console.error('Complete habit error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Uncomplete habit
  const uncompleteHabit = async (id, date) => {
    try {
      console.log('Uncompleting habit:', id, date);
      
      const data = await apiCall(`/api/habits/${id}/uncomplete`, {
        method: 'POST',
        body: JSON.stringify({ date }),
      });
      
      console.log('Habit uncompleted:', data);
      setHabits(prev => prev.map(habit => 
        habit._id === id ? data : habit
      ));
      return data;
    } catch (err) {
      console.error('Uncomplete habit error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Toggle habit completion - SIMPLIFIED
  const toggleHabitCompletion = async (habitId, date) => {
    try {
      const habit = habits.find(h => h._id === habitId);
      if (!habit) return;

      const isCompleted = habit.completions && habit.completions.some(completion => {
        const completionDate = new Date(completion.date).toDateString();
        const targetDate = new Date(date).toDateString();
        return completionDate === targetDate;
      });

      if (isCompleted) {
        await uncompleteHabit(habitId, date);
      } else {
        await completeHabit(habitId, date);
      }
    } catch (err) {
      console.error('Toggle completion error:', err);
      setError(err.message);
    }
  };

  // Get user analytics - ADDED for dashboard
  const getUserAnalytics = async () => {
    try {
      console.log('Fetching user analytics...');
      const data = await apiCall('/api/habits/analytics/user');
      console.log('User analytics fetched:', data);
      return data;
    } catch (err) {
      console.error('Get user analytics error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Get habit analytics - ADDED for individual habit analytics
  const getHabitAnalytics = async (id, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const data = await apiCall(`/api/habits/${id}/analytics?${params}`);
      return data;
    } catch (err) {
      console.error('Get habit analytics error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Load habits when user logs in
  useEffect(() => {
    if (token && user) {
      fetchHabits();
    } else {
      setHabits([]);
      setError(null);
    }
  }, [token, user]);

  const contextValue = {
    habits,
    loading,
    error,
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    completeHabit,
    uncompleteHabit,
    getUserAnalytics,
    getHabitAnalytics,
  };

  return (
    <HabitContext.Provider value={contextValue}>
      {children}
    </HabitContext.Provider>
  );
};
