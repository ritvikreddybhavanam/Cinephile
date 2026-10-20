/**
 * Landing Page Data Orchestration & De-duplication Utility
 *
 * Ensures that every discovery section on the Cinephile landing page
 * receives distinct, high-quality, relevant film candidates without
 * redundant duplication across Hero, Theatrical, Trending, Streaming,
 * Popular, Acclaimed, Hidden Gems, and Spotlight sections.
 */

import { getPosterUrl, getBackdropUrl } from "../services/movieService";

export const DEFAULT_GENRES = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

/**
 * Normalizes raw TMDB/API movie object into a standard Cinephile film entity.
 */
export function formatMovie(movie, genresObj = DEFAULT_GENRES) {
    if (!movie) return null;

    const genreNames = (movie.genre_ids || (movie.genres ? movie.genres.map(g => g.id) : []))
        .map((id) => genresObj[id] || (typeof id === "object" ? id.name : null))
        .filter(Boolean)
        .slice(0, 2)
        .join(" / ");

    const releaseDate = movie.release_date || movie.first_air_date || "";
    const year = releaseDate ? releaseDate.substring(0, 4) : "";
    const numRating = movie.vote_average ? Number(movie.vote_average) : 0;

    return {
        id: Number(movie.id),
        title: movie.title || movie.original_title || movie.name || "Untitled",
        poster: movie.poster_path ? getPosterUrl(movie.poster_path) : (movie.poster || null),
        backdrop: movie.backdrop_path ? getBackdropUrl(movie.backdrop_path) : (movie.backdrop || null),
        rating: numRating > 0 ? numRating.toFixed(1) : "—",
        rawRating: numRating,
        voteCount: movie.vote_count || 0,
        year: year || "Cinema",
        releaseDate,
        genre: genreNames || (Array.isArray(movie.genres) ? movie.genres.map(g => g.name).slice(0, 2).join(" / ") : "Cinema"),
        genreIds: movie.genre_ids || [],
        overview: movie.overview || "No overview available.",
        originalLanguage: movie.original_language ? movie.original_language.toUpperCase() : "EN",
        popularity: movie.popularity || 0,
        providers: movie.providers || null,
        editorialNote: movie.editorialNote || null,
        badge: movie.badge || null
    };
}

/**
 * Deduplicates an array of candidate films based on their numeric ID.
 */
export function dedupeCandidates(list = []) {
    const seen = new Set();
    const result = [];
    for (const item of list) {
        if (!item || !item.id) continue;
        const id = Number(item.id);
        if (!seen.has(id)) {
            seen.add(id);
            result.push(item);
        }
    }
    return result;
}

/**
 * Shared movie selection strategy across all prominent landing sections.
 *
 * Prioritizes reservation order:
 * 1. Hero Slideshow (prominent featured discovery)
 * 2. Editorial Spotlight (critics highlight with custom reason)
 * 3. Now Showing (theatrical films in cinema)
 * 4. Trending Today (momentum ranking)
 * 5. Fresh on OTT (streaming releases with providers)
 * 6. Popular This Week (weekly global interest)
 * 7. Critically Acclaimed (top rated films with sufficient vote counts)
 * 8. Hidden Gems (cult classics / underappreciated global cinema)
 * 9. Recently Released (fresh productions)
 */
export function orchestrateLandingData({
    heroCandidates = [],
    theatricalCandidates = [],
    trendingCandidates = [],
    streamingCandidates = [],
    popularCandidates = [],
    acclaimedCandidates = [],
    gemsCandidates = [],
    spotlightCandidates = [],
    recentCandidates = []
} = {}, limits = {}) {
    const {
        heroLimit = 4,
        theatricalLimit = 5,
        trendingLimit = 6,
        streamingLimit = 5,
        popularLimit = 5,
        acclaimedLimit = 5,
        gemsLimit = 5,
        recentLimit = 5
    } = limits;

    const usedIds = new Set();

    // 1. Hero allocation: select high-quality visual films with backdrops
    const heroSlides = [];
    for (const m of dedupeCandidates(heroCandidates)) {
        if (m.backdrop && !usedIds.has(m.id)) {
            heroSlides.push(m);
            usedIds.add(m.id);
            if (heroSlides.length >= heroLimit) break;
        }
    }
    // Fallback if none had backdrops
    if (heroSlides.length === 0 && heroCandidates.length > 0) {
        heroSlides.push(heroCandidates[0]);
        usedIds.add(heroCandidates[0].id);
    }

    // 2. Editorial Spotlight: pick a standout film with great synopsis & rating
    let spotlight = null;
    const spotlightPool = dedupeCandidates(
        spotlightCandidates.concat(acclaimedCandidates).concat(heroCandidates)
    );
    for (const m of spotlightPool) {
        if (!usedIds.has(m.id) && m.backdrop && m.overview && m.rawRating >= 7.0) {
            spotlight = m;
            usedIds.add(m.id);
            break;
        }
    }
    if (!spotlight) {
        for (const m of spotlightPool) {
            if (!usedIds.has(m.id)) {
                spotlight = m;
                usedIds.add(m.id);
                break;
            }
        }
    }

    // Helper allocation function
    const allocate = (pool, maxCount) => {
        const allocated = [];
        for (const m of dedupeCandidates(pool)) {
            if (!usedIds.has(m.id)) {
                allocated.push(m);
                usedIds.add(m.id);
                if (allocated.length >= maxCount) break;
            }
        }
        return allocated;
    };

    // 3. Now Showing (Theatrical discovery)
    const nowShowing = allocate(theatricalCandidates, theatricalLimit);

    // 4. Trending Today (Daily momentum)
    const trending = allocate(trendingCandidates, trendingLimit);

    // 5. Fresh on OTT (Streaming releases)
    const streaming = allocate(streamingCandidates, streamingLimit);

    // 6. Popular This Week (Global popularity)
    const popular = allocate(popularCandidates, popularLimit);

    // 7. Critically Acclaimed (Quality over popularity)
    // Filter out items with very few votes if available
    const acclaimedFiltered = acclaimedCandidates.filter(
        (m) => (m.voteCount === 0 || m.voteCount >= 250) && m.rawRating >= 7.8
    );
    const acclaimed = allocate(
        acclaimedFiltered.length >= 3 ? acclaimedFiltered : acclaimedCandidates,
        acclaimedLimit
    );

    // 8. Hidden Gems (underappreciated, international or cult classics)
    const hiddenGems = allocate(gemsCandidates, gemsLimit);

    // 9. Recently Released (fresh from production)
    const recentReleases = allocate(recentCandidates, recentLimit);

    return {
        heroSlides,
        spotlight,
        nowShowing,
        trending,
        streaming,
        popular,
        acclaimed,
        hiddenGems,
        recentReleases,
        totalAllocated: usedIds.size,
        usedIds: Array.from(usedIds)
    };
}
