import { BrowserRouter, Route, Routes } from "react-router-dom";
import AboutUs from "./components/AboutUs";
import Booking from "./components/Booking";
import Footer from "./components/Footer";
import Header from "./components/header";
import Hero from "./components/hero";
import Policies from "./components/Policies";
import Portfolio from "./components/Portfolio";
import Promos from "./components/Promos";
import ReviewPage from "./components/ReviewPage";
import Reviews from "./components/Reviews";

import CancelBookingPage from "./components/cancelBooking";
import useServices from "./hooks/useServices";

// Import CSS files
import "./styles/about-us.css";
import "./styles/booking-system.css";
import "./styles/check-booking.css";
import "./styles/footer.css";
import "./styles/global.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/review-section.css";
import "./styles/services-section.css";

function App() {
  const { services, loading, error } = useServices();

  if (loading) return <p>Loading services...</p>;
  if (error) return <p>Error loading services: {error}</p>;

  return (
    <BrowserRouter>
      <Routes>
        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            <div className="App">
              <Header />
              <main>
                <Hero />
                <AboutUs />
                <Policies />
                <Portfolio />
                <Promos />
                <Booking services={services} />
                <Reviews />
              </main>
              <Footer />
            </div>
          }
        />

        {/* REVIEW PAGE */}
        <Route path="/review" element={<ReviewPage />} />

        {/* CANCEL PAGE */}
        <Route path="/cancel" element={<CancelBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
