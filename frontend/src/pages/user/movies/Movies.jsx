import { useEffect, useMemo, useState } from "react";
import MovieCard from "../../../components/cards/MovieCard.jsx";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import {
    getMovies,
    searchMovies,
    getLanguages,
    getPosterUrl
} from "../../../services/movieService.js";
import {
    Link,
    useSearchParams
} from "react-router-dom";

const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

const DEFAULT_CINEMA_LANGUAGES = [
    { code: "", name: "All Languages" },
    { code: "en", name: "English" },
    { code: "te", name: "Telugu" },
    { code: "hi", name: "Hindi" },
    { code: "ta", name: "Tamil" },
    { code: "ml", name: "Malayalam" },
    { code: "kn", name: "Kannada" },
    { code: "ko", name: "Korean" },
    { code: "ja", name: "Japanese" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "zh", name: "Chinese" },
    { code: "cn", name: "Cantonese" },
    { code: "bn", name: "Bengali" },
    { code: "mr", name: "Marathi" },
    { code: "pa", name: "Punjabi" },
    { code: "ru", name: "Russian" },
    { code: "pt", name: "Portuguese" },
    { code: "ar", name: "Arabic" },
    { code: "tr", name: "Turkish" },
    { code: "fa", name: "Persian" },
    { code: "sv", name: "Swedish" },
    { code: "da", name: "Danish" },
    { code: "no", name: "Norwegian" },
    { code: "nl", name: "Dutch" },
    { code: "id", name: "Indonesian" },
    { code: "th", name: "Thai" },
    { code: "pl", name: "Polish" }
];

const convertMovie = (movie) => {
    const releaseYear = movie.release_date
        ? Number(movie.release_date.substring(0, 4))
        : 0;

    const genres = (movie.genre_ids || [])
        .map((id) => genreMap[id])
        .filter(Boolean);

    return {
        id: movie.id,
        title: movie.title,
        year: releaseYear,
        genres,
        genre: genres.join(", "),
        rating: Number((movie.vote_average / 2).toFixed(1)),
        reviews: movie.vote_count || 0,
        image: getPosterUrl(movie.poster_path),
        overview: movie.overview,
        popularity: movie.popularity,
        originalData: movie
    };
};

