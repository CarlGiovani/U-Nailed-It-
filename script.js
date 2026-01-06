// ===== MOBILE MENU TOGGLE =====
document.getElementById("mobileMenuBtn").addEventListener("click", function () {
  document.getElementById("navMenu").classList.toggle("active");
  this.innerHTML = document
    .getElementById("navMenu")
    .classList.contains("active")
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking a link
document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("navMenu").classList.remove("active");
    document.getElementById("mobileMenuBtn").innerHTML =
      '<i class="fas fa-bars"></i>';
  });
});

// ===== SERVICES DATA =====
const services = [
  {
    id: 1,
    name: "Classic Manicure",
    description:
      "Basic nail care including shaping, cuticle care, hand massage, and polish application.",
    price: 450,
    downpayment: 150,
    duration: "45 mins",
    image:
      "https://images.unsplash.com/photo-1607779156197-4c6da2d5c2c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    name: "Gel Manicure",
    description:
      "Long-lasting gel polish that stays chip-free for up to 3 weeks with a glossy finish.",
    price: 750,
    downpayment: 250,
    duration: "1 hour",
    image:
      "https://images.unsplash.com/photo-1574098529597-5f2d4c8a7b2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    name: "Nail Art Design",
    description:
      "Custom nail art with intricate designs, patterns, gems, and hand-painted details.",
    price: 1200,
    downpayment: 400,
    duration: "1.5 hours",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    name: "Acrylic Nail Extensions",
    description:
      "Full set of acrylic nail extensions with your choice of shape and length.",
    price: 1500,
    downpayment: 500,
    duration: "2 hours",
    image:
      "https://images.unsplash.com/photo-1596703923338-48f1c07e4f2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    name: "Spa Pedicure",
    description:
      "Luxurious foot care with exfoliation, massage, and polish for beautiful feet.",
    price: 650,
    downpayment: 220,
    duration: "1 hour",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f91600674a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 6,
    name: "Bridal Package",
    description:
      "Complete bridal nail package for the bride including manicure, pedicure, and custom nail art.",
    price: 2500,
    downpayment: 800,
    duration: "2.5 hours",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
];

// ===== LOAD SERVICES =====
function loadServices() {
  const servicesGrid = document.getElementById("servicesGrid");
  const serviceOptions = document.getElementById("serviceOptions");

  services.forEach((service) => {
    // Services Grid for Services Section
    const serviceCard = document.createElement("div");
    serviceCard.className = "service-card";
    serviceCard.innerHTML = `
                    <div class="service-img">
                        <img src="${service.image}" alt="${service.name}">
                    </div>
                    <div class="service-content">
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        <div class="service-meta">
                            <div class="service-price">₱${service.price}</div>
                            <div class="service-duration">
                                <i class="far fa-clock"></i>
                                <span>${service.duration}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary select-service" data-id="${service.id}">Select Service</button>
                    </div>
                `;
    servicesGrid.appendChild(serviceCard);

    // Service Options for Booking Step 1
    const serviceOption = document.createElement("div");
    serviceOption.className = "service-option";
    serviceOption.dataset.id = service.id;
    serviceOption.innerHTML = `
                    <h4>${service.name}</h4>
                    <p>${service.description}</p>
                    <div style="margin-top: 15px;">
                        <div><strong>Total Price:</strong> ₱${service.price}</div>
                        <div><strong>Downpayment:</strong> ₱${service.downpayment}</div>
                        <div><strong>Duration:</strong> ${service.duration}</div>
                    </div>
                `;
    serviceOptions.appendChild(serviceOption);
  });

  // Add event listeners to service options
  document.querySelectorAll(".service-option").forEach((option) => {
    option.addEventListener("click", function () {
      document.querySelectorAll(".service-option").forEach((opt) => {
        opt.classList.remove("selected");
      });
      this.classList.add("selected");

      // Enable next button
      document.getElementById("nextToStep2").disabled = false;

      // Store selected service
      const serviceId = parseInt(this.dataset.id);
      const selectedService = services.find((s) => s.id === serviceId);
      window.selectedService = selectedService;
    });
  });

  // Add event listeners to "Select Service" buttons
  document.querySelectorAll(".select-service").forEach((button) => {
    button.addEventListener("click", function () {
      const serviceId = parseInt(this.dataset.id);
      const selectedService = services.find((s) => s.id === serviceId);

      // Set as selected in booking step 1
      document.querySelectorAll(".service-option").forEach((opt) => {
        opt.classList.remove("selected");
        if (parseInt(opt.dataset.id) === serviceId) {
          opt.classList.add("selected");
        }
      });

      // Enable next button
      document.getElementById("nextToStep2").disabled = false;
      window.selectedService = selectedService;

      // Scroll to booking section
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });

      // Switch to step 1 of booking
      goToStep(1);
    });
  });
}

