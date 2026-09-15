import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    Link,
    useParams,
    useSearchParams
} from "react-router-dom";

import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import { useNavigate } from "react-router-dom";

import ReviewSection from "../../../components/review/ReviewSection.jsx";

import MovieHero from "../../../components/movie/MovieHero.jsx";
import TrailerSection from "../../../components/movie/TrailerSection.jsx";
import WatchProviders from "../../../components/movie/WatchProviders.jsx";
import CastSection from "../../../components/movie/CastSection.jsx";
import CrewSection from "../../../components/movie/CrewSection.jsx";
import MovieInfo from "../../../components/movie/MovieInfo.jsx";
import RecommendationSection from "../../../components/movie/RecommendationSection.jsx";

import {
    getMovieDetails,
    getMovieCredits,
    getMovieVideos,
    getMovieReviews,
    getFilmBuffReviews,
    getMovieRecommendations,
    getPosterUrl,
    getBackdropUrl,
    getMovieWatchProviders,
    getLikeStatus,
    likeMovie,
    unlikeMovie,
    getMyReviews
} from "../../../services/movieService.js";

import {
    addToWatchlist,
    removeFromWatchlist,
    checkWatchlist
} from "../../../services/watchlistService.js";

import {
    addToWatched,
    removeFromWatched,
    checkWatched
} from "../../../services/watchedMovieService.js";

