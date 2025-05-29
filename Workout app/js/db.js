// Database Utilities for FitTrack
// This file provides an abstraction layer over localStorage to simulate a database

// Database Schema
/*
Users: {
  id: string,
  name: string,
  email: string,
  password: string (hashed),
  createdAt: ISO date string,
  bmiHistory: [
    {
      date: ISO date string,
      bmi: number,
      category: string
    }
  ],
  workoutPlan: {
    type: string,
    exercises: [...],
    startDate: ISO date string
  },
  dietPlan: {
    type: string,
    meals: [...],
    startDate: ISO date string
  },
  goals: [
    {
      id: string,
      title: string,
      description: string,
      targetDate: ISO date string,
      date: ISO date string,
      progress: number,
      completed: boolean
    }
  ]
}
*/

class Database {
  constructor() {
    this.initDatabase();
  }

  // Initialize database with default values if it doesn't exist
  initDatabase() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
  }

  // User operations
  getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      bmiHistory: [],
      workoutPlan: null,
      dietPlan: null,
      goals: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  }

  updateUser(userId, userData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return null;
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...userData
    };
    
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    
    return updatedUser;
  }

  deleteUser(userId) {
    const users = this.getUsers();
    const updatedUsers = users.filter(user => user.id !== userId);
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return true;
  }

  // BMI operations
  addBMIRecord(userId, bmiData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return null;
    }
    
    const bmiRecord = {
      date: new Date().toISOString(),
      ...bmiData
    };
    
    users[userIndex].bmiHistory = users[userIndex].bmiHistory || [];
    users[userIndex].bmiHistory.push(bmiRecord);
    
    localStorage.setItem('users', JSON.stringify(users));
    return bmiRecord;
  }

  getBMIHistory(userId) {
    const user = this.getUserById(userId);
    return user ? (user.bmiHistory || []) : [];
  }

  // Goal operations
  getGoals(userId) {
    const user = this.getUserById(userId);
    return user ? (user.goals || []) : [];
  }

  addGoal(userId, goalData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return null;
    }
    
    const goal = {
      id: this.generateId(),
      date: new Date().toISOString(),
      progress: 0,
      completed: false,
      ...goalData
    };
    
    users[userIndex].goals = users[userIndex].goals || [];
    users[userIndex].goals.push(goal);
    
    localStorage.setItem('users', JSON.stringify(users));
    return goal;
  }

  updateGoal(userId, goalId, goalData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return null;
    }
    
    const goalIndex = users[userIndex].goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      return null;
    }
    
    users[userIndex].goals[goalIndex] = {
      ...users[userIndex].goals[goalIndex],
      ...goalData
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    return users[userIndex].goals[goalIndex];
  }

  deleteGoal(userId, goalId) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return false;
    }
    
    users[userIndex].goals = users[userIndex].goals.filter(goal => goal.id !== goalId);
    
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  // Workout plan operations
  setWorkoutPlan(userId, planData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return null;
    }
    
    const workoutPlan = {
      startDate: new Date().toISOString(),
      ...planData
    };
    
    users[userIndex].workoutPlan = workoutPlan;
    
    localStorage.setItem('users', JSON.stringify(users));
    return workoutPlan;
  }

  getWorkoutPlan(userId) {
    const user = this.getUserById(userId);
    return user ? user.workoutPlan : null;
  }

  // Diet plan operations
  setDietPlan(userId, planData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return null;
    }
    
    const dietPlan = {
      startDate: new Date().toISOString(),
      ...planData
    };
    
    users[userIndex].dietPlan = dietPlan;
    
    localStorage.setItem('users', JSON.stringify(users));
    return dietPlan;
  }

  getDietPlan(userId) {
    const user = this.getUserById(userId);
    return user ? user.dietPlan : null;
  }

  // Helper methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Session management
  getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  setCurrentUser(user) {
    // Remove password before storing for security
    const { password, ...secureUser } = user;
    localStorage.setItem('currentUser', JSON.stringify(secureUser));
  }

  clearCurrentUser() {
    localStorage.removeItem('currentUser');
  }
}

// Create and export the database instance
const db = new Database();

// Initialize the database with sample data if it's empty
function initSampleData() {
  const users = db.getUsers();
  
  if (users.length === 0) {
    // Add sample user
    db.createUser({
      name: 'John Doe',
      email: 'demo@example.com',
      password: hashPassword('password123'),
      bmiHistory: [
        { date: '2023-01-01T12:00:00.000Z', bmi: 26.5, category: 'Overweight' },
        { date: '2023-02-01T12:00:00.000Z', bmi: 25.8, category: 'Overweight' },
        { date: '2023-03-01T12:00:00.000Z', bmi: 24.9, category: 'Normal weight' },
        { date: '2023-04-01T12:00:00.000Z', bmi: 24.2, category: 'Normal weight' }
      ],
      goals: [
        {
          id: 'goal1',
          title: 'Lose 5kg',
          description: 'Reach target weight of 75kg by consistent exercise and diet',
          targetDate: '2023-12-31',
          date: '2023-01-15T12:00:00.000Z',
          progress: 80,
          completed: false
        },
        {
          id: 'goal2',
          title: 'Run 5km',
          description: 'Be able to run 5km without stopping',
          targetDate: '2023-06-30',
          date: '2023-01-15T12:00:00.000Z',
          progress: 100,
          completed: true
        }
      ]
    });
  }
}

// Hash password (simple version - in a real app, use a proper hashing library)
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Initialize sample data
initSampleData(); 