import { useEffect, useState } from "react";
import { getMyLists, createList, addMovieToList } from "../../services/listService.js";
import { useToast } from "../../context/ToastContext.jsx";

function AddToListModal({ isOpen, onClose, movie }) {
    const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingListId, setAddingListId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadLists();
        }
    }, [isOpen]);

    const loadLists = async () => {
        try {
            setLoading(true);
            const data = await getMyLists();
            setLists(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load user lists:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (listId) => {
        try {
            setAddingListId(listId);
            await addMovieToList(listId, movie);
            await loadLists();
            toastSuccess(`Added "${movie.title}" to list!`);
        } catch (err) {
            console.error("Failed to add to list:", err);
            const msg = err.response?.data?.message || err.response?.data || "Movie is already in this list or error occurred.";
            toastError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setAddingListId(null);
        }
    };

    const handleCreateAndAdd = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        try {
            setCreating(true);
            const created = await createList({
                name: newListName.trim(),
                isPublic: true
            });
            await addMovieToList(created.id, movie);
            setNewListName("");
            setShowCreate(false);
            await loadLists();
            toastSuccess(`Created list "${created.name}" and added "${movie.title}"!`);
        } catch (err) {
            console.error("Failed to create and add to list:", err);
            toastError("Failed to create list.");
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent">playlist_add</span>
                        <h3 className="font-serif text-base font-bold text-text">
                            Add to Curated List
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-text-3 hover:text-text cursor-pointer p-1"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="text-xs text-text-3">
                    Adding <span className="font-semibold text-text">"{movie.title}"</span> to your lists:
                </div>

                {loading ? (
                    <div className="space-y-2 py-4">
                        <div className="h-10 skeleton rounded-lg" />
                        <div className="h-10 skeleton rounded-lg" />
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 divide-y divide-border/40">
                        {lists.map((l) => {
                            const isAlreadyInList = l.items?.some(
                                (item) => item.movieId === movie.id
                            );

                            return (
                                <div
                                    key={l.id}
                                    className="flex items-center justify-between py-2.5 px-2 hover:bg-surface-2 rounded-lg transition-colors"
                                >
                                    <div className="min-w-0 pr-2">
                                        <div className="text-sm font-semibold text-text truncate">
                                            {l.name}
                                        </div>
                                        <div className="text-[11px] text-text-3">
                                            {l.items?.length || 0} films {l.genre ? `• ${l.genre}` : ""}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isAlreadyInList || addingListId === l.id}
                                        onClick={() => handleAdd(l.id)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                            isAlreadyInList
                                                ? "bg-surface-2 text-text-3 border border-border cursor-not-allowed"
                                                : "btn-primary text-xs py-1 px-3"
                                        }`}
                                    >
                                        {addingListId === l.id
                                            ? "Adding..."
                                            : isAlreadyInList
                                            ? "✓ In List"
                                            : "+ Add"}
                                    </button>
                                </div>
                            );
                        })}

                        {lists.length === 0 && !showCreate && (
                            <div className="py-6 text-center text-xs text-text-3">
                                No custom lists created yet.
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Create New List section */}
                {!showCreate ? (
                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        <span>Create New List</span>
                    </button>
                ) : (
                    <form onSubmit={handleCreateAndAdd} className="space-y-2 pt-2 border-t border-border">
                        <input
                            type="text"
                            required
                            placeholder="New list name (e.g. Favorite Comedies)..."
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            className="mc-input w-full text-xs"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="btn-secondary text-xs py-1.5 px-3 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="btn-primary text-xs py-1.5 px-3 cursor-pointer"
                            >
                                {creating ? "Creating..." : "Create & Add"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AddToListModal;