function MovieDetails() {
    const { movieId } = useParams();

    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");

    const [searchParams] =
        useSearchParams();

    const trailerRef = useRef(null);
    const reviewRef = useRef(null);

    const [movie, setMovie] =
        useState(null);

    const [credits, setCredits] =
        useState(null);

    const [videos, setVideos] =
        useState(null);

    const [reviews, setReviews] =
        useState(null);

    const [filmBuffReviews, setFilmBuffReviews] =
        useState([]);

    const [recommendations, setRecommendations] =
        useState([]);

    const [watchProviders, setWatchProviders] =
        useState(null);

    const [myReview, setMyReview] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [isLiked, setIsLiked] =
        useState(false);

    const [likeLoading, setLikeLoading] =
        useState(false);

    const [inWatchlist, setInWatchlist] =
        useState(false);

    const [watchlistLoading, setWatchlistLoading] =
        useState(false);

    const [isWatched, setIsWatched] =
        useState(false);

    const [watchedLoading, setWatchedLoading] =
        useState(false);

    /*
     * ------------------------------------------------
     * CHECK WATCHED STATUS
     * ------------------------------------------------
     */

    useEffect(() => {
        if (!movie?.id) {
            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            setIsWatched(false);
            return;
        }

        const checkMovieWatched = async () => {
            try {
                const result =
                    await checkWatched(movie.id);

                setIsWatched(
                    result === true
                );
            } catch (error) {
                console.error(
                    "Failed to check watched status:",
                    error
                );

                setIsWatched(false);
            }
        };

        checkMovieWatched();
    }, [movie]);

    /*
     * ------------------------------------------------
     * CHECK WATCHLIST STATUS
     * ------------------------------------------------
     */

    useEffect(() => {
        if (!movie?.id) {
            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            setInWatchlist(false);
            return;
        }

        const checkMovieWatchlist = async () => {
            try {
                const result =
                    await checkWatchlist(
                        movie.id
                    );

                setInWatchlist(
                    result === true
                );
            } catch (error) {
                console.error(
                    "Failed to check watchlist:",
                    error
                );

                setInWatchlist(false);
            }
        };

        checkMovieWatchlist();
    }, [movie]);

    /*
     * ------------------------------------------------
     * WATCHED TOGGLE
     * ------------------------------------------------
     */

    const handleWatchedToggle = async () => {
        const token =
            localStorage.getItem("token");

        if (!token) {
            alert(
                "Please login to manage your watched films."
            );
            return;
        }

        if (
            !movie?.id ||
            watchedLoading
        ) {
            return;
        }

        try {
            setWatchedLoading(true);

            if (isWatched) {
                await removeFromWatched(
                    movie.id
                );

                setIsWatched(false);

                alert(
                    "Movie removed from watched films."
                );
            } else {
                await addToWatched(movie);

                setIsWatched(true);
            }
        } catch (error) {
            console.error(
                "Failed to update watched status:",
                error
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                alert(
                    "Your login session is invalid. Please login again."
                );
            } else if (
                error.response?.status === 409
            ) {
                setIsWatched(true);

                alert(
                    "This movie is already marked as watched."
                );
            } else {
                alert(
                    isWatched
                        ? "Failed to remove movie from watched films."
                        : "Failed to mark movie as watched."
                );
            }
        } finally {
            setWatchedLoading(false);
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();

        const query = searchQuery.trim();

        if (!query) {
            return;
        }

        navigate(`/movies?search=${encodeURIComponent(query)}`);
    };

    /*
     * ------------------------------------------------
     * WATCHLIST TOGGLE
     * ------------------------------------------------
     */

    const handleWatchlistToggle = async () => {
        const token =
            localStorage.getItem("token");

        if (!token) {
            alert(
                "Please login to add movies to your watchlist."
            );
            return;
        }

        if (
            !movie?.id ||
            watchlistLoading
        ) {
            return;
        }

        try {
            setWatchlistLoading(true);

            if (inWatchlist) {
                await removeFromWatchlist(
                    movie.id
                );

                setInWatchlist(false);

                alert(
                    "Movie removed from watchlist."
                );
            } else {
                await addToWatchlist(movie);

                setInWatchlist(true);

                alert(
                    "Movie added to watchlist."
                );
            }
        } catch (error) {
            console.error(
                "Failed to update watchlist:",
                error
            );

            if (
                error.response?.status === 409
            ) {
                setInWatchlist(true);

                alert(
                    "This movie is already in your watchlist."
                );
            } else if (
                error.response?.status === 401
            ) {
                alert(
                    "Your session has expired. Please login again."
                );
            } else if (
                error.response?.status === 403
            ) {
                alert(
                    "You are not authorized. Please login again."
                );
            } else {
                alert(
                    inWatchlist
                        ? "Failed to remove movie from watchlist."
                        : "Failed to add movie to watchlist."
                );
            }
        } finally {
            setWatchlistLoading(false);
        }
    };

    /*
     * ------------------------------------------------
     * LOAD MOVIE DATA
     * ------------------------------------------------
     */

    useEffect(() => {
        const loadMovie = async () => {
            try {
                setLoading(true);
                setError("");

                const results =
                    await Promise.allSettled([
                        getMovieDetails(movieId),
                        getMovieCredits(movieId),
                        getMovieVideos(movieId),
                        getMovieReviews(movieId),
                        getFilmBuffReviews(movieId),
                        getMovieRecommendations(movieId),
                        getMovieWatchProviders(movieId),
                        getMyReviews()
                    ]);

                const [
                    movieResult,
                    creditsResult,
                    videosResult,
                    reviewsResult,
                    filmBuffReviewsResult,
                    recommendationsResult,
                    watchProvidersResult,
                    myReviewsResult
                ] = results;

                /*
                 * MOVIE
                 */

                if (
                    movieResult.status ===
                    "rejected"
                ) {
                    console.error(
                        "Failed to load movie details:",
                        movieResult.reason
                    );

                    throw movieResult.reason;
                }

                setMovie(
                    movieResult.value
                );

                /*
                 * CREDITS
                 */

                if (
                    creditsResult.status ===
                    "fulfilled"
                ) {
                    setCredits(
                        creditsResult.value
                    );
                } else {
                    console.error(
                        "Failed to load credits:",
                        creditsResult.reason
                    );

                    setCredits(null);
                }

                /*
                 * VIDEOS
                 */

                if (
                    videosResult.status ===
                    "fulfilled"
                ) {
                    setVideos(
                        videosResult.value
                    );
                } else {
                    console.error(
                        "Failed to load videos:",
                        videosResult.reason
                    );

                    setVideos(null);
                }

                /*
                 * TMDB REVIEWS
                 */

                if (
                    reviewsResult.status ===
                    "fulfilled"
                ) {
                    setReviews(
                        reviewsResult.value
                    );
                } else {
                    console.error(
                        "Failed to load TMDB reviews:",
                        reviewsResult.reason
                    );

                    setReviews(null);
                }

                /*
                 * Cinephile 🎬 REVIEWS
                 */

                if (
                    filmBuffReviewsResult.status ===
                    "fulfilled"
                ) {
                    setFilmBuffReviews(
                        Array.isArray(
                            filmBuffReviewsResult.value
                        )
                            ? filmBuffReviewsResult.value
                            : []
                    );
                } else {
                    console.error(
                        "Failed to load Cinephile 🎬 reviews:",
                        filmBuffReviewsResult.reason
                    );

                    setFilmBuffReviews([]);
                }

                /*
                 * RECOMMENDATIONS
                 */

                if (
                    recommendationsResult.status ===
                    "fulfilled"
                ) {
                    setRecommendations(
                        recommendationsResult.value
                            ?.results || []
                    );
                } else {
                    console.error(
                        "Failed to load recommendations:",
                        recommendationsResult.reason
                    );

                    setRecommendations([]);
                }

                /*
                 * WATCH PROVIDERS
                 */

                if (
                    watchProvidersResult.status ===
                    "fulfilled"
                ) {
                    setWatchProviders(
                        watchProvidersResult.value
                    );
                } else {
                    console.error(
                        "Failed to load watch providers:",
                        watchProvidersResult.reason
                    );

                    setWatchProviders(null);
                }

                /*
                 * MY REVIEWS
                 */

                if (
                    myReviewsResult.status ===
                    "fulfilled"
                ) {
                    const myReviews =
                        Array.isArray(
                            myReviewsResult.value
                        )
                            ? myReviewsResult.value
                            : [];

                    const existingReview =
                        myReviews.find(
                            (review) =>
                                Number(
                                    review.movieId
                                ) ===
                                Number(movieId)
                        );

                    setMyReview(
                        existingReview ||
                        null
                    );
                } else {
                    console.error(
                        "Failed to load my reviews:",
                        myReviewsResult.reason
                    );

                    setMyReview(null);
                }

            } catch (err) {
                console.error(
                    "Failed to load movie:",
                    err
                );

                setError(
                    "Failed to load movie details."
                );
            } finally {
                setLoading(false);
            }
        };

        if (movieId) {
            loadMovie();
        }
    }, [movieId]);

    /*
     * ------------------------------------------------
     * LIKE STATUS
     * ------------------------------------------------
     */

    useEffect(() => {
        const loadLikeStatus = async () => {
            const token =
                localStorage.getItem("token");

            if (
                !token ||
                !movieId
            ) {
                setIsLiked(false);
                return;
            }

            try {
                const response =
                    await getLikeStatus(
                        movieId
                    );

                setIsLiked(
                    response?.liked === true
                );
            } catch (err) {
                console.error(
                    "Failed to load like status:",
                    err
                );

                setIsLiked(false);
            }
        };

        loadLikeStatus();
    }, [movieId]);

    /*
     * ------------------------------------------------
     * SCROLL TO TRAILER / REVIEWS
     * ------------------------------------------------
     */

    useEffect(() => {
        const section =
            searchParams.get("section");

        if (!section) {
            return;
        }

        const scrollToSection = () => {
            if (
                section === "trailer" &&
                trailerRef.current
            ) {
                trailerRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            if (
                section === "reviews" &&
                reviewRef.current
            ) {
                reviewRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        };

        const timer =
            setTimeout(
                scrollToSection,
                500
            );

        return () => {
            clearTimeout(timer);
        };
    }, [searchParams]);

    /*
     * ------------------------------------------------
     * LIKE / UNLIKE
     * ------------------------------------------------
     */

    const handleLikeToggle = async () => {
        const token =
            localStorage.getItem("token");

        if (!token) {
            alert(
                "Please login to like movies."
            );
            return;
        }

        if (
            likeLoading ||
            !movieId
        ) {
            return;
        }

        try {
            setLikeLoading(true);

            if (isLiked) {
                await unlikeMovie(movieId);

                setIsLiked(false);
            } else {
                await likeMovie(movieId);

                setIsLiked(true);
            }
        } catch (err) {
            console.error(
                "Failed to update like status:",
                err
            );

            alert(
                isLiked
                    ? "Failed to unlike movie."
                    : "Failed to like movie."
            );
        } finally {
            setLikeLoading(false);
        }
    };

    /*
     * ------------------------------------------------
     * DIRECTORS
     * ------------------------------------------------
     */

    const directors =
        useMemo(() => {
            if (!credits?.crew) {
                return [];
            }

            return credits.crew.filter(
                (person) =>
                    person.department ===
                    "Directing" &&
                    person.job ===
                    "Director"
            );
        }, [credits]);

    /*
     * ------------------------------------------------
     * PRODUCERS
     * ------------------------------------------------
     */

    const producers =
        useMemo(() => {
            if (!credits?.crew) {
                return [];
            }

            return credits.crew.filter(
                (person) =>
                    person.department ===
                    "Production" &&
                    [
                        "Producer",
                        "Executive Producer",
                        "Co-Producer",
                        "Associate Producer"
                    ].includes(
                        person.job
                    )
            );
        }, [credits]);

    /*
     * ------------------------------------------------
     * WRITERS
     * ------------------------------------------------
     */

    const writers =
        useMemo(() => {
            if (!credits?.crew) {
                return [];
            }

            return credits.crew.filter(
                (person) =>
                    person.department ===
                    "Writing" ||
                    [
                        "Writer",
                        "Screenplay",
                        "Story",
                        "Teleplay",
                        "Characters"
                    ].includes(
                        person.job
                    )
            );
        }, [credits]);

    /*
     * ------------------------------------------------
     * CAST
     * ------------------------------------------------
     */

    const cast =
        useMemo(() => {
            if (!credits?.cast) {
                return [];
            }

            return [
                ...credits.cast
            ].sort(
                (a, b) =>
                    (a.order ?? 999) -
                    (b.order ?? 999)
            );
        }, [credits]);

    /*
     * ------------------------------------------------
     * TRAILER
     * ------------------------------------------------
     */

    const trailer =
        useMemo(() => {
            if (!videos?.results) {
                return null;
            }

            return (
                videos.results.find(
                    (video) =>
                        video.site === "YouTube" &&
                        video.type === "Trailer" &&
                        video.official
                ) ||
                videos.results.find(
                    (video) =>
                        video.site === "YouTube" &&
                        video.type === "Trailer"
                ) ||
                videos.results.find(
                    (video) =>
                        video.site === "YouTube" &&
                        video.type === "Teaser"
                ) ||
                null
            );
        }, [videos]);

    /*
     * ------------------------------------------------
     * RUNTIME
     * ------------------------------------------------
     */

    const runtime =
        useMemo(() => {
            if (!movie?.runtime) {
                return "N/A";
            }

            const hours =
                Math.floor(
                    movie.runtime / 60
                );

            const minutes =
                movie.runtime % 60;

            if (hours === 0) {
                return `${minutes}m`;
            }

            if (minutes === 0) {
                return `${hours}h`;
            }

            return `${hours}h ${minutes}m`;
        }, [movie]);

    /*
     * ------------------------------------------------
     * SCORE
     * ------------------------------------------------
     */

    const score =
        movie?.vote_average
            ? Number(
                movie.vote_average
            ).toFixed(1)
            : "N/A";

    /*
     * ------------------------------------------------
     * REVENUE
     * ------------------------------------------------
     */

    const revenue =
        movie?.revenue
            ? `$${(
                movie.revenue / 1000000
            ).toFixed(1)}M`
            : "N/A";

    /*
     * ------------------------------------------------
     * BUDGET
     * ------------------------------------------------
     */

    const budget =
        movie?.budget
            ? `$${(
                movie.budget / 1000000
            ).toFixed(1)}M`
            : "N/A";

    /*
     * ------------------------------------------------
     * LOADING
     * ------------------------------------------------
     */

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070a0d] text-white">

                <Navbar />

                <div className="min-h-[70vh] flex items-center justify-center">
                    <div className="text-[#00e054] text-lg font-bold">
                        Loading movie...
                    </div>
                </div>

                <Footer />

            </div>
        );
    }

    /*
     * ------------------------------------------------
     * ERROR
     * ------------------------------------------------
     */

    if (
        error ||
        !movie
    ) {
        return (
            <div className="min-h-screen bg-[#070a0d] text-white">

                <Navbar />

                <div className="min-h-[70vh] flex flex-col items-center justify-center">

                    <h1 className="text-2xl font-bold mb-3">
                        Movie Not Found
                    </h1>

                    <p className="text-gray-400 mb-6">
                        {error ||
                            "Unable to load this movie."}
                    </p>

                    <Link
                        to="/movies"
                        className="px-5 py-3 rounded-lg bg-[#00e054] text-[#070a0d] font-bold hover:bg-[#43fe6d] transition-colors"
                    >
                        Back to Movies
                    </Link>

                </div>

                <Footer />

            </div>
        );
    }

    /*
     * ------------------------------------------------
     * MAIN PAGE
     * ------------------------------------------------
     */

    return (
        <div className="min-h-screen bg-[#070a0d] text-white">

            <Navbar />

            <div className="bg-[#0b0f13] border-b border-[#1d252d] px-4 py-4">
                <div className="max-w-7xl mx-auto">
                    <form
                        onSubmit={handleSearch}
                        className="relative"
                    >
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            placeholder="Search movies..."
                            className="w-full bg-[#161c24] border border-[#303946] rounded-lg px-5 py-3 pl-12 text-white placeholder-gray-500 outline-none focus:border-[#00e054] transition-colors"
                        />

                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                search
            </span>

                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-md bg-[#00e054] text-[#070a0d] font-bold hover:bg-[#43fe6d] transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <main>

                <MovieHero
                    movie={movie}
                    posterUrl={
                        movie.poster_path
                            ? getPosterUrl(
                                movie.poster_path
                            )
                            : null
                    }
                    backdropUrl={
                        movie.backdrop_path
                            ? getBackdropUrl(
                                movie.backdrop_path
                            )
                            : null
                    }
                    runtime={runtime}
                    score={score}
                    myReview={myReview}
                    trailer={trailer}
                    isLiked={isLiked}
                    likeLoading={likeLoading}
                    inWatchlist={inWatchlist}
                    watchlistLoading={
                        watchlistLoading
                    }
                    isWatched={isWatched}
                    watchedLoading={
                        watchedLoading
                    }
                    onWatchTrailer={() => {
                        trailerRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }}
                    onReview={() => {
                        reviewRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }}
                    onLikeToggle={
                        handleLikeToggle
                    }
                    onWatchlistToggle={
                        handleWatchlistToggle
                    }
                    onWatchedToggle={
                        handleWatchedToggle
                    }
                />

                <TrailerSection
                    trailer={trailer}
                    movieTitle={movie.title}
                    sectionRef={trailerRef}
                />

                <WatchProviders
                    watchProviders={
                        watchProviders
                    }
                />

                <CastSection
                    cast={cast}
                />

                <CrewSection
                    directors={directors}
                    producers={producers}
                    writers={writers}
                />

                <MovieInfo
                    movie={movie}
                    runtime={runtime}
                    budget={budget}
                    revenue={revenue}
                />

                <ReviewSection
                    sectionRef={reviewRef}
                    tmdbReviews={
                        reviews?.results || []
                    }
                    appReviews={
                        filmBuffReviews
                    }
                />

                <RecommendationSection
                    recommendations={
                        recommendations
                    }
                />

            </main>

            <Footer />

        </div>
    );
}

export default MovieDetails;