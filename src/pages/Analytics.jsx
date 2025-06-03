import React, { useState, useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import { formatDate, getDaysAgo } from '../utils/dateUtils';
import { calculateStreak, calculateCompletionRate } from '../utils/habitUtils';

const Analytics = () => {
  const { habits } = useHabits();
  const [timeRange, setTimeRange] = useState('7'); // 7, 30, 90 days by default i kept 7 days 
  const [selectedHabit, setSelectedHabit] = useState('all');

  // Calculate analytics data
  // const analyticsData = useMemo(() => {
  //   const days = parseInt(timeRange);
  //   const endDate = new Date();
  //   const startDate = new Date();
  //   startDate.setDate(startDate.getDate() - days);

  //   // Filter habits based on selection
  //   const filteredHabits = selectedHabit === 'all' 
  //     ? habits 
  //     : habits.filter(habit => habit.id === selectedHabit);

  //   // Overall statistics
  //   const totalHabits = filteredHabits.length;
  //   let totalCompletions = 0;
  //   let totalPossibleCompletions = 0;
  //   let longestStreak = 0;
  //   let activeStreaks = 0;

  //   // Daily completion data for chart
  //   const dailyData = [];
  //   for (let i = days - 1; i >= 0; i--) {
  //     const date = getDaysAgo(i);
  //     let dayCompletions = 0;
  //     let dayPossible = 0;

  //     filteredHabits.forEach(habit => {
  //       if (habit.completions && habit.completions[date]) {
  //         dayCompletions++;
  //       }
  //       dayPossible++;
  //     });

  //     dailyData.push({
  //       date,
  //       completions: dayCompletions,
  //       possible: dayPossible,
  //       percentage: dayPossible > 0 ? Math.round((dayCompletions / dayPossible) * 100) : 0
  //     });

  //     totalCompletions += dayCompletions;
  //     totalPossibleCompletions += dayPossible;
  //   }

  //   // Calculate streaks and habit-specific data
  //   const habitStats = filteredHabits.map(habit => {
  //     const streak = calculateStreak(habit.completions);
  //     const completionRate = calculateCompletionRate(habit, days);
      
  //     if (streak > longestStreak) longestStreak = streak;
  //     if (streak > 0) activeStreaks++;

  //     return {
  //       ...habit,
  //       streak,
  //       completionRate,
  //       completionsInPeriod: Object.keys(habit.completions || {})
  //         .filter(date => {
  //           const completionDate = new Date(date);
  //           return completionDate >= startDate && completionDate <= endDate;
  //         }).length
  //     };
  //   });

  //   // Category breakdown
  //   const categoryStats = {};
  //   filteredHabits.forEach(habit => {
  //     const category = habit.category || 'uncategorized';
  //     if (!categoryStats[category]) {
  //       categoryStats[category] = { count: 0, completions: 0, possible: 0 };
  //     }
  //     categoryStats[category].count++;
      
  //     Object.keys(habit.completions || {}).forEach(date => {
  //       const completionDate = new Date(date);
  //       if (completionDate >= startDate && completionDate <= endDate) {
  //         categoryStats[category].completions++;
  //       }
  //     });
  //     categoryStats[category].possible += days;
  //   });

  //   const overallCompletionRate = totalPossibleCompletions > 0 
  //     ? Math.round((totalCompletions / totalPossibleCompletions) * 100) 
  //     : 0;

  //   return {
  //     totalHabits,
  //     totalCompletions,
  //     overallCompletionRate,
  //     longestStreak,
  //     activeStreaks,
  //     dailyData,
  //     habitStats,
  //     categoryStats
  //   };
  // }, [habits, timeRange, selectedHabit]);
const analyticsData = useMemo(() => {
  const days = parseInt(timeRange);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const filteredHabits = selectedHabit === 'all' 
    ? habits 
    : habits.filter(habit => habit.id === selectedHabit);

  // Daily completion data for chart
  const dailyData = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = getDaysAgo(i);
    const currentDate = new Date(date);
    
    let dayCompletions = 0;
    let dayPossible = 0;

    filteredHabits.forEach(habit => {
      // Check if habit is applicable for this date
      const isApplicable = 
        habit.frequency === 'daily' ||
        (habit.frequency === 'weekdays' && 
         currentDate.getDay() >= 1 && 
         currentDate.getDay() <= 5) || // Mon-Fri
        (habit.frequency === 'weekly' && 
         currentDate.getDay() === 0); // Sunday

      if (isApplicable) {
        dayPossible++;
        if (habit.completions?.[date]) {
          dayCompletions++;
        }
      }
    });

    const percentage = dayPossible > 0 
      ? Math.round((dayCompletions / dayPossible) * 100) 
      : 0;

    dailyData.push({
      date,
      completions: dayCompletions,
      possible: dayPossible,
      percentage
    });
  }

  // Rest of the calculations (streaks, category stats, etc.)
  let totalCompletions = 0;
  let totalPossibleCompletions = 0;
  let longestStreak = 0;
  let activeStreaks = 0;

  dailyData.forEach(day => {
    totalCompletions += day.completions;
    totalPossibleCompletions += day.possible;
  });

  const habitStats = filteredHabits.map(habit => {
    const streak = calculateStreak(habit.completions);
    const completionRate = calculateCompletionRate(habit, days);
    
    if (streak > longestStreak) longestStreak = streak;
    if (streak > 0) activeStreaks++;

    return {
      ...habit,
      streak,
      completionRate,
      completionsInPeriod: Object.keys(habit.completions || {})
        .filter(date => {
          const completionDate = new Date(date);
          return completionDate >= startDate && completionDate <= endDate;
        }).length
    };
  });

  const categoryStats = {};
  filteredHabits.forEach(habit => {
    const category = habit.category || 'uncategorized';
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, completions: 0, possible: 0 };
    }
    categoryStats[category].count++;
    
    Object.keys(habit.completions || {}).forEach(date => {
      const completionDate = new Date(date);
      if (completionDate >= startDate && completionDate <= endDate) {
        categoryStats[category].completions++;
      }
    });
    categoryStats[category].possible += days;
  });

  const overallCompletionRate = totalPossibleCompletions > 0 
    ? Math.round((totalCompletions / totalPossibleCompletions) * 100) 
    : 0;

  return {
    totalHabits: filteredHabits.length,
    totalCompletions,
    overallCompletionRate,
    longestStreak,
    activeStreaks,
    dailyData,
    habitStats,
    categoryStats
  };
}, [habits, timeRange, selectedHabit]);

  // Get best and worst performing habits
  const bestHabit = analyticsData.habitStats.reduce((best, habit) => 
    habit.completionRate > (best?.completionRate || 0) ? habit : best, null);
  
  const worstHabit = analyticsData.habitStats.reduce((worst, habit) => 
    habit.completionRate < (worst?.completionRate || 100) ? habit : worst, null);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>📊 Analytics & Insights</h1>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          
          <select 
            value={selectedHabit} 
            onChange={(e) => setSelectedHabit(e.target.value)}
            className="habit-filter-select"
          >
            <option value="all">All Habits</option>
            {habits.map(habit => (
              <option key={habit.id} value={habit.id}>{habit.title}</option>
            ))}
          </select>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="empty-analytics">
          <div className="empty-icon">📈</div>
          <h3>No Data Yet</h3>
          <p>Start tracking habits to see your analytics and insights here!</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <h3>Overall Completion</h3>
                <div className="metric-value">{analyticsData.overallCompletionRate}%</div>
                <div className="metric-subtitle">
                  {analyticsData.totalCompletions} of {analyticsData.totalPossibleCompletions} possible
                </div>
              </div>
            </div>

            <div className="metric-card success">
              <div className="metric-icon">🔥</div>
              <div className="metric-content">
                <h3>Longest Streak</h3>
                <div className="metric-value">{analyticsData.longestStreak}</div>
                <div className="metric-subtitle">days in a row</div>
              </div>
            </div>

            <div className="metric-card info">
              <div className="metric-icon">⚡</div>
              <div className="metric-content">
                <h3>Active Streaks</h3>
                <div className="metric-value">{analyticsData.activeStreaks}</div>
                <div className="metric-subtitle">habits with current streaks</div>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <h3>Total Habits</h3>
                <div className="metric-value">{analyticsData.totalHabits}</div>
                <div className="metric-subtitle">being tracked</div>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
