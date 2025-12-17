import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';

const ManageMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        director: '',
        duration: '',
        description: '',
        posterUrl: '',
        trailerUrl: '',
        releaseDate: '',
        language: '',
        rating: ''
    });

    const fetchMovies = async () => {
        try {
            const { data } = await api.get('/movies');
            setMovies(data);
        } catch (error) {
            console.error('Failed to fetch movies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMovie) {
                await api.put(`/movies/${editingMovie._id}`, formData);
            } else {
                await api.post('/movies', formData);
            }
            fetchMovies();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Failed to save movie');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this movie?')) return;
        try {
            await api.delete(`/movies/${id}`);
            fetchMovies();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete movie');
        }
    };

    const openModal = (movie = null) => {
        if (movie) {
            setEditingMovie(movie);
            setFormData({ ...movie, releaseDate: movie.releaseDate?.split('T')[0] });
        } else {
            setEditingMovie(null);
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            genre: '',
            director: '',
            duration: '',
            description: '',
            posterUrl: '',
            trailerUrl: '',
            releaseDate: '',
            language: '',
            rating: ''
        });
    };

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Movies</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Movie
                </button>
            </div>

            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search movies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMovies.map((movie) => (
                        <div key={movie._id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group">
                            <div className="relative aspect-[2/3] overflow-hidden">
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => openModal(movie)}
                                        className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(movie._id)}
                                        className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold truncate">{movie.title}</h3>
                                <p className="text-sm text-gray-400">{movie.genre} | {movie.duration}m</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900">
                            <h2 className="text-2xl font-bold">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Genre</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        value={formData.genre}
                                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Director</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        value={formData.director}
                                        onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Duration (mins)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Release Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        value={formData.releaseDate}
                                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Language</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        value={formData.language}
                                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
                                    <input
                                        type="url"
                                        required
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        value={formData.posterUrl}
                                        onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea
                                        rows="4"
                                        className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
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
                                    {editingMovie ? 'Update Movie' : 'Add Movie'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMovies;
