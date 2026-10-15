import { Link } from "react-router-dom";

function MovieHero({
    movie,
    posterUrl,
    backdropUrl,
    runtime,
    score,
    myReview,
    trailer,
    isLiked,
    likeLoading,
    inWatchlist,
    watchlistLoading,
    isWatched,
    watchedLoading,
    onWatchTrailer,
    onReview,
    onLikeToggle,
    onWatchlistToggle,
    onWatchedToggle,
    onAddToList
}) {
    if (!movie) return null;

    const releaseYear = movie.release_date
        ? movie.release_date.substring(0, 4)
        : "N/A";

    return (
        <section className="relative min-h-0 overflow-hidden">
            {/* Backdrop */}
            {backdropUrl && (
                <img
                    src={backdropUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 hero-gradient-side" />
            <div className="absolute inset-0 hero-gradient" />

            {/* Content */}
            <div className="relative page-container py-8 sm:py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-8 md:gap-12 items-start">

                    {/* Poster */}
                    <div className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-none mx-auto md:mx-0 shrink-0">
                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                alt={`${movie.title} poster`}
                                className="w-full rounded-lg border border-border shadow-elevated"
                                style={{ aspectRatio: "2/3", objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                className="rounded-lg bg-surface border border-border flex items-center justify-center text-text-3"
                                style={{ aspectRatio: "2/3" }}
                            >
                                <span className="text-4xl opacity-30">▣</span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="pt-0 md:pt-4 min-w-0">

                        {/* Genre chips */}
                        {movie.genres?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {movie.genres.map((genre) => (
                                    <span key={genre.id} className="badge badge-accent">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-fluid-hero font-serif font-semibold text-text mb-3 break-words">
                            {movie.title}
                        </h1>

                        {/* Tagline */}
                        {movie.tagline && (
                            <p className="text-text-3 italic mb-4 text-sm sm:text-base leading-relaxed break-words">
                                {movie.tagline}
                            </p>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-2 mb-6">
                            <span>{releaseYear}</span>
                            <span className="text-border">·</span>
                            <span>{runtime}</span>
                            <span className="text-border">·</span>
                            <span>{movie.original_language?.toUpperCase() ?? "N/A"}</span>
                            <span className="badge badge-accent">
                                ★ {score}
                            </span>
                        </div>

                        {/* Overview */}
                        <p className="max-w-2xl text-text-2 text-sm sm:text-base leading-7 mb-8 line-clamp-4 sm:line-clamp-none">
                            {movie.overview || "No overview available."}
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {trailer && (
                                <button
                                    type="button"
                                    onClick={onWatchTrailer}
                                    className="btn-primary text-sm py-2.5 px-5"
                                >
                                    ▶ Trailer
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onReview}
                                className="btn-secondary text-sm py-2.5 px-5"
                            >
                                Reviews
                            </button>

                            <Link
                                to={
                                    myReview
                                        ? `/write_review?movieId=${movie.id}&reviewId=${myReview.id}`
                                        : `/write_review?movieId=${movie.id}`
                                }
                                className="btn-secondary text-sm py-2.5 px-5"
                            >
                                {myReview ? "Edit Review" : "Write Review"}
                            </Link>

                            <button
                                type="button"
                                onClick={onLikeToggle}
                                disabled={likeLoading}
                                className={`text-sm py-2.5 px-5 rounded-full border font-semibold transition-all duration-200 ${
                                    isLiked
                                        ? "bg-accent border-accent text-bg"
                                        : "border-border text-text-2 hover:border-accent hover:text-accent"
                                } ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {likeLoading ? "…" : isLiked ? "♥ Liked" : "♡ Like"}
                            </button>

                            <button
                                type="button"
                                onClick={onWatchlistToggle}
                                disabled={watchlistLoading}
                                className={`text-sm py-2.5 px-5 rounded-full border font-semibold transition-all duration-200 ${
                                    inWatchlist
                                        ? "bg-accent border-accent text-bg"
                                        : "border-border text-text-2 hover:border-accent hover:text-accent"
                                } ${watchlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {watchlistLoading ? "…" : inWatchlist ? "✓ In Watchlist" : "+ Watchlist"}
                            </button>

                            <button
                                type="button"
                                onClick={onWatchedToggle}
                                disabled={watchedLoading}
                                className={`text-sm py-2.5 px-5 rounded-full border font-semibold transition-all duration-200 ${
                                    isWatched
                                        ? "bg-success/20 border-success text-success"
                                        : "border-border text-text-2 hover:border-success hover:text-success"
                                } ${watchedLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {watchedLoading ? "…" : isWatched ? "✓ Logged" : "+ Log Film"}
                            </button>

                            {onAddToList && (
                                <button
                                    type="button"
                                    onClick={onAddToList}
                                    className="text-sm py-2.5 px-5 rounded-full border border-border text-text-2 hover:border-accent hover:text-accent font-semibold transition-all duration-200 cursor-pointer"
                                >
                                    + List
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default MovieHero;