import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import Header from "./layout/navBar";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load non-critical routes for better initial load
const Contact = lazy(() => import("./pages/contact"));
const AllOffers = lazy(() => import("./pages/offers"));
const Login = lazy(() => import("./pages/login"));
const OfferUpload = lazy(() => import("./components/ui/OfferUpload"));
const MenuUpload = lazy(() => import("./components/ui/MenuUpload"));
const MenuSection = lazy(() => import("./components/ui/menu"));
const StaffDashboard = lazy(() => import("./pages/staff-dashboard"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      <div className="h-4 w-32 bg-gray-200 rounded"></div>
    </div>
  </div>
);

function App() {
  return (
    <div>
      <Header />

      {/* Page content with padding to avoid overlap */}
      <div style={{ paddingTop: "60px" }}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/offers" element={<AllOffers />} />
            <Route path="/contact" element={<Contact />} />

            {/* Only this route is protected */}
            <Route
              path="/offerupload"
              element={
                <ProtectedRoute>
                  <OfferUpload />
                </ProtectedRoute>
              }
            />

            <Route
              path="/menuupload"
              element={
                <ProtectedRoute>
                  <MenuUpload />
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/menu" element={<MenuSection />} />
            <Route path="/login" element={<Login />} />

            {/* Redirect unmatched routes to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
