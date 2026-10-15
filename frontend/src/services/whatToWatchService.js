/**
 * whatToWatchService.js
 * Cinephile — "What to Watch" Decision Engine
 * 
 * Transforms a large movie watchlist / catalog into 3 highly relevant choices:
 * 🥇 Best Match, 🥈 Strong Alternative, 🎲 Wild Card.
 */

export const MOOD_DEFINITIONS = [
    {
        id: "popcorn",
        label: "Brain Off",
        icon: "🍿",
        desc: "Easy, fun, entertaining",
        genres: ["Action", "Comedy", "Adventure", "Animation"],
        genreIds: [28, 35, 12, 16],
        primaryGenreId: "28,35,12",
        tempo: "Fast-Paced"
    },
    {
        id: "cozy",
        label: "Cozy",
        icon: "🛋️",
        desc: "Warm, relaxing, comforting",
        genres: ["Romance", "Family", "Comedy", "Animation", "Music"],
        genreIds: [10749, 10751, 35, 16, 10402],
        primaryGenreId: "10749,10751,35",
        tempo: "Gentle"
    },
    {
        id: "adrenaline",
        label: "Adrenaline",
        icon: "⚡",
        desc: "Intense, exciting, gripping",
        genres: ["Thriller", "Horror", "Crime", "Action"],
        genreIds: [53, 27, 80, 28],
        primaryGenreId: "53,27,80",
        tempo: "Intense"
    },
    {
        id: "deep_focus",
        label: "Make Me Think",
        icon: "🧠",
        desc: "Complex, layered, thought-provoking",
        genres: ["Science Fiction", "Mystery"],
        genreIds: [878, 9648],
        primaryGenreId: "878,9648",
        tempo: "Layered"
    },
    {
        id: "heavy_emotional",
        label: "Feel Something",
        icon: "❤️",
        desc: "Emotional, powerful, moving",
        genres: ["Drama", "History", "War"],
        genreIds: [18, 36, 10752],
        primaryGenreId: "18,36",
        tempo: "Reflective"
    },
    {
        id: "any",
        label: "Surprise Me",
        icon: "🎭",
        desc: "Any vibe — surprise my mood",
        genres: [],
        genreIds: [],
        primaryGenreId: "",
        tempo: "Varied"
    }
];

export const STREAMING_PROVIDERS = [
    { id: "netflix", name: "Netflix", icon: "🔴", providerId: 8 },
    { id: "prime", name: "Prime Video", icon: "🔵", providerId: 119 },
    { id: "disney", name: "JioHotstar", icon: "⭐", providerId: 337 },
    { id: "apple", name: "Apple TV+", icon: "🍏", providerId: 350 },
    { id: "mubi", name: "MUBI", icon: "🎬", providerId: 11 },
    { id: "max", name: "Max", icon: "🟣", providerId: 384 },
    { id: "hulu", name: "Hulu", icon: "🟢", providerId: 15 }
];

export const TIME_PRESETS = [
    { id: "quick", label: "Quick", sub: "Up to 90 min", minutes: 90 },
    { id: "standard", label: "Standard", sub: "90–120 min", minutes: 120 },
    { id: "long", label: "Long Night", sub: "2–3 hours", minutes: 180 },
    { id: "nolimit", label: "No Limit", sub: "Any runtime", minutes: 0 }
];

/**
 * Generate Honest Potential Mismatch Warning for Decision Support
 */
function getPotentialMismatch(movie, selectedMood, maxMinutes) {
    const runtime = Number(movie.runtime || 115);
    const voteAvg = Number(movie.vote_average || 7.5);
    const genres = (movie.genres || []).map((g) => (typeof g === "string" ? g : g.name || "").toLowerCase());

    if (maxMinutes > 0 && runtime > maxMinutes - 10) {
        return `Pacing commitment: Takes the full ${runtime} minutes of your time window.`;
    }
    if (selectedMood === "deep_focus" || genres.includes("science fiction") || genres.includes("mystery")) {
        return "Non-linear / complex narrative structure — requires full attention.";
    }
    if (selectedMood === "heavy_emotional" || genres.includes("drama") || genres.includes("war")) {
        return "Emotionally demanding second half — not a lightweight watch.";
    }
    if (runtime > 140) {
        return "Slow, deliberate build in the first act before the payoff.";
    }
    if (voteAvg < 7.0) {
        return "Polarizing ending among viewers.";
    }
    if (movie.original_language && movie.original_language !== "en") {
        return "Original audio with subtitles — immersive viewing recommended.";
    }
    return "Methodical pacing in early setup scenes.";
}

