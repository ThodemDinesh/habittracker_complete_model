
````markdown
# 🧠 HabitTracker

A full-stack habit tracking web application designed to help users build good habits and break bad ones through structured tracking, reminders, and real-time progress analytics. Built with the **MERN stack** (MongoDB, Express.js, React, Node.js), it features secure authentication, a rich dashboard, and customizable settings — all free and accessible.

---

## 🚀 Tech Stack

### 🖥️ Frontend
- React.js  
- React Router DOM  
- React Icons  
- React Hot Toast  
- date-fns

### ⚙️ Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT Authentication  
- bcryptjs  
- dotenv   
- node-cron  
- CORS

---

## 📦 Installation & Setup (Local)

### 🔧 Prerequisites
- [Node.js](https://nodejs.org/) & npm
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 📥 Clone the Repository
```bash
git clone https://github.com/your-username/habitracker.git
cd habitracker
````

### ⚙️ Setup Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 💻 Setup Frontend

```bash
cd ..
npm install
npm start
```

---

## 🔧 Features

* ✅ User Registration & JWT-based Login
* ✅ Add / Update / Delete Habits
* ✅ Daily Habit Completion Tracker
* ✅ Analytics Dashboard with Insights
* ✅ Real-Time Progress Updates
* ✅ Email Notification System
* ✅ Theme Toggle & Protected Routes

---

## 🧪 Usage Flow

1. **Sign Up** with your email & password
2. **Login** to your personalized dashboard
3. **Create & Track Habits** daily
4. Visualize progress on the **Analytics** page
5. Customize your experience in **Settings**

---

## 📁 Folder Structure

```
project-root/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── habitController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Habit.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── habits.js
│   ├── services/
│   │   └── notificationService.js
│   ├── .env
│   └── app.js

├── public/
│   └── ...

├── src/
│   ├── components/
│   │   ├── habits/
│   │   │   ├── habitCard.jsx
│   │   │   └── habitForm.jsx
│   │   ├── layout/
│   │   │   └── Header.jsx
│   │   ├── authWrapper.js
│   │   └── ProtectedRoute.js
│   │
│   ├── context/
│   │   ├── authContext.js
│   │   ├── habitContext.jsx
│   │   ├── notificationContext.js
│   │   └── themeContext.js
│   │
│   ├── pages/
│   │   ├── Analytics.jsx
│   │   ├── Auth.css
│   │   ├── Dashboard.jsx
│   │   ├── HabitsPage.jsx
│   │   ├── Home.jsx
│   │   ├── Login.js
│   │   ├── Settings.jsx
│   │   └── Signup.js
│   │
│   ├── reducers/
│   │   └── habitReducer.js
│   ├── utils/
│   │   ├── dateUtil.js
│   │   └── habitUtils.js
│   ├── .env
│   └── app.js
```

---

## 🎯 Project Motivation

While exploring habit-tracking tools, I noticed most quality apps were locked behind paywalls. To make habit tracking accessible for everyone, I built this free and open-source alternative focused on simplicity, analytics, and user control.

---

## 🧠 Future Scope

* [ ] Push Notifications
* [ ] Habit Streak Rewards System
* [ ] Social Sharing of Achievements
* [ ] Mobile App using React Native

---

## 🙋 Author

**Developed by [THODEM VENKATA DINESH REDDY](https://github.com/ThodemDinesh)**
Open to contributions, feedback, or collaboration.
Feel free to fork the repo, open issues, or reach out!

---

⭐ If you found this helpful or interesting, please give the repository a star!


