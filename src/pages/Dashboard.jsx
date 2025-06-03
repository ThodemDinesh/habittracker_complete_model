import React, { useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import { formatDate } from '../utils/dateUtils';
import { calculateStreak } from '../utils/habitUtils';

const Dashboard = () => {
  const { habits } = useHabits();

  // Calculate real-time stats using useMemo for performance
  const todayStats = useMemo(() => {
    const today = formatDate(new Date());
    
    const totalHabits = habits.length;
    const completedToday = habits.filter(habit => 
      habit.completions && habit.completions[today]
    ).length;
    
    const currentStreaks = habits.map(habit => calculateStreak(habit.completions));
    const longestCurrentStreak = currentStreaks.length > 0 
      ? Math.max(...currentStreaks) 
      : 0;
    
    const completionRate = totalHabits > 0 
      ? Math.round((completedToday / totalHabits) * 100) 
      : 0;

    return {
      total: totalHabits,
      completed: completedToday,
      streak: longestCurrentStreak,
      completionRate
    };
  }, [habits]); // Recalculate when habits change

  // Get today's pending habits
  const pendingHabits = useMemo(() => {
    const today = formatDate(new Date());
    return habits.filter(habit => 
      !habit.completions || !habit.completions[today]
    );
  }, [habits]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    const activities = [];
    const today = new Date();
    
    // Get last 7 days of activity
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      
      habits.forEach(habit => {
        if (habit.completions && habit.completions[dateStr]) {
          activities.push({
            habit: habit.title,
            icon: habit.icon,
            date: dateStr,
            timestamp: date.getTime()
          });
        }
      });
    }
    
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [habits]);

  return (
    <div className="dashboard-page">
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

      {/* Today's Progress */}
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
              <div key={habit.id} className={`pending-habit ${habit.color}`}>
                <span className="habit-icon">{habit.icon}</span>
                <span className="habit-title">{habit.title}</span>
                <span className="habit-frequency">{habit.frequency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon">{activity.icon}</span>
                <div className="activity-content">
                  <span className="activity-habit">{activity.habit}</span>
                  <span className="activity-date">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="activity-status">✅</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-activity">
            <p>No recent activity. Start completing habits to see your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
