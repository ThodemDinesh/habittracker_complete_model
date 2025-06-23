import React, { useMemo, useState } from 'react';
import { useHabits } from '../context/HabitContext';

const Dashboard = () => {
  const { habits, loading, error, fetchHabits } = useHabits();
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [recentDays, setRecentDays] = useState(2);

  // Helper function to format date consistently
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get date N days ago
  const getDaysAgo = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return formatDate(date);
  };

  // Calculate real-time stats using MongoDB structure
  const todayStats = useMemo(() => {
    if (!habits || !Array.isArray(habits) || habits.length === 0) {
      return { total: 0, completed: 0, streak: 0, completionRate: 0 };
    }

    const today = formatDate(new Date());
    
    // Count completed habits today using MongoDB completions array
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
  }, [habits]);

  // Get today's pending habits using MongoDB structure
  const pendingHabits = useMemo(() => {
    if (!habits || !Array.isArray(habits) || habits.length === 0) return [];

    const today = formatDate(new Date());
    const pending = habits.filter(habit => {
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

    return pending;
  }, [habits]);

  // Recent activity calculations using MongoDB structure
  const recentActivity = useMemo(() => {
    if (!habits || !Array.isArray(habits) || habits.length === 0) return [];

    const activities = [];
    
    for (let i = 0; i < recentDays; i++) {
      const date = getDaysAgo(i);
      
      habits.forEach(habit => {
        if (!habit.completions || !Array.isArray(habit.completions)) {
          return;
        }
        
        const completion = habit.completions.find(completion => {
          try {
            const completionDate = formatDate(new Date(completion.date));
            return completionDate === date;
          } catch (error) {
            return false;
          }
        });

        if (completion) {
          const completionTime = new Date(completion.completedAt || completion.date);
          
          if (!isNaN(completionTime.getTime())) {
            activities.push({
              ...habit,
              date,
              timestamp: completionTime.getTime(),
              time: completionTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              completionNotes: completion.notes || '',
              completionCount: completion.count || 1
            });
          }
        }
      });
    }
    
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, Math.max(10, recentDays * 5));
  }, [habits, recentDays]);

  // Group activities by date with labels
  const groupedActivities = useMemo(() => {
    const groups = {};
    const today = new Date();
    
    recentActivity.forEach(activity => {
      const date = new Date(activity.date);
      const dayDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      
      if (dayDiff < recentDays) {
        let label;
        if (dayDiff === 0) label = 'Today';
        else if (dayDiff === 1) label = 'Yesterday';
        else label = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
        
        if (!groups[label]) groups[label] = [];
        groups[label].push(activity);
      }
    });
    
    return Object.entries(groups).map(([label, items]) => ({
      label,
      items: items.slice(0, 8)
    }));
  }, [recentActivity, recentDays]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return groupedActivities
      .map(group => ({
        ...group,
        items: group.items.filter(activity => {
          const matchesHabit = !filter || activity.name.toLowerCase().includes(filter.toLowerCase());
          const matchesDate = !dateFilter || activity.date === dateFilter;
          return matchesHabit && matchesDate;
        })
      }))
      .filter(group => group.items.length > 0);
  }, [groupedActivities, filter, dateFilter]);

  // Day options for the dropdown
  const dayOptions = [
    { value: 1, label: 'Today only' },
    { value: 2, label: 'Last 2 days' },
    { value: 3, label: 'Last 3 days' },
    { value: 5, label: 'Last 5 days' },
    { value: 7, label: 'Last week' },
    { value: 14, label: 'Last 2 weeks' },
    { value: 30, label: 'Last month' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">
          <h3>Loading dashboard...</h3>
          <div className="spinner">⏳</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <h3>Error loading dashboard</h3>
          <p>{error}</p>
          <button onClick={() => fetchHabits()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-date">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Total Habits</h3>
            <p className="stat-number">{todayStats.total}</p>
            <div className="stat-subtitle">Active habits</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed Today</h3>
            <p className="stat-number">{todayStats.completed}</p>
            <div className="stat-subtitle">
              {todayStats.completionRate}% completion rate
            </div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <p className="stat-number">{todayStats.streak}</p>
            <div className="stat-subtitle">days in a row</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Today</h3>
            <p className="stat-number">{pendingHabits.length}</p>
            <div className="stat-subtitle">habits remaining</div>
          </div>
        </div>
      </div>

      {/* Simple Today's Progress Section */}
      <div className="progress-section">
        <h2>Today's Progress</h2>
        <div className="progress-bar-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill"
              style={{ width: `${todayStats.completionRate}%` }}
            />
          </div>
          <span className="progress-text">
            {todayStats.completed} of {todayStats.total} habits completed
          </span>
        </div>
      </div>

      {/* Pending Habits */}
      {pendingHabits.length > 0 && (
        <div className="pending-section">
          <h2>Pending Habits</h2>
          <div className="pending-habits">
            {pendingHabits.map(habit => (
              <div key={habit._id} className={`pending-habit ${habit.color || 'blue'}`}>
                <span className="habit-icon">{habit.icon || '📝'}</span>
                <span className="habit-title">{habit.name}</span>
                <span className="habit-frequency">{habit.frequency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="activity-header">
          <h2>Recent Activity</h2>
          <div className="activity-filters">
            <div className="days-filter-container">
              <label htmlFor="days-select" className="filter-label">Show:</label>
              <select 
                id="days-select"
                value={recentDays} 
                onChange={(e) => setRecentDays(Number(e.target.value))}
                className="days-filter-select"
              >
                {dayOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Filter by habit..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-input"
            />
            
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="date-filter"
              title="Filter by specific date"
            />
            
            {(filter || dateFilter) && (
              <button 
                onClick={() => {
                  setFilter('');
                  setDateFilter('');
                }}
                className="clear-filters-btn"
                title="Clear all filters"
              >
                Clear
              </button>
            )}  
          </div>
        </div>

        {filteredActivities.length > 0 ? (
          <div className="activity-content">
            <div className="activity-summary">
              <span className="activity-count">
                Showing {filteredActivities.reduce((total, group) => total + group.items.length, 0)} activities
                {recentDays === 1 ? ' from today' : ` from the last ${recentDays} days`}
              </span>
            </div>
            
            {filteredActivities.map((group, index) => (
              <div key={index} className="activity-group">
                <h3 className="group-label">{group.label}</h3>
                <div className="activity-list">
                  {group.items.map((activity, idx) => {
                    const currentStreak = activity.streak?.current || 0;
                    return (
                      <div key={`${activity._id}-${idx}`} className="activity-item">
                        <div className="activity-icon-container">
                          <span className="activity-icon">{activity.icon}</span>
                          {currentStreak > 3 && (
                            <span className="streak-badge">🔥 {currentStreak}</span>
                          )}
                        </div>
                        <div className="activity-details">
                          <div className="activity-header">
                            <span className="habit-title">{activity.name}</span>
                            <span className="activity-time">{activity.time}</span>
                          </div>
                          <div className="activity-meta">
                            <span className="activity-category">
                              {activity.category}
                            </span>
                            <span className="activity-frequency">
                              {activity.frequency}
                            </span>
                          </div>
                          {activity.completionNotes && (
                            <div className="activity-notes">
                              <small>"{activity.completionNotes}"</small>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-activity">
            <div className="empty-icon">📊</div>
            <h3>No Activity Found</h3>
            <p>
              {filter || dateFilter 
                ? 'No activities match your current filters. Try adjusting your search criteria.'
                : `No activities found for the ${recentDays === 1 ? 'selected day' : `last ${recentDays} days`}. Complete some habits to see your progress here!`
              }
            </p>
            {(filter || dateFilter) && (
              <button 
                onClick={() => {
                  setFilter('');
                  setDateFilter('');
                }}
                className="reset-filters-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
