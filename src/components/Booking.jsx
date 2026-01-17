import { useState } from 'react';

const Booking = ({ services }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    facebook: '',
    notes: ''
  });
  const [proofPayment, setProofPayment] = useState(null);

  // Available time slots
  const timeSlots = [
    '9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'
  ];

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      const date = new Date(year, month, -startingDay + i + 1);
      days.push({ date, currentMonth: false, available: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      days.push({ 
        date, 
        currentMonth: true, 
        available: !isWeekend && !isPast 
      });
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    if (date.currentMonth && date.available) {
      setSelectedDate(date.date);
      setSelectedTime(null);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFileChange = (e) => {
    setProofPayment(e.target.files[0]);
  };

  const handleSubmitBooking = () => {
    if (!proofPayment) {
      alert('Please upload proof of payment');
      return;
    }

    // In a real app, you would send this data to a backend
    const bookingData = {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      customer: formData,
      downpayment: selectedService?.downpayment || 0
    };

    console.log('Booking submitted:', bookingData);
    alert('Booking submitted successfully! We will contact you for confirmation.');
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setCurrentStep(1);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      facebook: '',
      notes: ''
    });
    setProofPayment(null);
  };

  const calendarDays = generateCalendarDays();
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <section className="booking" id="booking">
      <div className="container">
        <div className="section-title">
          <h2>Book Your Appointment</h2>
          <p>Easy 4-step booking process</p>
        </div>

        <div className="booking-steps">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`step ${currentStep >= step ? 'active' : ''}`}
              onClick={() => step < currentStep && setCurrentStep(step)}
            >
              <div className="step-circle">{step}</div>
              <div className="step-label">
                {step === 1 && 'Select Service'}
                {step === 2 && 'Date & Time'}
                {step === 3 && 'Your Details'}
                {step === 4 && 'Confirmation'}
              </div>
            </div>
          ))}
        </div>

        <div className="booking-form-container">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="booking-form-section active">
              <h3 className="form-title">Select Your Service</h3>
              <p>Choose from our premium nail art services below:</p>

              <div className="service-options">
                {services.map(service => (
                  <div 
                    key={service.id}
                    className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
                    onClick={() => setSelectedService(service)}
                  >
                    <h4>{service.name}</h4>
                    <p>{service.description}</p>
                    <div style={{ marginTop: '15px' }}>
                      <div><strong>Total Price:</strong> ₱{service.price}</div>
                      <div><strong>Downpayment:</strong> ₱{service.downpayment}</div>
                      <div><strong>Duration:</strong> {service.duration}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="booking-actions">
                <button className="btn btn-secondary" disabled>Previous</button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleNextStep}
                  disabled={!selectedService}
                >
                  Next: Select Date & Time
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <div className="booking-form-section">
              <h3 className="form-title">Select Date & Time</h3>
              <p>Choose an available date and time for your appointment:</p>

              <div className="calendar-container">
                <div className="calendar-header">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      const newDate = new Date(currentMonth);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCurrentMonth(newDate);
                    }}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <h4>{monthYear}</h4>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      const newDate = new Date(currentMonth);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setCurrentMonth(newDate);
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>

                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-header">{day}</div>
                  ))}
                  
                  {calendarDays.map((day, index) => {
                    const isSelected = selectedDate && 
                      day.date.getDate() === selectedDate.getDate() &&
                      day.date.getMonth() === selectedDate.getMonth() &&
                      day.date.getFullYear() === selectedDate.getFullYear();
                    
                    return (
                      <div 
                        key={index}
                        className={`calendar-day ${day.currentMonth ? '' : 'other-month'} ${day.available ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleDateSelect(day)}
                      >
                        {day.date.getDate()}
                      </div>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="time-slots">
                    <h4>Available Time Slots:</h4>
                    <div className="time-slots-grid">
                      {timeSlots.map((time, index) => (
                        <div
                          key={index}
                          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="booking-actions">
                <button className="btn btn-secondary" onClick={handlePrevStep}>
                  Previous
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleNextStep}
                  disabled={!selectedDate || !selectedTime}
                >
                  Next: Your Details
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customer Information */}
          {currentStep === 3 && (
            <div className="booking-form-section">
              <h3 className="form-title">Your Information</h3>
              <p>Please provide your details for the appointment:</p>

              <form id="customerForm">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email (Gmail) *</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@gmail.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="phone" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="facebook">Facebook Profile Link *</label>
                  <input
                    type="url"
                    className="form-control"
                    id="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    required
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any specific design ideas, allergies, or special requests..."
                  ></textarea>
                </div>
              </form>

              <div className="booking-actions">
                <button className="btn btn-secondary" onClick={handlePrevStep}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={handleNextStep}>
                  Next: Confirm Booking
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation & Payment */}
          {currentStep === 4 && (
            <div className="booking-form-section">
              <h3 className="form-title">Confirm Your Booking</h3>
              <p>
                Please review your booking details before proceeding to payment:
              </p>

              <div className="booking-summary">
                <div className="summary-item">
                  <span>Service:</span>
                  <span><strong>{selectedService?.name}</strong></span>
                </div>
                <div className="summary-item">
                  <span>Date:</span>
                  <span>{selectedDate?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="summary-item">
                  <span>Time:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="summary-item">
                  <span>Customer:</span>
                  <span>{formData.fullName}</span>
                </div>
                <div className="summary-item">
                  <span>Email:</span>
                  <span>{formData.email}</span>
                </div>
                <div className="summary-item">
                  <span>Total Price:</span>
                  <span>₱{selectedService?.price}</span>
                </div>
                <div className="summary-item summary-total">
                  <span>Downpayment Required:</span>
                  <span>₱{selectedService?.downpayment}</span>
                </div>
              </div>

              <div className="payment-instructions">
                <h4>Downpayment Instructions</h4>
                <p>
                  To secure your appointment, please pay the downpayment via GCash
                  using the QR code below. Upload your proof of payment after
                  completing the transaction.
                </p>

                <div className="qr-code-container">
                  <div className="qr-code">
                    <div className="qr-placeholder">
                      <i className="fas fa-qrcode fa-3x"></i>
                      <p>GCash QR Code</p>
                      <p>0999-123-4567</p>
                    </div>
                  </div>
                  <p>
                    Scan to pay ₱<span id="downpaymentAmount">{selectedService?.downpayment || 0}</span> downpayment
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="proofPayment">Upload Proof of Payment *</label>
                  <input
                    type="file"
                    className="form-control"
                    id="proofPayment"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                  <small>Accepted formats: JPG, PNG, PDF (Max: 5MB)</small>
                  {proofPayment && (
                    <div className="file-preview">
                      <i className="fas fa-file-upload"></i> {proofPayment.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="booking-actions">
                <button className="btn btn-secondary" onClick={handlePrevStep}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={handleSubmitBooking}>
                  Submit Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Booking;