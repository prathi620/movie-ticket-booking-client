import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/bookings/my-bookings');
                setBookings(data.all || []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchBookings();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white px-4 pt-24 pb-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="fixed top-24 left-6 z-40 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2 text-white transition-all shadow-xl group font-semibold"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Home</span>
                </button>

                <h1 className="text-4xl font-bold mb-8 text-white tracking-tight">My Bookings</h1>

                <div className="space-y-6">
                    {bookings.map(booking => (
                        <div key={booking._id} className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-gray-900/80">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Poster */}
                                <div className="w-full md:w-32 flex-shrink-0">
                                    {booking.movie?.posterUrl ? (
                                        <img src={booking.movie.posterUrl} alt="poster" className="w-full h-48 md:h-48 object-cover rounded-xl shadow-lg" />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-800 rounded-xl flex items-center justify-center">
                                            <span className="text-gray-600 text-xs">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-2xl font-bold text-white leading-tight">{booking.movie?.title || 'Unknown Title'}</h3>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {booking.status}
                                            </div>
                                        </div>

                                        <p className="text-lg text-gray-300 font-medium mb-1">{booking.theater?.name || 'Theater Not Found'}</p>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {booking.showtime?.screenName} • {booking.showtime?.startTime && new Date(booking.showtime.startTime).toLocaleString(undefined, {
                                                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {booking.seats.map((seat, i) => (
                                                <span key={i} className="text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 font-mono">
                                                    {seat.seatNumber}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between pt-4 border-t border-gray-800">
                                        <div className="text-left">
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Booking ID</p>
                                            <p className="text-sm font-mono text-gray-400">{booking.bookingId}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold text-right">Total</p>
                                                <p className="text-2xl font-bold text-primary">₹{booking.totalPrice}</p>
                                            </div>
                                            <Link
                                                to={`/booking-details/${booking._id}`}
                                                className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
                                            >
                                                View Ticket
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {bookings.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No bookings found.</p>
                            <Link to="/" className="text-primary hover:text-red-400 font-bold">
                                Browse Movies
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
