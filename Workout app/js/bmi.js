// BMI Calculator functionality
class BMICalculator {
  constructor() {
    this.weightInput = document.getElementById('weight');
    this.heightInput = document.getElementById('height');
    this.ageInput = document.getElementById('age');
    this.genderInputs = document.getElementsByName('gender');
    this.calculateBtn = document.getElementById('calculateBMI');
    this.resultElement = document.getElementById('bmiResult');
    this.bmiValueElement = document.getElementById('bmiValue');
    this.bmiCategoryElement = document.getElementById('bmiCategory');
    this.recommendationsElement = document.getElementById('recommendations');
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    if (this.calculateBtn) {
      this.calculateBtn.addEventListener('click', this.calculateBMI.bind(this));
    }
  }
  
  getSelectedGender() {
    for (const radio of this.genderInputs) {
      if (radio.checked) {
        return radio.value;
      }
    }
    return 'male'; // Default
  }
  
  async calculateBMI(event) {
    if (event) event.preventDefault();
    
    // Get values
    const weight = parseFloat(this.weightInput.value);
    const height = parseFloat(this.heightInput.value) / 100; // Convert cm to m
    const age = parseInt(this.ageInput.value);
    const gender = this.getSelectedGender();
    
    // Validate inputs
    if (isNaN(weight) || isNaN(height) || isNaN(age) || height === 0) {
      alert('Please enter valid values for weight, height, and age.');
      return;
    }
    
    // Calculate BMI
    const bmi = weight / (height * height);
    const roundedBMI = Math.round(bmi * 10) / 10;
    
    // Determine BMI category
    const category = this.getBMICategory(roundedBMI);
    
    // Show result
    this.bmiValueElement.textContent = roundedBMI;
    this.bmiCategoryElement.textContent = category.label;
    this.bmiCategoryElement.className = `bmi-category ${category.class}`;
    
    // Generate recommendations
    this.generateRecommendations(roundedBMI, age, gender);
    
    // Display result box
    this.resultElement.style.display = 'block';
    
    // Save BMI to user history
    await this.saveBMIToHistory(roundedBMI, category.label, weight, height);
  }
  
  getBMICategory(bmi) {
    if (bmi < 18.5) {
      return { label: 'Underweight', class: 'underweight' };
    } else if (bmi >= 18.5 && bmi < 25) {
      return { label: 'Normal weight', class: 'normal' };
    } else if (bmi >= 25 && bmi < 30) {
      return { label: 'Overweight', class: 'overweight' };
    } else {
      return { label: 'Obesity', class: 'obese' };
    }
  }
  
