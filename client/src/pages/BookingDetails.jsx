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
        <div className="min-h-screen bg-black text-white pt-24 pb-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button (Fixed) */}
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="fixed top-24 left-6 z-40 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2 text-white transition-all shadow-xl group font-semibold"
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
                            className="p-2 bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-colors"
                            title="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-white mt-[-3rem] pl-2">Booking Details</h1>
                </div>

                {/* Status Badge */}
                <div className="flex justify-between items-center mb-6">
                    <span className={`
                        inline-block px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase
                        ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ''}
                        ${booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                        ${booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : ''}
                    `}>
                        {booking.status}
                    </span>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg animate-fade-in">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg animate-fade-in">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Movie & Theater Info */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-xl">
                            <h2 className="text-2xl font-bold text-white mb-6">{movie.title}</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-gray-800 rounded-lg">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-white">{theater.name}</p>
                                        <p className="text-gray-400">{theater.location}, {theater.city}</p>
                                        <p className="text-sm text-indigo-400 mt-1 font-medium">Screen: {showtime.screenName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-gray-800 rounded-lg">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-white">
                                            {showDate.toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-gray-400">
                                            {showDate.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-gray-800 rounded-lg">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-white">
                                            Seats: <span className="text-indigo-400">{booking.seats.map(s => s.seatNumber).join(', ')}</span>
                                        </p>
                                        <p className="text-gray-400">
                                            {booking.seats.length} {booking.seats.length === 1 ? 'seat' : 'seats'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-gray-800 rounded-lg">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-white">Booking ID</p>
                                        <p className="text-gray-400 font-mono tracking-wider">{booking.bookingId}</p>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-300">Total Amount</span>
                                        <span className="text-3xl font-bold text-green-400">₹{booking.totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleDownloadTicket}
                                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
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
                                    className="w-full sm:w-auto px-8 py-3 bg-red-500/10 text-red-500 border border-red-500/50 rounded-xl hover:bg-red-500/20 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel Booking
                                </button>
                            )}

                        </div>

                        {/* Cancel Confirmation Modal */}
                        {showConfirm && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
                                <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6 border border-gray-800 shadow-2xl transform scale-100 animate-slideIn">
                                    <h3 className="text-xl font-bold text-white mb-2">Cancel Booking?</h3>
                                    <p className="text-gray-400 mb-6">
                                        Are you sure you want to cancel this booking? This action cannot be undone and the seats will be released.
                                    </p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowConfirm(false)}
                                            disabled={cancelling}
                                            className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors font-semibold disabled:opacity-50"
                                        >
                                            No, Keep it
                                        </button>
                                        <button
                                            onClick={handleCancelBooking}
                                            disabled={cancelling}
                                            className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 flex justify-center items-center gap-2"
                                        >
                                            {cancelling ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Cancelling...</span>
                                                </>
                                            ) : (
                                                'Yes, Cancel'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </div>

    );
};

export default BookingDetails;
