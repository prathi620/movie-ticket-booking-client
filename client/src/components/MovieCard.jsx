import { Link } from 'react-router-dom';
import { Star, Clock, Calendar } from 'lucide-react';

const MovieCard = ({ movie }) => {
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Link to={`/movie/${movie._id}`} className="group relative block w-full">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[#202020] shadow-md">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = 'https://placehold.co/500x750?text=No+Image';
                    }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center">
                        <span className="text-3xl font-bold text-red-500 mb-2">{movie.rating.toFixed(1)}</span>
                        <div className="flex items-center gap-1 text-gray-300 text-xs mb-4">
                            <span>{formatDuration(movie.duration)}</span>
                            <span>•</span>
                            <span>{movie.language}</span>
                        </div>
                        <span className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-full hover:bg-red-700 transition-colors">
                            Book Ticket
                        </span>
                    </div>
                </div>

                {/* Rating Badge (Always visible on mobile, hidden on hover) */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-bold text-white group-hover:opacity-0 transition-opacity">
                    ★ {movie.rating.toFixed(1)}
                </div>
            </div>

            {/* Content Below Poster */}
            <div className="mt-4">
                <h3 className="text-white font-semibold text-lg leading-snug truncate group-hover:text-red-500 transition-colors">
                    {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                    <span>•</span>
                    <span className="truncate">{movie.genre.join(', ')}</span>
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;
