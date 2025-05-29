// Dashboard Functionality
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  loadMotivationalQuote();
});

// Initialize dashboard
function initDashboard() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  // Set user name in welcome message
  const welcomeElement = document.getElementById('welcomeMessage');
  if (welcomeElement) {
    welcomeElement.textContent = `Welcome, ${currentUser.name}!`;
  }

  // Load BMI history chart
  loadBMIChart();
  
  // Load user goals
  loadUserGoals();
  
  // Set up goal form
  const goalForm = document.getElementById('goalForm');
  if (goalForm) {
    goalForm.addEventListener('submit', addGoal);
  }
}

// Load BMI history chart
async function loadBMIChart() {
  const chartCanvas = document.getElementById('bmiChart');
  if (!chartCanvas) return;
  
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Get BMI history from service
  const bmiHistory = await bmiService.getHistory(currentUser._id);
  
  if (!bmiHistory || bmiHistory.length === 0) {
    const noDataMsg = document.createElement('p');
    noDataMsg.textContent = 'No BMI data available yet. Complete your first BMI assessment.';
    noDataMsg.className = 'no-data-message';
    chartCanvas.parentNode.insertBefore(noDataMsg, chartCanvas);
    chartCanvas.style.display = 'none';
    return;
  }
  
  // Sort BMI history by date
  const sortedBmiHistory = [...bmiHistory].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  // Extract labels and data
  const labels = sortedBmiHistory.map(entry => {
    const date = new Date(entry.date);
    return date.toLocaleDateString();
  });
  
  const data = sortedBmiHistory.map(entry => entry.bmi);
  
  // Define chart colors
  const colors = {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f39c12'
  };
  
  // Create chart
  new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'BMI History',
        data: data,
        borderColor: colors.primary,
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: colors.primary,
        pointRadius: 4,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: Math.max(Math.min(...data) - 2, 0),
          max: Math.max(...data) + 2,
          ticks: {
            stepSize: 1
          },
          grid: {
            drawBorder: false
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'nearest'
      }
    }
  });
  
  // Add horizontal reference lines for BMI categories
  const bmiRanges = [
    { value: 18.5, label: 'Underweight', color: colors.warning },
    { value: 25, label: 'Normal', color: colors.secondary },
    { value: 30, label: 'Overweight', color: colors.danger }
  ];
  
  // Add BMI category reference table
  const chartContainer = chartCanvas.parentNode;
  const referenceTable = document.createElement('div');
  referenceTable.className = 'bmi-reference';
  referenceTable.innerHTML = `
    <div class="bmi-reference-title">BMI Categories:</div>
    <div class="bmi-reference-items">
      <div class="bmi-reference-item">
        <span class="color-box" style="background-color: ${colors.warning}"></span>
        <span>Underweight: BMI < 18.5</span>
      </div>
      <div class="bmi-reference-item">
        <span class="color-box" style="background-color: ${colors.secondary}"></span>
        <span>Normal weight: BMI 18.5-24.9</span>
      </div>
      <div class="bmi-reference-item">
        <span class="color-box" style="background-color: ${colors.warning}"></span>
        <span>Overweight: BMI 25-29.9</span>
      </div>
      <div class="bmi-reference-item">
        <span class="color-box" style="background-color: ${colors.danger}"></span>
        <span>Obesity: BMI ≥ 30</span>
      </div>
    </div>
  `;
  chartContainer.appendChild(referenceTable);
}

// Update BMI chart (called from bmi.js)
function updateBMIChart() {
  // Simply reload the page to refresh the chart
  window.location.reload();
}

