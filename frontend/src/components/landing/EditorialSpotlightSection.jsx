import { Link, useNavigate } from "react-router-dom";
import Icon from "../common/Icon";

export default function EditorialSpotlightSection({
    movie,
    token = null,
    onWatchTrailer,
    isInWatchlist = false,
    onToggleWatchlist,
    watchlistLoading = false,
    runtime = null
}) {
    const navigate = useNavigate();

    if (!movie) return null;

    const formatRuntime = (mins) => {
        if (!mins) return null;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <section className="page-container" aria-label="Cinephile Editorial Spotlight">
            <div className="mb-6 text-center">
                <p className="label-caps mb-2">Editor's Perspective</p>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-text tracking-tight">
                    Cinephile Spotlight
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-text-3">
                    A single cinematic triumph chosen for its craft, storytelling, and cultural resonance
                </p>
            </div>

            <div className="relative min-h-[380px] sm:min-h-[460px] md:min-h-[520px] w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated film-grain">
                {movie.backdrop && (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                        style={{ backgroundImage: `url('${movie.backdrop}')` }}
                    />
                )}
                <div className="absolute inset-0 hero-gradient" />
                <div className="absolute inset-0 hero-gradient-side" />

                <div className="relative z-10 flex min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex-col justify-end p-6 sm:p-10 md:p-12 max-w-3xl">
                    <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
                        <span className="badge badge-accent">
                            <span className="material-symbols-outlined text-[13px] mr-1">auto_awesome</span>
                            Why It Deserves Attention
                        </span>
                        <span className="text-xs font-mono text-text-3 font-semibold">{movie.genre}</span>
                        {movie.originalLanguage && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-2">
                                {movie.originalLanguage}
                            </span>
                        )}
                    </div>

                    <h3 className="mb-3 font-serif text-2xl sm:text-4xl md:text-5xl font-semibold text-text tracking-tight leading-tight break-words drop-shadow-md">
                        {movie.title}
                    </h3>

                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-2">
                        <span className="text-accent font-bold inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] fill-current">star</span>
                            {movie.rating}
                        </span>
                        <span className="text-border">·</span>
                        <span>{movie.year}</span>
                        {runtime && (
                            <>
                                <span className="text-border">·</span>
                                <span>{formatRuntime(runtime)}</span>
                            </>
                        )}
                    </div>

                    {movie.overview && (
                        <p className="mb-6 line-clamp-3 sm:line-clamp-4 text-xs sm:text-sm md:text-base text-text-2 leading-relaxed max-w-2xl font-sans">
                            {movie.overview}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/movies/${movie.id}`)}
                            className="btn-primary text-xs sm:text-sm py-2.5 px-6 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Icon className="text-base">info</Icon>
                            <span>Film Details</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => onWatchTrailer && onWatchTrailer(movie)}
                            className="btn-secondary text-xs sm:text-sm py-2.5 px-5 backdrop-blur-md bg-surface/50 hover:bg-surface inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                            <span>Trailer</span>
                        </button>

                        {token ? (
                            <button
                                type="button"
                                onClick={() => onToggleWatchlist && onToggleWatchlist(movie)}
                                disabled={watchlistLoading}
                                className={`text-xs sm:text-sm py-2.5 px-5 rounded-full border font-semibold backdrop-blur-md transition-all cursor-pointer inline-flex items-center gap-1.5 ${
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
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
