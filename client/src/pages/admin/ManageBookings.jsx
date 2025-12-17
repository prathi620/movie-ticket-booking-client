import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Filter } from 'lucide-react';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/bookings/admin/all');
                setBookings(data);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking =>
        booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Bookings</h1>
            </div>

            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search bookings (User, ID, Movie)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary"
                    />
                </div>
                <button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg text-gray-400 hover:text-white transition">
                    <Filter className="w-5 h-5" />
                    Filter
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800 text-gray-400">
                                <tr>
                                    <th className="p-4 font-medium">Booking ID</th>
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Movie</th>
                                    <th className="p-4 font-medium">Showtime</th>
                                    <th className="p-4 font-medium">Seats</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-800/50 transition">
                                        <td className="p-4 font-mono text-sm">{booking.bookingId}</td>
                                        <td className="p-4">
                                            <p className="font-medium">{booking.user?.name}</p>
                                            <p className="text-xs text-gray-500">{booking.user?.email}</p>
                                        </td>
                                        <td className="p-4">{booking.movie?.title}</td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {new Date(booking.showtime?.startTime).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm max-w-xs truncate">
                                            {booking.seats.map(s => s.seatNumber).join(', ')}
                                        </td>
                                        <td className="p-4 font-bold">₹{booking.totalPrice}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                                    booking.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                                        'bg-yellow-500/20 text-yellow-500'
                                                }`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBookings.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500">No bookings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBookings;
