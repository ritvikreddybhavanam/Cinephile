import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../common/Icon";

export default function HeroSlideshow({
    movies = [],
    token = null,
    onWatchTrailer,
    isInWatchlist = false,
    onToggleWatchlist,
    watchlistLoading = false,
    runtimeMap = {}
}) {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-advance slideshow every 6s unless paused or only 1 film
    useEffect(() => {
        if (!movies || movies.length <= 1 || isPaused) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % movies.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [movies, isPaused]);

    if (!movies || movies.length === 0) return null;

    const currentMovie = movies[activeIndex] || movies[0];
    const currentRuntime = runtimeMap[currentMovie.id] || currentMovie.runtime;

    const formatRuntime = (mins) => {
        if (!mins) return null;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <section
            className="relative flex min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] w-full items-end pb-12 sm:pb-16 lg:pb-20 film-grain overflow-hidden border-b border-border/60"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label="Featured Cinema Discovery"
        >
            {/* Background Backdrop Carousel */}
            <div className="absolute inset-0 z-0">
                {movies.map((movie, idx) => (
                    <div
                        key={movie.id}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                            idx === activeIndex
                                ? "opacity-85 dark:opacity-60 scale-100"
                                : "opacity-0 scale-105 pointer-events-none"
                        }`}
                    >
                        <img
                            src={movie.backdrop || movie.poster}
                            alt={`${movie.title} backdrop`}
                            className="h-full w-full object-cover object-top"
                        />
                    </div>
                ))}

                {/* Cinematic Vignette Overlays for Maximum Contrast & Readability */}
                <div className="absolute inset-0 hero-gradient" />
                <div className="absolute inset-0 hero-gradient-side" />
            </div>

            <div className="relative z-10 w-full page-container">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    {/* Left: Headline & Movie Meta */}
                    <div className="max-w-3xl">
                        {/* Section Label & Why Featured */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="badge badge-accent shadow-sm">
                                <span className="material-symbols-outlined text-[13px] mr-1">star</span>
                                Featured Discovery
                            </span>
                            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                                Editorial Spotlight
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="mb-3 font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-text tracking-tight break-words drop-shadow-md">
                            {currentMovie.title}
                        </h1>

                        {/* Metadata row: Rating, Year, Runtime, Genre */}
                        <div className="mb-4 flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-text-2">
                            <span className="text-accent font-bold inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px] fill-current">star</span>
                                {currentMovie.rating}
                            </span>
                            <span className="text-border">·</span>
                            <span className="font-mono">{currentMovie.year}</span>
                            {currentRuntime && (
                                <>
                                    <span className="text-border">·</span>
                                    <span>{formatRuntime(currentRuntime)}</span>
                                </>
                            )}
                            <span className="text-border">·</span>
                            <span className="text-text-3 font-medium">{currentMovie.genre}</span>
                        </div>

                        {/* Short synopsis */}
                        <p className="mb-7 text-xs sm:text-sm md:text-base text-text-2 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-4 font-sans">
                            {currentMovie.overview}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            {/* Watch Trailer */}
                            <button
                                type="button"
                                onClick={() => onWatchTrailer && onWatchTrailer(currentMovie)}
                                className="btn-primary text-xs sm:text-sm py-2.5 px-6 shadow-lg shadow-accent/20 cursor-pointer inline-flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                <span>Watch Trailer</span>
                            </button>

                            {/* View Movie Details */}
                            <button
                                type="button"
                                onClick={() => navigate(`/movies/${currentMovie.id}`)}
                                className="btn-secondary text-xs sm:text-sm py-2.5 px-5 backdrop-blur-md bg-surface/40 hover:bg-surface inline-flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[17px]">info</span>
                                <span>Film Details</span>
                            </button>

                            {/* Add to Watchlist (Auth-aware) */}
                            {token ? (
                                <button
                                    type="button"
                                    onClick={() => onToggleWatchlist && onToggleWatchlist(currentMovie)}
                                    disabled={watchlistLoading}
                                    className={`text-xs sm:text-sm py-2.5 px-5 rounded-full border font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5 ${
                                        isInWatchlist
                                            ? "bg-accent/20 border-accent/60 text-accent hover:bg-accent/30"
                                            : "border-border bg-surface/70 text-text hover:bg-surface hover:border-accent/40"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[17px]">
                                        {watchlistLoading ? "progress_activity" : isInWatchlist ? "check" : "bookmark_add"}
                                    </span>
                                    <span>{watchlistLoading ? "Updating…" : isInWatchlist ? "In Watchlist" : "Watchlist"}</span>
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-xs sm:text-sm py-2.5 px-5 rounded-full border border-border bg-surface/50 text-text-2 hover:text-text hover:border-accent/40 backdrop-blur-md inline-flex items-center gap-1.5 no-underline"
                                >
                                    <span className="material-symbols-outlined text-[17px]">bookmark_add</span>
                                    <span>Log In to Save</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: Slideshow Companion Controls & Indicator */}
                    {movies.length > 1 && (
                        <div className="self-start lg:self-end bg-surface/90 backdrop-blur-md border border-border/80 p-3.5 sm:p-4 rounded-2xl shadow-2xl flex flex-col gap-3 w-full sm:w-auto sm:min-w-[290px] max-w-sm">
                            <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                                        Curated Selections
                                    </span>
                                </div>
                                <span className="text-[11px] font-mono text-text-3 font-semibold">
                                    {activeIndex + 1} / {movies.length}
                                </span>
                            </div>

                            {/* Active Film Mini Card */}
                            <div
                                onClick={() => navigate(`/movies/${currentMovie.id}`)}
                                className="group flex items-center gap-3 cursor-pointer py-0.5"
                            >
                                <div className="w-12 h-16 shrink-0 aspect-[2/3] rounded-lg overflow-hidden border border-border shadow-md bg-surface-2">
                                    <img
                                        src={currentMovie.poster || currentMovie.backdrop}
                                        alt={currentMovie.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">
                                        {currentMovie.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-mono font-bold text-amber-400">
                                            ★ {currentMovie.rating}
                                        </span>
                                        <span className="text-[11px] text-text-3 truncate">
                                            {currentMovie.year} · {currentMovie.genre}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Dots & Nav Controls */}
                            <div className="flex items-center justify-between gap-2 pt-1">
                                <div className="flex items-center gap-1.5">
                                    {movies.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveIndex(idx)}
                                            aria-label={`Slide ${idx + 1}`}
                                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                                idx === activeIndex
                                                    ? "w-6 bg-accent"
                                                    : "w-1.5 bg-border hover:bg-text-3"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveIndex((prev) => (prev - 1 + movies.length) % movies.length)
                                        }
                                        className="h-7 w-7 rounded-lg flex items-center justify-center text-xs text-text-3 hover:text-text hover:bg-surface-2 transition-all cursor-pointer border border-border/40"
                                        title="Previous film"
                                        aria-label="Previous film"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveIndex((prev) => (prev + 1) % movies.length)
                                        }
                                        className="h-7 w-7 rounded-lg flex items-center justify-center text-xs text-text-3 hover:text-text hover:bg-surface-2 transition-all cursor-pointer border border-border/40"
                                        title="Next film"
                                        aria-label="Next film"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
