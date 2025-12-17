import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Film, Video, Calendar, Ticket, LogOut, Home } from 'lucide-react';

const AdminLayout = () => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                    <p className="mb-4">You do not have permission to view this page.</p>
                    <Link to="/" className="text-primary hover:underline">Go Home</Link>
                </div>
            </div>
        );
    }

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/movies', icon: Film, label: 'Movies' },
        { path: '/admin/theaters', icon: Video, label: 'Theaters' },
        { path: '/admin/showtimes', icon: Calendar, label: 'Showtimes' },
        { path: '/admin/bookings', icon: Ticket, label: 'Bookings' },
        { path: '/admin/analytics', icon: LayoutDashboard, label: 'Analytics' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-primary tracking-wider">CINE<span className="text-white">TIK</span></h1>
                    <p className="text-xs text-gray-500 mt-1">Admin Portal</p>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">View Site</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>

                    <div className="px-4 py-2 mt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {user?.name?.[0] || 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
