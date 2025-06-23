import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { habits, exportData, importData, clearAllData } = useHabits();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Appearance
    theme: theme,
    accentColor: '#6366f1',
    fontSize: 'medium',
    
    // Browser Notifications
    enableNotifications: true,
    dailyReminder: true,
    reminderTime: '09:00',
    
    // Smart Notifications
    enableMorningMotivation: true,
    enableEveningReminder: true,
    morningTime: '08:00',
    eveningTime: '20:00',
    
    // Privacy & Data
    backupEnabled: true
  });

  // Track notification permission status
  const [notificationStatus, setNotificationStatus] = useState('default');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Notification timeouts
  const [morningTimeout, setMorningTimeout] = useState(null);
  const [eveningTimeout, setEveningTimeout] = useState(null);

  // FIXED: Use Dashboard's exact formatDate function
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // FIXED: Use Dashboard's exact todayStats logic
  const getDashboardTodayStats = () => {
    if (!habits || !Array.isArray(habits) || habits.length === 0) {
      return { total: 0, completed: 0, streak: 0, completionRate: 0 };
    }

    const today = formatDate(new Date());
    
    // EXACT same logic as Dashboard
    const completedToday = habits.filter(habit => {
      if (!habit.completions || !Array.isArray(habit.completions)) {
        return false;
      }
      
      if (habit.completions.length === 0) {
        return false;
      }

      const isCompletedToday = habit.completions.some(completion => {
        try {
          const completionDate = formatDate(new Date(completion.date));
          return completionDate === today;
        } catch (error) {
          return false;
        }
      });
      
      return isCompletedToday;
    });

    // Get maximum current streak from all habits
    const streaks = habits.map(habit => {
      const current = habit.streak?.current || 0;
      const longest = habit.streak?.longest || 0;
      return { current, longest };
    });

    const maxCurrentStreak = Math.max(...streaks.map(s => s.current), 0);
    const completionRate = habits.length ? Math.round((completedToday.length / habits.length) * 100) : 0;

    return {
      total: habits.length,
      completed: completedToday.length,
      streak: maxCurrentStreak,
      completionRate
    };
  };

  // Check notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
      
      if (Notification.permission === 'granted') {
        updateSetting('enableNotifications', true);
      } else if (Notification.permission === 'denied') {
        updateSetting('enableNotifications', false);
      }
    }
  }, []);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('habitTrackerSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('habitTrackerSettings', JSON.stringify(settings));
  }, [settings]);

  // Apply accent color to CSS variables when it changes
  useEffect(() => {
    if (settings.accentColor) {
      document.documentElement.style.setProperty('--primary-color', settings.accentColor);
      document.documentElement.style.setProperty('--accent-color', settings.accentColor);
      
      const darkerColor = adjustColorBrightness(settings.accentColor, -20);
      document.documentElement.style.setProperty('--primary-hover', darkerColor);
    }
  }, [settings.accentColor]);

  // Schedule smart notifications when settings or habits change
  useEffect(() => {
    if (settings.enableNotifications && notificationStatus === 'granted') {
      scheduleSmartNotifications();
    }
    
    return () => {
      if (morningTimeout) clearTimeout(morningTimeout);
      if (eveningTimeout) clearTimeout(eveningTimeout);
    };
  }, [
    settings.enableMorningMotivation, 
    settings.enableEveningReminder, 
    settings.morningTime, 
    settings.eveningTime, 
    settings.enableNotifications, 
    notificationStatus, 
    habits
  ]);

  const adjustColorBrightness = (hex, percent) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Schedule smart notifications function
  const scheduleSmartNotifications = () => {
    console.log('Scheduling smart notifications...');
    
    // Clear existing timeouts
    if (morningTimeout) {
      clearTimeout(morningTimeout);
      setMorningTimeout(null);
    }
    if (eveningTimeout) {
      clearTimeout(eveningTimeout);
      setEveningTimeout(null);
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Schedule morning notification
    if (settings.enableMorningMotivation) {
      const [morningHour, morningMinute] = settings.morningTime.split(':').map(Number);
      const morningTime = morningHour * 60 + morningMinute;
      
      let morningDelay;
      if (currentTime < morningTime) {
        morningDelay = (morningTime - currentTime) * 60 * 1000;
      } else {
        morningDelay = (24 * 60 - currentTime + morningTime) * 60 * 1000;
      }

      const timeout = setTimeout(() => {
        sendMorningNotification();
        scheduleSmartNotifications(); // Reschedule for next day
      }, morningDelay);
      
      setMorningTimeout(timeout);
    }

    // Schedule evening notification
    if (settings.enableEveningReminder) {
      const [eveningHour, eveningMinute] = settings.eveningTime.split(':').map(Number);
      const eveningTime = eveningHour * 60 + eveningMinute;
      
      let eveningDelay;
      if (currentTime < eveningTime) {
        eveningDelay = (eveningTime - currentTime) * 60 * 1000;
      } else {
        eveningDelay = (24 * 60 - currentTime + eveningTime) * 60 * 1000;
      }

      const timeout = setTimeout(() => {
        sendEveningNotification();
        scheduleSmartNotifications(); // Reschedule for next day
      }, eveningDelay);
      
      setEveningTimeout(timeout);
    }
  };

  // FIXED: Morning notification using Dashboard logic
  const sendMorningNotification = () => {
    if (notificationStatus !== 'granted') return;

    console.log('=== MORNING NOTIFICATION WITH DASHBOARD LOGIC ===');
    
    const dashboardStats = getDashboardTodayStats();
    console.log('Dashboard stats for morning:', dashboardStats);

    const motivationalMessages = [
      "🌅 Good morning! Ready to build great habits?",
      "💪 New day, new opportunities to grow!",
      "🎯 Let's make today count with your habits!",
      "🌟 Start your day strong with positive habits!",
      "🚀 Time to level up with your daily habits!"
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    const notification = new Notification('Good Morning! 🌅', {
      body: dashboardStats.total > 0 
        ? `${randomMessage}\n\nYou have ${dashboardStats.total} habits to complete today.`
        : `${randomMessage}\n\nAdd some habits to start building great routines!`,
      icon: '/favicon.ico',
      tag: 'morning-reminder',
      requireInteraction: false
    });

    console.log('Morning notification sent successfully');
    
    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  };

  // FIXED: Evening notification using Dashboard logic
  const sendEveningNotification = () => {
    if (notificationStatus !== 'granted') return;

    console.log('=== USING DASHBOARD EXACT LOGIC ===');
    
    const dashboardStats = getDashboardTodayStats();
    console.log('Dashboard stats:', dashboardStats);
    
    // Calculate pending habits using Dashboard logic
    const today = formatDate(new Date());
    const pendingHabits = habits.filter(habit => {
      if (!habit.completions || !Array.isArray(habit.completions)) {
        return true;
      }
      
      const isCompletedToday = habit.completions.some(completion => {
        try {
          const completionDate = formatDate(new Date(completion.date));
          return completionDate === today;
        } catch (error) {
          return false;
        }
      });
      return !isCompletedToday;
    });

    console.log('Pending habits:', pendingHabits.length);
    console.log('Completed habits:', dashboardStats.completed);

    let title, body;

    if (dashboardStats.total === 0) {
      title = 'Evening Check-in 🌆';
      body = 'No habits to track yet. Add some habits to get started!';
    } else if (pendingHabits.length === 0) {
      title = '🏆 Perfect Day!';
      body = `Amazing! You completed all ${dashboardStats.completed} habits today! 🎉`;
    } else if (dashboardStats.completed > 0) {
      title = '⏰ Evening Check-in';
      body = `Great progress! ${dashboardStats.completed} completed, ${pendingHabits.length} habit${pendingHabits.length === 1 ? '' : 's'} left for today.`;
    } else {
      title = '💪 Still Time!';
      body = `You have ${pendingHabits.length} habit${pendingHabits.length === 1 ? '' : 's'} pending for today. Let's finish strong!`;
    }

    console.log('Final notification:', title, '-', body);

    const notification = new Notification(title, {
      body: body,
      icon: '/favicon.ico',
      tag: 'evening-reminder',
      requireInteraction: true
    });

    console.log('Evening notification sent successfully');
    
    // Auto close after 15 seconds
    setTimeout(() => {
      notification.close();
    }, 15000);
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const currentPermission = Notification.permission;

    if (currentPermission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission);
        
        if (permission === 'granted') {
          updateSetting('enableNotifications', true);
          new Notification('Notifications Enabled! 🔔', {
            body: 'You will now receive habit reminders at your scheduled times.',
            icon: '/favicon.ico'
          });
          
          // Schedule notifications immediately after permission granted
          setTimeout(() => {
            scheduleSmartNotifications();
          }, 1000);
        } else {
          updateSetting('enableNotifications', false);
          alert('Notifications permission denied. You can enable them later in your browser settings.');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        alert('Error requesting notification permission');
      }
    } else if (currentPermission === 'denied') {
      alert(
        'Notifications are blocked. To enable them:\n\n' +
        '1. Click the lock/info icon in your browser\'s address bar\n' +
        '2. Change notifications from "Block" to "Allow"\n' +
        '3. Refresh this page\n\n' +
        'Or go to your browser settings and allow notifications for this site.'
      );
    } else if (currentPermission === 'granted') {
      const newValue = !settings.enableNotifications;
      updateSetting('enableNotifications', newValue);
      
      if (newValue) {
        new Notification('Notifications Re-enabled! 🔔', {
          body: 'You will now receive habit reminders.',
          icon: '/favicon.ico'
        });
        
        // Reschedule notifications
        setTimeout(() => {
          scheduleSmartNotifications();
        }, 1000);
      }
    }
  };

  const getNotificationButtonProps = () => {
    const currentPermission = Notification.permission;
    
    if (!('Notification' in window)) {
      return {
        text: '❌ Not Supported',
        className: 'permission-btn disabled',
        disabled: true
      };
    }

    switch (currentPermission) {
      case 'granted':
        return {
          text: settings.enableNotifications ? '✅ Enabled' : '🔔 Enable',
          className: settings.enableNotifications ? 'permission-btn enabled' : 'permission-btn',
          disabled: false
        };
      case 'denied':
        return {
          text: '🚫 Blocked - Click for Help',
          className: 'permission-btn blocked',
          disabled: false
        };
      default:
        return {
          text: '🔔 Request Permission',
          className: 'permission-btn',
          disabled: false
        };
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      habits: habits,
      settings: settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportModal(false);
  };

  const handleClearAllData = () => {
    clearAllData();
    localStorage.removeItem('habitTrackerSettings');
    setSettings({
      theme: 'light',
      accentColor: '#6366f1',
      fontSize: 'medium',
      enableNotifications: Notification.permission === 'granted',
      dailyReminder: true,
      reminderTime: '09:00',
      enableMorningMotivation: true,
      enableEveningReminder: true,
      morningTime: '08:00',
      eveningTime: '20:00',
      backupEnabled: true
    });
    setShowDeleteModal(false);
    alert('All data cleared successfully!');
  };

  const buttonProps = getNotificationButtonProps();

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Customize your habit tracking experience</p>
      </div>

      {/* Appearance Settings */}
      <div className="settings-section">
        <div className="section-header">
          <h2>🎨 Appearance</h2>
          <p>Customize the look and feel of your website</p>
        </div>
        
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <label>Theme</label>
              <span className="setting-description">Choose between light and dark mode</span>
            </div>
            <div className="theme-toggle">
              <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => theme === 'dark' && toggleTheme()}
              >
                ☀️ Light
              </button>
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => theme === 'light' && toggleTheme()}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Accent Color</label>
              <span className="setting-description">Primary color for buttons and highlights</span>
            </div>
            <div className="color-picker">
              {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                <button
                  key={color}
                  className={`color-option ${settings.accentColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => updateSetting('accentColor', color)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="settings-section">
        <div className="section-header">
          <h2>🔔 Smart Notifications</h2>
          <p>Stay motivated with intelligent reminders based on your progress</p>
        </div>
        
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <label>Enable Notifications</label>
              <span className="setting-description">
                {notificationStatus === 'denied' 
                  ? 'Notifications are blocked. Click the button for instructions to enable them.'
                  : notificationStatus === 'granted'
                  ? 'Toggle notifications on/off. You can also manage this in your browser settings.'
                  : 'Allow the app to send you smart notifications'
                }
              </span>
            </div>
            <button 
              className={buttonProps.className}
              onClick={handleNotificationPermission}
              disabled={buttonProps.disabled}
            >
              {buttonProps.text}
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Morning Motivation</label>
              <span className="setting-description">Get an inspiring message to start your day with purpose</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enableMorningMotivation && settings.enableNotifications}
                onChange={(e) => updateSetting('enableMorningMotivation', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Morning Time</label>
              <span className="setting-description">When to send your daily motivation boost</span>
            </div>
            <input
              type="time"
              value={settings.morningTime}
              onChange={(e) => updateSetting('morningTime', e.target.value)}
              className="setting-input"
              disabled={!settings.enableNotifications || !settings.enableMorningMotivation}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Evening Progress Check</label>
              <span className="setting-description">Review your day and get motivated to finish strong</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enableEveningReminder && settings.enableNotifications}
                onChange={(e) => updateSetting('enableEveningReminder', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Evening Time</label>
              <span className="setting-description">When to check your daily progress</span>
            </div>
            <input
              type="time"
              value={settings.eveningTime}
              onChange={(e) => updateSetting('eveningTime', e.target.value)}
              className="setting-input"
              disabled={!settings.enableNotifications || !settings.enableEveningReminder}
            />
          </div>

          <div className="setting-item full-width">
            <div className="setting-info">
              <label>Test Your Notifications</label>
              <span className="setting-description">See how your notifications will look and work</span>
            </div>
            <div className="test-buttons">
              <button 
                onClick={() => {
                  console.log('Testing morning notification...');
                  sendMorningNotification();
                }}
                className="test-btn morning"
                disabled={notificationStatus !== 'granted'}
              >
                🌅 Test Morning Message
              </button>
              <button 
                onClick={() => {
                  console.log('Testing evening notification...');
                  sendEveningNotification();
                }}
                className="test-btn evening"
                disabled={notificationStatus !== 'granted'}
              >
                🌆 Test Evening Check-in
              </button>
            </div>
            {notificationStatus !== 'granted' && (
              <small className="test-help">
                Enable notifications above to test your messages
              </small>
            )}
          </div>
        </div>
      </div>

      {/* Data & Privacy Settings */}
      <div className="settings-section">
        <div className="section-header">
          <h2>🔒 Data & Privacy</h2>
          <p>Manage your data and privacy preferences</p>
        </div>
        
        <div className="settings-grid">
          <div className="setting-item full-width">
            <div className="setting-info">
              <label>Export Data</label>
              <span className="setting-description">Download all your habit data as a JSON file</span>
            </div>
            <button 
              className="action-btn export"
              onClick={() => setShowExportModal(true)}
            >
              📤 Export Data
            </button>
          </div>

          <div className="setting-item full-width danger-zone">
            <div className="setting-info">
              <label>Clear All Data</label>
              <span className="setting-description">⚠️ This will permanently delete all your habits and data</span>
            </div>
            <button 
              className="action-btn danger"
              onClick={() => setShowDeleteModal(true)}
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="settings-section">
        <div className="section-header">
          <h2>ℹ️ About</h2>
          <p>Website information</p>
        </div>
        
        <div className="app-info">
          <div className="info-item">
            <span className="info-label">Version</span>
            <span className="info-value">1.0.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Habits</span>
            <span className="info-value">{habits?.length || 0}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Data Size</span>
            <span className="info-value">{(JSON.stringify(habits).length / 1024).toFixed(2)} KB</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Export Data</h3>
            <p>This will download all your habit data as a JSON file that you can import later.</p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={handleExportData}>
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content danger" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Clear All Data</h3>
            <p>This action cannot be undone. All your habits, completions, and settings will be permanently deleted.</p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn danger" onClick={handleClearAllData}>
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
