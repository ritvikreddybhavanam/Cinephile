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
import AddToListModal from "../../../components/movie/AddToListModal.jsx";
import MovieDecisionLayer from "../../../components/movie/MovieDecisionLayer.jsx";
import MovieVideosSection from "../../../components/movie/MovieVideosSection.jsx";
import MoviePhotos from "../../../components/movie/MoviePhotos.jsx";
import MovieCollection from "../../../components/movie/MovieCollection.jsx";
import WatchProviders from "../../../components/movie/WatchProviders.jsx";
import CastSection from "../../../components/movie/CastSection.jsx";
import CrewSection from "../../../components/movie/CrewSection.jsx";
import MovieInfo from "../../../components/movie/MovieInfo.jsx";
import MovieKeywords from "../../../components/movie/MovieKeywords.jsx";
import RecommendationSection from "../../../components/movie/RecommendationSection.jsx";
import ContentGuideSection from "../../../components/movie/ContentGuideSection.jsx";

import {
    getMovieDetails,
    getMovieCredits,
    getMovieVideos,
    getMovieReviews,
    getFilmBuffReviews,
    getMovieRecommendations,
    getSimilarMovies,
    getMovieImages,
    getMovieKeywords,
    getMovieReleaseDates,
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
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";

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

    useDocumentTitle(movie ? movie.title : "Movie Details");

    const [credits, setCredits] =
        useState(null);

    const [videos, setVideos] =
        useState(null);

    const [images, setImages] =
        useState(null);

    const [keywords, setKeywords] =
        useState([]);

    const [similar, setSimilar] =
        useState([]);

    const [releaseDates, setReleaseDates] =
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

    const [showAddToList, setShowAddToList] =
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
                        getSimilarMovies(movieId),
                        getMovieImages(movieId),
                        getMovieKeywords(movieId),
                        getMovieReleaseDates(movieId),
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
                    similarResult,
                    imagesResult,
                    keywordsResult,
                    releaseDatesResult,
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
                    creditsResult.status === "fulfilled" &&
                    (creditsResult.value?.cast?.length > 0 || creditsResult.value?.crew?.length > 0)
                ) {
                    setCredits(creditsResult.value);
                } else if (
                    movieResult.status === "fulfilled" &&
                    movieResult.value?.credits &&
                    (movieResult.value.credits?.cast?.length > 0 || movieResult.value.credits?.crew?.length > 0)
                ) {
                    setCredits(movieResult.value.credits);
                } else if (creditsResult.status === "fulfilled") {
                    setCredits(creditsResult.value);
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
                } else if (movieResult.status === "fulfilled" && movieResult.value?.videos) {
                    setVideos(movieResult.value.videos);
                } else {
                    console.error(
                        "Failed to load videos:",
                        videosResult.reason
                    );

                    setVideos(null);
                }

                /*
                 * IMAGES / PHOTOS
                 */

                if (
                    imagesResult.status === "fulfilled" &&
                    (imagesResult.value?.backdrops?.length || imagesResult.value?.posters?.length || imagesResult.value?.logos?.length)
                ) {
                    setImages(imagesResult.value);
                } else if (movieResult.status === "fulfilled" && movieResult.value?.images) {
                    setImages(movieResult.value.images);
                } else if (imagesResult.status === "fulfilled") {
                    setImages(imagesResult.value);
                } else {
                    setImages(null);
                }

                /*
                 * KEYWORDS
                 */

                if (
                    keywordsResult.status === "fulfilled" &&
                    keywordsResult.value?.keywords
                ) {
                    setKeywords(keywordsResult.value.keywords);
                } else if (movieResult.status === "fulfilled" && movieResult.value?.keywords?.keywords) {
                    setKeywords(movieResult.value.keywords.keywords);
                } else {
                    setKeywords([]);
                }

                /*
                 * SIMILAR MOVIES
                 */

                if (
                    similarResult.status === "fulfilled" &&
                    similarResult.value?.results
                ) {
                    setSimilar(similarResult.value.results);
                } else if (movieResult.status === "fulfilled" && movieResult.value?.similar?.results) {
                    setSimilar(movieResult.value.similar.results);
                } else {
                    setSimilar([]);
                }

                /*
                 * RELEASE DATES / CERTIFICATION
                 */

                if (releaseDatesResult.status === "fulfilled") {
                    setReleaseDates(releaseDatesResult.value);
                } else if (movieResult.status === "fulfilled" && movieResult.value?.release_dates) {
                    setReleaseDates(movieResult.value.release_dates);
                } else {
                    setReleaseDates(null);
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
                 * Cinephile REVIEWS
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
                        "Failed to load Cinephile reviews:",
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
     * EFFECTIVE CREDITS (State fallback to movie.credits)
     * ------------------------------------------------
     */

    const effectiveCredits = useMemo(() => {
        if (credits?.cast?.length || credits?.crew?.length) {
            return credits;
        }
        if (movie?.credits?.cast?.length || movie?.credits?.crew?.length) {
            return movie.credits;
        }
        return credits || movie?.credits || null;
    }, [credits, movie]);

    /*
     * ------------------------------------------------
     * DIRECTORS
     * ------------------------------------------------
     */

    const directors =
        useMemo(() => {
            const crewList = effectiveCredits?.crew || [];
            if (!crewList.length) {
                return [];
            }

            return crewList.filter(
                (person) =>
                    person.department ===
                    "Directing" &&
                    person.job ===
                    "Director"
            );
        }, [effectiveCredits]);

    /*
     * ------------------------------------------------
     * PRODUCERS
     * ------------------------------------------------
     */

    const producers =
        useMemo(() => {
            const crewList = effectiveCredits?.crew || [];
            if (!crewList.length) {
                return [];
            }

            return crewList.filter(
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
        }, [effectiveCredits]);

    /*
     * ------------------------------------------------
     * WRITERS
     * ------------------------------------------------
     */

    const writers =
        useMemo(() => {
            const crewList = effectiveCredits?.crew || [];
            if (!crewList.length) {
                return [];
            }

            return crewList.filter(
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
        }, [effectiveCredits]);

    /*
     * ------------------------------------------------
     * CREW
     * ------------------------------------------------
     */

    const crew =
        useMemo(() => {
            const crewList = effectiveCredits?.crew || [];
            if (!crewList.length) {
                return [];
            }

            const getJobPriority = (job = "", department = "") => {
                const j = job.toLowerCase();
                const d = department.toLowerCase();

                if (j === "director") return 1;
                if (
                    ["screenplay", "writer", "story", "written by", "teleplay", "characters"].includes(j) ||
                    d === "writing"
                ) {
                    return 2;
                }
                if (j === "producer") return 3;
                if (j.includes("producer") || d === "production") return 4;
                if (
                    ["director of photography", "cinematography", "cinematographer"].includes(j) ||
                    d === "camera"
                ) {
                    return 5;
                }
                if (
                    ["original music composer", "composer", "music", "original score"].includes(j) ||
                    d === "sound"
                ) {
                    return 6;
                }
                if (["editor", "film editor"].includes(j) || d === "editing") return 7;
                if (["production design", "production designer", "art direction"].includes(j) || d === "art") return 8;
                if (["costume design", "costume designer"].includes(j) || d === "costume & make-up") return 9;
                return 20;
            };

            const personMap = new Map();

            crewList.forEach((person) => {
                if (!person || !person.id) return;
                const priority = getJobPriority(person.job, person.department);

                if (!personMap.has(person.id)) {
                    personMap.set(person.id, {
                        ...person,
                        jobs: person.job ? [person.job] : [],
                        priority,
                        popularity: person.popularity || 0,
                    });
                } else {
                    const existing = personMap.get(person.id);
                    if (person.job && !existing.jobs.includes(person.job)) {
                        existing.jobs.push(person.job);
                    }
                    if (priority < existing.priority) {
                        existing.priority = priority;
                    }
                    if (!existing.profile_path && person.profile_path) {
                        existing.profile_path = person.profile_path;
                    }
                }
            });

            return Array.from(personMap.values())
                .map((person) => ({
                    ...person,
                    job: person.jobs.slice(0, 2).join(", ") || person.job || person.department || "Crew"
                }))
                .sort((a, b) => {
                    if (a.priority !== b.priority) {
                        return a.priority - b.priority;
                    }
                    return (b.popularity || 0) - (a.popularity || 0);
                });
        }, [effectiveCredits]);

    /*
     * ------------------------------------------------
     * CAST
     * ------------------------------------------------
     */

    const cast =
        useMemo(() => {
            const rawCast = effectiveCredits?.cast || [];
            if (!Array.isArray(rawCast) || !rawCast.length) {
                return [];
            }

            return [
                ...rawCast
            ].sort(
                (a, b) =>
                    (a.order ?? 999) -
                    (b.order ?? 999)
            );
        }, [effectiveCredits]);

    /*
     * ------------------------------------------------
     * TRAILER
     * ------------------------------------------------
     */

    /*
     * ------------------------------------------------
     * VIDEOS & TRAILER
     * ------------------------------------------------
     */

    const effectiveVideos = useMemo(() => {
        if (videos?.results?.length) {
            return videos.results;
        }
        if (movie?.videos?.results?.length) {
            return movie.videos.results;
        }
        return videos?.results || movie?.videos?.results || [];
    }, [videos, movie]);

    const trailer = useMemo(() => {
        if (!effectiveVideos.length) {
            return null;
        }

        return (
            effectiveVideos.find(
                (video) =>
                    video.site === "YouTube" &&
                    video.type === "Trailer" &&
                    video.official
            ) ||
            effectiveVideos.find(
                (video) =>
                    video.site === "YouTube" &&
                    video.type === "Trailer"
            ) ||
            effectiveVideos.find(
                (video) =>
                    video.site === "YouTube" &&
                    video.type === "Teaser"
            ) ||
            null
        );
    }, [effectiveVideos]);

    /*
     * ------------------------------------------------
     * IMAGES, KEYWORDS, SIMILAR, CERTIFICATION
     * ------------------------------------------------
     */

    const effectiveImages = useMemo(() => {
        if (images?.backdrops?.length || images?.posters?.length || images?.logos?.length) {
            return images;
        }
        if (movie?.images?.backdrops?.length || movie?.images?.posters?.length || movie?.images?.logos?.length) {
            return movie.images;
        }
        return images || movie?.images || null;
    }, [images, movie]);

    const effectiveKeywords = useMemo(() => {
        if (keywords?.length) {
            return keywords;
        }
        if (movie?.keywords?.keywords?.length) {
            return movie.keywords.keywords;
        }
        return keywords || movie?.keywords?.keywords || [];
    }, [keywords, movie]);

    const effectiveSimilar = useMemo(() => {
        if (similar?.length) {
            return similar;
        }
        if (movie?.similar?.results?.length) {
            return movie.similar.results;
        }
        return similar || movie?.similar?.results || [];
    }, [similar, movie]);

    const effectiveRecommendations = useMemo(() => {
        if (recommendations?.length) {
            return recommendations;
        }
        if (movie?.recommendations?.results?.length) {
            return movie.recommendations.results;
        }
        return recommendations || movie?.recommendations?.results || [];
    }, [recommendations, movie]);

    const certification = useMemo(() => {
        const dates = releaseDates?.results || movie?.release_dates?.results;
        if (!Array.isArray(dates)) return "";
        const usRelease = dates.find((d) => d.iso_3166_1 === "US");
        if (usRelease?.release_dates) {
            const cert = usRelease.release_dates.find((r) => r.certification)?.certification;
            if (cert) return cert;
        }
        const inRelease = dates.find((d) => d.iso_3166_1 === "IN");
        if (inRelease?.release_dates) {
            const cert = inRelease.release_dates.find((r) => r.certification)?.certification;
            if (cert) return cert;
        }
        const gbRelease = dates.find((d) => d.iso_3166_1 === "GB");
        if (gbRelease?.release_dates) {
            const cert = gbRelease.release_dates.find((r) => r.certification)?.certification;
            if (cert) return cert;
        }
        for (const country of dates) {
            if (country.release_dates) {
                const cert = country.release_dates.find((r) => r.certification)?.certification;
                if (cert) return cert;
            }
        }
        return "";
    }, [releaseDates, movie]);

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
            <div className="min-h-screen bg-bg text-text antialiased">
                <Navbar />
                <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-accent animate-spin">
                        progress_activity
                    </span>
                    <div className="label-caps">
                        Loading Film Details…
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-bg text-text antialiased">
                <Navbar />
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                    <span className="material-symbols-outlined text-5xl text-text-3 mb-3">
                        movie_off
                    </span>
                    <h1 className="font-serif text-2xl font-semibold mb-2">
                        Film Not Found
                    </h1>
                    <p className="text-text-3 mb-6 max-w-md text-sm">
                        {error || "Unable to locate this film record."}
                    </p>
                    <Link
                        to="/movies"
                        className="btn-primary text-sm py-2.5 px-6 no-underline inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span>Browse Films</span>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg text-text antialiased">
            <Navbar />

            <div className="bg-surface/80 border-b border-border py-3 backdrop-blur-md">
                <div className="page-container">
                    <form
                        onSubmit={handleSearch}
                        className="relative flex flex-col gap-2 sm:block"
                    >
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            placeholder="Search films by title, director, or cast…"
                            className="mc-input pl-11 sm:pr-28 rounded-full text-sm"
                        />

                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-3 sm:top-1/2 sm:-translate-y-1/2 text-[18px]">
                            search
                        </span>

                        <button
                            type="submit"
                            className="btn-primary sm:absolute sm:right-1.5 sm:top-1/2 sm:-translate-y-1/2 text-xs py-1.5 px-4"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <main>

                {/* Hero Section */}
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
                    onAddToList={() => setShowAddToList(true)}
                />

                {/* Add to Curated List Modal */}
                <AddToListModal
                    isOpen={showAddToList}
                    onClose={() => setShowAddToList(false)}
                    movie={movie}
                />

                {/* Movie Decision Layer (Taste AI, Aspect Radar, Context) */}
                <MovieDecisionLayer
                    movie={movie}
                    credits={effectiveCredits}
                    keywords={effectiveKeywords}
                    reviews={filmBuffReviews}
                />

                {/* Trailers & Media Archive */}
                <MovieVideosSection
                    videos={effectiveVideos}
                    trailer={trailer}
                    movieTitle={movie.title}
                    sectionRef={trailerRef}
                />

                {/* Photos, Backdrops & Posters Gallery */}
                <MoviePhotos
                    images={effectiveImages}
                    movieTitle={movie.title}
                />

                {/* Franchise / Movie Collection Spotlight */}
                {movie.belongs_to_collection && (
                    <MovieCollection
                        collection={movie.belongs_to_collection}
                    />
                )}

                {/* Streaming & Where to Watch Providers */}
                <WatchProviders
                    watchProviders={
                        watchProviders
                    }
                />

                {/* Principal Cast Ensemble */}
                <CastSection
                    cast={cast}
                />

                {/* Key Crew & Department Heads */}
                <CrewSection
                    crew={crew}
                    directors={directors}
                    producers={producers}
                    writers={writers}
                />

                {/* Film Specifications & Financial Details */}
                <MovieInfo
                    movie={movie}
                    runtime={runtime}
                    budget={budget}
                    revenue={revenue}
                    certification={certification}
                />

                {/* Story Themes & Taxonomy Keywords */}
                <MovieKeywords
                    keywords={effectiveKeywords}
                />

                {/* Content & Sensory Guide (Advisory reports & User preferences) */}
                <ContentGuideSection
                    movieId={movieId}
                    movieTitle={movie.title}
                />

                {/* Community Reviews & TMDB Reviews */}
                <ReviewSection
                    sectionRef={reviewRef}
                    tmdbReviews={
                        reviews?.results || []
                    }
                    appReviews={
                        filmBuffReviews
                    }
                />

                {/* Recommended & Thematically Similar Cinema */}
                <RecommendationSection
                    recommendations={effectiveRecommendations}
                    similar={effectiveSimilar}
                />

            </main>

            <Footer />

        </div>
    );
}

export default MovieDetails;