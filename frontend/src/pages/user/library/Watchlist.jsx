import { useEffect, useState } from "react";
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

            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10">

                <div className="section-header mb-8">
                    <div>
                        <p className="label-caps mb-1">Queue</p>
                        <h1 className="section-title text-3xl sm:text-4xl">
                            Watchlist
                        </h1>
                    </div>

                    <span className="badge badge-accent">
                        {movies.length} {movies.length === 1 ? "Film" : "Films"}
                    </span>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
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