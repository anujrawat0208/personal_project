// User registration
async function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (password !== confirmPassword) {
    showMessage('error', 'Passwords do not match!');
    return;
  }

  if (password.length < 6) {
    showMessage('error', 'Password must be at least 6 characters long!');
    return;
  }

  // Check if user already exists
  const existingUser = await userService.findByEmail(email);
  if (existingUser) {
    showMessage('error', 'Email already registered! Please login.');
    return;
  }

  // Create user object
  const userData = {
    name,
    email,
    password
  };

  // Create user in database
  const user = await userService.create(userData);
  if (!user) {
    showMessage('error', 'Registration failed. Please try again.');
    return;
  }

  // Auto login
  setCurrentUser(user);

  showMessage('success', 'Registration successful! Redirecting to dashboard...');
  
  // Redirect to dashboard after short delay
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1500);
}

// User login
async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Get user
  const user = await userService.findByEmail(email);
  
  if (!user || !userService.verifyPassword(password, user.password)) {
    showMessage('error', 'Invalid email or password!');
    return;
  }

  // Set current user
  setCurrentUser(user);

  showMessage('success', 'Login successful! Redirecting to dashboard...');
  
  // Redirect to dashboard
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1500);
}

// Forgot password
async function forgotPassword(event) {
  event.preventDefault();

  const email = document.getElementById('recoveryEmail').value.trim();
  
  // Get user
  const user = await userService.findByEmail(email);

  if (!user) {
    showMessage('error', 'Email not found! Please check your email.');
    return;
  }

  // In a real app, you'd send an email with a token
  // For this demo, we'll just show a password reset form
  document.getElementById('resetForm').style.display = 'block';
  document.getElementById('forgotForm').style.display = 'none';
}

// Reset password
async function resetPassword(event) {
  event.preventDefault();

  const email = document.getElementById('recoveryEmail').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  // Validation
  if (newPassword !== confirmNewPassword) {
    showMessage('error', 'Passwords do not match!');
    return;
  }

  if (newPassword.length < 6) {
    showMessage('error', 'Password must be at least 6 characters long!');
    return;
  }

  // Get user
  const user = await userService.findByEmail(email);

  if (!user) {
    showMessage('error', 'User not found!');
    return;
  }

  // Update password
  const success = await userService.updatePassword(user._id, newPassword);
  
  if (!success) {
    showMessage('error', 'Password reset failed. Please try again.');
    return;
  }

  showMessage('success', 'Password reset successful! Redirecting to login...');
  
  // Redirect to login
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1500);
}

// Logout
function logoutUser() {
  clearCurrentUser();
  window.location.href = 'login.html';
}

// Helper functions
function showMessage(type, message) {
  const messageElement = document.getElementById('messageBox');
  if (!messageElement) return;
  
  messageElement.textContent = message;
  messageElement.className = type === 'error' ? 'error-message' : 'success-message';
  messageElement.style.display = 'block';

  // Hide message after 5 seconds
  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 5000);
}

function setCurrentUser(user) {
  // Remove password before storing for security
  const { password, ...secureUser } = user;
  localStorage.setItem('currentUser', JSON.stringify(secureUser));
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// Check if user is logged in
function checkAuth() {
  const currentUser = getCurrentUser();
  
  // If on auth page but already logged in, redirect to dashboard
  if (currentUser && (window.location.pathname.includes('login.html') || 
      window.location.pathname.includes('signup.html') || 
      window.location.pathname.includes('index.html') ||
      window.location.pathname.includes('forgotpassword.html'))) {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // If on protected page but not logged in, redirect to login
  if (!currentUser && !window.location.pathname.includes('login.html') && 
      !window.location.pathname.includes('signup.html') && 
      !window.location.pathname.includes('index.html') &&
      !window.location.pathname.includes('forgotpassword.html')) {
    window.location.href = 'login.html';
    return;
  }
}

// Initialize auth listeners
function initAuth() {
  // Check authentication status
  checkAuth();
  
  // Initialize form event listeners
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', registerUser);
  }
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', loginUser);
  }
  
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', forgotPassword);
  }
  
  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    resetForm.addEventListener('submit', resetPassword);
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
}

// Run auth initialization on page load
document.addEventListener('DOMContentLoaded', initAuth); 