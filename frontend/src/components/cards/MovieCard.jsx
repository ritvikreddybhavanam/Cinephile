import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MovieCard({ movie }) {
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate();

    const showPlaceholder = !movie.image || imageError;

    const handleClick = () => navigate(`/movies/${movie.id}`);

    return (
        <article
            onClick={handleClick}
            className="group flex flex-col cursor-pointer"
        >
            {/* Poster */}
            <div className="poster-card">
                {showPlaceholder ? (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-surface text-text-3 p-4 text-center">
                        <span className="text-3xl mb-2 opacity-40">▣</span>
                        <span className="text-xs font-medium">{movie.title}</span>
                    </div>
                ) : (
                    <img
                        src={movie.image}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                )}

                {/* Rating badge */}
                <div className="absolute top-2 left-2 badge badge-accent backdrop-blur-sm">
                    ★ {movie.rating}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg/90 via-bg/50 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleClick(); }}
                        className="btn-primary w-full text-xs py-2 rounded-lg"
                    >
                        View Details
                    </button>
                </div>
            </div>

            {/* Meta */}
            <div className="mt-2.5 px-0.5">
                <h3 className="truncate text-sm font-medium text-text transition-colors group-hover:text-accent">
                    {movie.title}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-text-3 font-medium">
                    {movie.genre} · {movie.year}
                </p>
            </div>
        </article>
    );
}

export default MovieCard;