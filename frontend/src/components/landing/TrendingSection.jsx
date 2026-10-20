import { Link, useNavigate } from "react-router-dom";
import Icon from "../common/Icon";

export default function TrendingSection({ movies = [], loading = false }) {
    const navigate = useNavigate();

    return (
        <section className="page-container" aria-label="Trending Today">
            <div className="section-header">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-rose-500 text-[18px]">
                            local_fire_department
                        </span>
                        <p className="label-caps !mb-0 text-rose-400">Right Now</p>
                    </div>
                    <h2 className="section-title">Trending Today</h2>
                    <p className="text-xs text-text-3 mt-1">
                        Highest momentum and daily conversational surge across film circles
                    </p>
                </div>
                <Link to="/trending" className="section-link">
                    <span>Full Trending List</span>
                    <Icon className="text-sm">arrow_forward</Icon>
                </Link>
            </div>

            {loading && (!movies || movies.length === 0) ? (
                <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="aspect-[2/3] w-full skeleton rounded-xl" />
                            <div className="h-3 w-3/4 skeleton rounded" />
                            <div className="h-2.5 w-1/2 skeleton rounded" />
                        </div>
                    ))}
                </div>
            ) : (!movies || movies.length === 0) ? (
                <div className="p-8 rounded-xl border border-border bg-surface text-center text-text-3 text-sm">
                    No trending titles currently available.
                </div>
            ) : (
                <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                    {movies.map((movie, index) => (
                        <article
                            key={movie.id}
                            onClick={() => navigate(`/movies/${movie.id}`)}
                            className="group flex flex-col cursor-pointer"
                        >
                            <div className="poster-card relative">
                                {movie.poster ? (
                                    <img
                                        src={movie.poster}
                                        alt={`${movie.title} poster`}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center bg-surface text-text-3 p-3 text-center">
                                        <span className="text-2xl mb-1 opacity-30">▣</span>
                                        <span className="text-[11px] font-medium">{movie.title}</span>
                                    </div>
                                )}

                                {/* Trend Rank Ribbon */}
                                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-bg/85 backdrop-blur-md border border-border text-[11px] font-mono font-bold text-accent shadow-md">
                                    <span className="text-[10px] text-text-3">#</span>
                                    <span>{index + 1}</span>
                                </div>

                                {/* Rating */}
                                <div className="absolute top-2 right-2 badge badge-accent backdrop-blur-md text-[11px]">
                                    ★ {movie.rating}
                                </div>

                                {/* Hover action */}
                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg/95 via-bg/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/movies/${movie.id}`);
                                        }}
                                        className="btn-primary w-full text-xs py-2 rounded-lg"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2.5 px-0.5">
                                <h3 className="truncate text-sm font-semibold text-text transition-colors group-hover:text-accent">
                                    {movie.title}
                                </h3>
                                <p className="mt-0.5 truncate text-[11px] text-text-3 font-medium">
                                    {movie.genre} · {movie.year}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
