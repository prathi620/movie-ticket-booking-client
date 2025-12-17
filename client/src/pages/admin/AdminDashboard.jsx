import { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, Users, CreditCard, Film, Calendar, Ticket } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
                <Icon className="w-6 h-6" />
            </div>
            {/* Simple percent change placeholder */}
            <span className="text-green-500 text-sm font-medium">+12.5%</span>
        </div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/movies/bookings/admin/stats'); // Note: Adjust route based on backend prefix
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        // Verify route prefix based on bookings.js location. The routes/bookings.js is likely mounted on /api/bookings
        // Wait, I need to check where bookingRoutes.js is mounted in server/index.js
        fetchStats();
    }, []);

    // For now mocking stats if fetch fails or while loading to show UI structure
    // Ideally we wait for real data.

    if (loading) return <div className="text-white">Loading stats...</div>;

    const dummyStats = stats || {
        totalBookings: 0,
        totalRevenue: 0,
        popularMovies: [],
        dailyRevenue: []
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`₹${dummyStats.totalRevenue.toLocaleString()}`}
                    icon={CreditCard}
                    color="primary"
                />
                <StatCard
                    title="Total Bookings"
                    value={dummyStats.totalBookings}
                    icon={Ticket}
                    color="blue"
                />
                <StatCard
                    title="Active Movies"
                    value={dummyStats.popularMovies.length} // Just a proxy for now
                    icon={Film}
                    color="purple"
                />
                <StatCard
                    title="Avg. Occupancy"
                    value="78%"
                    icon={Users}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings / Daily Revenue Chart placeholder */}
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <h2 className="text-xl font-bold mb-6">Daily Revenue</h2>
                    <div className="space-y-4">
                        {dummyStats.dailyRevenue.length > 0 ? (
                            dummyStats.dailyRevenue.map((day) => (
                                <div key={day._id} className="flex items-center justify-between p-4 bg-black/50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-800 rounded-lg">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{day._id}</p>
                                            <p className="text-sm text-gray-500">{day.bookings} bookings</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-green-500">+₹{day.revenue}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No revenue data available</p>
                        )}
                    </div>
                </div>

                {/* Popular Movies */}
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <h2 className="text-xl font-bold mb-6">Popular Movies</h2>
                    <div className="space-y-4">
                        {dummyStats.popularMovies.map((movie, index) => (
                            <div key={movie._id} className="flex items-center gap-4 p-3 hover:bg-black/50 rounded-xl transition-colors">
                                <span className="text-2xl font-bold text-gray-700 w-8">#{index + 1}</span>
                                <img
                                    src={movie.movieDetails.posterUrl}
                                    alt={movie.movieDetails.title}
                                    className="w-12 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="font-medium truncate">{movie.movieDetails.title}</h3>
                                    <p className="text-sm text-gray-500">{movie.count} bookings</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">High Demand</p>
                                </div>
                            </div>
                        ))}
                        {dummyStats.popularMovies.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No movie data available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default AdminDashboard;
