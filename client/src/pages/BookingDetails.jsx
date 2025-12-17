import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'react-qr-code';
import { bookingAPI } from '../services/api';
import Loading from '../components/Loading';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            const response = await bookingAPI.getById(id);
            setBooking(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTicket = async () => {
        try {
            const response = await bookingAPI.downloadTicket(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ticket-${booking.bookingId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download ticket');
        }
    };

    const handleCancelBooking = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        setCancelling(true);
        try {
            await bookingAPI.cancel(id);
            alert('Booking cancelled successfully. Refund will be processed in 5-7 business days.');
            navigate('/my-bookings');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <Loading />;
    if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
    if (!booking) return <div className="text-center py-12">Booking not found</div>;

    const showtime = booking.showtime;
    const movie = booking.movie;
    const theater = booking.theater;
    const showDate = new Date(showtime.startTime);
    const isPastShow = showDate < new Date();
    const canCancel = booking.status === 'confirmed' && !isPastShow;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to My Bookings
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                </div>

                {/* Status Badge */}
                <div className="mb-6">
                    <span className={`
                        inline-block px-4 py-2 rounded-full text-sm font-semibold
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                        ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                        ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}>
                        {booking.status.toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Movie & Theater Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{movie.title}</h2>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-gray-900">{theater.name}</p>
                                        <p className="text-sm text-gray-600">{theater.location}, {theater.city}</p>
                                        <p className="text-sm text-gray-600">Screen: {showtime.screenName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {showDate.toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {showDate.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            Seats: {booking.seats.map(s => s.seatNumber).join(', ')}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {booking.seats.length} {booking.seats.length === 1 ? 'seat' : 'seats'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-gray-900">Booking ID</p>
                                        <p className="text-sm text-gray-600 font-mono">{booking.bookingId}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                        <span className="text-2xl font-bold text-green-600">₹{booking.totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleDownloadTicket}
                                className="flex-1 min-w-[200px] px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Ticket (PDF)
                            </button>

                            {canCancel && (
                                <button
                                    onClick={handleCancelBooking}
                                    disabled={cancelling}
                                    className="flex-1 min-w-[200px] px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                                </button>
                            )}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
