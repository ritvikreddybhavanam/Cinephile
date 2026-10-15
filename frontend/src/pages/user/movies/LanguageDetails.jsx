import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import Icon from "../../../components/common/Icon";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import movieImage from "../../../assets/images/image1.png";
import {
    getMovies,
    getMovieDetails,
    getMovieReviews,
    getGenres,
    getPosterUrl,
    getBackdropUrl,
    getLanguages
} from "../../../services/movieService";

// Mood genres
const MOOD_GENRES = [
    { id: 28,  label: "Action",   name: "Action" },
    { id: 18,  label: "Drama",    name: "Drama" },
    { id: 53,  label: "Thriller", name: "Thriller" },
    { id: 35,  label: "Comedy",   name: "Comedy" },
    { id: 80,  label: "Crime",    name: "Crime" },
    { id: 878, label: "Sci-Fi",   name: "Science Fiction" },
    { id: 27,  label: "Horror",   name: "Horror" },
    { id: 10749, label: "Romance", name: "Romance" }
];

const LANGUAGE_META = {
    te: { name: "Telugu", industry: "Tollywood", region: "Indian" },
    hi: { name: "Hindi", industry: "Bollywood", region: "Indian" },
    en: { name: "English", industry: "Hollywood & Global", region: "International" },
    ta: { name: "Tamil", industry: "Kollywood", region: "Indian" },
    ml: { name: "Malayalam", industry: "Mollywood", region: "Indian" },
    kn: { name: "Kannada", industry: "Sandalwood", region: "Indian" },
    ja: { name: "Japanese", industry: "Nihon Eiga", region: "Asian" },
    ko: { name: "Korean", industry: "K-Cinema", region: "Asian" },
    fr: { name: "French", industry: "Cinéma Français", region: "European" },
    es: { name: "Spanish", industry: "Cine Español", region: "European" },
    it: { name: "Italian", industry: "Cinema Italiano", region: "European" },
    de: { name: "German", industry: "Deutscher Film", region: "European" },
    zh: { name: "Chinese", industry: "Mandarin Cinema", region: "Asian" },
    cn: { name: "Cantonese", industry: "Hong Kong Cinema", region: "Asian" },
    bn: { name: "Bengali", industry: "Bengali Cinema", region: "Indian" },
    ru: { name: "Russian", industry: "Russian Cinema", region: "European" },
    sv: { name: "Swedish", industry: "Swedish Cinema", region: "European" },
    da: { name: "Danish", industry: "Danish Cinema", region: "European" },
    pl: { name: "Polish", industry: "Polish Cinema", region: "European" },
    pt: { name: "Portuguese", industry: "Portuguese Cinema", region: "European" },
    tr: { name: "Turkish", industry: "Turkish Cinema", region: "Middle Eastern" },
    fa: { name: "Persian", industry: "Iranian Cinema", region: "Middle Eastern" },
    ar: { name: "Arabic", industry: "Arab Cinema", region: "Middle Eastern" },
    no: { name: "Norwegian", industry: "Norwegian Cinema", region: "European" },
    nl: { name: "Dutch", industry: "Dutch Cinema", region: "European" },
    id: { name: "Indonesian", industry: "Indonesian Cinema", region: "Asian" },
    th: { name: "Thai", industry: "Thai Cinema", region: "Asian" },
    mr: { name: "Marathi", industry: "Marathi Cinema", region: "Indian" },
    pa: { name: "Punjabi", industry: "Pollywood", region: "Indian" }
};

