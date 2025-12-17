import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Ticket, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-[#0F172A] border-b border-slate-800 sticky top-0 z-50">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-3xl font-bold text-red-600 tracking-tight">
                            MovieBook
                        </span>
                    </Link>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-gray-300 hover:text-white transition-colors font-medium text-base"
                        >
                            Home
                        </Link>

                        {isAuthenticated && (
                            <Link
                                to="/my-bookings"
                                className="text-gray-300 hover:text-white transition-colors font-medium text-base flex items-center gap-2"
                            >
                                <Ticket className="w-4 h-4" />
                                <span>My Bookings</span>
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="text-gray-300 hover:text-white transition-colors font-medium text-base flex items-center gap-2"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Admin</span>
                            </Link>
                        )}

                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4 pl-6 border-l border-slate-700">
                                    <Link to="/profile" className="text-base font-medium text-white hover:text-red-500 transition-colors flex items-center gap-2">
                                        <User size={18} />
                                        {user?.name}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-300 hover:text-white font-medium text-base transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold text-base transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
