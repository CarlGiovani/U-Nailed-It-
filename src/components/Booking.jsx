import React, { useState, useEffect } from 'react';
import { createBooking, uploadPaymentProof } from '../../backend/bookingApi.js';
import { getAvailableSlots, getMonthlyAvailability } from '../../backend/calendarApi.js';
import { getAllServices } from '../../backend/servicesApi.js';
import '../styles/booking-system.css';

const Booking = () => {
  // State management
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [fetchingServices, setFetchingServices] = useState(true);
  const [servicesError, setServicesError] = useState(null);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDates, setCalendarDates] = useState([]);
  const [monthlyAvailability, setMonthlyAvailability] = useState({});
  
  // Form data state
  const [formData, setFormData] = useState({
    service_id: '',
    booking_date: '',
    booking_time: '',
    full_name: '',
    email: '',
    phone: '',
    facebook_link: '',
    notes: '',
    total_price: 0,
    downpayment: 0,
    duration: 0
  });

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch monthly availability when service or month changes
  useEffect(() => {
    if (formData.service_id) {
      fetchMonthlyAvailability();
    } else {
      setMonthlyAvailability({});
      setCalendarDates([]);
    }
  }, [formData.service_id, currentMonth]);

  // Generate calendar when monthly availability changes
  useEffect(() => {
    if (formData.service_id) {
      generateCalendar();
    }
  }, [currentMonth, monthlyAvailability]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (formData.service_id && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [formData.service_id, selectedDate]);

  // Fetch real services from backend API
  const fetchServices = async () => {
    try {
      setFetchingServices(true);
      setServicesError(null);
      
      const servicesData = await getAllServices();
      
      // Transform data if needed to match frontend structure
      const transformedServices = servicesData.map(service => {
        return {
          id: service.id,
          name: service.name,
          description: service.description || service.desc || 'No description available',
          price: service.price || service.total_price || 0,
          downpayment: service.downpayment || 0,
          duration: service.duration || 0,
          image: service.image_url || service.image || service.img || 
                 service.service_image || service.photo || service.thumbnail ||
                 service.picture || service.image_path || 
                 `https://via.placeholder.com/300x200?text=${encodeURIComponent(service.name)}`
        };
      });
      
      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServicesError('Failed to load services. Please try again later.');
      
      // Fallback to mock data
      const fallbackServices = [
        {
          id: 1,
          name: 'Hair Styling',
          description: 'Professional hair styling and treatment',
          price: 1500,
          downpayment: 500,
          duration: 2,
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop'
        },
        {
          id: 2,
          name: 'Makeup Session',
          description: 'Full makeup application for special occasions',
          price: 2500,
          downpayment: 1000,
          duration: 3,
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop'
        },
        {
          id: 3,
          name: 'Nail Art',
          description: 'Creative nail design with premium polish',
          price: 800,
          downpayment: 300,
          duration: 1,
          image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop'
        }
      ];
      setServices(fallbackServices);
    } finally {
      setFetchingServices(false);
    }
  };

  // Fetch monthly availability from backend
  const fetchMonthlyAvailability = async () => {
    if (!formData.service_id) return;
    
    setFetchingAvailability(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    
    try {
      const availabilityData = await getMonthlyAvailability(
        formData.service_id, 
        year, 
        month
      );
      
      // Convert to object for easy lookup: { '2024-01-15': true, '2024-01-16': false }
      const availabilityMap = {};
      availabilityData.forEach(item => {
        availabilityMap[item.date] = item.available;
      });
      
      setMonthlyAvailability(availabilityMap);
    } catch (error) {
      console.error('Error fetching monthly availability:', error);
      setMonthlyAvailability({});
    } finally {
      setFetchingAvailability(false);
    }
  };

  // Fetch available slots for selected date
  const fetchAvailableSlots = async () => {
    if (!formData.service_id || !selectedDate) return;
    
    setFetchingSlots(true);
    try {
      const slots = await getAvailableSlots(formData.service_id, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  };

  // Generate calendar with availability from backend
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startDay = firstDay.getDay();
    
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push({
        date: date,
        dateStr: dateStr,
        isCurrentMonth: false,
        isPast: date < today,
        isSelected: selectedDate === dateStr,
        isBlocked: true,
        isAvailable: false
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const isPast = date < today;
      
      // Check availability from backend
      const isAvailable = monthlyAvailability[dateStr] === true;
      const isBlocked = isPast || !isAvailable;
      
      dates.push({
        date: date,
        dateStr: dateStr,
        isCurrentMonth: true,
        isPast: isPast,
        isSelected: selectedDate === dateStr,
        isBlocked: isBlocked,
        isAvailable: isAvailable
      });
    }
    
    // Add next month's days to complete 6 weeks (42 cells)
    const totalCells = 42;
    const remainingCells = totalCells - dates.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push({
        date: date,
        dateStr: dateStr,
        isCurrentMonth: false,
        isPast: date < today,
        isSelected: false,
        isBlocked: true,
        isAvailable: false
      });
    }
    
    setCalendarDates(dates);
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate('');
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, booking_time: '' }));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate('');
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, booking_time: '' }));
  };

  // Navigate to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate('');
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, booking_time: '' }));
  };

  // Handle service selection
  const handleServiceSelect = (service) => {
    setFormData({
      ...formData,
      service_id: service.id,
      total_price: service.price,
      downpayment: service.downpayment,
      duration: service.duration,
      booking_date: '',
      booking_time: ''
    });
    setSelectedDate('');
    setAvailableSlots([]);
    setMonthlyAvailability({});
    setStep(2);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't allow selecting past dates or unavailable dates
    if (date < today || !monthlyAvailability[dateStr]) {
      return;
    }
    
    setSelectedDate(dateStr);
    setFormData({ 
      ...formData, 
      booking_date: dateStr,
      booking_time: ''
    });
  };

  // Handle time slot selection
  const handleTimeSelect = (time) => {
    setFormData({ ...formData, booking_time: time });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Generate time slots from BACKEND DATA
  const generateTimeSlots = () => {
    if (!availableSlots.length) return [];
    
    // Map backend slots to frontend format
    return availableSlots.map(slot => {
      const time = slot.time;
      const hour = parseInt(time.split(':')[0]);
      const minute = time.split(':')[1];
      
      // Convert to 12-hour format for display
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayTime = minute === '00' ? 
        `${displayHour}:${minute} ${ampm}` : 
        `${displayHour}:${minute} ${ampm}`;
      
      return {
        value: time,
        display: displayTime,
        available: slot.is_available,
        isSelected: formData.booking_time === time,
        slotId: slot.id
      };
    }).sort((a, b) => {
      // Sort by time
      const timeA = a.value.split(':').map(Number);
      const timeB = b.value.split(':').map(Number);
      return timeA[0] - timeB[0] || timeA[1] - timeB[1];
    });
  };

  // Handle booking submission
  const handleSubmitBooking = async () => {
    setLoading(true);
    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const bookingData = {
        service_id: formData.service_id,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        total_price: formData.total_price,
        downpayment: formData.downpayment,
        notes: formData.notes,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        facebook_link: formData.facebook_link
      };

      const result = await createBooking(bookingData);
      setBookingId(result.id);
      setStep(5);
      
      alert('Booking submitted successfully! Please upload your payment proof.');
    } catch (error) {
      console.error('Booking error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment proof upload
  const handlePaymentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !bookingId) return;

    setUploading(true);
    
    const formDataObj = new FormData();
    formDataObj.append('booking_id', bookingId);
    formDataObj.append('proof', file);

    try {
      await uploadPaymentProof(formDataObj);
      alert('Payment proof uploaded successfully! Your booking is now pending approval.');
      setStep(6);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = [];
    
    if (step === 3) {
      if (!formData.full_name.trim()) errors.push('Full name is required');
      if (!formData.email.trim()) errors.push('Email is required');
      if (!formData.phone.trim()) errors.push('Phone number is required');
      if (!formData.email.includes('@gmail.com')) errors.push('Please use a Gmail address');
    }
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return false;
    }
    
    return true;
  };

  // Get selected service details
  const selectedService = services.find(s => s.id === formData.service_id);

  // Calculate how many available dates this month
  const getAvailableDatesCount = () => {
    return Object.values(monthlyAvailability).filter(v => v === true).length;
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="progress-bar">
      <div className="progress-steps">
        {['Service', 'Date & Time', 'Information', 'Review', 'Payment', 'Confirm'].map((label, index) => (
          <div 
            key={index} 
            className={`progress-step ${step > index + 1 ? 'completed' : ''} ${step === index + 1 ? 'active' : ''}`}
            onClick={() => step > index + 1 && setStep(index + 1)}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="progress-line">
        <div 
          className="progress-fill" 
          style={{ width: `${((step - 1) / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Render step 1: Service Selection
  const renderServiceSelection = () => {
    if (fetchingServices) {
      return (
        <div className="step-container">
          <h2 className="step-title">Select Service</h2>
          <p className="step-description">Choose the service you want to book</p>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading services...</p>
          </div>
        </div>
      );
    }

    if (servicesError && services.length === 0) {
      return (
        <div className="step-container">
          <h2 className="step-title">Select Service</h2>
          <p className="step-description">Choose the service you want to book</p>
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{servicesError}</p>
            <button className="btn btn-primary" onClick={fetchServices}>
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="step-container">
        <h2 className="step-title">Select Service</h2>
        <p className="step-description">Choose the service you want to book</p>
        
        {services.length === 0 ? (
          <div className="no-services">
            <p>No services available at the moment.</p>
            <button className="btn btn-secondary" onClick={fetchServices}>
              Refresh
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {services.map(service => (
              <div 
                key={service.id} 
                className={`service-card ${formData.service_id === service.id ? 'selected' : ''}`}
                onClick={() => handleServiceSelect(service)}
              >
                <div className="service-image">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(service.name)}`;
                    }}
                  />
                  <div className="service-overlay">
                    <span className="select-text">Select Service</span>
                  </div>
                </div>
                <div className="service-details">
                  <h3>{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-meta">
                    <span className="price">₱{service.price.toLocaleString()}</span>
                    <span className="duration">{service.duration} hour{service.duration !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="downpayment-info">
                    Downpayment: <strong>₱{service.downpayment.toLocaleString()}</strong>
                  </div>
                  <div className="service-badge">
                    Available
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="step-navigation">
          <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>
            Cancel
          </button>
          <div className="services-count">
            Showing {services.length} service{services.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    );
  };

  // Render step 2: Date & Time Selection
  const renderDateTimeSelection = () => {
    const timeSlots = generateTimeSlots();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="step-container">
        <h2 className="step-title">Select Date & Time</h2>
        <p className="step-description">Choose your preferred schedule</p>
        
        <div className="selected-service-summary">
          <h4>Selected Service: {selectedService?.name}</h4>
          <p>Total: ₱{formData.total_price.toLocaleString()} | Downpayment: ₱{formData.downpayment.toLocaleString()}</p>
        </div>
        
        <div className="datetime-selection">
          {/* CALENDAR SECTION */}
          <div className="calendar-section">
            <div className="calendar-header">
              <div className="calendar-nav">
                <button className="nav-btn prev" onClick={prevMonth}>
                  <span className="arrow">←</span>
                  <span className="nav-text">Previous</span>
                </button>
                
                <div className="calendar-title">
                  <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                  <button className="today-btn" onClick={goToToday}>
                    Today
                  </button>
                </div>
                
                <button className="nav-btn next" onClick={nextMonth}>
                  <span className="nav-text">Next</span>
                  <span className="arrow">→</span>
                </button>
              </div>
              
              <div className="weekdays-header">
                {dayNames.map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
            </div>
            
            {fetchingAvailability ? (
              <div className="calendar-loading">
                <div className="spinner small"></div>
                <p>Loading available dates...</p>
              </div>
            ) : (
              <>
                <div className="calendar-grid">
                  {calendarDates.map((dateObj, index) => {
                    const isToday = new Date().toDateString() === dateObj.date.toDateString();
                    
                    return (
                      <div
                        key={index}
                        className={`calendar-day ${dateObj.isCurrentMonth ? '' : 'other-month'} 
                          ${dateObj.isPast ? 'past-day' : ''} 
                          ${dateObj.isBlocked ? 'blocked-day' : 'available-day'}
                          ${dateObj.isSelected ? 'selected-day' : ''}
                          ${isToday ? 'today' : ''}`}
                        onClick={() => !dateObj.isBlocked && handleDateSelect(dateObj.date)}
                        title={dateObj.isBlocked ? 'Not available' : 'Click to select'}
                      >
                        <div className="day-content">
                          <span className="day-number">{dateObj.date.getDate()}</span>
                          {dateObj.isSelected && (
                            <div className="selection-indicator"></div>
                          )}
                          {isToday && (
                            <div className="today-indicator">Today</div>
                          )}
                        </div>
                        {!dateObj.isCurrentMonth && (
                          <div className="month-indicator">
                            {dateObj.date.getMonth() + 1}
                          </div>
                        )}
                        {dateObj.isAvailable && !dateObj.isPast && (
                          <div className="available-dot"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="calendar-footer">
                  <div className="availability-info">
                    <span className="available-count">
                      {getAvailableDatesCount()} available date{getAvailableDatesCount() !== 1 ? 's' : ''} this month
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* TIME SLOTS SECTION */}
          <div className="time-section">
            <div className="time-section-header">
              <h3>Select Time Slot</h3>
              {selectedDate ? (
                <div className="selected-date-display">
                  <span className="date-label">Selected Date:</span>
                  <span className="date-value">
                    {new Date(selectedDate).toLocaleDateString('en-PH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              ) : (
                <div className="select-date-prompt-small">
                  Please select a date from the calendar
                </div>
              )}
            </div>
            
            {selectedDate ? (
              <>
                <div className="time-slots-container">
                  {fetchingSlots ? (
                    <div className="fetching-slots">
                      <div className="spinner small"></div>
                      <p>Loading available time slots...</p>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="no-slots-message">
                      <div className="warning-icon">⚠️</div>
                      <div>
                        <p className="no-slots-title">No available slots</p>
                        <p className="no-slots-desc">All slots are booked for this date</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="time-slots-grid">
                        {timeSlots.map(slot => (
                          <button
                            key={slot.slotId || slot.value}
                            className={`time-slot-btn ${!slot.available ? 'disabled' : ''} ${slot.isSelected ? 'selected' : ''}`}
                            onClick={() => slot.available && handleTimeSelect(slot.value)}
                            disabled={!slot.available}
                            title={!slot.available ? 'This slot is already booked' : 'Click to select'}
                          >
                            <span className="slot-time">{slot.display}</span>
                            <span className="slot-status">
                              {!slot.available ? 'Booked' : slot.isSelected ? 'Selected' : 'Available'}
                            </span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="slots-info">
                        <div className="available-slots-info">
                          <div className="slot-count">
                            <span className="count">{timeSlots.filter(s => s.available).length}</span>
                            <span>slot{timeSlots.filter(s => s.available).length !== 1 ? 's' : ''} available</span>
                          </div>
                          <div className="slot-duration">
                            Each slot: {selectedService?.duration || 1} hour{selectedService?.duration !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="select-date-prompt">
                <div className="prompt-icon">📅</div>
                <h4>Select a Date First</h4>
                <p>Choose an available date from the calendar to see time slots</p>
                <div className="availability-hint">
                  <span className="dot available"></span>
                  <span>Available dates are marked with a green dot</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="step-navigation">
          <button className="btn btn-secondary" onClick={() => setStep(1)}>
            Back to Services
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setStep(3)}
            disabled={!formData.booking_date || !formData.booking_time}
          >
            Continue to Details
          </button>
        </div>
      </div>
    );
  };

  // Render step 3: Customer Information
  const renderCustomerInfo = () => (
    <div className="step-container">
      <h2 className="step-title">Your Information</h2>
      <p className="step-description">Please provide your contact details</p>
      
      <div className="booking-summary">
        <h4>Booking Summary</h4>
        <p><strong>Service:</strong> {selectedService?.name}</p>
        <p><strong>Date:</strong> {new Date(formData.booking_date).toLocaleDateString('en-PH', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p><strong>Time:</strong> {formData.booking_time}</p>
      </div>
      
      <div className="customer-form">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Gmail Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@gmail.com"
            required
          />
          <small className="form-hint">We only accept Gmail addresses</small>
        </div>
        
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="0912 345 6789"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Facebook Profile Link</label>
          <input
            type="url"
            name="facebook_link"
            value={formData.facebook_link}
            onChange={handleInputChange}
            placeholder="https://facebook.com/yourprofile"
          />
          <small className="form-hint">Optional - helps us serve you better</small>
        </div>
        
        <div className="form-group">
          <label>Additional Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any special requests or instructions..."
            rows="4"
          />
        </div>
      </div>
      
      <div className="step-navigation">
        <button className="btn btn-secondary" onClick={() => setStep(2)}>
          Back
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => setStep(4)}
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Render step 4: Booking Preview
  const renderBookingPreview = () => (
    <div className="step-container">
      <h2 className="step-title">Review Your Booking</h2>
      <p className="step-description">Please verify all details before confirming</p>
      
      <div className="booking-details-card">
        <div className="detail-section">
          <h3>Service Details</h3>
          <div className="detail-row">
            <span>Service:</span>
            <span>{selectedService?.name}</span>
          </div>
          <div className="detail-row">
            <span>Duration:</span>
            <span>{selectedService?.duration} hour{selectedService?.duration !== 1 ? 's' : ''}</span>
          </div>
          <div className="detail-row">
            <span>Total Price:</span>
            <span className="price">₱{formData.total_price.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span>Required Downpayment:</span>
            <span className="downpayment">₱{formData.downpayment.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Schedule</h3>
          <div className="detail-row">
            <span>Date:</span>
            <span>{new Date(formData.booking_date).toLocaleDateString('en-PH', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="detail-row">
            <span>Time:</span>
            <span>{formData.booking_time}</span>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Your Information</h3>
          <div className="detail-row">
            <span>Name:</span>
            <span>{formData.full_name}</span>
          </div>
          <div className="detail-row">
            <span>Email:</span>
            <span>{formData.email}</span>
          </div>
          <div className="detail-row">
            <span>Phone:</span>
            <span>{formData.phone}</span>
          </div>
          <div className="detail-row">
            <span>Facebook:</span>
            <span>{formData.facebook_link || 'Not provided'}</span>
          </div>
        </div>
        
        {formData.notes && (
          <div className="detail-section">
            <h3>Additional Notes</h3>
            <p className="notes">{formData.notes}</p>
          </div>
        )}
      </div>
      
      <div className="booking-policies">
        <h4>Important Policies</h4>
        <ul>
          <li>Your booking will be <strong>pending</strong> until payment is verified</li>
          <li>Downpayment must be paid within <strong>24 hours</strong> of booking</li>
          <li>Cancellations allowed within <strong>24 hours after approval</strong></li>
          <li>No-shows will forfeit the downpayment</li>
        </ul>
      </div>
      
      <div className="step-navigation">
        <button className="btn btn-secondary" onClick={() => setStep(3)}>
          Edit Details
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmitBooking}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );

  // Render step 5: Payment Instructions
  const renderPaymentInstructions = () => (
    <div className="step-container">
      <h2 className="step-title">Payment Instructions</h2>
      <p className="step-description">Scan the QR code to pay the downpayment</p>
      
      <div className="payment-instructions">
        <div className="qr-section">
          <div className="qr-code-container">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GCash%3A09123456789%0AAmount%3A₱${formData.downpayment}%0AReference%3ABOOK-${bookingId}`} 
              alt="Payment QR Code" 
              className="qr-code"
            />
            <div className="qr-hint">
              <span className="qr-icon">📱</span>
              <span>Scan with GCash app</span>
            </div>
          </div>
          <div className="payment-details">
            <h4>Payment Details</h4>
            <div className="payment-info">
              <div className="info-row">
                <span>Booking ID:</span>
                <span className="booking-id">#{bookingId}</span>
              </div>
              <div className="info-row highlight">
                <span>Amount to Pay:</span>
                <span className="amount">₱{formData.downpayment.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span>Account Name:</span>
                <span>Your Business Name</span>
              </div>
              <div className="info-row">
                <span>GCash Number:</span>
                <span>0912 345 6789</span>
              </div>
              <div className="info-row">
                <span>Reference:</span>
                <span className="reference">BOOK-{bookingId}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="upload-section">
          <h4>Upload Proof of Payment</h4>
          <p className="upload-hint">Take a screenshot of your successful payment and upload it here</p>
          
          <div className="upload-area">
            <label className="upload-btn">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handlePaymentUpload}
                disabled={uploading}
              />
              <div className="upload-content">
                {uploading ? (
                  <>
                    <span className="upload-icon">⏳</span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span className="upload-icon">📎</span>
                    <span>Click to upload screenshot</span>
                    <small>PNG, JPG, or PDF (Max 5MB)</small>
                  </>
                )}
              </div>
            </label>
          </div>
          
          <div className="upload-tips">
            <h5>Make sure your screenshot shows:</h5>
            <ul>
              <li>Amount paid (₱{formData.downpayment.toLocaleString()})</li>
              <li>Reference number</li>
              <li>Date and time of payment</li>
              <li>Recipient name/number</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="step-navigation">
        <button className="btn btn-secondary" onClick={() => setStep(4)}>
          Back
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => setStep(6)}
          disabled={uploading}
        >
          {uploading ? 'Processing...' : 'Skip for Now'}
        </button>
      </div>
      
      <div className="payment-note">
        <p><strong>Note:</strong> Your booking will remain <span className="pending">PENDING</span> until we verify your payment. We'll send you an email once it's approved.</p>
      </div>
    </div>
  );

  // Render step 6: Confirmation
  const renderConfirmation = () => (
    <div className="step-container confirmation-step">
      <div className="confirmation-icon">✓</div>
      <h2 className="step-title">Booking Submitted!</h2>
      <p className="step-description">Thank you for your booking request</p>
      
      <div className="confirmation-details">
        <div className="confirmation-card">
          <h4>Booking Details</h4>
          <div className="detail-row">
            <span>Booking ID:</span>
            <span className="booking-id">#{bookingId}</span>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <span className="status pending">PENDING APPROVAL</span>
          </div>
          <div className="detail-row">
            <span>Service:</span>
            <span>{selectedService?.name}</span>
          </div>
          <div className="detail-row">
            <span>Date & Time:</span>
            <span>{new Date(formData.booking_date).toLocaleDateString('en-PH', { 
              month: 'short', 
              day: 'numeric' 
            })} at {formData.booking_time}</span>
          </div>
        </div>
        
        <div className="next-steps">
          <h4>What happens next?</h4>
          <ol>
            <li>We'll review your payment proof (if uploaded)</li>
            <li>You'll receive an email confirmation within 24 hours</li>
            <li>Check your booking status anytime using your email</li>
            <li>Contact us if you have any questions</li>
          </ol>
        </div>
        
        <div className="contact-info">
          <h4>Need Help?</h4>
          <p>Email: booking@yourbusiness.com</p>
          <p>Phone: (02) 1234-5678</p>
          <p>Facebook: @yourbusinesspage</p>
        </div>
      </div>
      
      <div className="step-navigation">
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
          Back to Home
        </button>
        <button className="btn btn-secondary" onClick={() => window.location.href = `/booking-history?email=${encodeURIComponent(formData.email)}`}>
          View My Bookings
        </button>
      </div>
    </div>
  );

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Book an Appointment</h1>
        <p>Complete the following steps to secure your appointment</p>
      </div>
      
      <ProgressBar />
      
      <div className="booking-content">
        {step === 1 && renderServiceSelection()}
        {step === 2 && renderDateTimeSelection()}
        {step === 3 && renderCustomerInfo()}
        {step === 4 && renderBookingPreview()}
        {step === 5 && renderPaymentInstructions()}
        {step === 6 && renderConfirmation()}
      </div>
    </div>
  );
};

export default Booking;