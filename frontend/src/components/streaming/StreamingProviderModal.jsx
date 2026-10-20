import { useEffect, useState } from "react";
import { getMovieWatchProviders, getPosterUrl, getBackdropUrl } from "../../services/movieService";

const REGION_NAMES = {
    IN: "India",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia"
};

export default function StreamingProviderModal({ movie, watchRegion = "IN", onClose }) {
    const [providers, setProviders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!movie?.id) return;
        let isMounted = true;
        setLoading(true);
        setError(null);

        getMovieWatchProviders(movie.id)
            .then((data) => {
                if (!isMounted) return;
                const regionData = data?.results?.[watchRegion] || data?.results?.["IN"] || data?.results?.["US"] || null;
                setProviders(regionData);
            })
            .catch((err) => {
                console.error("Failed to load providers:", err);
                if (isMounted) setError("Unable to retrieve live streaming availability.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            isMounted = false;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [movie, watchRegion, onClose]);

    if (!movie) return null;

    const flatrate = providers?.flatrate || [];
    const rent = providers?.rent || [];
    const buy = providers?.buy || [];
    const justWatchLink = providers?.link || null;
    const regionName = REGION_NAMES[watchRegion] || watchRegion;

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="streaming-modal-title"
        >
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl p-6 sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close streaming options"
                    className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface-2/80 text-text-2 hover:text-white hover:bg-surface-2 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {/* Header with Backdrop / Poster */}
                <div className="flex flex-col sm:flex-row gap-5 items-start mb-6 pb-6 border-b border-border">
                    <div className="w-24 sm:w-28 shrink-0 aspect-[2/3] rounded-xl overflow-hidden bg-surface-2 border border-border/60 shadow-md">
                        {movie.poster_path || movie.poster ? (
                            <img
                                src={movie.poster_path ? getPosterUrl(movie.poster_path) : movie.poster}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-3 text-xs">
                                No Poster
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                                Streaming Guide
                            </span>
                            <span className="text-xs text-text-3">
                                Territory: <strong className="text-text">{regionName}</strong>
                            </span>
                        </div>

                        <h2 id="streaming-modal-title" className="text-xl sm:text-2xl font-serif font-bold text-text mb-1">
                            {movie.title}
                        </h2>

                        <div className="flex items-center gap-3 text-xs text-text-2">
                            {movie.release_date && (
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                            )}
                            {movie.vote_average > 0 && (
                                <span className="flex items-center gap-1 font-mono text-accent">
                                    ★ {Number(movie.vote_average).toFixed(1)}
                                </span>
                            )}
                        </div>

                        {movie.overview && (
                            <p className="mt-2 text-xs text-text-3 line-clamp-2 leading-relaxed">
                                {movie.overview}
                            </p>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                        <p className="text-xs text-text-3">Querying regional watch providers...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-xs text-rose-300">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 1. Subscription / Flatrate */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-accent text-[18px]">play_circle</span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                                    Subscription Streaming ({flatrate.length})
                                </h3>
                            </div>

                            {flatrate.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {flatrate.map((p) => (
                                        <div
                                            key={p.provider_id}
                                            className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-2 border border-border/80 hover:border-accent/40 transition-colors"
                                        >
                                            <img
                                                src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                                alt={p.provider_name}
                                                className="h-8 w-8 rounded-lg object-cover shrink-0 shadow-sm"
                                                onError={(e) => { e.target.style.display = "none"; }}
                                            />
                                            <span className="text-xs font-semibold text-text truncate">
                                                {p.provider_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-text-3 italic bg-surface-2/40 rounded-xl p-3 border border-border/40">
                                    No flatrate subscription streaming currently reported in {regionName}. Check rent/buy options below.
                                </p>
                            )}
                        </div>

                        {/* 2. Rent Options */}
                        {rent.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-accent text-[18px]">storefront</span>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                                        Rent on Digital Platforms ({rent.length})
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {rent.map((p) => (
                                        <div
                                            key={p.provider_id}
                                            className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-2/60 border border-border/60 hover:border-accent/30 transition-colors"
                                        >
                                            <img
                                                src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                                alt={p.provider_name}
                                                className="h-7 w-7 rounded-lg object-cover shrink-0 shadow-sm"
                                                onError={(e) => { e.target.style.display = "none"; }}
                                            />
                                            <span className="text-xs text-text-2 truncate">
                                                {p.provider_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Buy Options */}
                        {buy.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-accent text-[18px]">shopping_bag</span>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                                        Buy Digital Copy ({buy.length})
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {buy.map((p) => (
                                        <div
                                            key={p.provider_id}
                                            className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-2/60 border border-border/60 hover:border-accent/30 transition-colors"
                                        >
                                            <img
                                                src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                                alt={p.provider_name}
                                                className="h-7 w-7 rounded-lg object-cover shrink-0 shadow-sm"
                                                onError={(e) => { e.target.style.display = "none"; }}
                                            />
                                            <span className="text-xs text-text-2 truncate">
                                                {p.provider_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* JustWatch / TMDB Watch Link */}
                        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-[11px] text-text-3 text-center sm:text-left">
                                Streaming availability verified via TMDB & JustWatch live metadata.
                            </p>

                            {justWatchLink && (
                                <a
                                    href={justWatchLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-bg font-semibold text-xs hover:bg-accent-hover transition-all shadow-md no-underline shrink-0"
                                >
                                    <span>Watch Options on JustWatch</span>
                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