// Load user goals
async function loadUserGoals() {
  const goalsList = document.getElementById('goalsList');
  if (!goalsList) return;
  
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Get goals from service
  const goals = await goalService.getAll(currentUser._id);
  
  if (!goals || goals.length === 0) {
    goalsList.innerHTML = '<li class="no-goals">No goals added yet. Add your first fitness goal!</li>';
    return;
  }
  
  // Sort goals by completion and date
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.date) - new Date(a.date);
    }
    return a.completed ? 1 : -1;
  });
  
  // Render goals
  goalsList.innerHTML = sortedGoals.map(goal => `
    <li class="goal-item ${goal.completed ? 'completed' : ''}">
      <div class="goal-checkbox">
        <input type="checkbox" id="goal${goal.id}" ${goal.completed ? 'checked' : ''} 
          onchange="toggleGoalStatus('${goal.id}')">
        <label for="goal${goal.id}"></label>
      </div>
      <div class="goal-content">
        <h4 class="goal-title">${goal.title}</h4>
        <p class="goal-description">${goal.description}</p>
        <div class="goal-meta">
          <span class="goal-date">Target date: ${formatDate(goal.targetDate)}</span>
          <span class="goal-progress">Progress: ${goal.progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${goal.progress}%"></div>
        </div>
      </div>
      <div class="goal-actions">
        <button class="goal-edit" onclick="updateGoalProgress('${goal.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="goal-delete" onclick="deleteGoal('${goal.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </li>
  `).join('');
}

// Add a new goal
async function addGoal(event) {
  event.preventDefault();
  
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const title = document.getElementById('goalTitle').value.trim();
  const description = document.getElementById('goalDescription').value.trim();
  const targetDate = document.getElementById('goalDate').value;
  
  if (!title || !targetDate) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Create goal object
  const goalData = {
    title,
    description,
    targetDate,
    progress: 0,
    completed: false
  };
  
  // Add goal to database
  await goalService.add(currentUser._id, goalData);
  
  // Clear form
  event.target.reset();
  
  // Refresh goals list
  loadUserGoals();
  
  // Show success message
  const message = document.createElement('div');
  message.className = 'success-message';
  message.textContent = 'Goal added successfully!';
  event.target.appendChild(message);
  
  // Remove message after 3 seconds
  setTimeout(() => {
    message.remove();
  }, 3000);
}

// Toggle goal completion status
async function toggleGoalStatus(goalId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Get checkbox status
  const checkbox = document.getElementById(`goal${goalId}`);
  const completed = checkbox.checked;
  
  // Determine progress value based on completion
  const progress = completed ? 100 : 0;
  
  // Update goal in database
  await goalService.update(currentUser._id, goalId, {
    completed,
    progress
  });
  
  // Refresh goals list
  loadUserGoals();
}

// Update goal progress
async function updateGoalProgress(goalId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Get goals from service
  const goals = await goalService.getAll(currentUser._id);
  const goal = goals.find(g => g.id === goalId);
  
  if (!goal) return;
  
  // Prompt for new progress
  const newProgress = prompt('Enter progress (0-100):', goal.progress);
  if (newProgress === null) return;
  
  // Validate input
  const progress = parseInt(newProgress, 10);
  if (isNaN(progress) || progress < 0 || progress > 100) {
    alert('Please enter a valid number between 0 and 100');
    return;
  }
  
  // Determine completion status based on progress
  const completed = progress === 100;
  
  // Update goal in database
  await goalService.update(currentUser._id, goalId, {
    progress,
    completed
  });
  
  // Refresh goals list
  loadUserGoals();
}

// Delete goal
async function deleteGoal(goalId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Confirm deletion
  if (!confirm('Are you sure you want to delete this goal?')) {
    return;
  }
  
  // Delete goal from database
  await goalService.remove(currentUser._id, goalId);
  
  // Refresh goals list
  loadUserGoals();
}

// Load motivational quote
function loadMotivationalQuote() {
  const quoteElement = document.getElementById('motivationalQuote');
  const quoteAuthorElement = document.getElementById('quoteAuthor');
  if (!quoteElement || !quoteAuthorElement) return;
  
  // List of motivational quotes
  const quotes = [
    { text: "The hard days are what make you stronger.", author: "Aly Raisman" },
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "No matter how slow you go, you're still lapping everyone on the couch.", author: "Unknown" },
    { text: "Strive for progress, not perfection.", author: "Unknown" },
    { text: "Good things come to those who sweat.", author: "Unknown" },
    { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Andrew Murphy" },
    { text: "The difference between try and triumph is just a little umph!", author: "Marvin Phillips" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { text: "Your health is an investment, not an expense.", author: "Unknown" },
    { text: "Exercise is king. Nutrition is queen. Put them together and you've got a kingdom.", author: "Jack LaLanne" }
  ];
  
  // Get random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  // Set quote
  quoteElement.textContent = `"${quote.text}"`;
  quoteAuthorElement.textContent = `- ${quote.author}`;
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Get current user from session
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
} 