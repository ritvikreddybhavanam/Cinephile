import { Link } from "react-router-dom";
import { getPosterUrl } from "../../services/movieService.js";

export default function RecommendedSection({
    movies = [],
    loading = false,
    hasPersonalization = false,
}) {
    return (
        <section className="space-y-4">
            <div className="section-header">
                <div>
                    <h3 className="section-title">Recommended For You</h3>
                    <p className="mt-0.5 text-xs text-text-3">
                        {hasPersonalization
                            ? "Curated based on your taste, favourite genres & watch diary"
                            : "Trending crowd favourites to kickstart your watchlist"}
                    </p>
                </div>
                <Link to="/movies" className="section-link">
                    <span>Explore all</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] w-full skeleton rounded-xl" />
                    ))}
                </div>
            ) : movies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {movies.slice(0, 5).map((movie) => {
                        const poster = getPosterUrl(movie.poster_path);
                        const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
                        const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;

                        return (
                            <Link
                                key={movie.id}
                                to={`/movies/${movie.id}`}
                                className="group relative block aspect-[2/3] w-full overflow-hidden rounded-xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-card-hover no-underline"
                            >
                                {poster ? (
                                    <img
                                        src={poster}
                                        alt={movie.title}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center bg-surface-2 text-text-3">
                                        <span className="material-symbols-outlined text-2xl mb-1 opacity-40">
                                            movie
                                        </span>
                                        <span className="text-[11px] font-medium text-text line-clamp-2">
                                            {movie.title}
                                        </span>
                                    </div>
                                )}

                                {/* Hover Vignette & Info */}
                                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 p-3 flex flex-col justify-end">
                                    {rating && (
                                        <div className="flex items-center gap-1 text-accent text-xs font-semibold mb-1">
                                            <span className="material-symbols-outlined text-[14px]">star</span>
                                            <span>{rating}</span>
                                        </div>
                                    )}
                                    <h4 className="text-xs font-semibold text-text line-clamp-2 leading-snug">
                                        {movie.title}
                                    </h4>
                                    <span className="text-[10px] text-text-3 mt-0.5">{year}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface/50 p-6 text-center">
                    <p className="text-sm text-text-2 mb-2">No recommendations available right now.</p>
                    <Link to="/genres" className="btn-secondary text-xs py-1.5 px-4 inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">tune</span>
                        Select Favorite Genres
                    </Link>
                </div>
            )}
        </section>
    );
}
