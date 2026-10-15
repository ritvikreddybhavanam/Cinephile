import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import WatchlistCard from "../../../components/cards/WatchlistCard.jsx";
import {
    getWatchlist,
    removeFromWatchlist
} from "../../../services/watchlistService.js";


function Watchlist() {

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadWatchlist();
    }, []);

    const loadWatchlist = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getWatchlist();

            setMovies(data);

        } catch (error) {

            console.error(
                "Failed to load watchlist:",
                error
            );

            setError(
                "Unable to load your watchlist."
            );

        } finally {

            setLoading(false);

        }
    };

    const handleRemove = async (movieId) => {

        try {

            await removeFromWatchlist(movieId);

            setMovies((currentMovies) =>
                currentMovies.filter(
                    (movie) =>
                        movie.movieId !== movieId
                )
            );

        } catch (error) {

            console.error(
                "Failed to remove movie:",
                error
            );

            setError(
                "Unable to remove movie from watchlist."
            );
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text antialiased font-sans">
            <Navbar />

            <main className="flex-1 page-container py-8 sm:py-10">

                <div className="section-header mb-8">
                    <div>
                        <p className="label-caps mb-1">Queue</p>
                        <h1 className="section-title text-fluid-title">
                            Watchlist
                        </h1>
                    </div>

                    <span className="badge badge-accent">
                        {movies.length} {movies.length === 1 ? "Film" : "Films"}
                    </span>
                </div>

                {/* Tonight's Decision Assistant Banner */}
                {movies.length > 0 && (
                    <div className="mb-8 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/15 via-surface to-surface-2 p-5 sm:p-6 shadow-xl backdrop-blur-md">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/20 border border-accent/30 text-accent shadow-inner">
                                    <span className="material-symbols-outlined text-2xl">
                                        psychology
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-serif text-lg sm:text-xl font-bold text-text">
                                            Paralyzed by {movies.length} Saved Films?
                                        </h3>
                                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent uppercase font-mono tracking-wider">
                                            Decision AI
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-text-3 max-w-xl">
                                        Don&apos;t scroll for 20 minutes. Input your available time and mood to get <strong className="text-text">Tonight&apos;s Top 3 Matches</strong> from your watchlist.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
                                <Link
                                    to="/what-to-watch"
                                    className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 no-underline shadow-md shadow-accent/20"
                                >
                                    <span className="material-symbols-outlined text-sm">tune</span>
                                    <span>⚡ Pick for Tonight</span>
                                </Link>

                                <Link
                                    to="/what-to-watch?tab=cleanser"
                                    className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 no-underline"
                                >
                                    <span className="material-symbols-outlined text-sm">cleaning_services</span>
                                    <span>Clean Backlog</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="movie-grid-fluid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="aspect-[2/3] w-full skeleton rounded-lg" />
                                <div className="h-3 w-3/4 skeleton rounded" />
                                <div className="h-2.5 w-1/2 skeleton rounded" />
                            </div>
                        ))}
                    </div>
                ) : movies.length === 0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center text-center px-4 rounded-lg border border-border bg-surface p-12">
                        <span className="material-symbols-outlined text-5xl text-text-3 opacity-40 mb-3">
                            bookmark_border
                        </span>

                        <h2 className="font-serif text-xl font-semibold text-text">
                            Your Watchlist is Empty
                        </h2>

                        <p className="mt-1.5 text-sm text-text-3 max-w-sm">
                            Films you plan to experience will appear here. Discover films to begin curating.
                        </p>
                    </div>
                ) : (
                    <div className="movie-grid-fluid">
                        {movies.map((movie) => (
                            <WatchlistCard
                                key={movie.id}
                                movie={movie}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                )}

            </main>

            <Footer />
        </div>
    );
}

export default Watchlist;