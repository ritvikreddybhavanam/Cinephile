import { useEffect, useMemo, useState } from "react";
import MovieCard from "../../../components/cards/MovieCard.jsx";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import {
    getMovies,
    searchMovies,
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
    const [searchParams] = useSearchParams();

    const language = searchParams.get("language") || "";

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

                /*
                 * Search movies
                 *
                 * Note:
                 * TMDB search does not use the language filter
                 * from /discover/movie.
                 */
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

    return (
        <div className="min-h-screen bg-[#101418] font-['Inter'] text-[#e0e3e8]">
            <Navbar />

            <section className="relative flex min-h-[260px] items-center justify-center overflow-hidden border-b border-[#262626] px-16 pb-16 pt-24 text-center max-[640px]:min-h-[220px] max-[640px]:px-5 max-[640px]:pb-12 max-[640px]:pt-[72px]">

                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{
                        backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAAlPaQqpfUyqJtfB9ZKwhbux_Kh06bu-aHHvG9_YsDRz1zpLii3e5H8Ra4OBhT0Mj4LUh-6Nj-S0pBhJrceqA5_SahR3JMwKXkh7zGlPDs9Rwyp2kWnBpEnaBj2zb35xrJHf9G7j-GCuF_5bUt3LgkLulyuMI7m8KmGWUi3ZtKzsfRN3YK_d7RVCEwJjxyVLD85zUP9tzIS4VAG9fkZ3HxyTudH6kR5d2ABcktouWHbA7mXcOCqefk")'
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(16,20,24,0.4)] to-[#101418]" />

                <div className="relative z-10 max-w-3xl">
                    <h1 className="mb-4 font-['Hanken_Grotesk'] text-5xl font-extrabold leading-[56px] tracking-[-0.02em] text-[#e0e3e8] max-[640px]:text-[32px] max-[640px]:leading-10">
                        Movies
                    </h1>

                    <p className="text-base leading-6 text-[#a0a0a0]">
                        Explore movies and discover your next favorite film.
                    </p>
                </div>
            </section>

            <main className="mx-auto w-full max-w-[1400px] px-16 pb-16 pt-8 max-[900px]:px-10 max-[640px]:px-5">

                <div className="sticky top-20 z-40 mb-8 flex items-center justify-between gap-4 rounded-lg border border-[#262626] bg-[rgba(28,32,36,0.9)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl max-[1200px]:flex-col max-[1200px]:items-stretch">

                    <div className="relative min-w-[200px] flex-1">

                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#a0a0a0]">
                            search
                        </span>

                        <input
                            type="text"
                            placeholder="Search by title, director, or actor..."
                            value={search}
                            onChange={(e) =>
                                handleSearchChange(
                                    e.target.value
                                )
                            }
                            className="box-border w-full rounded-sm border border-[#262626] bg-[#0b0f12] px-4 py-2.5 pl-10 text-base leading-6 text-[#e0e3e8] outline-none transition focus:border-[#ffb787] focus:ring-1 focus:ring-[#ffb787] placeholder:text-[#a0a0a0]"
                        />

                    </div>

                    <div className="flex flex-wrap items-center gap-3 max-[1200px]:justify-end max-[640px]:grid max-[640px]:grid-cols-2">

                        <select
                            value={genre}
                            onChange={(e) =>
                                handleGenreChange(
                                    e.target.value
                                )
                            }
                            className="min-w-[110px] cursor-pointer rounded-sm border border-[#262626] bg-[#0b0f12] px-3 py-2.5 pr-8 text-xs font-semibold tracking-[0.05em] text-[#e0e3e8] outline-none focus:border-[#ffb787] max-[640px]:w-full"
                        >
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

                        <select
                            value={year}
                            onChange={(e) =>
                                handleYearChange(
                                    e.target.value
                                )
                            }
                            className="min-w-[110px] cursor-pointer rounded-sm border border-[#262626] bg-[#0b0f12] px-3 py-2.5 pr-8 text-xs font-semibold tracking-[0.05em] text-[#e0e3e8] outline-none focus:border-[#ffb787] max-[640px]:w-full"
                        >
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

                        <select
                            value={rating}
                            onChange={(e) =>
                                handleRatingChange(
                                    e.target.value
                                )
                            }
                            className="min-w-[110px] cursor-pointer rounded-sm border border-[#262626] bg-[#0b0f12] px-3 py-2.5 pr-8 text-xs font-semibold tracking-[0.05em] text-[#e0e3e8] outline-none focus:border-[#ffb787] max-[640px]:w-full"
                        >
                            <option>All Ratings</option>
                            <option>4+ Stars</option>
                            <option>3+ Stars</option>
                            <option>2+ Stars</option>
                        </select>

                        <div className="h-6 w-px bg-[#262626] max-[640px]:hidden" />

                        <div className="flex items-center gap-2 whitespace-nowrap max-[640px]:col-span-full max-[640px]:justify-between">

                            <span className="text-xs font-semibold tracking-[0.05em] text-[#a0a0a0]">
                                Sort by:
                            </span>

                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    handleSortChange(
                                        e.target.value
                                    )
                                }
                                className="min-w-0 border-0 bg-transparent px-0 py-0 pr-5 text-xs font-semibold tracking-[0.05em] text-[#43fe6d] outline-none"
                            >
                                <option>Newest</option>
                                <option>Top Rated</option>
                                <option>Most Popular</option>
                            </select>

                        </div>

                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <p className="text-[#a0a0a0]">
                            Loading movies...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined mb-3 text-5xl text-[#a0a0a0]">
                            error
                        </span>

                        <h2 className="mb-2 font-['Hanken_Grotesk'] text-2xl font-bold text-[#e0e3e8]">
                            Unable to load movies
                        </h2>

                        <p className="text-[#a0a0a0]">
                            {error}
                        </p>
                    </div>
                ) : displayedMovies.length > 0 ? (
                    <div className="mb-8 grid grid-cols-6 gap-5 max-[1200px]:grid-cols-4 max-[900px]:grid-cols-3 max-[640px]:grid-cols-2 max-[640px]:gap-3">

                        {displayedMovies.map((movie) => (
                            <Link
                                key={movie.id}
                                to={`/movies/${movie.id}`}
                                className="block"
                            >
                                <MovieCard movie={movie} />
                            </Link>
                        ))}

                    </div>
                ) : (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                        <span className="material-symbols-outlined mb-3 text-5xl text-[#a0a0a0]">
                            movie_off
                        </span>

                        <h2 className="mb-2 font-['Hanken_Grotesk'] text-2xl font-bold text-[#e0e3e8]">
                            No movies found
                        </h2>

                        <p className="text-[#a0a0a0]">
                            Try changing your search or filters.
                        </p>

                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">

                        <button
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage(
                                    (page) => page - 1
                                )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#262626] bg-transparent p-0 text-[#a0a0a0] transition hover:border-[#ffb787] hover:text-[#e0e3e8] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-lg">
                                chevron_left
                            </span>
                        </button>

                        <span className="px-3 text-xs font-semibold text-[#a0a0a0]">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage(
                                    (page) => page + 1
                                )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#262626] bg-transparent p-0 text-[#a0a0a0] transition hover:border-[#ffb787] hover:text-[#e0e3e8] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-lg">
                                chevron_right
                            </span>
                        </button>

                    </div>
                )}

            </main>

            <Footer />
        </div>
    );
}

export default Movies;

