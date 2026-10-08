import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies, getPosterUrl } from "../../services/movieService.js";
import { searchPeople } from "../../services/personService.js";

function GlobalSearchModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // "all" | "films" | "people"
    const [filmResults, setFilmResults] = useState([]);
    const [peopleResults, setPeopleResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    // Auto-focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery("");
            setFilmResults([]);
            setPeopleResults([]);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Live debounced search
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setFilmResults([]);
            setPeopleResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const [moviesData, peopleData] = await Promise.allSettled([
                    searchMovies(trimmed),
                    searchPeople(trimmed)
                ]);

                if (moviesData.status === "fulfilled" && moviesData.value?.results) {
                    setFilmResults(moviesData.value.results.slice(0, 10));
                } else {
                    setFilmResults([]);
                }

                if (peopleData.status === "fulfilled" && peopleData.value?.results) {
                    setPeopleResults(peopleData.value.results.slice(0, 8));
                } else {
                    setPeopleResults([]);
                }
            } catch (err) {
                console.error("Global search error:", err);
            } finally {
                setLoading(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    const handleSelectMovie = (id) => {
        onClose();
        navigate(`/movies/${id}`);
    };

    const handleSelectPerson = (id) => {
        onClose();
        navigate(`/person/${id}`);
    };

    const totalResults = filmResults.length + peopleResults.length;

    const showFilms = activeTab === "all" || activeTab === "films";
    const showPeople = activeTab === "all" || activeTab === "people";

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/75 backdrop-blur-md transition-opacity duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[82vh] transition-all transform animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Header Bar */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface-2/50">
                    <span className="material-symbols-outlined text-accent text-2xl shrink-0">
                        search
                    </span>

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search films, actors, directors, genres…"
                        className="flex-1 bg-transparent text-text placeholder:text-text-3 text-base sm:text-lg outline-none font-sans"
                    />

                    {loading ? (
                        <span className="material-symbols-outlined text-accent animate-spin text-xl shrink-0">
                            progress_activity
                        </span>
                    ) : query ? (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="text-text-3 hover:text-text transition-colors p-1"
                            title="Clear search"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={onClose}
                        className="hidden sm:inline-flex items-center justify-center px-2 py-1 rounded text-[11px] font-mono font-semibold text-text-3 bg-surface border border-border"
                    >
                        ESC
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border/60 bg-surface text-xs font-semibold">
                    {[
                        { id: "all", label: `All (${totalResults})` },
                        { id: "films", label: `Films (${filmResults.length})` },
                        { id: "people", label: `People (${peopleResults.length})` },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                                activeTab === tab.id
                                    ? "bg-accent text-white font-bold shadow-xs"
                                    : "bg-surface-2 text-text-3 hover:text-text hover:bg-surface-2/80"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
                    {query.trim() === "" ? (
                        <div className="py-12 text-center text-text-3 space-y-2">
                            <span className="material-symbols-outlined text-4xl text-accent/60 mb-1">
                                explore
                            </span>
                            <p className="text-sm font-medium text-text">
                                Explore World Cinema
                            </p>
                            <p className="text-xs text-text-3 max-w-sm mx-auto">
                                Type title, actor, director, or keyword to instantly search through millions of records.
                            </p>
                        </div>
                    ) : totalResults === 0 && !loading ? (
                        <div className="py-12 text-center text-text-3 space-y-2">
                            <span className="material-symbols-outlined text-4xl text-text-3 mb-1">
                                search_off
                            </span>
                            <p className="text-sm font-semibold text-text">
                                No results found for "{query}"
                            </p>
                            <p className="text-xs text-text-3">
                                Try checking for typos or searching with different keywords.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Films Section */}
                            {showFilms && filmResults.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/40">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-base">movie</span>
                                            Films ({filmResults.length})
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {filmResults.map((movie) => {
                                            const poster = getPosterUrl(movie.poster_path);
                                            const year =
                                                movie.release_date?.substring(0, 4) ||
                                                movie.first_air_date?.substring(0, 4);

                                            return (
                                                <button
                                                    key={movie.id}
                                                    type="button"
                                                    onClick={() => handleSelectMovie(movie.id)}
                                                    className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 bg-surface-2/50 hover:bg-surface-2 hover:border-accent/50 text-left transition-all group cursor-pointer"
                                                >
                                                    <div className="w-11 h-16 rounded-md bg-surface-2 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                                        {poster ? (
                                                            <img
                                                                src={poster}
                                                                alt={movie.title || movie.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                            />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-text-3 text-lg">
                                                                movie
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-text truncate group-hover:text-accent transition-colors">
                                                            {movie.title || movie.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-text-3 mt-1">
                                                            {year && <span>{year}</span>}
                                                            {movie.vote_average > 0 && (
                                                                <span className="flex items-center gap-0.5 text-accent font-medium">
                                                                    <span className="material-symbols-outlined text-sm">
                                                                        star
                                                                    </span>
                                                                    {Number(movie.vote_average).toFixed(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* People Section */}
                            {showPeople && peopleResults.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/40">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-base">person</span>
                                            Cast & Crew ({peopleResults.length})
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {peopleResults.map((person) => {
                                            const photo = person.profile_path
                                                ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                                : null;

                                            return (
                                                <button
                                                    key={person.id}
                                                    type="button"
                                                    onClick={() => handleSelectPerson(person.id)}
                                                    className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 bg-surface-2/50 hover:bg-surface-2 hover:border-accent/50 text-left transition-all group cursor-pointer"
                                                >
                                                    <div className="w-11 h-11 rounded-full bg-surface-2 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                                        {photo ? (
                                                            <img
                                                                src={photo}
                                                                alt={person.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                            />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-text-3 text-lg">
                                                                person
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-text truncate group-hover:text-accent transition-colors">
                                                            {person.name}
                                                        </h4>
                                                        <p className="text-xs text-text-3 truncate mt-0.5">
                                                            {person.known_for_department || "Artist"}
                                                            {person.known_for?.length > 0 && ` • ${person.known_for[0].title || person.known_for[0].name}`}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="border-t border-border bg-surface-2/40 px-5 py-3 flex items-center justify-between text-xs text-text-3">
                    <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-accent">keyboard</span>
                        Use <strong>Enter</strong> to open, <strong>Esc</strong> to dismiss
                    </span>
                    <span>Powered by TMDB</span>
                </div>
            </div>
        </div>
    );
}

export default GlobalSearchModal;
