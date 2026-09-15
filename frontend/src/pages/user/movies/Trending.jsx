import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import Icon from "../../../components/common/Icon.jsx";
import SpotlightCard from "../../../components/cards/SpotlightCard.jsx";

import {
    getTrendingMovies,
    getGenres,
    getMovieDetails,
    getMovieCredits,
    getMovieVideos,
    getPosterUrl,
    getBackdropUrl,
} from "../../../services/movieService.js";

export default function Trending() {
    const [timeframe, setTimeframe] = useState("This Week");

    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);

    const [movies, setMovies] = useState([]);
    const [featuredMovie, setFeaturedMovie] = useState(null);
    const [spotlightMovies, setSpotlightMovies] = useState([]);

    const [movieDetails, setMovieDetails] = useState(null);
    const [movieCredits, setMovieCredits] = useState(null);
    const [movieVideos, setMovieVideos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [error, setError] = useState("");

    const getGenreNames = (genreIds = []) => {
        if (!genreIds.length || !genres.length) {
            return "Unknown";
        }

        return genreIds
            .map((id) => {
                const genre = genres.find(
                    (item) => item.id === id
                );

                return genre?.name;
            })
            .filter(Boolean)
            .join(" / ");
    };

    const getDirector = () => {
        if (!movieCredits?.crew) {
            return "Unknown";
        }

        const director = movieCredits.crew.find(
            (person) => person.job === "Director"
        );

        return director?.name || "Unknown";
    };

    const getTrailer = () => {
        if (!movieVideos.length) {
            return null;
        }

        return (
            movieVideos.find(
                (video) =>
                    video.site === "YouTube" &&
                    video.type === "Trailer" &&
                    video.official
            ) ||
            movieVideos.find(
                (video) =>
                    video.site === "YouTube" &&
                    video.type === "Trailer"
            ) ||
            movieVideos.find(
                (video) =>
                    video.site === "YouTube"
            )
        );
    };

    const formatMovie = (movie, rank) => {
        return {
            ...movie,

            rank,

            title:
                movie.title ||
                movie.original_title ||
                movie.name ||
                "Untitled",

            image: movie.poster_path
                ? getPosterUrl(movie.poster_path)
                : null,

            poster: movie.poster_path
                ? getPosterUrl(movie.poster_path)
                : null,

            backdrop: movie.backdrop_path
                ? getBackdropUrl(movie.backdrop_path)
                : null,

            genre: getGenreNames(movie.genre_ids),

            genres: getGenreNames(movie.genre_ids),

            year: movie.release_date
                ? movie.release_date.substring(0, 4)
                : "N/A",

            rating:
                movie.vote_average != null
                    ? Number(movie.vote_average).toFixed(1)
                    : "N/A",

            voteCount: movie.vote_count || 0,

            popularity: movie.popularity || 0,

            overview:
                movie.overview ||
                "No description available.",

            releaseDate:
                movie.release_date || "N/A",
        };
    };

    const loadGenres = async () => {
        try {
            const data = await getGenres();

            const genreList = Array.isArray(data)
                ? data
                : data?.genres || [];

            setGenres(genreList);
        } catch (error) {
            console.error(
                "Failed to load genres:",
                error
            );

            setGenres([]);
        }
    };

    const loadTrendingMovies = async (
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

            const data = await getTrendingMovies(
                pageNumber
            );

            const movieList = Array.isArray(data)
                ? data
                : data?.results || [];

            const formattedMovies = movieList.map(
                (movie, index) =>
                    formatMovie(
                        movie,
                        (pageNumber - 1) * 20 +
                        index +
                        1
                    )
            );

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
                setHasMore(
                    pageNumber < data.total_pages
                );
            } else {
                setHasMore(
                    formattedMovies.length > 0
                );
            }
        } catch (error) {
            console.error(
                "Failed to load trending movies:",
                error
            );

            if (!append) {
                setError(
                    "Unable to load trending movies."
                );

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

    const loadFeaturedMovieDetails = async (
        movieId
    ) => {
        if (!movieId) {
            return;
        }

        try {
            setDetailsLoading(true);

            const [
                details,
                credits,
                videos,
            ] = await Promise.all([
                getMovieDetails(movieId),
                getMovieCredits(movieId),
                getMovieVideos(movieId),
            ]);

            setMovieDetails(details);
            setMovieCredits(credits);
            setMovieVideos(
                videos?.results || []
            );
        } catch (error) {
            console.error(
                "Failed to load movie details:",
                error
            );

            setMovieDetails(null);
            setMovieCredits(null);
            setMovieVideos([]);
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => {
        loadGenres();
        loadTrendingMovies(1, false);
    }, []);

    useEffect(() => {
        if (!movies.length) {
            setFeaturedMovie(null);
            setSpotlightMovies([]);
            return;
        }

        let filteredMovies = movies;

        if (selectedGenre) {
            filteredMovies = movies.filter(
                (movie) =>
                    movie.genre_ids?.includes(
                        selectedGenre.id
                    )
            );
        }

        if (!filteredMovies.length) {
            setFeaturedMovie(null);
            setSpotlightMovies([]);
            return;
        }

        const topThree = filteredMovies.slice(0, 3);

        const featured = topThree[0];

        const spotlight = topThree
            .slice(1, 3)
            .map((movie, index) => ({
                ...movie,
                rank: index + 2,
            }));

        setFeaturedMovie({
            ...featured,
            rank: 1,
        });

        setSpotlightMovies(spotlight);

        loadFeaturedMovieDetails(featured.id);
    }, [movies, selectedGenre]);

    const handleTimeframe = async (value) => {
        setTimeframe(value);

        if (
            value === "Today" ||
            value === "This Week"
        ) {
            setPage(1);
            setHasMore(true);

            await loadTrendingMovies(1, false);
        }
    };

    const handleGenre = (genre) => {
        if (selectedGenre?.id === genre.id) {
            setSelectedGenre(null);
            return;
        }

        setSelectedGenre(genre);
    };

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) {
            return;
        }

        await loadTrendingMovies(
            page + 1,
            true
        );
    };

    const handleTrailer = () => {
        const trailer = getTrailer();

        if (!trailer?.key) {
            return;
        }

        window.open(
            `https://www.youtube.com/watch?v=${trailer.key}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const formatRuntime = (minutes) => {
        if (!minutes) {
            return "N/A";
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (!hours) {
            return `${remainingMinutes}m`;
        }

        return `${hours}h ${remainingMinutes}m`;
    };

    const getAudienceScore = () => {
        if (!movieDetails?.vote_average) {
            return "N/A";
        }

        return `${Math.round(
            movieDetails.vote_average * 10
        )}%`;
    };

    const currentDirector = getDirector();

    return (
        <div className="flex min-h-screen flex-col bg-[#0b0f12] font-sans text-gray-100 selection:bg-primary selection:text-[#00390f]">
            <Navbar />

            <main className="flex-grow pb-20 pt-28">

                <section className="mx-auto mb-8 max-w-[1440px] px-4 sm:px-8">
                    <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end">

                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-medium text-primary">
                                <span className="h-2 w-2 animate-ping rounded-full bg-primary" />

                                LIVE TRENDING DATA
                            </div>

                            <h1 className="mb-2 font-headline text-4xl font-black tracking-tight text-white sm:text-5xl">
                                Trending Movies
                            </h1>

                            <p className="max-w-2xl text-sm font-light text-[#8d9ba8] sm:text-base">
                                Discover the top trending movies
                                worldwide using live TMDB data.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center self-start rounded-xl border border-white/10 bg-[#181c20] p-1 lg:self-auto">
                            {[
                                "Today",
                                "This Week",
                                "This Month",
                                "All Time",
                            ].map((item) => (
                                <button
                                    key={item}
                                    onClick={() =>
                                        handleTimeframe(
                                            item
                                        )
                                    }
                                    disabled={
                                        item === "This Month" ||
                                        item === "All Time"
                                    }
                                    className={`rounded-lg px-4 py-2 text-xs transition-all ${
                                        timeframe === item
                                            ? "bg-primary font-bold text-[#00390f] shadow-[0_0_15px_rgba(0,224,84,0.4)]"
                                            : "font-semibold text-[#8d9ba8] hover:text-white"
                                    } ${
                                        item ===
                                        "This Month" ||
                                        item ===
                                        "All Time"
                                            ? "cursor-not-allowed opacity-40"
                                            : ""
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs font-medium">

                        <div className="flex items-center gap-2 overflow-x-auto pb-1">

                            <span className="mr-1 font-mono text-[11px] uppercase text-[#8d9ba8]">
                                Genres:
                            </span>

                            <button
                                onClick={() =>
                                    setSelectedGenre(null)
                                }
                                className={`whitespace-nowrap rounded-full border px-3 py-1.5 transition-colors ${
                                    selectedGenre === null
                                        ? "border-white/20 bg-white/10 text-white"
                                        : "border-white/10 bg-[#181c20] text-[#8d9ba8] hover:text-white"
                                }`}
                            >
                                All Genres
                            </button>

                            {genres.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() =>
                                        handleGenre(item)
                                    }
                                    className={`whitespace-nowrap rounded-full border px-3 py-1.5 transition-colors ${
                                        selectedGenre?.id ===
                                        item.id
                                            ? "border-white/20 bg-white/10 text-white"
                                            : "border-white/10 bg-[#181c20] text-[#8d9ba8] hover:text-white"
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        <div className="ml-auto flex items-center gap-4">

                            <label className="flex items-center gap-2 text-[#8d9ba8]">
                                Platform:

                                <select
                                    disabled
                                    className="rounded-lg border border-white/10 bg-[#181c20] px-3 py-1.5 text-xs text-white opacity-70 focus:border-primary focus:outline-none"
                                >
                                    <option>
                                        All Platforms
                                    </option>
                                </select>
                            </label>

                            <label className="flex items-center gap-2 text-[#8d9ba8]">
                                Sort:

                                <select
                                    className="rounded-lg border border-white/10 bg-[#181c20] px-3 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
                                    onChange={(event) => {
                                        const value =
                                            event.target
                                                .value;

                                        setMovies(
                                            (
                                                previous
                                            ) => {
                                                const sorted =
                                                    [
                                                        ...previous,
                                                    ];

                                                if (
                                                    value ===
                                                    "Highest Rated"
                                                ) {
                                                    sorted.sort(
                                                        (
                                                            a,
                                                            b
                                                        ) =>
                                                            b.vote_average -
                                                            a.vote_average
                                                    );
                                                } else if (
                                                    value ===
                                                    "Most Voted"
                                                ) {
                                                    sorted.sort(
                                                        (
                                                            a,
                                                            b
                                                        ) =>
                                                            b.vote_count -
                                                            a.vote_count
                                                    );
                                                } else {
                                                    sorted.sort(
                                                        (
                                                            a,
                                                            b
                                                        ) =>
                                                            b.popularity -
                                                            a.popularity
                                                    );
                                                }

                                                return sorted;
                                            }
                                        );
                                    }}
                                >
                                    <option>
                                        Popularity
                                    </option>

                                    <option>
                                        Highest Rated
                                    </option>

                                    <option>
                                        Most Voted
                                    </option>
                                </select>
                            </label>
                        </div>
                    </div>
                </section>

                {loading && (
                    <section className="mx-auto flex max-w-[1440px] justify-center px-4 py-32 sm:px-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-primary" />

                            <p className="text-sm text-[#8d9ba8]">
                                Loading trending movies...
                            </p>
                        </div>
                    </section>
                )}

                {!loading && error && (
                    <section className="mx-auto max-w-[1440px] px-4 py-32 text-center sm:px-8">
                        <p className="mb-5 text-red-400">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                loadTrendingMovies(
                                    1,
                                    false
                                )
                            }
                            className="rounded-xl bg-primary px-6 py-3 font-bold text-[#00390f]"
                        >
                            Try Again
                        </button>
                    </section>
                )}

                {!loading &&
                    !error &&
                    featuredMovie && (
                        <section className="mx-auto mb-16 max-w-[1440px] px-4 sm:px-8">

                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="font-headline text-2xl font-bold text-white">
                                        {selectedGenre
                                            ? `Top 3 ${selectedGenre.name} Movies`
                                            : "Top 3 Trending Movies"}
                                    </h2>

                                    <p className="mt-1 text-xs text-[#8d9ba8]">
                                        {selectedGenre
                                            ? `Currently trending ${selectedGenre.name} movies`
                                            : "Currently trending worldwide"}
                                    </p>
                                </div>

                                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary">
                                    TOP 3
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                                <div className="group relative flex min-h-[580px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 shadow-2xl lg:col-span-8 lg:min-h-[640px]">

                                    {featuredMovie.backdrop && (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                            style={{
                                                backgroundImage: `url("${featuredMovie.backdrop}")`,
                                            }}
                                        />
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-[#080a0d]/75 to-transparent" />

                                    <div className="absolute inset-0 bg-gradient-to-r from-[#080a0d]/90 via-transparent to-transparent" />

                                    <div className="absolute left-6 top-6 z-10 select-none">
                                        <span className="font-headline text-8xl font-black leading-none text-transparent [-webkit-text-stroke:2px_rgba(0,224,84,0.45)] lg:text-[130px]">
                                            01
                                        </span>
                                    </div>

                                    <div className="absolute right-6 top-6 z-20">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-black/60 px-3.5 py-1.5 font-mono text-xs font-semibold text-white shadow-[0_0_25px_-4px_rgba(0,224,84,0.5)] backdrop-blur-md">
                                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />

                                            #1 TRENDING
                                        </div>
                                    </div>

                                    <div className="relative z-20 max-w-3xl p-6 sm:p-10">

                                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs sm:gap-3">

                                            <span className="rounded-md bg-primary px-2.5 py-1 font-bold text-[#00390f]">
                                                #1
                                            </span>

                                            {featuredMovie.genre &&
                                                featuredMovie.genre !==
                                                "Unknown" && (
                                                    <span className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-white backdrop-blur">
                                                        {
                                                            featuredMovie.genre
                                                        }
                                                    </span>
                                                )}

                                            <span className="font-mono text-[#8d9ba8]">
                                                •{" "}
                                                {
                                                    featuredMovie.year
                                                }{" "}
                                                •{" "}
                                                {formatRuntime(
                                                    movieDetails?.runtime
                                                )}{" "}
                                                •{" "}
                                                {
                                                    currentDirector
                                                }
                                            </span>
                                        </div>

                                        <h2 className="mb-3 font-headline text-3xl font-black tracking-tight text-white transition-colors group-hover:text-primary sm:text-5xl">
                                            {
                                                featuredMovie.title
                                            }
                                        </h2>

                                        <div className="mb-4 flex w-fit flex-wrap items-center gap-5 border-y border-white/10 py-2">

                                            <div className="flex items-center gap-2">
                                                <Icon className="text-[20px] text-[#ffc107]">
                                                    star
                                                </Icon>

                                                <span className="font-headline text-lg font-bold text-white">
                                                    {
                                                        featuredMovie.rating
                                                    }

                                                    <span className="text-xs font-normal text-[#8d9ba8]">
                                                        /10
                                                    </span>
                                                </span>

                                                <span className="font-mono text-[11px] uppercase text-[#8d9ba8]">
                                                    TMDB Score
                                                </span>
                                            </div>

                                            <div className="h-4 w-px bg-white/20" />

                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-bold text-primary">
                                                    {
                                                        getAudienceScore()
                                                    }
                                                </span>

                                                <span className="font-mono text-[11px] uppercase text-[#8d9ba8]">
                                                    Audience Score
                                                </span>
                                            </div>
                                        </div>

                                        <p className="mb-4 line-clamp-3 text-sm font-light leading-relaxed text-gray-300 sm:text-base">
                                            {movieDetails?.overview ||
                                                featuredMovie.overview}
                                        </p>

                                        {movieDetails?.tagline && (
                                            <div className="mb-6 border-l-2 border-primary pl-3 text-xs italic text-[#8d9ba8]">
                                                “
                                                {
                                                    movieDetails.tagline
                                                }
                                                ”
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center gap-3">

                                            <button
                                                onClick={
                                                    handleTrailer
                                                }
                                                disabled={
                                                    detailsLoading ||
                                                    !getTrailer()
                                                }
                                                className="flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3 font-headline font-bold text-[#00390f] shadow-[0_0_20px_rgba(0,224,84,0.35)] transition-all hover:bg-[#43fe6d] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Icon className="text-[20px]">
                                                    play_arrow
                                                </Icon>

                                                {detailsLoading
                                                    ? "Loading..."
                                                    : "Watch Trailer"}
                                            </button>

                                            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#2c333a]/80 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-[#22272d]">
                                                <Icon className="text-[20px]">
                                                    add
                                                </Icon>

                                                Watchlist
                                            </button>

                                            <button className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#101418]/60 px-4 py-3 text-sm text-[#8d9ba8] backdrop-blur hover:bg-[#22272d] hover:text-white">
                                                <Icon className="text-[18px]">
                                                    rate_review
                                                </Icon>

                                                Quick Review
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6 lg:col-span-4">

                                    {spotlightMovies.map(
                                        (movie) => (
                                            <SpotlightCard
                                                key={
                                                    movie.id
                                                }
                                                movie={
                                                    movie
                                                }
                                            />
                                        )
                                    )}

                                    {!detailsLoading &&
                                        spotlightMovies.length ===
                                        0 &&
                                        (
                                            <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-[#181c20] p-8 text-center">
                                                <p className="text-sm text-[#8d9ba8]">
                                                    No additional movies found for this genre.
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </section>
                    )}

                {!loading &&
                    !error &&
                    !featuredMovie && (
                        <section className="mx-auto max-w-[1440px] px-4 py-32 text-center sm:px-8">
                            <p className="text-[#8d9ba8]">
                                {selectedGenre
                                    ? `No trending ${selectedGenre.name} movies found.`
                                    : "No trending movies found."}
                            </p>
                        </section>
                    )}

                {!loading &&
                    !error &&
                    movies.length > 0 &&
                    hasMore && (
                        <section className="mx-auto max-w-[1440px] px-4 text-center sm:px-8">

                            <button
                                onClick={
                                    handleLoadMore
                                }
                                disabled={
                                    loadingMore
                                }
                                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#181c20] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:border-primary/40 hover:bg-[#22272d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <>
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-primary" />

                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Load Next 20 Trending Films
                                        </span>

                                        <Icon className="text-[20px] transition-transform group-hover:translate-y-0.5">
                                            expand_more
                                        </Icon>
                                    </>
                                )}
                            </button>
                        </section>
                    )}

                {!loading &&
                    !error &&
                    movies.length > 0 &&
                    !hasMore && (
                        <section className="mx-auto max-w-[1440px] px-4 text-center sm:px-8">
                            <p className="font-mono text-xs text-[#8d9ba8]">
                                No more trending movies available.
                            </p>
                        </section>
                    )}
            </main>

            <Footer />
        </div>
    );
}