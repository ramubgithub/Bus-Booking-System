# 🚌 Bus Ticket Booking System - myPaisaa

A full-stack bus ticket booking system with optimal boarding sequence algorithm for efficient passenger boarding management.

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Boarding Algorithm](#-boarding-algorithm)
- [System Constraints](#-system-constraints)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Future Enhancements](#-future-enhancements)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Project Overview

This system allows bus conductors to manage ticket bookings and optimize boarding sequences to minimize total boarding time. The application features a React.js frontend and Node.js/Express.js backend with a sophisticated boarding algorithm.

## ✨ Features

### 🎫 **Screen 1: Booking Management**
- **Date Selection**: Calendar-based travel date selection
- **Mobile Validation**: 10-digit mobile number validation
- **Interactive Seat Layout**: 15 rows × 4 seats (2×2 seating arrangement)
- **Smart Seat Selection**: 
  - Maximum 6 seats per mobile number per day
  - Real-time seat availability
  - Visual feedback for seat status
- **Booking Confirmation**: 
  - System-generated Booking ID
  - Instant confirmation popup
  - Booking details summary

### 👥 **Screen 2: Boarding Management**
- **Booking List**: Filter bookings by travel date
- **Contact Integration**: Click-to-call mobile numbers
- **Boarding Status**: Mark passengers as boarded
- **Real-time Updates**: Live status tracking

### ⚡ **Optimal Boarding Algorithm**
- **Intelligent Sequencing**: Boards passengers from farthest seats first
- **Time Optimization**: Reduces total boarding time by up to 66%
- **Group Handling**: All passengers under same booking board together
- **Blocking Prevention**: No passenger crossing during settling time

## 🛠️ Tech Stack

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **REST API** - Architectural style
- **UUID** - Unique ID generation
- **Moment.js** - Date handling

### **Frontend**
- **React.js** - UI library
- **Styled Components** - CSS-in-JS
- **React DatePicker** - Date selection
- **React Icons** - Icon library
- **Axios** - HTTP client

### **Development Tools**
- **Nodemon** - Auto-reload for development
- **CORS** - Cross-origin resource sharing

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git (optional)

### **Step-by-Step Setup**

#### **1. Clone/Create Project**
```bash
# Create project directory
mkdir bus-booking-system
cd bus-booking-system


# Create server directory
mkdir server
cd server

# Initialize package.json
npm init -y

# Install dependencies
npm install express cors dotenv uuid moment
npm install --save-dev nodemon

# Create server.js file with provided code
# Start server
npm run dev

# Go back to project root
cd ..

# Create React app
npx create-react-app client
cd client

# Install dependencies
npm install axios date-fns react-datepicker react-icons styled-components

# Replace default files with provided code
npm start

# Terminal 1 - Backend
cd server
npm run dev
# Server runs on http://localhost:5000

# Terminal 2 - Frontend
cd client
npm start
# App runs on http://localhost:3000 

📡 API Documentation

Base URL
text
http://localhost:5000/api
Available Endpoints
Method	Endpoint	Description
GET	/seats	Get seat layout and availability
POST	/bookings	Create new booking
GET	/bookings?travelDate=YYYY-MM-DD	Get bookings by date
PUT	/bookings/:id	Update existing booking
POST	/bookings/:id/board	Mark as boarded
GET	/boarding-sequence?travelDate=YYYY-MM-DD	Get optimal boarding sequence
Example Requests
1. Create Booking
bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "travelDate": "2024-01-15",
    "mobileNumber": "9876543210",
    "seats": ["A1", "B1", "C1"]
  }'
2. Get Bookings
bash
curl "http://localhost:5000/api/bookings?travelDate=2024-01-15"
3. Get Seat Layout
bash
curl "http://localhost:5000/api/seats"
🧠 Boarding Algorithm
Problem Statement
Minimize total boarding time given:

Each passenger/group takes 60 seconds to settle

No passenger can cross a settling passenger

All passengers under same Booking ID board together

Boarding only through front gate

Algorithm Logic
javascript
function generateOptimalBoardingSequence(bookings) {
  // 1. Sort by farthest seat first
  return bookings.sort((a, b) => {
    const getMaxRow = (seats) => Math.max(...seats.map(s => parseInt(s.match(/\d+/)[0])));
    return getMaxRow(b.seats) - getMaxRow(a.seats);
  });
}
Example Scenario
Input Data:

text
Booking ID   Seat    Mobile
111         A1      9999912345
222         A7      9999912346
333         A15     9999912347
Non-Optimal Sequence (180 seconds):

text
Sequence 1: Booking 111 (A1) - Blocks A7 & A15 for 60s
Sequence 2: Booking 222 (A7) - Blocks A15 for 60s
Sequence 3: Booking 333 (A15) - Boards at 120s
Total Time: 180 seconds
Optimal Sequence (60 seconds):

text
Sequence 1: Booking 333 (A15) - Doesn't block anyone
Sequence 2: Booking 222 (A7) - Doesn't block A15
Sequence 3: Booking 111 (A1) - Doesn't block anyone
Total Time: 60 seconds
Result: 66% time reduction (120 seconds saved)

⚙️ System Constraints
Booking Rules
Maximum seats: 6 seats per mobile number per day

Mobile validation: 10-digit Indian mobile numbers only (e.g., 9876543210)

Date validation: Cannot book for past dates

Seat validation: Cannot book already booked seats

Group booking: All seats under same booking ID are treated as single entity

Boarding Rules
Settling time: 60 seconds per passenger/group

Blocking: No crossing past settling passengers

Entry point: Boarding only through front gate

Walking time: Negligible inside bus

Group boarding: All passengers under same booking board together

📁 Project Structure
text
bus-booking-system/
├── server/                           # Backend API
│   ├── server.js                     # Main Express server
│   ├── package.json                  # Backend dependencies
│   └── node_modules/                 # Backend packages
├── client/                           # Frontend React App
│   ├── public/                       # Static files
│   ├── src/                          # React source code
│   │   ├── App.js                    # Main React component
│   │   ├── App.css                   # Global styles
│   │   └── index.js                  # React entry point
│   └── package.json                  # Frontend dependencies
└── README.md                         # This documentation
🧪 Testing
Test Scenarios
Booking Tests
Valid Booking

Input: Valid date, mobile, available seats

Expected: Booking confirmation with ID

Maximum Seat Limit

Input: Try to book 7th seat for same mobile

Expected: Error - "Daily limit exceeded"

Duplicate Seat Booking

Input: Select already booked seat

Expected: Error - "Seat already booked"

Invalid Mobile

Input: 9-digit or non-numeric mobile

Expected: Error - "Invalid mobile number"

Past Date

Input: Select yesterday's date

Expected: Date picker should restrict

Boarding Tests
Mark as Boarded

Action: Click "Mark as Boarded"

Expected: Status changes to "Boarded"

Click-to-Call

Action: Click phone icon

Expected: Device dialer opens

Optimal Sequence

Action: View boarding sequence

Expected: Farthest seats shown first

🔮 Future Enhancements
Phase 2 Features
Database Integration

MongoDB/PostgreSQL for persistent storage

User authentication and profiles

Booking history

Advanced Features

Payment gateway integration

Email/SMS notifications

Multiple bus routes and schedules

Seat preferences (window/aisle)

Mobile Application

React Native mobile app

Push notifications

Offline capabilities

Admin Dashboard

Real-time analytics

Revenue reports

Passenger demographics

Algorithm Improvements
Multi-door Boarding: Support for front and rear doors

Priority Boarding: Elderly, disabled passengers first

Luggage Consideration: Factor in luggage handling time

Real-time Optimization: Dynamic sequencing based on actual passenger flow

🐛 Troubleshooting
Common Issues & Solutions
1. Port Already in Use
bash
# Mac/Linux
sudo lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
# Note the PID, then:
taskkill /PID <PID> /F
2. CORS Errors
javascript
// Ensure this is in server.js
app.use(cors());
3. React Dependencies Issues
bash
cd client
rm -rf node_modules package-lock.json
npm install
4. API Connection Failed
Check if backend is running: http://localhost:5000/api/seats

Verify API URL in App.js: const API_BASE_URL = 'http://localhost:5000/api'

Check network tab in browser console

5. DatePicker Not Working
bash
# Ensure package is installed
npm install react-datepicker

# Import CSS in App.js
import 'react-datepicker/dist/react-datepicker.css';
Development Logs
Backend logs: Terminal running npm run dev

Frontend logs: Browser console (F12 → Console)

Network requests: Browser console (F12 → Network)

🤝 Contributing
How to Contribute
Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

Commit Message Convention
feat: New feature

fix: Bug fix

docs: Documentation changes

style: Code formatting

refactor: Code refactoring

test: Adding tests

chore: Maintenance tasks