<div className="chart-section">
  <div className="section-header">
    <h2>📈 Daily Progress</h2>
    <p>Your completion rate over the selected time period</p>
  </div>
  <div className="progress-chart">
    <div className="chart-container">
      <div className="chart-y-axis">
        <div className="y-label">100%</div>
        <div className="y-label">75%</div>
        <div className="y-label">50%</div>
        <div className="y-label">25%</div>
        <div className="y-label">0%</div>
      </div>
      <div className="chart-bars">
        {analyticsData.dailyData.map((day, index) => (
          <div key={day.date} className="chart-bar-wrapper">
            <div 
              className="chart-bar-fill"
              style={{ 
                height: `${Math.max(day.percentage, 2)}%`, // Minimum 2% for visibility
                backgroundColor: 
                  day.percentage >= 80 ? '#10b981' : 
                  day.percentage >= 60 ? '#f59e0b' : 
                  day.percentage >= 40 ? '#ef4444' : '#94a3b8'
              }}
            />
            <div className="bar-label">
              {new Date(day.date).toLocaleDateString('en-US', { 
                day: 'numeric',
                month: 'short'
              })}
            </div>
            <div className="bar-tooltip">
              <div className="tooltip-content">
                <div className="tooltip-date">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="tooltip-stats">
                  <span className="tooltip-completed">{day.completions} completed</span>
                  <span className="tooltip-total">out of {day.possible}</span>
                  <span className="tooltip-percentage">{day.percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Chart Legend */}
    <div className="chart-legend">
      <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: '#10b981'}}></div>
        <span>Excellent (80%+)</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: '#f59e0b'}}></div>
        <span>Good (60-79%)</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
        <span>Needs Work (40-59%)</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: '#94a3b8'}}></div>
        <span>Poor (0-39%)</span>
      </div>
    </div>
  </div>
