import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { bookingAPI } from '../services/api';
import AuthContext from '../context/AuthContext';
import SeatingChart from '../components/SeatingChart';
import { ArrowLeft, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe (Replace with your actual Publishable Key or env variable)
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    : null;

const CheckoutForm = ({ clientSecret, onSuccess, onCancel, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) return;
        if (!clientSecret) return;
    }, [stripe, clientSecret]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/my-bookings', // Redirect not used in this flow usually but required
            },
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message);
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else {
            setMessage("Unexpected state");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <PaymentElement />
            {message && <div className="text-red-500 mt-2 text-sm">{message}</div>}
            <div className="flex gap-4 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 transition"
                >
                    Cancel
                </button>
                <button
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    className="flex-1 py-3 rounded-lg font-bold bg-primary hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Processing..." : `Pay ₹${amount}`}
                </button>
            </div>
        </form>
    );
};

const BookingPage = () => {
    const { showtimeId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showtime, setShowtime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(false);

    // Payment State
    const [clientSecret, setClientSecret] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingBookingData, setPendingBookingData] = useState(null);
    const [showMethodSelection, setShowMethodSelection] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('');

    useEffect(() => {
        const fetchShowtime = async () => {
            try {
                const { data } = await api.get(`/movies/showtime/${showtimeId}`);
                setShowtime(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchShowtime();
    }, [showtimeId]);

    const handleSeatSelect = (seat) => {
        if (!seat) return;
        const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seat.seatNumber));
        } else {
            if (seat.status !== 'available') return;
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleBookClick = () => {
        if (!user) {
            alert('Please login to book tickets');
            navigate('/login');
            return;
        }
        setShowMethodSelection(true);
    };

    const [showUpiModal, setShowUpiModal] = useState(false);
    const [upiStep, setUpiStep] = useState('input'); // input, processing, success
    const [upiId, setUpiId] = useState('');

    const [currentSessionId, setCurrentSessionId] = useState('');

    const handleUpiSubmit = (e) => {
        e.preventDefault();
        setUpiStep('processing');

        // Simulate "Open GPay" delay
        setTimeout(() => {
            setUpiStep('success');
            // Complete booking after success showing
            setTimeout(() => {
                const seatNumbers = selectedSeats.map(s => s.seatNumber);
                const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

                const bookingData = {
                    showtimeId,
                    seats: seatNumbers,
                    totalPrice,
                    sessionId: currentSessionId, // USE THE STORED ID
                    paymentIntentId: `mock_upi_${Date.now()}`
                };

                finalizeBooking(bookingData);
            }, 1000);
        }, 2000);
    };

    const initiateBooking = async (method) => {
        setShowMethodSelection(false);
        setSelectedMethod(method);

        // 1. Generate Session & Lock Seats first
        const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setCurrentSessionId(sessionId); // Store it!
        const seatNumbers = selectedSeats.map(s => s.seatNumber);

        try {
            if (method !== 'card') {
                // For UPI, verify stock/lock server side
                await bookingAPI.lockSeats({
                    showtimeId,
                    seatNumbers,
                    sessionId
                });

                // Show Simulation Modal instead of alerts
                setShowUpiModal(true);
                setUpiStep('input');
                setUpiId('');
                return;
            }

            // Card Flow (Standard)
            setLoading(true);
            const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);
            await bookingAPI.lockSeats({ showtimeId, seatNumbers, sessionId });

            const { data: paymentData } = await bookingAPI.createPayment({
                amount: totalPrice,
                bookingId: `TEMP_${Date.now()}`
            });

            const bookingData = {
                showtimeId,
                seats: seatNumbers,
                totalPrice,
                sessionId,
                paymentIntentId: paymentData.paymentIntentId
            };

            if (stripePromise && paymentData.clientSecret && !paymentData.clientSecret.startsWith('mock_')) {
                setClientSecret(paymentData.clientSecret);
                setPendingBookingData(bookingData);
                setShowPaymentModal(true);
                setLoading(false);
            } else {
                await finalizeBooking(bookingData);
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Booking initiation failed');
            setLoading(false);
        }
    };

    const finalizeBooking = async (bookingData) => {
        try {
            setLoading(true);
            await bookingAPI.create(bookingData);
            alert('Booking Successful!');
            navigate('/my-bookings');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Booking confirmation failed');
        } finally {
            setLoading(false);
            setShowPaymentModal(false);
        }
    };

    const now = new Date();
    if (!showtime) return <div className="text-center mt-20">Loading...</div>;

    if (new Date(showtime.startTime) < now) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Showtime Expired</h2>
                <p className="text-gray-400 mb-6">This showtime has already started or ended.</p>
                <button
                    onClick={() => navigate(`/movie/${showtime.movie._id}`)}
                    className="px-6 py-2 bg-indigo-600 rounded-lg text-white"
                >
                    Back to Movie
                </button>
            </div>
        );
    }

    const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

    return (
        <div className="min-h-screen bg-black text-white px-6 pt-24 pb-8">
            <div className="max-w-7xl mx-auto relative">
                {/* Back Button */}
                <button
                    onClick={() => navigate(`/movie/${showtime.movie._id}`)}
                    className="fixed top-24 left-6 z-40 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2 text-white transition-all shadow-xl group font-semibold"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Movie</span>
                </button>


                <h1 className="text-3xl font-bold mb-2">{showtime.movie.title}</h1>
                <p className="text-gray-400 mb-8">{showtime.theater.name} - {showtime.screenName} | {new Date(showtime.startTime).toLocaleString()}</p>

                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 mb-8 flex justify-center">
                    <SeatingChart
                        seats={showtime.seats}
                        selectedSeats={selectedSeats}
                        onSeatSelect={handleSeatSelect}
                    />
                </div>

                <div className="bg-black/90 p-8 rounded-2xl border border-gray-700 flex justify-between items-center shadow-2xl h-32">
                    <div>
                        <p className="text-gray-400 text-lg mb-1">Selected Seats</p>
                        <p className="text-2xl font-bold text-white tracking-wide">{selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : 'None'}</p>
                    </div>
                    <div className="text-center px-8 border-x border-gray-700">
                        <p className="text-gray-400 text-lg mb-1">Total Price</p>
                        <p className="text-4xl font-extrabold text-red-500">₹{totalPrice}</p>
                    </div>
                    <button
                        onClick={handleBookClick}
                        disabled={selectedSeats.length === 0 || loading}
                        className={`h-16 px-10 rounded-xl font-bold text-xl text-white transition-all transform hover:scale-105 shadow-lg ${selectedSeats.length === 0
                            ? 'bg-gray-800 opacity-50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'
                            }`}
                    >
                        {loading ? 'Processing...' : 'Proceed to Book'}
                    </button>
                </div>
                <div className="h-12"></div>

                {/* Payment Method Selection Modal */}
                {showMethodSelection && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6 border border-gray-800">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Select Payment Method</h2>
                                <button onClick={() => setShowMethodSelection(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">

                                <button
                                    onClick={() => initiateBooking('upi')}
                                    className="w-full p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-primary flex items-center justify-between group transition-all"
                                >
                                    <span className="font-medium text-white">UPI / GPay</span>
                                    <span className="text-gray-500 group-hover:text-primary">&rarr;</span>
                                </button>

                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && clientSecret && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6 border border-gray-800">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Secure Payment</h2>
                                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <Elements options={{ clientSecret, appearance: { theme: 'night' } }} stripe={stripePromise}>
                                <CheckoutForm
                                    clientSecret={clientSecret}
                                    amount={totalPrice}
                                    onSuccess={(paymentIntentId) => finalizeBooking({ ...pendingBookingData, paymentIntentId })}
                                    onCancel={() => setShowPaymentModal(false)}
                                />
                            </Elements>
                        </div>
                    </div>
                )}

                {/* Simulated UPI Modal */}
                {showUpiModal && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
                        <div className="bg-white text-gray-900 rounded-xl w-full max-w-sm p-6 relative">
                            <button
                                onClick={() => setShowUpiModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold">UPI Payment</h3>
                                <p className="text-sm text-gray-500">Google Pay / PhonePe / Paytm</p>
                            </div>

                            {upiStep === 'input' && (
                                <form onSubmit={handleUpiSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter UPI ID</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="example@oksbi"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                                        Verify & Pay ₹{totalPrice}
                                    </button>
                                </form>
                            )}

                            {upiStep === 'processing' && (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <h4 className="font-semibold text-lg">Waiting for confirmation...</h4>
                                    <p className="text-gray-500 text-sm mt-2">Open your Payment App and approve the request.</p>
                                </div>
                            )}

                            {upiStep === 'success' && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-xl text-green-600">Payment Successful!</h4>
                                    <p className="text-gray-500 text-sm">Redirecting...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
