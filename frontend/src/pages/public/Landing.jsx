import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Icon from "../../components/common/Icon";
import movieImage from "../../assets/images/image1.png";
import {
    getTrendingMovies,
    getPopularMovies,
    getMovies,
    getMovieDetails,
    getMovieReviews,
    getGenres,
    getPosterUrl,
    getBackdropUrl
} from "../../services/movieService";

// Mood genre data
const MOOD_GENRES = [
    { id: 878, label: "Sci-Fi",   name: "Science Fiction" },
    { id: 53,  label: "Thriller", name: "Thriller"        },
    { id: 27,  label: "Horror",   name: "Horror"          },
    { id: 80,  label: "Crime",    name: "Crime"           },
    { id: 18,  label: "Drama",    name: "Drama"           },
];

const DEFAULT_GENRES = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const FALLBACK_MOVIES = [
    {
        id: 157336,
        title: "Interstellar",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
        vote_average: 8.6,
        vote_count: 36000,
        release_date: "2014-11-05",
        genre_ids: [12, 18, 878],
        overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage."
    },
    {
        id: 27205,
        title: "Inception",
        poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        vote_average: 8.4,
        vote_count: 37000,
        release_date: "2010-07-15",
        genre_ids: [28, 878, 12],
        overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\"."
    },
    {
        id: 155,
        title: "The Dark Knight",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
        vote_average: 8.5,
        vote_count: 33000,
        release_date: "2008-07-16",
        genre_ids: [18, 28, 80, 53],
        overview: "Batman raises the stakes in his war on crime. With the help of allies Lt. Jim Gordon and DA Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets."
    },
    {
        id: 693134,
        title: "Dune: Part Two",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg",
        vote_average: 8.2,
        vote_count: 6500,
        release_date: "2024-02-27",
        genre_ids: [878, 12],
        overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family."
    },
    {
        id: 533535,
        title: "Deadpool & Wolverine",
        poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        backdrop_path: "/yDHYTjA3R0jFYba16jBB1jv8vpH.jpg",
        vote_average: 7.7,
        vote_count: 6000,
        release_date: "2024-07-24",
        genre_ids: [28, 35, 878],
        overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again."
    }
];

