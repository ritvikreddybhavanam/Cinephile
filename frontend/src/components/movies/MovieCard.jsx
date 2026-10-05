import React from "react";

const MovieCard = ({ movie, onSelect }) => {
    const genreText = movie.genres.join("/");

    return (
        <article
            className="group flex flex-col cursor-pointer"
            onClick={() => onSelect?.(movie)}
        >
            {/* Poster */}
            <div className="poster-card">
                <img
                    src={movie.image}
                    alt={`${movie.title} poster`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />

                {/* Rating badge */}
                <div className="absolute top-2 left-2 badge badge-accent backdrop-blur-sm">
                    ★ {movie.rating.toFixed(1)}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg/90 via-bg/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        className="btn-primary w-full text-xs py-2 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); onSelect?.(movie); }}
                    >
                        View Details
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="mt-2.5 px-0.5">
                <h3 className="truncate text-sm font-medium text-text transition-colors group-hover:text-accent">
                    {movie.title}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-text-3">
                    {genreText} · {movie.year}
                </p>
            </div>
        </article>
    );
};

export default MovieCard;