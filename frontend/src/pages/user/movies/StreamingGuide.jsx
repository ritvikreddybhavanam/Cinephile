import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import PlatformSelector, { REGIONS, REGIONAL_FALLBACK_PROVIDERS } from "../../../components/streaming/PlatformSelector";
import StreamingMovieCard from "../../../components/streaming/StreamingMovieCard";
import StreamingProviderModal from "../../../components/streaming/StreamingProviderModal";
import { AuthContext } from "../../../context/AuthContext";
import {
    getMovies,
    searchMovies,
    getMovieGenres,
    getLanguages
} from "../../../services/movieService";
import {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist
} from "../../../services/watchlistService";

const GENRES_LIST = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" }
];

const POPULAR_LANGUAGES = [
    { code: "", name: "All Languages" },
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "te", name: "Telugu" },
    { code: "ta", name: "Tamil" },
    { code: "ml", name: "Malayalam" },
    { code: "kn", name: "Kannada" },
    { code: "ko", name: "Korean" },
    { code: "ja", name: "Japanese" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "zh", name: "Chinese" },
    { code: "bn", name: "Bengali" },
    { code: "mr", name: "Marathi" }
];

const SORT_OPTIONS = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "primary_release_date.desc", label: "Newest Releases" },
    { value: "vote_count.desc", label: "Most Voted" }
];

const RATING_OPTIONS = [
    { value: "", label: "Any Rating" },
    { value: "6", label: "6.0+ Rating" },
    { value: "7", label: "7.0+ Rating" },
    { value: "8", label: "8.0+ Acclaimed" }
];

const YEAR_OPTIONS = [
    { value: "", label: "All Years" },
    { value: "2026", label: "2026" },
    { value: "2025", label: "2025" },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2020", label: "2020s" },
    { value: "2010", label: "2010s" },
    { value: "2000", label: "2000s" }
];

