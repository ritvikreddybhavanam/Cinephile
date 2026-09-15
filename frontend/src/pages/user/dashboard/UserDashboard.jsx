import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";

import LikedStatsCard from "../../../components/cards/LikedStatsCard.jsx";
import TrendingMovieCard from "../../../components/cards/TrendingMovieCard.jsx";

import {
  getTrendingMovies,
  getPosterUrl,
  getBackdropUrl,
  getMovieVideos,
} from "../../../services/movieService.js";

import {
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist,
} from "../../../services/watchlistService.js";

const stats = [
  ["42", "Reviews", "text-[#43fe6d]"],
  ["128", "Favorites", "text-[#43fe6d]"],
  ["56", "Watchlist", "text-[#43fe6d]"],
  ["4.1", "Avg Rating", "text-[#eab308]"],
];

function UserDashboard() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    const loadDashboardMovies = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTrendingMovies();

        setMovies(data.results || []);
      } catch (error) {
        console.error("Failed to load dashboard movies:", error);

        setError("Unable to load movies.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardMovies();
  }, []);

  const movieOfTheDay = movies[0];

  const trendingMovies = movies.slice(1, 4);

  useEffect(() => {
    const checkMovieWatchlist = async () => {
      if (!movieOfTheDay) {
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        setIsInWatchlist(false);
        return;
      }

      try {
        const result = await checkWatchlist(movieOfTheDay.id);

        setIsInWatchlist(
          result === true ||
            result?.exists === true ||
            result?.inWatchlist === true,
        );
      } catch (error) {
        console.error("Failed to check watchlist:", error);

        setIsInWatchlist(false);
      }
    };

    checkMovieWatchlist();
  }, [movieOfTheDay]);

  const formatRating = (rating) => {
    if (!rating) {
      return "0.0";
    }

    return Number(rating).toFixed(1);
  };

  const mapTrendingMovie = (movie) => ({
    id: movie.id,
    title: movie.title,
    genre: "MOVIE",
    rating: formatRating(movie.vote_average),
    image: getPosterUrl(movie.poster_path),
  });

  const handleWatchTrailer = async () => {
    if (!movieOfTheDay) {
      return;
    }

    try {
      const data = await getMovieVideos(movieOfTheDay.id);

      const trailer =
        data.results?.find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official,
        ) ||
        data.results?.find(
          (video) => video.site === "YouTube" && video.type === "Trailer",
        );

      if (trailer) {
        window.open(
          `https://www.youtube.com/watch?v=${trailer.key}`,
          "_blank",
          "noopener,noreferrer",
        );
      } else {
        alert("Trailer not available.");
      }
    } catch (error) {
      console.error("Failed to load trailer:", error);

      alert("Unable to load trailer.");
    }
  };

  const handleWatchlistToggle = async () => {
    if (!movieOfTheDay) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to use your watchlist.");
      return;
    }

    try {
      setWatchlistLoading(true);

      if (isInWatchlist) {
        await removeFromWatchlist(movieOfTheDay.id);

        setIsInWatchlist(false);
      } else {
        await addToWatchlist(movieOfTheDay);

        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Failed to update watchlist:", error);

      if (error.response?.status === 401) {
        alert("Please login to use your watchlist.");
      } else if (error.response?.status === 403) {
        alert("Access denied. Please login again.");
      } else if (error.response?.status === 409) {
        setIsInWatchlist(true);
      } else {
        alert("Unable to update your watchlist. Please try again.");
      }
    } finally {
      setWatchlistLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#e0e3e8] antialiased">
      <Navbar />

      <main className="w-full pb-8 pt-20">
        <section className="relative mb-16 h-[614px] min-h-[500px] w-full overflow-hidden">
          {movieOfTheDay && (
            <img
              src={getBackdropUrl(movieOfTheDay.backdrop_path)}
              alt={movieOfTheDay.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[rgba(10,10,10,0.7)] to-[rgba(10,10,10,0.2)]" />

          <div className="absolute bottom-0 left-0 w-full px-5 pb-12 pt-32 md:px-16">
            <div className="mx-auto max-w-[1400px]">
              <div className="mb-4 inline-block rounded-full border border-[#43fe6d]/30 bg-[#43fe6d]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#43fe6d] backdrop-blur-sm">
                Movie of the Day
              </div>

              {loading ? (
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-[64px] md:leading-[72px]">
                  Loading...
                </h1>
              ) : movieOfTheDay ? (
                <>
                  <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-[64px] md:leading-[72px]">
                    {movieOfTheDay.title}
                  </h1>

                  <p className="mb-8 max-w-2xl text-base leading-6 text-[#bacbb6] drop-shadow-md">
                    {movieOfTheDay.overview}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={handleWatchTrailer}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#43fe6d] px-6 py-3 text-base font-semibold text-[#00390f] transition-colors hover:bg-[#6cff80]"
                    >
                      <span className="material-symbols-outlined filled">
                        play_arrow
                      </span>
                      Watch Trailer
                    </button>

                    <button
                      type="button"
                      onClick={handleWatchlistToggle}
                      disabled={watchlistLoading}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-6 py-3 text-base font-semibold backdrop-blur-md transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isInWatchlist
                          ? "border-[#43fe6d]/40 bg-[#43fe6d]/20 text-[#43fe6d] hover:bg-[#43fe6d]/30"
                          : "border-[#262626] bg-[#1c2024]/50 text-[#e0e3e8] hover:bg-[#1c2024]"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {watchlistLoading
                          ? "progress_activity"
                          : isInWatchlist
                            ? "check"
                            : "add"}
                      </span>

                      {watchlistLoading
                        ? "Updating..."
                        : isInWatchlist
                          ? "In Watchlist"
                          : "Add to Watchlist"}
                    </button>
                  </div>
                </>
              ) : (
                <h1 className="mb-4 text-4xl font-extrabold text-white">
                  No movie available
                </h1>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-5 md:px-16 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-[#e0e3e8] md:text-[32px] md:leading-10">
                Welcome back, Cinephile 🎬.
              </h2>

              <p className="text-base leading-6 text-[#a0a0a0]">
                Your cinematic journey continues.
              </p>
            </div>

            <section className="space-y-6">
              <div className="flex items-end justify-between border-b border-[#262626] pb-4">
                <h3 className="text-2xl font-bold text-[#e0e3e8]">
                  Recent Activity
                </h3>

                <Link
                  to="/myreviews"
                  className="text-xs font-semibold tracking-wider text-[#43fe6d] transition-colors hover:text-[#6cff80]"
                >
                  VIEW ALL
                </Link>
              </div>

              <div className="space-y-6">
                {error ? (
                  <p className="text-[#a0a0a0]">{error}</p>
                ) : (
                  <p className="text-[#a0a0a0]">
                    Your recent reviews and activity will appear here.
                  </p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-12 lg:col-span-4">
            <section>
              <div className="mb-6 flex items-end justify-between border-b border-[#262626] pb-2">
                <h3 className="text-xl font-semibold text-[#e0e3e8]">
                  Trending
                </h3>

                <Link
                  to="/trending"
                  className="text-xs font-semibold tracking-wider text-[#43fe6d] transition-colors hover:text-[#6cff80]"
                >
                  MORE
                </Link>
              </div>

                <div className="space-y-4">
                    {loading ? (
                        <p className="text-[#a0a0a0]">Loading trending movies...</p>
                    ) : trendingMovies.length > 0 ? (
                        trendingMovies.map((movie) => (
                            <Link
                                to={`/movies/${movie.id}`}
                                key={movie.id}
                            >
                                <TrendingMovieCard
                                    movie={mapTrendingMovie(movie)}
                                />
                            </Link>
                        ))
                    ) : (
                        <p className="text-[#a0a0a0]">
                            No trending movies available.
                        </p>
                    )}
                </div>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default UserDashboard;
