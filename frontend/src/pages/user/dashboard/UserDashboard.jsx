import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

// Layout & Reusable Components
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import TrendingMovieCard from "../../../components/cards/TrendingMovieCard.jsx";

// Dashboard-Specific Components
import CinemaStatsCards from "../../../components/dashboard/CinemaStatsCards.jsx";
import RecommendedSection from "../../../components/dashboard/RecommendedSection.jsx";
import RecentActivityList from "../../../components/dashboard/RecentActivityList.jsx";
import DiaryRecentSection from "../../../components/dashboard/DiaryRecentSection.jsx";
import CommunityReviewsSection from "../../../components/dashboard/CommunityReviewsSection.jsx";
import TrailerModal from "../../../components/dashboard/TrailerModal.jsx";
import QuickLogModal from "../../../components/dashboard/QuickLogModal.jsx";

// Services
import {
    getTrendingMovies,
    getPopularMovies,
    getMovieDetails,
    getMovieVideos,
    getBackdropUrl,
    getMovies,
} from "../../../services/movieService.js";

import {
    addToWatchlist,
    removeFromWatchlist,
    checkWatchlist,
    getWatchlist,
} from "../../../services/watchlistService.js";

import { getWatchedMovies } from "../../../services/watchedMovieService.js";
import { getMyDiary, getDiaryStats } from "../../../services/diaryService.js";
import { getMyReviews } from "../../../services/reviewService.js";
import { getMyProfile } from "../../../services/userService.js";
import { getGlobalCommunityFeed } from "../../../services/socialService.js";

