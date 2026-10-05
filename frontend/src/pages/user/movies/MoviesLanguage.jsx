import { useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import LanguageTile from "../../../components/common/LanguageTile.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";
import {
    getLanguages,
    getTopMovieLanguage
} from "../../../services/movieService.js";

// Curated world cinema languages prioritized by film industry output & cultural impact
const PRIORITY_CINEMA_LANGUAGES = [
    { code: "te", name: "Telugu", fallbackTitle: "RRR", fallbackPoster: "/wE0Q2ooxjNteflKkWs98uJ18Y7t.jpg", region: "Indian" },
    { code: "hi", name: "Hindi", fallbackTitle: "Dangal", fallbackPoster: "/yI6X2cW9Yn0PxvtAv2zKpB9xGb5.jpg", region: "Indian" },
    { code: "en", name: "English", fallbackTitle: "The Shawshank Redemption", fallbackPoster: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", region: "International" },
    { code: "ta", name: "Tamil", fallbackTitle: "Vikram", fallbackPoster: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", region: "Indian" },
    { code: "ml", name: "Malayalam", fallbackTitle: "Drishyam", fallbackPoster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", region: "Indian" },
    { code: "kn", name: "Kannada", fallbackTitle: "Kantara", fallbackPoster: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", region: "Indian" },
    { code: "ja", name: "Japanese", fallbackTitle: "Spirited Away", fallbackPoster: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", region: "Asian" },
    { code: "ko", name: "Korean", fallbackTitle: "Parasite", fallbackPoster: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", region: "Asian" },
    { code: "fr", name: "French", fallbackTitle: "Amélie", fallbackPoster: "/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", region: "European" },
    { code: "es", name: "Spanish", fallbackTitle: "Pan's Labyrinth", fallbackPoster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", region: "European" },
    { code: "it", name: "Italian", fallbackTitle: "Cinema Paradiso", fallbackPoster: "/8SRUuv5V3Eampa32TlVO5iyumPL.jpg", region: "European" },
    { code: "de", name: "German", fallbackTitle: "The Lives of Others", fallbackPoster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", region: "European" },
    { code: "zh", name: "Chinese (Mandarin)", fallbackTitle: "Crouching Tiger, Hidden Dragon", fallbackPoster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", region: "Asian" },
    { code: "cn", name: "Cantonese", fallbackTitle: "In the Mood for Love", fallbackPoster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", region: "Asian" },
    { code: "bn", name: "Bengali", fallbackTitle: "Pather Panchali", fallbackPoster: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", region: "Indian" },
    { code: "ru", name: "Russian", fallbackTitle: "Stalker", fallbackPoster: "/69Sns8WoET6CfaYlIkHbla4l7nC.jpg", region: "European" },
    { code: "sv", name: "Swedish", fallbackTitle: "The Seventh Seal", fallbackPoster: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg", region: "European" },
    { code: "da", name: "Danish", fallbackTitle: "Another Round", fallbackPoster: "/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg", region: "European" },
    { code: "pl", name: "Polish", fallbackTitle: "The Pianist", fallbackPoster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", region: "European" },
    { code: "pt", name: "Portuguese", fallbackTitle: "City of God", fallbackPoster: "/ty8TGRuvJLPUmAR1r1tiDiXqQJb.jpg", region: "European" },
    { code: "tr", name: "Turkish", fallbackTitle: "Winter Sleep", fallbackPoster: "/yz4QVqPx3h1hD1NQIsvaqjnLduG.jpg", region: "Middle Eastern" },
    { code: "fa", name: "Persian", fallbackTitle: "A Separation", fallbackPoster: "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg", region: "Middle Eastern" },
    { code: "ar", name: "Arabic", fallbackTitle: "Capernaum", fallbackPoster: "/gQB8Y5R6Zu0A9OlVvxNmFdrvVbh.jpg", region: "Middle Eastern" },
    { code: "no", name: "Norwegian", fallbackTitle: "The Worst Person in the World", fallbackPoster: "/nT97ifL2A4AvFe4V1Znv8fn0Fbd.jpg", region: "European" },
    { code: "nl", name: "Dutch", fallbackTitle: "Black Book", fallbackPoster: "/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg", region: "European" },
    { code: "id", name: "Indonesian", fallbackTitle: "The Raid", fallbackPoster: "/uDO8zWDhfWwoFdKS4fzkVJb0Rf0.jpg", region: "Asian" },
    { code: "th", name: "Thai", fallbackTitle: "Ong-Bak", fallbackPoster: "/5K7cOHoay2mZ9quGzPWdsYsv1Pq.jpg", region: "Asian" },
    { code: "mr", name: "Marathi", fallbackTitle: "Sairat", fallbackPoster: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", region: "Indian" },
    { code: "pa", name: "Punjabi", fallbackTitle: "Carry on Jatta", fallbackPoster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", region: "Indian" }
];

const INITIAL_FALLBACK_CACHE = {};
for (const p of PRIORITY_CINEMA_LANGUAGES) {
    INITIAL_FALLBACK_CACHE[p.code] = {
        title: p.fallbackTitle,
        poster_path: p.fallbackPoster
    };
}

const REGION_FILTERS = [
    { label: "All Languages", value: "All" },
    { label: "Indian Cinema", value: "Indian" },
    { label: "Asian Cinema", value: "Asian" },
    { label: "European Cinema", value: "European" },
    { label: "Middle Eastern", value: "Middle Eastern" }
];

function MoviesLanguage() {
    useDocumentTitle("Cinema by Language");

    const [languages, setLanguages] = useState([]);
    const [movies, setMovies] = useState(() => {
        try {
            const cached = localStorage.getItem("cinephile_lang_movies_cache");
            return cached
                ? { ...INITIAL_FALLBACK_CACHE, ...JSON.parse(cached) }
                : INITIAL_FALLBACK_CACHE;
        } catch {
            return INITIAL_FALLBACK_CACHE;
        }
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const initializeLanguages = async () => {
            try {
                const data = await getLanguages();
                if (!Array.isArray(data)) return;

                // Sort: Prioritize major world cinema languages at the top, then alphabetically
                const priorityCodes = new Set(PRIORITY_CINEMA_LANGUAGES.map((p) => p.code));
                const priorityItems = [];
                const otherItems = [];

                for (const p of PRIORITY_CINEMA_LANGUAGES) {
                    const match = data.find((l) => l.iso_639_1 === p.code);
                    if (match) {
                        priorityItems.push({
                            ...match,
                            region: p.region,
                            english_name: p.name || match.english_name
                        });
                    } else {
                        priorityItems.push({
                            iso_639_1: p.code,
                            english_name: p.name,
                            region: p.region
                        });
                    }
                }

                for (const l of data) {
                    if (!priorityCodes.has(l.iso_639_1) && l.english_name?.trim()) {
                        otherItems.push({
                            ...l,
                            region: "Other"
                        });
                    }
                }

                otherItems.sort((a, b) => a.english_name.localeCompare(b.english_name));
                const allSorted = [...priorityItems, ...otherItems];

                if (isMounted) {
                    setLanguages(allSorted);
                    // Unblock loading state immediately so the user can interact instantly
                    setLoading(false);
                }

                // Batch fetch top movies in parallel (batches of 6) to avoid sequential lag
                const toFetch = allSorted.slice(0, 45);
                const batchSize = 6;

                for (let i = 0; i < toFetch.length; i += batchSize) {
                    if (!isMounted) break;
                    const batch = toFetch.slice(i, i + batchSize);

                    const results = await Promise.allSettled(
                        batch.map(async (lang) => {
                            try {
                                const res = await getTopMovieLanguage(lang.iso_639_1);
                                if (res?.results && res.results.length > 0) {
                                    // Pick first movie that has a valid poster
                                    const withPoster = res.results.find((m) => m.poster_path);
                                    if (withPoster) {
                                        return {
                                            code: lang.iso_639_1,
                                            movie: {
                                                title: withPoster.title || withPoster.original_title,
                                                poster_path: withPoster.poster_path
                                            }
                                        };
                                    }
                                }
                            } catch {
                                // Silent skip for unavailable language
                            }
                            return null;
                        })
                    );

                    if (isMounted) {
                        setMovies((prev) => {
                            const updated = { ...prev };
                            let changed = false;

                            for (const r of results) {
                                if (r.status === "fulfilled" && r.value?.code) {
                                    updated[r.value.code] = r.value.movie;
                                    changed = true;
                                }
                            }

                            if (changed) {
                                try {
                                    localStorage.setItem(
                                        "cinephile_lang_movies_cache",
                                        JSON.stringify(updated)
                                    );
                                } catch {
                                    // Quota exceeded safe handling
                                }
                            }

                            return updated;
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load languages:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initializeLanguages();

        return () => {
            isMounted = false;
        };
    }, []);

    // Filter languages based on search input & region filter
    const filteredLanguages = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();

        return languages.filter((language) => {
            const matchesQuery =
                !query ||
                language.english_name?.toLowerCase().includes(query) ||
                language.iso_639_1?.toLowerCase().includes(query);

            const matchesRegion =
                selectedRegion === "All" || language.region === selectedRegion;

            return matchesQuery && matchesRegion;
        });
    }, [languages, searchTerm, selectedRegion]);

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text antialiased font-sans">
            <Navbar />

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
                {/* Section Header */}
                <div className="section-header mb-6">
                    <div>
                        <p className="label-caps mb-1">World Cinema</p>
                        <h1 className="section-title text-3xl sm:text-4xl">
                            Cinema by Language
                        </h1>
                        <p className="text-text-3 text-xs sm:text-sm mt-1">
                            Explore cinematic cultures, masterworks, and movements across global linguistic traditions.
                        </p>
                    </div>

                    <span className="badge badge-accent">
                        {filteredLanguages.length} Languages
                    </span>
                </div>

                {/* Search Bar & Region Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    {/* Search */}
                    <div className="relative w-full max-w-md">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3 text-[18px]">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search by language (e.g. Telugu, Japanese, French)…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mc-input pl-11 rounded-lg text-sm w-full"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text p-1 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        )}
                    </div>

                    {/* Region Filter Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                        {REGION_FILTERS.map((r) => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => setSelectedRegion(r.value)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                                    selectedRegion === r.value
                                        ? "bg-accent text-bg shadow-sm"
                                        : "bg-surface-2 text-text-2 border border-border hover:border-accent/40 hover:text-text"
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language Tiles Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] w-full skeleton rounded-xl" />
                        ))}
                    </div>
                ) : filteredLanguages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {filteredLanguages.map((language) => {
                            const movie = movies[language.iso_639_1];
                            const poster = movie?.poster_path;
                            const imageUrl = poster
                                ? (poster.startsWith("http")
                                    ? poster
                                    : `https://image.tmdb.org/t/p/w342${poster}`)
                                : null;

                            return (
                                <LanguageTile
                                    key={language.iso_639_1}
                                    title={language.english_name}
                                    subtitle={movie?.title}
                                    to={`/languages/${language.iso_639_1}`}
                                    imageUrl={imageUrl}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-16 text-center text-text-3">
                        <span className="material-symbols-outlined text-4xl mb-2 text-accent/40 block">
                            language
                        </span>
                        <p className="text-base text-text font-medium">No languages found</p>
                        <p className="text-xs text-text-3 mt-1">Try searching for a different language name or code.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default MoviesLanguage;