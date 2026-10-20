import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import TrailerModal from "../../components/dashboard/TrailerModal";

// Reusable Section Components
import HeroSlideshow from "../../components/landing/HeroSlideshow";
import NowShowingSection from "../../components/landing/NowShowingSection";
import TrendingSection from "../../components/landing/TrendingSection";
import FreshOnOttSection from "../../components/landing/FreshOnOttSection";
import PopularThisWeekSection from "../../components/landing/PopularThisWeekSection";
import DiscoverMoodGenreSection from "../../components/landing/DiscoverMoodGenreSection";
import CriticallyAcclaimedSection from "../../components/landing/CriticallyAcclaimedSection";
import HiddenGemsSection from "../../components/landing/HiddenGemsSection";
import EditorialSpotlightSection from "../../components/landing/EditorialSpotlightSection";
import RecentReleasesSection from "../../components/landing/RecentReleasesSection";
import PersonalDiscoveryWidget from "../../components/landing/PersonalDiscoveryWidget";
import CommunityReviewsSection from "../../components/landing/CommunityReviewsSection";
import CuratedListsSection from "../../components/landing/CuratedListsSection";
import JoinCommunityCta from "../../components/landing/JoinCommunityCta";

// Services
import {
    getTrendingMovies,
    getPopularMovies,
    getMovies,
    getMovieDetails,
    getMovieVideos,
    getMovieWatchProviders,
    getGenres,
    getPosterUrl
} from "../../services/movieService";
import { getPublicLists } from "../../services/listService";
import { addToWatchlist, removeFromWatchlist, checkWatchlist } from "../../services/watchlistService";
import api from "../../services/api";

// Anti-Duplication Orchestrator
import {
    DEFAULT_GENRES,
    formatMovie,
    orchestrateLandingData
} from "../../utils/landingOrchestrator";

// Fallback high-fidelity cinema data in case of complete network outage
const HIGH_QUALITY_FALLBACKS = [
    {
        id: 157336,
        title: "Interstellar",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
        vote_average: 8.6,
        vote_count: 36000,
        release_date: "2014-11-05",
        genre_ids: [12, 18, 878],
        overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
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
        overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating subconscious minds, is offered a chance to erase his criminal past."
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
        overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and Harvey Dent to dismantle the criminal underworld."
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
        overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while seeking vengeance against the conspirators."
    },
    {
        id: 496243,
        title: "Parasite",
        poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        backdrop_path: "/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg",
        vote_average: 8.5,
        vote_count: 18000,
        release_date: "2019-05-30",
        genre_ids: [35, 53, 18],
        original_language: "ko",
        overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy Parks for their livelihood until they get entangled in an unexpected incident."
    },
    {
        id: 129,
        title: "Spirited Away",
        poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
        backdrop_path: "/mSDsSDwaP3E7dEfUPWy4J0djt4O.jpg",
        vote_average: 8.5,
        vote_count: 16000,
        release_date: "2001-07-20",
        genre_ids: [16, 10751, 14],
        original_language: "ja",
        overview: "A young girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts."
    },
    {
        id: 122,
        title: "The Lord of the Rings: The Return of the King",
        poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
        backdrop_path: "/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
        vote_average: 8.5,
        vote_count: 24000,
        release_date: "2003-12-01",
        genre_ids: [12, 14, 28],
        overview: "As armies mass for a final battle that will decide the fate of the world, one member of the fellowship of the ring is revealed as the noble heir to the throne."
    },
    {
        id: 597,
        title: "Titanic",
        poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
        backdrop_path: "/6VmF21PtOysICww7shNEiyapYCB.jpg",
        vote_average: 7.9,
        vote_count: 24000,
        release_date: "1997-11-18",
        genre_ids: [18, 10749],
        overview: "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later."
    }
];

