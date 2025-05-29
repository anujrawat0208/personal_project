/*
 * MongoDB Database Connection Utility for FitTrack
 * 
 * This file provides the connection and operations for MongoDB database
 * to replace the localStorage-based db.js implementation.
 */

// MongoDB Connection
class MongoDBConnection {
  constructor() {
    // In a real application, this would be your MongoDB connection
    // But for client-side demo, we will simulate MongoDB behavior 
    // using localStorage and provide MongoDB-like API methods
    this.initDatabase();
    
    // Demo message
    console.log('MongoDB connection established (simulated)');
  }

  // Initialize database
  initDatabase() {
    // Initialize collections if they don't exist
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('bmi_records')) {
      localStorage.setItem('bmi_records', JSON.stringify([]));
    }
    if (!localStorage.getItem('goals')) {
      localStorage.setItem('goals', JSON.stringify([]));
    }
    if (!localStorage.getItem('workout_plans')) {
      localStorage.setItem('workout_plans', JSON.stringify([]));
    }
    if (!localStorage.getItem('diet_plans')) {
      localStorage.setItem('diet_plans', JSON.stringify([]));
    }
  }

  // MongoDB-like API

  // Find one document
  async findOne(collection, query) {
    const data = JSON.parse(localStorage.getItem(collection)) || [];
    
    // Simple query handling
    for (const item of data) {
      let match = true;
      
      for (const [key, value] of Object.entries(query)) {
        // Handle nested properties with dot notation
        if (key.includes('.')) {
          const parts = key.split('.');
          let nestedValue = item;
          
          for (const part of parts) {
            if (nestedValue && nestedValue[part] !== undefined) {
              nestedValue = nestedValue[part];
            } else {
              nestedValue = undefined;
              break;
            }
          }
          
          if (nestedValue !== value) {
            match = false;
            break;
          }
        } else if (item[key] !== value) {
          match = false;
          break;
        }
      }
      
      if (match) {
        return item;
      }
    }
    
    return null;
  }

  // Find many documents
  async find(collection, query = {}) {
    const data = JSON.parse(localStorage.getItem(collection)) || [];
    
    if (Object.keys(query).length === 0) {
      return data;
    }
    
    return data.filter(item => {
      for (const [key, value] of Object.entries(query)) {
        if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  // Insert one document
  async insertOne(collection, document) {
    const data = JSON.parse(localStorage.getItem(collection)) || [];
    
    // MongoDB-like behavior: add _id if not present
    if (!document._id) {
      document._id = this.generateObjectId();
    }
    
    // Add timestamp
    document.createdAt = document.createdAt || new Date().toISOString();
    
    data.push(document);
    localStorage.setItem(collection, JSON.stringify(data));
    
    return { 
      acknowledged: true, 
      insertedId: document._id 
    };
  }

  // Update one document
  async updateOne(collection, query, update) {
    const data = JSON.parse(localStorage.getItem(collection)) || [];
    let updated = false;
    
    for (let i = 0; i < data.length; i++) {
      let match = true;
      
      for (const [key, value] of Object.entries(query)) {
        if (data[i][key] !== value) {
          match = false;
          break;
        }
      }
      
      if (match) {
        // Handle MongoDB update operators
        if (update.$set) {
          for (const [key, value] of Object.entries(update.$set)) {
            data[i][key] = value;
          }
        }
        
        if (update.$push) {
          for (const [key, value] of Object.entries(update.$push)) {
            if (!Array.isArray(data[i][key])) {
              data[i][key] = [];
            }
            data[i][key].push(value);
          }
        }
        
        // If no operators, replace the document
        if (!update.$set && !update.$push) {
          const { _id } = data[i];
          data[i] = { ...update, _id };
        }
        
        updated = true;
        break;
      }
    }
    
    if (updated) {
      localStorage.setItem(collection, JSON.stringify(data));
      return { acknowledged: true, modifiedCount: 1 };
    }
    
    return { acknowledged: true, modifiedCount: 0 };
  }

  // Delete one document
  async deleteOne(collection, query) {
    const data = JSON.parse(localStorage.getItem(collection)) || [];
    const originalLength = data.length;
    
    const filteredData = data.filter(item => {
      for (const [key, value] of Object.entries(query)) {
        if (item[key] === value) {
          return false;
        }
      }
      return true;
    });
    
    localStorage.setItem(collection, JSON.stringify(filteredData));
    
    return { 
      acknowledged: true, 
      deletedCount: originalLength - filteredData.length 
    };
  }

  // Helper methods
  generateObjectId() {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
      return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
  }
}

// User operations
class UserService {
  constructor(db) {
    this.db = db;
    this.collection = 'users';
  }

  async findByEmail(email) {
    return await this.db.findOne(this.collection, { email });
  }

  async findById(id) {
    return await this.db.findOne(this.collection, { _id: id });
  }

  async create(userData) {
    // Hash password before storing
    userData.password = this.hashPassword(userData.password);
    
    // Add default user properties
    userData.bmiHistory = [];
    userData.workoutPlan = null;
    userData.dietPlan = null;
    userData.goals = [];
    
    const result = await this.db.insertOne(this.collection, userData);
    if (result.acknowledged) {
      return await this.findById(result.insertedId);
    }
    return null;
  }

  async update(id, userData) {
    // Don't allow password update through this method
    if (userData.password) {
      delete userData.password;
    }
    
    await this.db.updateOne(
      this.collection,
      { _id: id },
      { $set: userData }
    );
    
    return await this.findById(id);
  }

  async updatePassword(id, newPassword) {
    const hashedPassword = this.hashPassword(newPassword);
    
    await this.db.updateOne(
      this.collection,
      { _id: id },
      { $set: { password: hashedPassword } }
    );
    
    return true;
  }
  
  // Hash password (simple version - in a real app, use a proper hashing library)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
  
  verifyPassword(inputPassword, storedPassword) {
    return this.hashPassword(inputPassword) === storedPassword;
  }
}

// BMI records operations
class BMIService {
  constructor(db) {
    this.db = db;
    this.collection = 'users'; // We store BMI in user document
  }

  async addRecord(userId, bmiData) {
    const record = {
      date: new Date().toISOString(),
      ...bmiData
    };
    
    await this.db.updateOne(
      this.collection,
      { _id: userId },
      { $push: { bmiHistory: record } }
    );
    
    return record;
  }

  async getHistory(userId) {
    const user = await this.db.findOne(this.collection, { _id: userId });
    return user ? (user.bmiHistory || []) : [];
  }
}

// Goals operations
class GoalService {
  constructor(db) {
    this.db = db;
    this.collection = 'users'; // We store goals in user document
  }

  async getAll(userId) {
    const user = await this.db.findOne(this.collection, { _id: userId });
    return user ? (user.goals || []) : [];
  }

  async add(userId, goalData) {
    const goal = {
      id: this.db.generateObjectId(),
      date: new Date().toISOString(),
      progress: 0,
      completed: false,
      ...goalData
    };
    
    await this.db.updateOne(
      this.collection,
      { _id: userId },
      { $push: { goals: goal } }
    );
    
    return goal;
  }

  async update(userId, goalId, goalData) {
    const user = await this.db.findOne(this.collection, { _id: userId });
    if (!user || !user.goals) {
      return null;
    }
    
    const goalIndex = user.goals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) {
      return null;
    }
    
    user.goals[goalIndex] = {
      ...user.goals[goalIndex],
      ...goalData
    };
    
    await this.db.updateOne(
      this.collection,
      { _id: userId },
      { $set: { goals: user.goals } }
    );
    
    return user.goals[goalIndex];
  }

  async remove(userId, goalId) {
    const user = await this.db.findOne(this.collection, { _id: userId });
    if (!user || !user.goals) {
      return false;
    }
    
    const updatedGoals = user.goals.filter(goal => goal.id !== goalId);
    
    await this.db.updateOne(
      this.collection,
      { _id: userId },
      { $set: { goals: updatedGoals } }
    );
    
    return true;
  }
}

// Create and export the MongoDB connection and services
const mongodb = new MongoDBConnection();
const userService = new UserService(mongodb);
const bmiService = new BMIService(mongodb);
const goalService = new GoalService(mongodb);

// Initialize with sample data if empty
async function initSampleData() {
  const users = await mongodb.find('users');
  
  if (users.length === 0) {
    // Add sample user
    const sampleUser = {
      name: 'John Doe',
      email: 'demo@example.com',
      password: userService.hashPassword('password123'),
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
    };
    
    await userService.create(sampleUser);
    console.log('Sample data initialized');
  }
}

// Initialize sample data
initSampleData();

// Export the services
window.mongodb = mongodb;
window.userService = userService;
window.bmiService = bmiService;
window.goalService = goalService; 