const Landing = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [genreMap, setGenreMap] = useState(DEFAULT_GENRES);
    const [trendingToday, setTrendingToday] = useState([]);
    const [popularThisWeek, setPopularThisWeek] = useState([]);
    const [selectedMood, setSelectedMood] = useState(MOOD_GENRES[0]);
    const [moodMovies, setMoodMovies] = useState([]);
    const [moodLoading, setMoodLoading] = useState(false);
    const [spotlightMovie, setSpotlightMovie] = useState(null);
    const [spotlightDetails, setSpotlightDetails] = useState(null);
    const [newReleases, setNewReleases] = useState([]);
    const [communityReviews, setCommunityReviews] = useState([]);
    const [popularLists, setPopularLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroSlideIndex, setHeroSlideIndex] = useState(0);

    // Auto-advance hero backdrop slideshow every 5.5s
    useEffect(() => {
        if (!trendingToday || trendingToday.length <= 1) return;
        const interval = setInterval(() => {
            setHeroSlideIndex((prev) => (prev + 1) % trendingToday.length);
        }, 5500);
        return () => clearInterval(interval);
    }, [trendingToday]);

    const formatRuntime = (mins) => {
        if (!mins) return "2h 15m";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const getYear = (dateStr) => {
        if (!dateStr) return "2026";
        return dateStr.substring(0, 4);
    };

    const formatMovie = (movie, genresObj = genreMap) => {
        const genreNames = (movie.genre_ids || [])
            .map((id) => genresObj[id])
            .filter(Boolean)
            .slice(0, 2)
            .join(" / ");

        return {
            id: movie.id,
            title: movie.title || movie.original_title || "Untitled",
            poster: getPosterUrl(movie.poster_path),
            backdrop: getBackdropUrl(movie.backdrop_path),
            rating: movie.vote_average ? Number(movie.vote_average).toFixed(1) : "8.0",
            voteCount: movie.vote_count || 0,
            year: getYear(movie.release_date),
            genre: genreNames || "Cinema",
            overview: movie.overview || "No overview available."
        };
    };

    useEffect(() => {
        const initLandingData = async () => {
            try {
                setLoading(true);

                let gMap = { ...DEFAULT_GENRES };
                try {
                    const gData = await getGenres();
                    const gList = Array.isArray(gData) ? gData : gData?.genres || [];
                    if (gList.length > 0) {
                        gList.forEach((g) => { gMap[g.id] = g.name; });
                        setGenreMap(gMap);
                    }
                } catch (e) {
                    console.warn("Could not fetch genres:", e?.message || e);
                }

                try {
                    const trendingRes = await getTrendingMovies(1);
                    let trendingList = Array.isArray(trendingRes) ? trendingRes : trendingRes?.results || [];
                    if (trendingList.length === 0) {
                        trendingList = FALLBACK_MOVIES;
                    }
                    setTrendingToday(trendingList.slice(0, 8).map((m) => formatMovie(m, gMap)));

                    if (trendingList.length > 0) {
                        const topMovie = trendingList[0];
                        setSpotlightMovie(formatMovie(topMovie, gMap));
                        try {
                            const details = await getMovieDetails(topMovie.id);
                            if (details && details.id) {
                                setSpotlightDetails(details);
                            }
                        } catch {}

                        try {
                            const revRes = await getMovieReviews(topMovie.id);
                            const revList = revRes?.results || [];
                            if (revList.length > 0) {
                                setCommunityReviews(revList.slice(0, 3).map((r, index) => ({
                                    id: r.id || index,
                                    author: r.author || "Cinephile Member",
                                    movieTitle: topMovie.title,
                                    movieId: topMovie.id,
                                    rating: r.author_details?.rating
                                        ? Number(r.author_details.rating).toFixed(1)
                                        : "8.5",
                                    content: r.content?.length > 200
                                        ? r.content.slice(0, 200) + "…"
                                        : r.content,
                                    time: "Recent",
                                    avatar: r.author_details?.avatar_path
                                        ? getPosterUrl(r.author_details.avatar_path)
                                        : null
                                })));
                            }
                        } catch {}
                    }
                } catch (e) {
                    console.error("Failed to load trending movies, using fallback:", e?.message || e);
                    setTrendingToday(FALLBACK_MOVIES.slice(0, 8).map((m) => formatMovie(m, gMap)));
                    setSpotlightMovie(formatMovie(FALLBACK_MOVIES[0], gMap));
                }

                try {
                    const popularRes = await getPopularMovies();
                    let popularList = Array.isArray(popularRes) ? popularRes : popularRes?.results || [];
                    if (popularList.length === 0) {
                        popularList = FALLBACK_MOVIES;
                    }
                    setPopularThisWeek(popularList.slice(0, 5).map((m) => formatMovie(m, gMap)));
                } catch (e) {
                    console.error("Failed to load popular movies, using fallback:", e?.message || e);
                    setPopularThisWeek(FALLBACK_MOVIES.slice(0, 5).map((m) => formatMovie(m, gMap)));
                }

                try {
                    let newRes = await getMovies({ year: "2026", sortBy: "popularity.desc", page: 1 });
                    let newList = Array.isArray(newRes) ? newRes : newRes?.results || [];
                    if (newList.length < 4) {
                        const fallbackRes = await getMovies({ year: "2025", sortBy: "popularity.desc", page: 1 });
                        const fallbackList = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes?.results || [];
                        newList = fallbackList.length > 0 ? fallbackList : FALLBACK_MOVIES;
                    }
                    setNewReleases(newList.slice(0, 4).map((m) => formatMovie(m, gMap)));
                } catch (e) {
                    console.error("Failed to load new releases, using fallback:", e?.message || e);
                    setNewReleases(FALLBACK_MOVIES.slice(0, 4).map((m) => formatMovie(m, gMap)));
                }

                try {
                    const [sciFiRes, crimeRes, dramaRes] = await Promise.all([
                        getMovies({ genre: 878, sortBy: "popularity.desc", page: 1 }).catch(() => ({ results: FALLBACK_MOVIES })),
                        getMovies({ genre: 80,  sortBy: "popularity.desc", page: 1 }).catch(() => ({ results: FALLBACK_MOVIES })),
                        getMovies({ genre: 18,  sortBy: "vote_average.desc", page: 1 }).catch(() => ({ results: FALLBACK_MOVIES }))
                    ]);

                    const getPosters = (res) =>
                        (res?.results || FALLBACK_MOVIES).slice(0, 3).map((m) => getPosterUrl(m.poster_path)).filter(Boolean);

                    setPopularLists([
                        {
                            id: "list-1",
                            title: "Mind-Bending Sci-Fi & Speculative Masterpieces",
                            description: "Dystopian visions, deep space odysseys, and thought-provoking realities.",
                            filmsCount: 42, likes: "1.8k", curator: "Alex Vance",
                            genreId: 878, posters: getPosters(sciFiRes)
                        },
                        {
                            id: "list-2",
                            title: "Neo-Noir, Gritty Heists & Gangster Sagas",
                            description: "Shadowy back-alleys, hard-boiled detectives, and gripping criminal minds.",
                            filmsCount: 35, likes: "1.4k", curator: "Elena Rostova",
                            genreId: 80, posters: getPosters(crimeRes)
                        },
                        {
                            id: "list-3",
                            title: "Emotionally Devastating Masterclass Dramas",
                            description: "Unforgettable performances and poetic human stories that linger long after.",
                            filmsCount: 50, likes: "2.1k", curator: "Marcus Sterling",
                            genreId: 18, posters: getPosters(dramaRes)
                        }
                    ]);
                } catch (e) {
                    console.warn("Could not generate curated lists:", e?.message || e);
                }

            } catch (err) {
                console.error("Landing page initialization error:", err);
            } finally {
                setLoading(false);
            }
        };

        initLandingData();
    }, []);

    useEffect(() => {
        const loadMoodMovies = async () => {
            if (!selectedMood) return;
            try {
                setMoodLoading(true);
                const res = await getMovies({ genre: selectedMood.id, sortBy: "popularity.desc", page: 1 });
                let list = Array.isArray(res) ? res : res?.results || [];
                if (list.length === 0) {
                    list = FALLBACK_MOVIES;
                }
                setMoodMovies(list.slice(0, 5).map((m) => formatMovie(m)));
            } catch (err) {
                console.error("Failed to load mood movies, using fallback:", err?.message || err);
                setMoodMovies(FALLBACK_MOVIES.slice(0, 5).map((m) => formatMovie(m)));
            } finally {
                setMoodLoading(false);
            }
        };
        loadMoodMovies();
    }, [selectedMood]);

    const displayReviews = communityReviews.length > 0 ? communityReviews : [
        {
            id: 1, author: "Julian Thorne",
            movieTitle: spotlightMovie?.title || "Interstellar",
            movieId: spotlightMovie?.id || 157336, rating: "9.5",
            content: "A masterclass in tension, sound design, and emotional resonance. The direction keeps you locked in from the opening frame.",
            time: "2 days ago"
        },
        {
            id: 2, author: "Maya Lin",
            movieTitle: trendingToday[1]?.title || "Blade Runner 2049",
            movieId: trendingToday[1]?.id || 335984, rating: "9.0",
            content: "Breathtaking cinematography and a nuanced script that honours its genre while innovating in every subtle way.",
            time: "Yesterday"
        },
        {
            id: 3, author: "David K.",
            movieTitle: popularThisWeek[0]?.title || "Dune: Part Two",
            movieId: popularThisWeek[0]?.id || 693134, rating: "8.8",
            content: "Grand scale filmmaking at its absolute peak. You feel the weight of every choice and the world building is unmatched.",
            time: "4 days ago"
        }
    ];

    /* ── Poster Movie Card ── */
    const renderMovieCard = (movie) => (
        <article
            key={movie.id}
            onClick={() => navigate(`/movies/${movie.id}`)}
            className="group flex flex-col cursor-pointer"
        >
            <div className="poster-card">
                {movie.poster ? (
                    <img
                        src={movie.poster}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-surface text-text-3 p-3 text-center">
                        <span className="text-2xl mb-1 opacity-30">▣</span>
                        <span className="text-[11px] font-medium">{movie.title}</span>
                    </div>
                )}

                {/* Rating */}
                <div className="absolute top-2 left-2 badge badge-accent backdrop-blur-sm">
                    ★ {movie.rating}
                </div>

                {/* Hover CTA */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg/90 via-bg/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(`/movies/${movie.id}`); }}
                        className="btn-primary w-full text-xs py-2 rounded-lg"
                    >
                        View Details
                    </button>
                </div>
            </div>

            <div className="mt-2.5 px-0.5">
                <h3 className="truncate text-sm font-medium text-text transition-colors group-hover:text-accent">
                    {movie.title}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-text-3 font-medium">
                    {movie.genre} · {movie.year}
                </p>
            </div>
        </article>
    );

    /* ── Skeleton Row ── */
    const renderSkeletonRow = (count = 5) => (
        <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <div className="aspect-[2/3] w-full skeleton rounded-lg" />
                    <div className="h-3 w-3/4 skeleton rounded" />
                    <div className="h-2.5 w-1/2 skeleton rounded" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen overflow-x-hidden bg-bg text-text antialiased">
            <Navbar />

            <main className="space-y-16 sm:space-y-24 lg:space-y-28">

                {/* ── 1. HERO SLIDESHOW ── */}
                <section className="relative flex min-h-[540px] w-full items-end pb-12 sm:min-h-[620px] sm:pb-16 lg:min-h-[700px] film-grain overflow-hidden">
                    {/* Background Backdrop Slideshow */}
                    <div className="absolute inset-0 z-0">
                        {(trendingToday.length > 0 ? trendingToday : (spotlightMovie ? [spotlightMovie] : FALLBACK_MOVIES.map((m) => formatMovie(m)))).map((movie, idx) => (
                            <div
                                key={movie.id || idx}
                                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                                    idx === heroSlideIndex
                                        ? "opacity-85 dark:opacity-60 scale-100"
                                        : "opacity-0 scale-105 pointer-events-none"
                                }}`}
                            >
                                <img
                                    src={movie.backdrop || movie.poster || movieImage}
                                    alt={`${movie.title} backdrop`}
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        ))}

                        {/* Cinematic Gradient Overlays for Readability */}
                        <div className="absolute inset-0 hero-gradient" />
                        <div className="absolute inset-0 hero-gradient-side" />
                    </div>

                    <div className="relative z-10 w-full page-container">
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                            <div className="max-w-2xl">
                                <p className="label-caps mb-4">Your Cinema Journal</p>

                                <h1 className="mb-4 font-serif text-fluid-hero font-semibold leading-tight text-text tracking-tight break-words">
                                    Discover, Log &<br />
                                    <span className="text-accent">Curate Cinema.</span>
                                </h1>

                                <p className="mb-8 text-sm sm:text-base lg:text-lg text-text-2 leading-relaxed max-w-xl">
                                    A platform for serious film lovers. Discover films, write reviews,
                                    curate personal lists, and explore the art of cinema.
                                </p>

                                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                    <Link to="/movies" className="btn-primary text-sm py-3 px-8">
                                        Discover Films
                                    </Link>
                                    {token ? (
                                        <Link to="/dashboard" className="btn-secondary text-sm py-3 px-8">
                                            My Dashboard
                                        </Link>
                                    ) : (
                                        <Link to="/register" className="btn-secondary text-sm py-3 px-8">
                                            Create Account
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Slideshow Active Film Widget & Controls */}
                            {trendingToday.length > 1 && (
                                <div className="self-start lg:self-end bg-surface/90 backdrop-blur-md border border-border/80 p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col gap-2.5 w-full sm:w-auto sm:min-w-[280px] max-w-sm">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                                                Trending In Cinema
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-mono text-text-3">
                                            {heroSlideIndex + 1} / {trendingToday.length}
                                        </span>
                                    </div>

                                    {/* Active Movie Card with HD Poster Thumbnail */}
                                    <Link
                                        to={trendingToday[heroSlideIndex]?.id ? `/movies/${trendingToday[heroSlideIndex].id}` : "/trending"}
                                        className="group flex items-center gap-3 no-underline py-1"
                                    >
                                        <div className="w-12 h-16 shrink-0 aspect-[2/3] rounded-lg overflow-hidden border border-border shadow-md bg-surface-2">
                                            <img
                                                src={trendingToday[heroSlideIndex]?.poster || trendingToday[heroSlideIndex]?.backdrop || movieImage}
                                                alt={trendingToday[heroSlideIndex]?.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1.5">
                                                <h4 className="text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">
                                                    {trendingToday[heroSlideIndex]?.title}
                                                </h4>
                                                <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                                                    ★ {trendingToday[heroSlideIndex]?.rating}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-text-3 truncate mt-0.5">
                                                {trendingToday[heroSlideIndex]?.genre} · {trendingToday[heroSlideIndex]?.year}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Controls & Indicator Dots */}
                                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                                        <div className="flex items-center gap-1">
                                            {trendingToday.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setHeroSlideIndex(idx)}
                                                    aria-label={`Slide ${idx + 1}`}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                        idx === heroSlideIndex
                                                            ? "w-5 bg-accent"
                                                            : "w-1.5 bg-border hover:bg-text-3"
                                                    }`}
                                                />
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setHeroSlideIndex((prev) => (prev - 1 + trendingToday.length) % trendingToday.length)}
                                                className="h-6 w-6 rounded-lg flex items-center justify-center text-xs text-text-3 hover:text-text hover:bg-surface-2 transition-all"
                                                title="Previous film"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHeroSlideIndex((prev) => (prev + 1) % trendingToday.length)}
                                                className="h-6 w-6 rounded-lg flex items-center justify-center text-xs text-text-3 hover:text-text hover:bg-surface-2 transition-all"
                                                title="Next film"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── 2. TRENDING TODAY ── */}
                <section className="page-container">
                    <div className="section-header">
                        <div>
                            <p className="label-caps mb-1">Right Now</p>
                            <h2 className="section-title">Trending Today</h2>
                        </div>
                        <Link to="/trending" className="section-link">
                            See all <Icon className="text-sm">arrow_forward</Icon>
                        </Link>
                    </div>
                    {loading && !trendingToday.length
                        ? renderSkeletonRow(5)
                        : (
                            <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                                {trendingToday.map(renderMovieCard)}
                            </div>
                        )
                    }
                </section>

                {/* ── 3. POPULAR THIS WEEK ── */}
                <section className="page-container">
                    <div className="section-header">
                        <div>
                            <p className="label-caps mb-1">This Week</p>
                            <h2 className="section-title">Popular Films</h2>
                        </div>
                        <Link to="/movies" className="section-link">
                            Explore <Icon className="text-sm">arrow_forward</Icon>
                        </Link>
                    </div>
                    {loading && !popularThisWeek.length
                        ? renderSkeletonRow(5)
                        : (
                            <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                                {popularThisWeek.map(renderMovieCard)}
                            </div>
                        )
                    }
                </section>

                {/* ── 4. MOOD SELECTOR ── */}
                <section className="page-container">
                    <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 md:p-10">
                        <div className="mb-8 text-center">
                            <p className="label-caps mb-2">Browse by Genre</p>
                            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-text tracking-tight">
                                What Are You in the Mood For?
                            </h2>
                            <p className="mt-2 text-sm text-text-3">
                                Select a genre to discover top-rated films
                            </p>
                        </div>

                        {/* Genre pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-8">
                            {MOOD_GENRES.map((genre) => {
                                const isActive = selectedMood.id === genre.id;
                                return (
                                    <button
                                        key={genre.id}
                                        type="button"
                                        onClick={() => setSelectedMood(genre)}
                                        className={`cursor-pointer rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                                            isActive
                                                ? "bg-accent text-bg shadow-[0_4px_16px_rgba(201,168,106,0.35)]"
                                                : "border border-border text-text-2 hover:border-accent/50 hover:text-accent"
                                        }`}
                                    >
                                        {genre.label}
                                    </button>
                                );
                            })}
                        </div>

                        {moodLoading
                            ? renderSkeletonRow(5)
                            : (
                                <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                                    {moodMovies.map(renderMovieCard)}
                                </div>
                            )
                        }

                        <div className="mt-8 flex justify-center">
                            <Link to="/genres" className="btn-secondary text-xs py-2.5 px-6">
                                Browse all {selectedMood.name} films
                                <Icon className="text-sm">arrow_forward</Icon>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── 5. SPOTLIGHT ── */}
                {spotlightMovie && (
                    <section className="page-container">
                        <div className="mb-6 text-center">
                            <p className="label-caps mb-2">Featured Recommendation</p>
                            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-text tracking-tight">
                                Film Spotlight
                            </h2>
                        </div>

                        <div className="relative min-h-[360px] sm:min-h-[440px] md:min-h-[500px] w-full overflow-hidden rounded-xl border border-border bg-surface shadow-elevated film-grain">
                            {spotlightMovie.backdrop && (
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${spotlightMovie.backdrop}')` }}
                                />
                            )}
                            <div className="absolute inset-0 hero-gradient" />
                            <div className="absolute inset-0 hero-gradient-side" />

                            <div className="relative z-10 flex min-h-[360px] sm:min-h-[440px] md:min-h-[500px] flex-col justify-end p-6 sm:p-10 md:p-12 max-w-3xl">
                                <div className="mb-3 flex items-center gap-3">
                                    <span className="badge badge-accent">Spotlight</span>
                                    <span className="text-xs text-text-3">{spotlightMovie.genre}</span>
                                </div>

                                <h3 className="mb-3 font-serif text-2xl sm:text-4xl md:text-5xl font-semibold text-text tracking-tight leading-tight break-words">
                                    {spotlightMovie.title}
                                </h3>

                                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-text-2">
                                    <span className="text-accent font-semibold">★ {spotlightMovie.rating}</span>
                                    <span className="text-border">·</span>
                                    <span>{spotlightDetails?.release_date ? getYear(spotlightDetails.release_date) : spotlightMovie.year}</span>
                                    <span className="text-border">·</span>
                                    <span>{formatRuntime(spotlightDetails?.runtime)}</span>
                                </div>

                                {spotlightMovie.overview && (
                                    <p className="mb-6 line-clamp-3 text-sm md:text-base text-text-2 leading-relaxed max-w-2xl">
                                        {spotlightMovie.overview}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={() => navigate(`/movies/${spotlightMovie.id}`)}
                                    className="btn-primary text-sm w-fit"
                                >
                                    <Icon className="text-base">info</Icon>
                                    View Film
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── 6. NEW RELEASES ── */}
                <section className="page-container">
                    <div className="section-header">
                        <div>
                            <p className="label-caps mb-1">Fresh From Production</p>
                            <h2 className="section-title">New Releases</h2>
                        </div>
                        <Link to="/movies" className="section-link">
                            View all <Icon className="text-sm">arrow_forward</Icon>
                        </Link>
                    </div>
                    {loading && !newReleases.length
                        ? renderSkeletonRow(4)
                        : (
                            <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                                {newReleases.map(renderMovieCard)}
                            </div>
                        )
                    }
                </section>

                {/* ── 7. COMMUNITY REVIEWS ── */}
                <section className="page-container">
                    <div className="mb-8 text-center">
                        <p className="label-caps mb-2">Perspectives & Critique</p>
                        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-text tracking-tight">
                            Community Reviews
                        </h2>
                        <p className="mt-2 text-sm text-text-3">
                            Honest commentary from passionate cinephiles
                        </p>
                    </div>

                    <div className="card-grid-fluid gap-4 sm:gap-5">
                        {displayReviews.map((review) => (
                            <div
                                key={review.id}
                                onClick={() => review.movieId && navigate(`/movies/${review.movieId}`)}
                                className="mc-card group flex flex-col justify-between p-5 cursor-pointer"
                            >
                                <div>
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {review.avatar ? (
                                                <img
                                                    src={review.avatar}
                                                    alt={review.author}
                                                    className="h-9 w-9 rounded-full object-cover border border-border"
                                                />
                                            ) : (
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent border border-accent/20">
                                                    {review.author?.substring(0, 2).toUpperCase() || "CP"}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                                                    {review.author}
                                                </div>
                                                <div className="text-[11px] text-text-3">
                                                    Reviewing{" "}
                                                    <span className="font-medium text-text-2">{review.movieTitle}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="badge badge-accent text-[11px]">
                                            ★ {review.rating}
                                        </div>
                                    </div>

                                    <p className="text-sm italic leading-relaxed text-text-2">
                                        "{review.content}"
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-text-3">
                                    <span className="flex items-center gap-1">
                                        <Icon className="text-[14px] text-accent">thumb_up</Icon>
                                        {review.likes ?? "—"} helpful
                                    </span>
                                    <span className="font-medium">{review.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 8. CURATED LISTS ── */}
                <section className="page-container">
                    <div className="mb-8 text-center">
                        <p className="label-caps mb-2">Handcrafted Collections</p>
                        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-text tracking-tight">
                            Curated Lists
                        </h2>
                        <p className="mt-2 text-sm text-text-3">
                            Thematic marathons and essential film collections
                        </p>
                    </div>

                    <div className="card-grid-fluid gap-4 sm:gap-6">
                        {popularLists.map((list) => (
                            <div
                                key={list.id}
                                onClick={() => navigate("/genres")}
                                className="mc-card group flex flex-col justify-between p-5 cursor-pointer"
                            >
                                <div>
                                    {/* Poster collage */}
                                    <div className="mb-5 flex items-center justify-center -space-x-5 overflow-hidden py-2">
                                        {list.posters?.length > 0 ? (
                                            list.posters.map((poster, idx) => (
                                                <img
                                                    key={idx}
                                                    src={poster}
                                                    alt="List poster"
                                                    className={`h-24 w-16 rounded-md object-cover border-2 border-surface shadow-md transition-transform duration-300 group-hover:scale-105 ${
                                                        idx === 1 ? "z-10 -translate-y-2 scale-[1.08]" : "opacity-75"
                                                    }`}
                                                />
                                            ))
                                        ) : (
                                            <div className="h-24 w-48 rounded-md bg-surface-2 flex items-center justify-center text-xs text-text-3">
                                                Curated Films
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="mb-2 text-sm font-semibold text-text transition-colors group-hover:text-accent leading-snug">
                                        {list.title}
                                    </h3>
                                    <p className="text-xs text-text-3 line-clamp-2 leading-relaxed">
                                        {list.description}
                                    </p>
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-[11px] text-text-3">
                                    <span>{list.filmsCount} films · {list.likes} likes</span>
                                    <span className="text-accent font-semibold tracking-wider">
                                        Explore →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 9. JOIN CTA ── */}
                <section className="page-container pb-8">
                    <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-surface p-8 sm:p-12 md:p-16 text-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,106,0.07)_0%,transparent_70%)]" />

                        <div className="relative z-10 mx-auto max-w-lg">
                            <p className="label-caps mb-4">Join the Community</p>
                            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-text tracking-tight mb-6">
                                Begin Your Film Journal
                            </h2>

                            <div className="mb-8 space-y-1.5 text-sm text-text-2 leading-relaxed">
                                <p>Rate and log every film you watch.</p>
                                <p>Write reviews and share your perspective.</p>
                                <p>Find people who share your taste.</p>
                            </div>

                            {token ? (
                                <Link to="/movies" className="btn-primary px-10 py-3.5 text-sm">
                                    Discover Films
                                </Link>
                            ) : (
                                <Link to="/register" className="btn-primary px-10 py-3.5 text-sm">
                                    Create Free Account
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Landing;
