import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { habitReducer, initialState } from '../reducers/habitReducer';
import { loadHabits, saveHabits } from '../services/storageService';

const HabitContext = createContext();

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export const HabitProvider = ({ children }) => {
  const [state, dispatch] = useReducer(habitReducer, initialState);

  // Load habits on mount
  useEffect(() => {
    const savedHabits = loadHabits();
    if (savedHabits.length > 0) {
      dispatch({ type: 'LOAD_HABITS', payload: savedHabits });
    }
  }, []);

  // Save habits whenever state changes
  useEffect(() => {
    if (state.habits.length > 0) {
      saveHabits(state.habits);
    }
  }, [state.habits]);

  const addHabit = (habit) => {
    dispatch({ type: 'ADD_HABIT', payload: habit });
  };

  const updateHabit = (id, updates) => {
    dispatch({ type: 'UPDATE_HABIT', payload: { id, updates } });
  };

  const deleteHabit = (id) => {
    dispatch({ type: 'DELETE_HABIT', payload: id });
  };

  const toggleHabitCompletion = (habitId, date) => {
    dispatch({ type: 'TOGGLE_COMPLETION', payload: { habitId, date } });
  };

  // Provide the current state and actions
  const contextValue = {
    habits: state.habits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion
  };

  return (
    <HabitContext.Provider value={contextValue}>
      {children}
    </HabitContext.Provider>
  );
};
