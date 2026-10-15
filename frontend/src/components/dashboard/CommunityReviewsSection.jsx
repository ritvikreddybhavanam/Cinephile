import { Link } from "react-router-dom";
import RatingStars from "../common/RatingStars.jsx";

export default function CommunityReviewsSection({ communityFeed = [], loading = false }) {
    if (!loading && communityFeed.length === 0) {
        return null; // Omit if no community reviews exist as requested
    }

    return (
        <section className="space-y-4">
            <div className="section-header">
                <div>
                    <h3 className="section-title">From the Community</h3>
                    <p className="mt-0.5 text-xs text-text-3">
                        Recent reviews and impressions shared by cinephiles
                    </p>
                </div>
                <Link to="/social" className="section-link">
                    <span>Social Feed</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-32 w-full skeleton rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {communityFeed.slice(0, 4).map((item) => {
                        const avatar = item.userAvatar;
                        const userName = item.userName || item.userUsername || "Cinephile";
                        const movieTitle = item.movieTitle || "Film";
                        const rating = item.rating;
                        const text = item.reviewText || item.notes;

                        return (
                            <article
                                key={item.id || `${item.userId}-${item.movieId}`}
                                className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:border-accent/40 hover:shadow-card"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2.5">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {avatar ? (
                                                <img
                                                    src={avatar}
                                                    alt={userName}
                                                    className="h-8 w-8 rounded-full object-cover border border-border"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-xs font-semibold text-accent font-mono">
                                                    {userName.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-semibold text-text truncate">
                                                    {userName}
                                                </h4>
                                                <span className="text-[10px] text-text-3 truncate block">
                                                    Reviewed{" "}
                                                    <Link
                                                        to={item.movieId ? `/movies/${item.movieId}` : "#"}
                                                        className="text-text-2 hover:text-accent transition-colors font-medium"
                                                    >
                                                        {movieTitle}
                                                    </Link>
                                                </span>
                                            </div>
                                        </div>

                                        {rating != null && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <RatingStars rating={rating} />
                                                <span className="text-[11px] font-mono text-accent font-semibold">
                                                    {rating}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {text && (
                                        <p className="text-xs text-text-2 italic line-clamp-3 leading-relaxed">
                                            &ldquo;{text}&rdquo;
                                        </p>
                                    )}
                                </div>

                                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-text-3">
                                    {item.movieYear && (
                                        <span>Release: {item.movieYear}</span>
                                    )}
                                    {item.movieId && (
                                        <Link
                                            to={`/movies/${item.movieId}`}
                                            className="text-accent hover:underline inline-flex items-center gap-0.5 ml-auto"
                                        >
                                            <span>Movie details</span>
                                            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                                        </Link>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