const LanguageDetails = () => {
    const { languageCode = "en" } = useParams();
    const navigate = useNavigate();
    const langCode = languageCode.toLowerCase();

    const [languageInfo, setLanguageInfo] = useState(() => {
        const meta = LANGUAGE_META[langCode];
        return {
            name: meta?.name || langCode.toUpperCase(),
            industry: meta?.industry || "Cinema",
            region: meta?.region || "World"
        };
    });

    useDocumentTitle(`${languageInfo.name} Cinema`);

    const [genreMap, setGenreMap] = useState({});
    const [trendingToday, setTrendingToday] = useState([]);
    const [popularThisWeek, setPopularThisWeek] = useState([]);
    const [selectedMood, setSelectedMood] = useState(MOOD_GENRES[0]);
    const [moodMovies, setMoodMovies] = useState([]);
    const [moodLoading, setMoodLoading] = useState(false);
    const [spotlightMovie, setSpotlightMovie] = useState(null);
    const [spotlightDetails, setSpotlightDetails] = useState(null);
    const [newReleases, setNewReleases] = useState([]);
    const [communityReviews, setCommunityReviews] = useState([]);
    const [curatedLists, setCuratedLists] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatRuntime = (mins) => {
        if (!mins) return "2h 15m";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const getYear = (dateStr) => {
        if (!dateStr) return new Date().getFullYear().toString();
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
            genre: genreNames || `${languageInfo.name} Cinema`,
            overview: movie.overview || "No overview available."
        };
    };

    // 1. Resolve Language Name from TMDB languages list
    useEffect(() => {
        const resolveLanguage = async () => {
            try {
                const list = await getLanguages();
                if (Array.isArray(list)) {
                    const match = list.find((l) => l.iso_639_1?.toLowerCase() === langCode);
                    if (match && match.english_name) {
                        const meta = LANGUAGE_META[langCode];
                        setLanguageInfo({
                            name: meta?.name || match.english_name,
                            industry: meta?.industry || "Cinema",
                            region: meta?.region || "World"
                        });
                    }
                }
            } catch (err) {
                console.warn("Could not fetch language list:", err);
            }
        };
        resolveLanguage();
    }, [langCode]);

    // 2. Fetch primary language sections
    useEffect(() => {
        let isMounted = true;

        const initLanguageData = async () => {
            try {
                setLoading(true);

                // Genres Map
                let gMap = {};
                try {
                    const gData = await getGenres();
                    const gList = Array.isArray(gData) ? gData : gData?.genres || [];
                    gList.forEach((g) => { gMap[g.id] = g.name; });
                    if (isMounted) setGenreMap(gMap);
                } catch (e) {
                    console.warn("Could not fetch genres:", e);
                }

                // A. Trending Today (scoped to language)
                let trendingMoviesList = [];
                try {
                    const trendingRes = await getMovies({
                        language: langCode,
                        sortBy: "popularity.desc",
                        page: 1
                    });
                    const list = Array.isArray(trendingRes) ? trendingRes : trendingRes?.results || [];
                    trendingMoviesList = list;
                    if (isMounted) {
                        setTrendingToday(list.slice(0, 5).map((m) => formatMovie(m, gMap)));
                    }

                    // Spotlight Movie (top trending)
                    if (list.length > 0) {
                        const topMovie = list[0];
                        if (isMounted) {
                            setSpotlightMovie(formatMovie(topMovie, gMap));
                        }

                        // Fetch detailed runtime & overview
                        try {
                            const details = await getMovieDetails(topMovie.id);
                            if (isMounted) setSpotlightDetails(details);
                        } catch {}

                        // Fetch community reviews for top movie
                        try {
                            const revRes = await getMovieReviews(topMovie.id);
                            const revList = revRes?.results || [];
                            if (isMounted && revList.length > 0) {
                                setCommunityReviews(revList.slice(0, 3).map((r, index) => ({
                                    id: r.id || index,
                                    author: r.author || "Cinephile Member",
                                    movieTitle: topMovie.title || topMovie.original_title,
                                    movieId: topMovie.id,
                                    rating: r.author_details?.rating
                                        ? Number(r.author_details.rating).toFixed(1)
                                        : "8.5",
                                    content: r.content?.length > 220
                                        ? r.content.slice(0, 220) + "…"
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
                    console.error("Failed to load trending language movies:", e);
                }

                // B. Popular Films (This Week / Acclaimed)
                try {
                    const popularRes = await getMovies({
                        language: langCode,
                        sortBy: "vote_count.desc",
                        page: 1
                    });
                    const popularList = Array.isArray(popularRes) ? popularRes : popularRes?.results || [];
                    if (isMounted) {
                        setPopularThisWeek(popularList.slice(0, 5).map((m) => formatMovie(m, gMap)));
                    }
                } catch (e) {
                    console.error("Failed to load popular language movies:", e);
                }

                // C. New Releases
                try {
                    const currentYear = new Date().getFullYear().toString();
                    let newRes = await getMovies({
                        language: langCode,
                        year: currentYear,
                        sortBy: "popularity.desc",
                        page: 1
                    });
                    let newList = Array.isArray(newRes) ? newRes : newRes?.results || [];
                    if (newList.length < 4) {
                        const prevYear = (new Date().getFullYear() - 1).toString();
                        const fallbackRes = await getMovies({
                            language: langCode,
                            year: prevYear,
                            sortBy: "popularity.desc",
                            page: 1
                        });
                        const fallbackList = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes?.results || [];
                        newList = [...newList, ...fallbackList];
                    }
                    if (isMounted) {
                        setNewReleases(newList.slice(0, 4).map((m) => formatMovie(m, gMap)));
                    }
                } catch (e) {
                    console.error("Failed to load new releases:", e);
                }

                // D. Curated Lists with real language posters
                try {
                    const [dramaRes, thrillerRes, actionRes] = await Promise.all([
                        getMovies({ language: langCode, genre: 18, sortBy: "popularity.desc", page: 1 }),
                        getMovies({ language: langCode, genre: 53, sortBy: "popularity.desc", page: 1 }),
                        getMovies({ language: langCode, genre: 28, sortBy: "vote_average.desc", page: 1 })
                    ]);

                    const extractPosters = (res, fallbackList) => {
                        const primary = (res?.results || [])
                            .filter((m) => m.poster_path)
                            .slice(0, 3)
                            .map((m) => getPosterUrl(m.poster_path));
                        if (primary.length >= 3) return primary;

                        // Fallback posters from general trending
                        const additional = (fallbackList || [])
                            .filter((m) => m.poster_path)
                            .map((m) => getPosterUrl(m.poster_path));
                        return [...new Set([...primary, ...additional])].slice(0, 3);
                    };

                    const langName = LANGUAGE_META[langCode]?.name || langCode.toUpperCase();

                    if (isMounted) {
                        setCuratedLists([
                            {
                                id: "curated-1",
                                title: `${langName} Masterpieces & Definitive Classics`,
                                description: `Essential landmarks, award-winning narratives, and pivotal cinematic achievements in ${langName}.`,
                                filmsCount: 38,
                                likes: "2.4k",
                                curator: "Julian Thorne",
                                genreId: 18,
                                posters: extractPosters(dramaRes, trendingMoviesList)
                            },
                            {
                                id: "curated-2",
                                title: `High-Tension ${langName} Thrillers & Mystery`,
                                description: `Pulse-pounding suspense, gritty neo-noirs, and edge-of-the-seat writing that defines modern ${langName} cinema.`,
                                filmsCount: 26,
                                likes: "1.9k",
                                curator: "Maya Lin",
                                genreId: 53,
                                posters: extractPosters(thrillerRes, trendingMoviesList)
                            },
                            {
                                id: "curated-3",
                                title: `Blockbuster spectacles & Legendary Sagas`,
                                description: `Larger-than-life scale, iconic performances, and cultural sensations that conquered global screens.`,
                                filmsCount: 32,
                                likes: "3.1k",
                                curator: "David K.",
                                genreId: 28,
                                posters: extractPosters(actionRes, trendingMoviesList)
                            }
                        ]);
                    }
                } catch (e) {
                    console.warn("Could not generate curated lists:", e);
                }

            } catch (err) {
                console.error("LanguageDetails initialization error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initLanguageData();

        return () => {
            isMounted = false;
        };
    }, [langCode]);

    // 3. Load mood movies when selected mood changes
    useEffect(() => {
        let isMounted = true;
        const loadMoodMovies = async () => {
            if (!selectedMood) return;
            try {
                setMoodLoading(true);
                const res = await getMovies({
                    language: langCode,
                    genre: selectedMood.id,
                    sortBy: "popularity.desc",
                    page: 1
                });
                const list = Array.isArray(res) ? res : res?.results || [];
                if (isMounted) {
                    setMoodMovies(list.slice(0, 5).map((m) => formatMovie(m)));
                }
            } catch (err) {
                console.error("Failed to load mood movies:", err);
            } finally {
                if (isMounted) setMoodLoading(false);
            }
        };
        loadMoodMovies();
        return () => { isMounted = false; };
    }, [selectedMood, langCode]);

    // Fallback reviews tailored to that specific language's top titles
    const displayReviews = communityReviews.length > 0 ? communityReviews : [
        {
            id: 1,
            author: "Julian Thorne",
            movieTitle: spotlightMovie?.title || `${languageInfo.name} Feature`,
            movieId: spotlightMovie?.id,
            rating: "9.5",
            content: "A masterclass in tension, sound design, and emotional resonance. The direction keeps you locked in from the opening frame.",
            time: "2 days ago",
            likes: "42"
        },
        {
            id: 2,
            author: "Maya Lin",
            movieTitle: trendingToday[1]?.title || popularThisWeek[0]?.title || `${languageInfo.name} Classic`,
            movieId: trendingToday[1]?.id || popularThisWeek[0]?.id,
            rating: "9.0",
            content: "Breathtaking cinematography and a nuanced script that honours its genre while innovating in every subtle way.",
            time: "Yesterday",
            likes: "38"
        },
        {
            id: 3,
            author: "David K.",
            movieTitle: popularThisWeek[0]?.title || trendingToday[0]?.title || `${languageInfo.name} Cinema`,
            movieId: popularThisWeek[0]?.id || trendingToday[0]?.id,
            rating: "8.8",
            content: "Grand scale filmmaking at its absolute peak. You feel the weight of every choice and the world building is unmatched.",
            time: "4 days ago",
            likes: "29"
        }
    ];

    /* ── Movie Card ── */
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

                {/* Rating Badge */}
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
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${count === 4 ? "md:grid-cols-4" : "md:grid-cols-4 lg:grid-cols-5"} gap-3 sm:gap-4 md:gap-5`}>
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

                {/* ── 1. HERO ── */}
                <section className="relative flex min-h-[520px] w-full items-end pb-12 sm:min-h-[600px] sm:pb-16 lg:min-h-[680px] film-grain">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={spotlightMovie?.backdrop || movieImage}
                            alt={`${languageInfo.name} cinema backdrop`}
                            className="h-full w-full object-cover opacity-55 transition-opacity duration-700"
                        />
                        <div className="absolute inset-0 hero-gradient" />
                        <div className="absolute inset-0 hero-gradient-side" />
                    </div>

                    <div className="relative z-10 page-container">
                        {/* Breadcrumbs */}
                        <div className="mb-4 flex items-center gap-2 text-xs text-text-3 font-medium">
                            <Link to="/movies" className="hover:text-accent transition-colors">Movies</Link>
                            <span>/</span>
                            <Link to="/movies-by-languages" className="hover:text-accent transition-colors">Cinema by Language</Link>
                            <span>/</span>
                            <span className="text-accent">{languageInfo.name}</span>
                        </div>

                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="label-caps">{languageInfo.industry}</span>
                                <span className="text-border">·</span>
                                <span className="badge badge-accent uppercase tracking-wider text-[10px]">
                                    {langCode}
                                </span>
                            </div>

                            <h1 className="mb-4 font-serif text-fluid-hero font-semibold text-text break-words">
                                Discover, Log &<br />
                                <span className="text-accent">Curate {languageInfo.name} Cinema.</span>
                            </h1>

                            <p className="mb-8 text-sm sm:text-base lg:text-lg text-text-2 leading-relaxed max-w-xl">
                                Explore the masterworks, iconic directors, and defining stories of {languageInfo.name} cinema.
                                From critically acclaimed classics to brand new releases.
                            </p>

                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                <Link
                                    to={`/movies?language=${langCode}`}
                                    className="btn-primary text-sm py-3 px-8"
                                >
                                    Discover All {languageInfo.name} Films
                                </Link>
                                <Link
                                    to="/movies-by-languages"
                                    className="btn-secondary text-sm py-3 px-8"
                                >
                                    Browse All Languages
                                </Link>
                            </div>
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
                        <Link
                            to={`/movies?language=${langCode}&sortBy=popularity.desc`}
                            className="section-link"
                        >
                            See all <Icon className="text-sm">arrow_forward</Icon>
                        </Link>
                    </div>
                    {loading && !trendingToday.length
                        ? renderSkeletonRow(5)
                        : trendingToday.length > 0 ? (
                            <div className="movie-grid-fluid">
                                {trendingToday.map(renderMovieCard)}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-3">
                                No trending films found for {languageInfo.name} right now.
                            </div>
                        )
                    }
                </section>

                {/* ── 3. THIS WEEK POPULAR FILMS ── */}
                <section className="page-container">
                    <div className="section-header">
                        <div>
                            <p className="label-caps mb-1">This Week</p>
                            <h2 className="section-title">Popular Films</h2>
                        </div>
                        <Link
                            to={`/movies?language=${langCode}&sortBy=vote_count.desc`}
                            className="section-link"
                        >
                            Explore <Icon className="text-sm">arrow_forward</Icon>
                        </Link>
                    </div>
                    {loading && !popularThisWeek.length
                        ? renderSkeletonRow(5)
                        : popularThisWeek.length > 0 ? (
                            <div className="movie-grid-fluid">
                                {popularThisWeek.map(renderMovieCard)}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-3">
                                No popular films available for this selection.
                            </div>
                        )
                    }
                </section>

                {/* ── 4. BROWSE BY GENRE (WHAT ARE YOU IN THE MOOD FOR?) ── */}
                <section className="page-container">
                    <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 md:p-10">
                        <div className="mb-8 text-center">
                            <p className="label-caps mb-2">Browse by Genre</p>
                            <h2 className="font-serif text-fluid-title font-semibold text-text tracking-tight">
                                What Are You in the Mood For?
                            </h2>
                            <p className="mt-2 text-sm text-text-3">
                                Select a genre to discover top-rated films in {languageInfo.name}
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
                            : moodMovies.length > 0 ? (
                                <div className="movie-grid-fluid">
                                    {moodMovies.map(renderMovieCard)}
                                </div>
                            ) : (
                                <div className="py-10 text-center text-text-3 text-sm">
                                    No {selectedMood.name} films currently listed in {languageInfo.name}.
                                </div>
                            )
                        }

                        <div className="mt-8 flex justify-center">
                            <Link
                                to={`/movies?language=${langCode}&genre=${selectedMood.id}`}
                                className="btn-secondary text-xs py-2.5 px-6"
                            >
                                Browse all {selectedMood.name} {languageInfo.name} films
                                <Icon className="text-sm">arrow_forward</Icon>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── 5. FEATURED RECOMMENDATION / FILM SPOTLIGHT ── */}
                {spotlightMovie && (
                    <section className="page-container">
                        <div className="mb-6 text-center">
                            <p className="label-caps mb-2">Featured Recommendation</p>
                            <h2 className="font-serif text-fluid-title font-semibold text-text tracking-tight">
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

                {/* ── 6. FRESH FROM PRODUCTION / NEW RELEASES ── */}
                <section className="page-container">
                    <div className="section-header">
                        <div>
                            <p className="label-caps mb-1">Fresh From Production</p>
                            <h2 className="section-title">New Releases</h2>
                        </div>
                        <Link
                            to={`/movies?language=${langCode}&year=${new Date().getFullYear()}`}
                            className="section-link"
                        >
                            View all <Icon className="text-sm">arrow_forward</Icon>
                        </Link>
                    </div>
                    {loading && !newReleases.length
                        ? renderSkeletonRow(4)
                        : newReleases.length > 0 ? (
                            <div className="movie-grid-fluid">
                                {newReleases.map(renderMovieCard)}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-3">
                                No recent releases found for {languageInfo.name}.
                            </div>
                        )
                    }
                </section>

                {/* ── 7. PERSPECTIVES & CRITIQUE / COMMUNITY REVIEWS ── */}
                <section className="page-container">
                    <div className="mb-8 text-center">
                        <p className="label-caps mb-2">Perspectives & Critique</p>
                        <h2 className="font-serif text-fluid-title font-semibold text-text tracking-tight">
                            Community Reviews
                        </h2>
                        <p className="mt-2 text-sm text-text-3">
                            Honest commentary from passionate cinephiles
                        </p>
                    </div>

                    <div className="card-grid-fluid">
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

                {/* ── 8. HANDCRAFTED COLLECTIONS / CURATED LISTS ── */}
                <section className="page-container">
                    <div className="mb-8 text-center">
                        <p className="label-caps mb-2">Handcrafted Collections</p>
                        <h2 className="font-serif text-fluid-title font-semibold text-text tracking-tight">
                            Curated Lists
                        </h2>
                        <p className="mt-2 text-sm text-text-3">
                            Thematic marathons and essential film collections
                        </p>
                    </div>

                    <div className="card-grid-fluid">
                        {curatedLists.map((list) => (
                            <div
                                key={list.id}
                                onClick={() => navigate(`/movies?language=${langCode}&genre=${list.genreId}`)}
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

                {/* ── 9. EXPLORE MORE LANGUAGES CTA ── */}
                <section className="page-container pb-8">
                    <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-surface p-8 sm:p-12 md:p-16 text-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,106,0.07)_0%,transparent_70%)]" />

                        <div className="relative z-10 mx-auto max-w-lg">
                            <p className="label-caps mb-4">World Film Archive</p>
                            <h2 className="font-serif text-fluid-title font-semibold text-text tracking-tight mb-6">
                                Explore Beyond {languageInfo.name} Cinema
                            </h2>

                            <div className="mb-8 space-y-1.5 text-sm text-text-2 leading-relaxed">
                                <p>Discover international cinema across 40+ languages.</p>
                                <p>Compare masterpieces, directors, and cultural movements.</p>
                                <p>Build your multilingual cinema journal.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to={`/movies?language=${langCode}`}
                                    className="btn-primary px-8 py-3.5 text-sm w-full sm:w-auto"
                                >
                                    All {languageInfo.name} Movies
                                </Link>
                                <Link
                                    to="/movies-by-languages"
                                    className="btn-secondary px-8 py-3.5 text-sm w-full sm:w-auto"
                                >
                                    Browse All Languages
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LanguageDetails;
