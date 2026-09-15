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
        <div className="min-h-screen flex flex-col bg-[#0b0f12] text-slate-100 antialiased">

            <Navbar />

            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">

                <div className="mb-8 border-b border-white/10 pb-4 flex items-baseline justify-between">

                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase flex items-center gap-3">

                        Watchlist

                        <span className="text-xs font-medium px-2.5 py-1 rounded bg-white/10 text-slate-300 normal-case tracking-normal">
                            {movies.length} Movies
                        </span>

                    </h1>

                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (

                    <div className="flex min-h-[300px] items-center justify-center">

                        <div className="flex items-center gap-3 text-[#00e054]">

                            <span className="material-symbols-outlined animate-spin">
                                progress_activity
                            </span>

                            Loading watchlist...

                        </div>

                    </div>

                ) : movies.length === 0 ? (

                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                        <span className="material-symbols-outlined text-6xl text-slate-600">
                            bookmark_border
                        </span>

                        <h2 className="mt-4 text-xl font-bold text-white">
                            Your watchlist is empty
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Movies you add to your watchlist will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

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