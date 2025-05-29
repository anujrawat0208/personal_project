# FitTrack - Fitness Tracking Web Application

FitTrack is a comprehensive fitness tracking web application that helps users monitor their health, set fitness goals, calculate BMI, and receive personalized workout and diet recommendations.

## Features

- **User Authentication System**
  - Registration and login functionality
  - Password recovery process
  - Secure user data storage

- **BMI Calculator**
  - Calculate Body Mass Index based on height and weight
  - BMI classification with visual indicators
  - Personalized workout and diet recommendations based on BMI results
  - Age and gender-specific adjustments to recommendations

- **Progress Tracking**
  - Visual charts to track BMI changes over time
  - Goal setting and progress monitoring
  - Completion status for fitness goals

- **Motivational Features**
  - Daily motivational quotes
  - Visual progress indicators
  - Achievement tracking

- **Personalized Plans**
  - Custom workout plans based on fitness level and goals
  - Diet recommendations tailored to individual needs
  - Adjustable difficulty levels

## Technology Stack

- **Frontend**
  - HTML5
  - CSS3 with responsive design
  - JavaScript (ES6+)
  - Chart.js for data visualization

- **Data Storage**
  - Local storage for client-side data persistence
  - Prepared for MySQL integration with schema design

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fittrack.git
   ```

2. Navigate to the project directory:
   ```
   cd fittrack
   ```

3. Open the application in your browser:
   - Double-click on `index.html` or
   - Use a local development server like Live Server in VS Code

## Database Integration

The application is designed to be easily integrated with a MySQL database when needed:

1. The database schema is provided in `js/mysql-connection.js`
2. The API client structure is ready for server-side integration
3. Full transition to MySQL requires implementing a server-side component (Node.js, Express, etc.)

## Project Structure

- `index.html` - Main landing page with registration
- `login.html` - User authentication page
- `forgotpassword.html` - Password recovery page
- `dashboard.html` - Main user dashboard with BMI calculator and tracking
- `css/` - Directory containing stylesheets
- `js/` - Directory containing JavaScript files
  - `auth.js` - Authentication functionality
  - `bmi.js` - BMI calculator implementation
  - `dashboard.js` - Dashboard functionality
  - `db.js` - Client-side database operations
  - `mysql-connection.js` - MySQL integration utilities (future use)
- `assets/` - Directory containing images and other static assets

## Usage

1. Create an account on the registration page or use the demo account:
   - Email: demo@example.com
   - Password: password123

2. Log in to access the dashboard

3. Use the BMI calculator to get personalized recommendations

4. Set fitness goals and track your progress

5. View your BMI history on the progress chart

## Future Enhancements

- Server-side implementation with Node.js and Express
- Full MySQL database integration
- Social sharing features
- Advanced workout planning tools
- Nutritional tracking and meal planning
- Mobile application development

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Fitness and health resources for diet and workout recommendations
- Open source chart libraries for data visualization
- Icon libraries for UI elements 