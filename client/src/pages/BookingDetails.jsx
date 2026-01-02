import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'react-qr-code';
import { bookingAPI } from '../services/api';
import Loading from '../components/Loading';
import { ArrowLeft } from 'lucide-react';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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
        setCancelling(true);
        setErrorMessage('');
        try {
            await bookingAPI.cancel(id);
            setSuccessMessage('Booking cancelled successfully. Refund will be processed in 5-7 business days.');
            setTimeout(() => {
                navigate('/my-bookings');
            }, 3000);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to cancel booking');
            setShowConfirm(false);
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
        <div className="min-h-screen bg-gray-50 pt-24 pb-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button (Fixed) */}
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="fixed top-6 left-6 z-50 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2 text-white transition-all shadow-xl group font-semibold"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to My Bookings</span>
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1"></div> {/* Spacer to push Close button to right */}
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            title="Close"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mt-[-3rem] pl-2">Booking Details</h1>
                </div>

                {/* Status Badge */}
                <div className="flex justify-between items-center mb-6">
                    <span className={`
                        inline-block px-4 py-2 rounded-full text-sm font-semibold
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                        ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                        ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}>
                        {booking.status.toUpperCase()}
                    </span>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-100 text-green-700 border border-green-200 rounded-lg animate-fade-in">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg animate-fade-in">
                        {errorMessage}
                    </div>
                )}

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

                            {canCancel && !showConfirm && (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    disabled={cancelling}
                                    className="flex-1 min-w-[200px] px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel Booking
                                </button>
                            )}

                            {showConfirm && (
                                <div className="flex-1 min-w-[300px] p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-3">
                                    <p className="text-red-800 font-semibold">Are you sure you want to cancel this booking? This action cannot be undone.</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCancelBooking}
                                            disabled={cancelling}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                                        >
                                            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                        </button>
                                        <button
                                            onClick={() => setShowConfirm(false)}
                                            disabled={cancelling}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                                        >
                                            No, Keep it
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
