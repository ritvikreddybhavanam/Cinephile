import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";
import {
    getListById,
    addMovieToList,
    removeMovieFromList,
    deleteList
} from "../../../services/listService.js";
import { searchMovies } from "../../../services/movieService.js";
import { useToast } from "../../../context/ToastContext.jsx";

function ListDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Movie search for adding films
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addingMovieId, setAddingMovieId] = useState(null);

    // Current user identification
    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    })();

    const isOwner = list && (
        list.userId === currentUser.id ||
        list.creatorUsername === currentUser.username ||
        list.creatorName?.toLowerCase().includes((currentUser.firstname || "").toLowerCase())
    );

    useDocumentTitle(list?.name ? `${list.name} — Cinephile List` : "Curated List");

    const loadList = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getListById(id);
            setList(data);
        } catch (err) {
            console.error("Failed to load list details:", err);
            setError("Could not load list details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadList();
    }, [id]);

    const handleSearch = async (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (!q.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const res = await searchMovies(q.trim());
            setSearchResults(res?.results?.slice(0, 6) || []);
        } catch (err) {
            console.error("Movie search error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddMovie = async (movie) => {
        try {
            setAddingMovieId(movie.id);
            await addMovieToList(id, movie);
            await loadList();
            setSearchQuery("");
            setSearchResults([]);
            toastSuccess(`Added "${movie.title}" to the list!`);
        } catch (err) {
            console.error("Failed to add movie to list:", err);
            const msg = err.response?.data?.message || err.response?.data || "Failed to add movie to list (it may already be in this list).";
            toastError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setAddingMovieId(null);
        }
    };

    const handleRemoveMovie = async (movieId) => {
        if (!window.confirm("Remove this film from the list?")) return;
        try {
            await removeMovieFromList(id, movieId);
            setList((prev) => ({
                ...prev,
                items: prev.items.filter((item) => item.movieId !== movieId)
            }));
            toastInfo("Film removed from list.");
        } catch (err) {
            console.error("Failed to remove movie:", err);
            toastError("Failed to remove movie from list.");
        }
    };

    const handleDeleteList = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this list?")) return;
        try {
            await deleteList(id);
            toastInfo("List deleted.");
            navigate("/lists");
        } catch (err) {
            console.error("Failed to delete list:", err);
            toastError("Failed to delete list.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg text-text antialiased font-sans">
                <Navbar />
                <main className="flex min-h-[60vh] items-center justify-center pt-24">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
                        <p className="text-sm text-text-2">Loading Curated List...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="min-h-screen bg-bg text-text antialiased font-sans">
                <Navbar />
                <main className="mx-auto max-w-[1200px] px-4 py-20 text-center">
                    <p className="text-red-400 mb-4">{error || "List not found."}</p>
                    <Link to="/lists" className="btn-primary py-2 px-5 text-xs">
                        ← Back to Curated Lists
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg text-text antialiased font-sans">
            <Navbar />

            <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 sm:px-6 py-8 sm:py-12">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to="/lists"
                        className="text-xs text-text-3 hover:text-accent flex items-center gap-1 transition-colors no-underline"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span>Back to All Lists</span>
                    </Link>
                </div>

                {/* List Header Card */}
                <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 mb-10 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="label-caps">Curated Collection</span>
                                {list.genre && (
                                    <span className="badge badge-accent text-xs">
                                        {list.genre}
                                    </span>
                                )}
                                <span className="rounded bg-surface-2 border border-border px-2 py-0.5 text-[11px] text-text-3 font-mono">
                                    {list.items?.length || 0} Films
                                </span>
                            </div>

                            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-text">
                                {list.name}
                            </h1>

                            {list.description && (
                                <p className="text-sm text-text-2 max-w-2xl leading-relaxed whitespace-pre-line">
                                    {list.description}
                                </p>
                            )}

                            <div className="pt-2 flex items-center gap-2 text-xs text-text-3">
                                <span>Curated by</span>
                                <span className="font-semibold text-text">{list.creatorName || "Cinephile User"}</span>
                                <span>•</span>
                                <span>{new Date(list.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                        </div>

                        {/* Owner Actions */}
                        {isOwner && (
                            <div className="flex items-center gap-2 self-start">
                                <button
                                    type="button"
                                    onClick={handleDeleteList}
                                    className="btn-secondary text-xs py-2 px-3 hover:text-red-400 cursor-pointer flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                    <span>Delete List</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ADD MOVIES SEARCH SECTION (Owner only) */}
                {isOwner && (
                    <section className="mb-10 rounded-2xl border border-border/80 bg-surface-2/60 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                            <div>
                                <h3 className="font-serif text-base font-bold text-text">
                                    Add Films to "{list.name}"
                                </h3>
                                <p className="text-xs text-text-3">
                                    Search TMDB by film title to add movies to this list
                                </p>
                            </div>
                        </div>

                        <div className="relative max-w-xl">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3 text-lg pointer-events-none">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search movies (e.g. Superbad, The Hangover, Monty Python)..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="mc-input w-full pl-10 pr-10 text-sm"
                                />
                                {isSearching && (
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-accent text-lg animate-spin">
                                        progress_activity
                                    </span>
                                )}
                            </div>

                            {/* Live Search Suggestions Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-border bg-[#161922] shadow-2xl overflow-hidden divide-y divide-border/40 max-h-80 overflow-y-auto">
                                    {searchResults.map((movie) => {
                                        const isAlreadyInList = list.items?.some(
                                            (i) => i.movieId === movie.id
                                        );
                                        const poster = movie.poster_path
                                            ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
                                            : null;

                                        return (
                                            <div
                                                key={movie.id}
                                                className="flex items-center justify-between p-3 hover:bg-surface-2 transition-colors gap-3"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-13 rounded bg-surface border border-border/50 overflow-hidden flex-shrink-0">
                                                        {poster ? (
                                                            <img
                                                                src={poster}
                                                                alt={movie.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-text-3">
                                                                🎬
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-semibold text-text truncate">
                                                            {movie.title}
                                                        </h4>
                                                        <p className="text-xs text-text-3">
                                                            {movie.release_date ? movie.release_date.substring(0, 4) : "N/A"}
                                                            {movie.vote_average > 0 && ` • ★ ${movie.vote_average.toFixed(1)}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isAlreadyInList || addingMovieId === movie.id}
                                                    onClick={() => handleAddMovie(movie)}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                                        isAlreadyInList
                                                            ? "bg-surface-2 text-text-3 cursor-not-allowed border border-border/50"
                                                            : "btn-primary"
                                                    }`}
                                                >
                                                    {addingMovieId === movie.id
                                                        ? "Adding..."
                                                        : isAlreadyInList
                                                        ? "In List"
                                                        : "+ Add to List"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* MOVIES IN LIST GRID */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-serif text-xl font-bold text-text">
                            Films in this Collection ({list.items?.length || 0})
                        </h2>
                    </div>

                    {list.items && list.items.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {list.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative rounded-xl border border-border bg-surface p-2 hover:border-accent transition-all flex flex-col justify-between"
                                >
                                    <Link
                                        to={`/movies/${item.movieId}`}
                                        className="no-underline block"
                                    >
                                        <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-2 mb-2">
                                            {item.poster ? (
                                                <img
                                                    src={item.poster}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-text-3">
                                                    No Poster
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="text-xs font-semibold text-text truncate group-hover:text-accent">
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center justify-between text-[11px] text-text-3 mt-0.5">
                                            <span>{item.year || "Film"}</span>
                                            {item.rating && (
                                                <span className="text-accent font-semibold">
                                                    ★ {Number(item.rating).toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Remove Movie Button for owner */}
                                    {isOwner && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMovie(item.movieId)}
                                            className="mt-2 w-full py-1 text-[11px] text-text-3 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
                                            title="Remove from list"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
                            <span className="material-symbols-outlined text-4xl text-accent/60 mb-2">
                                playlist_add
                            </span>
                            <h3 className="font-serif text-lg font-bold text-text">
                                No Films in this List Yet
                            </h3>
                            <p className="text-xs text-text-3 mt-1 max-w-sm mx-auto">
                                {isOwner
                                    ? "Use the search bar above to search and add your favorite movies to this collection."
                                    : "The curator has not added any films to this list yet."}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ListDetails;