  generateRecommendations(bmi, age, gender) {
    let workoutPlan = '';
    let dietPlan = '';
    
    // Generate recommendations based on BMI category, age, and gender
    if (bmi < 18.5) {
      // Underweight recommendations
      workoutPlan = `
        <h4>Recommended Workout Plan:</h4>
        <ul>
          <li>Strength training 3-4 days per week focusing on compound movements</li>
          <li>Limited cardio (1-2 sessions per week, 20-30 minutes each)</li>
          <li>Focus on progressive overload to build muscle mass</li>
          <li>Include exercises like squats, deadlifts, bench press, and rows</li>
        </ul>
      `;
      
      dietPlan = `
        <h4>Recommended Diet Plan:</h4>
        <ul>
          <li>Caloric surplus of 300-500 calories above maintenance</li>
          <li>High protein intake (1.6-2.2g per kg of body weight)</li>
          <li>Frequent meals (5-6 per day)</li>
          <li>Include calorie-dense foods like nuts, avocados, and olive oil</li>
          <li>Protein shakes between meals</li>
        </ul>
      `;
    } else if (bmi >= 18.5 && bmi < 25) {
      // Normal weight recommendations
      workoutPlan = `
        <h4>Recommended Workout Plan:</h4>
        <ul>
          <li>Balanced approach with strength training 3 days per week</li>
          <li>Moderate cardio 2-3 days per week (30 minutes each)</li>
          <li>Include flexibility and mobility work</li>
          <li>Mix of compound and isolation exercises</li>
          <li>Consider adding HIIT workouts for variety</li>
        </ul>
      `;
      
      dietPlan = `
        <h4>Recommended Diet Plan:</h4>
        <ul>
          <li>Maintenance calories with focus on nutrient-dense foods</li>
          <li>Balanced macronutrient ratio (30% protein, 40% carbs, 30% fats)</li>
          <li>Regular meal timing (3-4 meals per day)</li>
          <li>Emphasize whole foods and limit processed foods</li>
          <li>Stay hydrated (at least 8 glasses of water daily)</li>
        </ul>
      `;
    } else if (bmi >= 25 && bmi < 30) {
      // Overweight recommendations
      workoutPlan = `
        <h4>Recommended Workout Plan:</h4>
        <ul>
          <li>Strength training 2-3 days per week</li>
          <li>Increased cardio 3-4 days per week (30-45 minutes each)</li>
          <li>Include HIIT workouts 1-2 times per week</li>
          <li>Focus on full-body workouts to maximize calorie burn</li>
          <li>Add daily walking (10,000 steps goal)</li>
        </ul>
      `;
      
      dietPlan = `
        <h4>Recommended Diet Plan:</h4>
        <ul>
          <li>Moderate caloric deficit (300-500 calories below maintenance)</li>
          <li>Higher protein intake (1.8-2.2g per kg of ideal body weight)</li>
          <li>Reduced carbohydrate intake, especially refined carbs</li>
          <li>Increased fiber intake from vegetables and fruits</li>
          <li>Meal prepping to control portions and avoid impulsive eating</li>
        </ul>
      `;
    } else {
      // Obese recommendations
      workoutPlan = `
        <h4>Recommended Workout Plan:</h4>
        <ul>
          <li>Start with low-impact activities like walking, swimming, or cycling</li>
          <li>Gradually build up to 150+ minutes of cardio per week</li>
          <li>Add resistance training 2 days per week with focus on form</li>
          <li>Include flexibility exercises to improve mobility</li>
          <li>Consider working with a fitness professional for guidance</li>
        </ul>
      `;
      
      dietPlan = `
        <h4>Recommended Diet Plan:</h4>
        <ul>
          <li>Structured eating plan with moderate caloric deficit (500-750 calories below maintenance)</li>
          <li>Focus on whole, unprocessed foods</li>
          <li>Increased protein and fiber intake to promote satiety</li>
          <li>Limit added sugars and refined carbohydrates</li>
          <li>Consider consulting with a registered dietitian</li>
        </ul>
      `;
    }
    
    // Age-specific adjustments
    if (age < 18) {
      workoutPlan += `
        <p class="recommendation-note">Note for teens: Focus on skill development and don't overdo intense training. Ensure adequate nutrition for growth.</p>
      `;
    } else if (age > 50) {
      workoutPlan += `
        <p class="recommendation-note">Note for 50+: Include more joint-friendly exercises and focus on maintaining muscle mass. Recovery between workouts is important.</p>
      `;
    }
    
    // Gender-specific adjustments
    if (gender === 'female') {
      dietPlan += `
        <p class="recommendation-note">Women may need to pay special attention to iron, calcium, and vitamin D intake for optimal health.</p>
      `;
    }
    
    this.recommendationsElement.innerHTML = workoutPlan + dietPlan;
  }
  
  async saveBMIToHistory(bmi, category, weight, height) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    
    // Create BMI record
    const bmiRecord = {
      bmi,
      category,
      weight,
      height
    };
    
    // Save to database using BMI service
    try {
      await bmiService.addRecord(currentUser._id, bmiRecord);
      
      // If we have a dashboard with chart, update it
      if (typeof updateBMIChart === 'function') {
        updateBMIChart();
      }
    } catch (error) {
      console.error('Error saving BMI record:', error);
    }
  }
  
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}

// Initialize BMI calculator
document.addEventListener('DOMContentLoaded', () => {
  new BMICalculator();
}); 