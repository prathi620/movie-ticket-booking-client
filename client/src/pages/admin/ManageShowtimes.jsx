import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, X, Calendar as CalendarIcon, Clock, MapPin, Film } from 'lucide-react';

const ManageShowtimes = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        movieId: '',
        theaterId: '',
        screenName: 'Screen 1',
        startTime: '',
        price: 150
    });

    // Helper to format date for input
    const toLocalISOString = (date) => {
        const pad = (num) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const fetchData = async () => {
        try {
            const [showtimesRes, moviesRes, theatersRes] = await Promise.all([
                api.get('/theaters/showtimes/all'),
                api.get('/movies'),
                api.get('/theaters')
            ]);
            setShowtimes(showtimesRes.data);
            setMovies(moviesRes.data);
            setTheaters(theatersRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/theaters/showtimes', formData);
            fetchData();
            setIsModalOpen(false);
            setFormData({
                movieId: '',
                theaterId: '',
                screenName: 'Screen 1',
                startTime: '',
                price: 150
            });
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Failed to save showtime');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this showtime?')) return;
        try {
            await api.delete(`/theaters/showtimes/${id}`);
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete showtime');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Showtimes</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Showtime
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-4">
                    {showtimes.map((showtime) => (
                        <div key={showtime._id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={showtime.movie?.posterUrl} alt={showtime.movie?.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{showtime.movie?.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {showtime.theater?.name}</span>
                                        <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {new Date(showtime.startTime).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="font-bold text-xl">₹{showtime.price}</p>
                                    <p className="text-sm text-gray-500">{showtime.screenName}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(showtime._id)}
                                    className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {showtimes.length === 0 && (
                        <p className="text-center text-gray-500 py-10">No showtimes scheduled.</p>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Add New Showtime</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Movie</label>
                                <select
                                    required
                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                    value={formData.movieId}
                                    onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                                >
                                    <option value="">Select Movie</option>
                                    {movies.map(m => (
                                        <option key={m._id} value={m._id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Theater</label>
                                <select
                                    required
                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                    value={formData.theaterId}
                                    onChange={(e) => setFormData({ ...formData, theaterId: e.target.value })}
                                >
                                    <option value="">Select Theater</option>
                                    {theaters.map(t => (
                                        <option key={t._id} value={t._id}>{t.name} ({t.location})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none text-white"
                                        style={{ colorScheme: "dark" }}
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Screen Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                    value={formData.screenName}
                                    onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary rounded-lg font-medium hover:bg-red-700 transition"
                                >
                                    Create Showtime
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageShowtimes;
