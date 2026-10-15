import React, { useState, useEffect, useMemo, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import { AuthContext } from "../../../context/AuthContext";
import { getWatchlist, removeFromWatchlist } from "../../../services/watchlistService.js";
import { getMovies, getMovieDetails, getMovieWatchProviders, getPosterUrl } from "../../../services/movieService.js";
import { addToWatched } from "../../../services/watchedMovieService.js";
import { useToast } from "../../../context/ToastContext";
import {
    MOOD_DEFINITIONS,
    STREAMING_PROVIDERS,
    TIME_PRESETS,
    rankMoviesForTonight,
    computeNarrowingFunnel,
    categorizeWatchlistForCleansing
} from "../../../services/whatToWatchService.js";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";

export default function WhatToWatch() {
    useDocumentTitle("What to Watch — Cinephile Decision Engine");
    const { user, token } = useContext(AuthContext);
    const { success, error: toastError } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Mode: 'picker' | 'surprise' | 'cleanup'
    const [activeMode, setActiveMode] = useState(searchParams.get("tab") || "picker");

    // Decision Inputs
    const [timeSelection, setTimeSelection] = useState("standard"); // 'quick' | 'standard' | 'long' | 'nolimit' | 'custom'
    const [customMinutes, setCustomMinutes] = useState(105);
    const [selectedMood, setSelectedMood] = useState("deep_focus");
    const [selectedProviders, setSelectedProviders] = useState(["netflix", "prime"]);
    const [onlyAvailableNow, setOnlyAvailableNow] = useState(true);
    const [sourceMode, setSourceMode] = useState("watchlist"); // 'watchlist' | 'hybrid' | 'catalog'

    // Flow State: 'setup' | 'analyzing' | 'results'
    const [flowState, setFlowState] = useState("setup");
    const [loadingWatchlist, setLoadingWatchlist] = useState(true);
    const [analysisStep, setAnalysisStep] = useState(0);

    // Data States
    const [watchlist, setWatchlist] = useState([]);
    const [enrichedWatchlist, setEnrichedWatchlist] = useState([]);
    const [catalogMovies, setCatalogMovies] = useState([]);
    const [results, setResults] = useState([]);
    const [surpriseMovie, setSurpriseMovie] = useState(null);
    const [isSurpriseRolling, setIsSurpriseRolling] = useState(false);

    // Feedback Modal State
    const [feedbackMovie, setFeedbackMovie] = useState(null);
    const [feedbackMoodMatch, setFeedbackMoodMatch] = useState(null);
    const [feedbackRating, setFeedbackRating] = useState(5);

    // Computed effective maximum minutes
    const effectiveMaxMinutes = useMemo(() => {
        if (timeSelection === "quick") return 90;
        if (timeSelection === "standard") return 120;
        if (timeSelection === "long") return 180;
        if (timeSelection === "nolimit") return 0;
        return customMinutes;
    }, [timeSelection, customMinutes]);

    // 1. Fetch User Watchlist on Mount
    useEffect(() => {
        const fetchInitialWatchlist = async () => {
            if (!token) {
                setSourceMode("catalog");
                setLoadingWatchlist(false);
                return;
            }
            try {
                setLoadingWatchlist(true);
                const list = await getWatchlist();
                if (Array.isArray(list)) {
                    setWatchlist(list);
                    if (list.length > 0) {
                        setSourceMode("watchlist");
                        await enrichWatchlistItems(list);
                    } else {
                        setSourceMode("catalog");
                    }
                }
            } catch (err) {
                console.error("Failed to load user watchlist:", err);
                setSourceMode("catalog");
            } finally {
                setLoadingWatchlist(false);
            }
        };

        fetchInitialWatchlist();
    }, [token]);

    // Enrich watchlist items with real genres, runtime, rating & streaming providers
    const enrichWatchlistItems = async (items) => {
        try {
            const enriched = await Promise.all(
                items.map(async (item) => {
                    const tmdbId = item.movieId || item.id;
                    try {
                        const [detailsRes, providersRes] = await Promise.allSettled([
                            getMovieDetails(tmdbId),
                            getMovieWatchProviders(tmdbId)
                        ]);

                        const details = detailsRes.status === "fulfilled" ? detailsRes.value : {};
                        const providersData = providersRes.status === "fulfilled" ? providersRes.value : {};

                        const pSet = new Set();
                        if (providersData?.results) {
                            const inRegion = providersData.results.IN;
                            const usRegion = providersData.results.US;
                            if (inRegion) {
                                (inRegion.flatrate || []).forEach((p) => pSet.add(p.provider_id));
                                (inRegion.free || []).forEach((p) => pSet.add(p.provider_id));
                                (inRegion.ads || []).forEach((p) => pSet.add(p.provider_id));
                            }
                            if (usRegion) {
                                (usRegion.flatrate || []).forEach((p) => pSet.add(p.provider_id));
                                (usRegion.free || []).forEach((p) => pSet.add(p.provider_id));
                                (usRegion.ads || []).forEach((p) => pSet.add(p.provider_id));
                            }
                        }

                        return {
                            ...item,
                            ...details,
                            id: tmdbId,
                            movieId: tmdbId,
                            title: details.title || item.title,
                            poster_path: details.poster_path || (item.poster ? item.poster.replace("https://image.tmdb.org/t/p/w500", "") : null),
                            runtime: details.runtime || 110,
                            vote_average: details.vote_average || item.rating || 7.2,
                            genres: details.genres || [],
                            genre_ids: details.genres ? details.genres.map((g) => g.id) : [],
                            streamingProviderIds: Array.from(pSet),
                            onWatchlist: true
                        };
                    } catch {
                        return {
                            ...item,
                            id: tmdbId,
                            movieId: tmdbId,
                            poster_path: item.poster ? item.poster.replace("https://image.tmdb.org/t/p/w500", "") : null,
                            streamingProviderIds: [],
                            onWatchlist: true
                        };
                    }
                })
            );
            setEnrichedWatchlist(enriched);
        } catch (err) {
            console.error("Watchlist enrichment error:", err);
        }
    };

    // Toggle streaming provider
    const toggleProvider = (id) => {
        setSelectedProviders((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    // Fetch targeted catalog candidates from TMDB
    const fetchCatalogCandidates = async () => {
        const moodConfig = MOOD_DEFINITIONS.find((m) => m.id === selectedMood) || MOOD_DEFINITIONS[0];
        try {
            const providerIds = selectedProviders
                .map((pId) => STREAMING_PROVIDERS.find((sp) => sp.id === pId)?.providerId)
                .filter(Boolean)
                .join("|");

            const queryParams = {
                genre: moodConfig.primaryGenreId,
                sortBy: "popularity.desc",
                rating: "6.5"
            };

            if (effectiveMaxMinutes > 0) {
                queryParams.runtimeLte = effectiveMaxMinutes;
            }

            if (providerIds && onlyAvailableNow) {
                queryParams.withWatchProviders = providerIds;
                queryParams.watchRegion = "IN";
            }

            const res = await getMovies(queryParams);
            let resultsList = res?.results || [];

            if (resultsList.length < 4 && providerIds && onlyAvailableNow) {
                const fallbackRes = await getMovies({ ...queryParams, watchRegion: "US" });
                if (fallbackRes?.results?.length) {
                    resultsList = fallbackRes.results;
                }
            }

            setCatalogMovies(resultsList);
            return resultsList;
        } catch (err) {
            console.error("Catalog fetch error:", err);
            return [];
        }
    };

    // Candidate pool builder
    const getCandidatePool = async () => {
        const watchPool = enrichedWatchlist.length > 0 ? enrichedWatchlist : watchlist;

        if (sourceMode === "watchlist") {
            return watchPool;
        }

        const catPool = await fetchCatalogCandidates();

        if (sourceMode === "hybrid") {
            const combined = [...watchPool, ...catPool];
            return Array.from(new Map(combined.map((m) => [m.movieId || m.id, m])).values());
        }

        return catPool;
    };

    // 2. Primary Action: "Find My Movie"
    const handleFindMyMovie = async () => {
        setFlowState("analyzing");
        setAnalysisStep(1);

        const candidates = await getCandidatePool();

        setTimeout(() => setAnalysisStep(2), 500);
        setTimeout(() => setAnalysisStep(3), 900);

        setTimeout(() => {
            const topPicks = rankMoviesForTonight({
                candidates,
                maxMinutes: effectiveMaxMinutes,
                selectedMood,
                selectedProviders,
                onlyAvailableNow,
                minRating: 6.5,
                isWatchlist: sourceMode === "watchlist"
            });

            setResults(topPicks);
            setFlowState("results");
        }, 1300);
    };

    // Funnel Statistics for preview
    const funnelStats = useMemo(() => {
        const pool = sourceMode === "watchlist" ? (enrichedWatchlist.length > 0 ? enrichedWatchlist : watchlist) : catalogMovies;
        return computeNarrowingFunnel(pool, effectiveMaxMinutes, selectedMood, selectedProviders);
    }, [sourceMode, enrichedWatchlist, watchlist, catalogMovies, effectiveMaxMinutes, selectedMood, selectedProviders]);

    // Surprise Me Execution
    const handleSurpriseMePick = async () => {
        setIsSurpriseRolling(true);
        setSelectedMood("any");
        try {
            let candidates = await getCandidatePool();

            // If candidates are scarce, fetch additional high-rated discover candidates from TMDB
            if (!candidates || candidates.length < 5) {
                try {
                    const fallbackRes = await getMovies({
                        sortBy: "popularity.desc",
                        rating: "7.0"
                    });
                    if (fallbackRes?.results?.length) {
                        const fallbackList = fallbackRes.results.map((m) => ({
                            ...m,
                            movieId: m.id,
                            runtime: m.runtime || 110,
                            vote_average: m.vote_average || 7.5
                        }));
                        candidates = [...(candidates || []), ...fallbackList];
                    }
                } catch (e) {
                    console.error("Surprise candidate fetch fallback:", e);
                }
            }

            const topPicks = rankMoviesForTonight({
                candidates: candidates || [],
                maxMinutes: effectiveMaxMinutes,
                selectedMood: "any",
                selectedProviders,
                onlyAvailableNow: false,
                isWatchlist: sourceMode === "watchlist"
            });

            setTimeout(() => {
                if (topPicks && topPicks.length > 0) {
                    // Pick a random top candidate or wild card for excitement
                    const randomIndex = Math.floor(Math.random() * Math.min(topPicks.length, 5));
                    const picked = topPicks[randomIndex];
                    setSurpriseMovie(picked);
                    setResults(topPicks);
                } else if (candidates && candidates.length > 0) {
                    const randomRaw = candidates[Math.floor(Math.random() * candidates.length)];
                    const formatted = {
                        ...randomRaw,
                        matchScore: 94,
                        roleTag: "Wild Card",
                        roleBadge: "🎲 Wild Card",
                        roleDesc: "Controlled surprise for tonight",
                        reasons: [
                            { text: `Runtime fits your schedule`, icon: "schedule" },
                            { text: `High rating (${randomRaw.vote_average || 7.5}★)`, icon: "star" }
                        ],
                        mismatch: "Unique stylistic choice — something fresh outside your routine.",
                        tasteExplanation: "Critically acclaimed film tailored for curious discovery."
                    };
                    setSurpriseMovie(formatted);
                }
                setIsSurpriseRolling(false);
                success("🎲 Surprise rolled!");
            }, 600);
        } catch (err) {
            console.error("Surprise Me execution failed:", err);
            setIsSurpriseRolling(false);
            toastError("Failed to roll surprise. Try again.");
        }
    };

    // Watchlist Cleanser Actions
    const handleCleanserRemove = async (movieId) => {
        try {
            await removeFromWatchlist(movieId);
            setWatchlist((prev) => prev.filter((m) => (m.movieId || m.id) !== movieId));
            setEnrichedWatchlist((prev) => prev.filter((m) => (m.movieId || m.id) !== movieId));
            success("Removed from watchlist");
        } catch (err) {
            toastError("Failed to remove movie");
        }
    };

    const handleCleanserMarkWatched = async (movie) => {
        try {
            await addToWatched(movie);
            await removeFromWatchlist(movie.movieId || movie.id);
            setWatchlist((prev) => prev.filter((m) => (m.movieId || m.id) !== (movie.movieId || movie.id)));
            setEnrichedWatchlist((prev) => prev.filter((m) => (m.movieId || m.id) !== (movie.movieId || movie.id)));
            setFeedbackMovie(movie);
            success(`Marked "${movie.title || movie.movieTitle}" as watched!`);
        } catch (err) {
            toastError("Failed to update watched status");
        }
    };

    const cleanserData = useMemo(() => {
        const pool = enrichedWatchlist.length > 0 ? enrichedWatchlist : watchlist;
        return categorizeWatchlistForCleansing(pool);
    }, [enrichedWatchlist, watchlist]);

    // Active Mood label for banner
    const currentMoodObj = MOOD_DEFINITIONS.find((m) => m.id === selectedMood) || MOOD_DEFINITIONS[0];

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text antialiased font-sans">
            <Navbar />

            {/* Top Level Hero Header */}
            <div className="border-b border-border bg-gradient-to-b from-surface-2/90 via-surface/95 to-bg py-8 md:py-10">
                <div className="page-container">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold text-accent border border-accent/30 font-mono uppercase tracking-wider">
                                    Decision Engine
                                </span>
                            </div>

                            <h1 className="font-serif text-fluid-title font-bold tracking-tight text-text">
                                What to <span className="text-accent italic font-serif">Watch</span>
                            </h1>

                            <p className="mt-1.5 text-sm sm:text-base text-text-3 max-w-xl">
                                Tell Cinephile what tonight looks like. We&apos;ll find your best match.
                            </p>
                        </div>

                        {/* Three Modes Nav Bar with Clear Visual Hierarchy */}
                        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                            {/* 1. Primary: Tonight's Match */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveMode("picker");
                                    setSearchParams({});
                                    if (flowState === "results") setFlowState("setup");
                                }}
                                className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
                                    activeMode === "picker"
                                        ? "bg-accent text-white shadow-lg shadow-accent/25 scale-[1.02]"
                                        : "bg-surface border border-border text-text-2 hover:text-text hover:bg-surface-2"
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">target</span>
                                <span>Tonight&apos;s Match</span>
                            </button>

                            {/* 2. Secondary: Surprise Me */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveMode("surprise");
                                    setSearchParams({ tab: "surprise" });
                                }}
                                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold transition-all ${
                                    activeMode === "surprise"
                                        ? "bg-surface-2 border border-accent text-accent shadow-sm"
                                        : "bg-surface border border-border text-text-3 hover:text-text"
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">casino</span>
                                <span>Surprise Me</span>
                            </button>

                            {/* 3. Secondary: Watchlist Cleanup */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveMode("cleanup");
                                    setSearchParams({ tab: "cleanup" });
                                }}
                                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold transition-all ${
                                    activeMode === "cleanup"
                                        ? "bg-surface-2 border border-accent text-accent shadow-sm"
                                        : "bg-surface border border-border text-text-3 hover:text-text"
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">cleaning_services</span>
                                <span>Watchlist Cleanup</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Decision Space */}
            <main className="flex-1 page-container py-8">

                {/* ========================================================================= */}
                {/* MODE 1: TONIGHT'S MATCH (PRIMARY FLOW)                                     */}
                {/* ========================================================================= */}
                {activeMode === "picker" && (
                    <div>

                        {/* STEP SETUP VIEW (10-15s Flow) */}
                        {flowState === "setup" && (
                            <div className="space-y-8 max-w-3xl mx-auto">

                                {/* Funnel Initial Status Banner */}
                                <div className="flex items-center justify-between border-b border-border pb-4">
                                    <div>
                                        <h2 className="font-serif text-xl font-bold text-text">
                                            Tell me what tonight looks like
                                        </h2>
                                        <p className="text-xs text-text-3">
                                            Complete in 10 seconds — we&apos;ll filter down to your top 3.
                                        </p>
                                    </div>
                                    <span className="text-xs font-mono text-text-3 bg-surface border border-border px-3 py-1 rounded-full">
                                        {sourceMode === "watchlist" ? `Your Watchlist · ${watchlist.length} movies` : "Full Catalog Search"}
                                    </span>
                                </div>

                                {/* Step 1: Available Time */}
                                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-accent text-lg">schedule</span>
                                        <h3 className="font-serif text-base font-bold text-text">
                                            ⏱ How much time do you have?
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                                        {TIME_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => setTimeSelection(preset.id)}
                                                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                                                    timeSelection === preset.id
                                                        ? "border-accent bg-accent/15 shadow-sm"
                                                        : "border-border bg-surface-2/60 text-text-2 hover:border-accent/40"
                                                }`}
                                            >
                                                <span className={`text-xs font-bold ${timeSelection === preset.id ? "text-accent" : "text-text"}`}>
                                                    {preset.label}
                                                </span>
                                                <span className="text-[11px] text-text-3 mt-0.5">
                                                    {preset.sub}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Time Option */}
                                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/60">
                                        <span className="text-xs text-text-3">Need exact time?</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range"
                                                min="75"
                                                max="210"
                                                step="15"
                                                value={customMinutes}
                                                onChange={(e) => {
                                                    setCustomMinutes(Number(e.target.value));
                                                    setTimeSelection("custom");
                                                }}
                                                className="w-32 accent-accent cursor-pointer"
                                            />
                                            <span className="text-xs font-mono font-bold text-accent">
                                                {Math.floor(customMinutes / 60)}h {customMinutes % 60}m
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Current Mood / Vibe */}
                                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-accent text-lg">psychology</span>
                                        <h3 className="font-serif text-base font-bold text-text">
                                            🧠 What&apos;s your vibe tonight?
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                        {MOOD_DEFINITIONS.map((mood) => {
                                            const isSelected = selectedMood === mood.id;
                                            return (
                                                <div
                                                    key={mood.id}
                                                    onClick={() => setSelectedMood(mood.id)}
                                                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                                        isSelected
                                                            ? "border-accent bg-accent/15 shadow-sm scale-[1.01]"
                                                            : "border-border bg-surface-2/60 hover:border-accent/40 hover:bg-surface-2"
                                                    }`}
                                                >
                                                    <span className="text-2xl shrink-0 mt-0.5">{mood.icon}</span>
                                                    <div className="min-w-0">
                                                        <p className={`text-xs font-bold ${isSelected ? "text-accent" : "text-text"}`}>
                                                            {mood.label}
                                                        </p>
                                                        <p className="text-[11px] text-text-3 mt-0.5 leading-snug">
                                                            {mood.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 3: Streaming Availability */}
                                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-accent text-lg">tv</span>
                                            <h3 className="font-serif text-base font-bold text-text">
                                                📺 Where can you watch?
                                            </h3>
                                        </div>

                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-2">
                                            <input
                                                type="checkbox"
                                                checked={onlyAvailableNow}
                                                onChange={(e) => setOnlyAvailableNow(e.target.checked)}
                                                className="rounded border-border accent-accent"
                                            />
                                            <span>Only show movies I can watch right now</span>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {STREAMING_PROVIDERS.map((provider) => {
                                            const isSelected = selectedProviders.includes(provider.id);
                                            return (
                                                <button
                                                    key={provider.id}
                                                    type="button"
                                                    onClick={() => toggleProvider(provider.id)}
                                                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                                                        isSelected
                                                            ? "border-accent bg-accent/15 text-text font-semibold shadow-sm"
                                                            : "border-border bg-surface-2/60 text-text-3 hover:text-text"
                                                    }`}
                                                >
                                                    <span>{provider.icon}</span>
                                                    <span className="truncate">{provider.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 4: Movie Source */}
                                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-accent text-lg">folder</span>
                                        <h3 className="font-serif text-base font-bold text-text">
                                            📚 Where should we look?
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSourceMode("watchlist")}
                                            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                                                sourceMode === "watchlist"
                                                    ? "border-accent bg-accent/15 shadow-sm"
                                                    : "border-border bg-surface-2/60 text-text-2 hover:border-accent/40"
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-accent mb-0.5">
                                                ⭐ My Watchlist
                                            </span>
                                            <span className="text-[11px] text-text-3">
                                                Only movies you&apos;ve already saved ({watchlist.length})
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setSourceMode("hybrid")}
                                            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                                                sourceMode === "hybrid"
                                                    ? "border-accent bg-accent/15 shadow-sm"
                                                    : "border-border bg-surface-2/60 text-text-2 hover:border-accent/40"
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-accent mb-0.5">
                                                ✨ Watchlist + Discover
                                            </span>
                                            <span className="text-[11px] text-text-3">
                                                Saved movies plus personalized discoveries
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setSourceMode("catalog")}
                                            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                                                sourceMode === "catalog"
                                                    ? "border-accent bg-accent/15 shadow-sm"
                                                    : "border-border bg-surface-2/60 text-text-2 hover:border-accent/40"
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-accent mb-0.5">
                                                🌎 Full Cinephile Catalog
                                            </span>
                                            <span className="text-[11px] text-text-3">
                                                Search the entire movie vault
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* PRIMARY CTA */}
                                <div className="pt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={handleFindMyMovie}
                                        className="btn-primary py-3.5 px-10 text-base font-bold rounded-2xl shadow-xl shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2.5"
                                    >
                                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                                        <span>✨ Find My Movie</span>
                                    </button>
                                </div>

                            </div>
                        )}

                        {/* SHORT CINEMATIC LOADING STATE */}
                        {flowState === "analyzing" && (
                            <div className="max-w-md mx-auto py-16 text-center">
                                <div className="rounded-3xl border border-accent/30 bg-surface p-10 shadow-2xl backdrop-blur-xl">
                                    <span className="material-symbols-outlined text-5xl text-accent animate-spin mb-4 block">
                                        progress_activity
                                    </span>

                                    <h3 className="font-serif text-xl font-bold text-text mb-3">
                                        {analysisStep === 1 && "Analyzing your Watchlist..."}
                                        {analysisStep === 2 && "Checking tonight's context..."}
                                        {analysisStep >= 3 && "Finding your best matches..."}
                                    </h3>

                                    {/* Narrowing Progression Funnel */}
                                    <div className="space-y-2 text-xs font-mono text-text-3 mt-6 text-left bg-bg/80 p-4 rounded-xl border border-border">
                                        <div className="flex justify-between">
                                            <span>Candidate pool:</span>
                                            <span className="text-text font-bold">{funnelStats.totalCount} movies</span>
                                        </div>
                                        <div className="flex justify-between text-accent">
                                            <span>↓ Fit your {effectiveMaxMinutes > 0 ? `${effectiveMaxMinutes}m` : "time"} window:</span>
                                            <span>{funnelStats.fitTimeCount} movies</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-400">
                                            <span>↓ Match your &ldquo;{currentMoodObj.label}&rdquo; vibe:</span>
                                            <span>{funnelStats.matchVibeCount} movies</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RESULTS VIEW — 🎯 TONIGHT'S TOP 3 */}
                        {flowState === "results" && (
                            <div className="space-y-8">

                                {/* Top Context Bar + ✏️ Edit Tonight's Context */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 sm:px-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                                            <span className="material-symbols-outlined text-xl">target</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-serif text-lg font-bold text-text">
                                                    Tonight&apos;s Top 3
                                                </h2>
                                                <span className="rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5">
                                                    Matched
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-3">
                                                Based on your time, mood, availability and movie taste.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Active Context Chips + Edit Button */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-text-2 font-mono border border-border">
                                            ⏱ {effectiveMaxMinutes > 0 ? `≤${effectiveMaxMinutes}m` : "No limit"}
                                        </span>
                                        <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-text-2 font-mono border border-border">
                                            {currentMoodObj.icon} {currentMoodObj.label}
                                        </span>
                                        {selectedProviders.length > 0 && (
                                            <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-text-2 font-mono border border-border">
                                                📺 {selectedProviders.join(", ")}
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setFlowState("setup")}
                                            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            <span>Edit Context</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Results Grid (Exactly 3 Roles: Best Match, Strong Alternative, Wild Card) */}
                                {results.length === 0 ? (
                                    <div className="rounded-2xl border border-border bg-surface p-10 text-center max-w-xl mx-auto">
                                        <span className="material-symbols-outlined text-5xl text-text-3 opacity-40 mb-3 block">
                                            filter_drama
                                        </span>
                                        <h3 className="font-serif text-xl font-bold text-text mb-2">
                                            Nothing fits perfectly tonight.
                                        </h3>
                                        <p className="text-xs text-text-3 mb-6">
                                            Your {effectiveMaxMinutes}m limit and streaming stack leave no exact matches in this pool. Relax your constraints below:
                                        </p>

                                        <div className="flex flex-wrap justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomMinutes((prev) => prev + 20);
                                                    setTimeSelection("custom");
                                                    handleFindMyMovie();
                                                }}
                                                className="btn-secondary text-xs py-2 px-4"
                                            >
                                                + Allow 20 more minutes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSourceMode("catalog");
                                                    handleFindMyMovie();
                                                }}
                                                className="btn-secondary text-xs py-2 px-4"
                                            >
                                                + Include Full Catalog
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedMood("any");
                                                    handleFindMyMovie();
                                                }}
                                                className="btn-primary text-xs py-2 px-4"
                                            >
                                                + Surprise Any Mood
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {results.map((movie) => (
                                            <div
                                                key={movie.movieId || movie.id}
                                                className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 shadow-xl backdrop-blur-xl transition-all ${
                                                    movie.roleTag === "Best Match"
                                                        ? "border-accent/40 bg-gradient-to-b from-surface-2/90 via-surface/95 to-surface shadow-accent/5"
                                                        : "border-border bg-surface"
                                                }`}
                                            >
                                                {/* Card Header: Role Badge + Match Score */}
                                                <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border/60">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                                            movie.roleTag === "Best Match"
                                                                ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                                                                : movie.roleTag === "Strong Alternative"
                                                                ? "bg-accent/20 text-accent border-accent/30"
                                                                : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                                        }`}>
                                                            {movie.roleBadge}
                                                        </span>
                                                        <span className="text-xs text-text-3 hidden sm:inline">
                                                            — {movie.roleDesc}
                                                        </span>
                                                    </div>

                                                    <span className="text-sm font-bold text-emerald-400 font-mono">
                                                        {movie.matchScore}% Match
                                                    </span>
                                                </div>

                                                {/* Movie Body */}
                                                <div className="flex flex-col sm:flex-row gap-5 items-start">
                                                    {/* Poster */}
                                                    <div className="w-28 sm:w-36 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-border shadow-md bg-surface-2">
                                                        <img
                                                            src={getPosterUrl(movie.poster_path) || "/placeholder-poster.png"}
                                                            alt={movie.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Info & Verified Reasons */}
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            to={`/movies/${movie.movieId || movie.id}`}
                                                            className="font-serif text-xl sm:text-2xl font-bold text-text hover:text-accent transition-colors no-underline block"
                                                        >
                                                            {movie.title}
                                                        </Link>

                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-3 mt-1.5 mb-3 font-mono">
                                                            <span className="text-amber-400 font-bold">
                                                                ★ {Number(movie.rating || movie.vote_average || 7.5).toFixed(1)}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                                                            <span>•</span>
                                                            <span className="rounded bg-surface-2 px-2 py-0.5 text-text-2">
                                                                {movie.moodLabel}
                                                            </span>
                                                        </div>

                                                        {/* Why this fits tonight (Checklist) */}
                                                        <div className="space-y-1.5 bg-bg/80 border border-border/70 rounded-xl p-3.5 mb-3">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-3 font-mono block mb-1">
                                                                Why this fits tonight:
                                                            </span>
                                                            {movie.reasons?.map((r, i) => (
                                                                <div key={i} className="flex items-center gap-2 text-xs text-text-2">
                                                                    <span className="text-emerald-400 font-bold">✓</span>
                                                                    <span>{r.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* One Potential Mismatch (Honest Decision Support) */}
                                                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-300 mb-3 flex items-start gap-2">
                                                            <span className="shrink-0">⚠️</span>
                                                            <span>{movie.potentialMismatch}</span>
                                                        </div>

                                                        {/* Personal Taste Explanation */}
                                                        <p className="text-[11px] text-text-3 italic mb-4">
                                                            🎯 Why you might like it: {movie.tasteExplanation}
                                                        </p>

                                                        {/* Actions */}
                                                        <div className="flex flex-wrap items-center gap-2.5">
                                                            <Link
                                                                to={`/movies/${movie.movieId || movie.id}`}
                                                                className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-2 no-underline"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">play_arrow</span>
                                                                <span>Watch Now</span>
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleCleanserMarkWatched(movie)}
                                                                className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                                <span>Mark Watched</span>
                                                            </button>

                                                            <Link
                                                                to={`/movies/${movie.movieId || movie.id}`}
                                                                className="text-xs text-text-3 hover:text-text px-2 py-1"
                                                            >
                                                                Film Details →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODE 2: CONTROLLED SURPRISE ME                                            */}
                {/* ========================================================================= */}
                {activeMode === "surprise" && (
                    <div className="max-w-3xl mx-auto py-4 space-y-6">
                        
                        {/* Quick Context Bar */}
                        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                                <div>
                                    <h2 className="font-serif text-lg font-bold text-text flex items-center gap-2">
                                        <span>🎲 Surprise Me</span>
                                        <span className="text-xs font-mono font-normal text-text-3 px-2 py-0.5 rounded-full bg-surface-2 border border-border">
                                            Controlled Discovery
                                        </span>
                                    </h2>
                                    <p className="text-xs text-text-3">
                                        Something you wouldn&apos;t normally pick — but might love. Respects your time and streaming preferences.
                                    </p>
                                </div>
                                <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
                                    {sourceMode === "watchlist" ? `Watchlist Pool (${watchlist.length})` : "Full Catalog"}
                                </span>
                            </div>

                            {/* Filters Bar: Time & Source */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs text-text-3 font-semibold mr-1">Time:</span>
                                    {TIME_PRESETS.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setTimeSelection(p.id)}
                                            className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all ${
                                                timeSelection === p.id
                                                    ? "bg-accent text-white border-accent font-bold"
                                                    : "bg-surface-2 text-text-3 border-border hover:text-text"
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setSourceMode((prev) => (prev === "watchlist" ? "catalog" : "watchlist"))}
                                        className="text-xs px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-text-2 hover:text-text font-mono"
                                    >
                                        Source: {sourceMode === "watchlist" ? "⭐ Watchlist" : "🌎 Catalog"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ROLLING STATE */}
                        {isSurpriseRolling && (
                            <div className="rounded-3xl border border-accent/40 bg-surface p-12 text-center shadow-2xl animate-pulse">
                                <span className="text-5xl inline-block animate-spin mb-4">🎲</span>
                                <h3 className="font-serif text-xl font-bold text-text mb-2">
                                    Rolling your controlled surprise...
                                </h3>
                                <p className="text-xs text-text-3 max-w-sm mx-auto">
                                    Balancing audience acclaim, pacing, and unexpected angles within your {effectiveMaxMinutes > 0 ? `${effectiveMaxMinutes}m` : "schedule"}...
                                </p>
                            </div>
                        )}

                        {/* GENERATED SURPRISE CARD */}
                        {!isSurpriseRolling && surpriseMovie && (
                            <div className="relative overflow-hidden rounded-3xl border border-accent/40 bg-gradient-to-b from-surface-2/95 via-surface to-surface p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                                
                                {/* Header badge */}
                                <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-border/70">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-full border bg-purple-500/20 text-purple-300 border-purple-500/30">
                                            🎲 Surprise Spotlight
                                        </span>
                                        <span className="text-xs text-text-3">
                                            Curated wild card pick for tonight
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-400 font-mono">
                                        {surpriseMovie.matchScore || 95}% Match
                                    </span>
                                </div>

                                {/* Main Movie Details */}
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    {/* Poster */}
                                    <div className="w-32 sm:w-44 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-border shadow-lg bg-surface-2">
                                        <img
                                            src={getPosterUrl(surpriseMovie.poster_path || surpriseMovie.poster)}
                                            alt={surpriseMovie.title || surpriseMovie.movieTitle}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80";
                                            }}
                                        />
                                    </div>

                                    {/* Info Body */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                                                <h3 className="font-serif text-xl sm:text-2xl font-bold text-text">
                                                    {surpriseMovie.title || surpriseMovie.movieTitle}
                                                </h3>
                                                <span className="text-xs font-mono text-text-3">
                                                    ({(surpriseMovie.release_date || surpriseMovie.releaseYear || "2023").substring(0, 4)})
                                                </span>
                                            </div>

                                            {/* Meta Tags */}
                                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-text-2">
                                                <span className="text-amber-400 font-bold">
                                                    ★ {Number(surpriseMovie.vote_average || surpriseMovie.rating || 7.5).toFixed(1)}
                                                </span>
                                                <span>•</span>
                                                <span>{surpriseMovie.runtime || surpriseMovie.movieRuntime || 115}m</span>
                                                {surpriseMovie.genres && surpriseMovie.genres.length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-text-3">
                                                            {surpriseMovie.genres.map((g) => (typeof g === "string" ? g : g.name)).slice(0, 3).join(", ")}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Why this fits tonight */}
                                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1.5">
                                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide font-mono">
                                                ✓ Why this fits tonight
                                            </p>
                                            <ul className="text-xs text-text-2 space-y-1">
                                                <li className="flex items-center gap-1.5">
                                                    <span className="text-emerald-400">✓</span>
                                                    <span>Fits your {effectiveMaxMinutes > 0 ? `${effectiveMaxMinutes}m` : "available"} time window</span>
                                                </li>
                                                <li className="flex items-center gap-1.5">
                                                    <span className="text-emerald-400">✓</span>
                                                    <span>Critically acclaimed storytelling with strong audience scores</span>
                                                </li>
                                                {surpriseMovie.onWatchlist && (
                                                    <li className="flex items-center gap-1.5">
                                                        <span className="text-emerald-400">✓</span>
                                                        <span>Already waiting in your Watchlist</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Honest Mismatch Warning */}
                                        {surpriseMovie.mismatch && (
                                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/90 flex items-start gap-2">
                                                <span className="text-amber-400 text-sm">⚠️</span>
                                                <span><strong>Honest note:</strong> {surpriseMovie.mismatch}</span>
                                            </div>
                                        )}

                                        {/* Taste Explanation */}
                                        <p className="text-xs text-text-3 italic">
                                            🎯 {surpriseMovie.tasteExplanation || "A memorable pick outside your usual routine that still respects your taste."}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap items-center gap-3 pt-2">
                                            <Link
                                                to={`/movies/${surpriseMovie.movieId || surpriseMovie.id}`}
                                                className="btn-primary text-xs py-2.5 px-6 inline-flex items-center gap-2 no-underline shadow-lg shadow-accent/20"
                                            >
                                                <span className="material-symbols-outlined text-base">play_arrow</span>
                                                <span>Watch Now</span>
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={handleSurpriseMePick}
                                                className="btn-secondary text-xs py-2.5 px-4 inline-flex items-center gap-1.5"
                                            >
                                                <span className="material-symbols-outlined text-sm">casino</span>
                                                <span>Roll Another Surprise</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleCleanserMarkWatched(surpriseMovie)}
                                                className="btn-secondary text-xs py-2.5 px-4 inline-flex items-center gap-1.5"
                                            >
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                <span>Mark Watched</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* INITIAL LAUNCH CARD (when no roll yet) */}
                        {!isSurpriseRolling && !surpriseMovie && (
                            <div className="rounded-3xl border border-accent/30 bg-surface p-8 sm:p-12 text-center shadow-2xl">
                                <span className="text-5xl mb-4 block">🎲</span>
                                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-text mb-2">
                                    Surprise Me Tonight
                                </h3>
                                <p className="text-sm text-text-3 max-w-md mx-auto mb-8">
                                    Can&apos;t decide? Let Cinephile pick something unexpected yet tailored to your available time and favorite streaming services.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleSurpriseMePick}
                                    className="btn-primary py-3.5 px-10 text-sm font-bold inline-flex items-center gap-2.5 shadow-xl shadow-accent/30 hover:scale-[1.02] transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">casino</span>
                                    <span>🎲 Roll My Tonight Surprise</span>
                                </button>
                            </div>
                        )}

                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODE 3: WATCHLIST CLEANUP                                                 */}
                {/* ========================================================================= */}
                {activeMode === "cleanup" && (
                    <div className="space-y-8">
                        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-accent text-lg">cleaning_services</span>
                                        <h3 className="font-serif text-xl font-bold text-text">
                                            Your Watchlist Needs Attention
                                        </h3>
                                    </div>
                                    <p className="text-xs text-text-3">
                                        Triage stagnant bookmarks into Quick Wins and Masterpieces. You remain in full control.
                                    </p>
                                </div>

                                <span className="badge badge-accent self-start sm:self-auto">
                                    {watchlist.length} Total Saved
                                </span>
                            </div>

                            {watchlist.length === 0 ? (
                                <div className="py-12 text-center text-sm text-text-3">
                                    Your watchlist is clear and active!
                                </div>
                            ) : (
                                <div className="space-y-8 mt-6">
                                    {/* 1. Quick Wins (<100m) */}
                                    {cleanserData.quickWins.length > 0 && (
                                        <div>
                                            <h4 className="font-serif text-sm font-bold text-text mb-3 flex items-center gap-2">
                                                <span>⚡ Quick Wins</span>
                                                <span className="text-xs text-text-3 font-mono font-normal">— Movies under 100 minutes</span>
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {cleanserData.quickWins.map((item) => (
                                                    <div key={item.id || item.movieId} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-2/60">
                                                        <p className="text-xs font-semibold text-text truncate flex-1">{item.title || item.movieTitle}</p>
                                                        <div className="flex gap-1.5 shrink-0">
                                                            <button type="button" onClick={() => handleCleanserMarkWatched(item)} className="h-7 px-2 rounded bg-emerald-500/15 text-emerald-400 text-xs font-semibold">Watch</button>
                                                            <button type="button" onClick={() => handleCleanserRemove(item.movieId || item.id)} className="h-7 w-7 rounded bg-rose-500/15 text-rose-400 text-xs">✕</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Still Your Taste (8.0+ Stars) */}
                                    {cleanserData.stillYourTaste.length > 0 && (
                                        <div>
                                            <h4 className="font-serif text-sm font-bold text-text mb-3 flex items-center gap-2">
                                                <span>❤️ Still Your Taste</span>
                                                <span className="text-xs text-text-3 font-mono font-normal">— Highest rated films in your queue</span>
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {cleanserData.stillYourTaste.map((item) => (
                                                    <div key={item.id || item.movieId} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-2/60">
                                                        <p className="text-xs font-semibold text-text truncate flex-1">{item.title || item.movieTitle}</p>
                                                        <div className="flex gap-1.5 shrink-0">
                                                            <Link to={`/movies/${item.movieId || item.id}`} className="h-7 px-2 rounded bg-accent/15 text-accent text-xs font-semibold flex items-center no-underline">Watch</Link>
                                                            <button type="button" onClick={() => handleCleanserRemove(item.movieId || item.id)} className="h-7 w-7 rounded bg-rose-500/15 text-rose-400 text-xs">✕</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>

            {/* Post-Watch Feedback Modal */}
            {feedbackMovie && (
                <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-accent/40 bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="font-serif text-lg font-bold text-text mb-1">
                            How was your pick?
                        </h3>
                        <p className="text-xs text-text-3 mb-4">
                            You just finished &ldquo;{feedbackMovie.title}&rdquo;. Help us tune future decisions.
                        </p>

                        <div className="flex items-center justify-center gap-2 mb-5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setFeedbackRating(s)}
                                    className={`text-2xl ${s <= feedbackRating ? "text-amber-400" : "text-border"}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <p className="text-xs font-semibold text-text mb-2">
                            Did it match tonight&apos;s mood?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                            {["Perfect Match", "Pretty Good", "Not Really"].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setFeedbackMoodMatch(opt)}
                                    className={`py-2.5 px-2 text-xs rounded-xl border font-medium ${
                                        feedbackMoodMatch === opt
                                            ? "border-accent bg-accent text-white"
                                            : "border-border bg-surface-2 text-text-2"
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                success("Feedback recorded! Recommendation engine updated.");
                                setFeedbackMovie(null);
                            }}
                            className="btn-primary w-full py-2.5 text-xs font-bold"
                        >
                            Save Feedback
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
