import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AddVehiclePage from './pages/AddVehiclePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import EditProfilePage from './pages/EditProfilePage';
import UpdateVehiclePage from './pages/UpdateVehiclePage';
import FuelLogsPage from './pages/FuelLogsPage';
import MaintenanceLogsPage from './pages/MaintenanceLogsPage';
import InsuranceLogsPage from './pages/InsuranceLogsPage';
import SplashScreen from './components/SplashScreen';
import { getAccessToken, clearTokens, fetchWithAuth } from './utils/api';

/**
 * A component to protect routes.
 * Checks for a token in localStorage. If it exists, it renders the child routes (via Outlet).
 * If not, it redirects the user to the /login page.
 */
const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
          navigate('/login');
          return;
        }

        // Try to fetch user profile using fetchWithAuth to trigger token refresh if needed
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`);
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // If response is not ok, and fetchWithAuth didn't throw (meaning refresh also failed)
          // Then it's an unauthenticated state.
          setIsAuthenticated(false);
          await clearTokens(); // Ensure tokens are cleared
          navigate('/login');
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        await clearTokens(); // Ensure tokens are cleared if an error occurred during refresh
        navigate('/login');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-gray-900 text-white text-center p-8">Authenticating...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
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
          <Route path="/vehicle/:id/edit" element={<UpdateVehiclePage />} />
          <Route path="/vehicle/:id/fuel-logs" element={<FuelLogsPage />} />
          <Route path="/vehicle/:id/maintenance-logs" element={<MaintenanceLogsPage />} />
          <Route path="/vehicle/:id/insurance-logs" element={<InsuranceLogsPage />} />
        </Route>
        {/* Redirect any other path to the home page for logged-in users, or login for others */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
