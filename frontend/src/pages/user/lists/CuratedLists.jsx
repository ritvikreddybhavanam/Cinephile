import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";
import {
    getMyLists,
    getPublicLists,
    createList,
    deleteList
} from "../../../services/listService.js";
import { getMovieGenres } from "../../../services/movieService.js";
import { useToast } from "../../../context/ToastContext.jsx";

function CuratedLists() {
    useDocumentTitle("Curated Lists — Cinephile");
    const navigate = useNavigate();
    const { success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning } = useToast();

    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state for creating a list
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [genresList, setGenresList] = useState([]);
    const [creating, setCreating] = useState(false);
    const [newListForm, setNewListForm] = useState({
        name: "",
        description: "",
        genre: "",
        isPublic: true
    });

    const loadLists = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getMyLists();
            setLists(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load lists:", err);
            setError("Failed to load your curated lists.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLists();
        getMovieGenres()
            .then((res) => {
                const list = res?.genres || res || [];
                setGenresList(Array.isArray(list) ? list : []);
            })
            .catch(() => {});
    }, []);

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListForm.name.trim()) {
            toastWarning("Please enter a list name (e.g., 'Fav Comedy Films').");
            return;
        }

        try {
            setCreating(true);
            const created = await createList(newListForm);
            setLists((prev) => [created, ...prev]);
            setIsCreateOpen(false);
            setNewListForm({
                name: "",
                description: "",
                genre: "",
                isPublic: true
            });
            toastSuccess(`Created "${created.name}" successfully!`);
            navigate(`/lists/${created.id}`);
        } catch (err) {
            console.error("Failed to create list:", err);
            const msg = err.response?.data?.message || err.response?.data || err.message || "Error creating list. Please try again.";
            toastError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteList = async (listId, e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!window.confirm("Are you sure you want to delete this list?")) return;

        try {
            await deleteList(listId);
            setLists((prev) => prev.filter((l) => l.id !== listId));
            toastInfo("Curated list deleted.");
        } catch (err) {
            console.error("Failed to delete list:", err);
            toastError("Failed to delete list.");
        }
    };

    return (
        <div className="min-h-screen bg-bg text-text antialiased font-sans flex flex-col relative">
            <Navbar />

            <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 sm:px-6 py-8 sm:py-12">
                {/* Heading */}
                <div className="section-header mb-8 flex items-center justify-between">
                    <div>
                        <p className="label-caps mb-1">Collections</p>
                        <h1 className="section-title text-3xl sm:text-4xl">
                            Curated Lists
                        </h1>
                    </div>

                    <span className="badge badge-accent">
                        {lists.length} {lists.length === 1 ? "List" : "Lists"}
                    </span>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Lists Display */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-56 skeleton rounded-2xl" />
                        ))}
                    </div>
                ) : lists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lists.map((list) => {
                            const posters = (list.items || [])
                                .slice(0, 4)
                                .map((item) => item.poster)
                                .filter(Boolean);

                            return (
                                <Link
                                    key={list.id}
                                    to={`/lists/${list.id}`}
                                    className="group rounded-2xl border border-border bg-surface hover:border-accent transition-all p-5 flex flex-col justify-between shadow-sm no-underline"
                                >
                                    <div>
                                        {/* 4-Poster Film Stack Preview */}
                                        <div className="grid grid-cols-4 gap-1.5 aspect-[16/7] rounded-xl overflow-hidden bg-surface-2 border border-border/60 p-1.5 mb-4 group-hover:border-accent/40 transition-colors">
                                            {posters.map((p, idx) => (
                                                <div key={idx} className="h-full w-full rounded overflow-hidden bg-surface">
                                                    <img
                                                        src={p}
                                                        alt="Movie"
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                </div>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - posters.length) }).map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className="h-full w-full rounded bg-surface/50 border border-dashed border-border/40 flex items-center justify-center text-text-3"
                                                >
                                                    <span className="material-symbols-outlined text-xs opacity-40">movie</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* List Meta */}
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            {list.genre ? (
                                                <span className="badge badge-accent text-[10px]">
                                                    {list.genre}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] uppercase tracking-wider text-text-3 font-semibold">
                                                    Custom List
                                                </span>
                                            )}

                                            <span className="text-xs text-text-3">
                                                {list.items?.length || 0} {list.items?.length === 1 ? "film" : "films"}
                                            </span>
                                        </div>

                                        <h3 className="font-serif text-lg font-bold text-text group-hover:text-accent transition-colors line-clamp-1">
                                            {list.name}
                                        </h3>

                                        <p className="text-xs text-text-2 mt-1.5 line-clamp-2 leading-relaxed">
                                            {list.description || "No description provided."}
                                        </p>
                                    </div>

                                    {/* Footer / Creator */}
                                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-3">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className="material-symbols-outlined text-[14px]">person</span>
                                            <span className="truncate">{list.creatorName || "Cinephile User"}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteList(list.id, e)}
                                            className="text-text-3 hover:text-red-400 p-1 transition-colors cursor-pointer"
                                            title="Delete List"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-accent/50 mb-3">
                            format_list_bulleted
                        </span>
                        <h2 className="font-serif text-xl font-bold text-text">
                            No Curated Lists Created Yet
                        </h2>
                        <p className="mt-1.5 text-xs sm:text-sm text-text-3 max-w-md mx-auto">
                            Click the plus button in the bottom right corner to create your first curated list (e.g. Favorite Comedy Films).
                        </p>
                    </div>
                )}
            </main>

            {/* FLOATING ACTION PLUS BUTTON (Bottom Right Corner) */}
            <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-accent text-bg shadow-2xl flex items-center justify-center hover:scale-110 hover:shadow-accent/30 active:scale-95 transition-all duration-200 cursor-pointer group"
                title="Create New List"
                aria-label="Create New List"
            >
                <span className="material-symbols-outlined text-3xl font-bold transition-transform group-hover:rotate-90 duration-300">
                    add
                </span>
            </button>

            {/* CREATE LIST MODAL */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div>
                                <h3 className="font-serif text-lg font-bold text-text">
                                    Create Curated List
                                </h3>
                                <p className="text-xs text-text-3 mt-0.5">
                                    e.g. "Fav Comedy Films", "Sci-Fi Masterpieces"
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="text-text-3 hover:text-text cursor-pointer p-1"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateList} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                    List Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Fav Comedy Films"
                                    value={newListForm.name}
                                    onChange={(e) => setNewListForm({ ...newListForm, name: e.target.value })}
                                    className="mc-input w-full text-sm"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                    Genre (Optional)
                                </label>
                                <select
                                    value={newListForm.genre}
                                    onChange={(e) => setNewListForm({ ...newListForm, genre: e.target.value })}
                                    className="mc-input w-full text-sm"
                                >
                                    <option value="">General / Multiple Genres</option>
                                    {genresList.map((g) => (
                                        <option key={g.id} value={g.name}>
                                            {g.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                    Description / Note (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Add a description for this collection..."
                                    value={newListForm.description}
                                    onChange={(e) => setNewListForm({ ...newListForm, description: e.target.value })}
                                    className="mc-input w-full text-sm resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="btn-primary text-xs py-2 px-5 cursor-pointer disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Create List & Add Films →"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default CuratedLists;
