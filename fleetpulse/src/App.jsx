import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AddVehiclePage from './pages/AddVehiclePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import EditProfilePage from './pages/EditProfilePage';
import SplashScreen from './components/SplashScreen';

/**
 * A component to protect routes.
 * Checks for a token in localStorage. If it exists, it renders the child routes (via Outlet).
 * If not, it redirects the user to the /login page.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" />;
};

/**
 * A component for public routes that should not be accessible to logged-in users.
 * If a token exists, it redirects to the home page.
 * If not, it renders the child routes (e.g., the AuthPage).
 */
const PublicRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/" /> : <Outlet />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading time for the splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  return isLoading ? (
    <SplashScreen />
  ) : (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<AuthPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/add-vehicle" element={<AddVehiclePage />} />
          <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
        </Route>
        {/* Redirect any other path to the home page for logged-in users, or login for others */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
