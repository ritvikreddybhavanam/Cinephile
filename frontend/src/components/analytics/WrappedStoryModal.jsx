import { useState, useEffect, useRef } from "react";
import ShareablePosterCard from "./ShareablePosterCard";
import { useToast } from "../../context/ToastContext";
import { getPosterUrl } from "../../services/movieService";

// Safe image helper that guarantees a valid high-resolution poster url with cinematic fallback
export const resolvePoster = (posterPath, fallbackKey = "interstellar") => {
    if (posterPath) {
        if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
            return posterPath;
        }
        return getPosterUrl(posterPath) || `https://image.tmdb.org/t/p/w500${posterPath}`;
    }
    // High-aesthetic cinematic fallback posters
    const fallbacks = {
        interstellar: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        oppenheimer: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        rrr: "https://image.tmdb.org/t/p/w500/wE0noFUqsvP2ElDV6fZOp7MuOpm.jpg",
        dune: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        bladerunner: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        parasite: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"
    };
    return fallbacks[fallbackKey] || fallbacks.interstellar;
};

export default function WrappedStoryModal({
    isOpen,
    onClose,
    stats,
    user,
    year
}) {
    const { success } = useToast();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const timerRef = useRef(null);
    const SLIDE_DURATION = 6500; // ms per slide

    const userName = user?.firstname || "Cinephile";
    const totalSlides = 12;

    const persona = stats?.cinephilePersona || {
        title: "The Story Seeker",
        desc: "Drawn to emotional depth, gripping narratives, and unforgettable world-building.",
        badge: "Storyteller",
        icon: "psychology"
    };

    const topRatedList = stats?.topRatedFilms || [];

    const topMovie = stats?.topMovie || (topRatedList.length > 0 ? topRatedList[0] : {
        title: "Interstellar",
        poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        rating: 5.0,
        year: 2014,
        genre: "Sci-Fi, Adventure"
    });

    const topGenres = (stats?.topGenres && stats.topGenres.length > 0)
        ? stats.topGenres
        : [{ genre: "Drama", count: 28, percent: 35 }, { genre: "Sci-Fi", count: 22, percent: 28 }, { genre: "Action", count: 18, percent: 22 }];
    const topGenre = topGenres[0];

    const fallbackTop5 = [
        { title: topMovie.title, rating: topMovie.rating || 5.0, year: topMovie.year || 2014, poster: topMovie.poster },
        { title: "Oppenheimer", rating: 5.0, year: 2023, poster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
        { title: "RRR", rating: 4.5, year: 2022, poster: "/wE0noFUqsvP2ElDV6fZOp7MuOpm.jpg" },
        { title: "Dune: Part Two", rating: 4.5, year: 2024, poster: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
        { title: "Blade Runner 2049", rating: 4.5, year: 2017, poster: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg" }
    ];

    const top5Films = topRatedList.length >= 3 ? topRatedList.slice(0, 5) : fallbackTop5;

    const topActor = stats?.topActor || {
        name: "Prabhas",
        count: (stats?.totalFilmsLogged && Math.max(2, Math.floor(stats.totalFilmsLogged * 0.15))) || 6,
        badge: "Most Watched Lead"
    };

    const topDirector = stats?.topDirector || (stats?.topDirectors && stats.topDirectors[0]) || {
        director: "Christopher Nolan",
        name: "Christopher Nolan",
        count: 4
    };
    const directorName = topDirector.name || topDirector.director || "Christopher Nolan";

    const tasteSummary = stats?.tasteSummary || "International • Sci-Fi • Telugu";

    const mostRewatched = stats?.mostRewatchedMovie || {
        title: "RRR",
        count: stats?.totalRewatches > 0 ? stats.totalRewatches : 5,
        poster: "/wE0noFUqsvP2ElDV6fZOp7MuOpm.jpg",
        year: 2022
    };

    const mostActiveMonth = stats?.mostActiveMonth || {
        month: "December",
        count: 18
    };

    // Auto progress timer
    useEffect(() => {
        if (!isOpen || isPaused) return;

        timerRef.current = setTimeout(() => {
            if (currentSlide < totalSlides - 1) {
                setCurrentSlide((s) => s + 1);
            }
        }, SLIDE_DURATION);

        return () => clearTimeout(timerRef.current);
    }, [isOpen, currentSlide, isPaused, totalSlides]);

    // Keyboard controls and body lock
    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                handleNext();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                handlePrev();
            } else if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, currentSlide]);

    // Reset slide on open
    useEffect(() => {
        if (isOpen) {
            setCurrentSlide(0);
            setIsPaused(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide((s) => s + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide((s) => s - 1);
        }
    };

    const handleShareDownload = () => {
        const text = `🎬 My Cinephile ${year > 0 ? year : ""} Wrapped:\n🍿 ${stats?.totalFilmsLogged || 0} Films Watched (${Math.round(stats?.totalHoursWatched || 0)}h)\n🏆 #1 Film: ${topMovie.title}\n🎭 Top Genre: ${topGenre.genre}\n🧠 Persona: ${persona.title}\nCheck yours on Cinephile!`;
        if (navigator.share) {
            navigator.share({
                title: `Cinephile ${year > 0 ? year : ""} Wrapped`,
                text: text,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text);
            success("Wrapped story copied to clipboard!");
        }
    };

    // Background backdrop image selector per slide
    const slideBackdrops = [
        resolvePoster(topMovie?.poster, "interstellar"),
        resolvePoster(top5Films[1]?.poster, "oppenheimer"),
        resolvePoster(topMovie?.poster, "interstellar"),
        resolvePoster(top5Films[2]?.poster, "parasite"),
        resolvePoster(top5Films[0]?.poster, "dune"),
        resolvePoster(mostRewatched?.poster, "rrr"),
        resolvePoster(top5Films[1]?.poster, "oppenheimer"),
        resolvePoster(top5Films[3]?.poster, "bladerunner"),
        resolvePoster(top5Films[0]?.poster, "interstellar"),
        resolvePoster(mostRewatched?.poster, "rrr"),
        resolvePoster(top5Films[2]?.poster, "dune"),
        resolvePoster(topMovie?.poster, "interstellar")
    ];

    const currentBackdrop = slideBackdrops[currentSlide];

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-fadeIn p-2 sm:p-4 select-none">
            {/* Top Close Button & Pause Control */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setIsPaused((p) => !p)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white/90 hover:text-white hover:bg-black/60 border border-white/20 backdrop-blur-xl transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                    title={isPaused ? "Resume" : "Pause"}
                >
                    <span className="material-symbols-outlined text-[22px]">
                        {isPaused ? "play_arrow" : "pause"}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white/90 hover:text-white hover:bg-black/60 border border-white/20 backdrop-blur-xl transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                    title="Close"
                >
                    <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
            </div>

            {/* Main Phone / Card Frame */}
            <div
                className="relative w-full max-w-[430px] aspect-[9/16] max-h-[94vh] rounded-[38px] overflow-hidden border border-white/20 bg-[#090D18] shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col justify-between"
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                {/* Dynamic Cinematic Film Backdrop Layer with Lighting Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <img
                        key={currentSlide}
                        src={currentBackdrop}
                        alt="Cinema Backdrop"
                        className="h-full w-full object-cover object-center scale-110 blur-xl opacity-35 transition-all duration-700 brightness-75 contrast-125"
                    />
                    {/* Vignette Gradients for Maximum Legibility & Mood */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#090D18]/90 via-[#090D18]/65 to-[#090D18]/95" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-black/80" />
                </div>

                {/* 12-Segment Progress Bars */}
                <div className="absolute top-4 left-4 right-4 z-40 flex items-center gap-1">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <div
                            key={index}
                            className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm"
                        >
                            <div
                                className={`h-full rounded-full transition-all duration-linear ${
                                    index < currentSlide
                                        ? "w-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                        : index === currentSlide
                                        ? "bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-400 shadow-[0_0_10px_rgba(244,63,94,0.9)]"
                                        : "w-0"
                                }`}
                                style={{
                                    width:
                                        index === currentSlide
                                            ? isPaused
                                                ? "50%"
                                                : "100%"
                                            : undefined,
                                    transitionDuration:
                                        index === currentSlide && !isPaused
                                            ? `${SLIDE_DURATION}ms`
                                            : "200ms"
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Left / Right Tap Hitboxes */}
                <div
                    onClick={handlePrev}
                    className="absolute top-12 bottom-16 left-0 w-1/3 z-30 cursor-pointer"
                />
                <div
                    onClick={handleNext}
                    className="absolute top-12 bottom-16 right-0 w-2/3 z-30 cursor-pointer"
                />

                {/* ========================================================= */}
                {/* STORY 1: TOTAL FILMS LOGGED */}
                {/* ========================================================= */}
                {currentSlide === 0 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-6">
                        <div className="relative z-10 space-y-2">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-amber-400 uppercase flex items-center justify-center gap-1.5 drop-shadow-sm">
                                <span>🍿</span>
                                <span>Story 1 of 12</span>
                            </span>
                            <div className="inline-block px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold tracking-wider shadow-inner">
                                🎬 YOUR {year > 0 ? year : "2026"} IN FILMS
                            </div>
                        </div>

                        <div className="relative z-10 space-y-2">
                            <span className="text-5xl block animate-bounce drop-shadow-lg">🍿</span>
                            <h2 className="font-serif text-3xl sm:text-4xl font-normal italic text-slate-100 tracking-tight">
                                You watched
                            </h2>
                            <h3 className="font-serif text-7xl sm:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-indigo-300 drop-shadow-[0_4px_25px_rgba(251,191,36,0.35)]">
                                {stats?.totalFilmsLogged || 87}
                            </h3>
                            <p className="font-serif text-2xl font-bold text-white tracking-wide">
                                films this year
                            </p>
                        </div>

                        {/* Aesthetic Glass Pill */}
                        <div className="relative z-10 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 max-w-xs shadow-xl">
                            <p className="text-xs font-sans text-slate-200 leading-relaxed font-medium">
                                Hey <strong className="text-amber-300">{userName}</strong>, you turned silver screen stories into cherished memories.
                            </p>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 2: TOTAL HOURS WATCHED */}
                {/* ========================================================= */}
                {currentSlide === 1 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-6">
                        <div className="relative z-10 space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-indigo-400 uppercase flex items-center justify-center gap-1.5">
                                <span>⏱️</span>
                                <span>Story 2 of 12</span>
                            </span>
                            <span className="text-5xl block mt-2 animate-spin-slow drop-shadow-md">⏳</span>
                        </div>

                        <div className="relative z-10 space-y-2">
                            <h2 className="font-serif text-2xl sm:text-3xl font-normal italic text-slate-200">
                                You spent
                            </h2>
                            <h3 className="font-serif text-7xl sm:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 drop-shadow-[0_4px_30px_rgba(99,102,241,0.4)]">
                                {Math.round(stats?.totalHoursWatched || 164)}
                            </h3>
                            <p className="font-serif text-2xl font-bold text-white tracking-wide">
                                hours watching movies
                            </p>
                        </div>

                        <div className="relative z-10 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 w-full max-w-xs space-y-1 shadow-xl">
                            <p className="text-lg font-bold text-indigo-300 font-mono tracking-wide">
                                ≈ {stats?.totalDaysWatched || 6.8} Days
                            </p>
                            <p className="text-xs text-slate-300 font-sans">
                                That&apos;s nearly a week of continuous movie theater immersion.
                            </p>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 3: YOUR #1 MOVIE */}
                {/* ========================================================= */}
                {currentSlide === 2 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-6 text-center animate-fadeIn space-y-5">
                        <div className="relative z-10 space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-amber-400 uppercase flex items-center justify-center gap-1.5">
                                <span>🏆</span>
                                <span>Story 3 of 12</span>
                            </span>
                            <h2 className="font-serif text-3xl font-bold text-white tracking-tight">
                                Your #1 Movie
                            </h2>
                        </div>

                        {/* Spotlight Poster Card */}
                        <div className="relative z-10 h-64 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.8)] ring-4 ring-amber-400/20 group">
                            <img
                                src={resolvePoster(topMovie.poster, "interstellar")}
                                alt={topMovie.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 text-xs font-mono font-black border border-amber-400/40 shadow-lg">
                                ★ {Number(topMovie.rating || 5.0).toFixed(1)}
                            </div>
                        </div>

                        <div className="relative z-10 space-y-1 max-w-xs">
                            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
                                {topMovie.title}
                            </h3>
                            <p className="text-xs text-amber-300 font-mono tracking-wider font-semibold">
                                {topMovie.year} {topMovie.genre ? `• ${topMovie.genre}` : ""}
                            </p>
                            <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                                Your highest rated, undisputed masterpiece of the year.
                            </p>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 4: YOUR TOP GENRE */}
                {/* ========================================================= */}
                {currentSlide === 3 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-6">
                        <div className="relative z-10 space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-pink-400 uppercase flex items-center justify-center gap-1.5">
                                <span>🎭</span>
                                <span>Story 4 of 12</span>
                            </span>
                            <span className="text-5xl block animate-pulse drop-shadow-md">🎭</span>
                        </div>

                        <div className="relative z-10 space-y-2">
                            <h2 className="font-serif text-2xl sm:text-3xl font-normal italic text-slate-200">
                                Your Top Genre
                            </h2>
                            <h3 className="font-serif text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-300 to-amber-200 tracking-tight drop-shadow-[0_4px_25px_rgba(244,63,94,0.35)]">
                                {topGenre.genre}
                            </h3>
                            <p className="text-xs text-slate-300 font-mono tracking-wider font-medium">
                                {topGenre.count} films ({topGenre.percent || 35}% of all watches)
                            </p>
                        </div>

                        {/* Top 3 Genre Mini Bars */}
                        <div className="relative z-10 w-full max-w-xs space-y-2 pt-1">
                            {topGenres.slice(0, 3).map((g, idx) => (
                                <div key={g.genre} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/15 text-xs shadow-md">
                                    <span className="font-semibold text-white font-sans">#{idx + 1} {g.genre}</span>
                                    <span className="text-pink-300 font-mono font-bold">{g.count} films</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 5: TOP 5 MOVIES */}
                {/* ========================================================= */}
                {currentSlide === 4 && (
                    <div className="relative h-full flex flex-col justify-center p-6 animate-fadeIn space-y-4">
                        <div className="relative z-10 text-center space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-amber-400 uppercase flex items-center justify-center gap-1.5">
                                <span>🎬</span>
                                <span>Story 5 of 12</span>
                            </span>
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Your Top 5 Movies
                            </h2>
                        </div>

                        <div className="relative z-10 space-y-2">
                            {top5Films.slice(0, 5).map((m, i) => (
                                <div
                                    key={m.movieId || m.title || i}
                                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-md hover:bg-white/[0.12] transition-colors"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 text-black text-xs font-black font-mono shadow-sm">
                                        {i + 1}
                                    </span>
                                    <div className="h-11 w-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10 shadow-inner">
                                        <img
                                            src={resolvePoster(m.poster, ["interstellar", "oppenheimer", "rrr", "dune", "bladerunner"][i])}
                                            alt={m.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-white truncate font-serif">{m.title}</p>
                                        <p className="text-[10px] text-slate-300 font-mono">{m.year || 2024}</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-amber-300 shrink-0">
                                        ★ {Number(m.rating || 5.0).toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 6: YOUR #1 ACTOR */}
                {/* ========================================================= */}
                {currentSlide === 5 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-6">
                        <div className="relative z-10 space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-amber-400 uppercase flex items-center justify-center gap-1.5">
                                <span>⭐</span>
                                <span>Story 6 of 12</span>
                            </span>
                            <span className="text-5xl block animate-bounce drop-shadow-md">⭐</span>
                        </div>

                        <div className="relative z-10 space-y-3">
                            <h2 className="font-serif text-2xl font-normal italic text-slate-200">
                                Your #1 Actor
                            </h2>
                            <h3 className="font-serif text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-rose-400 leading-tight drop-shadow-[0_4px_25px_rgba(251,191,36,0.35)]">
                                {topActor.name}
                            </h3>
                            <div className="inline-block px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold tracking-wider">
                                {topActor.count} films logged
                            </div>
                        </div>

                        <div className="relative z-10 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 max-w-xs shadow-xl">
                            <p className="text-xs text-slate-200 font-sans leading-relaxed font-medium">
                                Whenever <strong className="text-amber-300">{topActor.name}</strong> was on screen, you were in the front row.
                            </p>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 7: YOUR #1 DIRECTOR */}
                {/* ========================================================= */}
                {currentSlide === 6 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-6">
                        <div className="relative z-10 space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-indigo-400 uppercase flex items-center justify-center gap-1.5">
                                <span>🎥</span>
                                <span>Story 7 of 12</span>
                            </span>
                            <span className="text-5xl block animate-pulse drop-shadow-md">🎥</span>
                        </div>

                        <div className="relative z-10 space-y-3">
                            <h2 className="font-serif text-2xl font-normal italic text-slate-200">
                                Your #1 Director
                            </h2>
                            <h3 className="font-serif text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-300 leading-tight drop-shadow-[0_4px_25px_rgba(99,102,241,0.35)]">
                                {directorName}
                            </h3>
                            <div className="inline-block px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold tracking-wider">
                                Visionary Storyteller • {topDirector.count || 4} films
                            </div>
                        </div>

                        <div className="relative z-10 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 max-w-xs shadow-xl">
                            <p className="text-xs text-slate-200 font-sans leading-relaxed font-medium">
                                You returned to <strong className="text-indigo-300">{directorName}</strong>&apos;s cinematic signature more than anyone else.
                            </p>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 8: MOVIE TASTE PROFILE */}
                {/* ========================================================= */}
                {currentSlide === 7 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-6">
                        <div className="relative z-10 space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase flex items-center justify-center gap-1.5">
                                <span>🌍</span>
                                <span>Story 8 of 12</span>
                            </span>
                            <span className="text-5xl block animate-bounce drop-shadow-md">🌍</span>
                        </div>

                        <div className="relative z-10 space-y-3">
                            <h2 className="font-serif text-2xl font-normal italic text-slate-200">
                                Your Movie Taste
                            </h2>
                            <h3 className="font-serif text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-300 to-cyan-300 leading-tight drop-shadow-[0_4px_25px_rgba(16,185,129,0.35)]">
                                {tasteSummary}
                            </h3>
                        </div>

                        <div className="relative z-10 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 max-w-xs space-y-2 shadow-xl">
                            <p className="text-xs text-slate-200 font-sans leading-relaxed font-medium">
                                A boundary-pushing blend of global auteur cinema, epic regional spectacle, and high-concept storytelling.
                            </p>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 9: CINEPHILE PERSONALITY */}
                {/* ========================================================= */}
                {currentSlide === 8 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-6">
                        <div className="relative z-10 space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-purple-400 uppercase flex items-center justify-center gap-1.5">
                                <span>🧠</span>
                                <span>Story 9 of 12</span>
                            </span>
                        </div>

                        <div className="relative z-10 h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center text-white shadow-[0_10px_35px_rgba(147,51,234,0.5)] animate-pulse">
                            <span className="material-symbols-outlined text-5xl">
                                {persona.icon || "psychology"}
                            </span>
                        </div>

                        <div className="relative z-10 space-y-2">
                            <h2 className="font-serif text-xl font-normal italic text-slate-200">
                                Your Cinephile Personality
                            </h2>
                            <h3 className="font-serif text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-300 to-amber-200 drop-shadow-[0_4px_25px_rgba(168,85,247,0.35)]">
                                “{persona.title}”
                            </h3>
                            <p className="text-xs text-slate-200 font-sans max-w-xs mx-auto leading-relaxed pt-1 font-medium">
                                {persona.desc}
                            </p>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 10: MOST REWATCHED MOVIE */}
                {/* ========================================================= */}
                {currentSlide === 9 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-6 text-center animate-fadeIn space-y-5">
                        <div className="relative z-10 space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-rose-400 uppercase flex items-center justify-center gap-1.5">
                                <span>🔥</span>
                                <span>Story 10 of 12</span>
                            </span>
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Most Rewatched Movie
                            </h2>
                        </div>

                        {/* Rewatched Poster */}
                        <div className="relative z-10 h-56 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-rose-500/60 shadow-[0_15px_40px_rgba(0,0,0,0.8)] ring-4 ring-rose-500/20">
                            <img
                                src={resolvePoster(mostRewatched.poster, "rrr")}
                                alt={mostRewatched.title}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-mono font-black shadow-lg">
                                🔁 {mostRewatched.count} watches
                            </div>
                        </div>

                        <div className="relative z-10 space-y-1 max-w-xs">
                            <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                                {mostRewatched.title}
                            </h3>
                            <p className="text-sm font-bold text-rose-300 font-mono tracking-wider">
                                {mostRewatched.count} watches {mostRewatched.year ? `• ${mostRewatched.year}` : ""}
                            </p>
                            <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                The unforgettable spectacle you couldn&apos;t resist revisiting again and again.
                            </p>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 11: MOST ACTIVE MOVIE MONTH */}
                {/* ========================================================= */}
                {currentSlide === 10 && (
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn space-y-6">
                        <div className="relative z-10 space-y-1">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase flex items-center justify-center gap-1.5">
                                <span>📅</span>
                                <span>Story 11 of 12</span>
                            </span>
                            <span className="text-5xl block animate-bounce drop-shadow-md">📅</span>
                        </div>

                        <div className="relative z-10 space-y-3">
                            <h2 className="font-serif text-2xl font-normal italic text-slate-200">
                                Most Active Movie Month
                            </h2>
                            <h3 className="font-serif text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-300 to-indigo-300 drop-shadow-[0_4px_25px_rgba(6,182,212,0.35)]">
                                {mostActiveMonth.month}
                            </h3>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 text-sm font-mono font-bold tracking-wider">
                                🔥 {mostActiveMonth.count} films logged
                            </div>
                        </div>

                        <div className="relative z-10 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 max-w-xs shadow-xl">
                            <p className="text-xs text-slate-200 font-sans leading-relaxed font-medium">
                                Your greatest movie marathon season of the entire year.
                            </p>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STORY 12: GRAND POSTER SUMMARY CARD */}
                {/* ========================================================= */}
                {currentSlide === 11 && (
                    <div className="relative h-full flex flex-col justify-between p-5 animate-fadeIn overflow-y-auto">
                        <div className="text-center space-y-1 pt-4">
                            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-amber-400 uppercase flex items-center justify-center gap-1.5">
                                <span>🎞️</span>
                                <span>Story 12 of 12</span>
                            </span>
                            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                                Your {year > 0 ? year : "2026"} Movie Journey
                            </h3>
                        </div>

                        {/* Visual Poster Card */}
                        <div className="my-auto scale-[0.88] origin-center shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                            <ShareablePosterCard
                                stats={stats}
                                user={user}
                                year={year}
                                aspectRatio="story"
                            />
                        </div>

                        {/* Share Action */}
                        <div className="space-y-2 pt-1 z-40">
                            <button
                                type="button"
                                onClick={handleShareDownload}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 text-white font-black text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-[0_10px_30px_rgba(244,63,94,0.4)] cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[19px]">share</span>
                                <span>Share Your Wrapped Story</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
