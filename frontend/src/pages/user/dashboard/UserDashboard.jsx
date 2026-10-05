import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import LikedStatsCard from "../../../components/cards/LikedStatsCard.jsx";
import TrendingMovieCard from "../../../components/cards/TrendingMovieCard.jsx";

import {
    getTrendingMovies,
    getPosterUrl,
    getBackdropUrl,
    getMovieVideos,
} from "../../../services/movieService.js";

import {
    addToWatchlist,
    removeFromWatchlist,
    checkWatchlist,
} from "../../../services/watchlistService.js";

function UserDashboard() {
    const location = useLocation();
    const fromLogin = location.state?.fromLogin;
    const preloadedMovies = location.state?.preloadedMovies;

    const [movies, setMovies] = useState(() => {
        if (preloadedMovies && preloadedMovies.length > 0) return preloadedMovies;
        try {
            const cached = sessionStorage.getItem("cached_dashboard_movies");
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });
    const [loading, setLoading] = useState(() => movies.length === 0);
    const [error, setError] = useState("");
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [watchlistLoading, setWatchlistLoading] = useState(false);

    useEffect(() => {
        const loadDashboardMovies = async () => {
            try {
                if (movies.length === 0) {
                    setLoading(true);
                }
                setError("");
                const data = await getTrendingMovies();
                const list = data?.results || [];
                if (list.length > 0) {
                    setMovies(list);
                    try {
                        sessionStorage.setItem("cached_dashboard_movies", JSON.stringify(list));
                    } catch {}
                }
            } catch (error) {
                console.error("Failed to load dashboard movies:", error);
                if (movies.length === 0) {
                    setError("Unable to load movies.");
                }
            } finally {
                setLoading(false);
            }
        };
        loadDashboardMovies();
    }, []);

    const movieOfTheDay = movies[0];
    const trendingMovies = movies.slice(1, 4);

    useEffect(() => {
        const checkMovieWatchlist = async () => {
            if (!movieOfTheDay) return;
            const token = localStorage.getItem("token");
            if (!token) { setIsInWatchlist(false); return; }
            try {
                const result = await checkWatchlist(movieOfTheDay.id);
                setIsInWatchlist(
                    result === true || result?.exists === true || result?.inWatchlist === true
                );
            } catch (error) {
                console.error("Failed to check watchlist:", error);
                setIsInWatchlist(false);
            }
        };
        checkMovieWatchlist();
    }, [movieOfTheDay]);

    const formatRating = (rating) =>
        rating ? Number(rating).toFixed(1) : "0.0";

    const mapTrendingMovie = (movie) => ({
        id: movie.id,
        title: movie.title,
        genre: "Film",
        rating: formatRating(movie.vote_average),
        image: getPosterUrl(movie.poster_path),
    });

    const handleWatchTrailer = async () => {
        if (!movieOfTheDay) return;
        try {
            const data = await getMovieVideos(movieOfTheDay.id);
            const trailer =
                data.results?.find(
                    (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
                ) ||
                data.results?.find((v) => v.site === "YouTube" && v.type === "Trailer");
            if (trailer) {
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank", "noopener,noreferrer");
            } else {
                alert("Trailer not available.");
            }
        } catch (error) {
            console.error("Failed to load trailer:", error);
            alert("Unable to load trailer.");
        }
    };

    const handleWatchlistToggle = async () => {
        if (!movieOfTheDay) return;
        const token = localStorage.getItem("token");
        if (!token) { alert("Please login to use your watchlist."); return; }

        try {
            setWatchlistLoading(true);
            if (isInWatchlist) {
                await removeFromWatchlist(movieOfTheDay.id);
                setIsInWatchlist(false);
            } else {
                await addToWatchlist(movieOfTheDay);
                setIsInWatchlist(true);
            }
        } catch (error) {
            console.error("Failed to update watchlist:", error);
            if (error.response?.status === 401) {
                alert("Please login to use your watchlist.");
            } else if (error.response?.status === 403) {
                alert("Access denied. Please login again.");
            } else if (error.response?.status === 409) {
                setIsInWatchlist(true);
            } else {
                alert("Unable to update your watchlist. Please try again.");
            }
        } finally {
            setWatchlistLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen bg-bg text-text antialiased ${
                fromLogin ? "cinematic-dashboard-entrance" : ""
            }`}
        >
            <Navbar />

            <main className="w-full pb-8">

                {/* ── Hero: Film of the Day ── */}
                <section className="relative mb-10 min-h-[360px] w-full overflow-hidden sm:mb-16 sm:min-h-[480px] md:h-[540px] lg:h-[600px]">
                    {movieOfTheDay && (
                        <img
                            src={getBackdropUrl(movieOfTheDay.backdrop_path)}
                            alt={movieOfTheDay.title}
                            className="absolute inset-0 h-full w-full object-cover opacity-40"
                        />
                    )}

                    <div className="absolute inset-0 hero-gradient" />
                    <div className="absolute inset-0 hero-gradient-side" />

                    <div className="absolute bottom-0 left-0 w-full px-4 pb-8 pt-20 sm:px-6 sm:pb-12 md:px-10 lg:px-16">
                        <div className="mx-auto max-w-[1200px]">
                            <div className="mb-3 inline-block">
                                <span className="badge badge-accent">Featured Today</span>
                            </div>

                            {loading ? (
                                <div className="h-10 w-64 skeleton rounded mb-4" />
                            ) : movieOfTheDay ? (
                                <>
                                    <h1 className="mb-4 font-serif text-2xl font-semibold tracking-tight text-text sm:text-4xl md:text-5xl lg:text-6xl break-words">
                                        {movieOfTheDay.title}
                                    </h1>

                                    <p className="mb-6 sm:mb-8 max-w-2xl text-sm sm:text-base leading-relaxed text-text-2 line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
                                        {movieOfTheDay.overview}
                                    </p>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                        <button
                                            type="button"
                                            onClick={handleWatchTrailer}
                                            className="btn-primary text-sm py-2.5 px-6"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                            Watch Trailer
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleWatchlistToggle}
                                            disabled={watchlistLoading}
                                            className={`text-sm py-2.5 px-6 rounded-full border font-semibold backdrop-blur-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                                                isInWatchlist
                                                    ? "bg-accent/20 border-accent/40 text-accent hover:bg-accent/30"
                                                    : "border-border bg-surface/50 text-text-2 hover:bg-surface"
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {watchlistLoading ? "progress_activity" : isInWatchlist ? "check" : "add"}
                                            </span>
                                            {watchlistLoading ? "Updating…" : isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <h1 className="text-2xl font-serif font-semibold text-text">No film available</h1>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Main Grid ── */}
                <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-4 sm:px-6 md:gap-12 md:px-10 lg:grid-cols-12 lg:px-12">

                    {/* ── Left column ── */}
                    <div className="space-y-10 sm:space-y-14 lg:col-span-8">
                        <div>
                            <h2 className="font-serif text-xl font-semibold text-text sm:text-2xl">
                                Welcome back, Cinephile.
                            </h2>
                            <p className="mt-1 text-sm text-text-3">
                                Your cinematic journey continues.
                            </p>
                        </div>

                        {/* Recent Activity */}
                        <section className="space-y-5">
                            <div className="section-header">
                                <h3 className="section-title">Recent Activity</h3>
                                <Link to="/myreviews" className="section-link">
                                    View all
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {error ? (
                                    <p className="text-sm text-text-3">{error}</p>
                                ) : (
                                    <p className="text-sm text-text-3">
                                        Your recent reviews and activity will appear here.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ── Right sidebar ── */}
                    <aside className="space-y-10 lg:col-span-4">
                        <section>
                            <div className="section-header mb-5">
                                <h3 className="section-title">Trending</h3>
                                <Link to="/trending" className="section-link">More</Link>
                            </div>

                            <div className="space-y-3">
                                {loading ? (
                                    <>
                                        <div className="aspect-[16/9] w-full skeleton rounded-lg" />
                                        <div className="aspect-[16/9] w-full skeleton rounded-lg" />
                                        <div className="aspect-[16/9] w-full skeleton rounded-lg" />
                                    </>
                                ) : trendingMovies.length > 0 ? (
                                    trendingMovies.map((movie) => (
                                        <Link to={`/movies/${movie.id}`} key={movie.id} className="block no-underline">
                                            <TrendingMovieCard movie={mapTrendingMovie(movie)} />
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-sm text-text-3">No trending films available.</p>
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default UserDashboard;
