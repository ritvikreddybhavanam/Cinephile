import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Filmography({ credits }) {
    const navigate = useNavigate();

    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");

    const films = useMemo(() => {
        const cast = (credits?.cast || []).map((movie) => ({
            ...movie,
            roles: ["acting"]
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
                roles
            };
        });

        const all = [...cast, ...crew];

        const unique = all.filter(
            (movie, index, array) =>
                array.findIndex(
                    (item) => item.id === movie.id
                ) === index
        );

        return unique;
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

                    <span className="w-1.5 h-4 rounded bg-[#43fe6d]" />

                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        FILMOGRAPHY
                    </h2>

                </div>

                <select
                    value={sort}
                    onChange={(event) =>
                        setSort(event.target.value)
                    }
                    className="bg-[#1c2024] px-3 py-2 rounded text-white text-sm outline-none border-none"
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
                        className={`px-4 py-1.5 rounded-full text-sm shrink-0 transition-colors ${
                            filter === value
                                ? "bg-[#43fe6d] text-[#00390f] font-semibold"
                                : "bg-[#1c2024] text-[#bacbb6] hover:bg-[#2C3440]"
                        }`}
                    >
                        {label}
                    </button>
                ))}

            </div>

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
                        movie.roles?.join(" • ") || "Credit";

                    return (
                        <div
                            key={movie.id}
                            onClick={() =>
                                movie.media_type !== "tv" &&
                                navigate(`/movies/${movie.id}`)
                            }
                            className="bg-[#181c20] hover:bg-[#1c2024] rounded-xl p-4 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between cursor-pointer"
                        >

                            <div className="flex items-center gap-4 min-w-0">

                                <div className="w-14 h-20 rounded bg-[#2C3440] overflow-hidden shrink-0">

                                    {movie.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                            alt={title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#99AABB]">
                                            <span className="material-symbols-outlined">
                                                movie
                                            </span>
                                        </div>
                                    )}

                                </div>

                                <div className="flex flex-col min-w-0">

                                    <div className="flex items-center gap-2">

                                        <span className="text-[18px] font-bold text-white truncate hover:text-[#43fe6d]">
                                            {title}
                                        </span>

                                        {movie.runtime && (
                                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#262a2f] text-[#99AABB] shrink-0">
                                                {movie.runtime}m
                                            </span>
                                        )}

                                    </div>

                                    <span className="text-sm text-[#99AABB] capitalize">
                                        {roleText}
                                    </span>

                                    {movie.overview && (
                                        <p className="text-[13px] text-[#bacbb6] line-clamp-1 mt-1">
                                            {movie.overview}
                                        </p>
                                    )}

                                </div>

                            </div>

                            <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0 w-full sm:w-auto justify-between">

                                <span className="text-[22px] font-bold text-white">
                                    {year || "N/A"}
                                </span>

                                <span className="flex items-center gap-1 text-[#FFCC00] text-[13px] font-bold">

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

        </section>
    );
}

export default Filmography;