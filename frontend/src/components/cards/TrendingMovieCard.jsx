import { useNavigate } from "react-router-dom";

const TrendingMovieCard = ({ movie }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/movies/${movie.id}`)}
            className="group relative aspect-[16/9] cursor-pointer overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover"
        >
            {movie.backdrop || movie.image ? (
                <img
                    src={movie.backdrop || movie.image}
                    alt={movie.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-2 text-text-3">
                    <span className="text-2xl opacity-40">▣</span>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/50 to-transparent" />

            {/* Rank badge */}
            <div className="absolute top-2.5 left-2.5 z-10">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-bg/80 backdrop-blur-md text-accent border border-accent/20">
                    #{movie.rank}
                </span>
            </div>

            {/* Language badge */}
            {movie.language && (
                <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg/80 backdrop-blur-md text-text-3 border border-border">
                        {movie.language}
                    </span>
                </div>
            )}

            <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-3.5 z-10">
                <h4 className="truncate text-sm font-semibold text-text group-hover:text-accent transition-colors drop-shadow">
                    {movie.title}
                </h4>
                <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-text-3 truncate max-w-[65%]">
                        {movie.year} · {movie.genre || "Film"}
                    </span>
                    <div className="flex items-center gap-1 text-accent font-semibold shrink-0">
                        <span className="material-symbols-outlined text-[14px]">
                            star
                        </span>
                        <span>{movie.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingMovieCard;
