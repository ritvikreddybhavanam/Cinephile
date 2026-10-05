import React from "react";

const selectClass = "mc-input rounded-lg text-sm py-2 px-3 cursor-pointer appearance-none bg-surface border border-border text-text-2 hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";

const MovieFilterBar = ({
    language,
    setLanguage,
    genre,
    setGenre,
    year,
    setYear,
    rating,
    setRating,
    sort,
    setSort,
    languageOptions,
    genreOptions = [],
    yearOptions = [],
    ratingOptions = [],
    resultCount = 0,
}) => {
    const sortOptions = ["Featured", "Popular", "Newest", "Top Rated"];

    return (
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 border-b border-border">

            <div className="flex flex-wrap items-center gap-2">
                {languageOptions && setLanguage && (
                    <select
                        value={language || ""}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={selectClass}
                        aria-label="Language"
                    >
                        {languageOptions.map((option) => {
                            const val = typeof option === "object" ? option.code : option;
                            const label = typeof option === "object" ? option.name : option;
                            return (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                )}

                <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectClass} aria-label="Genre">
                    {genreOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>

                <select value={year} onChange={(e) => setYear(e.target.value)} className={selectClass} aria-label="Year">
                    {yearOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>

                <select value={rating} onChange={(e) => setRating(e.target.value)} className={selectClass} aria-label="Rating">
                    {ratingOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>

                <span className="text-xs text-text-3 ml-1">
                    <strong className="text-text-2">{resultCount}</strong> films
                </span>
            </div>

            <div className="flex items-center gap-1.5">
                {sortOptions.map((option) => (
                    <button
                        key={option}
                        onClick={() => setSort(option)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                            sort === option
                                ? "bg-accent text-bg"
                                : "border border-border text-text-3 hover:border-accent/50 hover:text-text-2"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </section>
    );
};

export default MovieFilterBar;