import { useNavigate } from "react-router-dom";
import Icon from "../common/Icon";

function SpotlightCard({ movie }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/movies/${movie.id}`)}
            className="relative flex min-h-[300px] flex-1 flex-col justify-end overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-card group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover"
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                style={{ backgroundImage: `url('${movie.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/60 to-transparent" />

            {/* Rank number */}
            <div className="absolute left-4 top-4 z-10">
                <span className="font-serif text-5xl font-semibold leading-none text-transparent" style={{ WebkitTextStroke: "1.5px rgba(201,168,106,0.3)" }}>
                    {String(movie.rank).padStart(2, "0")}
                </span>
            </div>

            {/* Trend / Language badge */}
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5">
                {movie.language && (
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-bg/80 backdrop-blur-md text-text-3 border border-border">
                        {movie.language}
                    </span>
                )}
                {movie.trend && (
                    <span className="badge badge-accent">{movie.trend}</span>
                )}
            </div>

            <div className="relative z-20">
                <div className="mb-1.5 flex items-center gap-2 text-xs text-text-3">
                    <span>{movie.year}</span>
                    <span className="text-border">·</span>
                    <span className="truncate max-w-[140px]">{movie.genre}</span>
                    <div className="ml-auto flex items-center gap-1 text-accent">
                        <Icon className="text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</Icon>
                        <span className="text-xs font-semibold text-text">{movie.rating}</span>
                        {movie.audience && (
                            <span className="text-[10px] text-text-3">({movie.audience})</span>
                        )}
                    </div>
                </div>

                <h3 className="mb-2 truncate font-serif text-xl font-semibold text-text transition-colors group-hover:text-accent">
                    {movie.title}
                </h3>

                <p className="mb-4 line-clamp-2 text-xs text-text-2 leading-relaxed">
                    {movie.description || movie.overview}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/movies/${movie.id}`);
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-surface-2/90 px-4 py-2 text-xs font-semibold text-text-2 transition-all hover:bg-accent hover:text-bg hover:border-accent"
                    >
                        <Icon className="text-[15px]">info</Icon>
                        Details
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/movies/${movie.id}`);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2/90 text-text-2 transition-colors hover:bg-accent/20 hover:text-accent"
                    >
                        <Icon className="text-[17px]">play_arrow</Icon>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpotlightCard;
