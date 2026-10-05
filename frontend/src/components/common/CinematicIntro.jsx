import { useEffect, useRef, useState } from "react";
import { getWatchedMovies } from "../../services/watchedMovieService.js";
import { getTrendingMovies } from "../../services/movieService.js";

// Clean lightweight fallback set for new users who have not logged any watched films yet
const INITIAL_MOVIES = [
    { title: "The Shawshank Redemption", poster: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg" },
    { title: "The Godfather", poster: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
    { title: "The Dark Knight", poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
    { title: "Pulp Fiction", poster: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
    { title: "Inception", poster: "/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg" },
    { title: "Interstellar", poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
    { title: "Forrest Gump", poster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
    { title: "The Matrix", poster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
    { title: "Spirited Away", poster: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg" },
    { title: "Parasite", poster: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },
    { title: "Oppenheimer", poster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
    { title: "Gladiator", poster: "/ty8TGRuvJLPUmAR1r1tiDiXqQJb.jpg" },
    { title: "Django Unchained", poster: "/7oWY8vdWW7thTzWh3OKYRkWUlD5.jpg" },
    { title: "The Departed", poster: "/nT97ifL2A4AvFe4V1Znv8fn0Fbd.jpg" },
    { title: "La La Land", poster: "/uDO8zWDhfWwoFdKS4fzkVJb0Rf0.jpg" },
    { title: "Alien", poster: "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg" }
];

export default function CinematicIntro({ onComplete }) {
    const [phase, setPhase] = useState("entering"); // "entering" | "emerging" | "zooming" | "flashing" | "done"
    const [galleryMovies, setGalleryMovies] = useState(INITIAL_MOVIES);
    const [watchedCount, setWatchedCount] = useState(0);
    const trendingRef = useRef(null);

    // Fetch user's watched films AND pre-fetch dashboard trending movies in the background
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                // Fetch watched movies and pre-warm dashboard data concurrently
                const [watchedRes, trendingRes] = await Promise.allSettled([
                    getWatchedMovies(),
                    getTrendingMovies()
                ]);

                // Cache trending movies in sessionStorage so Dashboard renders with 0 delay
                if (trendingRes.status === "fulfilled" && trendingRes.value?.results) {
                    trendingRef.current = trendingRes.value.results;
                    try {
                        sessionStorage.setItem(
                            "cached_dashboard_movies",
                            JSON.stringify(trendingRes.value.results)
                        );
                    } catch {}
                }

                if (watchedRes.status === "fulfilled" && Array.isArray(watchedRes.value)) {
                    const userFilms = watchedRes.value
                        .filter((w) => w && (w.poster || w.title))
                        .map((w) => ({
                            id: w.movieId || w.id,
                            title: w.title,
                            poster: w.poster
                        }));

                    if (userFilms.length > 0 && isMounted) {
                        // Populate a clean 16-card grid exclusively with user's watched films
                        const GRID_SLOTS = 16;
                        const userOnlyGrid = [];
                        for (let i = 0; i < GRID_SLOTS; i++) {
                            userOnlyGrid.push(userFilms[i % userFilms.length]);
                        }
                        setGalleryMovies(userOnlyGrid);
                        setWatchedCount(userFilms.length);
                        return;
                    }
                }

                if (isMounted) {
                    setGalleryMovies(INITIAL_MOVIES);
                    setWatchedCount(0);
                }
            } catch (err) {
                console.warn("Intro data load fallback:", err);
                if (isMounted) {
                    setGalleryMovies(INITIAL_MOVIES);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Snappy, lag-free 1.6s progression
    useEffect(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                if (ctx.state === "suspended") ctx.resume();

                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(65, now);
                osc.frequency.exponentialRampToValueAtTime(36, now + 1.2);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.2, now + 0.4);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 1.3);
            }
        } catch {}

        // Fast & fluid timings: total 1.55s
        const emergeTimer = setTimeout(() => {
            setPhase("emerging");
        }, 350);

        const zoomTimer = setTimeout(() => {
            setPhase("zooming");
        }, 800);

        const flashTimer = setTimeout(() => {
            setPhase("flashing");
        }, 1250);

        const completeTimer = setTimeout(() => {
            setPhase("done");
            if (onComplete) onComplete(trendingRef.current);
        }, 1550);

        return () => {
            clearTimeout(emergeTimer);
            clearTimeout(zoomTimer);
            clearTimeout(flashTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    const isZooming = phase === "zooming" || phase === "flashing" || phase === "done";
    const isEmerging = phase === "emerging" || isZooming;

    return (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-bg select-none transition-opacity duration-300 ${
                phase === "done" ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            aria-live="polite"
            aria-label="Loading Cinephile Dashboard"
        >
            {/* Film Gallery - Displaying EXCLUSIVELY User's Watched Films (Optimized 16-card grid) */}
            <div
                className="absolute -inset-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-4 pointer-events-none transform-gpu origin-center"
                style={{
                    willChange: "transform, opacity",
                    transition: "transform 1.0s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out",
                    transform: isZooming
                        ? "scale(1.1)"
                        : isEmerging
                        ? "scale(1.02)"
                        : "scale(0.97)",
                    opacity: isZooming ? 0.7 : isEmerging ? 0.85 : 0.6
                }}
            >
                {galleryMovies.map((movie, index) => {
                    let posterUrl = movie.poster;
                    if (posterUrl && !posterUrl.startsWith("http")) {
                        const cleanPath = posterUrl.startsWith("/") ? posterUrl : `/${posterUrl}`;
                        posterUrl = `https://image.tmdb.org/t/p/w185${cleanPath}`;
                    }

                    return (
                        <div
                            key={index}
                            className="relative aspect-[2/3] rounded-md overflow-hidden bg-surface-2 border border-border/40 shadow-md"
                        >
                            {posterUrl ? (
                                <img
                                    src={posterUrl}
                                    alt={movie.title || "Watched Film"}
                                    className="w-full h-full object-cover"
                                    decoding="async"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs text-text-3 bg-surface-3">
                                    {movie.title}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Subtle Vignette Overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background:
                        "radial-gradient(circle at center, rgba(11,12,16,0.3) 0%, rgba(11,12,16,0.65) 65%, rgba(11,12,16,0.92) 100%)"
                }}
            />

            {/* Central Glow Radiating Behind the 'C' */}
            <div
                className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none z-10 transform-gpu origin-center"
                style={{
                    willChange: "transform, opacity",
                    transition: "transform 0.9s ease-out, opacity 0.7s ease-out",
                    background:
                        "radial-gradient(circle at center, rgba(201, 168, 106, 0.4) 0%, rgba(201, 168, 106, 0.08) 60%, transparent 80%)",
                    transform: isZooming ? "scale(2.2)" : "scale(1.0)",
                    opacity: isZooming ? 0.8 : 0.5
                }}
            />

            {/* The Golden 'C' - High performance GPU transform without heavy drop-shadow blurs */}
            <div
                className="relative z-20 flex flex-col items-center justify-center transform-gpu origin-center"
                style={{
                    willChange: "transform, opacity",
                    transition: isZooming
                        ? "transform 0.75s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out"
                        : "transform 0.4s ease-out, opacity 0.4s ease-out",
                    transform:
                        phase === "entering"
                            ? "scale(0.85)"
                            : phase === "emerging"
                            ? "scale(1.0)"
                            : "scale(3.5)",
                    opacity: isZooming && phase === "flashing" ? 0 : 1
                }}
            >
                <div
                    className="font-serif text-[120px] sm:text-[160px] font-bold leading-none select-none tracking-tight"
                    style={{
                        background: "linear-gradient(135deg, #FFF9EB 0%, #E5CD9E 35%, #C9A86A 70%, #967433 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 4px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(201, 168, 106, 0.5)"
                    }}
                >
                    C
                </div>
                {watchedCount > 0 && phase !== "zooming" && phase !== "flashing" && (
                    <p className="mt-2 text-xs tracking-widest uppercase font-semibold text-accent/90">
                        Your Watched Diary
                    </p>
                )}
            </div>

            {/* Fast Dissolve Transition into Dashboard */}
            <div
                className="absolute inset-0 pointer-events-none z-30 transform-gpu"
                style={{
                    willChange: "opacity",
                    transition: "opacity 0.3s ease-out",
                    background:
                        "radial-gradient(circle at center, rgba(201, 168, 106, 0.25) 0%, rgba(11, 12, 16, 0.8) 75%, #0B0C10 100%)",
                    opacity: phase === "flashing" ? 0.9 : 0
                }}
            />
        </div>
    );
}
