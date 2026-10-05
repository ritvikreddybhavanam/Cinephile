import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import Icon from "../../../components/common/Icon.jsx";

import {
    getNewReleases,
    getGenres,
    getLanguages,
    getPosterUrl
} from "../../../services/movieService.js";

const MONTHS = [
    { number: 1, name: "January", short: "Jan" },
    { number: 2, name: "February", short: "Feb" },
    { number: 3, name: "March", short: "Mar" },
    { number: 4, name: "April", short: "Apr" },
    { number: 5, name: "May", short: "May" },
    { number: 6, name: "June", short: "Jun" },
    { number: 7, name: "July", short: "Jul" },
    { number: 8, name: "August", short: "Aug" },
    { number: 9, name: "September", short: "Sep" },
    { number: 10, name: "October", short: "Oct" },
    { number: 11, name: "November", short: "Nov" },
    { number: 12, name: "December", short: "Dec" },
];

const POPULAR_LANGUAGES = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "te", name: "Telugu" },
    { code: "ta", name: "Tamil" },
    { code: "ml", name: "Malayalam" },
    { code: "ko", name: "Korean" },
    { code: "ja", name: "Japanese" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "zh", name: "Chinese" },
];

export default function NewReleases() {
    const navigate = useNavigate();

    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12 or null for all

    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [allLanguages, setAllLanguages] = useState([]);

    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);

    const [sortBy, setSortBy] = useState("primary_release_date.desc");

    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const yearOptions = [
        now.getFullYear() + 1,
        now.getFullYear(),
        now.getFullYear() - 1,
        now.getFullYear() - 2,
        now.getFullYear() - 3,
    ];

    const getDateRange = (year, month) => {
        if (!month) {
            return {
                fromDate: `${year}-01-01`,
                toDate: `${year}-12-31`,
            };
        }
        const lastDay = new Date(year, month, 0).getDate();
        const monthStr = String(month).padStart(2, "0");
        return {
            fromDate: `${year}-${monthStr}-01`,
            toDate: `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`,
        };
    };

    const getGenreNames = (genreIds = []) => {
        if (!genreIds?.length || !genres.length) return "";
        return genreIds
            .map((id) => genres.find((g) => g.id === id)?.name)
            .filter(Boolean)
            .slice(0, 2)
            .join(" · ");
    };

    const loadInitialData = async () => {
        try {
            const [genreData, langData] = await Promise.all([
                getGenres(),
                getLanguages(),
            ]);

            setGenres(Array.isArray(genreData) ? genreData : genreData?.genres || []);

            if (Array.isArray(langData)) {
                const valid = langData
                    .filter((l) => l.iso_639_1 && (l.english_name || l.name))
                    .sort((a, b) =>
                        (a.english_name || a.name).localeCompare(b.english_name || b.name)
                    );
                setAllLanguages(valid);
            }
        } catch (err) {
            console.error("Failed to load filter metadata:", err);
        }
    };

    const fetchReleases = async ({
        pageNumber = 1,
        append = false,
        year = selectedYear,
        month = selectedMonth,
        language = selectedLanguage,
        genre = selectedGenre,
        sort = sortBy,
    } = {}) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setError("");
            }

            const { fromDate, toDate } = getDateRange(year, month);

            const data = await getNewReleases({
                page: pageNumber,
                sortBy: sort,
                year: String(year),
                language: language ? language.code : undefined,
                genre: genre ? String(genre.id) : undefined,
                fromDate,
                toDate,
            });

            const results = data?.results || [];

            if (append) {
                setMovies((prev) => [...prev, ...results]);
            } else {
                setMovies(results);
            }

            setPage(pageNumber);

            if (data?.total_pages) {
                setHasMore(pageNumber < data.total_pages);
            } else {
                setHasMore(results.length > 0);
            }
        } catch (err) {
            console.error("Failed to fetch new releases:", err);
            if (!append) {
                setError("Unable to load new releases for this filter.");
                setMovies([]);
            }
        } finally {
            if (append) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadInitialData();
        fetchReleases({ pageNumber: 1, append: false, year: selectedYear, month: selectedMonth });
    }, []);

    const handleMonthChange = (monthNum) => {
        setSelectedMonth(monthNum);
        fetchReleases({
            pageNumber: 1,
            append: false,
            year: selectedYear,
            month: monthNum,
            language: selectedLanguage,
            genre: selectedGenre,
            sort: sortBy,
        });
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
        fetchReleases({
            pageNumber: 1,
            append: false,
            year,
            month: selectedMonth,
            language: selectedLanguage,
            genre: selectedGenre,
            sort: sortBy,
        });
    };

    const handleLanguageChange = (lang) => {
        const newLang = selectedLanguage?.code === lang?.code ? null : lang;
        setSelectedLanguage(newLang);
        fetchReleases({
            pageNumber: 1,
            append: false,
            year: selectedYear,
            month: selectedMonth,
            language: newLang,
            genre: selectedGenre,
            sort: sortBy,
        });
    };

    const handleGenreChange = (genre) => {
        const newGenre = selectedGenre?.id === genre?.id ? null : genre;
        setSelectedGenre(newGenre);
        fetchReleases({
            pageNumber: 1,
            append: false,
            year: selectedYear,
            month: selectedMonth,
            language: selectedLanguage,
            genre: newGenre,
            sort: sortBy,
        });
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        fetchReleases({
            pageNumber: 1,
            append: false,
            year: selectedYear,
            month: selectedMonth,
            language: selectedLanguage,
            genre: selectedGenre,
            sort: newSort,
        });
    };

    const handleLoadMore = () => {
        if (loadingMore || !hasMore) return;
        fetchReleases({
            pageNumber: page + 1,
            append: true,
        });
    };

    const handleResetFilters = () => {
        setSelectedMonth(now.getMonth() + 1);
        setSelectedYear(now.getFullYear());
        setSelectedLanguage(null);
        setSelectedGenre(null);
        setSortBy("primary_release_date.desc");
        fetchReleases({
            pageNumber: 1,
            append: false,
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            language: null,
            genre: null,
            sort: "primary_release_date.desc",
        });
    };

    const formatReleaseDate = (dateStr) => {
        if (!dateStr) return "TBA";
        try {
            const [y, m, d] = dateStr.split("-");
            const date = new Date(Number(y), Number(m) - 1, Number(d));
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const currentMonthObj = MONTHS.find((m) => m.number === selectedMonth);

    return (
        <div className="flex min-h-screen flex-col bg-bg font-sans text-text antialiased">
            <Navbar />

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="section-header mb-8">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2">
                            <span className="badge badge-accent">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                Premiere Calendar
                            </span>
                        </div>

                        <h1 className="section-title text-3xl sm:text-4xl md:text-5xl">
                            New Releases
                        </h1>

                        <p className="text-text-3 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                            {selectedLanguage
                                ? `Freshly premiering ${selectedLanguage.name} films for ${
                                      currentMonthObj ? currentMonthObj.name : "all of"
                                  } ${selectedYear}.`
                                : `Discover theatrical debuts and digital premieres for ${
                                      currentMonthObj ? currentMonthObj.name : "all of"
                                  } ${selectedYear}.`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Year Selector */}
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(Number(e.target.value))}
                            className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-text outline-none focus:border-accent cursor-pointer"
                        >
                            {yearOptions.map((yr) => (
                                <option key={yr} value={yr}>
                                    {yr}
                                </option>
                            ))}
                        </select>

                        {/* Reset Filters */}
                        {(selectedLanguage ||
                            selectedGenre ||
                            selectedMonth !== now.getMonth() + 1 ||
                            selectedYear !== now.getFullYear()) && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs text-text-3 hover:text-accent font-mono underline cursor-pointer px-2"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters Section */}
                <div className="space-y-4 mb-8 bg-surface/50 border border-border rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
                    {/* Month Pills */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[11px] uppercase text-text-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[15px] text-accent">
                                    calendar_month
                                </span>
                                Release Month:
                            </span>

                            <span className="text-[11px] text-text-3">
                                {currentMonthObj ? `${currentMonthObj.name} ${selectedYear}` : `All ${selectedYear}`}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                            <button
                                onClick={() => handleMonthChange(null)}
                                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                    selectedMonth === null
                                        ? "border-accent bg-accent/15 text-accent font-semibold"
                                        : "border-border bg-surface text-text-3 hover:text-text hover:border-border/80"
                                }`}
                            >
                                All Months
                            </button>

                            {MONTHS.map((m) => (
                                <button
                                    key={m.number}
                                    onClick={() => handleMonthChange(m.number)}
                                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                        selectedMonth === m.number
                                            ? "border-accent bg-accent/15 text-accent font-semibold"
                                            : "border-border bg-surface text-text-3 hover:text-text hover:border-border/80"
                                    }`}
                                >
                                    {m.short}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language Pills & Dropdown */}
                    <div>
                        <span className="font-mono text-[11px] uppercase text-text-3 mb-2 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-accent">
                                translate
                            </span>
                            Language:
                        </span>

                        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                            <button
                                onClick={() => handleLanguageChange(null)}
                                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                    selectedLanguage === null
                                        ? "border-accent bg-accent/15 text-accent font-semibold"
                                        : "border-border bg-surface text-text-3 hover:text-text hover:border-border/80"
                                }`}
                            >
                                All Languages
                            </button>

                            {POPULAR_LANGUAGES.map((item) => (
                                <button
                                    key={item.code}
                                    onClick={() => handleLanguageChange(item)}
                                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                        selectedLanguage?.code === item.code
                                            ? "border-accent bg-accent/15 text-accent font-semibold"
                                            : "border-border bg-surface text-text-3 hover:text-text hover:border-border/80"
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}

                            {/* More Languages Dropdown */}
                            {allLanguages.length > 0 && (
                                <select
                                    value={selectedLanguage?.code || ""}
                                    onChange={(e) => {
                                        const code = e.target.value;
                                        if (!code) {
                                            handleLanguageChange(null);
                                        } else {
                                            const found = allLanguages.find((l) => l.iso_639_1 === code);
                                            handleLanguageChange({
                                                code,
                                                name: found?.english_name || found?.name || code.toUpperCase(),
                                            });
                                        }
                                    }}
                                    className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-2 outline-none hover:text-text cursor-pointer focus:border-accent"
                                >
                                    <option value="">More Languages…</option>
                                    {allLanguages.map((l) => (
                                        <option key={l.iso_639_1} value={l.iso_639_1}>
                                            {l.english_name || l.name} ({l.iso_639_1.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Genres & Sorting Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/50">
                        {/* Genres */}
                        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar max-w-full">
                            <span className="font-mono text-[11px] uppercase text-text-3 mr-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px] text-accent">
                                    category
                                </span>
                                Genre:
                            </span>

                            <button
                                onClick={() => handleGenreChange(null)}
                                className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors ${
                                    selectedGenre === null
                                        ? "border-accent bg-accent/15 text-accent font-semibold"
                                        : "border-border bg-surface text-text-3 hover:text-text hover:border-border/80"
                                }`}
                            >
                                All Genres
                            </button>

                            {genres.slice(0, 10).map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleGenreChange(item)}
                                    className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors ${
                                        selectedGenre?.id === item.id
                                            ? "border-accent bg-accent/15 text-accent font-semibold"
                                            : "border-border bg-surface text-text-3 hover:text-text hover:border-border/80"
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <div className="ml-auto flex items-center gap-2">
                            <label className="flex items-center gap-2 text-xs text-text-3">
                                Sort:
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-accent focus:outline-none cursor-pointer"
                                >
                                    <option value="primary_release_date.desc">
                                        Release Date (Newest)
                                    </option>
                                    <option value="primary_release_date.asc">
                                        Release Date (Oldest)
                                    </option>
                                    <option value="popularity.desc">Most Popular</option>
                                    <option value="vote_average.desc">Highest Rated</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Movie Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[2/3] w-full skeleton rounded-xl"
                            />
                        ))}
                    </div>
                ) : error ? (
                    <div className="py-24 text-center">
                        <p className="text-red-400 mb-4 text-sm">{error}</p>
                        <button
                            onClick={() => fetchReleases({ pageNumber: 1, append: false })}
                            className="btn-primary text-xs py-2 px-5"
                        >
                            Try Again
                        </button>
                    </div>
                ) : movies.length === 0 ? (
                    <div className="py-24 text-center rounded-2xl border border-border bg-surface p-8">
                        <span className="material-symbols-outlined text-4xl text-text-3 mb-3">
                            movie_off
                        </span>
                        <h3 className="font-serif text-lg font-semibold text-text mb-1">
                            No Releases Found
                        </h3>
                        <p className="text-xs text-text-3 max-w-sm mx-auto mb-6">
                            No films match the selected month (
                            {currentMonthObj ? currentMonthObj.name : "All Months"} {selectedYear}) and{" "}
                            {selectedLanguage ? selectedLanguage.name : "language"} criteria.
                        </p>
                        <button
                            onClick={handleResetFilters}
                            className="btn-secondary text-xs py-2 px-5"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-text-3 font-mono">
                                Showing {movies.length} releases
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                            {movies.map((movie) => {
                                const poster = getPosterUrl(movie.poster_path);
                                const releaseDate = formatReleaseDate(movie.release_date);
                                const genreText = getGenreNames(movie.genre_ids);

                                return (
                                    <div
                                        key={movie.id}
                                        onClick={() => navigate(`/movies/${movie.id}`)}
                                        className="group flex flex-col bg-surface rounded-xl overflow-hidden border border-border hover:border-accent/40 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
                                    >
                                        {/* Poster container */}
                                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-2">
                                            {poster ? (
                                                <img
                                                    src={poster}
                                                    alt={movie.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-text-3 p-3 text-center">
                                                    <span className="material-symbols-outlined text-3xl opacity-40 mb-1">
                                                        movie
                                                    </span>
                                                    <span className="text-[10px] font-medium line-clamp-2">
                                                        {movie.title}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Rating badge */}
                                            {movie.vote_average > 0 && (
                                                <div className="absolute top-2 right-2 bg-bg/80 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-border/60">
                                                    <span className="material-symbols-outlined text-[12px] text-accent">
                                                        star
                                                    </span>
                                                    <span className="text-[11px] font-bold text-text">
                                                        {Number(movie.vote_average).toFixed(1)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Language tag */}
                                            {movie.original_language && (
                                                <div className="absolute top-2 left-2 bg-bg/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-text-3 border border-border/60 uppercase">
                                                    {movie.original_language}
                                                </div>
                                            )}

                                            {/* Release Date overlay */}
                                            <div className="absolute bottom-2 left-2 bg-bg/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-accent border border-accent/20">
                                                {releaseDate}
                                            </div>

                                            {/* Hover button overlay */}
                                            <div className="absolute inset-0 bg-bg/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="w-10 h-10 rounded-full bg-accent text-bg flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        arrow_forward
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Details */}
                                        <div className="p-3 flex flex-col flex-1 justify-between">
                                            <div>
                                                <h3
                                                    className="text-xs sm:text-sm font-semibold text-text truncate group-hover:text-accent transition-colors"
                                                    title={movie.title}
                                                >
                                                    {movie.title}
                                                </h3>
                                                {genreText && (
                                                    <p className="text-[11px] text-text-3 truncate mt-0.5">
                                                        {genreText}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="mt-12 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-8 py-3 text-xs font-semibold text-text shadow-lg transition-all hover:border-accent/40 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
                                            Loading More Releases…
                                        </>
                                    ) : (
                                        <>
                                            <span>Load More Releases</span>
                                            <Icon className="text-[18px] transition-transform group-hover:translate-y-0.5">
                                                expand_more
                                            </Icon>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
