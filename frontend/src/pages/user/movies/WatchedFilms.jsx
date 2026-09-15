import { useEffect, useMemo, useState } from "react";

import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import MovieTile from "../../../components/movie/MovieTile.jsx";

import {
    getWatchedMovies,
    removeFromWatched
} from "../../../services/watchedMovieService.js";

function WatchedFilms() {
    const [movies, setMovies] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [ratingFilter, setRatingFilter] =
        useState("All");

    const [decadeFilter, setDecadeFilter] =
        useState("All");

    const [genreFilter, setGenreFilter] =
        useState("All");

    const [serviceFilter, setServiceFilter] =
        useState("All");

    const [sortBy, setSortBy] =
        useState("Release Date");

    const [currentPage, setCurrentPage] =
        useState(1);

    const moviesPerPage = 70;

    useEffect(() => {
        loadWatchedMovies();
    }, []);

    const loadWatchedMovies = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await getWatchedMovies();

            setMovies(data);

        } catch (error) {

            console.error(
                "Failed to load watched movies:",
                error
            );

            setError(
                "Unable to load your watched films."
            );

        } finally {

            setLoading(false);
        }
    };

    const filteredMovies = useMemo(() => {

        let result = [...movies];

        if (search.trim()) {

            const query =
                search.toLowerCase();

            result = result.filter((movie) =>
                movie.title
                    .toLowerCase()
                    .includes(query)
            );
        }

        if (ratingFilter !== "All") {

            const minimumRating =
                Number(ratingFilter);

            result = result.filter(
                (movie) =>
                    Number(movie.rating || 0) >=
                    minimumRating
            );
        }

        if (decadeFilter !== "All") {

            result = result.filter((movie) => {

                if (!movie.year) {
                    return false;
                }

                const decade =
                    Math.floor(movie.year / 10) * 10;

                return (
                    `${decade}s` === decadeFilter
                );
            });
        }

        if (genreFilter !== "All") {

            result = result.filter(
                (movie) =>
                    movie.genre === genreFilter
            );
        }

        if (serviceFilter !== "All") {

            result = result.filter(
                (movie) =>
                    movie.service === serviceFilter
            );
        }

        if (sortBy === "Release Date") {

            result.sort(
                (a, b) =>
                    (b.year || 0) -
                    (a.year || 0)
            );
        }

        if (sortBy === "Title") {

            result.sort((a, b) =>
                a.title.localeCompare(
                    b.title
                )
            );
        }

        if (sortBy === "Rating") {

            result.sort(
                (a, b) =>
                    (b.rating || 0) -
                    (a.rating || 0)
            );
        }

        return result;

    }, [
        movies,
        search,
        ratingFilter,
        decadeFilter,
        genreFilter,
        serviceFilter,
        sortBy
    ]);

    const totalPages = Math.ceil(
        filteredMovies.length /
        moviesPerPage
    );

    const startIndex =
        (currentPage - 1) *
        moviesPerPage;

    const displayedMovies =
        filteredMovies.slice(
            startIndex,
            startIndex + moviesPerPage
        );

    const resetPage = () => {
        setCurrentPage(1);
    };

    const handleRemove = async (movieId) => {

        try {

            await removeFromWatched(movieId);

            setMovies((currentMovies) =>
                currentMovies.filter(
                    (movie) =>
                        movie.movieId !== movieId
                )
            );

        } catch (error) {

            console.error(
                "Failed to remove watched movie:",
                error
            );

            setError(
                "Unable to remove movie."
            );
        }
    };

    return (
        <div className="bg-[#101418] text-[#9ab] min-h-screen flex flex-col font-sans antialiased text-[13px]">

            <Navbar />

            <main className="flex-1 max-w-[1560px] w-full mx-auto px-4 lg:px-8 py-5">

                <div className="flex flex-wrap items-center justify-between border-b border-[#212730] pb-2.5 mb-4 text-[11px]">

                    <div className="flex items-baseline space-x-2">

                        <h1 className="text-white uppercase font-bold text-sm tracking-wider">
                            Watched
                        </h1>

                        <span className="text-[#647280] font-normal text-xs">
                            {filteredMovies.length} films
                        </span>

                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        <select
                            value={ratingFilter}
                            onChange={(e) => {
                                setRatingFilter(
                                    e.target.value
                                );
                                resetPage();
                            }}
                            className="bg-transparent border-0 text-[#7f8e9d] text-[11px] uppercase focus:ring-0 cursor-pointer"
                        >
                            <option value="All">
                                Rating
                            </option>

                            <option value="9">
                                9+ Rating
                            </option>

                            <option value="8">
                                8+ Rating
                            </option>

                            <option value="7">
                                7+ Rating
                            </option>

                            <option value="6">
                                6+ Rating
                            </option>
                        </select>

                        <select
                            value={decadeFilter}
                            onChange={(e) => {
                                setDecadeFilter(
                                    e.target.value
                                );
                                resetPage();
                            }}
                            className="bg-transparent border-0 text-[#7f8e9d] text-[11px] uppercase focus:ring-0 cursor-pointer"
                        >
                            <option value="All">
                                Decade
                            </option>

                            <option value="2020s">
                                2020s
                            </option>

                            <option value="2010s">
                                2010s
                            </option>

                            <option value="2000s">
                                2000s
                            </option>

                            <option value="1990s">
                                1990s
                            </option>
                        </select>

                        <select
                            value={genreFilter}
                            onChange={(e) => {
                                setGenreFilter(
                                    e.target.value
                                );
                                resetPage();
                            }}
                            className="bg-transparent border-0 text-[#7f8e9d] text-[11px] uppercase focus:ring-0 cursor-pointer"
                        >
                            <option value="All">
                                Genre
                            </option>

                            <option value="Action">
                                Action
                            </option>

                            <option value="Drama">
                                Drama
                            </option>

                            <option value="Comedy">
                                Comedy
                            </option>

                            <option value="Thriller">
                                Thriller
                            </option>

                            <option value="Romance">
                                Romance
                            </option>

                            <option value="Sci-Fi">
                                Sci-Fi
                            </option>

                            <option value="Horror">
                                Horror
                            </option>

                            <option value="Mystery">
                                Mystery
                            </option>
                        </select>

                        <select
                            value={serviceFilter}
                            onChange={(e) => {
                                setServiceFilter(
                                    e.target.value
                                );
                                resetPage();
                            }}
                            className="bg-transparent border-0 text-[#7f8e9d] text-[11px] uppercase focus:ring-0 cursor-pointer"
                        >
                            <option value="All">
                                Service
                            </option>

                            <option value="Netflix">
                                Netflix
                            </option>

                            <option value="Prime">
                                Prime
                            </option>

                            <option value="Hotstar">
                                Hotstar
                            </option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(
                                    e.target.value
                                );
                                resetPage();
                            }}
                            className="bg-transparent border-0 text-white text-[11px] uppercase focus:ring-0 cursor-pointer"
                        >
                            <option value="Release Date">
                                Sort by Release Date
                            </option>

                            <option value="Rating">
                                Sort by Rating
                            </option>

                            <option value="Title">
                                Sort by Title
                            </option>
                        </select>

                    </div>
                </div>

                <div className="mb-4">

                    <div className="relative max-w-md">

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(
                                    e.target.value
                                );
                                resetPage();
                            }}
                            placeholder="Search watched films..."
                            className="w-full bg-[#181d22] text-xs text-white placeholder-[#5a6875] rounded-full px-3.5 py-2 pl-9 border border-[#252d37] focus:outline-none focus:border-[#00e054] focus:ring-0"
                        />

                        <svg
                            className="w-3.5 h-3.5 text-[#5a6875] absolute left-3 top-2.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                            />
                        </svg>

                    </div>

                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (

                    <div className="flex min-h-[400px] items-center justify-center">

                        <div className="flex items-center gap-3 text-[#00e054]">

                            <span className="material-symbols-outlined animate-spin">
                                progress_activity
                            </span>

                            Loading watched films...

                        </div>

                    </div>

                ) : (

                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-14 gap-[6px] pb-8">

                            {displayedMovies.map(
                                (movie) => (
                                    <MovieTile
                                        key={movie.id}
                                        movie={{
                                            id: movie.movieId,
                                            title: movie.title,
                                            year: movie.year,
                                            rating: movie.rating,
                                            poster: movie.poster
                                        }}
                                    />
                                )
                            )}

                        </div>

                        {displayedMovies.length === 0 && (
                            <div className="py-20 text-center">

                                <p className="text-[#637282] text-sm">
                                    No watched films found.
                                </p>

                            </div>
                        )}

                        {filteredMovies.length > 0 && (
                            <nav
                                aria-label="Pagination"
                                className="flex items-center justify-between border-t border-[#212730] pt-4 pb-8"
                            >

                                <div className="text-xs text-[#627181]">

                                    Showing{" "}

                                    <span className="text-white font-medium">

                                        {startIndex + 1}–
                                        {Math.min(
                                            startIndex +
                                            moviesPerPage,
                                            filteredMovies.length
                                        )}

                                    </span>{" "}

                                    of{" "}
                                    {filteredMovies.length}
                                    {" "}films

                                </div>

                                <div className="flex items-center space-x-1">

                                    <button
                                        disabled={
                                            currentPage === 1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.max(
                                                        1,
                                                        page - 1
                                                    )
                                            )
                                        }
                                        className="px-2.5 py-1 text-xs font-medium text-[#7a8c9e] hover:text-white hover:bg-[#181d24] rounded-sm transition-colors disabled:opacity-30"
                                    >
                                        ←
                                    </button>

                                    {Array.from(
                                        {
                                            length:
                                            totalPages
                                        },
                                        (_, index) =>
                                            index + 1
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                setCurrentPage(
                                                    page
                                                )
                                            }
                                            className={`px-2.5 py-1 text-xs font-semibold rounded-sm ${
                                                currentPage ===
                                                page
                                                    ? "text-[#00e054] bg-[#1a232b]"
                                                    : "text-[#7a8c9e] hover:text-white hover:bg-[#181d24]"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.min(
                                                        totalPages,
                                                        page + 1
                                                    )
                                            )
                                        }
                                        className="px-3 py-1 text-xs font-medium text-[#8fa1b3] hover:text-white hover:bg-[#181d24] rounded-sm transition-colors flex items-center gap-1 disabled:opacity-30"
                                    >
                                        Older →
                                    </button>

                                </div>

                            </nav>
                        )}
                    </>
                )}

            </main>

            <Footer />

        </div>
    );
}

export default WatchedFilms;