// ===== BOOKING SYSTEM =====
let currentStep = 1;
let selectedDate = null;
let selectedTime = null;

function goToStep(step) {
  // Update step indicators
  document.querySelectorAll(".step").forEach((stepEl, index) => {
    if (index + 1 <= step) {
      stepEl.classList.add("active");
    } else {
      stepEl.classList.remove("active");
    }
  });

  // Show current step form
  document
    .querySelectorAll(".booking-form-section")
    .forEach((section, index) => {
      if (index + 1 === step) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

  currentStep = step;

  // Scroll to top of booking form
  document
    .querySelector(".booking-form-section.active")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

// Step navigation event listeners
document.getElementById("nextToStep2").addEventListener("click", () => {
  if (window.selectedService) {
    goToStep(2);
    generateCalendar();
  } else {
    alert("Please select a service first");
  }
});

document
  .getElementById("backToStep1")
  .addEventListener("click", () => goToStep(1));
document.getElementById("nextToStep3").addEventListener("click", () => {
  if (selectedDate && selectedTime) {
    goToStep(3);
  } else {
    alert("Please select a date and time for your appointment");
  }
});

document
  .getElementById("backToStep2")
  .addEventListener("click", () => goToStep(2));
document.getElementById("nextToStep4").addEventListener("click", () => {
  // Validate form
  const form = document.getElementById("customerForm");
  if (form.checkValidity()) {
    updateBookingSummary();
    goToStep(4);
  } else {
    alert("Please fill in all required fields");
    form.reportValidity();
  }
});

document
  .getElementById("backToStep3")
  .addEventListener("click", () => goToStep(3));

// ===== CALENDAR FUNCTIONALITY =====
let currentDate = new Date();

function generateCalendar() {
  const calendarGrid = document.getElementById("calendarGrid");
  const monthYear = document.getElementById("currentMonth");

  // Set month/year display
  const options = { month: "long", year: "numeric" };
  monthYear.textContent = currentDate.toLocaleDateString("en-US", options);

  // Clear previous calendar
  calendarGrid.innerHTML = "";

  // Add day headers
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  days.forEach((day) => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "calendar-day-header";
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });

  // Get first day of month
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  // Get last day of month
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Calculate days from previous month to show
  const startDay = firstDay.getDay();

  // Add days from previous month
  for (let i = 0; i < startDay; i++) {
    const prevDate = new Date(firstDay);
    prevDate.setDate(prevDate.getDate() - (startDay - i));
    const dayElement = createDayElement(prevDate, true);
    calendarGrid.appendChild(dayElement);
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currentDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      i
    );
    const dayElement = createDayElement(currentDay, false);
    calendarGrid.appendChild(dayElement);
  }

  // Add days from next month to fill the grid
  const totalCells = 42; // 6 weeks * 7 days
  const daysSoFar = startDay + lastDay.getDate();
  const daysToAdd = totalCells - daysSoFar;

  for (let i = 1; i <= daysToAdd; i++) {
    const nextDate = new Date(lastDay);
    nextDate.setDate(nextDate.getDate() + i);
    const dayElement = createDayElement(nextDate, true);
    calendarGrid.appendChild(dayElement);
  }

  // Generate time slots for selected date
  generateTimeSlots();
}

function createDayElement(date, isOtherMonth) {
  const dayElement = document.createElement("div");
  dayElement.className = "calendar-day";
  dayElement.textContent = date.getDate();

  // Mark weekends as unavailable
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Mark some dates as unavailable (for demo)
  const isUnavailable = isOtherMonth || isWeekend || Math.random() < 0.2;

  if (isUnavailable) {
    dayElement.classList.add("unavailable");
    dayElement.style.cursor = "not-allowed";
  } else {
    dayElement.classList.add("available");

    // Check if this is the selected date
    if (
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    ) {
      dayElement.classList.add("selected");
    }

    // Add click event
    dayElement.addEventListener("click", function () {
      if (!isUnavailable) {
        // Remove selected from all days
        document.querySelectorAll(".calendar-day").forEach((day) => {
          day.classList.remove("selected");
        });

        // Add selected to this day
        this.classList.add("selected");

        // Store selected date
        selectedDate = new Date(date);

        // Generate time slots for selected date
        generateTimeSlots();
      }
    });
  }

  return dayElement;
}

function generateTimeSlots() {
  const timeSlotsContainer = document.getElementById("timeSlots");
  timeSlotsContainer.innerHTML = "";

  if (!selectedDate) {
    timeSlotsContainer.innerHTML = "<p>Please select a date first</p>";
    return;
  }

  // Generate time slots (for demo)
  const timeSlots = [
    "9:00 AM",
    "10:30 AM",
    "12:00 PM",
    "1:30 PM",
    "3:00 PM",
    "4:30 PM",
  ];

  timeSlots.forEach((slot) => {
    // Randomly mark some slots as unavailable
    const isAvailable = Math.random() < 0.7;

    const timeSlotElement = document.createElement("div");
    timeSlotElement.className = "time-slot";
    timeSlotElement.textContent = slot;

    if (!isAvailable) {
      timeSlotElement.style.opacity = "0.5";
      timeSlotElement.style.cursor = "not-allowed";
      timeSlotElement.title = "This time slot is already booked";
    } else {
      // Check if this is the selected time
      if (selectedTime === slot) {
        timeSlotElement.classList.add("selected");
      }

      timeSlotElement.addEventListener("click", function () {
        if (isAvailable) {
          // Remove selected from all time slots
          document.querySelectorAll(".time-slot").forEach((slot) => {
            slot.classList.remove("selected");
          });

          // Add selected to this time slot
          this.classList.add("selected");

          // Store selected time
          selectedTime = slot;
        }
      });
    }

    timeSlotsContainer.appendChild(timeSlotElement);
  });
}

// Month navigation
document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar();
});

