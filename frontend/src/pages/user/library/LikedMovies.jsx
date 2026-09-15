import {useEffect, useMemo, useState} from "react";

import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import Icon from "../../../components/common/Icon.jsx";
import LikedStatsCard from "../../../components/cards/LikedStatsCard.jsx";
import LikedMovieCard from "../../../components/cards/LikedMovieCard.jsx";
import {
    getLikedMovies,
    unlikeMovie,
    getMovieGenres,
} from "../../../services/movieService.js";

export default function LikedMovies() {
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);

    const [loading, setLoading] = useState(true);
    const [genresLoading, setGenresLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("All");
    const [decade, setDecade] = useState("All");
    const [ratingFilter, setRatingFilter] = useState(0);
    const [sortBy, setSortBy] = useState("Date Liked");
    const [view, setView] = useState("grid");

    const loadLikedMovies = async () => {
        try {
            setLoading(true);

            const response = await getLikedMovies();

            const data = Array.isArray(response)
                ? response
                : response?.data || [];

            const parsedMovies = data
                .map((movie, index) => {
                    let parsed;

                    try {
                        parsed =
                            typeof movie === "string"
                                ? JSON.parse(movie)
                                : movie;
                    } catch (error) {
                        console.error(
                            "Failed to parse movie:",
                            error
                        );

                        return null;
                    }

                    if (!parsed || !parsed.id) {
                        return null;
                    }

                    return {
                        id: parsed.id,

                        title:
                            parsed.title ||
                            "Unknown Movie",

                        year:
                            parsed.release_date
                                ? Number(
                                    parsed.release_date.substring(
                                        0,
                                        4
                                    )
                                )
                                : 0,

                        genre:
                            Array.isArray(parsed.genres) &&
                            parsed.genres.length > 0
                                ? parsed.genres
                                    .map(
                                        (item) =>
                                            typeof item ===
                                            "string"
                                                ? item
                                                : item.name
                                    )
                                    .filter(Boolean)
                                    .join(" / ")
                                : "Unknown",

                        rating:
                            Number(
                                parsed.vote_average || 0
                            ) / 2,

                        poster:
                            parsed.poster_path
                                ? `https://image.tmdb.org/t/p/w500${parsed.poster_path}`
                                : "",

                        likedDate:
                            parsed.likedAt ||
                            parsed.liked_at ||
                            "",

                        rank: index + 1,

                        runtime: Number(
                            parsed.runtime || 0
                        ),
                    };
                })
                .filter(
                    (movie) => movie !== null
                );

            setMovies(parsedMovies);
        } catch (error) {
            console.error(
                "Failed to load liked movies:",
                error
            );

            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    const loadGenres = async () => {
        try {
            setGenresLoading(true);

            const response = await getMovieGenres();

            const data =
                response?.genres ||
                response?.data?.genres ||
                (Array.isArray(response)
                    ? response
                    : []);

            const parsedGenres = data
                .map((item) => {
                    if (typeof item === "string") {
                        return {
                            id: null,
                            name: item,
                        };
                    }

                    return {
                        id: item.id,
                        name: item.name,
                    };
                })
                .filter(
                    (item) =>
                        item.name &&
                        item.name.trim() !== ""
                )
                .sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

            setGenres(parsedGenres);
        } catch (error) {
            console.error(
                "Failed to load TMDB genres:",
                error
            );

            setGenres([]);
        } finally {
            setGenresLoading(false);
        }
    };

    useEffect(() => {
        loadLikedMovies();
        loadGenres();

        const handleVisibilityChange = () => {
            if (
                document.visibilityState ===
                "visible"
            ) {
                loadLikedMovies();
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, []);

    const genreCount = (genreName) => {
        if (genreName === "All") {
            return movies.length;
        }

        return movies.filter((movie) => {
            if (
                !movie.genre ||
                movie.genre === "Unknown"
            ) {
                return false;
            }

            return movie.genre
                .split("/")
                .map((item) =>
                    item.trim().toLowerCase()
                )
                .includes(
                    genreName
                        .trim()
                        .toLowerCase()
                );
        }).length;
    };

    const filteredMovies = useMemo(() => {
        let result = movies.filter((movie) => {
            const searchText =
                search
                    .toLowerCase()
                    .trim();

            const movieTitle =
                (movie.title || "").toLowerCase();

            const movieYear =
                movie.year?.toString() || "";

            const matchesSearch =
                movieTitle.includes(searchText) ||
                movieYear.includes(searchText);

            const matchesGenre =
                genre === "All" ||
                (movie.genre || "")
                    .split("/")
                    .map((item) =>
                        item.trim().toLowerCase()
                    )
                    .includes(
                        genre
                            .trim()
                            .toLowerCase()
                    );

            const matchesRating =
                ratingFilter === 0 ||
                movie.rating >= ratingFilter;

            const matchesDecade =
                decade === "All" ||
                (
                    movie.year >=
                    Number(decade) &&
                    movie.year <
                    Number(decade) + 10
                );

            return (
                matchesSearch &&
                matchesGenre &&
                matchesRating &&
                matchesDecade
            );
        });

        if (sortBy === "Rating") {
            result = [...result].sort(
                (a, b) =>
                    b.rating - a.rating
            );
        }

        if (sortBy === "Year") {
            result = [...result].sort(
                (a, b) =>
                    b.year - a.year
            );
        }

        if (sortBy === "Title") {
            result = [...result].sort(
                (a, b) =>
                    a.title.localeCompare(
                        b.title
                    )
            );
        }

        if (sortBy === "Date Liked") {
            result = [...result].sort(
                (a, b) =>
                    a.rank - b.rank
            );
        }

        return result;
    }, [
        movies,
        search,
        genre,
        decade,
        ratingFilter,
        sortBy,
    ]);

    const handleUnlike = async (id) => {
        try {
            await unlikeMovie(id);

            setMovies(
                (currentMovies) =>
                    currentMovies.filter(
                        (movie) =>
                            Number(movie.id) !==
                            Number(id)
                    )
            );
        } catch (error) {
            console.error(
                "Failed to unlike movie:",
                error
            );

            alert(
                "Failed to unlike movie."
            );
        }
    };

    const averageRating =
        movies.length > 0
            ? (
                movies.reduce(
                    (total, movie) =>
                        total +
                        Number(
                            movie.rating || 0
                        ),
                    0
                ) / movies.length
            ).toFixed(1)
            : "0.0";

    const totalHours =
        movies.length > 0
            ? Math.round(
                movies.reduce(
                    (total, movie) =>
                        total +
                        Number(
                            movie.runtime || 0
                        ),
                    0
                ) / 60
            )
            : 0;

    const topGenre = useMemo(() => {
        if (movies.length === 0) {
            return "None";
        }

        const counts = {};

        movies.forEach((movie) => {
            if (
                !movie.genre ||
                movie.genre === "Unknown"
            ) {
                return;
            }

            const movieGenres =
                movie.genre
                    .split("/")
                    .map((item) =>
                        item.trim()
                    );

            movieGenres.forEach(
                (movieGenre) => {
                    if (!movieGenre) {
                        return;
                    }

                    counts[movieGenre] =
                        (counts[movieGenre] ||
                            0) + 1;
                }
            );
        });

        const sortedGenres =
            Object.entries(
                counts
            ).sort(
                (a, b) => b[1] - a[1]
            );

        return sortedGenres.length > 0
            ? sortedGenres[0][0]
            : "None";
    }, [movies]);

    return (
        <div
            className="min-h-screen bg-[#0b0f12] font-sans text-gray-100 selection:bg-[#00e054] selection:text-[#00390f]">
            <Navbar/>

            <main className="flex-grow pb-20 pt-28">

                {/* HEADER */}

                <section className="mx-auto mb-8 max-w-[1440px] px-4 sm:px-8">
                    <div className="border-b border-white/[0.08] pb-8">

                        <div
                            className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-mono text-xs font-medium text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                            <Icon
                                className="animate-pulse text-[14px] text-rose-500"
                                style={{
                                    fontVariationSettings:
                                        "'FILL' 1",
                                }}
                            >
                                favorite
                            </Icon>

                            LIBRARY / LIKED MOVIES
                        </div>

                        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                            <div>
                                <h1 className="mb-3 font-headline text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">
                                    Liked Movies
                                </h1>

                                <p className="max-w-2xl text-base font-light leading-relaxed text-[#8d9ba8] sm:text-lg">
                                    A personal archive of{" "}
                                    <span className="font-semibold text-white">
                                        {movies.length} films
                                    </span>{" "}
                                    that touched your cinematic
                                    soul. Curated and cherished.
                                </p>
                            </div>
                        </div>

                        {/* STATS */}

                        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">

                            <LikedStatsCard
                                label="Total Liked"
                                icon="favorite"
                                iconClass="text-rose-500"
                                value={movies.length}
                                suffix="Films"
                                footer="Currently in library"
                                footerClass="text-[#00e054]"
                                filledIcon
                            />

                            <LikedStatsCard
                                label="Avg. Rating"
                                icon="star"
                                iconClass="text-yellow-500"
                                value={averageRating}
                                suffix="★"
                                footer="TMDB rating converted to 5"
                                footerClass="text-[#8d9ba8]"
                                filledIcon
                            />

                            <LikedStatsCard
                                label="Hours Watched"
                                icon="schedule"
                                iconClass="text-[#00e054]"
                                value={totalHours}
                                suffix="hrs"
                                footer="Based on movie runtime"
                                footerClass="text-[#8d9ba8]"
                            />

                            <LikedStatsCard
                                label="Top Genre"
                                icon="rocket_launch"
                                iconClass="text-sky-400"
                                value={topGenre}
                                footer="Most common genre"
                                footerClass="text-[#00e054]"
                                className="col-span-2 sm:col-span-1"
                            />

                        </div>
                    </div>
                </section>

                {/* FILTERS */}

                <section className="mx-auto mb-8 max-w-[1440px] px-4 sm:px-8">
                    <div
                        className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#181c20]/80 p-4 backdrop-blur-md sm:p-5">

                        <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">

                            {/* SEARCH */}

                            <div className="relative w-full max-w-md">
                                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8d9ba8]">
                                    search
                                </Icon>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search by title or year..."
                                    className="w-full rounded-xl border border-white/[0.08] bg-[#080a0d] py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-[#8d9ba8]/50 outline-none transition-colors focus:border-[#00e054] sm:text-sm"
                                />
                            </div>

                            {/* OTHER FILTERS */}

                            <div className="flex flex-wrap items-center gap-2.5">

                                {/* DECADE */}

                                <select
                                    value={decade}
                                    onChange={(e) =>
                                        setDecade(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-xl border border-white/[0.08] bg-[#080a0d] px-3.5 py-2.5 font-mono text-xs text-gray-200 outline-none"
                                >
                                    <option value="All">
                                        Decade: All
                                    </option>

                                    <option value="2020">
                                        2020s
                                    </option>

                                    <option value="2010">
                                        2010s
                                    </option>

                                    <option value="2000">
                                        2000s
                                    </option>

                                    <option value="1990">
                                        1990s
                                    </option>

                                    <option value="1980">
                                        1980s
                                    </option>

                                    <option value="1970">
                                        1970s
                                    </option>

                                    <option value="1960">
                                        1960s
                                    </option>
                                </select>

                                {/* SORT */}

                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-xl border border-[#00e054]/40 bg-[#080a0d] px-3.5 py-2.5 font-mono text-xs text-[#00e054] outline-none"
                                >
                                    <option value="Date Liked">
                                        Sort: Date Liked
                                    </option>

                                    <option value="Rating">
                                        Sort: Rating
                                    </option>

                                    <option value="Year">
                                        Sort: Year
                                    </option>

                                    <option value="Title">
                                        Sort: Title
                                    </option>
                                </select>

                                {/* RATING */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setRatingFilter(
                                            ratingFilter ===
                                            4
                                                ? 0
                                                : 4
                                        )
                                    }
                                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 font-mono text-xs transition-colors ${
                                        ratingFilter ===
                                        4
                                            ? "border-yellow-500/40 bg-[#080a0d] text-yellow-500"
                                            : "border-white/[0.08] bg-[#080a0d] text-[#8d9ba8]"
                                    }`}
                                >
                                    <Icon
                                        className="text-[14px]"
                                        style={{
                                            fontVariationSettings:
                                                "'FILL' 1",
                                        }}
                                    >
                                        star
                                    </Icon>

                                    4.0+
                                </button>

                                {/* VIEW */}

                                <div
                                    className="ml-auto flex items-center rounded-xl border border-white/[0.08] bg-[#080a0d] p-1 lg:ml-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setView(
                                                "grid"
                                            )
                                        }
                                        className={`rounded-lg p-1.5 ${
                                            view ===
                                            "grid"
                                                ? "bg-[#2c333a] text-[#00e054] shadow-sm"
                                                : "text-[#8d9ba8]"
                                        }`}
                                    >
                                        <Icon className="text-[18px]">
                                            grid_view
                                        </Icon>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setView(
                                                "list"
                                            )
                                        }
                                        className={`rounded-lg p-1.5 ${
                                            view ===
                                            "list"
                                                ? "bg-[#2c333a] text-[#00e054]"
                                                : "text-[#8d9ba8]"
                                        }`}
                                    >
                                        <Icon className="text-[18px]">
                                            format_list_bulleted
                                        </Icon>
                                    </button>

                                </div>
                            </div>
                        </div>

                        {/* QUICK FILTER */}

                        <div
                            className="custom-scrollbar flex items-center gap-2 overflow-x-auto pb-1 pt-1 font-mono text-xs">

                            <span className="mr-1 hidden text-[11px] uppercase tracking-wider text-[#8d9ba8] sm:inline">
                                Quick Filter:
                            </span>

                            {/* ALL */}

                            <button
                                type="button"
                                onClick={() =>
                                    setGenre("All")
                                }
                                className={`whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
                                    genre === "All"
                                        ? "bg-[#00e054] font-bold text-[#00390f] shadow-[0_0_12px_rgba(0,224,84,0.35)]"
                                        : "border border-white/[0.08] bg-[#080a0d] text-[#8d9ba8] hover:bg-[#22272d] hover:text-white"
                                }`}
                            >
                                All ({genreCount("All")})
                            </button>

                            {/* TMDB GENRES */}

                            {genresLoading ? (
                                <span
                                    className="whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#080a0d] px-3 py-1.5 text-[#8d9ba8]">
                                    Loading genres...
                                </span>
                            ) : genres.length === 0 ? (
                                <span
                                    className="whitespace-nowrap rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-rose-400">
                                    Failed to load genres
                                </span>
                            ) : (
                                genres.map(
                                    (item) => (
                                        <button
                                            type="button"
                                            key={
                                                item.id ||
                                                item.name
                                            }
                                            onClick={() =>
                                                setGenre(
                                                    item.name
                                                )
                                            }
                                            className={`whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
                                                genre ===
                                                item.name
                                                    ? "bg-[#00e054] font-bold text-[#00390f] shadow-[0_0_12px_rgba(0,224,84,0.35)]"
                                                    : "border border-white/[0.08] bg-[#080a0d] text-[#8d9ba8] hover:bg-[#22272d] hover:text-white"
                                            }`}
                                        >
                                            {
                                                item.name
                                            }{" "}
                                            (
                                            {
                                                genreCount(
                                                    item.name
                                                )
                                            }
                                            )
                                        </button>
                                    )
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* MOVIES */}

                <section className="mx-auto mb-16 max-w-[1440px] px-4 sm:px-8">

                    {loading ? (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#181c20] px-6 py-20 text-center">

                            <Icon className="mb-3 animate-spin text-5xl text-[#00e054]">
                                progress_activity
                            </Icon>

                            <h2 className="font-headline text-xl font-bold text-white">
                                Loading liked movies...
                            </h2>

                            <p className="mt-2 text-sm text-[#8d9ba8]">
                                Fetching your personal
                                movie library.
                            </p>

                        </div>
                    ) : filteredMovies.length > 0 ? (

                        <div
                            className={
                                view === "grid"
                                    ? "grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6"
                                    : "flex flex-col gap-4"
                            }
                        >
                            {filteredMovies.map(
                                (movie) => (
                                    <LikedMovieCard
                                        key={movie.id}
                                        movie={movie}
                                        onUnlike={
                                            handleUnlike
                                        }
                                    />
                                )
                            )}
                        </div>

                    ) : (

                        <div className="rounded-2xl border border-white/[0.08] bg-[#181c20] px-6 py-20 text-center">

                            <Icon className="mb-3 text-5xl text-[#8d9ba8]">
                                movie_filter
                            </Icon>

                            <h2 className="font-headline text-xl font-bold text-white">
                                {movies.length === 0
                                    ? "No liked movies yet"
                                    : "No liked movies found"}
                            </h2>

                            <p className="mt-2 text-sm text-[#8d9ba8]">
                                {movies.length === 0
                                    ? "Like a movie to add it to your personal library."
                                    : "Try changing your search or filters."}
                            </p>

                        </div>
                    )}
                </section>

                {/* PAGINATION */}

                {!loading &&
                    movies.length > 0 && (
                        <section className="mx-auto mb-12 max-w-[1440px] px-4 sm:px-8">

                            <div
                                className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#181c20]/60 px-6 py-4 sm:flex-row">

                                <div className="font-mono text-xs text-[#8d9ba8]">
                                    Showing{" "}
                                    <span className="font-semibold text-white">
                                        {filteredMovies.length >
                                        0
                                            ? `1 – ${Math.min(
                                                12,
                                                filteredMovies.length
                                            )}`
                                            : "0"}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-white">
                                        {
                                            filteredMovies.length
                                        }
                                    </span>{" "}
                                    liked films
                                </div>

                                <div className="flex items-center gap-1.5 font-mono text-xs">

                                    <button
                                        type="button"
                                        disabled
                                        className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#080a0d] px-3 py-2 text-[#8d9ba8] opacity-40"
                                    >
                                        <Icon className="text-[16px]">
                                            chevron_left
                                        </Icon>

                                        Prev
                                    </button>

                                    <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e054] font-bold text-[#00390f] shadow-[0_0_12px_rgba(0,224,84,0.35)]"
                                    >
                                        1
                                    </button>

                                    <button
                                        type="button"
                                        className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#080a0d] px-3 py-2 text-white transition-colors hover:border-[#00e054]"
                                    >
                                        Next

                                        <Icon className="text-[16px]">
                                            chevron_right
                                        </Icon>
                                    </button>

                                </div>
                            </div>
                        </section>
                    )}
            </main>

            <Footer/>
        </div>
    );
}