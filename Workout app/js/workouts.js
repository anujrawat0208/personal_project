// Workouts JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize workouts page
  initWorkoutsPage();
  
  // Set up filter options
  setupFilters();
});

// Initialize workouts page
function initWorkoutsPage() {
  // Load workout data
  const workouts = getWorkoutData();
  
  // Get current user for recommendations
  const currentUser = getCurrentUser();
  
  if (currentUser) {
    // Load recommended workouts based on BMI and user profile
    loadRecommendedWorkouts(workouts, currentUser);
  }
  
  // Load all workouts
  loadAllWorkouts(workouts);
}

// Set up filter functionality
function setupFilters() {
  const filterOptions = document.querySelectorAll('.filter-option');
  
  filterOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove active class from all filters
      filterOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to selected filter
      this.classList.add('active');
      
      // Get filter value
      const filter = this.getAttribute('data-filter');
      
      // Apply filter
      filterWorkouts(filter);
    });
  });
}

// Filter workouts based on selected criteria
function filterWorkouts(filter) {
  const workoutCards = document.querySelectorAll('.workout-card');
  
  workoutCards.forEach(card => {
    if (filter === 'all') {
      card.style.display = 'block';
    } else {
      const tags = card.getAttribute('data-tags').split(',');
      
      if (tags.includes(filter)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

// Load recommended workouts based on user profile
function loadRecommendedWorkouts(workouts, user) {
  const recommendedContainer = document.getElementById('recommendedWorkouts');
  if (!recommendedContainer) return;
  
  // Get BMI history if available
  let userBMI = null;
  let fitnessGoal = 'general';
  
  if (user.bmiHistory && user.bmiHistory.length > 0) {
    // Get most recent BMI record
    const latestBMI = user.bmiHistory[user.bmiHistory.length - 1];
    userBMI = latestBMI.bmi;
  }
  
  // Determine user's fitness profile for recommendations
  if (user.goals && user.goals.length > 0) {
    // Try to infer fitness goal from user's goals
    for (const goal of user.goals) {
      if (goal.title.toLowerCase().includes('weight loss') || 
          goal.title.toLowerCase().includes('lose weight')) {
        fitnessGoal = 'weight-loss';
        break;
      } else if (goal.title.toLowerCase().includes('muscle') || 
                goal.title.toLowerCase().includes('strength')) {
        fitnessGoal = 'muscle-gain';
        break;
      }
    }
  }
  
  // Filter workouts based on BMI and goals
  let recommendedWorkouts = [];
  
  if (userBMI !== null) {
    if (userBMI < 18.5) {
      // Underweight - recommend muscle building workouts
      recommendedWorkouts = workouts.filter(workout => 
        workout.tags.includes('muscle-gain') || 
        workout.tags.includes('strength')
      );
    } else if (userBMI >= 25) {
      // Overweight - recommend weight loss workouts
      recommendedWorkouts = workouts.filter(workout => 
        workout.tags.includes('weight-loss') || 
        workout.tags.includes('cardio') || 
        workout.tags.includes('hiit')
      );
    } else {
      // Normal weight - recommend general fitness or specific goal workouts
      recommendedWorkouts = workouts.filter(workout => 
        workout.tags.includes(fitnessGoal) || 
        workout.tags.includes('general')
      );
    }
  } else {
    // No BMI data - recommend based on fitness goal or beginner workouts
    recommendedWorkouts = workouts.filter(workout => 
      workout.tags.includes(fitnessGoal) || 
      workout.tags.includes('beginner')
    );
  }
  
  // Limit to 3 recommendations
  recommendedWorkouts = recommendedWorkouts.slice(0, 3);
  
  // Render recommended workouts
  if (recommendedWorkouts.length === 0) {
    recommendedContainer.innerHTML = '<p class="no-data-message">No recommended workouts yet. Complete your BMI assessment for personalized recommendations.</p>';
  } else {
    recommendedContainer.innerHTML = recommendedWorkouts.map(workout => createWorkoutCard(workout)).join('');
  }
}

// Load all workouts
function loadAllWorkouts(workouts) {
  const allWorkoutsContainer = document.getElementById('allWorkouts');
  if (!allWorkoutsContainer) return;
  
  // Render all workouts
  allWorkoutsContainer.innerHTML = workouts.map(workout => createWorkoutCard(workout)).join('');
}

// Create workout card HTML
function createWorkoutCard(workout) {
  return `
    <div class="workout-card" data-tags="${workout.tags.join(',')}">
      <div class="workout-image">
        <img src="${workout.image}" alt="${workout.title}">
      </div>
      <div class="workout-content">
        <h3 class="workout-title">${workout.title}</h3>
        <div class="workout-meta">
          <div class="workout-meta-item">
            <i class="fas fa-dumbbell"></i>
            <span>${workout.level}</span>
          </div>
          <div class="workout-meta-item">
            <i class="fas fa-clock"></i>
            <span>${workout.duration}</span>
          </div>
          <div class="workout-meta-item">
            <i class="fas fa-fire"></i>
            <span>${workout.calories} cal</span>
          </div>
        </div>
        <p class="workout-description">${workout.description}</p>
        <div class="workout-tags">
          ${workout.tags.map(tag => `<span class="workout-tag">${tag}</span>`).join('')}
        </div>
        <div class="workout-actions">
          <button class="btn btn-primary view-workout" data-id="${workout.id}">View Details</button>
          <button class="btn btn-outline save-workout" data-id="${workout.id}">
            <i class="far fa-bookmark"></i> Save
          </button>
        </div>
      </div>
    </div>
  `;
}

// Get current user from session
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Get workout data
function getWorkoutData() {
  // In a real app, this would come from an API or database
  return [
    {
      id: 'w1',
      title: 'Full Body Strength',
      level: 'Beginner',
      duration: '45 min',
      calories: 350,
      description: 'A full body workout focusing on the major muscle groups. Perfect for beginners looking to build strength.',
      image: 'assets/workout.jpg',
      tags: ['beginner', 'strength', 'full-body', 'muscle-gain'],
      exercises: [
        { name: 'Squats', sets: 3, reps: 10, rest: '60 sec' },
        { name: 'Push-ups', sets: 3, reps: 8, rest: '60 sec' },
        { name: 'Dumbbell Rows', sets: 3, reps: 10, rest: '60 sec' },
        { name: 'Lunges', sets: 3, reps: 10, rest: '60 sec' },
        { name: 'Plank', sets: 3, duration: '30 sec', rest: '60 sec' }
      ]
    },
    {
      id: 'w2',
      title: 'HIIT Cardio Burn',
      level: 'Intermediate',
      duration: '30 min',
      calories: 400,
      description: 'High-intensity interval training to maximize calorie burn and improve cardiovascular fitness.',
      image: 'assets/workout.jpg',
      tags: ['intermediate', 'hiit', 'cardio', 'weight-loss'],
      exercises: [
        { name: 'Jumping Jacks', duration: '45 sec', rest: '15 sec' },
        { name: 'Mountain Climbers', duration: '45 sec', rest: '15 sec' },
        { name: 'Burpees', duration: '45 sec', rest: '15 sec' },
        { name: 'High Knees', duration: '45 sec', rest: '15 sec' },
        { name: 'Jump Squats', duration: '45 sec', rest: '15 sec' }
      ]
    },
    {
      id: 'w3',
      title: 'Advanced Strength & Power',
      level: 'Advanced',
      duration: '60 min',
      calories: 500,
      description: 'Challenging workout designed to build serious strength and power for experienced fitness enthusiasts.',
      image: 'assets/workout.jpg',
      tags: ['advanced', 'strength', 'power', 'muscle-gain'],
      exercises: [
        { name: 'Barbell Squats', sets: 4, reps: 8, rest: '90 sec' },
        { name: 'Deadlifts', sets: 4, reps: 6, rest: '90 sec' },
        { name: 'Bench Press', sets: 4, reps: 8, rest: '90 sec' },
        { name: 'Pull-ups', sets: 4, reps: 8, rest: '90 sec' },
        { name: 'Shoulder Press', sets: 4, reps: 8, rest: '90 sec' }
      ]
    },
    {
      id: 'w4',
      title: 'Yoga for Flexibility',
      level: 'All Levels',
      duration: '40 min',
      calories: 200,
      description: 'Improve flexibility, balance, and reduce stress with this yoga routine suitable for all fitness levels.',
      image: 'assets/workout.jpg',
      tags: ['beginner', 'flexibility', 'yoga', 'general'],
      exercises: [
        { name: 'Sun Salutation', repetitions: 5 },
        { name: 'Downward Dog', hold: '60 sec' },
        { name: 'Warrior Poses', hold: '45 sec per side' },
        { name: 'Seated Forward Bend', hold: '60 sec' },
        { name: 'Corpse Pose', hold: '5 min' }
      ]
    },
    {
      id: 'w5',
      title: 'Core Crusher',
      level: 'Intermediate',
      duration: '25 min',
      calories: 250,
      description: 'Focus on building a strong core with this targeted ab and core workout routine.',
      image: 'assets/workout.jpg',
      tags: ['intermediate', 'core', 'strength', 'general'],
      exercises: [
        { name: 'Crunches', sets: 3, reps: 15, rest: '30 sec' },
        { name: 'Russian Twists', sets: 3, reps: 20, rest: '30 sec' },
        { name: 'Plank', sets: 3, duration: '45 sec', rest: '30 sec' },
        { name: 'Leg Raises', sets: 3, reps: 12, rest: '30 sec' },
        { name: 'Mountain Climbers', sets: 3, duration: '30 sec', rest: '30 sec' }
      ]
    },
    {
      id: 'w6',
      title: 'Weight Loss Circuit',
      level: 'Beginner',
      duration: '35 min',
      calories: 380,
      description: 'Circuit training designed specifically for weight loss, combining cardio and strength exercises.',
      image: 'assets/workout.jpg',
      tags: ['beginner', 'circuit', 'weight-loss', 'cardio'],
      exercises: [
        { name: 'Jumping Jacks', duration: '60 sec' },
        { name: 'Bodyweight Squats', reps: 15 },
        { name: 'Push-ups', reps: 10 },
        { name: 'Walking Lunges', reps: 20 },
        { name: 'Plank', duration: '30 sec' }
      ]
    }
  ];
}

// Add event listeners for view workout details after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait for workout cards to be created
  setTimeout(() => {
    // Add event listeners to view workout buttons
    document.querySelectorAll('.view-workout').forEach(button => {
      button.addEventListener('click', function() {
        const workoutId = this.getAttribute('data-id');
        viewWorkoutDetails(workoutId);
      });
    });
    
    // Add event listeners to save workout buttons
    document.querySelectorAll('.save-workout').forEach(button => {
      button.addEventListener('click', function() {
        const workoutId = this.getAttribute('data-id');
        saveWorkout(workoutId);
      });
    });
  }, 500);
});

// View workout details
function viewWorkoutDetails(workoutId) {
  // Get workout data
  const workouts = getWorkoutData();
  const workout = workouts.find(w => w.id === workoutId);
  
  if (!workout) return;
  
  // Create modal content
  const modalContent = `
    <div class="modal-header">
      <h2>${workout.title}</h2>
      <span class="close">&times;</span>
    </div>
    <div class="modal-body">
      <div class="workout-detail-image">
        <img src="${workout.image}" alt="${workout.title}">
      </div>
      <div class="workout-meta" style="margin: 15px 0;">
        <div class="workout-meta-item">
          <i class="fas fa-dumbbell"></i>
          <span>${workout.level}</span>
        </div>
        <div class="workout-meta-item">
          <i class="fas fa-clock"></i>
          <span>${workout.duration}</span>
        </div>
        <div class="workout-meta-item">
          <i class="fas fa-fire"></i>
          <span>${workout.calories} cal</span>
        </div>
      </div>
      <p>${workout.description}</p>
      <h3>Exercises</h3>
      <ul class="exercise-list">
        ${workout.exercises.map(exercise => `
          <li class="exercise-item">
            <div class="exercise-name">${exercise.name}</div>
            <div class="exercise-details">
              ${exercise.sets ? `<span>${exercise.sets} sets</span>` : ''}
              ${exercise.reps ? `<span>${exercise.reps} reps</span>` : ''}
              ${exercise.duration ? `<span>${exercise.duration}</span>` : ''}
              ${exercise.hold ? `<span>Hold: ${exercise.hold}</span>` : ''}
              ${exercise.repetitions ? `<span>${exercise.repetitions} repetitions</span>` : ''}
              ${exercise.rest ? `<span>Rest: ${exercise.rest}</span>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
      <div class="workout-actions" style="margin-top: 20px;">
        <button class="btn btn-primary start-workout" data-id="${workout.id}">Start Workout</button>
        <button class="btn btn-outline save-workout" data-id="${workout.id}">
          <i class="far fa-bookmark"></i> Save Workout
        </button>
      </div>
    </div>
  `;
  
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      ${modalContent}
    </div>
  `;
  
  // Add modal styles if not present
  if (!document.getElementById('modal-styles')) {
    const modalStyles = document.createElement('style');
    modalStyles.id = 'modal-styles';
    modalStyles.textContent = `
      .modal {
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.7);
      }
      
      .modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 0;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        width: 90%;
        max-width: 700px;
        animation: modalFadeIn 0.3s ease;
      }
      
      .modal-header {
        padding: 20px;
        background: linear-gradient(to right, var(--primary-color), #36d1dc);
        color: white;
        border-radius: 10px 10px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
      }
      
      .modal-body {
        padding: 20px;
      }
      
      .close {
        color: white;
        font-size: 1.8rem;
        font-weight: bold;
        cursor: pointer;
      }
      
      .workout-detail-image {
        width: 100%;
        height: 250px;
        overflow: hidden;
        border-radius: 8px;
      }
      
      .workout-detail-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .exercise-list {
        list-style: none;
        padding: 0;
      }
      
      .exercise-item {
        padding: 15px;
        border-bottom: 1px solid #eee;
      }
      
      .exercise-name {
        font-weight: 600;
        margin-bottom: 5px;
      }
      
      .exercise-details {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        color: #6c757d;
        font-size: 0.9rem;
      }
      
      @keyframes modalFadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(modalStyles);
  }
  
  // Add modal to DOM
  document.body.appendChild(modal);
  
  // Add event listener to close button
  modal.querySelector('.close').addEventListener('click', function() {
    modal.remove();
  });
  
  // Close modal when clicking outside the content
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.remove();
    }
  });
  
  // Add event listener to start workout button
  modal.querySelector('.start-workout').addEventListener('click', function() {
    alert('Workout started! In a real app, this would start a guided workout session.');
    modal.remove();
  });
  
  // Add event listener to save workout button
  modal.querySelector('.save-workout').addEventListener('click', function() {
    saveWorkout(workoutId);
    this.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
    this.disabled = true;
  });
}

// Save workout to user's saved workouts
function saveWorkout(workoutId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please log in to save workouts.');
    return;
  }
  
  alert('Workout saved to your profile! In a real app, this would save the workout to your account.');
  
  // Update button to show saved state
  const saveButton = document.querySelector(`.save-workout[data-id="${workoutId}"]`);
  if (saveButton) {
    saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
    saveButton.disabled = true;
  }
} 