export const initialState = {
  habits: []
};

export const habitReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_HABITS':
      return {
        ...state,
        habits: action.payload
      };
    
    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, action.payload]
      };
    
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id
            ? { ...habit, ...action.payload.updates }
            : habit
        )
      };
    
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload)
      };
    
    case 'TOGGLE_COMPLETION': {
      const { habitId, date, time } = action.payload;
      return {
        ...state,
        habits: state.habits.map(habit => 
          habit.id === habitId
            ? {
                ...habit,
                completions: {
                  ...habit.completions,
                  [date]: habit.completions?.[date] 
                    ? undefined // Unmark if already completed
                    : { time }  // Store as object with timestamp
                }
              }
            : habit
        )
      };
    }
    
    default:
      return state;
  }
};
