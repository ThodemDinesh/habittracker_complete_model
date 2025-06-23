import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useHabits } from './HabitContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { habits } = useHabits();
  const [settings, setSettings] = useState({
    enableMorning: true,
    enableEvening: true,
    morningTime: '08:00',
    eveningTime: '20:00',
    permission: 'default'
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  // Check permission status on mount
  useEffect(() => {
    const permission = notificationService.checkPermission();
    setSettings(prev => ({ ...prev, permission }));
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setSettings(prev => ({ 
      ...prev, 
      permission: granted ? 'granted' : 'denied' 
    }));
    return granted;
  };

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Schedule notifications
  const scheduleNotifications = () => {
    if (settings.permission !== 'granted') return;

    // Clear existing timeouts
    if (window.morningTimeout) clearTimeout(window.morningTimeout);
    if (window.eveningTimeout) clearTimeout(window.eveningTimeout);

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Schedule morning notification
    if (settings.enableMorning) {
      const [morningHour, morningMinute] = settings.morningTime.split(':').map(Number);
      const morningTime = morningHour * 60 + morningMinute;
      
      let morningDelay;
      if (currentTime < morningTime) {
        // Schedule for today
        morningDelay = (morningTime - currentTime) * 60 * 1000;
      } else {
        // Schedule for tomorrow
        morningDelay = (24 * 60 - currentTime + morningTime) * 60 * 1000;
      }

      window.morningTimeout = setTimeout(() => {
        notificationService.sendMorningNotification(habits.length);
        // Reschedule for next day
        scheduleNotifications();
      }, morningDelay);
    }

    // Schedule evening notification
    if (settings.enableEvening) {
      const [eveningHour, eveningMinute] = settings.eveningTime.split(':').map(Number);
      const eveningTime = eveningHour * 60 + eveningMinute;
      
      let eveningDelay;
      if (currentTime < eveningTime) {
        // Schedule for today
        eveningDelay = (eveningTime - currentTime) * 60 * 1000;
      } else {
        // Schedule for tomorrow
        eveningDelay = (24 * 60 - currentTime + eveningTime) * 60 * 1000;
      }

      window.eveningTimeout = setTimeout(() => {
        // Calculate completed and pending habits
        const today = new Date().toISOString().split('T')[0];
        const completedToday = habits.filter(habit => 
          habit.completions && habit.completions.some(completion => {
            const completionDate = new Date(completion.date).toISOString().split('T')[0];
            return completionDate === today;
          })
        );
        const pendingHabits = habits.filter(habit => !completedToday.includes(habit));
        
        notificationService.sendEveningNotification(completedToday.length, pendingHabits);
        // Reschedule for next day
        scheduleNotifications();
      }, eveningDelay);
    }
  };

  // Schedule notifications when settings change
  useEffect(() => {
    if (settings.permission === 'granted') {
      scheduleNotifications();
    }

    // Cleanup on unmount
    return () => {
      if (window.morningTimeout) clearTimeout(window.morningTimeout);
      if (window.eveningTimeout) clearTimeout(window.eveningTimeout);
    };
  }, [settings, habits]);

  // Test notifications
  const testMorningNotification = () => {
    notificationService.sendMorningNotification(habits.length);
  };

  const testEveningNotification = () => {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(habit => 
      habit.completions && habit.completions.some(completion => {
        const completionDate = new Date(completion.date).toISOString().split('T')[0];
        return completionDate === today;
      })
    );
    const pendingHabits = habits.filter(habit => !completedToday.includes(habit));
    
    notificationService.sendEveningNotification(completedToday.length, pendingHabits);
  };

  const contextValue = {
    settings,
    updateSettings,
    requestPermission,
    testMorningNotification,
    testEveningNotification,
    notificationService
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