export default function StreamingGuide() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Filter States
    const [selectedRegion, setSelectedRegion] = useState(() => searchParams.get("region") || "IN");
    const [selectedProviderIds, setSelectedProviderIds] = useState(() => {
        const provParam = searchParams.get("providers");
        if (provParam) {
            return provParam.split(",").map(Number).filter(Boolean);
        }
        return [8]; // Default to Netflix (8)
    });
    const [matchingMode, setMatchingMode] = useState(() => searchParams.get("mode") || "any");
    const [selectedGenreIds, setSelectedGenreIds] = useState(() => {
        const gParam = searchParams.get("genres");
        return gParam ? gParam.split(",").map(Number).filter(Boolean) : [];
    });
    const [selectedLanguage, setSelectedLanguage] = useState(() => searchParams.get("lang") || "");
    const [minRating, setMinRating] = useState(() => searchParams.get("rating") || "");
    const [selectedYear, setSelectedYear] = useState(() => searchParams.get("year") || "");
    const [sortBy, setSortBy] = useState(() => searchParams.get("sort") || "popularity.desc");
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
    const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("q") || "");
    const [currentPage, setCurrentPage] = useState(1);

    // 2. UI State
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [movies, setMovies] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. Watchlist State
    const [watchlistIds, setWatchlistIds] = useState(new Set());
    const [guestModalOpen, setGuestModalOpen] = useState(false);

    // 4. Provider Modal State
    const [activeModalMovie, setActiveModalMovie] = useState(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
            setCurrentPage(1);
        }, 320);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Synchronize URL search params
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedRegion && selectedRegion !== "IN") params.set("region", selectedRegion);
        if (selectedProviderIds.length > 0) params.set("providers", selectedProviderIds.join(","));
        if (matchingMode !== "any") params.set("mode", matchingMode);
        if (selectedGenreIds.length > 0) params.set("genres", selectedGenreIds.join(","));
        if (selectedLanguage) params.set("lang", selectedLanguage);
        if (minRating) params.set("rating", minRating);
        if (selectedYear) params.set("year", selectedYear);
        if (sortBy !== "popularity.desc") params.set("sort", sortBy);
        if (debouncedSearch) params.set("q", debouncedSearch);

        setSearchParams(params, { replace: true });
    }, [
        selectedRegion,
        selectedProviderIds,
        matchingMode,
        selectedGenreIds,
        selectedLanguage,
        minRating,
        selectedYear,
        sortBy,
        debouncedSearch,
        setSearchParams
    ]);

    // Fetch user watchlist when authenticated
    useEffect(() => {
        if (!token) {
            setWatchlistIds(new Set());
            return;
        }

        getWatchlist()
            .then((data) => {
                const list = Array.isArray(data) ? data : data?.results || [];
                const ids = new Set(list.map((m) => Number(m.movieId || m.id)));
                setWatchlistIds(ids);
            })
            .catch((err) => {
                console.error("Watchlist fetch failed:", err);
            });
    }, [token]);

    // Main Movie Fetching Engine
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        const fetchDiscoveryOrSearch = async () => {
            try {
                if (debouncedSearch) {
                    // Search Flow: search by title
                    const searchRes = await searchMovies(debouncedSearch, currentPage);
                    let list = searchRes?.results || [];

                    // Apply active genre filter if any
                    if (selectedGenreIds.length > 0) {
                        list = list.filter((m) =>
                            m.genre_ids?.some((gId) => selectedGenreIds.includes(gId))
                        );
                    }

                    // Apply original language filter if any
                    if (selectedLanguage) {
                        list = list.filter((m) => m.original_language === selectedLanguage);
                    }

                    // Apply minimum rating
                    if (minRating) {
                        list = list.filter((m) => Number(m.vote_average || 0) >= Number(minRating));
                    }

                    // Apply year
                    if (selectedYear) {
                        list = list.filter((m) => m.release_date?.startsWith(selectedYear));
                    }

                    if (isMounted) {
                        setMovies(list);
                        setTotalResults(list.length);
                        setTotalPages(searchRes?.total_pages || 1);
                    }
                } else {
                    // Discover Flow: with watch providers, region, genres, language, rating, sort
                    const separator = matchingMode === "all" ? "," : "|";
                    const withWatchProviders = selectedProviderIds.length > 0
                        ? selectedProviderIds.join(separator)
                        : "";

                    const genreParam = selectedGenreIds.length > 0
                        ? selectedGenreIds.join("|")
                        : "";

                    const res = await getMovies({
                        page: currentPage,
                        sortBy,
                        withWatchProviders,
                        watchRegion: selectedRegion,
                        genre: genreParam,
                        language: selectedLanguage,
                        rating: minRating,
                        year: selectedYear
                    });

                    if (isMounted) {
                        const results = res?.results || [];
                        setMovies(results);
                        setTotalResults(res?.total_results || 0);
                        setTotalPages(Math.min(res?.total_pages || 1, 500));
                    }
                }
            } catch (err) {
                console.error("Failed to load streaming movies:", err);
                if (isMounted) {
                    setError("Failed to load streaming catalog. Please check your network connection and retry.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDiscoveryOrSearch();

        return () => { isMounted = false; };
    }, [
        debouncedSearch,
        selectedProviderIds,
        matchingMode,
        selectedRegion,
        selectedGenreIds,
        selectedLanguage,
        minRating,
        selectedYear,
        sortBy,
        currentPage
    ]);

    // Platform Selection Handlers
    const handleToggleProvider = (providerId) => {
        setCurrentPage(1);
        setSelectedProviderIds((prev) =>
            prev.includes(providerId)
                ? prev.filter((id) => id !== providerId)
                : [...prev, providerId]
        );
    };

    const handleSelectAllProviders = (allIds) => {
        setCurrentPage(1);
        setSelectedProviderIds(allIds);
    };

    const handleClearProviders = () => {
        setCurrentPage(1);
        setSelectedProviderIds([]);
    };

    // Genre Selection Handlers
    const handleToggleGenre = (genreId) => {
        setCurrentPage(1);
        setSelectedGenreIds((prev) =>
            prev.includes(genreId)
                ? prev.filter((id) => id !== genreId)
                : [...prev, genreId]
        );
    };

    const handleClearGenres = () => {
        setCurrentPage(1);
        setSelectedGenreIds([]);
    };

    // Reset All Filters
    const handleResetAllFilters = () => {
        setSelectedProviderIds([8]);
        setMatchingMode("any");
        setSelectedGenreIds([]);
        setSelectedLanguage("");
        setMinRating("");
        setSelectedYear("");
        setSortBy("popularity.desc");
        setSearchQuery("");
        setDebouncedSearch("");
        setCurrentPage(1);
    };

    // Watchlist Toggle
    const handleToggleWatchlist = async (movie) => {
        if (!token) {
            setGuestModalOpen(true);
            return;
        }

        const isCurrentlySaved = watchlistIds.has(Number(movie.id));
        try {
            if (isCurrentlySaved) {
                await removeFromWatchlist(movie.id);
                setWatchlistIds((prev) => {
                    const next = new Set(prev);
                    next.delete(Number(movie.id));
                    return next;
                });
            } else {
                await addToWatchlist(movie);
                setWatchlistIds((prev) => new Set(prev).add(Number(movie.id)));
            }
        } catch (err) {
            console.error("Watchlist toggle failed:", err);
        }
    };

    // Map matched provider logos for cards
    const currentRegionProviders = REGIONAL_FALLBACK_PROVIDERS[selectedRegion] || REGIONAL_FALLBACK_PROVIDERS.IN;
    const providerMap = useMemo(() => {
        return new Map(currentRegionProviders.map((p) => [p.provider_id, p]));
    }, [currentRegionProviders]);

    const activeProviderNames = selectedProviderIds
        .map((id) => providerMap.get(id)?.provider_name)
        .filter(Boolean);

    return (
        <div className="min-h-screen bg-bg text-text flex flex-col font-sans selection:bg-accent selection:text-bg">
            <Navbar />

            <main className="flex-1 w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* 1. Page Header */}
                <header className="relative flex flex-col items-center text-center max-w-3xl mx-auto pt-4 pb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
                        <span className="material-symbols-outlined text-[16px]">live_tv</span>
                        <span>Streaming Discovery Guide</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-text leading-tight">
                        Find Your Next Film
                    </h1>

                    <p className="mt-3 text-sm sm:text-base text-text-2 leading-relaxed">
                        Explore movies across your favorite streaming platforms, filtered by the genres and languages you love.
                    </p>

                    {/* Prominent Search Bar */}
                    <div className="relative w-full max-w-xl mt-6">
                        <div className="relative flex items-center w-full rounded-2xl border border-border bg-surface px-4 py-3 shadow-elevated focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                            <span className="material-symbols-outlined text-accent text-[22px] mr-3 shrink-0">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by film title within selected platforms..."
                                aria-label="Search movies by title"
                                className="w-full bg-transparent text-sm text-text placeholder:text-text-3 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search input"
                                    className="p-1 rounded-full text-text-3 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* 2. Choose Your Streaming Platforms */}
                <PlatformSelector
                    selectedRegion={selectedRegion}
                    onRegionChange={(reg) => {
                        setSelectedRegion(reg);
                        setCurrentPage(1);
                    }}
                    selectedProviderIds={selectedProviderIds}
                    onToggleProvider={handleToggleProvider}
                    onSelectAllProviders={handleSelectAllProviders}
                    onClearProviders={handleClearProviders}
                    matchingMode={matchingMode}
                    onMatchingModeChange={(mode) => {
                        setMatchingMode(mode);
                        setCurrentPage(1);
                    }}
                />

                {/* 3. Genres Filter */}
                <section aria-label="Genres" className="rounded-2xl bg-surface border border-border p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent text-[18px]">category</span>
                            <h2 className="text-sm sm:text-base font-serif font-bold text-text">Genres</h2>
                            {selectedGenreIds.length > 0 && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                                    {selectedGenreIds.length} selected
                                </span>
                            )}
                        </div>
                        {selectedGenreIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearGenres}
                                className="text-xs font-semibold text-text-3 hover:text-accent transition-colors cursor-pointer"
                            >
                                Clear Genres
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleClearGenres}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                selectedGenreIds.length === 0
                                    ? "bg-accent text-bg shadow-sm"
                                    : "bg-surface-2/60 border border-border text-text-2 hover:border-accent/40 hover:text-text"
                            }`}
                        >
                            Any Genre
                        </button>
                        {GENRES_LIST.map((genre) => {
                            const isSelected = selectedGenreIds.includes(genre.id);
                            return (
                                <button
                                    key={genre.id}
                                    type="button"
                                    onClick={() => handleToggleGenre(genre.id)}
                                    aria-pressed={isSelected}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-accent text-bg shadow-sm"
                                            : "bg-surface-2/60 border border-border text-text-2 hover:border-accent/40 hover:text-text"
                                    }`}
                                >
                                    {genre.name}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 4. Language & Advanced Controls Bar */}
                <section aria-label="Filters and Sorting" className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-border">
                    {/* Left: Original Language Dropdown */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent text-[18px]">translate</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-text">
                                Original Language:
                            </span>
                        </div>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => {
                                setSelectedLanguage(e.target.value);
                                setCurrentPage(1);
                            }}
                            aria-label="Filter by original language"
                            className="bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-text focus:border-accent focus:outline-none cursor-pointer"
                        >
                            {POPULAR_LANGUAGES.map((lang) => (
                                <option key={lang.code} value={lang.code} className="bg-surface text-text">
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Right: Sort and Expand Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Sort Selector */}
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent text-[18px]">sort</span>
                            <span className="text-xs text-text-3 font-medium">Sort By:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                                aria-label="Sort movies"
                                className="bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-text focus:border-accent focus:outline-none cursor-pointer"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-surface text-text">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Toggle Advanced Filters Button */}
                        <button
                            type="button"
                            onClick={() => setShowAdvancedFilters((prev) => !prev)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 border border-border hover:border-accent/40 text-text-2 hover:text-accent text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[16px]">tune</span>
                            <span>{showAdvancedFilters ? "Hide Filters" : "More Filters"}</span>
                        </button>
                    </div>
                </section>

                {/* Expandable Advanced Filters Panel */}
                {showAdvancedFilters && (
                    <div className="p-5 rounded-2xl bg-surface-2/70 border border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
                        {/* Minimum Rating */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-3 mb-2">
                                Minimum Rating
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {RATING_OPTIONS.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => {
                                            setMinRating(r.value);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            minRating === r.value
                                                ? "bg-accent text-bg shadow-sm"
                                                : "bg-surface border border-border text-text-2 hover:border-accent/40"
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Release Year */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-3 mb-2">
                                Release Year / Era
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text focus:border-accent focus:outline-none cursor-pointer"
                            >
                                {YEAR_OPTIONS.map((y) => (
                                    <option key={y.value} value={y.value}>
                                        {y.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Reset All Filters Action */}
                        <div className="flex flex-col justify-end">
                            <button
                                type="button"
                                onClick={handleResetAllFilters}
                                className="w-full py-2 px-4 rounded-xl border border-border hover:border-rose-500/40 bg-surface hover:bg-rose-500/10 text-text-2 hover:text-rose-400 font-semibold text-xs transition-colors cursor-pointer"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* 5. Active Filters Chips Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Active Filter Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-text-3 font-medium">Active:</span>

                        {/* Providers Chips */}
                        {selectedProviderIds.map((pId) => {
                            const prov = providerMap.get(pId);
                            if (!prov) return null;
                            return (
                                <span
                                    key={pId}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold"
                                >
                                    <span>{prov.provider_name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleProvider(pId)}
                                        aria-label={`Remove ${prov.provider_name} filter`}
                                        className="hover:text-white transition-colors cursor-pointer"
                                    >
                                        ×
                                    </button>
                                </span>
                            );
                        })}

                        {/* Genres Chips */}
                        {selectedGenreIds.map((gId) => {
                            const genre = GENRES_LIST.find((g) => g.id === gId);
                            if (!genre) return null;
                            return (
                                <span
                                    key={gId}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text text-xs font-semibold"
                                >
                                    <span>{genre.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleGenre(gId)}
                                        aria-label={`Remove ${genre.name} filter`}
                                        className="text-text-3 hover:text-accent transition-colors cursor-pointer"
                                    >
                                        ×
                                    </button>
                                </span>
                            );
                        })}

                        {/* Language Chip */}
                        {selectedLanguage && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text text-xs font-semibold">
                                <span>Lang: {POPULAR_LANGUAGES.find((l) => l.code === selectedLanguage)?.name || selectedLanguage}</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedLanguage("")}
                                    aria-label="Remove language filter"
                                    className="text-text-3 hover:text-accent transition-colors cursor-pointer"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {/* Rating Chip */}
                        {minRating && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text text-xs font-semibold">
                                <span>Rating: {minRating}.0+</span>
                                <button
                                    type="button"
                                    onClick={() => setMinRating("")}
                                    aria-label="Remove rating filter"
                                    className="text-text-3 hover:text-accent transition-colors cursor-pointer"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {/* Search Query Chip */}
                        {debouncedSearch && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text text-xs font-semibold">
                                <span>Search: "{debouncedSearch}"</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setDebouncedSearch("");
                                    }}
                                    aria-label="Clear search query"
                                    className="text-text-3 hover:text-accent transition-colors cursor-pointer"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>

                    {/* Result Counter */}
                    <div className="text-xs text-text-3 font-medium">
                        {loading ? (
                            <span>Finding movies...</span>
                        ) : (
                            <span>
                                Showing <strong className="text-text font-mono">{totalResults.toLocaleString()}</strong> titles
                            </span>
                        )}
                    </div>
                </div>

                {/* 6. Movies Results Grid */}
                <section aria-label="Streaming Movies Grid" className="min-h-[400px]">
                    {loading ? (
                        <div className="movie-grid-fluid gap-4 sm:gap-5">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-2 rounded-2xl p-2 bg-surface/50 border border-border/40">
                                    <div className="aspect-[2/3] w-full skeleton rounded-xl" />
                                    <div className="h-4 w-3/4 skeleton rounded mt-2" />
                                    <div className="h-3 w-1/2 skeleton rounded" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="rounded-3xl border border-rose-500/30 bg-surface p-12 text-center max-w-lg mx-auto">
                            <span className="material-symbols-outlined text-rose-400 text-4xl mb-3">
                                error
                            </span>
                            <h3 className="text-lg font-serif font-bold text-text mb-2">
                                Unable to Load Streaming Titles
                            </h3>
                            <p className="text-xs text-text-2 mb-6 leading-relaxed">
                                {error}
                            </p>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => p)}
                                className="btn-primary px-6 py-2.5 text-xs font-bold rounded-xl"
                            >
                                Retry Discovery
                            </button>
                        </div>
                    ) : movies.length === 0 ? (
                        <div className="rounded-3xl border border-border bg-surface p-12 sm:p-16 text-center max-w-lg mx-auto shadow-sm">
                            <span className="material-symbols-outlined text-text-3 text-5xl mb-3 opacity-40">
                                movie_filter
                            </span>
                            <h3 className="text-xl font-serif font-bold text-text mb-2">
                                No Movies Match Your Filters
                            </h3>
                            <p className="text-xs text-text-2 mb-6 leading-relaxed">
                                No verified titles found for the selected platforms ({activeProviderNames.join(", ") || "None"}),
                                genres, or language. Try broadening your criteria.
                            </p>
                            <button
                                type="button"
                                onClick={handleResetAllFilters}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg font-bold text-xs hover:bg-accent-hover transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                                <span>Reset All Filters</span>
                            </button>
                        </div>
                    ) : (
                        <div className="movie-grid-fluid gap-4 sm:gap-5">
                            {movies.map((movie) => {
                                const matched = selectedProviderIds
                                    .map((id) => providerMap.get(id))
                                    .filter(Boolean);

                                return (
                                    <StreamingMovieCard
                                        key={movie.id}
                                        movie={movie}
                                        matchedProviders={matched}
                                        isWatchlisted={watchlistIds.has(Number(movie.id))}
                                        onToggleWatchlist={handleToggleWatchlist}
                                        onOpenProviders={(m) => setActiveModalMovie(m)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* 7. Pagination Controls */}
                {!loading && movies.length > 0 && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-12 border-t border-border">
                        <span className="text-xs text-text-3 font-medium">
                            Page <strong className="text-text font-mono">{currentPage}</strong> of{" "}
                            <strong className="text-text font-mono">{totalPages}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => {
                                    setCurrentPage((p) => Math.max(1, p - 1));
                                    window.scrollTo({ top: 300, behavior: "smooth" });
                                }}
                                className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-text hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => {
                                    setCurrentPage((p) => p + 1);
                                    window.scrollTo({ top: 300, behavior: "smooth" });
                                }}
                                className="px-5 py-2 rounded-xl bg-accent text-bg text-xs font-bold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-md"
                            >
                                Next Page
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />

            {/* Provider Modal */}
            {activeModalMovie && (
                <StreamingProviderModal
                    movie={activeModalMovie}
                    watchRegion={selectedRegion}
                    onClose={() => setActiveModalMovie(null)}
                />
            )}

            {/* Guest Watchlist Prompt Modal */}
            {guestModalOpen && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
                    onClick={() => setGuestModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="guest-modal-title"
                >
                    <div
                        className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6 text-center shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/30">
                            <span className="material-symbols-outlined text-[28px]">bookmark_add</span>
                        </div>

                        <h3 id="guest-modal-title" className="text-lg font-serif font-bold text-text">
                            Save to Your Watchlist
                        </h3>

                        <p className="text-xs text-text-2 leading-relaxed">
                            Sign in or create a free Cinephile account to save movies across Netflix, Prime, Disney+ and track your streaming journey.
                        </p>

                        <div className="flex flex-col gap-2 pt-2">
                            <Link
                                to="/login"
                                className="btn-primary w-full py-2.5 text-xs font-bold rounded-xl text-center no-underline"
                            >
                                Sign In
                            </Link>
                            <button
                                type="button"
                                onClick={() => setGuestModalOpen(false)}
                                className="text-xs text-text-3 hover:text-text py-1 transition-colors cursor-pointer"
                            >
                                Keep Browsing as Guest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
