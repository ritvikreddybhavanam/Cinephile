import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getPosterUrl } from "../../services/movieService";

function RecommendationSection({ recommendations = [], similar = [] }) {
    const recsList = Array.isArray(recommendations) ? recommendations : [];
    const simList = Array.isArray(similar) ? similar : [];

    const hasBoth = recsList.length > 0 && simList.length > 0;
    const [tab, setTab] = useState(recsList.length > 0 ? "recommendations" : "similar");

    const displayedMovies = tab === "recommendations" ? recsList : simList;

    if (recsList.length === 0 && simList.length === 0) {
        return null;
    }

    return (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-12 md:pb-16">
            <div className="section-header mb-6">
                <div>
                    <p className="label-caps mb-1">Curation</p>
                    <h2 className="section-title">
                        {tab === "recommendations" ? "Recommended For You" : "Thematically Similar Films"}
                    </h2>
                </div>

                {hasBoth && (
                    <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-lg">
                        <button
                            type="button"
                            onClick={() => setTab("recommendations")}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                tab === "recommendations"
                                    ? "bg-accent text-bg font-semibold shadow-sm"
                                    : "text-text-3 hover:text-text"
                            }`}
                        >
                            Recommendations ({recsList.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("similar")}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                tab === "similar"
                                    ? "bg-accent text-bg font-semibold shadow-sm"
                                    : "text-text-3 hover:text-text"
                            }`}
                        >
                            Similar Films ({simList.length})
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {displayedMovies.slice(0, 10).map((movie) => (
                    <Link
                        key={movie.id}
                        to={`/movies/${movie.id}`}
                        className="group no-underline"
                    >
                        <div className="poster-card">
                            {movie.poster_path ? (
                                <img
                                    src={getPosterUrl(movie.poster_path)}
                                    alt={movie.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-3 text-xs">
                                    No Image
                                </div>
                            )}

                            {movie.vote_average > 0 ? (
                                <div className="absolute top-2 left-2 badge badge-accent backdrop-blur-sm font-semibold">
                                    ★ {Number(movie.vote_average).toFixed(1)}
                                </div>
                            ) : null}
                        </div>

                        <h3 className="mt-2.5 text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                            {movie.title}
                        </h3>

                        <p className="text-[11px] text-text-3 mt-0.5">
                            {movie.release_date
                                ? movie.release_date.substring(0, 4)
                                : "N/A"}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default RecommendationSection;