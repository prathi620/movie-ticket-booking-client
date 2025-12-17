
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import MoviePage from './pages/MoviePage';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';

// Admin Imports
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageTheaters from './pages/admin/ManageTheaters';
import ManageShowtimes from './pages/admin/ManageShowtimes';
import ManageBookings from './pages/admin/ManageBookings';
import Analytics from './pages/admin/Analytics';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/movie/:id" element={<><Navbar /><MoviePage /></>} />

            {/* User Protected Routes */}
            <Route path="/booking/:showtimeId" element={
                <ProtectedRoute><BookingPage /></ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
                <ProtectedRoute><><Navbar /><MyBookings /></></ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute><><Navbar /><ProfilePage /></></ProtectedRoute>
            } />
            <Route path="/booking-details/:id" element={
                <ProtectedRoute><><Navbar /><BookingDetails /></></ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="movies" element={<ManageMovies />} />
                <Route path="theaters" element={<ManageTheaters />} />
                <Route path="showtimes" element={<ManageShowtimes />} />
                <Route path="bookings" element={<ManageBookings />} />
                <Route path="analytics" element={<Analytics />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
                    <main className="flex-grow">
                        <AppRoutes />
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

