import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/analyticsAPI';
import api from '../../services/api';
import Loading from '../../components/Loading';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [occupancy, setOccupancy] = useState([]);
    const [trends, setTrends] = useState([]);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [statsRes, revenueRes, occupancyRes, trendsRes] = await Promise.all([
                api.get('/analytics/stats', { params: dateRange }),
                api.get('/analytics/revenue', { params: { ...dateRange, groupBy: 'day' } }),
                api.get('/analytics/occupancy', { params: dateRange }),
                api.get('/analytics/trends', { params: { period: '30' } })
            ]);

            setStats(statsRes.data);
            setRevenue(revenueRes.data);
            setOccupancy(occupancyRes.data);
            setTrends(trendsRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Track your booking performance and revenue</p>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.bookingsByStatus.find(s => s._id === 'confirmed')?.count || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.bookingsByStatus.find(s => s._id === 'cancelled')?.count || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Popular Movies */}
            {stats && stats.popularMovies && stats.popularMovies.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Movies</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Movie
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bookings
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.popularMovies.map((movie, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {movie.posterUrl && (
                                                    <img
                                                        src={movie.posterUrl}
                                                        alt={movie.title}
                                                        className="h-12 w-8 object-cover rounded mr-3"
                                                    />
                                                )}
                                                <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{movie.bookings}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-green-600">₹{movie.revenue.toLocaleString()}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Theater Occupancy */}
            {occupancy && occupancy.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Theater Occupancy</h2>
                    <div className="space-y-4">
                        {occupancy.map((theater, index) => (
                            <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{theater.theaterName}</h3>
                                        <p className="text-sm text-gray-600">{theater.location}, {theater.city}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">₹{theater.revenue.toLocaleString()}</p>
                                        <p className="text-sm text-gray-600">{theater.totalBookings} bookings</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {theater.totalSeatsBooked} seats booked
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Revenue Trends */}
            {trends && trends.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Trends (Last 30 Days)</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bookings
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg. Booking Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trends.slice(0, 10).map((trend, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(trend.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {trend.bookings}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                            ₹{trend.revenue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{trend.avgBookingValue.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
