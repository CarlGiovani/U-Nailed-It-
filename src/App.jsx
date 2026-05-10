import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

import Header from "./components/header";
import Footer from "./components/Footer";
import useServices from "./hooks/useServices";

import "./styles/global.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/hero.css";
import "./styles/about-us.css";
import "./styles/booking-system.css";
import "./styles/review-section.css";
import "./styles/services-section.css";

/* ===============================
   LAZY LOAD ALL PAGES (BIG PERFORMANCE BOOST)
================================ */
const Hero = lazy(() => import("./components/hero"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const Portfolio = lazy(() => import("./components/Portfolio"));
const Promos = lazy(() => import("./components/Promos"));
const Booking = lazy(() => import("./components/Booking"));
const Reviews = lazy(() => import("./components/Reviews"));
const ReviewPage = lazy(() => import("./components/ReviewPage"));
const CancelBookingPage = lazy(() => import("./components/cancelBooking"));
import Policies from "./components/Policies";

/* ===============================
   GLOBAL PAGE WRAPPER (REUSABLE LAYOUT)
================================ */
function PageLayout({ children, showFooter = true }) {
  return (
    <div className="App">
      <Header />
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

/* ===============================
   LOADING SCREEN (used by lazy loading)
================================ */
function PageLoader() {
  return (
    <div className="page-loader">
      <div className="loader-spinner" />
      <p>Loading page...</p>
    </div>
  );
}

/* ===============================
   APP ROUTER
================================ */
function App() {
  const { services, loading, error } = useServices();

  /* API LOADING */
  if (loading)
    return (
      <div className="page-loader">
        <div className="loader-spinner" />
        <p>Loading services...</p>
      </div>
    );

  /* API ERROR */
  if (error)
    return (
      <div className="page-loader">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* HOME */}
          <Route
            path="/"
            element={
              <PageLayout showFooter={false}>
                <Hero />
              </PageLayout>
            }
          />

          {/* ABOUT */}
          <Route
            path="/about"
            element={
              <PageLayout>
                <AboutUs />
              </PageLayout>
            }
          />

          {/* PORTFOLIO */}
          <Route
            path="/portfolio"
            element={
              <PageLayout>
                <Portfolio />
              </PageLayout>
            }
          />

          {/* PROMOS */}
          <Route
            path="/promos"
            element={
              <PageLayout>
                <Promos />
              </PageLayout>
            }
          />

          {/* BOOKING */}
          <Route
            path="/booking"
            element={
              <PageLayout>
                <Booking services={services} />
              </PageLayout>
            }
          />

          {/* REVIEWS */}
          <Route
            path="/reviews"
            element={
              <PageLayout>
                <Reviews />
              </PageLayout>
            }
          />

          {/* WRITE REVIEW PAGE */}
          <Route
            path="/review"
            element={
              <PageLayout>
                <ReviewPage />
              </PageLayout>
            }
          />

                  <Route
            path="/policies"
            element={
              <PageLayout>
                <Policies />
              </PageLayout>
            }
          />

          {/* CANCEL BOOKING */}
          <Route
            path="/cancel"
            element={
              <PageLayout>
                <CancelBookingPage />
              </PageLayout>
            }
          />

          <Route
            path="/cancel-pending"
            element={
              <PageLayout>
                <CancelBookingPage />
              </PageLayout>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;