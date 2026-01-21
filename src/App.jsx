import AboutUs from "./components/AboutUs";
import Booking from "./components/Booking";
import CheckBooking from "./components/CheckBooking";
import Footer from "./components/Footer";
import Header from "./components/header";
import Hero from "./components/hero";
import Policies from "./components/Policies";
import Portfolio from "./components/Portfolio";
import Promos from "./components/Promos";
import Reviews from "./components/Reviews";
import Services from "./components/Services";

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
    <div className="App">
      <Header />
      <main>
        <Hero />
        <AboutUs />
        {/* <Services services={services} /> */}
        <Policies />
        <Portfolio />
        <Promos />
        <Booking services={services} />
        <Reviews />
        <CheckBooking />
      </main>
      <Footer />
    </div>
  );
}

export default App;
