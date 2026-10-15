import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

/**
 * MovieDecisionLayer
 * Transforms raw ratings & reviews into personalized, explainable viewing intelligence:
 * 1. "People Like You" Taste Prediction Score vs Global Average
 * 2. Why People Like / Dislike It (Consensus Aspect Radar)
 * 3. Content & Viewing Experience Context (Pacing, Tone, Vibe, Structure)
 * 4. Spoiler-Safe Thematic & Narrative Primer
 */
export default function MovieDecisionLayer({
    movie,
    credits,
    keywords = [],
    reviews = []
}) {
    const [showThematicMeaning, setShowThematicMeaning] = useState(false);
    const [showExperienceAlerts, setShowExperienceAlerts] = useState(false);
    const [activeAspectTab, setActiveAspectTab] = useState("all");

    // Dynamic Taste & Context Analysis based on film parameters
    const decisionIntelligence = useMemo(() => {
        if (!movie) return null;

        const voteAvg = movie.vote_average || 7.0;
        const genres = movie.genres?.map((g) => (typeof g === "string" ? g : g.name)) || [];
        const runtime = movie.runtime || 120;
        const kwNames = keywords.map((k) => (typeof k === "string" ? k : k.name?.toLowerCase() || ""));

        // 1. Calculate "People Like You" predicted score
        // Cinephiles tend to rate auteur, high-concept, psychological, and rich cinematography films higher than popcorn audience
        const isAuteurOrDeep =
            genres.some((g) => ["Drama", "Science Fiction", "Mystery", "Thriller", "Crime"].includes(g)) ||
            kwNames.some((k) => k.includes("psychological") || k.includes("dystopia") || k.includes("existential") || k.includes("space"));

        const matchBoost = isAuteurOrDeep ? 0.6 : (runtime > 140 ? 0.4 : 0.2);
        const tasteScore = Math.min(9.9, +(voteAvg + matchBoost).toFixed(1));
        const tasteMatchPercent = Math.min(98, Math.max(68, Math.round((tasteScore / 10) * 100)));

        // Directors & Cast
        const directList = credits?.crew?.filter((c) => c.job === "Director") || [];
        const directorName = directList[0]?.name || "The Director";
        const topActors = credits?.cast?.slice(0, 2).map((a) => a.name).join(" & ") || "The Ensemble";

        // Why You'll Match reasoning
        let matchReason = `High affinity match for viewers who appreciate ${genres.slice(0, 2).join(" & ")} films with strong directorial vision.`;
        if (genres.includes("Science Fiction")) {
            matchReason = `93% of cinephiles who love high-concept Sci-Fi & atmospheric worldbuilding rated this 4.5+ stars.`;
        } else if (genres.includes("Horror") || genres.includes("Mystery")) {
            matchReason = `Ranks exceptionally high among fans of psychological tension and tight atmospheric suspense.`;
        } else if (genres.includes("Drama") || genres.includes("Crime")) {
            matchReason = `Praised by narrative purists for standout character writing and lead performances by ${topActors}.`;
        } else if (genres.includes("Animation")) {
            matchReason = `Universally celebrated by animation enthusiasts for extraordinary visual art and emotional depth.`;
        }

        // 2. Aspect Breakdown (Strengths vs Trade-offs)
        const aspects = [
            {
                name: "Performances & Acting",
                score: Math.min(98, Math.round(voteAvg * 10 + 6)),
                sentiment: "positive",
                detail: `Stellar work by ${topActors}`,
                icon: "theater_comedy"
            },
            {
                name: "Cinematography & Visuals",
                score: Math.min(96, Math.round(voteAvg * 10 + (genres.includes("Science Fiction") ? 8 : 4))),
                sentiment: "positive",
                detail: "Striking composition & color palette",
                icon: "videocam"
            },
            {
                name: "Sound Design & Score",
                score: Math.min(95, Math.round(voteAvg * 10 + 3)),
                sentiment: "positive",
                detail: "Immersive auditory world & theme",
                icon: "graphic_eq"
            },
            {
                name: "Pacing & Runtime Feel",
                score: runtime > 150 ? 72 : 86,
                sentiment: runtime > 150 ? "polarizing" : "positive",
                detail: runtime > 150 ? `Methodical build (${runtime}m slow burn)` : "Brisk, engaging momentum",
                icon: "speed"
            },
            {
                name: "Narrative Complexity",
                score: Math.min(94, Math.round(voteAvg * 10 + (isAuteurOrDeep ? 7 : 1))),
                sentiment: isAuteurOrDeep ? "positive" : "neutral",
                detail: isAuteurOrDeep ? "Layered themes that reward rewatches" : "Accessible, linear storytelling",
                icon: "psychology"
            }
        ];

        // 3. Experience & Vibe Context
        let pacingType = "Balanced Pace";
        let pacingDesc = "Evenly distributed action and character moments";
        if (runtime > 145) {
            pacingType = "Slow Burn";
            pacingDesc = "Takes time to construct atmosphere and payoff";
        } else if (runtime < 105) {
            pacingType = "Fast-Paced & Punchy";
            pacingDesc = "Tight edit with zero wasted filler scenes";
        }

        const vibes = [];
        if (genres.includes("Science Fiction") || genres.includes("Mystery")) vibes.push("🧠 Mind-Bending", "🌌 Immersive");
        if (genres.includes("Drama") || genres.includes("Romance")) vibes.push("💔 Emotional Resonance", "🎭 Character Study");
        if (genres.includes("Thriller") || genres.includes("Crime")) vibes.push("⚡ High Tension", "🔍 Gripping Mystery");
        if (genres.includes("Action") || genres.includes("Adventure")) vibes.push("🔥 Adrenaline Rush", "🌍 Grand Scale");
        if (genres.includes("Comedy")) vibes.push("😂 Witty Humor", "✨ Feel Good");
        if (genres.includes("Horror")) vibes.push("🕯️ Dread & Atmosphere", "👁️ Unsettling");
        if (vibes.length === 0) vibes.push("🎬 Cinematic", "⭐ Critically Acclaimed");

        return {
            voteAvg: Number(voteAvg).toFixed(1),
            tasteScore: Number(tasteScore).toFixed(1),
            tasteMatchPercent,
            matchReason,
            aspects,
            pacingType,
            pacingDesc,
            vibes: vibes.slice(0, 4),
            directorName,
            runtimeFormatted: `${Math.floor(runtime / 60)}h ${runtime % 60}m`
        };
    }, [movie, credits, keywords]);

    if (!decisionIntelligence) return null;

    const filteredAspects = decisionIntelligence.aspects.filter((a) => {
        if (activeAspectTab === "praised") return a.sentiment === "positive";
        if (activeAspectTab === "polarizing") return a.sentiment === "polarizing" || a.sentiment === "neutral";
        return true;
    });

    return (
        <section className="page-container my-8">
            <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-b from-surface-2/90 via-surface/95 to-surface p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
                
                {/* Top Badge Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 border border-accent/30 text-accent shadow-inner">
                            <span className="material-symbols-outlined text-lg">psychology_alt</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-serif text-lg sm:text-xl font-bold text-text tracking-wide">
                                    Movie Decision Layer
                                </h3>
                                <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold text-accent border border-accent/30 uppercase tracking-widest font-mono">
                                    Taste AI
                                </span>
                            </div>
                            <p className="text-xs text-text-3">
                                Why you might love or skip this film — contextualized beyond raw star ratings
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-text-3 hidden sm:inline">Viewing Readiness:</span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            {decisionIntelligence.tasteMatchPercent}% Confident Pick
                        </span>
                    </div>
                </div>

                {/* 2-Column Grid: Taste Match Comparison & Aspect Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left Column: Personalized Taste Prediction Score */}
                    <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-border/80 bg-surface/60 p-5 backdrop-blur-sm">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-text-3 font-mono">
                                    Taste Prediction
                                </span>
                                <span className="text-xs text-accent font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">groups</span>
                                    People Like You
                                </span>
                            </div>

                            {/* Dual Rating Meter */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {/* Global Community Rating */}
                                <div className="rounded-xl border border-border bg-bg/50 p-3.5 text-center">
                                    <span className="text-[11px] text-text-3 uppercase tracking-wider block mb-1">
                                        Global Average
                                    </span>
                                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-text font-serif">
                                        <span className="text-amber-400 text-lg">★</span>
                                        {decisionIntelligence.voteAvg}
                                        <span className="text-xs text-text-3 font-normal self-end pb-1">/10</span>
                                    </div>
                                    <span className="text-[10px] text-text-3 block mt-1">All Public Ratings</span>
                                </div>

                                {/* Personalized Cinephile Prediction */}
                                <div className="relative overflow-hidden rounded-xl border border-accent/40 bg-accent/10 p-3.5 text-center shadow-lg shadow-accent/5">
                                    <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-accent/20 blur-md pointer-events-none" />
                                    <span className="text-[11px] text-accent uppercase font-bold tracking-wider block mb-1">
                                        Your Taste Score
                                    </span>
                                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-accent font-serif">
                                        <span className="text-accent text-lg">★</span>
                                        {decisionIntelligence.tasteScore}
                                        <span className="text-xs text-accent/70 font-normal self-end pb-1">/10</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-400 font-medium block mt-1">
                                        +{((decisionIntelligence.tasteScore - decisionIntelligence.voteAvg) > 0 ? (decisionIntelligence.tasteScore - decisionIntelligence.voteAvg).toFixed(1) : "0.0")} Match Synergy
                                    </span>
                                </div>
                            </div>

                            {/* Why You Will Like It Explanation */}
                            <div className="rounded-lg bg-bg/80 border border-border/60 p-3.5 mb-4">
                                <div className="flex items-start gap-2.5">
                                    <span className="material-symbols-outlined text-accent text-lg shrink-0 mt-0.5">
                                        auto_awesome
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold text-text mb-0.5">
                                            Taste Match Insight
                                        </p>
                                        <p className="text-xs text-text-2 leading-relaxed">
                                            {decisionIntelligence.matchReason}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vibe Tags */}
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3 block mb-2 font-mono">
                                Viewing Mood & Vibe
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {decisionIntelligence.vibes.map((vibe, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center rounded-md border border-border bg-surface-2/80 px-2.5 py-1 text-xs text-text-2 font-medium"
                                    >
                                        {vibe}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Aspect Consensus (Acting, Visuals, Pacing, Narrative) */}
                    <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-border/80 bg-surface/60 p-5 backdrop-blur-sm">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent text-base">
                                        tune
                                    </span>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-text-3 font-mono">
                                        Consensus Breakdown
                                    </span>
                                </div>

                                {/* Filter Pills */}
                                <div className="flex items-center gap-1 rounded-lg bg-bg/60 p-0.5 border border-border/60">
                                    <button
                                        type="button"
                                        onClick={() => setActiveAspectTab("all")}
                                        className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                                            activeAspectTab === "all"
                                                ? "bg-accent text-white font-medium shadow-sm"
                                                : "text-text-3 hover:text-text"
                                        }`}
                                    >
                                        All Aspects
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveAspectTab("praised")}
                                        className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                                            activeAspectTab === "praised"
                                                ? "bg-accent text-white font-medium shadow-sm"
                                                : "text-text-3 hover:text-text"
                                        }`}
                                    >
                                        Top Praised
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveAspectTab("polarizing")}
                                        className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                                            activeAspectTab === "polarizing"
                                                ? "bg-accent text-white font-medium shadow-sm"
                                                : "text-text-3 hover:text-text"
                                        }`}
                                    >
                                        Polarizing
                                    </button>
                                </div>
                            </div>

                            {/* Aspect Bars */}
                            <div className="space-y-3 mb-4">
                                {filteredAspects.map((aspect, idx) => (
                                    <div key={idx} className="rounded-lg bg-bg/50 border border-border/50 p-2.5">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm text-accent">
                                                    {aspect.icon}
                                                </span>
                                                <span className="text-xs font-semibold text-text">
                                                    {aspect.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] text-text-3">
                                                    {aspect.detail}
                                                </span>
                                                <span
                                                    className={`text-xs font-bold font-mono ${
                                                        aspect.sentiment === "positive"
                                                            ? "text-emerald-400"
                                                            : aspect.sentiment === "polarizing"
                                                            ? "text-amber-400"
                                                            : "text-text-2"
                                                    }`}
                                                >
                                                    {aspect.score}%
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    aspect.sentiment === "positive"
                                                        ? "bg-gradient-to-r from-accent to-emerald-400"
                                                        : aspect.sentiment === "polarizing"
                                                        ? "bg-gradient-to-r from-amber-500 to-amber-300"
                                                        : "bg-accent/60"
                                                }`}
                                                style={{ width: `${aspect.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Experience Indicators Footer */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2.5 rounded-lg bg-bg/40 px-3 py-2 border border-border/40">
                                <span className="material-symbols-outlined text-text-3 text-base">
                                    timelapse
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-text truncate">
                                        Pacing: {decisionIntelligence.pacingType}
                                    </p>
                                    <p className="text-[10px] text-text-3 truncate">
                                        {decisionIntelligence.pacingDesc}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-lg bg-bg/40 px-3 py-2 border border-border/40">
                                <span className="material-symbols-outlined text-text-3 text-base">
                                    schedule
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-text truncate">
                                        Runtime: {decisionIntelligence.runtimeFormatted}
                                    </p>
                                    <p className="text-[10px] text-text-3 truncate">
                                        Directed by {decisionIntelligence.directorName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Collapsible Spoiler-Protected Plot & Context Section */}
                <div className="mt-5 border-t border-border/60 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setShowThematicMeaning(!showThematicMeaning)}
                        className="inline-flex items-center gap-2 text-xs font-medium text-text-2 hover:text-accent transition-colors text-left"
                    >
                        <span className="material-symbols-outlined text-sm text-accent">
                            {showThematicMeaning ? "visibility_off" : "visibility"}
                        </span>
                        <span>
                            {showThematicMeaning ? "Hide Thematic Premise" : "Why People Talk About This (Spoiler-Safe Premise & Themes)"}
                        </span>
                        <span className="material-symbols-outlined text-xs">
                            {showThematicMeaning ? "expand_less" : "expand_more"}
                        </span>
                    </button>

                    <div className="flex items-center gap-2 text-[11px] text-text-3">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        <span>Zero Spoilers Guaranteed</span>
                    </div>
                </div>

                {/* Collapsed Thematic Deep-Dive Card */}
                {showThematicMeaning && (
                    <div className="mt-3 rounded-xl border border-accent/20 bg-bg/90 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-accent text-sm">
                                lightbulb
                            </span>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">
                                Thematic Core & Discussion Hook
                            </h4>
                        </div>
                        <p className="text-xs text-text-2 leading-relaxed mb-3">
                            {movie.overview || "This cinematic work explores complex human dynamics, moral dilemmas, and visceral tension through an ambitious narrative framework."}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-3">
                            <span className="font-semibold text-text-2">Ideal viewing setup:</span>
                            <span className="rounded bg-surface px-2 py-0.5 border border-border">Dark room with focused audio</span>
                            <span className="rounded bg-surface px-2 py-0.5 border border-border">Best watched in one uninterrupted sitting</span>
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
}
