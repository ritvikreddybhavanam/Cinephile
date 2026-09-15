import { Link } from "react-router-dom";

function WatchlistCard({ movie, onRemove }) {
    return (
        <div
            className="group relative bg-[#141920] border border-white/10 rounded-lg overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(0,224,84,0.2)]"
        >
            <Link to={`/movies/${movie.movieId}`}>
                <div className="aspect-[2/3] w-full overflow-hidden bg-slate-900 relative">

                    {movie.poster ? (
                        <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#181c20]">
                            <span className="material-symbols-outlined text-5xl text-slate-600">
                                movie
                            </span>
                        </div>
                    )}

                </div>
            </Link>

            <div className="p-3.5 flex flex-col justify-between flex-1">

                <div>
                    <h3 className="font-bold text-sm text-white leading-tight group-hover:text-[#00e054] transition-colors">
                        {movie.title}
                    </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">

                    <button
                        type="button"
                        onClick={() => onRemove(movie.movieId)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                    >
                        Remove
                    </button>

                    <button
                        type="button"
                        className="text-[#00e054] hover:underline cursor-pointer flex items-center gap-1 text-xs font-medium"
                    >
                        <span className="material-symbols-outlined text-[13px]">
                            play_circle
                        </span>

                        Watch
                    </button>

                </div>

            </div>
        </div>
    );
}

export default WatchlistCard;