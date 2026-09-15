import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import MovieCard from "../../../components/cards/MovieCard.jsx";
import { Link } from "react-router-dom";
import {
    getMovies,
    getPosterUrl,
    getGenres,
} from "../../../services/movieService.js";

export default function Genres() {
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);

    const [activeSort, setActiveSort] = useState("Featured");
    const [activeGenre, setActiveGenre] = useState(null);

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [genresLoading, setGenresLoading] = useState(true);

    const [error, setError] = useState("");
    const [hasMore, setHasMore] = useState(true);

    const getSortValue = (sort) => {
        if (sort === "Popular") {
            return "popularity.desc";
        }

        if (sort === "Newest") {
            return "primary_release_date.desc";
        }

        if (sort === "Top Rated") {
            return "vote_average.desc";
        }

        return "popularity.desc";
    };

    const formatMovies = (movieList) => {
        return movieList.map((movie) => ({
            id: movie.id,
            title: movie.title || movie.name || "Untitled",

            genre:
                movie.genre ||
                movie.genres?.map((genre) => genre.name).join(" / ") ||
                "Unknown",

            year:
                movie.year ||
                movie.release_date?.substring(0, 4) ||
                movie.first_air_date?.substring(0, 4) ||
                "N/A",

            rating:
                movie.rating ??
                movie.vote_average ??
                "N/A",

            image:
                movie.image ||
                getPosterUrl(movie.poster_path),
        }));
    };

    const loadMovies = async (
        sort = activeSort,
        genre = activeGenre?.id || "",
        pageNumber = 1,
        append = false
    ) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setError("");
            }

            const data = await getMovies({
                page: pageNumber,
                sortBy: getSortValue(sort),
                genre,
            });

            const movieList = Array.isArray(data)
                ? data
                : data?.results || [];

            const formattedMovies = formatMovies(movieList);

            if (append) {
                setMovies((previousMovies) => [
                    ...previousMovies,
                    ...formattedMovies,
                ]);
            } else {
                setMovies(formattedMovies);
            }

            setPage(pageNumber);

            if (data?.total_pages) {
                setHasMore(pageNumber < data.total_pages);
            } else {
                setHasMore(formattedMovies.length > 0);
            }
        } catch (err) {
            console.error("Failed to load movies:", err);

            if (!append) {
                setError("Unable to load movies.");
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

    const loadGenres = async () => {
        try {
            setGenresLoading(true);

            const data = await getGenres();

            const genreList = Array.isArray(data)
                ? data
                : data?.genres || [];

            setGenres(genreList);
        } catch (err) {
            console.error("Failed to load genres:", err);
            setGenres([]);
        } finally {
            setGenresLoading(false);
        }
    };

    useEffect(() => {
        loadGenres();
        loadMovies("Featured", "", 1, false);
    }, []);

    const handleSort = (sort) => {
        setActiveSort(sort);
        setPage(1);
        setHasMore(true);

        loadMovies(
            sort,
            activeGenre ? activeGenre.id : "",
            1,
            false
        );
    };

    const handleGenre = (genre) => {
        setActiveGenre(genre);
        setPage(1);
        setHasMore(true);

        loadMovies(
            activeSort,
            genre ? genre.id : "",
            1,
            false
        );
    };

    const handleLoadMore = () => {
        if (loadingMore || !hasMore) {
            return;
        }

        loadMovies(
            activeSort,
            activeGenre ? activeGenre.id : "",
            page + 1,
            true
        );
    };

    const handleRetry = () => {
        setPage(1);
        setHasMore(true);

        loadMovies(
            activeSort,
            activeGenre ? activeGenre.id : "",
            1,
            false
        );
    };

    return (
        <div className="min-h-screen bg-[#0b0f13] text-gray-200 font-sans antialiased selection:bg-[#00e054] selection:text-black">
            <Navbar />

            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white">
                                Explore Movies
                            </h1>

                            <p className="text-sm text-gray-400 mt-1">
                                Discover movies by genre
                            </p>
                        </div>

                        <span className="text-xs text-[#00e054] font-semibold">
                            {genres.length} Genres
                        </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
                        <button
                            onClick={() => handleGenre(null)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                                activeGenre === null
                                    ? "bg-[#00e054] text-[#070a0d] font-bold shadow-[0_0_25px_-5px_rgba(0,224,84,0.35)]"
                                    : "bg-[#10151c] hover:bg-[#161c24] text-gray-300 border border-[#212936]"
                            }`}
                        >
                            All Genres
                        </button>

                        {genresLoading ? (
                            <span className="px-4 py-2 text-gray-500">
                                Loading genres...
                            </span>
                        ) : (
                            genres.map((genre) => (
                                <button
                                    key={genre.id}
                                    onClick={() => handleGenre(genre)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                                        activeGenre?.id === genre.id
                                            ? "bg-[#00e054] text-[#070a0d] font-bold shadow-[0_0_25px_-5px_rgba(0,224,84,0.35)]"
                                            : "bg-[#10151c] hover:bg-[#161c24] text-gray-300 border border-[#212936]"
                                    }`}
                                >
                                    {genre.name}
                                </button>
                            ))
                        )}
                    </div>
                </section>

                <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white">
                            {activeGenre
                                ? `${activeGenre.name} Movies`
                                : "All Movies"}
                        </h2>

                        <p className="text-xs text-gray-400 mt-1">
                            Movies loaded from TMDB through your backend
                        </p>
                    </div>

                    <div className="flex items-center bg-[#161c24] p-1 rounded-xl border border-[#212936] text-xs font-semibold">
                        {[
                            "Featured",
                            "Popular",
                            "Newest",
                            "Top Rated",
                        ].map((sort) => (
                            <button
                                key={sort}
                                onClick={() => handleSort(sort)}
                                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                                    activeSort === sort
                                        ? "bg-[#00e054] text-[#070a0d] font-bold shadow-sm"
                                        : "text-gray-400 hover:text-white"
                                } ${
                                    sort === "Top Rated"
                                        ? "hidden sm:inline-block"
                                        : ""
                                }`}
                            >
                                {sort}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">

                    {loading && (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-[#212936] border-t-[#00e054] rounded-full animate-spin" />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-center py-20">
                            <p className="text-red-400 font-semibold">
                                {error}
                            </p>

                            <button
                                onClick={handleRetry}
                                className="mt-4 px-5 py-2 bg-[#00e054] text-[#070a0d] font-bold rounded-lg"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        movies.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-gray-400">
                                    No movies found.
                                </p>
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        movies.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 sm:gap-5">
                                {movies.map((movie) => (
                                    <Link
                                        key={`${movie.id}-${movie.title}`}
                                        to={`/movies/${movie.id}`}
                                        className="block"
                                    >
                                        <MovieCard movie={movie} />
                                    </Link>
                                ))}
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        movies.length > 0 &&
                        hasMore && (
                            <div className="flex justify-center pt-6 pb-4">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-8 py-3 bg-[#161c24] hover:bg-[#212936] text-gray-200 hover:text-white font-semibold rounded-xl border border-[#212936] transition-all flex items-center gap-3 text-sm shadow-md hover:border-[#00e054]/60 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loadingMore ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-gray-500 border-t-[#00e054] rounded-full animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-[#00e054]">
                                                ↓
                                            </span>
                                            Load More
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        movies.length > 0 &&
                        !hasMore && (
                            <div className="text-center pt-6 pb-4">
                                <p className="text-xs text-gray-500">
                                    No more movies to load
                                </p>
                            </div>
                        )}
                </section>
            </main>

            <Footer />
        </div>
    );
}