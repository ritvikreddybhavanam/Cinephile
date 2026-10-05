import React from "react";
import { getPosterUrl } from "../../services/movieService";

function MovieInfo({ movie, runtime, budget, revenue, certification }) {
    if (!movie) return null;

    const rawBudget = movie.budget || 0;
    const rawRevenue = movie.revenue || 0;

    let financialROI = null;
    if (rawBudget > 0 && rawRevenue > 0) {
        const ratio = (rawRevenue / rawBudget).toFixed(1);
        financialROI = `${ratio}x ROI`;
    }

    const originalLanguageName = movie.spoken_languages?.find(
        (l) => l.iso_639_1 === movie.original_language
    )?.english_name || movie.original_language?.toUpperCase() || "N/A";

    const spokenLanguagesList = movie.spoken_languages?.length
        ? movie.spoken_languages.map((l) => l.english_name || l.name).join(", ")
        : "N/A";

    const productionCountriesList = movie.production_countries?.length
        ? movie.production_countries.map((c) => c.name).join(", ")
        : "N/A";

    const primaryStats = [
        { label: "Release Date", value: movie.release_date || "N/A", icon: "calendar_today" },
        { label: "Runtime", value: runtime || "N/A", icon: "schedule" },
        { label: "Status", value: movie.status || "Released", icon: "verified" },
        { label: "Certification", value: certification || "Unrated", icon: "policy" },
        { label: "Budget", value: budget, icon: "account_balance_wallet" },
        { label: "Box Office Revenue", value: revenue, icon: "payments", extra: financialROI },
        { label: "Original Language", value: `${originalLanguageName} (${movie.original_language?.toUpperCase() || "N/A"})`, icon: "language" },
        { label: "Spoken Languages", value: spokenLanguagesList, icon: "translate" },
    ];

    return (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 md:pb-14">
            <div className="section-header mb-6">
                <div>
                    <p className="label-caps mb-1">Specifications</p>
                    <h2 className="section-title">Film Details & Production</h2>
                </div>
                {movie.homepage && (
                    <a
                        href={movie.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs py-1.5 px-4 inline-flex items-center gap-1.5 no-underline"
                    >
                        <span>Official Website</span>
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                )}
            </div>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {primaryStats.map(({ label, value, icon, extra }) => (
                    <div
                        key={label}
                        className="bg-surface border border-border rounded-lg p-4 transition-all duration-200 hover:border-accent/40"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="label-caps">{label}</p>
                            {icon && (
                                <span className="material-symbols-outlined text-text-3 text-base">
                                    {icon}
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-semibold text-text truncate" title={String(value)}>
                            {value}
                        </p>
                        {extra && (
                            <span className="inline-block mt-1 badge badge-accent text-[10px]">
                                {extra}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Extended Details: Production Countries & Companies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Production Countries & Original Title */}
                <div className="bg-surface border border-border rounded-lg p-4 sm:p-5">
                    <p className="label-caps mb-3">Origin & Distribution</p>
                    <div className="space-y-3 text-xs">
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-border/50">
                            <span className="text-text-3">Original Title</span>
                            <span className="font-medium text-text text-right">{movie.original_title || movie.title}</span>
                        </div>
                        {movie.tagline && (
                            <div className="flex items-start justify-between gap-2 pb-2 border-b border-border/50">
                                <span className="text-text-3">Tagline</span>
                                <span className="font-serif italic text-text text-right max-w-[70%]">“{movie.tagline}”</span>
                            </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-text-3">Production Countries</span>
                            <span className="font-medium text-text text-right max-w-[70%]">{productionCountriesList}</span>
                        </div>
                    </div>
                </div>

                {/* Production Companies */}
                <div className="bg-surface border border-border rounded-lg p-4 sm:p-5">
                    <p className="label-caps mb-3">Production Companies</p>
                    {movie.production_companies?.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-3">
                            {movie.production_companies.map((company) => {
                                const logo = company.logo_path ? getPosterUrl(company.logo_path) : null;
                                return (
                                    <div
                                        key={company.id}
                                        className="flex items-center gap-2 rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs text-text transition-all hover:border-accent/40"
                                        title={company.origin_country ? `${company.name} (${company.origin_country})` : company.name}
                                    >
                                        {logo ? (
                                            <div className="h-5 w-8 flex items-center justify-center p-0.5 bg-white/10 rounded">
                                                <img
                                                    src={logo}
                                                    alt={company.name}
                                                    className="max-h-full max-w-full object-contain brightness-95"
                                                />
                                            </div>
                                        ) : (
                                            <span className="material-symbols-outlined text-text-3 text-sm">
                                                corporate_fare
                                            </span>
                                        )}
                                        <span className="font-medium truncate max-w-[140px]">{company.name}</span>
                                        {company.origin_country && (
                                            <span className="text-[10px] text-text-3 font-mono">
                                                {company.origin_country}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-text-3">No production companies listed.</p>
                    )}
                </div>
            </div>
        </section>
    );
}

export default MovieInfo;