</div>


          {/* Habit Performance */}
          <div className="performance-section">
            <div className="section-header">
              <h2>🏆 Habit Performance</h2>
              <p>Individual habit statistics and completion rates</p>
            </div>
            
            <div className="performance-grid">
              {analyticsData.habitStats.map(habit => (
                <div key={habit.id} className={`performance-card ${habit.color}`}>
                  <div className="performance-header">
                    <span className="habit-icon">{habit.icon}</span>
                    <h4>{habit.title}</h4>
                  </div>
                  
                  <div className="performance-stats">
                    <div className="stat-item">
                      <span className="stat-label">Completion Rate</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${habit.completionRate}%` }}
                        />
                      </div>
                      <span className="stat-value">{habit.completionRate}%</span>
                    </div>
                    
                    <div className="stat-row">
                      <div className="stat-item">
                        <span className="stat-label">Current Streak</span>
                        <span className="stat-value">{habit.streak} days</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Completions</span>
                        <span className="stat-value">{habit.completionsInPeriod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="category-section">
            <div className="section-header">
              <h2>📋 Category Breakdown</h2>
              <p>Performance by habit category</p>
            </div>
            
            <div className="category-grid">
              {Object.entries(analyticsData.categoryStats).map(([category, stats]) => (
                <div key={category} className="category-card">
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                  <div className="category-stats">
                    <div className="category-stat">
                      <span>Habits</span>
                      <span>{stats.count}</span>
                    </div>
                    <div className="category-stat">
                      <span>Completion Rate</span>
                      <span>{Math.round((stats.completions / stats.possible) * 100) || 0}%</span>
                    </div>
                    <div className="category-stat">
                      <span>Total Completions</span>
                      <span>{stats.completions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="insights-section">
            <div className="section-header">
              <h2>💡 Insights & Recommendations</h2>
              <p>Personalized insights based on your habit data</p>
            </div>
            
            <div className="insights-grid">
              {bestHabit && (
                <div className="insight-card success">
                  <div className="insight-icon">🌟</div>
                  <div className="insight-content">
                    <h4>Top Performer</h4>
                    <p><strong>{bestHabit.title}</strong> is your most consistent habit with a {bestHabit.completionRate}% completion rate!</p>
                  </div>
                </div>
              )}
              
              {worstHabit && worstHabit.completionRate < 50 && (
                <div className="insight-card warning">
                  <div className="insight-icon">⚠️</div>
                  <div className="insight-content">
                    <h4>Needs Attention</h4>
                    <p><strong>{worstHabit.title}</strong> has a {worstHabit.completionRate}% completion rate. Consider adjusting your approach or schedule.</p>
                  </div>
                </div>
              )}
              
              {analyticsData.activeStreaks > 0 && (
                <div className="insight-card info">
                  <div className="insight-icon">🔥</div>
                  <div className="insight-content">
                    <h4>Great Momentum</h4>
                    <p>You have {analyticsData.activeStreaks} active streak{analyticsData.activeStreaks > 1 ? 's' : ''}! Keep up the excellent work.</p>
                  </div>
                </div>
              )}
              
              {analyticsData.overallCompletionRate >= 80 && (
                <div className="insight-card success">
                  <div className="insight-icon">🎉</div>
                  <div className="insight-content">
                    <h4>Excellent Progress</h4>
                    <p>Your {analyticsData.overallCompletionRate}% completion rate shows great consistency. You're building strong habits!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
