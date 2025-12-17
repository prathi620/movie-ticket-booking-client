import { useState, useEffect } from 'react';

const AdvancedSearch = ({ onSearch, onClear }) => {
    const [filters, setFilters] = useState({
        search: '',
        genre: '',
        language: '',
        minRating: 0,
        sortBy: 'releaseDate'
    });

    const [showFilters, setShowFilters] = useState(false);

    const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation'];
    const languages = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam'];

    const handleChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = () => {
        onSearch(filters);
    };

    const handleClear = () => {
        const clearedFilters = {
            search: '',
            genre: '',
            language: '',
            minRating: 0,
            sortBy: 'releaseDate'
        };
        setFilters(clearedFilters);
        onClear();
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (filters.search.length >= 2 || filters.search.length === 0) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(debounce);
    }, [filters.search]);

    return (
        <div className="advanced-search bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Search Bar */}
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search movies by title..."
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Toggle Filters Button */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Genre Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Genre
                        </label>
                        <select
                            value={filters.genre}
                            onChange={(e) => handleChange('genre', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Genres</option>
                            {genres.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Language Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                        </label>
                        <select
                            value={filters.language}
                            onChange={(e) => handleChange('language', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Languages</option>
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Rating: {filters.minRating}+
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={filters.minRating}
                            onChange={(e) => handleChange('minRating', parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleChange('sortBy', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="releaseDate">Release Date</option>
                            <option value="rating">Rating</option>
                            <option value="title">Title</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {showFilters && (
                <div className="flex gap-3">
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearch;
