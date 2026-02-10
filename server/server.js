const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
let bookings = [];
const seatLayout = generateSeatLayout();

// Generate seat layout (15 rows, 2x2 seating)
function generateSeatLayout() {
  const seats = [];
  const rows = 15;
  const seatsPerRow = 4;
  
  for (let row = 1; row <= rows; row++) {
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      const seatLetter = String.fromCharCode(64 + seatNum); // A, B, C, D
      seats.push({
        id: `${seatLetter}${row}`,
        row: row,
        seat: seatLetter,
        isBooked: false,
        bookingId: null
      });
    }
  }
  return seats;
}

// Utility functions
function validateSeats(selectedSeats) {
  if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
    return { valid: false, message: 'At least one seat must be selected' };
  }
  
  if (selectedSeats.length > 6) {
    return { valid: false, message: 'Maximum 6 seats per booking' };
  }
  
  // Check if seats exist
  for (const seatId of selectedSeats) {
    if (!seatLayout.find(s => s.id === seatId)) {
      return { valid: false, message: `Invalid seat: ${seatId}` };
    }
  }
  
  // Check if seats are already booked
  const bookedSeats = selectedSeats.filter(seatId => {
    const seat = seatLayout.find(s => s.id === seatId);
    return seat.isBooked;
  });
  
  if (bookedSeats.length > 0) {
    return { valid: false, message: `Seats already booked: ${bookedSeats.join(', ')}` };
  }
  
  return { valid: true };
}

function checkDailyLimit(mobileNumber, travelDate) {
  const todayBookings = bookings.filter(booking => 
    booking.mobileNumber === mobileNumber && 
    moment(booking.travelDate).format('YYYY-MM-DD') === travelDate
  );
  
  const totalSeats = todayBookings.reduce((sum, booking) => sum + booking.seats.length, 0);
  return totalSeats;
}

// Generate optimal boarding sequence
function generateOptimalBoardingSequence(bookingsForDate) {
  // Sort by seat row in descending order (farthest seats first)
  return [...bookingsForDate].sort((a, b) => {
    // Get the farthest seat for each booking
    const getMaxRow = (seats) => Math.max(...seats.map(s => parseInt(s.match(/\d+/)[0])));
    return getMaxRow(b.seats) - getMaxRow(a.seats);
  });
}

// Calculate boarding time for a sequence
function calculateBoardingTime(sequence) {
  let totalTime = 0;
  const blockedRows = new Set();
  
  for (const booking of sequence) {
    // Find the minimum row in this booking
    const rowsInBooking = booking.seats.map(seat => parseInt(seat.match(/\d+/)[0]));
    const minRow = Math.min(...rowsInBooking);
    
    // Check if path is blocked
    let isBlocked = false;
    for (let i = 1; i < minRow; i++) {
      if (blockedRows.has(i)) {
        isBlocked = true;
        break;
      }
    }
    
    if (isBlocked) {
      totalTime += 60; // Wait for blocking passenger to settle
    }
    
    // Add boarding time for this group
    totalTime += 60;
    
    // Mark rows as blocked during settling
    rowsInBooking.forEach(row => {
      for (let i = 1; i <= row; i++) {
        blockedRows.add(i);
      }
    });
    
    // Clear blocks after settling time (simplified)
    setTimeout(() => {
      rowsInBooking.forEach(row => {
        for (let i = 1; i <= row; i++) {
          blockedRows.delete(i);
        }
      });
    }, totalTime * 1000);
  }
  
  return totalTime;
}

// API Routes

// Get seat layout
app.get('/api/seats', (req, res) => {
  res.json(seatLayout);
});

// Get bookings for a date
app.get('/api/bookings', (req, res) => {
  const { travelDate } = req.query;
  
  if (!travelDate) {
    return res.status(400).json({ error: 'Travel date is required' });
  }
  
  const filteredBookings = bookings.filter(booking => 
    moment(booking.travelDate).format('YYYY-MM-DD') === travelDate
  );
  
  // Add sequence number
  const bookingsWithSequence = filteredBookings.map((booking, index) => ({
    ...booking,
    sequence: index + 1
  }));
  
  res.json({
    bookings: bookingsWithSequence,
    total: filteredBookings.length
  });
});

