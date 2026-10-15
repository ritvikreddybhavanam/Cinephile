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
        <div className="min-h-screen bg-bg text-text font-sans antialiased">
            <Navbar />

            <main className="page-container py-8 sm:py-10 space-y-8">

                <section className="space-y-4">
                    <div className="section-header">
                        <div>
                            <p className="label-caps mb-1">Catalog Index</p>
                            <h1 className="section-title text-fluid-title">
                                Film Genres
                            </h1>
                            <p className="text-xs sm:text-sm text-text-3 mt-1">
                                Discover motion pictures by artistic category
                            </p>
                        </div>

                        <span className="badge badge-accent">
                            {genres.length} Genres
                        </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 text-xs max-w-full">
                        <button
                            onClick={() => handleGenre(null)}
                            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full transition-all text-xs font-semibold ${
                                activeGenre === null
                                    ? "bg-accent text-white shadow-md shadow-accent/25"
                                    : "bg-surface hover:bg-surface-2 text-text-2 border border-border"
                            }`}
                        >
                            All Genres
                        </button>

                        {genresLoading ? (
                            <span className="px-4 py-2 text-text-3 text-xs">
                                Loading genres…
                            </span>
                        ) : (
                            genres.map((genre) => (
                                <button
                                    key={genre.id}
                                    onClick={() => handleGenre(genre)}
                                    className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full transition-all text-xs font-semibold ${
                                        activeGenre?.id === genre.id
                                            ? "bg-accent text-white shadow-md shadow-accent/25"
                                            : "bg-surface hover:bg-surface-2 text-text-2 border border-border"
                                    }`}
                                >
                                    {genre.name}
                                </button>
                            ))
                        )}
                    </div>
                </section>

                <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-text">
                            {activeGenre
                                ? `${activeGenre.name} Cinema`
                                : "All Curated Cinema"}
                        </h2>
                    </div>

                    <div className="flex items-center bg-surface p-1 rounded-full border border-border text-xs overflow-x-auto max-w-full">
                        {[
                            "Featured",
                            "Popular",
                            "Newest",
                            "Top Rated",
                        ].map((sort) => (
                            <button
                                key={sort}
                                onClick={() => handleSort(sort)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full transition-all font-semibold ${
                                    activeSort === sort
                                        ? "bg-accent text-bg"
                                        : "text-text-3 hover:text-text"
                                }`}
                            >
                                {sort}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">

                    {loading && (
                        <div className="movie-grid-fluid">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="aspect-[2/3] w-full skeleton rounded-lg" />
                                    <div className="h-3 w-3/4 skeleton rounded" />
                                    <div className="h-2.5 w-1/2 skeleton rounded" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-center py-20">
                            <p className="text-error font-semibold mb-4">
                                {error}
                            </p>
                            <button
                                onClick={handleRetry}
                                className="btn-primary text-xs py-2 px-6"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && movies.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-text-3 text-sm">
                                No films discovered in this category.
                            </p>
                        </div>
                    )}

                    {!loading && !error && movies.length > 0 && (
                        <div className="movie-grid-fluid">
                            {movies.map((movie) => (
                                <Link
                                    key={`${movie.id}-${movie.title}`}
                                    to={`/movies/${movie.id}`}
                                    className="block no-underline"
                                >
                                    <MovieCard movie={movie} />
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && !error && movies.length > 0 && hasMore && (
                        <div className="flex justify-center pt-6 pb-4">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="btn-secondary text-xs py-2.5 px-8"
                            >
                                {loadingMore ? "Loading More…" : "Load More Films ↓"}
                            </button>
                        </div>
                    )}

                    {!loading && !error && movies.length > 0 && !hasMore && (
                        <div className="text-center pt-6 pb-4">
                            <p className="text-xs text-text-3">
                                You have viewed all films in this category.
                            </p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}