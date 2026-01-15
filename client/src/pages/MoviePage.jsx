import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, Star, MapPin, ArrowLeft } from 'lucide-react';

const MoviePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loadingShowtimes, setLoadingShowtimes] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setShowtimes([]); // Clear previous showtimes
            setLoadingShowtimes(true);
            try {
                const movieRes = await api.get(`/movies/${id}`);
                setMovie(movieRes.data);
                const showtimeRes = await api.get(`/movies/${id}/showtimes`);
                setShowtimes(showtimeRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingShowtimes(false);
            }
        };
        fetchData();
    }, [id]);

    if (!movie) return <div className="text-center mt-20">Loading...</div>;

    // Filter showtimes based on View Mode AND exclude past dates
    const now = new Date();
    const filteredShowtimes = showtimes.filter(showtime => {
        const showtimeDate = new Date(showtime.startTime);

        // First, filter out past showtimes
        if (showtimeDate < now) {
            return false;
        }

        // Then apply view mode filters
        if (viewMode === 'calendar' && selectedDate) {
            // Compare YYYY-MM-DD parts locally
            const showDate = new Date(showtime.startTime).toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
            return showDate === selectedDate;
        }
        return true;
    });

    // Group filtered showtimes by theater
    const showtimesByTheater = filteredShowtimes.reduce((acc, showtime) => {
        const theaterName = showtime.theater.name;
        if (!acc[theaterName]) {
            acc[theaterName] = [];
        }
        acc[theaterName].push(showtime);
        return acc;
    }, {});

    // Group filtered showtimes by Date
    const showtimesByDate = filteredShowtimes.reduce((acc, showtime) => {
        const date = new Date(showtime.startTime).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(showtime);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#1a1d29] pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="md:fixed md:top-24 md:left-6 md:z-40 relative mb-6 w-fit bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2 text-white transition-all shadow-xl group font-semibold"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Home</span>
                </button>


                <div className="bg-[#0f1117] rounded-xl shadow-lg p-5 md:p-12 border border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                        {/* Left Column: Poster */}
                        <div className="md:col-span-4 lg:col-span-3">
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full rounded-xl shadow-lg object-cover"
                            />
                        </div>

                        {/* Right Column: Details & Showtimes */}
                        <div className="md:col-span-8 lg:col-span-9">
                            <h1 className="text-5xl font-extrabold text-white mb-10">{movie.title}</h1>

                            {/* Metadata */}
                            <div className="flex flex-col gap-3 text-gray-300 mb-10">
                                <p className="text-lg">
                                    <span className="font-bold text-white">Genre: </span>
                                    <span className="text-gray-400">{movie.genre.join(', ')}</span>
                                </p>
                                <p className="text-lg">
                                    <span className="font-bold text-white">Duration: </span>
                                    <span className="text-gray-400">{movie.duration} min</span>
                                </p>
                                <p className="text-lg">
                                    <span className="font-bold text-white">Release Date: </span>
                                    <span className="text-gray-400">{new Date(movie.releaseDate).toLocaleDateString()}</span>
                                </p>
                                <p className="mt-6 text-gray-300 leading-relaxed text-lg">
                                    {movie.description}
                                </p>
                            </div>

                            {/* Showtimes Section */}
                            <div className="mt-16">
                                <h2 className="text-3xl font-bold text-white mb-10">Available Showtimes</h2>

                                {/* View Toggles */}
                                <div className="flex gap-4 mb-10">
                                    <button
                                        onClick={() => { setViewMode('list'); setSelectedDate(''); }}
                                        className={`px-10 py-4 rounded-lg font-bold text-lg transition-colors border-2 ${viewMode === 'list' ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
                                    >
                                        List View
                                    </button>
                                    <button
                                        onClick={() => setViewMode('calendar')}
                                        className={`px-10 py-4 rounded-lg font-bold text-lg transition-colors border-2 ${viewMode === 'calendar' ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
                                    >
                                        Calendar View
                                    </button>
                                </div>

                                {/* Calendar Filter Input */}
                                {viewMode === 'calendar' && (
                                    <div className="mb-10 animate-fade-in">
                                        <label className="block text-gray-300 font-bold mb-3 text-lg">Filter by Date</label>
                                        <input
                                            type="date"
                                            className="px-4 py-3 border-2 border-gray-700 bg-gray-800 text-white rounded-lg text-lg focus:outline-none focus:border-red-500 transition-colors"
                                            value={selectedDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                        />
                                    </div>
                                )}

                                <h3 className="text-2xl font-semibold text-gray-300 mb-6">
                                    {viewMode === 'list' ? 'Grouped by Theater' : 'Grouped by Date'}
                                </h3>

                                {/* Showtimes Content */}
                                <div className="space-y-8">
                                    {loadingShowtimes ? (
                                        <div className="flex justify-center items-center py-20">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* LIST VIEW */}
                                            {viewMode === 'list' && (
                                                Object.keys(showtimesByTheater).length > 0 ? (
                                                    Object.entries(showtimesByTheater).map(([theaterName, theaterShowtimes]) => (
                                                        <div key={theaterName} className="border border-gray-700 rounded-xl p-10 bg-[#1a1d29] shadow-sm">
                                                            <h4 className="text-xl font-bold text-white mb-8">{theaterName}</h4>
                                                            <div className="space-y-5">
                                                                {theaterShowtimes.map(showtime => (
                                                                    <div key={showtime._id} className="flex flex-col md:flex-row justify-between items-center border border-gray-700 rounded-lg p-8 bg-gray-800 hover:bg-gray-750 transition-all">
                                                                        <div className="mb-4 md:mb-0">
                                                                            <div className="text-gray-400 font-medium mb-1">
                                                                                {showtime.theater.city} - {showtime.screenName}
                                                                            </div>
                                                                            <div className="text-blue-400 font-bold text-lg">
                                                                                {new Date(showtime.startTime).toLocaleDateString()} , {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </div>
                                                                        </div>
                                                                        <Link
                                                                            to={`/booking/${showtime._id}`}
                                                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                                                                        >
                                                                            Select Seats
                                                                        </Link>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-400 text-xl py-4">No showtimes available.</p>
                                                )
                                            )}

                                            {/* CALENDAR VIEW */}
                                            {viewMode === 'calendar' && (
                                                Object.keys(showtimesByDate).length > 0 ? (
                                                    Object.entries(showtimesByDate).map(([date, dateShowtimes]) => (
                                                        <div key={date} className="border border-gray-700 rounded-xl p-10 bg-[#1a1d29] shadow-sm">
                                                            <h4 className="text-xl font-bold text-white mb-8">{date}</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {dateShowtimes.map(showtime => (
                                                                    <div key={showtime._id} className="border border-gray-700 rounded-lg p-8 bg-gray-800 flex flex-col justify-between h-full hover:bg-gray-750 transition-all">
                                                                        <div className="mb-4">
                                                                            <h5 className="font-bold text-lg text-white">{showtime.theater.name}</h5>
                                                                            <p className="text-gray-400 text-sm">{showtime.theater.city} - {showtime.screenName}</p>
                                                                        </div>
                                                                        <div className="flex justify-between items-center mt-4">
                                                                            <span className="text-blue-400 font-bold text-lg">
                                                                                {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                            <Link
                                                                                to={`/booking/${showtime._id}`}
                                                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm"
                                                                            >
                                                                                Book
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-400 text-xl py-4">No showtimes available for the selected criteria.</p>
                                                )
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoviePage;


