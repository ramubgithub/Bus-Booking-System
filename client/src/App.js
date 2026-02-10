import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  FaPhone, 
  FaCheck, 
  FaTimes, 
  FaBus, 
  FaUserCheck,
  FaClock,
  FaChair
} from 'react-icons/fa';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 10px;
`;

const Tab = styled.button`
  padding: 15px 30px;
  border: none;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.active ? '#5a6fd8' : '#e0e0e0'};
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  max-width: 400px;
  margin-top: 1rem;
`;

const Seat = styled.button`
  padding: 15px;
  border: 2px solid ${props => 
    props.selected ? '#667eea' : 
    props.booked ? '#ff6b6b' : '#e0e0e0'
  };
  background: ${props => 
    props.selected ? '#667eea' : 
    props.booked ? '#ff6b6b' : 'white'
  };
  color: ${props => 
    props.selected || props.booked ? 'white' : '#333'
  };
  border-radius: 8px;
  cursor: ${props => props.booked ? 'not-allowed' : 'pointer'};
  font-weight: bold;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const BookingList = styled.div`
  margin-top: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  background: #f5f5f5;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const BoardingStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background: ${props => props.boarding ? '#4CAF50' : '#ff9800'};
  color: white;
  font-size: 0.9rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const BusLayout = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 2rem;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const SeatRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
`;

const RowNumber = styled.span`
  width: 30px;
  font-weight: bold;
  color: #666;
`;

