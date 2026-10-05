import React from "react";
import MovieRating from "../common/MovieRating.jsx";
import WatchlistButton from "./WatchlistButton";

function FeaturedMovieCard({ movie }) {
    const handleTrailer = () => {
        console.log(`Opening trailer for ${movie.title}`);
    };

    return (
        <article
            className="group relative flex min-h-[400px] flex-col justify-end overflow-hidden rounded-lg border border-border bg-surface shadow-elevated"
            style={{
                backgroundImage: `url("${movie.image}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="absolute inset-0 hero-gradient" />

            {/* Ranking */}
            <div className="absolute left-6 top-6 z-10 select-none">
                <span className="font-serif text-5xl sm:text-7xl font-semibold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(201,168,106,0.3)]">
                    {String(movie.rank).padStart(2, "0")}
                </span>
            </div>

            {/* Movie Content */}
            <div className="relative z-20 p-6 sm:p-8 max-w-xl">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    {movie.genre && (
                        <span className="badge badge-accent">
                            {movie.genre}
                        </span>
                    )}

                    {movie.year && (
                        <span className="text-xs text-text-3 font-medium">
                            {movie.year}
                        </span>
                    )}

                    {movie.rating && (
                        <MovieRating rating={movie.rating} />
                    )}
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-text tracking-tight mb-2 group-hover:text-accent transition-colors">
                    {movie.title}
                </h2>

                <p className="text-xs sm:text-sm text-text-2 leading-relaxed line-clamp-2 mb-4">
                    {movie.description}
                </p>

                <div className="flex items-center gap-3">
                    <WatchlistButton />

                    <button
                        className="btn-secondary text-xs py-2 px-5"
                        onClick={handleTrailer}
                    >
                        Trailer
                    </button>
                </div>
            </div>
        </article>
    );
}

export default FeaturedMovieCard;
