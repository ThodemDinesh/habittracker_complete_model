import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Build Better Habits</h1>
        <p>Track your daily habits and build a better version of yourself</p>
        <Link to="/habits" className="cta-button">
          Get Started
        </Link>
      </div>
      
      <div className="features-section">
        <div className="feature">
          <h3>📊 Track Progress</h3>
          <p>Visualize your habit completion with beautiful charts</p>
        </div>
        <div className="feature">
          <h3>🔥 Build Streaks</h3>
          <p>Maintain consistency and build long-lasting streaks</p>
        </div>
        <div className="feature">
          <h3>📱 Simple Interface</h3>
          <p>Clean and intuitive design for effortless tracking</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