function App() {
  const [activeTab, setActiveTab] = useState('book');
  const [travelDate, setTravelDate] = useState(new Date());
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [error, setError] = useState('');
  const [boardingSequence, setBoardingSequence] = useState([]);
  const [selectedBookingDate, setSelectedBookingDate] = useState(new Date());

  useEffect(() => {
    fetchSeats();
    fetchBookings();
  }, []);

  const fetchSeats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seats`);
      setSeats(response.data);
    } catch (err) {
      console.error('Error fetching seats:', err);
    }
  };

  const fetchBookings = async (date = selectedBookingDate) => {
    try {
      const formattedDate = formatDate(date);
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        params: { travelDate: formattedDate }
      });
      setBookings(response.data.bookings);
      fetchBoardingSequence(formattedDate);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchBoardingSequence = async (date) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/boarding-sequence`, {
        params: { travelDate: date }
      });
      setBoardingSequence(response.data.sequence);
    } catch (err) {
      console.error('Error fetching boarding sequence:', err);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSeatClick = (seatId) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat.isBooked) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        setError('Maximum 6 seats per booking');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
    setError('');
  };

  const handleBook = async () => {
    if (!mobileNumber || selectedSeats.length === 0) {
      setError('Please enter mobile number and select seats');
      return;
    }

    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, {
        travelDate: formatDate(travelDate),
        mobileNumber,
        seats: selectedSeats
      });

      setBookingConfirmation(response.data.booking);
      setShowModal(true);
      setMobileNumber('');
      setSelectedSeats([]);
      fetchSeats();
      fetchBookings();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkBoarded = async (bookingId) => {
    try {
      await axios.post(`${API_BASE_URL}/bookings/${bookingId}/board`);
      fetchBookings();
    } catch (err) {
      console.error('Error marking as boarded:', err);
    }
  };

  const handleCall = (mobileNumber) => {
    window.open(`tel:${mobileNumber}`);
  };

  const renderSeatLayout = () => {
    const rows = 15;
    const seatsPerRow = 4;
    const seatLetters = ['A', 'B', 'C', 'D'];

    return Array.from({ length: rows }, (_, rowIndex) => {
      const rowNumber = rowIndex + 1;
      return (
        <SeatRow key={rowNumber}>
          <RowNumber>{rowNumber}</RowNumber>
          {seatLetters.map((letter, seatIndex) => {
            const seatId = `${letter}${rowNumber}`;
            const seat = seats.find(s => s.id === seatId);
            const isSelected = selectedSeats.includes(seatId);
            const isBooked = seat?.isBooked;
            
            return (
              <Seat
                key={seatIndex}
                onClick={() => handleSeatClick(seatId)}
                selected={isSelected}
                booked={isBooked}
                disabled={isBooked}
              >
                {seatId}
              </Seat>
            );
          })}
        </SeatRow>
      );
    });
  };

  return (
    <Container>
      <Header>
        <FaBus size={40} />
        <Title>Bus Booking System</Title>
      </Header>

      <Tabs>
        <Tab 
          active={activeTab === 'book'} 
          onClick={() => setActiveTab('book')}
        >
          <FaChair /> Book Tickets
        </Tab>
        <Tab 
          active={activeTab === 'list'} 
          onClick={() => setActiveTab('list')}
        >
          <FaUserCheck /> Boarding Management
        </Tab>
        <Tab 
          active={activeTab === 'sequence'} 
          onClick={() => setActiveTab('sequence')}
        >
          <FaClock /> Boarding Sequence
        </Tab>
      </Tabs>

      {activeTab === 'book' && (
        <Card>
          <h2>Book Your Bus Tickets</h2>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label>Travel Date</Label>
            <DatePicker
              selected={travelDate}
              onChange={(date) => setTravelDate(date)}
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
              className="date-picker"
            />
          </FormGroup>

          <FormGroup>
            <Label>Mobile Number</Label>
            <Input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
            />
          </FormGroup>

          <FormGroup>
            <Label>Select Seats (Max: 6)</Label>
            <div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#e0e0e0', border: '2px solid #ccc' }}></div>
                  <span>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#667eea' }}></div>
                  <span>Selected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#ff6b6b' }}></div>
                  <span>Booked</span>
                </div>
              </div>

              <BusLayout>
                <div style={{ flex: 1 }}>
                  <h4>Seat Layout (2x2 Seating)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ background: '#333', color: 'white', padding: '5px 20px', borderRadius: '5px', marginBottom: '10px' }}>
                      Front of Bus
                    </div>
                    {renderSeatLayout()}
                    <div style={{ background: '#333', color: 'white', padding: '5px 20px', borderRadius: '5px', marginTop: '10px' }}>
                      Rear of Bus
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h4>Selected Seats: {selectedSeats.length}/6</h4>
                  <div style={{ marginTop: '20px' }}>
                    {selectedSeats.length > 0 ? (
                      <div>
                        <p><strong>Selected:</strong> {selectedSeats.join(', ')}</p>
                        <p><strong>Total Seats:</strong> {selectedSeats.length}</p>
                      </div>
                    ) : (
                      <p>No seats selected</p>
                    )}
                  </div>
                </div>
              </BusLayout>
            </div>
          </FormGroup>

          <Button onClick={handleBook} disabled={loading || selectedSeats.length === 0}>
            {loading ? 'Processing...' : 'Book Seats'}
          </Button>
        </Card>
      )}

      {activeTab === 'list' && (
        <Card>
          <h2>Boarding Management</h2>
          
          <FormGroup>
            <Label>Select Date to View Bookings</Label>
            <DatePicker
              selected={selectedBookingDate}
              onChange={(date) => {
                setSelectedBookingDate(date);
                fetchBookings(date);
              }}
              dateFormat="MMMM d, yyyy"
              className="date-picker"
            />
          </FormGroup>

          <BookingList>
            <h3>Bookings for {selectedBookingDate.toLocaleDateString()}</h3>
            
            {bookings.length === 0 ? (
              <p>No bookings found for this date.</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Seq</Th>
                    <Th>Booking ID</Th>
                    <Th>Mobile</Th>
                    <Th>Seats</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={booking.id}>
                      <Td>{index + 1}</Td>
                      <Td><strong>{booking.id}</strong></Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {booking.mobileNumber}
                          <FaPhone 
                            style={{ cursor: 'pointer', color: '#667eea' }}
                            onClick={() => handleCall(booking.mobileNumber)}
                            title="Call passenger"
                          />
                        </div>
                      </Td>
                      <Td>{booking.seats.join(', ')}</Td>
                      <Td>
                        <BoardingStatus boarding={booking.boarded}>
                          {booking.boarded ? <FaCheck /> : <FaTimes />}
                          {booking.boarded ? 'Boarded' : 'Pending'}
                        </BoardingStatus>
                      </Td>
                      <Td>
                        {!booking.boarded && (
                          <Button 
                            onClick={() => handleMarkBoarded(booking.id)}
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                          >
                            Mark as Boarded
                          </Button>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </BookingList>
        </Card>
      )}

      {activeTab === 'sequence' && (
        <Card>
          <h2>Optimal Boarding Sequence</h2>
          <p>This sequence minimizes total boarding time by boarding passengers from farthest seats first.</p>
          
          <FormGroup>
            <Label>Select Travel Date</Label>
            <DatePicker
              selected={selectedBookingDate}
              onChange={(date) => {
                setSelectedBookingDate(date);
                fetchBookings(date);
              }}
              dateFormat="MMMM d, yyyy"
              className="date-picker"
            />
          </FormGroup>

          <BookingList>
            <h3>Optimal Boarding Order</h3>
            
            {boardingSequence.length === 0 ? (
              <p>No pending boardings for this date.</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Sequence</Th>
                    <Th>Booking ID</Th>
                    <Th>Seats</Th>
                    <Th>Mobile</Th>
                    <Th>Boarding Strategy</Th>
                  </tr>
                </thead>
                <tbody>
                  {boardingSequence.map((item, index) => (
                    <tr key={item.bookingId}>
                      <Td><strong>{item.sequence}</strong></Td>
                      <Td>{item.bookingId}</Td>
                      <Td>{item.seats.join(', ')}</Td>
                      <Td>{item.mobileNumber}</Td>
                      <Td>
                        {index === 0 ? 'Board first (farthest seats)' :
                         index === boardingSequence.length - 1 ? 'Board last (nearest seats)' :
                         'Follow sequence'}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </BookingList>

          <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4fd', borderRadius: '8px' }}>
            <h4>Boarding Algorithm Explanation:</h4>
            <ul>
              <li>Passengers board from farthest seats (highest row numbers) to nearest</li>
              <li>Each passenger/group takes 60 seconds to settle</li>
              <li>No passenger can cross a settling passenger</li>
              <li>Groups under same booking board together</li>
              <li>This sequence minimizes total boarding time by reducing blocking</li>
            </ul>
          </div>
        </Card>
      )}

      {showModal && bookingConfirmation && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <SuccessMessage>
              <FaCheck size={24} />
              <h3>Booking Confirmed!</h3>
            </SuccessMessage>
            
            <div style={{ margin: '20px 0' }}>
              <p><strong>Booking ID:</strong> {bookingConfirmation.id}</p>
              <p><strong>Travel Date:</strong> {new Date(bookingConfirmation.travelDate).toLocaleDateString()}</p>
              <p><strong>Mobile Number:</strong> {bookingConfirmation.mobileNumber}</p>
              <p><strong>Selected Seats:</strong> {bookingConfirmation.seats.join(', ')}</p>
              <p><strong>Total Seats:</strong> {bookingConfirmation.seats.length}</p>
            </div>

            <Button onClick={() => setShowModal(false)}>
              Close
            </Button>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default App;