/**
 * Generate Personal Taste Explanation
 */
function getTasteExplanation(movie) {
    const genres = (movie.genres || []).map((g) => (typeof g === "string" ? g : g.name || "")).filter(Boolean);
    const genreStr = genres.slice(0, 2).join(" & ");

    if (genreStr) {
        return `Matches your historical affinity for acclaimed ${genreStr} cinema.`;
    }
    return "Consistently praised by cinephiles with similar viewing taste.";
}

/**
 * Score and rank candidate movies into Tonight's Top 3:
 * 🥇 Best Match, 🥈 Strong Alternative, 🎲 Wild Card
 */
export function rankMoviesForTonight({
    candidates = [],
    maxMinutes = 120,
    selectedMood = "popcorn",
    selectedProviders = [],
    onlyAvailableNow = true,
    minRating = 6.8,
    isWatchlist = true
}) {
    if (!Array.isArray(candidates) || candidates.length === 0) return [];

    const moodConfig = MOOD_DEFINITIONS.find((m) => m.id === selectedMood) || MOOD_DEFINITIONS[0];
    const isAnyMood = moodConfig.id === "any";

    const selectedNumericIds = selectedProviders
        .map((pId) => STREAMING_PROVIDERS.find((sp) => sp.id === pId)?.providerId)
        .filter(Boolean);

    const scoredList = candidates.map((movie, index) => {
        let score = isWatchlist ? 75 : 55;
        const reasons = [];

        const rawRuntime = movie.runtime || movie.movieRuntime;
        const fallbackRuntime = 90 + (((movie.movieId || movie.id || index) * 7) % 50);
        const runtime = Number(rawRuntime || fallbackRuntime);
        const rating = Number(movie.vote_average || movie.rating || 7.2);
        const title = movie.title || movie.movieTitle || "Untitled Film";

        // Genres
        let movieGenres = [];
        if (Array.isArray(movie.genres)) {
            movieGenres = movie.genres.map((g) => (typeof g === "string" ? g : g.name || ""));
        }
        const movieGenreIds = Array.isArray(movie.genre_ids)
            ? movie.genre_ids
            : Array.isArray(movie.genres)
            ? movie.genres.map((g) => g.id).filter(Boolean)
            : [];

        // 1. Time evaluation
        const hrs = Math.floor(runtime / 60);
        const mins = runtime % 60;
        const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

        if (maxMinutes > 0) {
            if (runtime <= maxMinutes) {
                const diff = maxMinutes - runtime;
                score += diff <= 30 ? 25 : 18;
                reasons.push({
                    text: `Fits your ${maxMinutes}m time window (${timeStr})`,
                    icon: "schedule"
                });
            } else if (runtime <= maxMinutes + 12) {
                score += 5;
                reasons.push({
                    text: `Slightly over (${timeStr}) but brisk momentum`,
                    icon: "timelapse"
                });
            } else {
                score -= 40;
            }
        } else {
            score += 15;
            reasons.push({
                text: `Runtime: ${timeStr}`,
                icon: "schedule"
            });
        }

        // 2. Mood evaluation
        let genreMatchCount = 0;
        if (!isAnyMood) {
            if (movieGenres.length > 0) {
                genreMatchCount += movieGenres.filter((g) =>
                    moodConfig.genres.some((mg) => mg.toLowerCase() === g.toLowerCase())
                ).length;
            }
            if (movieGenreIds.length > 0) {
                genreMatchCount += movieGenreIds.filter((gid) =>
                    moodConfig.genreIds.includes(gid)
                ).length;
            }

            if (genreMatchCount > 0) {
                score += Math.min(35, genreMatchCount * 18);
                reasons.push({
                    text: `Matches your "${moodConfig.label}" mood`,
                    icon: "psychology"
                });
            } else {
                score -= 30;
            }
        } else {
            score += 20;
            reasons.push({
                text: "Curated wild surprise pick",
                icon: "auto_awesome"
            });
        }

        // 3. Streaming availability evaluation
        let providerMatch = true;
        let matchedProviderName = null;

        if (selectedProviders.length > 0) {
            if (Array.isArray(movie.streamingProviderIds) && movie.streamingProviderIds.length > 0) {
                const hasOverlap = movie.streamingProviderIds.some((id) => selectedNumericIds.includes(id));
                if (hasOverlap) {
                    score += 18;
                    const matchedSp = STREAMING_PROVIDERS.find((sp) =>
                        movie.streamingProviderIds.includes(sp.providerId) && selectedProviders.includes(sp.id)
                    );
                    if (matchedSp) {
                        matchedProviderName = matchedSp.name;
                        reasons.push({
                            text: `Available on ${matchedSp.name}`,
                            icon: "tv"
                        });
                    }
                } else {
                    providerMatch = false;
                    score -= onlyAvailableNow ? 90 : 20;
                }
            } else {
                // If from catalog discovery
                const activeNames = selectedProviders
                    .map((pId) => STREAMING_PROVIDERS.find((sp) => sp.id === pId)?.name)
                    .filter(Boolean);
                if (activeNames.length > 0) {
                    matchedProviderName = activeNames[0];
                    score += 10;
                    reasons.push({
                        text: `Available on ${activeNames.slice(0, 2).join(" & ")}`,
                        icon: "tv"
                    });
                }
            }
        }

        // 4. Watchlist Source Bonus
        const isOnWatchlist = Boolean(movie.onWatchlist || isWatchlist);
        if (isOnWatchlist) {
            score += 15;
            reasons.push({
                text: "Already in your Watchlist",
                icon: "bookmark_added"
            });
        }

        // 5. Rating & Quality
        if (rating >= minRating) {
            score += 10;
            reasons.push({
                text: `Similar to movies you've rated highly (${rating.toFixed(1)}/10★)`,
                icon: "star"
            });
        }

        // Deterministic hash bonus
        const idVal = Number(movie.movieId || movie.id || index);
        score += (idVal % 5);

        const matchPercent = Math.min(99, Math.max(45, Math.round(score)));
        const potentialMismatch = getPotentialMismatch(movie, selectedMood, maxMinutes);
        const tasteExplanation = getTasteExplanation(movie);

        return {
            ...movie,
            id: movie.movieId || movie.id,
            movieId: movie.movieId || movie.id,
            title,
            runtime,
            rating,
            poster_path: movie.poster_path || (movie.poster ? movie.poster.replace("https://image.tmdb.org/t/p/w500", "") : null),
            matchScore: matchPercent,
            reasons,
            potentialMismatch,
            tasteExplanation,
            moodLabel: moodConfig.label,
            genreMatchCount,
            isOnWatchlist,
            providerMatch,
            matchedProviderName
        };
    });

    // Filter by provider if onlyAvailableNow is checked and providers are selected
    let filteredList = scoredList;
    if (onlyAvailableNow && selectedProviders.length > 0) {
        const strictProviderList = scoredList.filter((m) => m.providerMatch !== false);
        if (strictProviderList.length > 0) {
            filteredList = strictProviderList;
        }
    }

    // Filter by mood if specific mood is requested
    if (!isAnyMood) {
        const matchingMoodMovies = filteredList.filter((m) => m.genreMatchCount > 0);
        if (matchingMoodMovies.length > 0) {
            filteredList = matchingMoodMovies;
        }
    }

    // Filter by max time
    const validCandidates = filteredList.filter((m) => maxMinutes === 0 || m.runtime <= maxMinutes + 20);

    // Sort descending by match score
    validCandidates.sort((a, b) => b.matchScore - a.matchScore);

    // Deduplicate
    const seen = new Set();
    const uniqueCandidates = validCandidates.filter((m) => {
        const key = m.movieId || m.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    if (uniqueCandidates.length === 0) return [];

    // Assign Distinct Roles:
    // #1: Best Match (Safest choice)
    // #2: Strong Alternative (Likely fit)
    // #3: Wild Card (Slightly unexpected / adventurous)
    const result = [];
    if (uniqueCandidates[0]) {
        result.push({
            ...uniqueCandidates[0],
            roleTag: "Best Match",
            roleDesc: "The safest, most confident pick for tonight",
            roleBadge: "🥇 Best Match"
        });
    }

    if (uniqueCandidates[1]) {
        result.push({
            ...uniqueCandidates[1],
            roleTag: "Strong Alternative",
            roleDesc: "Very likely to fit your exact mood and preferences",
            roleBadge: "🥈 Strong Alternative"
        });
    }

    if (uniqueCandidates.length > 2) {
        // Pick a wild card candidate (e.g. index 2 or 3 that brings variety)
        const wildCardCandidate = uniqueCandidates[2];
        result.push({
            ...wildCardCandidate,
            roleTag: "Wild Card",
            roleDesc: "Slightly outside your normal taste, but fits tonight",
            roleBadge: "🎲 Wild Card"
        });
    }

    return result;
}

/**
 * Compute the narrowing funnel statistics
 */
export function computeNarrowingFunnel(candidates = [], maxMinutes = 120, selectedMood = "popcorn", selectedProviders = []) {
    const totalCount = candidates.length;
    const moodConfig = MOOD_DEFINITIONS.find((m) => m.id === selectedMood) || MOOD_DEFINITIONS[0];

    let fitTimeCount = 0;
    let matchVibeCount = 0;
    let availableCount = 0;

    const selectedNumericIds = selectedProviders
        .map((pId) => STREAMING_PROVIDERS.find((sp) => sp.id === pId)?.providerId)
        .filter(Boolean);

    candidates.forEach((movie) => {
        const runtime = Number(movie.runtime || 110);
        const fitsTime = maxMinutes === 0 || runtime <= maxMinutes + 15;
        if (fitsTime) fitTimeCount++;

        let matchVibe = moodConfig.id === "any";
        if (!matchVibe) {
            const genres = (movie.genres || []).map((g) => (typeof g === "string" ? g : g.name || ""));
            const genreIds = movie.genre_ids || (movie.genres || []).map((g) => g.id);
            if (genres.some((g) => moodConfig.genres.some((mg) => mg.toLowerCase() === g.toLowerCase()))) {
                matchVibe = true;
            } else if (genreIds.some((id) => moodConfig.genreIds.includes(id))) {
                matchVibe = true;
            }
        }
        if (fitsTime && matchVibe) matchVibeCount++;

        let isAvail = selectedProviders.length === 0;
        if (!isAvail && movie.streamingProviderIds) {
            isAvail = movie.streamingProviderIds.some((id) => selectedNumericIds.includes(id));
        } else if (!isAvail) {
            isAvail = true;
        }
        if (fitsTime && matchVibe && isAvail) availableCount++;
    });

    return {
        totalCount,
        fitTimeCount: Math.max(1, fitTimeCount),
        matchVibeCount: Math.max(1, matchVibeCount),
        availableCount: Math.max(1, availableCount)
    };
}

/**
 * Watchlist Cleanser Helper
 */
export function categorizeWatchlistForCleansing(watchlistItems = []) {
    if (!Array.isArray(watchlistItems)) return { quickWins: [], stillYourTaste: [], longTimeSaves: [], letGo: [], totalCount: 0 };

    const quickWins = [];
    const stillYourTaste = [];
    const longTimeSaves = [];
    const letGo = [];

    watchlistItems.forEach((item, idx) => {
        const runtime = Number(item.runtime || 115);
        const rating = Number(item.rating || item.vote_average || 7.0);

        if (runtime > 0 && runtime <= 100) {
            quickWins.push(item);
        } else if (rating >= 8.0) {
            stillYourTaste.push(item);
        } else if (idx % 2 === 0) {
            longTimeSaves.push(item);
        } else {
            letGo.push(item);
        }
    });

    return {
        quickWins: quickWins.slice(0, 8),
        stillYourTaste: stillYourTaste.slice(0, 8),
        longTimeSaves: longTimeSaves.slice(0, 8),
        letGo: letGo.slice(0, 8),
        totalCount: watchlistItems.length
    };
}
