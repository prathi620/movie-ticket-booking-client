import { useState, useEffect } from 'react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { Search, Calendar, X } from 'lucide-react';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/movies');
                setMovies(data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    // Extract unique genres
    const allGenres = [...new Set(movies.flatMap(movie => movie.genre))];

    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre ? movie.genre.includes(selectedGenre) : true;

        let matchesDate = true;
        if (selectedDate) {
            const movieDate = new Date(movie.releaseDate).toISOString().split('T')[0];
            matchesDate = movieDate === selectedDate;
        }

        return matchesSearch && matchesGenre && matchesDate;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedGenre('');
        setSelectedDate('');
    };

    return (
        <div className="min-h-screen bg-[#1a1d29]">
            <div className="container mx-auto px-6 py-16 max-w-7xl">

                {/* Title */}
                <h1 className="text-center text-4xl font-bold text-white mb-12">
                    Now Showing
                </h1>

                {/* Filter Bar */}
                <div className="bg-[#0f1117] p-10 rounded-xl shadow-lg border border-gray-800 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                        {/* Search Input */}
                        <div className="md:col-span-4 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Search Movies</label>
                            <input
                                type="text"
                                placeholder="Search for any movie..."
                                className="w-full pl-4 pr-4 h-[52px] border border-gray-700 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Genre Select */}
                        <div className="md:col-span-3 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Genre</label>
                            <select
                                className="w-full px-4 h-[52px] border border-gray-700 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                            >
                                <option value="">All Genres</option>
                                {allGenres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Input */}
                        <div className="md:col-span-3 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Release Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full px-4 h-[52px] border border-gray-700 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Clear Button */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-transparent select-none">Clear</label>
                            <button
                                onClick={clearFilters}
                                className="w-full h-[52px] bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm border border-gray-600"
                                title="Clear filters"
                            >
                                <span>Clear</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="text-center text-gray-400 mb-8 font-medium">
                    Showing <span className="text-red-600 font-bold">{filteredMovies.length}</span> of {movies.length} movies
                </div>

                {/* Movie Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : filteredMovies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {filteredMovies.map(movie => (
                            <MovieCard key={movie._id} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500">No movies found matching your filters.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-red-600 hover:text-red-700 font-medium hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
