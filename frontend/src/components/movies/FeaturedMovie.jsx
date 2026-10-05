import React from "react";

const FeaturedMovie = ({ movie, onWatchlist, onDetails }) => {
    return (
        <section className="relative overflow-hidden rounded-lg border border-border bg-surface shadow-elevated mb-10">
            <div className="relative min-h-[420px] sm:min-h-[480px] w-full flex items-end">
                <img
                    src={movie.image}
                    alt={movie.title}
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 hero-gradient" />
                <div className="absolute inset-0 hero-gradient-side" />

                <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {movie.genre && (
                            <span className="badge badge-accent">
                                {movie.genre}
                            </span>
                        )}

                        {movie.year && (
                            <span className="badge bg-surface-2 text-text-2 border border-border text-xs">
                                {movie.year}
                            </span>
                        )}

                        {movie.duration && (
                            <span className="badge bg-surface-2 text-text-3 border border-border text-xs">
                                {movie.duration}
                            </span>
                        )}

                        {movie.rating && (
                            <span className="badge badge-accent font-semibold">
                                ★ {movie.rating}
                            </span>
                        )}
                    </div>

                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-text tracking-tight mb-3">
                        {movie.title}
                    </h1>

                    <p className="text-sm sm:text-base text-text-2 leading-relaxed line-clamp-3 mb-6">
                        {movie.synopsis}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            className="btn-primary text-xs py-2.5 px-6 font-semibold"
                            onClick={() => onDetails?.(movie)}
                        >
                            Explore Film
                        </button>

                        <button
                            className="btn-secondary text-xs py-2.5 px-6 font-semibold"
                            onClick={() => onWatchlist?.(movie)}
                        >
                            + Queue
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedMovie;