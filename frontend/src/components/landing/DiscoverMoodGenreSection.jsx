import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../common/Icon";
import { getMovies } from "../../services/movieService";
import { formatMovie } from "../../utils/landingOrchestrator";

export const GENRE_ITEMS = [
    { id: 878, label: "Sci-Fi", type: "genre" },
    { id: 53, label: "Thriller", type: "genre" },
    { id: 27, label: "Horror", type: "genre" },
    { id: 80, label: "Crime", type: "genre" },
    { id: 18, label: "Drama", type: "genre" },
    { id: 10749, label: "Romance", type: "genre" },
    { id: 35, label: "Comedy", type: "genre" },
    { id: 16, label: "Animation", type: "genre" },
    { id: 9648, label: "Mystery", type: "genre" },
    { id: 99, label: "Documentary", type: "genre" }
];

export const MOOD_ITEMS = [
    { id: "mind-bending", label: "Mind-Bending", type: "mood", genre: "878,9648", rating: "7.5", desc: "Speculative realities & psychological twists" },
    { id: "comfort-watch", label: "Comfort Watch", type: "mood", genre: "35,16,10751", rating: "7.0", desc: "Uplifting, heartwarming & feel-good cinema" },
    { id: "dark-intense", label: "Dark & Intense", type: "mood", genre: "53,80,27", rating: "7.2", desc: "Gripping noir, relentless suspense & gritty crime" },
    { id: "thought-provoking", label: "Thought-Provoking", type: "mood", genre: "18,99,36", rating: "7.6", desc: "Intellectually deep stories and moral quandaries" },
    { id: "emotional", label: "Emotionally Powerful", type: "mood", genre: "18,10749", rating: "7.5", desc: "Poetic human stories that linger long after" },
    { id: "fast-paced", label: "Fast-Paced Adrenaline", type: "mood", genre: "28,53", rating: "6.8", desc: "High octane action, daring heists & non-stop energy" },
    { id: "unusual", label: "Something Unusual", type: "mood", genre: "14,878", rating: "7.4", desc: "Surreal imagery, auteur visions & cult wonders" }
];

export default function DiscoverMoodGenreSection() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("genres"); // 'genres' | 'moods'
    const [selectedItem, setSelectedItem] = useState(GENRE_ITEMS[0]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchFilteredMovies = async () => {
            setLoading(true);
            setError(null);
            try {
                let params = { page: 1, sortBy: "popularity.desc" };

                if (selectedItem.type === "genre") {
                    params.genre = String(selectedItem.id);
                } else if (selectedItem.type === "mood") {
                    if (selectedItem.genre) params.genre = selectedItem.genre;
                    if (selectedItem.rating) params.rating = selectedItem.rating;
                }

                const res = await getMovies(params);
                const list = res?.results || [];

                if (isMounted) {
                    setMovies(list.slice(0, 5).map((m) => formatMovie(m)));
                }
            } catch (err) {
                console.error("Discover by mood/genre fetch failed:", err);
                if (isMounted) setError("Could not load films for this selection.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchFilteredMovies();
        return () => {
            isMounted = false;
        };
    }, [selectedItem]);

    const handleSelect = (item) => {
        setSelectedItem(item);
    };

    return (
        <section className="page-container" aria-label="Discover by Mood and Genre">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 md:p-10 shadow-card">
                {/* Header */}
                <div className="mb-8 text-center max-w-2xl mx-auto">
                    <p className="label-caps mb-2">Interactive Discovery</p>
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-text tracking-tight">
                        What Are You in the Mood For?
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-text-3">
                        Filter cinema by emotional vibe or curated genre to discover instant viewing ideas
                    </p>

                    {/* Mode Toggle: Mood vs Genre */}
                    <div className="mt-6 inline-flex p-1 rounded-full bg-surface-2 border border-border">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("genres");
                                setSelectedItem(GENRE_ITEMS[0]);
                            }}
                            className={`px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === "genres"
                                    ? "bg-accent text-bg shadow-sm"
                                    : "text-text-3 hover:text-text"
                            }`}
                        >
                            Browse by Genre
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("moods");
                                setSelectedItem(MOOD_ITEMS[0]);
                            }}
                            className={`px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === "moods"
                                    ? "bg-accent text-bg shadow-sm"
                                    : "text-text-3 hover:text-text"
                            }`}
                        >
                            Browse by Mood & Vibe
                        </button>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pb-6">
                    {activeTab === "genres"
                        ? GENRE_ITEMS.map((g) => {
                              const isActive = selectedItem.id === g.id;
                              return (
                                  <button
                                      key={g.id}
                                      type="button"
                                      onClick={() => handleSelect(g)}
                                      className={`cursor-pointer rounded-full px-4 sm:px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                                          isActive
                                              ? "bg-accent text-bg shadow-[0_4px_16px_rgba(201,168,106,0.35)] scale-105"
                                              : "border border-border text-text-2 hover:border-accent/50 hover:text-accent bg-surface-2/40"
                                      }`}
                                  >
                                      {g.label}
                                  </button>
                              );
                          })
                        : MOOD_ITEMS.map((m) => {
                              const isActive = selectedItem.id === m.id;
                              return (
                                  <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => handleSelect(m)}
                                      className={`cursor-pointer rounded-full px-4 sm:px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                                          isActive
                                              ? "bg-accent text-bg shadow-[0_4px_16px_rgba(201,168,106,0.35)] scale-105"
                                              : "border border-border text-text-2 hover:border-accent/50 hover:text-accent bg-surface-2/40"
                                      }`}
                                  >
                                      {m.label}
                                  </button>
                              );
                          })}
                </div>

                {/* Subtitle description for mood */}
                {selectedItem.desc && (
                    <p className="text-center text-xs text-accent/90 italic mb-6">
                        "{selectedItem.desc}"
                    </p>
                )}

                {/* Movie Grid / Skeleton / Error / Empty */}
                {loading ? (
                    <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="aspect-[2/3] w-full skeleton rounded-xl" />
                                <div className="h-3 w-3/4 skeleton rounded" />
                                <div className="h-2.5 w-1/2 skeleton rounded" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-8 rounded-xl border border-red-500/20 bg-red-500/5 text-center text-xs text-red-400">
                        {error}
                    </div>
                ) : movies.length === 0 ? (
                    <div className="p-8 rounded-xl border border-border bg-surface-2 text-center text-xs text-text-3">
                        No films found matching this selection.
                    </div>
                ) : (
                    <div className="movie-grid-fluid gap-3 sm:gap-4 md:gap-5">
                        {movies.map((movie) => (
                            <article
                                key={movie.id}
                                onClick={() => navigate(`/movies/${movie.id}`)}
                                className="group flex flex-col cursor-pointer"
                            >
                                <div className="poster-card relative">
                                    {movie.poster ? (
                                        <img
                                            src={movie.poster}
                                            alt={`${movie.title} poster`}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center bg-surface text-text-3 p-3 text-center">
                                            <span className="text-2xl mb-1 opacity-30">▣</span>
                                            <span className="text-[11px] font-medium">{movie.title}</span>
                                        </div>
                                    )}

                                    {/* Rating */}
                                    <div className="absolute top-2 left-2 badge badge-accent backdrop-blur-md text-[11px]">
                                        ★ {movie.rating}
                                    </div>

                                    {/* Hover action */}
                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg/95 via-bg/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/movies/${movie.id}`);
                                            }}
                                            className="btn-primary w-full text-xs py-2 rounded-lg"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2.5 px-0.5">
                                    <h3 className="truncate text-sm font-semibold text-text transition-colors group-hover:text-accent">
                                        {movie.title}
                                    </h3>
                                    <p className="mt-0.5 truncate text-[11px] text-text-3 font-medium">
                                        {movie.genre} · {movie.year}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Explore All link */}
                <div className="mt-8 flex justify-center">
                    <Link
                        to="/genres"
                        className="btn-secondary text-xs py-2.5 px-6 inline-flex items-center gap-1.5"
                    >
                        <span>Explore All Genre Indexes</span>
                        <Icon className="text-sm">arrow_forward</Icon>
                    </Link>
                </div>
            </div>
        </section>
    );
}
