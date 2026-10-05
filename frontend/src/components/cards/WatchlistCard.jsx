import { Link } from "react-router-dom";

function WatchlistCard({ movie, onRemove }) {
    return (
        <div className="group relative bg-surface border border-border rounded-lg overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-card">
            <Link to={`/movies/${movie.movieId}`} className="no-underline">
                <div className="aspect-[2/3] w-full overflow-hidden bg-surface-2 relative">
                    {movie.poster ? (
                        <img
                            src={movie.poster}
                            alt={movie.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-2 text-text-3">
                            <span className="material-symbols-outlined text-3xl opacity-40">movie</span>
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-3 flex flex-col justify-between flex-1">
                <h3 className="text-sm font-medium text-text leading-snug group-hover:text-accent transition-colors">
                    {movie.title}
                </h3>

                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => onRemove(movie.movieId)}
                        className="text-error/70 hover:text-error text-xs font-medium transition-colors"
                    >
                        Remove
                    </button>
                    <Link
                        to={`/movies/${movie.movieId}`}
                        className="text-accent hover:text-accent-hover flex items-center gap-1 text-xs font-medium no-underline transition-colors"
                    >
                        <span className="material-symbols-outlined text-[13px]">info</span>
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default WatchlistCard;