// Create booking
app.post('/api/bookings', (req, res) => {
  const { travelDate, mobileNumber, seats } = req.body;
  
  // Validation
  if (!travelDate || !mobileNumber || !seats) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Validate mobile number
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobileNumber)) {
    return res.status(400).json({ error: 'Invalid mobile number' });
  }
  
  // Check daily limit
  const seatsBookedToday = checkDailyLimit(mobileNumber, travelDate);
  if (seatsBookedToday + seats.length > 6) {
    return res.status(400).json({ 
      error: `Daily limit exceeded. You have already booked ${seatsBookedToday} seats today. Maximum is 6 seats per day.` 
    });
  }
  
  // Validate seats
  const seatValidation = validateSeats(seats);
  if (!seatValidation.valid) {
    return res.status(400).json({ error: seatValidation.message });
  }
  
  // Generate booking ID
  const bookingId = uuidv4().substring(0, 8).toUpperCase();
  
  // Create booking
  const booking = {
    id: bookingId,
    travelDate,
    mobileNumber,
    seats,
    bookedAt: new Date().toISOString(),
    boarded: false,
    boardingTime: null
  };
  
  // Update seat status
  seats.forEach(seatId => {
    const seat = seatLayout.find(s => s.id === seatId);
    if (seat) {
      seat.isBooked = true;
      seat.bookingId = bookingId;
    }
  });
  
  bookings.push(booking);
  
  res.status(201).json({
    success: true,
    booking,
    message: 'Booking confirmed successfully!'
  });
});

// Update booking
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { seats } = req.body;
  
  const bookingIndex = bookings.findIndex(b => b.id === id);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  // Free old seats
  const oldSeats = bookings[bookingIndex].seats;
  oldSeats.forEach(seatId => {
    const seat = seatLayout.find(s => s.id === seatId);
    if (seat) {
      seat.isBooked = false;
      seat.bookingId = null;
    }
  });
  
  // Validate new seats
  const seatValidation = validateSeats(seats);
  if (!seatValidation.valid) {
    // Restore old seats if validation fails
    oldSeats.forEach(seatId => {
      const seat = seatLayout.find(s => s.id === seatId);
      if (seat) {
        seat.isBooked = true;
        seat.bookingId = id;
      }
    });
    return res.status(400).json({ error: seatValidation.message });
  }
  
  // Update booking
  bookings[bookingIndex].seats = seats;
  bookings[bookingIndex].updatedAt = new Date().toISOString();
  
  // Book new seats
  seats.forEach(seatId => {
    const seat = seatLayout.find(s => s.id === seatId);
    if (seat) {
      seat.isBooked = true;
      seat.bookingId = id;
    }
  });
  
  res.json({
    success: true,
    booking: bookings[bookingIndex],
    message: 'Booking updated successfully!'
  });
});

// Mark as boarded
app.post('/api/bookings/:id/board', (req, res) => {
  const { id } = req.params;
  
  const bookingIndex = bookings.findIndex(b => b.id === id);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  bookings[bookingIndex].boarded = true;
  bookings[bookingIndex].boardingTime = new Date().toISOString();
  
  res.json({
    success: true,
    booking: bookings[bookingIndex],
    message: 'Passenger marked as boarded'
  });
});

// Get optimal boarding sequence
app.get('/api/boarding-sequence', (req, res) => {
  const { travelDate } = req.query;
  
  if (!travelDate) {
    return res.status(400).json({ error: 'Travel date is required' });
  }
  
  const bookingsForDate = bookings.filter(booking => 
    moment(booking.travelDate).format('YYYY-MM-DD') === travelDate &&
    !booking.boarded
  );
  
  const optimalSequence = generateOptimalBoardingSequence(bookingsForDate);
  const boardingTime = calculateBoardingTime(optimalSequence);
  
  res.json({
    sequence: optimalSequence.map((booking, index) => ({
      sequence: index + 1,
      bookingId: booking.id,
      seats: booking.seats,
      mobileNumber: booking.mobileNumber
    })),
    totalTime: boardingTime,
    estimatedTime: `${boardingTime} seconds`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});