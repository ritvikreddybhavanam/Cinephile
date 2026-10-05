import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Filmography({ credits }) {
    const navigate = useNavigate();

    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");

    const films = useMemo(() => {
        const cast = (credits?.cast || []).map((movie) => ({
            ...movie,
            roles: ["acting"],
            roleLabels: movie.character ? [`as ${movie.character}`] : ["Actor"]
        }));

        const crew = (credits?.crew || []).map((movie) => {
            const roles = [];

            if (movie.job === "Director") {
                roles.push("directing");
            }

            if (
                movie.department === "Writing" ||
                movie.job === "Writer" ||
                movie.job === "Screenplay" ||
                movie.job === "Story"
            ) {
                roles.push("writing");
            }

            if (
                movie.department === "Production" ||
                movie.job?.toLowerCase().includes("producer")
            ) {
                roles.push("producing");
            }

            return {
                ...movie,
                roles,
                roleLabels: movie.job ? [movie.job] : []
            };
        });

        const movieMap = new Map();

        cast.forEach((movie) => {
            if (!movie?.id) return;
            movieMap.set(movie.id, {
                ...movie,
                roles: ["acting"],
                roleLabels: movie.roleLabels || []
            });
        });

        crew.forEach((movie) => {
            if (!movie?.id) return;
            if (!movieMap.has(movie.id)) {
                movieMap.set(movie.id, {
                    ...movie,
                    roles: [...movie.roles],
                    roleLabels: movie.roleLabels || []
                });
            } else {
                const existing = movieMap.get(movie.id);
                movie.roles.forEach((r) => {
                    if (!existing.roles.includes(r)) existing.roles.push(r);
                });
                if (movie.job && !existing.roleLabels.includes(movie.job)) {
                    existing.roleLabels.push(movie.job);
                }
            }
        });

        return Array.from(movieMap.values());
    }, [credits]);

    const filteredFilms = useMemo(() => {
        let result = films;

        if (filter !== "all") {
            result = result.filter((movie) =>
                movie.roles?.includes(filter)
            );
        }

        result = [...result].sort((a, b) => {
            const dateA =
                a.release_date ||
                a.first_air_date ||
                "";

            const dateB =
                b.release_date ||
                b.first_air_date ||
                "";

            if (sort === "newest") {
                return dateB.localeCompare(dateA);
            }

            if (sort === "oldest") {
                return dateA.localeCompare(dateB);
            }

            if (sort === "rating") {
                return (
                    (b.vote_average || 0) -
                    (a.vote_average || 0)
                );
            }

            return (a.title || a.name || "").localeCompare(
                b.title || b.name || ""
            );
        });

        return result;
    }, [films, filter, sort]);

    return (
        <section className="lg:col-span-8 flex flex-col">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 rounded bg-accent" />
                    <h2 className="text-2xl font-bold text-text tracking-tight font-serif">
                        FILMOGRAPHY
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-3 font-mono border border-border">
                        {filteredFilms.length}
                    </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* View mode toggle */}
                    <div className="flex items-center bg-surface-2 p-0.5 rounded-lg border border-border">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                viewMode === "grid"
                                    ? "bg-accent text-bg"
                                    : "text-text-3 hover:text-text"
                            }`}
                            title="Grid View"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                grid_view
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                viewMode === "list"
                                    ? "bg-accent text-bg"
                                    : "text-text-3 hover:text-text"
                            }`}
                            title="List View"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                format_list_bulleted
                            </span>
                        </button>
                    </div>

                    {/* Sort selector */}
                    <select
                        value={sort}
                        onChange={(event) =>
                            setSort(event.target.value)
                        }
                        className="bg-surface px-3 py-2 rounded-lg text-text text-sm outline-none border border-border cursor-pointer"
                    >
                        <option value="newest">
                            Newest
                        </option>

                        <option value="oldest">
                            Oldest
                        </option>

                        <option value="rating">
                            Highest Rated
                        </option>

                        <option value="title">
                            Title
                        </option>
                    </select>
                </div>

            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
                {[
                    ["all", "All"],
                    ["directing", "Directing"],
                    ["writing", "Writing"],
                    ["producing", "Producing"],
                    ["acting", "Acting"]
                ].map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={`px-4 py-1.5 rounded-full text-sm shrink-0 transition-colors cursor-pointer border ${
                            filter === value
                                ? "bg-accent text-bg font-semibold border-accent"
                                : "bg-surface text-text-2 border-border hover:bg-surface-2"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {filteredFilms.length === 0 ? (
                <div className="text-center py-12 text-text-3 bg-surface rounded-xl border border-border">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                        movie_off
                    </span>
                    <p className="text-sm">No films found for this filter.</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredFilms.map((movie) => {
                        const title =
                            movie.title || movie.name;

                        const date =
                            movie.release_date ||
                            movie.first_air_date ||
                            "";

                        const year =
                            date.substring(0, 4);

                        const roleText =
                            movie.roleLabels?.join(" • ") ||
                            movie.character ||
                            movie.job ||
                            movie.roles?.join(" • ") ||
                            "Credit";

                        return (
                            <div
                                key={movie.id}
                                onClick={() =>
                                    movie.media_type !== "tv" &&
                                    navigate(`/movies/${movie.id}`)
                                }
                                className="group flex flex-col bg-surface rounded-xl overflow-hidden shadow-card border border-border hover:border-accent/40 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
                            >
                                <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-2">
                                    {movie.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-text-3 p-3 text-center">
                                            <span className="material-symbols-outlined text-4xl opacity-40 mb-1">
                                                movie
                                            </span>
                                            <span className="text-[11px] font-medium line-clamp-2">
                                                {title}
                                            </span>
                                        </div>
                                    )}

                                    {movie.vote_average ? (
                                        <div className="absolute top-2 right-2 bg-bg/85 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-border/40">
                                            <span className="material-symbols-outlined text-accent text-[14px]">
                                                star
                                            </span>
                                            <span className="text-[11px] font-bold text-text">
                                                {Number(movie.vote_average).toFixed(1)}
                                            </span>
                                        </div>
                                    ) : null}

                                    {year && (
                                        <div className="absolute bottom-2 left-2 bg-bg/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-text-2 border border-border/40">
                                            {year}
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-bg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="w-9 h-9 rounded-full bg-accent text-bg flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110">
                                            <span className="material-symbols-outlined text-[18px]">
                                                arrow_forward
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 flex flex-col flex-1 justify-between">
                                    <div>
                                        <h3
                                            className="text-sm font-bold text-text truncate block group-hover:text-accent transition-colors"
                                            title={title}
                                        >
                                            {title}
                                        </h3>
                                        <p
                                            className="text-[11px] text-text-3 truncate mt-0.5 capitalize"
                                            title={roleText}
                                        >
                                            {roleText}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredFilms.map((movie) => {
                        const title =
                            movie.title || movie.name;

                        const date =
                            movie.release_date ||
                            movie.first_air_date ||
                            "";

                        const year =
                            date.substring(0, 4);

                        const roleText =
                            movie.roleLabels?.join(" • ") ||
                            movie.character ||
                            movie.job ||
                            movie.roles?.join(" • ") ||
                            "Credit";

                        return (
                            <div
                                key={movie.id}
                                onClick={() =>
                                    movie.media_type !== "tv" &&
                                    navigate(`/movies/${movie.id}`)
                                }
                                className="bg-surface hover:bg-surface-2 rounded-xl p-4 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between cursor-pointer border border-border"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-14 h-20 rounded bg-surface-2 overflow-hidden shrink-0 border border-border">
                                        {movie.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                                alt={title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-3">
                                                <span className="material-symbols-outlined">
                                                    movie
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[18px] font-bold text-text truncate hover:text-accent">
                                                {title}
                                            </span>

                                            {movie.runtime && (
                                                <span className="text-[11px] px-2 py-0.5 rounded bg-surface-2 text-text-3 shrink-0 border border-border">
                                                    {movie.runtime}m
                                                </span>
                                            )}
                                        </div>

                                        <span className="text-sm text-text-2 capitalize">
                                            {roleText}
                                        </span>

                                        {movie.overview && (
                                            <p className="text-[13px] text-text-3 line-clamp-1 mt-1">
                                                {movie.overview}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0 w-full sm:w-auto justify-between">
                                    <span className="text-[22px] font-bold text-text">
                                        {year || "N/A"}
                                    </span>

                                    <span className="flex items-center gap-1 text-accent text-[13px] font-bold">
                                        <span className="material-symbols-outlined text-[16px]">
                                            star
                                        </span>

                                        {movie.vote_average
                                            ? Number(movie.vote_average).toFixed(1)
                                            : "N/A"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default Filmography;