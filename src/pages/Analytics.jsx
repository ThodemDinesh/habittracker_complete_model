import React, { useState, useMemo, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';

const Analytics = () => {
  const { habits, getUserAnalytics } = useHabits();
  const [timeRange, setTimeRange] = useState('7');
  const [selectedHabit, setSelectedHabit] = useState('all');
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user analytics when component mounts
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (habits.length > 0) {
        setLoading(true);
        try {
          const analytics = await getUserAnalytics();
          setUserAnalytics(analytics);
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();
  }, [habits, getUserAnalytics]);

  // Helper function to calculate habit completion rate
  const calculateHabitCompletionRate = (habit, days) => {
    let possibleCompletions = 0;
    let actualCompletions = 0;
    
    for (let i = days - 1; i >= 0; i--) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);
      currentDate.setHours(0, 0, 0, 0);
      
      const habitCreatedDate = new Date(habit.createdAt);
      habitCreatedDate.setHours(0, 0, 0, 0);
      
      if (currentDate < habitCreatedDate) continue;

      const dayOfWeek = currentDate.getDay();
      let isApplicable = false;
      
      switch (habit.frequency) {
        case 'daily':
          isApplicable = true;
          break;
        case 'weekdays':
          isApplicable = dayOfWeek >= 1 && dayOfWeek <= 5;
          break;
        case 'weekly':
          isApplicable = dayOfWeek === 0;
          break;
        case 'monthly':
          isApplicable = currentDate.getDate() === 1;
          break;
        default:
          isApplicable = true;
      }

      if (isApplicable) {
        possibleCompletions++;
        
        const isCompleted = habit.completions && habit.completions.some(completion => {
          const completionDate = new Date(completion.date);
          completionDate.setHours(0, 0, 0, 0);
          return completionDate.getTime() === currentDate.getTime();
        });
        
        if (isCompleted) {
          actualCompletions++;
        }
      }
    }
    
    return possibleCompletions > 0 ? Math.round((actualCompletions / possibleCompletions) * 100) : 0;
  };

  // Helper function to count completions in period
  const countCompletionsInPeriod = (habit, days) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    return habit.completions ? habit.completions.filter(completion => {
      const completionDate = new Date(completion.date);
      return completionDate >= startDate && completionDate <= endDate;
    }).length : 0;
  };

  // Helper function to calculate category stats
  const calculateCategoryStats = (habits, days) => {
    const categoryStats = {};
    
    habits.forEach(habit => {
      const category = habit.category || 'uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, completions: 0, possible: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].completions += countCompletionsInPeriod(habit, days);
      
      // Calculate possible completions for this habit
      let possibleForHabit = 0;
      for (let i = days - 1; i >= 0; i--) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - i);
        const habitCreatedDate = new Date(habit.createdAt);
        
        if (currentDate < habitCreatedDate) continue;

        const dayOfWeek = currentDate.getDay();
        let isApplicable = false;
        
        switch (habit.frequency) {
          case 'daily':
            isApplicable = true;
            break;
          case 'weekdays':
            isApplicable = dayOfWeek >= 1 && dayOfWeek <= 5;
            break;
          case 'weekly':
            isApplicable = dayOfWeek === 0;
            break;
          case 'monthly':
            isApplicable = currentDate.getDate() === 1;
            break;
          default:
            isApplicable = true;
        }

        if (isApplicable) {
          possibleForHabit++;
        }
      }
      
      categoryStats[category].possible += possibleForHabit;
    });
    
    return categoryStats;
  };

  const analyticsData = useMemo(() => {
    if (!habits.length) {
      return {
        totalHabits: 0,
        totalCompletions: 0,
        totalPossibleCompletions: 0,
        overallCompletionRate: 0,
        longestStreak: 0,
        activeStreaks: 0,
        dailyData: [],
        habitStats: [],
        categoryStats: {}
      };
    }

    const days = parseInt(timeRange);
    const filteredHabits = selectedHabit === 'all' 
      ? habits 
      : habits.filter(habit => habit._id === selectedHabit);

    // FIXED: Daily completion data for chart
    const dailyData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);
      currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
      
      const dateString = currentDate.toISOString().split('T')[0];
      
      let dayCompletions = 0;
      let dayPossible = 0;

      filteredHabits.forEach(habit => {
        // Check if habit was created before or on this date
        const habitCreatedDate = new Date(habit.createdAt);
        habitCreatedDate.setHours(0, 0, 0, 0);
        
        if (currentDate < habitCreatedDate) return;

        // FIXED: JavaScript day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
        const dayOfWeek = currentDate.getDay();
        
        // FIXED: Frequency checking logic
        let isApplicable = false;
        
        switch (habit.frequency) {
          case 'daily':
            isApplicable = true;
            break;
          case 'weekdays':
            // Monday=1, Tuesday=2, ..., Friday=5
            isApplicable = dayOfWeek >= 1 && dayOfWeek <= 5;
            break;
          case 'weekly':
            // Apply on Sundays (0) or the day habit was created
            isApplicable = dayOfWeek === 0;
            break;
          case 'monthly':
            // Apply on the 1st of each month
            isApplicable = currentDate.getDate() === 1;
            break;
          default:
            isApplicable = true; // Default to daily for custom frequencies
        }

        if (isApplicable) {
          dayPossible++;
          
          // FIXED: Check if habit was completed on this date
          const isCompleted = habit.completions && habit.completions.some(completion => {
            const completionDate = new Date(completion.date);
            completionDate.setHours(0, 0, 0, 0);
            return completionDate.getTime() === currentDate.getTime();
          });
          
          if (isCompleted) {
            dayCompletions++;
          }
        }
      });

      const percentage = dayPossible > 0 
        ? Math.round((dayCompletions / dayPossible) * 100) 
        : 0;

      dailyData.push({
        date: dateString,
        completions: dayCompletions,
        possible: dayPossible,
        percentage,
        // Add formatted date for display
        displayDate: currentDate.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short'
        })
      });
    }

    // Calculate habit stats
    const habitStats = filteredHabits.map(habit => ({
      ...habit,
      streak: habit.streak?.current || 0,
      longestStreak: habit.streak?.longest || 0,
      completionRate: calculateHabitCompletionRate(habit, days),
      completionsInPeriod: countCompletionsInPeriod(habit, days)
    }));

    return {
      totalHabits: filteredHabits.length,
      totalCompletions: dailyData.reduce((sum, day) => sum + day.completions, 0),
      totalPossibleCompletions: dailyData.reduce((sum, day) => sum + day.possible, 0),
      overallCompletionRate: dailyData.reduce((sum, day) => sum + day.possible, 0) > 0 
        ? Math.round((dailyData.reduce((sum, day) => sum + day.completions, 0) / dailyData.reduce((sum, day) => sum + day.possible, 0)) * 100)
        : 0,
      longestStreak: Math.max(...filteredHabits.map(h => h.streak?.longest || 0), 0),
      activeStreaks: filteredHabits.filter(h => (h.streak?.current || 0) > 0).length,
      dailyData,
      habitStats,
      categoryStats: calculateCategoryStats(filteredHabits, days)
    };
  }, [habits, timeRange, selectedHabit]);

  // Get best and worst performing habits
  const bestHabit = analyticsData.habitStats.length > 0 
    ? analyticsData.habitStats.reduce((best, habit) => 
        habit.completionRate > (best?.completionRate || 0) ? habit : best, null)
    : null;
  
  const worstHabit = analyticsData.habitStats.length > 0 
    ? analyticsData.habitStats.reduce((worst, habit) => 
        habit.completionRate < (worst?.completionRate || 100) ? habit : worst, null)
    : null;

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <h3>Loading analytics...</h3>
          <div className="spinner">⏳</div>
        </div>
      </div>
    );
  }

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
          </select>
          
          <select 
            value={selectedHabit} 
            onChange={(e) => setSelectedHabit(e.target.value)}
            className="habit-filter-select"
          >
            <option value="all">All Habits</option>
            {habits.map(habit => (
              <option key={habit._id} value={habit._id}>{habit.name}</option>
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
                          height: `${Math.max(day.percentage, 2)}%`,
                          backgroundColor: 
                            day.percentage >= 80 ? '#10b981' : 
                            day.percentage >= 60 ? '#f59e0b' : 
                            day.percentage >= 40 ? '#ef4444' : '#94a3b8'
                        }}
                      />
                      <div className="bar-label">
                        {day.displayDate}
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
                <div key={habit._id} className={`performance-card ${habit.color || ''}`}>
                  <div className="performance-header">
                    <span className="habit-icon">{habit.icon || '📝'}</span>
                    <h4>{habit.name}</h4>
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
              {Object.entries(analyticsData.categoryStats).map(([category, stats]) => {
                const categoryCompletionRate = stats.possible > 0 
                  ? Math.round((stats.completions / stats.possible) * 100) 
                  : 0;
                
                return (
                  <div key={category} className="category-card">
                    <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <div className="category-stats">
                      <div className="category-stat">
                        <span>Habits</span>
                        <span>{stats.count}</span>
                      </div>
                      <div className="category-stat">
                        <span>Completion Rate</span>
                        <span>{categoryCompletionRate}%</span>
                      </div>
                      <div className="category-stat">
                        <span>Total Completions</span>
                        <span>{stats.completions}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    <p><strong>{bestHabit.name}</strong> is your most consistent habit with a {bestHabit.completionRate}% completion rate!</p>
                  </div>
                </div>
              )}
              
              {worstHabit && worstHabit.completionRate < 50 && (
                <div className="insight-card warning">
                  <div className="insight-icon">⚠️</div>
                  <div className="insight-content">
                    <h4>Needs Attention</h4>
                    <p><strong>{worstHabit.name}</strong> has a {worstHabit.completionRate}% completion rate. Consider adjusting your approach or schedule.</p>
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
