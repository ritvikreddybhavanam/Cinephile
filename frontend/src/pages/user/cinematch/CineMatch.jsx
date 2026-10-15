import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import { AuthContext } from "../../../context/AuthContext.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";
import { useToast } from "../../../context/ToastContext.jsx";
import {
    createCineMatchRoom,
    joinCineMatchRoom,
    getCineMatchRoomStatus,
    startCineMatchSwiping,
    swipeCineMatchMovie,
    resetCineMatchRoom
} from "../../../services/cineMatchService.js";
import { resolvePoster } from "../../../components/analytics/WrappedStoryModal.jsx";

export default function CineMatch() {
    useDocumentTitle("CineMatch — Group Movie Night Matchmaker");
    const { user } = useContext(AuthContext);
    const { success, error: toastError, info } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Room States
    const [room, setRoom] = useState(null);
    const [roomCodeInput, setRoomCodeInput] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("");
    const [loading, setLoading] = useState(false);
    const [creatingRoom, setCreatingRoom] = useState(false);

    // Swiping Card Stack States
    const [swipingIndex, setSwipingIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right'
    const pollingTimerRef = useRef(null);

    // Initial check for room code in URL query (?room=CINE-123)
    useEffect(() => {
        const queryRoom = searchParams.get("room");
        if (queryRoom && !room) {
            handleJoinRoom(queryRoom);
        }
    }, [searchParams]);

    // Live Room Polling (every 2.5s when inside a room)
    useEffect(() => {
        if (!room?.roomCode) return;

        const pollStatus = async () => {
            try {
                const updated = await getCineMatchRoomStatus(room.roomCode);
                setRoom(updated);
            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        pollingTimerRef.current = setInterval(pollStatus, 2500);
        return () => clearInterval(pollingTimerRef.current);
    }, [room?.roomCode]);

    const handleCreateRoom = async () => {
        try {
            setCreatingRoom(true);
            const data = await createCineMatchRoom({
                genre: selectedGenre,
                providers: selectedProvider
            });
            setRoom(data);
            setSearchParams({ room: data.roomCode });
            success(`Room ${data.roomCode} created! Share the code with your friends.`);
        } catch (err) {
            toastError("Failed to create match room: " + (err.response?.data?.message || err.message));
        } finally {
            setCreatingRoom(false);
        }
    };

    const handleJoinRoom = async (codeToJoin) => {
        const code = (codeToJoin || roomCodeInput).trim().toUpperCase();
        if (!code) {
            toastError("Please enter a room code (e.g. CINE-842)");
            return;
        }

        try {
            setLoading(true);
            const data = await joinCineMatchRoom(code);
            setRoom(data);
            setSearchParams({ room: data.roomCode });
            success(`Joined room ${data.roomCode}!`);
        } catch (err) {
            const serverMsg = typeof err.response?.data === "string" 
                ? err.response.data 
                : err.response?.data?.message || err.message;
            toastError("Could not join room: " + serverMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleStartSwiping = async () => {
        if (!room) return;
        try {
            const data = await startCineMatchSwiping(room.roomCode);
            setRoom(data);
            setSwipingIndex(0);
            info("Matchmaker started! Swipe Right (💚) if you'd watch it.");
        } catch (err) {
            toastError(err.response?.data?.message || "Failed to start");
        }
    };

    const handleSwipe = async (isLike) => {
        if (!room || !room.movies || room.movies.length === 0) return;
        const currentMovie = room.movies[swipingIndex];
        if (!currentMovie) return;

        setSwipeDirection(isLike ? "right" : "left");

        try {
            const movieId = currentMovie.id;
            const updated = await swipeCineMatchMovie(room.roomCode, movieId, isLike);
            setTimeout(() => {
                setSwipeDirection(null);
                setRoom(updated);
                setSwipingIndex((prev) => prev);
            }, 300);

            if (updated.status === "MATCHED" && updated.matchedMovie) {
                success("🎉 IT'S A MATCH! You and your friends agreed on a film!");
            }
        } catch (err) {
            setSwipeDirection(null);
            console.error("Swipe failed:", err);
        }
    };

    const handleCopyInviteLink = () => {
        const url = `${window.location.origin}/cinematch?room=${room.roomCode}`;
        navigator.clipboard.writeText(url);
        success("Invite link copied to clipboard! Send to your friends.");
    };

    const handleReset = async () => {
        if (!room) return;
        try {
            const updated = await resetCineMatchRoom(room.roomCode);
            setRoom(updated);
            setSwipingIndex(0);
            info("Room reset. Ready for another round!");
        } catch (err) {
            toastError("Failed to reset room");
        }
    };

    const isHost = room?.hostId === user?.id;
    const currentMovie = room?.movies && room.movies.length > 0 ? room.movies[0] : null;

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text antialiased font-sans">
            <Navbar />

            <main className="page-container flex-1 py-8 sm:py-12 space-y-8">
                {/* Header Title Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="label-caps text-accent flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">favorite</span>
                                <span>Group Movie Night Matcher</span>
                            </span>
                            <span className="badge badge-accent text-[10px]">CineMatch</span>
                        </div>
                        <h1 className="font-serif text-fluid-title font-bold text-text">
                            CineMatch Roulette
                        </h1>
                        <p className="text-xs sm:text-sm text-text-3 mt-1 max-w-xl">
                            End the 45-minute scrolling debate. Invite friends, swipe on movie cards, and get an instant match when everyone agrees!
                        </p>
                    </div>

                    {room && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-accent/30 shadow-sm">
                                <span className="text-xs font-mono text-text-3">ROOM:</span>
                                <span className="font-mono text-base font-black text-accent tracking-widest">
                                    {room.roomCode}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyInviteLink}
                                className="btn-secondary text-xs py-2.5 px-3.5 flex items-center gap-1.5 cursor-pointer"
                                title="Copy Room Invite URL"
                            >
                                <span className="material-symbols-outlined text-base">content_copy</span>
                                <span>Share Link</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setRoom(null); setSearchParams({}); }}
                                className="px-3 py-2 rounded-xl text-xs font-semibold text-text-3 hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                            >
                                Leave
                            </button>
                        </div>
                    )}
                </div>

                {/* ========================================================= */}
                {/* SCREEN 1: LOBBY / JOIN OR CREATE ROOM */}
                {/* ========================================================= */}
                {!room ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
                        {/* 1. Create a Movie Night Room */}
                        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-card hover:border-accent/40 transition-all">
                            <div className="space-y-2">
                                <div className="h-12 w-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                                    <span className="material-symbols-outlined text-2xl">add_circle</span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-text">
                                    Host a Watch Party
                                </h3>
                                <p className="text-xs sm:text-sm text-text-3">
                                    Generate a quick room code, customize genre & streaming filters, and invite your group.
                                </p>
                            </div>

                            {/* Genre Preference Picker */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-text-2 block">
                                    Preferred Genre (Optional):
                                </label>
                                <select
                                    value={selectedGenre}
                                    onChange={(e) => setSelectedGenre(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-xs text-text outline-none focus:border-accent"
                                >
                                    <option value="">All Genres (Trending Mix)</option>
                                    <option value="28">Action</option>
                                    <option value="878">Sci-Fi & Cyberpunk</option>
                                    <option value="18">Drama & Arthouse</option>
                                    <option value="35">Comedy</option>
                                    <option value="27">Horror & Thriller</option>
                                    <option value="10749">Romance</option>
                                    <option value="16">Animation</option>
                                </select>
                            </div>

                            {/* Streaming Services Picker */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-text-2 block">
                                    Streaming Platform:
                                </label>
                                <select
                                    value={selectedProvider}
                                    onChange={(e) => setSelectedProvider(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-xs text-text outline-none focus:border-accent"
                                >
                                    <option value="">Any Platform / Theaters</option>
                                    <option value="8">Netflix</option>
                                    <option value="9">Prime Video</option>
                                    <option value="337">Disney+ / Hotstar</option>
                                    <option value="2">Apple TV</option>
                                    <option value="119">Prime Video (India)</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handleCreateRoom}
                                disabled={creatingRoom}
                                className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                            >
                                <span className="material-symbols-outlined text-lg">celebration</span>
                                <span>{creatingRoom ? "Creating Room..." : "Create CineMatch Room"}</span>
                            </button>
                        </div>

                        {/* 2. Join with Room Code */}
                        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-card hover:border-accent/40 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                    <span className="material-symbols-outlined text-2xl">group_add</span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-text">
                                    Join a Room
                                </h3>
                                <p className="text-xs sm:text-sm text-text-3">
                                    Have a friend&apos;s code? Enter it below to join their swiping room immediately.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-text-2 block">
                                    Enter 3-Letter Code:
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. CINE-842 or 842"
                                    value={roomCodeInput}
                                    onChange={(e) => setRoomCodeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                                    className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-mono tracking-widest text-text uppercase outline-none focus:border-accent"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => handleJoinRoom()}
                                disabled={loading}
                                className="w-full btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">login</span>
                                <span>{loading ? "Joining..." : "Join Movie Match"}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ========================================================= */
                    /* SCREEN 2: ACTIVE ROOM (LOBBY / SWIPING / MATCH) */
                    /* ========================================================= */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN: Participants Lobby & Room Info (4 cols) */}
                        <div className="lg:col-span-4 rounded-3xl border border-border bg-surface p-6 space-y-6 shadow-card">
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
                                    Party Lobby ({room.totalParticipants} Members)
                                </span>
                                <h3 className="font-serif text-xl font-bold text-text">
                                    Who&apos;s Watching
                                </h3>
                            </div>

                            {/* Participant Avatar List */}
                            <div className="space-y-2.5">
                                {room.participants?.map((p) => (
                                    <div
                                        key={p.userId}
                                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                            p.userId === user?.id
                                                ? "border-accent/40 bg-accent/5"
                                                : "border-border bg-surface-2"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-accent/40 to-indigo-500/40 flex items-center justify-center text-xs font-bold border border-border text-text">
                                                {p.avatar ? (
                                                    <img src={p.avatar} alt={p.name} className="h-full w-full object-cover rounded-full" />
                                                ) : (
                                                    <span>{p.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-text">{p.name}</span>
                                                    {p.isHost && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-accent/20 text-accent font-mono">
                                                            HOST
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-text-3 font-mono block">
                                                    {p.swipedCount || 0} films evaluated
                                                </span>
                                            </div>
                                        </div>

                                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    </div>
                                ))}
                            </div>

                            {/* Host Controls */}
                            {room.status === "WAITING" && (
                                <div className="space-y-2 pt-2 border-t border-border">
                                    {isHost ? (
                                        <button
                                            type="button"
                                            onClick={handleStartSwiping}
                                            className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-lg">play_arrow</span>
                                            <span>Start Swiping Deck</span>
                                        </button>
                                    ) : (
                                        <div className="p-3 text-center rounded-xl bg-surface-2 text-xs text-text-3 animate-pulse">
                                            Waiting for host <strong className="text-accent">{room.hostName}</strong> to start...
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Matches Log (if any) */}
                            {room.allMatches && room.allMatches.length > 0 && (
                                <div className="space-y-2 pt-3 border-t border-border">
                                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
                                        Matched Films ({room.allMatches.length})
                                    </span>
                                    <div className="space-y-1.5">
                                        {room.allMatches.map((m) => (
                                            <div key={m.id} className="flex items-center gap-2 p-2 rounded-xl bg-surface-2 text-xs">
                                                <span className="text-accent font-bold">✨</span>
                                                <span className="font-semibold text-text truncate">{m.title}</span>
                                                <span className="text-text-3 font-mono text-[10px] ml-auto">★ {Number(m.vote_average || 8).toFixed(1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Swiping Card Deck OR Match Celebration (8 cols) */}
                        <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[500px]">
                            {/* CASE A: IT'S A MATCH! POPUP / CELEBRATION */}
                            {room.status === "MATCHED" && room.matchedMovie ? (
                                <div className="w-full max-w-md rounded-3xl border-2 border-accent/60 bg-gradient-to-b from-surface via-surface-2 to-surface p-8 text-center space-y-6 shadow-elevated animate-scaleUp">
                                    <div className="space-y-2">
                                        <span className="text-5xl block animate-bounce">💥🍿🎉</span>
                                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                                            EVERYONE SWIPED RIGHT!
                                        </span>
                                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text">
                                            It&apos;s a Match!
                                        </h2>
                                    </div>

                                    {/* Matched Movie Poster & Details */}
                                    <div className="relative h-72 aspect-[2/3] mx-auto rounded-2xl overflow-hidden border-2 border-accent shadow-2xl ring-4 ring-accent/20 group">
                                        <img
                                            src={resolvePoster(room.matchedMovie.poster_path, "interstellar")}
                                            alt={room.matchedMovie.title}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-accent text-xs font-bold font-mono">
                                            ★ {Number(room.matchedMovie.vote_average || 8.0).toFixed(1)}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-serif text-2xl font-bold text-text">
                                            {room.matchedMovie.title}
                                        </h3>
                                        <p className="text-xs text-text-3 font-mono">
                                            {room.matchedMovie.release_date ? room.matchedMovie.release_date.slice(0, 4) : "2024"}
                                        </p>
                                        <p className="text-xs text-text-2 line-clamp-2 max-w-xs mx-auto pt-1">
                                            {room.matchedMovie.overview}
                                        </p>
                                    </div>

                                    {/* Where to Stream Pill */}
                                    {room.matchedMovie.streamingProviders && (
                                        <div className="p-3 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center gap-2 text-xs font-semibold text-accent">
                                            <span className="material-symbols-outlined text-sm">tv</span>
                                            <span>Stream on: {room.matchedMovie.streamingProviders.join(", ")}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/movies/${room.matchedMovie.id}`)}
                                            className="flex-1 btn-primary py-3 text-xs font-bold cursor-pointer"
                                        >
                                            View Movie Details
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="btn-secondary py-3 px-4 text-xs font-semibold cursor-pointer"
                                            title="Find Another Film"
                                        >
                                            Next Match →
                                        </button>
                                    </div>
                                </div>
                            ) : room.status === "SWIPING" && currentMovie ? (
                                /* CASE B: SWIPING CARD DECK */
                                <div className="w-full max-w-sm flex flex-col items-center space-y-5">
                                    <div className="w-full flex items-center justify-between text-xs text-text-3 font-mono px-2">
                                        <span>Deck Remaining: {room.movies?.length || 0}</span>
                                        <span>Press ❌ Pass or 💚 Match</span>
                                    </div>

                                    {/* Main Swipeable Card */}
                                    <div
                                        className={`relative w-full aspect-[2/3] rounded-[32px] overflow-hidden border border-border bg-surface-2 shadow-2xl transition-all duration-300 transform select-none ${
                                            swipeDirection === "right"
                                                ? "translate-x-32 rotate-12 opacity-0"
                                                : swipeDirection === "left"
                                                ? "-translate-x-32 -rotate-12 opacity-0"
                                                : "translate-x-0 rotate-0 opacity-100"
                                        }`}
                                    >
                                        <img
                                            src={resolvePoster(currentMovie.poster_path, "interstellar")}
                                            alt={currentMovie.title}
                                            className="h-full w-full object-cover"
                                        />

                                        {/* Gradient Dark Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-md bg-accent/90 text-bg text-[11px] font-bold font-mono">
                                                    ★ {Number(currentMovie.vote_average || 8.0).toFixed(1)}
                                                </span>
                                                <span className="text-xs text-slate-300 font-mono">
                                                    {currentMovie.release_date?.slice(0, 4)}
                                                </span>
                                            </div>

                                            <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                                                {currentMovie.title}
                                            </h3>

                                            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                                                {currentMovie.overview}
                                            </p>

                                            {currentMovie.streamingProviders && (
                                                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-300 font-mono">
                                                    <span className="material-symbols-outlined text-[14px]">tv</span>
                                                    <span>{currentMovie.streamingProviders.join(" • ")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Swiping Action Controls (Pass & Like Buttons) */}
                                    <div className="flex items-center justify-center gap-6 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSwipe(false)}
                                            className="h-16 w-16 rounded-full bg-surface border-2 border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
                                            title="Pass (Swipe Left)"
                                        >
                                            <span className="material-symbols-outlined text-3xl">close</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleSwipe(true)}
                                            className="h-16 w-16 rounded-full bg-surface border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
                                            title="Like / Match (Swipe Right)"
                                        >
                                            <span className="material-symbols-outlined text-3xl">favorite</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* CASE C: END OF DECK OR WAITING */
                                <div className="text-center p-12 rounded-3xl border border-border bg-surface max-w-md space-y-4 shadow-card">
                                    <div className="h-16 w-16 rounded-full bg-accent/15 text-accent flex items-center justify-center text-3xl mx-auto">
                                        <span className="material-symbols-outlined text-4xl">hourglass_empty</span>
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-text">
                                        {room.status === "WAITING" ? "Ready in the Lobby" : "End of Movie Deck"}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-text-3">
                                        {room.status === "WAITING"
                                            ? `Invite another person using room code ${room.roomCode} or click Start Swiping.`
                                            : "You've swiped through all films! Resetting deck to find more matches."}
                                    </p>
                                    {isHost && (
                                        <button
                                            type="button"
                                            onClick={handleStartSwiping}
                                            className="btn-primary py-2.5 px-6 text-xs font-bold cursor-pointer"
                                        >
                                            {room.status === "WAITING" ? "Start Swiping Now" : "Shuffle & Swipe Again"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