// ===== BOOKING SUMMARY =====
function updateBookingSummary() {
  const summaryContainer = document.getElementById("bookingSummary");
  const downpaymentAmount = document.getElementById("downpaymentAmount");

  if (!window.selectedService || !selectedDate || !selectedTime) {
    summaryContainer.innerHTML = "<p>Please complete all booking steps</p>";
    return;
  }

  const customerName = document.getElementById("fullName").value;
  const customerEmail = document.getElementById("email").value;
  const customerPhone = document.getElementById("phone").value;

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  summaryContainer.innerHTML = `
                <div class="summary-item">
                    <span>Service:</span>
                    <span><strong>${window.selectedService.name}</strong></span>
                </div>
                <div class="summary-item">
                    <span>Date & Time:</span>
                    <span>${formattedDate} at ${selectedTime}</span>
                </div>
                <div class="summary-item">
                    <span>Customer:</span>
                    <span>${customerName}</span>
                </div>
                <div class="summary-item">
                    <span>Email:</span>
                    <span>${customerEmail}</span>
                </div>
                <div class="summary-item">
                    <span>Phone:</span>
                    <span>${customerPhone}</span>
                </div>
                <div class="summary-item">
                    <span>Total Price:</span>
                    <span>₱${window.selectedService.price}</span>
                </div>
                <div class="summary-item summary-total">
                    <span>Downpayment Required:</span>
                    <span>₱${window.selectedService.downpayment}</span>
                </div>
            `;

  downpaymentAmount.textContent = window.selectedService.downpayment;
}

// ===== SUBMIT BOOKING =====
document.getElementById("submitBooking").addEventListener("click", function () {
  const proofPayment = document.getElementById("proofPayment");

  if (!proofPayment.files.length) {
    alert("Please upload proof of payment");
    return;
  }

  // In a real system, this would send data to a backend
  // For demo, we'll just show a success message

  this.disabled = true;
  this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  setTimeout(() => {
    alert(
      "Booking submitted successfully! You will receive a confirmation email shortly. Your booking is now pending approval."
    );

    // Reset form
    resetBookingForm();

    // Go back to step 1
    goToStep(1);

    this.disabled = false;
    this.innerHTML = "Submit Booking";
  }, 2000);
});

function resetBookingForm() {
  // Reset selected service
  window.selectedService = null;
  document.querySelectorAll(".service-option").forEach((opt) => {
    opt.classList.remove("selected");
  });
  document.getElementById("nextToStep2").disabled = true;

  // Reset date and time
  selectedDate = null;
  selectedTime = null;

  // Reset customer form
  document.getElementById("customerForm").reset();

  // Reset file input
  document.getElementById("proofPayment").value = "";

  // Reset calendar to current month
  currentDate = new Date();
}

// ===== INITIALIZE =====
document.addEventListener("DOMContentLoaded", function () {
  // Load services
  loadServices();

  // Initialize calendar
  generateCalendar();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Disable next button initially
  document.getElementById("nextToStep2").disabled = true;
});
