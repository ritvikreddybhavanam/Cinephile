import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import Icon from "../../../components/common/Icon.jsx";
import SpotlightCard from "../../../components/cards/SpotlightCard.jsx";
import TrendingMovieCard from "../../../components/cards/TrendingMovieCard.jsx";

import {
    getTrendingMovies,
    getGenres,
    getMovies,
    getLanguages,
    getMovieDetails,
    getMovieCredits,
    getMovieVideos,
    getPosterUrl,
    getBackdropUrl,
} from "../../../services/movieService.js";

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

export default function Trending() {
    const navigate = useNavigate();

    const [timeframe, setTimeframe] = useState("This Week");

    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);

    const [allLanguages, setAllLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(null);

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
                const genre = genres.find((item) => item.id === id);
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
            movieVideos.find((video) => video.site === "YouTube")
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
                : movie.backdrop_path
                ? getBackdropUrl(movie.backdrop_path)
                : null,
            poster: movie.poster_path
                ? getPosterUrl(movie.poster_path)
                : null,
            backdrop: movie.backdrop_path
                ? getBackdropUrl(movie.backdrop_path)
                : null,
            genre: getGenreNames(movie.genre_ids),
            genres: getGenreNames(movie.genre_ids),
            language: movie.original_language?.toUpperCase() || "EN",
            year: movie.release_date
                ? movie.release_date.substring(0, 4)
                : movie.first_air_date
                ? movie.first_air_date.substring(0, 4)
                : "N/A",
            rating:
                movie.vote_average != null
                    ? Number(movie.vote_average).toFixed(1)
                    : "N/A",
            voteCount: movie.vote_count || 0,
            popularity: movie.popularity || 0,
            overview: movie.overview || "No description available.",
            description: movie.overview || "No description available.",
            releaseDate: movie.release_date || movie.first_air_date || "N/A",
        };
    };

    const loadGenres = async () => {
        try {
            const data = await getGenres();
            const genreList = Array.isArray(data) ? data : data?.genres || [];
            setGenres(genreList);
        } catch (err) {
            console.error("Failed to load genres:", err);
            setGenres([]);
        }
    };

    const loadAllLanguages = async () => {
        try {
            const data = await getLanguages();
            if (Array.isArray(data)) {
                const valid = data
                    .filter((l) => l.iso_639_1 && (l.english_name || l.name))
                    .sort((a, b) =>
                        (a.english_name || a.name).localeCompare(
                            b.english_name || b.name
                        )
                    );
                setAllLanguages(valid);
            }
        } catch (err) {
            console.error("Failed to load languages:", err);
        }
    };

    const loadTrendingMovies = async (
        pageNumber = 1,
        append = false,
        lang = selectedLanguage,
        genre = selectedGenre
    ) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setError("");
            }

            let data;
            if (lang) {
                // Fetch trending/popular movies for this specific language
                data = await getMovies({
                    page: pageNumber,
                    sortBy: "popularity.desc",
                    language: lang.code,
                    genre: genre ? String(genre.id) : undefined,
                });
            } else if (genre) {
                // Filtered by genre on discover
                data = await getMovies({
                    page: pageNumber,
                    sortBy: "popularity.desc",
                    genre: String(genre.id),
                });
            } else {
                // Global trending
                data = await getTrendingMovies(pageNumber);
            }

            const movieList = Array.isArray(data) ? data : data?.results || [];

            const formattedMovies = movieList.map((movie, index) =>
                formatMovie(movie, (pageNumber - 1) * 20 + index + 1)
            );

            if (append) {
                setMovies((previous) => [...previous, ...formattedMovies]);
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
            console.error("Failed to load trending movies:", err);

            if (!append) {
                setError("Unable to load trending movies.");
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

    const loadFeaturedMovieDetails = async (movieId) => {
        if (!movieId) return;

        try {
            setDetailsLoading(true);

            const [details, credits, videos] = await Promise.all([
                getMovieDetails(movieId),
                getMovieCredits(movieId),
                getMovieVideos(movieId),
            ]);

            setMovieDetails(details);
            setMovieCredits(credits);
            setMovieVideos(videos?.results || []);
        } catch (err) {
            console.error("Failed to load movie details:", err);
            setMovieDetails(null);
            setMovieCredits(null);
            setMovieVideos([]);
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => {
        loadGenres();
        loadAllLanguages();
        loadTrendingMovies(1, false, null, null);
    }, []);

    useEffect(() => {
        if (!movies.length) {
            setFeaturedMovie(null);
            setSpotlightMovies([]);
            return;
        }

        const topThree = movies.slice(0, 3);
        const featured = topThree[0];
        const spotlight = topThree.slice(1, 3).map((movie, index) => ({
            ...movie,
            rank: index + 2,
        }));

        setFeaturedMovie({
            ...featured,
            rank: 1,
        });

        setSpotlightMovies(spotlight);
        loadFeaturedMovieDetails(featured.id);
    }, [movies]);

    const remainingMovies = useMemo(() => {
        return movies.slice(3);
    }, [movies]);

    const handleTimeframe = async (value) => {
        setTimeframe(value);

        if (value === "Today" || value === "This Week") {
            setPage(1);
            setHasMore(true);
            await loadTrendingMovies(1, false, selectedLanguage, selectedGenre);
        }
    };

    const handleLanguage = async (language) => {
        const newLang =
            selectedLanguage?.code === language?.code ? null : language;
        setSelectedLanguage(newLang);
        setPage(1);
        setHasMore(true);
        await loadTrendingMovies(1, false, newLang, selectedGenre);
    };

    const handleGenre = async (genre) => {
        const newGenre = selectedGenre?.id === genre?.id ? null : genre;
        setSelectedGenre(newGenre);
        setPage(1);
        setHasMore(true);
        await loadTrendingMovies(1, false, selectedLanguage, newGenre);
    };

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        await loadTrendingMovies(
            page + 1,
            true,
            selectedLanguage,
            selectedGenre
        );
    };

    const handleTrailer = () => {
        const trailer = getTrailer();
        if (!trailer?.key) return;

        window.open(
            `https://www.youtube.com/watch?v=${trailer.key}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const formatRuntime = (minutes) => {
        if (!minutes) return "N/A";
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (!hours) return `${remainingMinutes}m`;
        return `${hours}h ${remainingMinutes}m`;
    };

    const getAudienceScore = () => {
        if (!movieDetails?.vote_average) return "N/A";
        return `${Math.round(movieDetails.vote_average * 10)}%`;
    };

    const currentDirector = getDirector();

    return (
        <div className="flex min-h-screen flex-col bg-bg font-sans text-text antialiased">
            <Navbar />

            <main className="flex-grow pb-16 pt-8 sm:pb-20 sm:pt-10">
                <section className="mx-auto mb-8 max-w-[1200px] px-4 sm:px-6 md:px-8">
                    <div className="section-header pb-6 lg:items-end">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2">
                                <span className="badge badge-accent">
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                    Live Cinema Index
                                </span>
                            </div>

                            <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight text-text sm:text-4xl md:text-5xl">
                                Trending Cinema
                            </h1>

                            <p className="max-w-2xl text-xs sm:text-sm text-text-3 md:text-base leading-relaxed">
                                {selectedLanguage
                                    ? `The most popular and trending ${selectedLanguage.name} films today.`
                                    : "The most discussed, logged, and discovered motion pictures today."}
                            </p>
                        </div>

                        <div className="flex w-full shrink-0 items-center self-start overflow-x-auto hide-scrollbar rounded-full border border-border bg-surface p-1 lg:w-auto lg:self-auto">
                            {[
                                "Today",
                                "This Week",
                                "This Month",
                                "All Time",
                            ].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleTimeframe(item)}
                                    disabled={
                                        item === "This Month" ||
                                        item === "All Time"
                                    }
                                    className={`whitespace-nowrap rounded-full px-3.5 sm:px-5 py-1.5 text-xs transition-all ${
                                        timeframe === item
                                            ? "bg-accent font-semibold text-bg"
                                            : "font-medium text-text-3 hover:text-text"
                                    } ${
                                        item === "This Month" ||
                                        item === "All Time"
                                            ? "cursor-not-allowed opacity-30"
                                            : ""
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter controls: Language & Genre */}
                    <div className="space-y-3.5 pt-4 border-t border-border">
                        {/* Language Row */}
                        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 max-w-full">
                            <span className="mr-1 font-mono text-[11px] uppercase text-text-3 shrink-0 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[15px] text-accent">
                                    translate
                                </span>
                                Language:
                            </span>

                            <button
                                onClick={() => handleLanguage(null)}
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
                                    onClick={() => handleLanguage(item)}
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
                                            handleLanguage(null);
                                        } else {
                                            const found = allLanguages.find(
                                                (l) => l.iso_639_1 === code
                                            );
                                            handleLanguage({
                                                code,
                                                name:
                                                    found?.english_name ||
                                                    found?.name ||
                                                    code.toUpperCase(),
                                            });
                                        }
                                    }}
                                    className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-2 outline-none hover:text-text cursor-pointer focus:border-accent"
                                >
                                    <option value="">More Languages…</option>
                                    {allLanguages.map((l) => (
                                        <option
                                            key={l.iso_639_1}
                                            value={l.iso_639_1}
                                        >
                                            {l.english_name || l.name} (
                                            {l.iso_639_1.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Genre Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
                            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 max-w-full">
                                <span className="mr-1 font-mono text-[11px] uppercase text-text-3 shrink-0 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[15px] text-accent">
                                        category
                                    </span>
                                    Genre:
                                </span>

                                <button
                                    onClick={() => handleGenre(null)}
                                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 transition-colors ${
                                        selectedGenre === null
                                            ? "border-accent bg-accent/15 text-accent font-semibold"
                                            : "border-border bg-surface text-text-3 hover:text-text hover:border-border/80"
                                    }`}
                                >
                                    All Genres
                                </button>

                                {genres.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleGenre(item)}
                                        className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 transition-colors ${
                                            selectedGenre?.id === item.id
                                                ? "border-accent bg-accent/15 text-accent font-semibold"
                                                : "border-border bg-surface text-text-3 hover:text-text hover:border-border/80"
                                        }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>

                            <div className="ml-auto flex items-center gap-4">
                                {(selectedGenre || selectedLanguage) && (
                                    <button
                                        onClick={() => {
                                            setSelectedGenre(null);
                                            handleLanguage(null);
                                        }}
                                        className="text-xs text-text-3 hover:text-accent font-mono underline cursor-pointer"
                                    >
                                        Reset Filters
                                    </button>
                                )}

                                <label className="flex items-center gap-2 text-text-3">
                                    Sort:
                                    <select
                                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-accent focus:outline-none cursor-pointer"
                                        onChange={(event) => {
                                            const value = event.target.value;

                                            setMovies((previous) => {
                                                const sorted = [...previous];

                                                if (value === "Highest Rated") {
                                                    sorted.sort(
                                                        (a, b) =>
                                                            b.vote_average -
                                                            a.vote_average
                                                    );
                                                } else if (
                                                    value === "Most Voted"
                                                ) {
                                                    sorted.sort(
                                                        (a, b) =>
                                                            b.vote_count -
                                                            a.vote_count
                                                    );
                                                } else {
                                                    sorted.sort(
                                                        (a, b) =>
                                                            b.popularity -
                                                            a.popularity
                                                    );
                                                }

                                                return sorted;
                                            });
                                        }}
                                    >
                                        <option>Popularity</option>
                                        <option>Highest Rated</option>
                                        <option>Most Voted</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {loading && (
                    <section className="mx-auto flex max-w-[1200px] justify-center px-4 py-32 sm:px-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent" />
                            <p className="text-sm text-text-3">
                                {selectedLanguage
                                    ? `Loading trending ${selectedLanguage.name} films…`
                                    : "Loading trending films…"}
                            </p>
                        </div>
                    </section>
                )}

                {!loading && error && (
                    <section className="mx-auto max-w-[1200px] px-4 py-32 text-center sm:px-8">
                        <p className="mb-5 text-red-400">{error}</p>
                        <button
                            onClick={() =>
                                loadTrendingMovies(
                                    1,
                                    false,
                                    selectedLanguage,
                                    selectedGenre
                                )
                            }
                            className="btn-primary text-sm py-2.5 px-6"
                        >
                            Try Again
                        </button>
                    </section>
                )}

                {!loading && !error && featuredMovie && (
                    <section className="mx-auto mb-16 max-w-[1200px] px-4 sm:px-6 md:px-8">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="font-headline text-xl sm:text-2xl font-bold text-white">
                                    {selectedLanguage && selectedGenre
                                        ? `Top 3 Trending ${selectedLanguage.name} ${selectedGenre.name} Movies`
                                        : selectedLanguage
                                        ? `Top 3 Trending ${selectedLanguage.name} Movies`
                                        : selectedGenre
                                        ? `Top 3 ${selectedGenre.name} Movies`
                                        : "Top 3 Trending Movies"}
                                </h2>

                                <p className="mt-1 text-xs text-[#8d9ba8]">
                                    {selectedLanguage && selectedGenre
                                        ? `Currently trending ${selectedLanguage.name} ${selectedGenre.name} cinema`
                                        : selectedLanguage
                                        ? `Currently trending in ${selectedLanguage.name} cinema`
                                        : selectedGenre
                                        ? `Currently trending ${selectedGenre.name} movies`
                                        : "Currently trending worldwide"}
                                </p>
                            </div>

                            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent">
                                TOP 3
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            <div className="group relative flex min-h-[500px] sm:min-h-[580px] flex-col justify-end overflow-hidden rounded-2xl border border-border shadow-2xl lg:col-span-8 lg:min-h-[640px]">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    style={{
                                        backgroundImage: `url('${
                                            featuredMovie.backdrop ||
                                            featuredMovie.image
                                        }')`,
                                    }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />

                                <div className="absolute left-6 top-6 z-10 flex items-center gap-2">
                                    <span
                                        className="font-serif text-6xl font-bold leading-none text-transparent sm:text-7xl"
                                        style={{
                                            WebkitTextStroke:
                                                "2px rgba(201,168,106,0.4)",
                                        }}
                                    >
                                        01
                                    </span>

                                    {featuredMovie.language && (
                                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-bg/80 backdrop-blur-md text-text-3 border border-border">
                                            {featuredMovie.language}
                                        </span>
                                    )}
                                </div>

                                <div className="relative z-20 p-6 sm:p-8 md:p-10">
                                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-3 sm:gap-3">
                                        <span>{featuredMovie.year}</span>
                                        <span>•</span>
                                        <span>
                                            {formatRuntime(
                                                movieDetails?.runtime
                                            )}
                                        </span>
                                        <span>•</span>
                                        <span className="text-text">
                                            {featuredMovie.genre}
                                        </span>
                                        <span>•</span>
                                        <span className="text-accent font-medium">
                                            Dir. {currentDirector}
                                        </span>
                                    </div>

                                    <h3
                                        onClick={() =>
                                            navigate(
                                                `/movies/${featuredMovie.id}`
                                            )
                                        }
                                        className="mb-4 font-serif text-3xl font-bold leading-tight text-text hover:text-accent transition-colors cursor-pointer sm:text-4xl md:text-5xl"
                                    >
                                        {featuredMovie.title}
                                    </h3>

                                    <div className="mb-6 flex flex-wrap items-center gap-4 sm:gap-6">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[20px] text-accent">
                                                star
                                            </span>
                                            <span className="font-mono text-lg font-bold text-text">
                                                {featuredMovie.rating}
                                            </span>
                                            <span className="font-mono text-xs text-text-3">
                                                /10
                                            </span>
                                        </div>

                                        <div className="h-4 w-px bg-border" />

                                        <div>
                                            <span className="font-mono text-sm font-semibold text-text">
                                                {getAudienceScore()}
                                            </span>
                                            <span className="ml-1 font-mono text-[11px] uppercase text-text-3">
                                                Audience Score
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mb-4 line-clamp-3 text-sm font-light leading-relaxed text-text-2 sm:text-base">
                                        {movieDetails?.overview ||
                                            featuredMovie.overview}
                                    </p>

                                    {movieDetails?.tagline && (
                                        <div className="mb-6 border-l-2 border-accent pl-3 text-xs italic text-text-3">
                                            “{movieDetails.tagline}”
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={handleTrailer}
                                            disabled={
                                                detailsLoading || !getTrailer()
                                            }
                                            className="btn-primary text-sm py-3 px-6 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Icon className="text-[20px]">
                                                play_arrow
                                            </Icon>
                                            {detailsLoading
                                                ? "Loading..."
                                                : "Watch Trailer"}
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/movies/${featuredMovie.id}`
                                                )
                                            }
                                            className="btn-secondary text-sm py-3 px-5 flex items-center gap-2"
                                        >
                                            <Icon className="text-[18px]">
                                                info
                                            </Icon>
                                            Film Details
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 lg:col-span-4">
                                {spotlightMovies.map((movie) => (
                                    <SpotlightCard
                                        key={movie.id}
                                        movie={movie}
                                    />
                                ))}

                                {!detailsLoading &&
                                    spotlightMovies.length === 0 && (
                                        <div className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center">
                                            <p className="text-sm text-text-3">
                                                No additional movies found in
                                                this category.
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Remaining Trending Films Grid (#4 and onwards) */}
                {!loading && !error && remainingMovies.length > 0 && (
                    <section className="mx-auto mb-16 max-w-[1200px] px-4 sm:px-6 md:px-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-headline text-lg sm:text-xl font-bold text-white">
                                    {selectedLanguage
                                        ? `More Trending ${selectedLanguage.name} Films`
                                        : "More Trending Films"}
                                </h3>
                                <p className="mt-0.5 text-xs text-text-3">
                                    Continuing the top trending countdown
                                </p>
                            </div>
                            <span className="font-mono text-xs text-text-3">
                                #{remainingMovies[0]?.rank} – #
                                {
                                    remainingMovies[
                                        remainingMovies.length - 1
                                    ]?.rank
                                }
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {remainingMovies.map((movie) => (
                                <TrendingMovieCard
                                    key={movie.id}
                                    movie={movie}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {!loading && !error && !featuredMovie && (
                    <section className="mx-auto max-w-[1200px] px-4 py-32 text-center sm:px-8">
                        <p className="text-text-3">
                            {selectedLanguage && selectedGenre
                                ? `No trending ${selectedLanguage.name} ${selectedGenre.name} movies found.`
                                : selectedLanguage
                                ? `No trending ${selectedLanguage.name} movies found.`
                                : selectedGenre
                                ? `No trending ${selectedGenre.name} movies found.`
                                : "No trending movies found."}
                        </p>
                    </section>
                )}

                {!loading && !error && movies.length > 0 && hasMore && (
                    <section className="mx-auto max-w-[1200px] px-4 text-center sm:px-8">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-8 py-3.5 text-sm font-semibold text-text shadow-lg transition-all hover:border-accent/40 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loadingMore ? (
                                <>
                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <span>
                                        {selectedLanguage
                                            ? `Load Next 20 ${selectedLanguage.name} Films`
                                            : "Load Next 20 Trending Films"}
                                    </span>
                                    <Icon className="text-[20px] transition-transform group-hover:translate-y-0.5">
                                        expand_more
                                    </Icon>
                                </>
                            )}
                        </button>
                    </section>
                )}

                {!loading && !error && movies.length > 0 && !hasMore && (
                    <section className="mx-auto max-w-[1200px] px-4 text-center sm:px-8">
                        <p className="font-mono text-xs text-text-3">
                            No more trending movies available.
                        </p>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}