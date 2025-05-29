/*
 * MySQL Database Connection Utility for FitTrack
 * 
 * This file provides a bridge between the client-side application and MySQL server.
 * It's structured to enable you to replace the localStorage-based db.js with actual 
 * MySQL database operations in the future.
 * 
 * Implementation Note: This is just a template showing how you would set up MySQL connections.
 * In a real production app, the actual database connection and operations would happen on the server-side
 * (Node.js, Express, etc.) and not directly from the client for security reasons.
 */

// MySQL Schema Design

/*
CREATE DATABASE fittrack;

USE fittrack;

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bmi_records (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  bmi DECIMAL(4,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE goals (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  progress INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE workout_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  description TEXT,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE workout_exercises (
  id VARCHAR(36) PRIMARY KEY,
  plan_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  sets INT NOT NULL,
  reps INT NOT NULL,
  day_of_week VARCHAR(15) NOT NULL,
  notes TEXT,
  FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
);

CREATE TABLE diet_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  description TEXT,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE diet_meals (
  id VARCHAR(36) PRIMARY KEY,
  plan_id VARCHAR(36) NOT NULL,
  meal_type VARCHAR(50) NOT NULL,
  food_items TEXT NOT NULL,
  calories INT,
  proteins DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fats DECIMAL(5,2),
  FOREIGN KEY (plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE
);
*/

// MySQL Connection Example - for future implementation on server-side

/*
// Using Node.js with MySQL

const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'fittrack_user',
  password: 'your_password_here',
  database: 'fittrack',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// User operations
async function getUserByEmail(email) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

async function createUser(userData) {
  try {
    const { name, email, password } = userData;
    const userId = generateUUID();
    
    await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [userId, name, email, password]
    );
    
    return getUserById(userId);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// BMI operations
async function addBMIRecord(userId, bmiData) {
  try {
    const { bmi, category, weight, height } = bmiData;
    const recordId = generateUUID();
    
    await pool.query(
      'INSERT INTO bmi_records (id, user_id, bmi, category, weight, height) VALUES (?, ?, ?, ?, ?, ?)',
      [recordId, userId, bmi, category, weight, height]
    );
    
    return getBMIRecordById(recordId);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

async function getBMIHistory(userId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM bmi_records WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
*/

// Client-side API for future MySQL integration
class MySQLAPIClient {
  constructor() {
    this.apiBaseUrl = '/api'; // Base URL for your server's API endpoints
  }
  
  // Authentication
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
  
  async register(userData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
  
  // User operations
  async getCurrentUser() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
  
  // BMI operations
  async addBMIRecord(bmiData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/bmi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(bmiData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
  
  async getBMIHistory() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/bmi/history`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
  
  // Goal operations
  async getGoals() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/goals`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
  
  async addGoal(goalData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(goalData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
  
  async updateGoal(goalId, goalData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(goalData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
  
  async deleteGoal(goalId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
  
  // Helper methods
  getToken() {
    return localStorage.getItem('authToken');
  }
  
  setToken(token) {
    localStorage.setItem('authToken', token);
  }
  
  clearToken() {
    localStorage.removeItem('authToken');
  }
}

// Create instance (to be used when ready to switch from localStorage to MySQL)
const mysqlAPI = new MySQLAPIClient(); 