export default function Landing() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    // Core Data States
    const [genreMap, setGenreMap] = useState(DEFAULT_GENRES);
    const [loading, setLoading] = useState(true);

    // Orchestrated Sections Data (Zero Duplicates Across Prominent Sections)
    const [heroMovies, setHeroMovies] = useState([]);
    const [nowShowingMovies, setNowShowingMovies] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [streamingMovies, setStreamingMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [acclaimedMovies, setAcclaimedMovies] = useState([]);
    const [hiddenGemsMovies, setHiddenGemsMovies] = useState([]);
    const [spotlightMovie, setSpotlightMovie] = useState(null);
    const [recentReleases, setRecentReleases] = useState([]);

    // Community Content
    const [communityReviews, setCommunityReviews] = useState([]);
    const [curatedLists, setCuratedLists] = useState([]);

    // Metadata & Enriched Provider / Runtime Maps
    const [streamingRegion, setStreamingRegion] = useState("US");
    const [providerMap, setProviderMap] = useState({});
    const [runtimeMap, setRuntimeMap] = useState({});

    // Watchlist States for Hero / Spotlight
    const [watchlistMap, setWatchlistMap] = useState({});
    const [watchlistUpdating, setWatchlistUpdating] = useState(false);

    // Trailer Modal State
    const [trailerModalOpen, setTrailerModalOpen] = useState(false);
    const [activeTrailerKey, setActiveTrailerKey] = useState(null);
    const [activeTrailerTitle, setActiveTrailerTitle] = useState("");

    // ─────────────────────────────────────────────────────────────
    // 1. Initial Orchestrated Data Fetching
    // ─────────────────────────────────────────────────────────────
    const fetchLandingData = useCallback(async (region = streamingRegion) => {
        try {
            setLoading(true);

            // Calculate date ranges for Theatrical (last 45 days) & Recent releases
            const now = new Date();
            const todayStr = now.toISOString().slice(0, 10);
            const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10);
            const currentYearStr = String(now.getFullYear());

            // 1. Fetch Genres Map
            let gMap = { ...DEFAULT_GENRES };
            try {
                const gRes = await getGenres();
                const gList = Array.isArray(gRes) ? gRes : gRes?.genres || [];
                if (gList.length > 0) {
                    gList.forEach((g) => {
                        gMap[g.id] = g.name;
                    });
                    setGenreMap(gMap);
                }
            } catch (e) {
                console.warn("Could not fetch genres:", e?.message || e);
            }

            // 2. Query Candidate Pools in Parallel with independent fault isolation
            const results = await Promise.allSettled([
                getTrendingMovies(1), // Trending Today
                getMovies({ fromDate: fortyFiveDaysAgo, toDate: todayStr, sortBy: "popularity.desc", page: 1 }), // Now Showing (Theatrical)
                getMovies({ withWatchProviders: "8|119|337|384|350", watchRegion: region, sortBy: "popularity.desc", page: 1 }), // Fresh on OTT (Streaming)
                getPopularMovies(), // Popular Films
                getMovies({ rating: "8.0", sortBy: "popularity.desc", page: 1 }), // Critically Acclaimed (filtered)
                // Diverse Hidden Gems queries (Japanese, Korean, French, Cult)
                Promise.allSettled([
                    getMovies({ rating: "7.7", language: "ja", sortBy: "popularity.desc", page: 1 }),
                    getMovies({ rating: "7.7", language: "ko", sortBy: "popularity.desc", page: 1 }),
                    getMovies({ rating: "7.7", language: "fr", sortBy: "popularity.desc", page: 1 })
                ]),
                getMovies({ year: currentYearStr, sortBy: "popularity.desc", page: 1 }) // Recent Releases
            ]);

            const [
                trendingRes,
                theatricalRes,
                streamingRes,
                popularRes,
                acclaimedRes,
                gemsResGroup,
                recentRes
            ] = results;

            // Extract candidate lists safely
            const extractList = (res) => {
                if (res?.status === "fulfilled" && res.value) {
                    return Array.isArray(res.value)
                        ? res.value
                        : res.value?.results || [];
                }
                return [];
            };

            const trendingRaw = extractList(trendingRes);
            const theatricalRaw = extractList(theatricalRes);
            const streamingRaw = extractList(streamingRes);
            const popularRaw = extractList(popularRes);
            const acclaimedRaw = extractList(acclaimedRes);
            const recentRaw = extractList(recentRes);

            // Assemble hidden gems from diverse international queries
            let gemsRaw = [];
            if (gemsResGroup.status === "fulfilled" && Array.isArray(gemsResGroup.value)) {
                gemsResGroup.value.forEach((subRes) => {
                    gemsRaw = gemsRaw.concat(extractList(subRes));
                });
            }

            // Fallback safety if API was totally unreachable
            const fallbackPool = HIGH_QUALITY_FALLBACKS;

            const formatPool = (list) =>
                (list.length > 0 ? list : fallbackPool).map((m) => formatMovie(m, gMap));

            // 3. Run Anti-Duplication Orchestrator
            const orchestrated = orchestrateLandingData(
                {
                    heroCandidates: formatPool(trendingRaw),
                    spotlightCandidates: formatPool(acclaimedRaw),
                    theatricalCandidates: formatPool(theatricalRaw),
                    trendingCandidates: formatPool(trendingRaw),
                    streamingCandidates: formatPool(streamingRaw),
                    popularCandidates: formatPool(popularRaw),
                    acclaimedCandidates: formatPool(acclaimedRaw),
                    gemsCandidates: formatPool(gemsRaw),
                    recentCandidates: formatPool(recentRaw)
                },
                {
                    heroLimit: 4,
                    theatricalLimit: 5,
                    trendingLimit: 6,
                    streamingLimit: 5,
                    popularLimit: 5,
                    acclaimedLimit: 5,
                    gemsLimit: 5,
                    recentLimit: 4
                }
            );

            // 4. Update Section States with Guaranteed Unique Allocations
            setHeroMovies(orchestrated.heroSlides);
            setSpotlightMovie(orchestrated.spotlight);
            setNowShowingMovies(orchestrated.nowShowing);
            setTrendingMovies(orchestrated.trending);
            setStreamingMovies(orchestrated.streaming);
            setPopularMovies(orchestrated.popular);
            setAcclaimedMovies(orchestrated.acclaimed);
            setHiddenGemsMovies(orchestrated.hiddenGems);
            setRecentReleases(orchestrated.recentReleases);

            // 5. Asynchronously enrich streaming provider logos for the selected region
            if (orchestrated.streaming && orchestrated.streaming.length > 0) {
                const provResults = await Promise.allSettled(
                    orchestrated.streaming.map((m) => getMovieWatchProviders(m.id))
                );
                const pMap = {};
                provResults.forEach((pRes, idx) => {
                    if (pRes.status === "fulfilled" && pRes.value?.results) {
                        const movie = orchestrated.streaming[idx];
                        const regData = pRes.value.results[region] || pRes.value.results["US"];
                        if (regData) {
                            pMap[movie.id] = regData;
                        }
                    }
                });
                setProviderMap(pMap);
            }

            // 6. Asynchronously enrich runtime for Hero & Spotlight
            const featuredIds = [
                ...(orchestrated.heroSlides || []).map((m) => m.id),
                orchestrated.spotlight?.id
            ].filter(Boolean);

            if (featuredIds.length > 0) {
                const detailsResults = await Promise.allSettled(
                    featuredIds.map((id) => getMovieDetails(id))
                );
                const rMap = {};
                detailsResults.forEach((dRes) => {
                    if (dRes.status === "fulfilled" && dRes.value?.id) {
                        rMap[dRes.value.id] = dRes.value.runtime;
                    }
                });
                setRuntimeMap(rMap);
            }

        } catch (err) {
            console.error("Landing page orchestration error:", err);
            // Graceful fallback to guarantee zero crash
            const formattedFallbacks = HIGH_QUALITY_FALLBACKS.map((m) => formatMovie(m));
            setHeroMovies(formattedFallbacks.slice(0, 3));
            setSpotlightMovie(formattedFallbacks[3]);
            setNowShowingMovies(formattedFallbacks.slice(0, 4));
            setTrendingMovies(formattedFallbacks.slice(0, 4));
            setPopularMovies(formattedFallbacks.slice(0, 4));
            setAcclaimedMovies(formattedFallbacks.slice(0, 4));
            setHiddenGemsMovies(formattedFallbacks.slice(4));
            setRecentReleases(formattedFallbacks.slice(0, 3));
        } finally {
            setLoading(false);
        }
    }, [streamingRegion]);

    // ─────────────────────────────────────────────────────────────
    // 2. Fetch Authentic Community Reviews & Curated Lists
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const loadCommunityData = async () => {
            // A. Real Reviews from local database
            try {
                const reviewIds = [1, 2, 3];
                const reviewPromises = reviewIds.map((id) =>
                    api.get(`/reviews/${id}`).catch(() => null)
                );
                const reviewResults = await Promise.allSettled(reviewPromises);
                const authenticReviews = [];

                reviewResults.forEach((res) => {
                    if (res.status === "fulfilled" && res.value?.data && res.value.data.id) {
                        authenticReviews.push(res.value.data);
                    }
                });

                setCommunityReviews(authenticReviews);
            } catch (err) {
                console.warn("Could not load community reviews:", err);
                setCommunityReviews([]);
            }

            // B. Curated Lists
            try {
                let userLists = [];
                try {
                    const publicListsRes = await getPublicLists();
                    if (Array.isArray(publicListsRes) && publicListsRes.length > 0) {
                        userLists = publicListsRes.map((l) => ({
                            id: l.id,
                            title: l.title,
                            description: l.description,
                            filmsCount: l.items?.length || 0,
                            curator: l.user?.username || "Cinephile Member",
                            isUserList: true,
                            posters: (l.items || []).slice(0, 3).map((item) => item.poster).filter(Boolean)
                        }));
                    }
                } catch {}

                if (userLists.length > 0) {
                    setCuratedLists(userLists);
                } else {
                    // Distinct editorial collections backed by real movie posters
                    const [sciFi, crime, drama, anime] = await Promise.allSettled([
                        getMovies({ genre: 878, sortBy: "vote_average.desc", page: 1 }),
                        getMovies({ genre: 80, sortBy: "popularity.desc", page: 1 }),
                        getMovies({ genre: 18, sortBy: "vote_average.desc", page: 1 }),
                        getMovies({ genre: 16, language: "ja", sortBy: "popularity.desc", page: 1 })
                    ]);

                    const extractPosters = (res) =>
                        (res?.value?.results || []).slice(0, 3).map((m) => getPosterUrl(m.poster_path)).filter(Boolean);

                    setCuratedLists([
                        {
                            id: "list-scifi",
                            title: "Mind-Bending Science Fiction & Speculative Realities",
                            description: "Dystopian visions, time loops, deep space odysseys, and existential queries.",
                            filmsCount: 42,
                            tag: "Editorial Canon",
                            curator: "Alex Vance",
                            genreId: 878,
                            posters: extractPosters(sciFi)
                        },
                        {
                            id: "list-noir",
                            title: "Essential Neo-Noir & Gritty Criminal Minds",
                            description: "Shadow-drenched alleys, hard-boiled detectives, and moral grey lines.",
                            filmsCount: 35,
                            tag: "Genre Deep-Dive",
                            curator: "Elena Rostova",
                            genreId: 80,
                            posters: extractPosters(crime)
                        },
                        {
                            id: "list-anime",
                            title: "Studio Masterpieces & Poetic Japanese Animation",
                            description: "Breathtaking hand-drawn aesthetics, folklore spirits, and emotional journeys.",
                            filmsCount: 28,
                            tag: "Auteur Retrospective",
                            curator: "Kenji Sato",
                            genreId: 16,
                            posters: extractPosters(anime)
                        }
                    ]);
                }
            } catch (err) {
                console.warn("Could not generate curated lists:", err);
            }
        };

        loadCommunityData();
    }, []);

    // Initial Orchestration Mount
    useEffect(() => {
        fetchLandingData(streamingRegion);
    }, [fetchLandingData, streamingRegion]);

    // Handle Country / Region Change for Streaming
    const handleRegionChange = (newRegion) => {
        setStreamingRegion(newRegion);
        fetchLandingData(newRegion);
    };

    // ─────────────────────────────────────────────────────────────
    // 3. Trailer Player Handler
    // ─────────────────────────────────────────────────────────────
    const handleWatchTrailer = async (movie) => {
        if (!movie || !movie.id) return;
        try {
            const videoData = await getMovieVideos(movie.id);
            const videos = videoData?.results || [];
            const trailer =
                videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
                videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
                videos.find((v) => v.site === "YouTube");

            if (trailer && trailer.key) {
                setActiveTrailerKey(trailer.key);
                setActiveTrailerTitle(movie.title);
                setTrailerModalOpen(true);
            } else {
                alert(`No official YouTube trailer found for "${movie.title}".`);
            }
        } catch (err) {
            console.error("Failed to load trailer:", err);
            alert("Unable to load video trailer right now.");
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 4. Watchlist Toggle Handler (for Featured Hero / Spotlight)
    // ─────────────────────────────────────────────────────────────
    const handleToggleWatchlist = async (movie) => {
        if (!token) {
            navigate("/login");
            return;
        }
        if (!movie || !movie.id) return;

        try {
            setWatchlistUpdating(true);
            const isSaved = watchlistMap[movie.id];
            if (isSaved) {
                await removeFromWatchlist(movie.id);
                setWatchlistMap((prev) => ({ ...prev, [movie.id]: false }));
            } else {
                await addToWatchlist({
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster ? movie.poster.replace("https://image.tmdb.org/t/p/w500", "") : null,
                    backdrop_path: movie.backdrop ? movie.backdrop.replace("https://image.tmdb.org/t/p/original", "") : null,
                    vote_average: movie.rawRating,
                    release_date: movie.releaseDate
                });
                setWatchlistMap((prev) => ({ ...prev, [movie.id]: true }));
            }
        } catch (err) {
            console.error("Watchlist toggle failed:", err);
            alert("Could not update watchlist.");
        } finally {
            setWatchlistUpdating(false);
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-bg text-text antialiased">
            {/* Global Navbar */}
            <Navbar />

            <main className="space-y-16 sm:space-y-24 lg:space-y-28">
                {/* 1. CINEMATIC HERO SLIDESHOW — FEATURED DISCOVERY */}
                <HeroSlideshow
                    movies={heroMovies}
                    token={token}
                    onWatchTrailer={handleWatchTrailer}
                    isInWatchlist={Boolean(heroMovies[0] && watchlistMap[heroMovies[0].id])}
                    onToggleWatchlist={handleToggleWatchlist}
                    watchlistLoading={watchlistUpdating}
                    runtimeMap={runtimeMap}
                />

                {/* 2. NOW SHOWING — THEATRICAL DISCOVERY */}
                <NowShowingSection movies={nowShowingMovies} loading={loading} />

                {/* 3. TRENDING TODAY — MOMENTUM RANKINGS */}
                <TrendingSection movies={trendingMovies} loading={loading} />

                {/* 4. FRESH ON OTT — STREAMING DISCOVERY WITH VERIFIED PROVIDERS */}
                <div id="streaming">
                    <FreshOnOttSection
                        movies={streamingMovies}
                        loading={loading}
                        selectedRegion={streamingRegion}
                        onRegionChange={handleRegionChange}
                        providerMap={providerMap}
                    />
                </div>

                {/* 5. POPULAR THIS WEEK — GLOBAL AUDIENCE FAVORITES */}
                <PopularThisWeekSection movies={popularMovies} loading={loading} />

                {/* 6. DISCOVER BY MOOD & GENRE — INTERACTIVE VIBE EXPLORATION */}
                <div id="discover">
                    <DiscoverMoodGenreSection />
                </div>

                {/* 7. CRITICALLY ACCLAIMED — HIGHLY RATED QUALITY CINEMA */}
                <CriticallyAcclaimedSection movies={acclaimedMovies} loading={loading} />

                {/* 8. HIDDEN GEMS & CULT MASTERPIECES — DIVERSE CULT & REGIONAL CINEMA */}
                <HiddenGemsSection movies={hiddenGemsMovies} loading={loading} />

                {/* 9. CINEPHILE EDITORIAL SPOTLIGHT — STANDOUT FILM WITH PERSPECTIVE */}
                {spotlightMovie && (
                    <EditorialSpotlightSection
                        movie={spotlightMovie}
                        token={token}
                        onWatchTrailer={handleWatchTrailer}
                        isInWatchlist={Boolean(watchlistMap[spotlightMovie.id])}
                        onToggleWatchlist={handleToggleWatchlist}
                        watchlistLoading={watchlistUpdating}
                        runtime={runtimeMap[spotlightMovie.id]}
                    />
                )}

                {/* 10. RECENT RELEASES — GENUINELY RECENT ARRIVALS */}
                <RecentReleasesSection movies={recentReleases} loading={loading} />

                {/* 11. PERSONAL DISCOVERY — WHAT SHOULD I WATCH TONIGHT? */}
                <PersonalDiscoveryWidget />

                {/* 12. COMMUNITY REVIEWS & JOURNALS — AUTHENTIC MEMBER CRITIQUES */}
                <div id="community">
                    <CommunityReviewsSection reviews={communityReviews} loading={loading} />
                </div>

                {/* 13. CURATED WATCHLISTS & THEMATIC COLLECTIONS */}
                <div id="lists">
                    <CuratedListsSection lists={curatedLists} loading={loading} />
                </div>

                {/* 14. JOIN CINEPHILE — INVITATION & BENEFIT CARDS */}
                <JoinCommunityCta token={token} />
            </main>

            {/* Official Trailer Modal Player */}
            <TrailerModal
                isOpen={trailerModalOpen}
                onClose={() => setTrailerModalOpen(false)}
                trailerKey={activeTrailerKey}
                movieTitle={activeTrailerTitle}
            />

            {/* Footer */}
            <Footer />
        </div>
    );
}
