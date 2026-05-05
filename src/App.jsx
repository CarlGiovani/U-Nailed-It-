import { BrowserRouter, Route, Routes } from "react-router-dom";

// PAGES / COMPONENTS
import AboutUs from "./components/AboutUs";
import Booking from "./components/Booking";
import CancelBookingPage from "./components/cancelBooking";
import Footer from "./components/Footer";
import Header from "./components/header";
import Hero from "./components/hero";
import Policies from "./components/Policies";
import Portfolio from "./components/Portfolio";
import Promos from "./components/Promos";
import ReviewPage from "./components/ReviewPage";
import Reviews from "./components/Reviews";

// HOOK
import useServices from "./hooks/useServices";

// CSS
import "./styles/about-us.css";
import "./styles/booking-system.css";
import "./styles/check-booking.css";
import "./styles/footer.css";
import "./styles/global.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/review-section.css";
import "./styles/services-section.css";

// =====================
// HOME PAGE
// =====================
function HomePage() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Policies />
        <Portfolio />
        <Promos />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}

// =====================
// ABOUT PAGE
// =====================
function AboutPage() {
  return (
    <div className="App">
      <Header />
      <main>
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
}

// =====================
// BOOKING PAGE
// =====================
function BookingPage({ services }) {
  return (
    <div className="App">
      <Header />
      <main>
        <Booking services={services} />
      </main>
      <Footer />
    </div>
  );
}

// =====================
// APP ROUTER
// =====================
function App() {
  const { services, loading, error } = useServices();

  if (loading) return <p>Loading services...</p>;
  if (error) return <p>Error loading services: {error}</p>;

  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<HomePage />} />

        {/* ABOUT */}
        <Route path="/about" element={<AboutPage />} />

        {/* BOOKING */}
        <Route path="/booking" element={<BookingPage services={services} />} />

        {/* REVIEW */}
        <Route path="/review" element={<ReviewPage />} />

        {/* CANCEL BOOKING */}
        <Route path="/cancel" element={<CancelBookingPage />} />
        <Route path="/cancel-pending" element={<CancelBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