function Movies() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [language, setLanguage] = useState(searchParams.get("language") || "");
    const [availableLanguages, setAvailableLanguages] = useState(DEFAULT_CINEMA_LANGUAGES);

    const [movies, setMovies] = useState([]);

    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    const [genre, setGenre] = useState("All Genres");
    const [year, setYear] = useState("Any Year");
    const [rating, setRating] = useState("All Ratings");
    const [sortBy, setSortBy] = useState("Newest");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * Sync language state if URL parameter changes externally
     */
    useEffect(() => {
        const urlLang = searchParams.get("language") || "";
        setLanguage((prev) => (prev !== urlLang ? urlLang : prev));
    }, [searchParams]);

    /*
     * Fetch full TMDB language options to enrich dropdown
     */
    useEffect(() => {
        let isMounted = true;
        const fetchAllLanguages = async () => {
            try {
                const data = await getLanguages();
                if (Array.isArray(data) && isMounted) {
                    const knownCodes = new Set(DEFAULT_CINEMA_LANGUAGES.map((l) => l.code));
                    const extraLanguages = data
                        .filter((l) => l.iso_639_1 && !knownCodes.has(l.iso_639_1) && (l.english_name || l.name))
                        .map((l) => ({
                            code: l.iso_639_1,
                            name: l.english_name || l.name
                        }))
                        .sort((a, b) => a.name.localeCompare(b.name));
                    setAvailableLanguages([...DEFAULT_CINEMA_LANGUAGES, ...extraLanguages]);
                }
            } catch (err) {
                console.error("Failed to fetch languages list:", err);
            }
        };
        fetchAllLanguages();
        return () => {
            isMounted = false;
        };
    }, []);

    /*
     * Reset pagination when language changes.
     */
    useEffect(() => {
        setCurrentPage(1);
    }, [language]);

    /*
     * Load movies
     */
    useEffect(() => {
        const loadMovies = async () => {
            try {
                setLoading(true);
                setError("");

                let data;

                if (search.trim() !== "") {
                    data = await searchMovies(
                        search.trim(),
                        currentPage
                    );
                } else {
                    let tmdbSort = "popularity.desc";

                    if (sortBy === "Newest") {
                        tmdbSort = "primary_release_date.desc";
                    }

                    if (sortBy === "Top Rated") {
                        tmdbSort = "vote_average.desc";
                    }

                    if (sortBy === "Most Popular") {
                        tmdbSort = "popularity.desc";
                    }

                    let selectedYear = "";

                    if (
                        year !== "Any Year" &&
                        year !== "2020s" &&
                        year !== "2010s" &&
                        year !== "2000s" &&
                        year !== "1990s" &&
                        year !== "1980s" &&
                        year !== "1970s"
                    ) {
                        selectedYear = year;
                    }

                    const selectedGenre =
                        genre !== "All Genres"
                            ? Object.keys(genreMap).find(
                                (id) =>
                                    genreMap[id] === genre
                            )
                            : "";

                    const selectedRating =
                        rating !== "All Ratings"
                            ? Number(
                                rating.replace(
                                    "+ Stars",
                                    ""
                                )
                            ) * 2
                            : "";

                    data = await getMovies({
                        page: currentPage,
                        sortBy: tmdbSort,
                        year: selectedYear,
                        genre: selectedGenre,
                        rating: selectedRating,
                        language
                    });
                }

                let convertedMovies =
                    (data.results || []).map(convertMovie);

                /*
                 * Client-side decade filtering
                 */
                if (
                    search.trim() === "" &&
                    (
                        year === "2020s" ||
                        year === "2010s" ||
                        year === "2000s" ||
                        year === "1990s" ||
                        year === "1980s" ||
                        year === "1970s"
                    )
                ) {
                    const startYear = Number(
                        year.substring(0, 4)
                    );

                    const endYear = startYear + 9;

                    convertedMovies =
                        convertedMovies.filter(
                            (movie) =>
                                movie.year >= startYear &&
                                movie.year <= endYear
                        );
                }

                setMovies(convertedMovies);

                setTotalPages(
                    Math.min(
                        data.total_pages || 1,
                        500
                    )
                );
            } catch (error) {
                console.error(
                    "Failed to load movies:",
                    error
                );

                setMovies([]);
                setTotalPages(1);

                setError(
                    "Unable to load movies. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(
            () => {
                loadMovies();
            },
            search.trim() !== "" ? 500 : 0
        );

        return () => clearTimeout(timer);
    }, [
        search,
        genre,
        year,
        rating,
        sortBy,
        currentPage,
        language
    ]);

    /*
     * Sort movies on the frontend
     */
    const displayedMovies = useMemo(() => {
        return [...movies].sort((a, b) => {
            if (sortBy === "Newest") {
                return b.year - a.year;
            }

            if (sortBy === "Top Rated") {
                return b.rating - a.rating;
            }

            if (sortBy === "Most Popular") {
                return b.popularity - a.popularity;
            }

            return 0;
        });
    }, [movies, sortBy]);

    const handleSearchChange = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleLanguageChange = (value) => {
        setLanguage(value);
        setCurrentPage(1);
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set("language", value);
        } else {
            newParams.delete("language");
        }
        setSearchParams(newParams, { replace: true });
    };

    const handleGenreChange = (value) => {
        setGenre(value);
        setCurrentPage(1);
    };

    const handleYearChange = (value) => {
        setYear(value);
        setCurrentPage(1);
    };

    const handleRatingChange = (value) => {
        setRating(value);
        setCurrentPage(1);
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        setCurrentPage(1);
    };

    const getLanguageDisplayName = (code) => {
        if (!code) return "All Languages";
        const match = availableLanguages.find((l) => l.code === code);
        return match ? match.name : code.toUpperCase();
    };

    const selectClass = "w-full sm:w-auto min-w-[100px] cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 appearance-none";

    return (
        <div className="min-h-screen bg-bg text-text antialiased">
            <Navbar />

            {/* Page header */}
            <section className="relative flex min-h-[200px] items-center justify-center overflow-hidden border-b border-border px-4 pb-10 pt-14 text-center sm:min-h-[240px] sm:pb-12 sm:pt-16">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-15"
                    style={{
                        backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAAlPaQqpfUyqJtfB9ZKwhbux_Kh06bu-aHHvG9_YsDRz1zpLii3e5H8Ra4OBhT0Mj4LUh-6Nj-S0pBhJrceqA5_SahR3JMwKXkh7zGlPDs9Rwyp2kWnBpEnaBj2zb35xrJHf9G7j-GCuF_5bUt3LgkLulyuMI7m8KmGWUi3ZtKzsfRN3YK_d7RVCEwJjxyVLD85zUP9tzIS4VAG9fkZ3HxyTudH6kR5d2ABcktouWHbA7mXcOCqefk")'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-bg/40 to-bg" />
                <div className="relative z-10 max-w-3xl">
                    <p className="label-caps mb-3">Film Discovery</p>
                    <h1 className="mb-3 font-serif text-3xl font-semibold leading-tight text-text sm:text-4xl md:text-5xl">
                        Films
                    </h1>
                    <p className="text-sm sm:text-base leading-6 text-text-3">
                        Discover films, explore genres, languages, and find your next favourite.
                    </p>
                </div>
            </section>

            <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6 sm:px-6 md:px-8 lg:px-12">

                {language && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-xs text-text">
                        <div className="flex flex-wrap items-center gap-2 font-medium text-text-2">
                            <span className="material-symbols-outlined text-base text-accent">language</span>
                            <span>
                                Filtered by language: <strong className="text-accent uppercase tracking-wider">{getLanguageDisplayName(language)}</strong> ({language.toUpperCase()})
                            </span>
                            <button
                                type="button"
                                onClick={() => handleLanguageChange("")}
                                className="ml-2 inline-flex items-center gap-1 rounded bg-surface px-2 py-0.5 text-[11px] font-semibold text-text-3 hover:text-accent hover:border-accent border border-border cursor-pointer transition-colors"
                                aria-label="Clear language filter"
                            >
                                <span className="material-symbols-outlined text-xs">close</span>
                                Clear language
                            </button>
                        </div>
                        <Link
                            to={`/languages/${language}`}
                            className="inline-flex items-center gap-1.5 font-semibold text-accent hover:text-accent-hover transition-colors"
                        >
                            Open {getLanguageDisplayName(language)} Showcase & Spotlight Page
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                )}

                {/* Filter bar */}
                <div className="sticky top-14 md:top-16 z-40 mb-8 flex flex-col items-stretch gap-3 rounded-lg border border-border bg-surface/95 p-3 sm:p-4 shadow-elevated backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:gap-4">

                    {/* Search */}
                    <div className="relative min-w-0 flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-text-3">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search by title, director, or actor…"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="mc-input pl-10 rounded-lg text-sm"
                        />
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3 lg:justify-end">

                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className={selectClass}
                            aria-label="Language"
                        >
                            {availableLanguages.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>

                        <select value={genre} onChange={(e) => handleGenreChange(e.target.value)} className={selectClass} aria-label="Genre">
                            <option>All Genres</option>
                            <option>Action</option>
                            <option>Drama</option>
                            <option>Sci-Fi</option>
                            <option>Thriller</option>
                            <option>Crime</option>
                            <option>Adventure</option>
                            <option>Mystery</option>
                            <option>Western</option>
                            <option>Animation</option>
                            <option>Comedy</option>
                            <option>Fantasy</option>
                            <option>Horror</option>
                            <option>Romance</option>
                            <option>Documentary</option>
                            <option>Family</option>
                            <option>History</option>
                            <option>Music</option>
                            <option>War</option>
                        </select>

                        <select value={year} onChange={(e) => handleYearChange(e.target.value)} className={selectClass} aria-label="Year">
                            <option>Any Year</option>
                            <option>2025</option>
                            <option>2024</option>
                            <option>2023</option>
                            <option>2022</option>
                            <option>2020s</option>
                            <option>2010s</option>
                            <option>2000s</option>
                            <option>1990s</option>
                            <option>1980s</option>
                            <option>1970s</option>
                        </select>

                        <select value={rating} onChange={(e) => handleRatingChange(e.target.value)} className={selectClass} aria-label="Rating">
                            <option>All Ratings</option>
                            <option>4+ Stars</option>
                            <option>3+ Stars</option>
                            <option>2+ Stars</option>
                        </select>

                        <div className="hidden sm:block h-6 w-px bg-border" />

                        <div className="col-span-2 sm:col-span-1 flex items-center gap-2 whitespace-nowrap">
                            <span className="text-xs text-text-3">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="border-0 bg-transparent px-0 py-0 pr-4 text-xs font-semibold text-accent outline-none cursor-pointer"
                            >
                                <option className="bg-surface text-text">Newest</option>
                                <option className="bg-surface text-text">Top Rated</option>
                                <option className="bg-surface text-text">Most Popular</option>
                            </select>
                        </div>

                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="aspect-[2/3] w-full skeleton rounded-lg" />
                                <div className="h-3 w-3/4 skeleton rounded" />
                                <div className="h-2.5 w-1/2 skeleton rounded" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-text-3">error</span>
                        <h2 className="font-serif text-xl font-semibold text-text">Unable to load films</h2>
                        <p className="text-sm text-text-3">{error}</p>
                    </div>
                ) : displayedMovies.length > 0 ? (
                    <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                        {displayedMovies.map((movie) => (
                            <Link
                                key={movie.id}
                                to={`/movies/${movie.id}`}
                                className="block no-underline"
                            >
                                <MovieCard movie={movie} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-text-3">movie_off</span>
                        <h2 className="font-serif text-xl font-semibold text-text">No films found</h2>
                        <p className="text-sm text-text-3">Try adjusting your search or filters.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-3 transition hover:border-accent hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <span className="px-3 text-xs text-text-3">
                            Page <strong className="text-text-2">{currentPage}</strong> of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-3 transition hover:border-accent hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                )}

            </main>

            <Footer />
        </div>
    );
}

export default Movies;