export default function UserDashboard() {
    const location = useLocation();
    const fromLogin = location.state?.fromLogin;

    // --- State: Auth Profile & Greeting ---
    const [userProfile, setUserProfile] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // --- State: Movies (Hero & Trending) ---
    const [trendingList, setTrendingList] = useState([]);
    const [heroMovie, setHeroMovie] = useState(null);
    const [heroDetails, setHeroDetails] = useState(null);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [watchlistLoading, setWatchlistLoading] = useState(false);

    // --- State: Recommendations ---
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [hasPersonalization, setHasPersonalization] = useState(false);

    // --- State: Cinema Statistics ---
    const [stats, setStats] = useState({
        watchedCount: 0,
        ratedCount: 0,
        reviewsCount: 0,
        watchlistCount: 0,
        totalHoursWatched: 0,
        totalMinutesWatched: 0,
    });

    // --- State: User Activity & Diary ---
    const [activities, setActivities] = useState([]);
    const [diaryEntries, setDiaryEntries] = useState([]);
    const [communityFeed, setCommunityFeed] = useState([]);

    // --- State: Modals & Trailers ---
    const [trailerModalOpen, setTrailerModalOpen] = useState(false);
    const [trailerKey, setTrailerKey] = useState(null);
    const [quickLogOpen, setQuickLogOpen] = useState(false);

    // --- State: Status & Loaders ---
    const [loadingHero, setLoadingHero] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [loadingCommunity, setLoadingCommunity] = useState(true);
    const [error, setError] = useState("");

    // ─────────────────────────────────────────────────────────────
    // 1. Load User Profile & Cinema Stats
    // ─────────────────────────────────────────────────────────────
    const fetchUserDataAndStats = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoadingStats(true);
        setLoadingActivity(true);

        const results = await Promise.allSettled([
            getMyProfile(),
            getWatchedMovies(),
            getMyDiary(),
            getDiaryStats(),
            getMyReviews(),
            getWatchlist(),
        ]);

        const [
            profileRes,
            watchedRes,
            diaryRes,
            diaryStatsRes,
            reviewsRes,
            watchlistRes,
        ] = results;

        // User profile
        if (profileRes.status === "fulfilled" && profileRes.value) {
            setUserProfile((prev) => ({ ...prev, ...profileRes.value }));
        }

        const watchedList = watchedRes.status === "fulfilled" && Array.isArray(watchedRes.value)
            ? watchedRes.value
            : [];
        const diaryLogs = diaryRes.status === "fulfilled" && Array.isArray(diaryRes.value)
            ? diaryRes.value
            : [];
        const reviewsList = reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value)
            ? reviewsRes.value
            : [];
        const watchlistList = watchlistRes.status === "fulfilled" && Array.isArray(watchlistRes.value)
            ? watchlistRes.value
            : [];
        const dStats = diaryStatsRes.status === "fulfilled" && diaryStatsRes.value
            ? diaryStatsRes.value
            : {};

        // Calculate rated count: unique films in diary or reviews with rating
        const ratedFilmsCount = diaryLogs.filter((d) => d.rating != null && d.rating > 0).length;

        setStats({
            watchedCount: watchedList.length || dStats.totalFilmsLogged || 0,
            ratedCount: ratedFilmsCount || reviewsList.length || 0,
            reviewsCount: reviewsList.length || 0,
            watchlistCount: watchlistList.length || 0,
            totalHoursWatched: dStats.totalHoursWatched || 0,
            totalMinutesWatched: dStats.totalMinutesWatched || 0,
        });

        // Diary items (sorted descending by date)
        setDiaryEntries(diaryLogs);

        // Aggregate chronological activities
        const combinedActivities = [];

        reviewsList.forEach((r) => {
            combinedActivities.push({
                id: `review-${r.id}`,
                type: "REVIEW",
                movieId: r.movieId,
                title: r.movieTitle || r.title,
                poster: r.poster,
                rating: r.rating,
                content: r.content,
                rewatch: r.rewatch,
                date: r.createdAt || r.watchedDate,
            });
        });

        diaryLogs.forEach((d) => {
            combinedActivities.push({
                id: `diary-${d.id}`,
                type: "DIARY",
                movieId: d.movieId,
                title: d.title,
                poster: d.poster,
                rating: d.rating,
                content: d.reviewNotes || d.notes,
                rewatch: d.rewatch,
                venue: d.venue,
                date: d.watchedDate || d.createdAt,
            });
        });

        watchlistList.forEach((w) => {
            combinedActivities.push({
                id: `watchlist-${w.id}`,
                type: "WATCHLIST",
                movieId: w.movieId,
                title: w.title,
                poster: w.poster,
                date: w.createdAt,
            });
        });

        // Sort latest first
        combinedActivities.sort((a, b) => {
            const timeA = a.date ? new Date(a.date).getTime() : 0;
            const timeB = b.date ? new Date(b.date).getTime() : 0;
            return timeB - timeA;
        });

        setActivities(combinedActivities);
        setLoadingStats(false);
        setLoadingActivity(false);
    }, []);

    // ─────────────────────────────────────────────────────────────
    // 2. Load Trending & Hero Featured Film
    // ─────────────────────────────────────────────────────────────
    const fetchHeroAndTrending = useCallback(async () => {
        try {
            setLoadingHero(true);
            setError("");
            const data = await getTrendingMovies();
            const list = data?.results || [];

            if (list.length > 0) {
                setTrendingList(list);
                const featured = list[0];
                setHeroMovie(featured);

                // Fetch extra details (runtime, genres)
                try {
                    const detailed = await getMovieDetails(featured.id);
                    setHeroDetails(detailed);
                } catch {
                    setHeroDetails(null);
                }
            } else {
                // Fallback to popular movies
                const pop = await getPopularMovies();
                const popList = pop?.results || [];
                setTrendingList(popList);
                if (popList.length > 0) {
                    setHeroMovie(popList[0]);
                }
            }
        } catch (err) {
            console.error("Failed to load trending movies:", err);
            setError("Unable to load featured movies. Please check connection.");
        } finally {
            setLoadingHero(false);
        }
    }, []);

    // ─────────────────────────────────────────────────────────────
    // 3. Load Recommendations (Personalized vs Fallback)
    // ─────────────────────────────────────────────────────────────
    const fetchRecommendations = useCallback(async () => {
        setLoadingRecs(true);
        try {
            // Check if user has favorite genres or watched movies
            const favGenres = userProfile?.favoriteGenres;
            let genreQuery = "";

            if (favGenres) {
                // Map genre string to TMDB query if applicable
                genreQuery = favGenres.split(",")[0]?.trim();
            }

            if (genreQuery) {
                const recData = await getMovies({ genre: genreQuery, sortBy: "popularity.desc" });
                const list = recData?.results || [];
                if (list.length > 0) {
                    setRecommendedMovies(list);
                    setHasPersonalization(true);
                    setLoadingRecs(false);
                    return;
                }
            }

            // Fallback: top-rated / popular cinematic recommendations
            const popularData = await getPopularMovies();
            setRecommendedMovies(popularData?.results || []);
            setHasPersonalization(false);
        } catch (err) {
            console.error("Failed to load recommendations:", err);
            setRecommendedMovies([]);
        } finally {
            setLoadingRecs(false);
        }
    }, [userProfile?.favoriteGenres]);

    // ─────────────────────────────────────────────────────────────
    // 4. Load Community Feed
    // ─────────────────────────────────────────────────────────────
    const fetchCommunityFeed = useCallback(async () => {
        setLoadingCommunity(true);
        try {
            const feed = await getGlobalCommunityFeed();
            setCommunityFeed(Array.isArray(feed) ? feed : []);
        } catch {
            setCommunityFeed([]);
        } finally {
            setLoadingCommunity(false);
        }
    }, []);

    // Initial Mount
    useEffect(() => {
        fetchHeroAndTrending();
        fetchUserDataAndStats();
        fetchCommunityFeed();
    }, [fetchHeroAndTrending, fetchUserDataAndStats, fetchCommunityFeed]);

    // Fetch recommendations when profile is updated
    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    // Check Hero Movie Watchlist Status
    useEffect(() => {
        const checkHeroWatchlist = async () => {
            if (!heroMovie) return;
            const token = localStorage.getItem("token");
            if (!token) {
                setIsInWatchlist(false);
                return;
            }
            try {
                const result = await checkWatchlist(heroMovie.id);
                setIsInWatchlist(
                    result === true || result?.exists === true || result?.inWatchlist === true
                );
            } catch {
                setIsInWatchlist(false);
            }
        };
        checkHeroWatchlist();
    }, [heroMovie]);

    // ─────────────────────────────────────────────────────────────
    // Watch Trailer Handler
    // ─────────────────────────────────────────────────────────────
    const handleWatchTrailer = async () => {
        if (!heroMovie) return;
        try {
            const videoData = await getMovieVideos(heroMovie.id);
            const videos = videoData?.results || [];
            const trailer =
                videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
                videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
                videos.find((v) => v.site === "YouTube");

            if (trailer && trailer.key) {
                setTrailerKey(trailer.key);
                setTrailerModalOpen(true);
            } else {
                alert(`No official YouTube trailer found for "${heroMovie.title}".`);
            }
        } catch (err) {
            console.error("Failed to fetch trailer:", err);
            alert("Unable to load trailer right now.");
        }
    };

    // ─────────────────────────────────────────────────────────────
    // Watchlist Toggle Handler
    // ─────────────────────────────────────────────────────────────
    const handleWatchlistToggle = async () => {
        if (!heroMovie) return;
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to manage your watchlist.");
            return;
        }

        try {
            setWatchlistLoading(true);
            if (isInWatchlist) {
                await removeFromWatchlist(heroMovie.id);
                setIsInWatchlist(false);
                setStats((prev) => ({
                    ...prev,
                    watchlistCount: Math.max(0, prev.watchlistCount - 1),
                }));
            } else {
                await addToWatchlist(heroMovie);
                setIsInWatchlist(true);
                setStats((prev) => ({
                    ...prev,
                    watchlistCount: prev.watchlistCount + 1,
                }));
            }
        } catch (err) {
            console.error("Watchlist toggle failed:", err);
            alert("Unable to update watchlist. Please try again.");
        } finally {
            setWatchlistLoading(false);
        }
    };

    // Top 3 Trending Movies for Sidebar
    const trendingSidebar = useMemo(() => {
        return trendingList.slice(1, 4).map((m, idx) => ({
            id: m.id,
            title: m.title,
            rank: idx + 1,
            genre: "Film",
            year: m.release_date ? m.release_date.slice(0, 4) : "",
            language: m.original_language ? m.original_language.toUpperCase() : "EN",
            rating: m.vote_average ? Number(m.vote_average).toFixed(1) : "0.0",
            backdrop: getBackdropUrl(m.backdrop_path),
            image: getBackdropUrl(m.backdrop_path),
        }));
    }, [trendingList]);

    // Greeting Name
    const firstName = userProfile?.firstname || "Cinephile";

    return (
        <div
            className={`min-h-screen bg-bg text-text antialiased selection:bg-accent/30 selection:text-text ${
                fromLogin ? "cinematic-dashboard-entrance" : ""
            }`}
        >
            <Navbar />

            <main className="w-full pb-16">
                {/* ───────────────────────────────────────────────────── */}
                {/* 1. CINEMATIC HERO BANNER — FEATURED TODAY            */}
                {/* ───────────────────────────────────────────────────── */}
                <section className="relative mb-8 min-h-[460px] sm:min-h-[500px] w-full overflow-hidden flex flex-col justify-end border-b border-border/60">
                    {heroMovie?.backdrop_path && (
                        <img
                            src={getBackdropUrl(heroMovie.backdrop_path)}
                            alt={heroMovie.title}
                            className="absolute inset-0 h-full w-full object-cover object-top opacity-35 transition-opacity duration-700"
                        />
                    )}

                    {/* Vignette Gradients */}
                    <div className="absolute inset-0 hero-gradient" />
                    <div className="absolute inset-0 hero-gradient-side" />

                    <div className="relative z-10 w-full page-container pb-10 pt-28 sm:pt-36">
                        <div className="max-w-3xl">
                            <div className="mb-3.5 inline-flex items-center gap-2">
                                <span className="badge badge-accent shadow-sm">
                                    <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
                                    Featured Today
                                </span>
                                {heroMovie?.release_date && (
                                    <span className="text-xs font-mono text-text-3">
                                        {heroMovie.release_date.slice(0, 4)}
                                    </span>
                                )}
                                {heroDetails?.runtime && (
                                    <span className="text-xs font-mono text-text-3">
                                        · {Math.floor(heroDetails.runtime / 60)}h {heroDetails.runtime % 60}m
                                    </span>
                                )}
                                {heroMovie?.vote_average && (
                                    <span className="text-xs font-mono text-accent font-semibold inline-flex items-center gap-0.5">
                                        · ★ {Number(heroMovie.vote_average).toFixed(1)}
                                    </span>
                                )}
                            </div>

                            {loadingHero ? (
                                <div className="space-y-3">
                                    <div className="h-12 w-3/4 skeleton rounded-lg" />
                                    <div className="h-4 w-full skeleton rounded" />
                                    <div className="h-4 w-2/3 skeleton rounded" />
                                </div>
                            ) : heroMovie ? (
                                <>
                                    <h1 className="mb-3.5 font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-text leading-tight drop-shadow-md">
                                        {heroMovie.title}
                                    </h1>

                                    <p className="mb-6 max-w-2xl text-sm sm:text-base leading-relaxed text-text-2 line-clamp-3 sm:line-clamp-4 font-sans">
                                        {heroMovie.overview}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                        <button
                                            type="button"
                                            onClick={handleWatchTrailer}
                                            className="btn-primary text-sm py-2.5 px-6 shadow-lg shadow-accent/20 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[19px]">play_arrow</span>
                                            <span>Watch Trailer</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleWatchlistToggle}
                                            disabled={watchlistLoading}
                                            className={`text-sm py-2.5 px-5 rounded-full border font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center gap-1.5 ${
                                                isInWatchlist
                                                    ? "bg-accent/20 border-accent/60 text-accent hover:bg-accent/30"
                                                    : "border-border bg-surface/70 text-text hover:bg-surface hover:border-accent/40"
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {watchlistLoading ? "progress_activity" : isInWatchlist ? "check" : "bookmark_add"}
                                            </span>
                                            <span>
                                                {watchlistLoading ? "Updating…" : isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                                            </span>
                                        </button>

                                        <Link
                                            to={`/movies/${heroMovie.id}`}
                                            className="btn-secondary text-sm py-2.5 px-5 backdrop-blur-md bg-surface/30"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">info</span>
                                            <span>View Movie</span>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 rounded-xl border border-border bg-surface/50 text-text-3">
                                    {error || "No featured film available right now."}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ───────────────────────────────────────────────────── */}
                {/* 2. WELCOME & STATS SECTION                           */}
                {/* ───────────────────────────────────────────────────── */}
                <div className="page-container mb-10 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/60 pb-5">
                        <div>
                            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-text">
                                Welcome back, {firstName}.
                            </h2>
                            <p className="mt-1 text-sm text-text-3">
                                Your cinematic journey continues. Track films, discover auteurs, and log reviews.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setQuickLogOpen(true)}
                            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[17px]">edit_calendar</span>
                            <span>Log Film</span>
                        </button>
                    </div>

                    {/* Compact Cinema Statistics Cards */}
                    <CinemaStatsCards stats={stats} loading={loadingStats} />
                </div>

                {/* ───────────────────────────────────────────────────── */}
                {/* 3. MAIN DASHBOARD GRID (8 Col Left, 4 Col Right)      */}
                {/* ───────────────────────────────────────────────────── */}
                <div className="page-container grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* ─────────────────────────── */}
                    {/* LEFT COLUMN (lg:col-span-8) */}
                    {/* ─────────────────────────── */}
                    <div className="space-y-12 lg:col-span-8 min-w-0">
                        {/* Section A: Recommended For You */}
                        <RecommendedSection
                            movies={recommendedMovies}
                            loading={loadingRecs}
                            hasPersonalization={hasPersonalization}
                        />

                        {/* Section B: Recent Activity */}
                        <RecentActivityList
                            activities={activities}
                            loading={loadingActivity}
                        />

                        {/* Section C: Film Diary & Recently Watched */}
                        <DiaryRecentSection
                            diaryEntries={diaryEntries}
                            loading={loadingActivity}
                            onOpenLogModal={() => setQuickLogOpen(true)}
                        />

                        {/* Optional Section: Community Activity Feed */}
                        <CommunityReviewsSection
                            communityFeed={communityFeed}
                            loading={loadingCommunity}
                        />
                    </div>

                    {/* ─────────────────────────── */}
                    {/* RIGHT SIDEBAR (lg:col-span-4) */}
                    {/* ─────────────────────────── */}
                    <aside className="space-y-8 lg:col-span-4 min-w-0">
                        {/* Section D: Trending Now */}
                        <section className="space-y-4">
                            <div className="section-header mb-4">
                                <div>
                                    <h3 className="section-title">Trending Now</h3>
                                    <p className="text-[11px] text-text-3">Most watched cinema worldwide</p>
                                </div>
                                <Link to="/trending" className="section-link">
                                    <span>More</span>
                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </Link>
                            </div>

                            <div className="space-y-3.5">
                                {loadingHero ? (
                                    <>
                                        <div className="aspect-[16/9] w-full skeleton rounded-xl" />
                                        <div className="aspect-[16/9] w-full skeleton rounded-xl" />
                                        <div className="aspect-[16/9] w-full skeleton rounded-xl" />
                                    </>
                                ) : trendingSidebar.length > 0 ? (
                                    trendingSidebar.map((movie) => (
                                        <TrendingMovieCard key={movie.id} movie={movie} />
                                    ))
                                ) : (
                                    <p className="text-sm text-text-3 p-4 rounded-xl border border-border bg-surface text-center">
                                        No trending films available.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Discovery Shortcuts Card */}
                        <section className="rounded-2xl border border-border bg-surface p-5 space-y-4">
                            <div className="flex items-center gap-2 text-accent">
                                <span className="material-symbols-outlined text-[20px]">explore</span>
                                <h4 className="font-serif text-sm font-semibold text-text uppercase tracking-wider">
                                    Cinema Discovery Tools
                                </h4>
                            </div>

                            <div className="space-y-2 text-xs">
                                <Link
                                    to="/what-to-watch"
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-accent/40 bg-surface-2/60 hover:bg-surface-2 transition-colors text-text-2 hover:text-text no-underline"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-accent text-[17px]">psychology</span>
                                        <span>What to Watch (Decision Engine)</span>
                                    </span>
                                    <span className="material-symbols-outlined text-[15px] text-text-3">chevron_right</span>
                                </Link>

                                <Link
                                    to="/box-prediction"
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-accent/40 bg-surface-2/60 hover:bg-surface-2 transition-colors text-text-2 hover:text-text no-underline"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-accent text-[17px]">query_stats</span>
                                        <span>Box Office ML Predictor</span>
                                    </span>
                                    <span className="material-symbols-outlined text-[15px] text-text-3">chevron_right</span>
                                </Link>

                                <Link
                                    to="/lists"
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-accent/40 bg-surface-2/60 hover:bg-surface-2 transition-colors text-text-2 hover:text-text no-underline"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-accent text-[17px]">format_list_bulleted</span>
                                        <span>Curated Film Collections</span>
                                    </span>
                                    <span className="material-symbols-outlined text-[15px] text-text-3">chevron_right</span>
                                </Link>

                                <Link
                                    to="/data-migration"
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-accent/40 bg-surface-2/60 hover:bg-surface-2 transition-colors text-text-2 hover:text-text no-underline"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-accent text-[17px]">sync_alt</span>
                                        <span>Import Letterboxd / IMDb CSV</span>
                                    </span>
                                    <span className="material-symbols-outlined text-[15px] text-text-3">chevron_right</span>
                                </Link>
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            {/* Trailer Modal */}
            <TrailerModal
                isOpen={trailerModalOpen}
                onClose={() => setTrailerModalOpen(false)}
                trailerKey={trailerKey}
                movieTitle={heroMovie?.title || "Movie"}
            />

            {/* Quick Log Film Modal */}
            <QuickLogModal
                isOpen={quickLogOpen}
                onClose={() => setQuickLogOpen(false)}
                onLogged={fetchUserDataAndStats}
            />

            <Footer />
        </div>
    );
}
