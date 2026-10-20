import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosterUrl } from "../../services/movieService";

const GENRE_MAP = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

export default function StreamingMovieCard({
    movie,
    matchedProviders = [],
    isWatchlisted = false,
    onToggleWatchlist,
    onOpenProviders
}) {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const posterUrl = !imageError && movie.poster_path ? getPosterUrl(movie.poster_path) : null;
    const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : "—";
    const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;

    const genres = (movie.genre_ids || [])
        .map((id) => GENRE_MAP[id])
        .filter(Boolean)
        .slice(0, 2);

    const handleViewDetails = (e) => {
        if (e) e.stopPropagation();
        navigate(`/movies/${movie.id}`);
    };

    const handleWatchlistClick = async (e) => {
        if (e) e.stopPropagation();
        if (actionLoading) return;
        setActionLoading(true);
        try {
            await onToggleWatchlist?.(movie);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <article
            className="group relative flex flex-col rounded-2xl bg-surface border border-border/80 hover:border-accent/50 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden focus-within:ring-2 focus-within:ring-accent/40"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter") handleViewDetails(e);
            }}
        >
            {/* Poster Section */}
            <div className="relative aspect-[2/3] w-full bg-surface-2 overflow-hidden">
                {posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-surface-2 text-text-3">
                        <span className="material-symbols-outlined text-4xl mb-1 opacity-30">movie</span>
                        <span className="text-xs font-semibold text-text line-clamp-2">{movie.title}</span>
                    </div>
                )}

                {/* Top Badge: Rating */}
                {rating && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-bg/85 backdrop-blur-md px-2 py-0.5 text-[11px] font-mono font-bold text-accent border border-accent/30 shadow-sm">
                        <span>★</span>
                        <span>{rating}</span>
                    </div>
                )}

                {/* Top Right: Matched Streaming Provider Badges */}
                {matchedProviders && matchedProviders.length > 0 && (
                    <div className="absolute top-2.5 right-2.5 flex items-center -space-x-1.5 shadow-md">
                        {matchedProviders.slice(0, 3).map((prov) => (
                            <img
                                key={prov.provider_id || prov.id}
                                src={`https://image.tmdb.org/t/p/original${prov.logo_path}`}
                                alt={prov.provider_name || "Provider"}
                                title={prov.provider_name}
                                className="h-6 w-6 rounded-md object-cover ring-1 ring-bg border border-border/60 shadow-sm"
                                onError={(e) => { e.target.style.display = "none"; }}
                            />
                        ))}
                    </div>
                )}

                {/* Hover / Focus Overlay with Action Buttons */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/70 to-transparent p-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={handleViewDetails}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-bg hover:bg-accent-hover transition-colors shadow-md cursor-pointer"
                        >
                            <span>View Details</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>

                        <div className="grid grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenProviders?.(movie);
                                }}
                                className="flex items-center justify-center gap-1 rounded-lg bg-surface border border-border hover:border-accent/40 text-text hover:text-accent px-2 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer"
                                title="View live streaming, rent & buy providers"
                            >
                                <span className="material-symbols-outlined text-[14px]">live_tv</span>
                                <span className="truncate">Providers</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleWatchlistClick}
                                disabled={actionLoading}
                                aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                                className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                                    isWatchlisted
                                        ? "bg-accent/20 border-accent/60 text-accent"
                                        : "bg-surface border-border hover:border-accent/40 text-text-2 hover:text-white"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[14px]">
                                    {isWatchlisted ? "bookmark_added" : "bookmark_add"}
                                </span>
                                <span>{isWatchlisted ? "Saved" : "Watchlist"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movie Info Section */}
            <div className="flex flex-1 flex-col p-3.5 justify-between">
                <div>
                    <h3
                        onClick={handleViewDetails}
                        className="font-serif text-sm sm:text-base font-semibold text-text group-hover:text-accent transition-colors line-clamp-1 cursor-pointer leading-snug"
                        title={movie.title}
                    >
                        {movie.title}
                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-xs text-text-3 font-medium">
                        <span>{releaseYear}</span>
                        {genres.length > 0 && (
                            <>
                                <span>•</span>
                                <span className="truncate text-text-2">{genres.join(", ")}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
