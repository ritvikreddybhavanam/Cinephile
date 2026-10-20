import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../common/Icon";

const REGION_OPTIONS = [
    { code: "US", label: "United States" },
    { code: "IN", label: "India" },
    { code: "GB", label: "United Kingdom" },
    { code: "CA", label: "Canada" },
    { code: "AU", label: "Australia" }
];

export default function FreshOnOttSection({
    movies = [],
    loading = false,
    selectedRegion = "US",
    onRegionChange,
    providerMap = {}
}) {
    const navigate = useNavigate();

    return (
        <section className="page-container" aria-label="Fresh on OTT Streaming">
            <div className="section-header flex-col sm:flex-row items-start sm:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-cyan-400 text-[18px]">
                            devices
                        </span>
                        <p className="label-caps !mb-0 text-cyan-400">Home Cinema & OTT</p>
                    </div>
                    <h2 className="section-title">Fresh on Streaming</h2>
                    <p className="text-xs text-text-3 mt-1">
                        Critically rated films newly available to stream on verified platforms
                    </p>
                </div>

                {/* Country Region Selector & Catalog Link */}
                <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 bg-surface border border-border px-2.5 py-1 rounded-full text-xs text-text-2">
                        <span className="material-symbols-outlined text-[15px] text-text-3">public</span>
                        <select
                            value={selectedRegion}
                            onChange={(e) => onRegionChange && onRegionChange(e.target.value)}
                            className="bg-transparent text-xs text-text font-semibold focus:outline-none cursor-pointer"
                            aria-label="Select streaming territory"
                        >
                            {REGION_OPTIONS.map((r) => (
                                <option key={r.code} value={r.code} className="bg-surface text-text">
                                    {r.code} ({r.label})
                                </option>
                            ))}
                        </select>
                    </div>

                    <Link to="/movies" className="section-link">
                        <span>Streaming Catalog</span>
                        <Icon className="text-sm">arrow_forward</Icon>
                    </Link>
                </div>
            </div>

            {loading && (!movies || movies.length === 0) ? (
                <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="aspect-[2/3] w-full skeleton rounded-xl" />
                            <div className="h-3 w-3/4 skeleton rounded" />
                            <div className="h-2.5 w-1/2 skeleton rounded" />
                        </div>
                    ))}
                </div>
            ) : (!movies || movies.length === 0) ? (
                <div className="p-8 rounded-xl border border-border bg-surface text-center text-text-3 text-sm">
                    No verified streaming releases found for region {selectedRegion}.
                </div>
            ) : (
                <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                    {movies.map((movie) => {
                        const providers = providerMap[movie.id] || movie.providers || [];
                        const flatrateProviders = Array.isArray(providers)
                            ? providers.slice(0, 2)
                            : (providers?.flatrate ? providers.flatrate.slice(0, 2) : []);

                        return (
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

                                    {/* Streaming Tag */}
                                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 shadow-md">
                                        <span>OTT</span>
                                    </div>

                                    {/* Rating */}
                                    <div className="absolute top-2 right-2 badge badge-accent backdrop-blur-md text-[11px]">
                                        ★ {movie.rating}
                                    </div>

                                    {/* Provider Logos Pill on Poster Bottom */}
                                    {flatrateProviders.length > 0 && (
                                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 z-10">
                                            {flatrateProviders.map((p, idx) => (
                                                <div key={idx} className="flex items-center gap-1">
                                                    {p.logo_path ? (
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                                                            alt={p.provider_name}
                                                            title={`Available on ${p.provider_name}`}
                                                            className="w-4 h-4 rounded object-cover shadow-sm"
                                                        />
                                                    ) : null}
                                                    <span className="text-[10px] font-semibold text-text-2 truncate max-w-[80px]">
                                                        {p.provider_name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Hover action */}
                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg/95 via-bg/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/movies/${movie.id}`);
                                            }}
                                            className="btn-primary w-full text-xs py-2 rounded-lg"
                                        >
                                            Streaming Options
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
                        );
                    })}
                </div>
            )}
        </section>
    );
}
