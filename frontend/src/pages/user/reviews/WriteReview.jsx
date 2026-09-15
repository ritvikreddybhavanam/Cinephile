import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";

import {
    getMovieDetails,
    createReview,
} from "../../../services/movieService.js";

const initialTags = [];

function WriteReview() {
    const [searchParams] = useSearchParams();
    const movieId = searchParams.get("movieId");
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [movieLoading, setMovieLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);

    const [rating, setRating] = useState(4.5);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewText, setReviewText] = useState("");

    const [tags, setTags] = useState(initialTags);
    const [tagInput, setTagInput] = useState("");

    const [watchedDate, setWatchedDate] = useState("");
    const [viewingFormat, setViewingFormat] = useState("imax");
    const [rewatch, setRewatch] = useState(false);
    const [spoilers, setSpoilers] = useState(false);
    const [visibility, setVisibility] = useState("public");

    const wordCount = reviewText.trim()
        ? reviewText.trim().split(/\s+/).length
        : 0;

    useEffect(() => {
        const loadMovie = async () => {
            try {
                setMovieLoading(true);

                if (!movieId) {
                    setMovie(null);
                    return;
                }

                const data = await getMovieDetails(movieId);

                setMovie(data);
            } catch (error) {
                console.error("Failed to load movie:", error);
                setMovie(null);
            } finally {
                setMovieLoading(false);
            }
        };

        loadMovie();
    }, [movieId]);

    const addTag = (e) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();

            const newTag = tagInput
                .trim()
                .replace(/\s+/g, "");

            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }

            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(
            tags.filter(
                (tag) => tag !== tagToRemove
            )
        );
    };

    const handleRating = (value) => {
        setRating(value);
    };

    const handlePublishReview = async () => {
        if (!reviewTitle.trim() || !reviewText.trim()) {
            alert("Please enter a review title and review.");
            return;
        }

        try {
            const year = movie.release_date
                ? Number(movie.release_date.substring(0, 4))
                : null;

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null;

            const genre = Array.isArray(movie.genres)
                ? movie.genres.map((genre) => genre.name).join(", ")
                : null;

            const review = {
                movieId: Number(movieId),
                movieTitle: movie.title,
                poster,
                year,
                genre,
                service: null,

                rating: Number(rating),
                title: reviewTitle.trim(),
                content: reviewText.trim(),

                watchedDate: watchedDate || null,
                viewingFormat,
                rewatch,
                spoilers,
                visibility
            };

            await createReview(review);

            alert("Review published successfully!");
            navigate(`/movies/${movieId}?section=reviews`);

        } catch (error) {
            console.error("Error publishing review:", error);

            alert(
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to publish review."
            );
        }
    };

    if (movieLoading) {
        return (
            <div className="min-h-screen bg-[#101418] text-[#e0e3e8]">
                <Navbar />

                <main className="flex min-h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined animate-spin text-4xl text-[#43fe6d]">
                            progress_activity
                        </span>

                        <p className="text-sm text-[#99AABB]">
                            Loading movie details...
                        </p>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#101418] text-[#e0e3e8]">
                <Navbar />

                <main className="flex min-h-[80vh] items-center justify-center px-4">
                    <div className="rounded-xl bg-[#181c20] p-8 text-center shadow-xl">
                        <span className="material-symbols-outlined mb-3 text-5xl text-[#ffb4ab]">
                            error
                        </span>

                        <h2 className="text-xl font-bold text-white">
                            Movie Not Found
                        </h2>

                        <p className="mt-2 text-sm text-[#99AABB]">
                            We could not load the movie details.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="mt-5 rounded-lg bg-[#00e054] px-5 py-2.5 text-sm font-bold text-[#00390f] transition-colors hover:bg-[#43fe6d]"
                        >
                            Go Back
                        </button>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    const year = movie.release_date
        ? movie.release_date.substring(0, 4)
        : "N/A";

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Poster";

    const genres = Array.isArray(movie.genres)
        ? movie.genres
        : [];

    const directors = Array.isArray(movie.credits?.crew)
        ? movie.credits.crew
            .filter(
                (person) =>
                    person.job === "Director"
            )
            .map((person) => person.name)
            .slice(0, 3)
        : [];

    const cast = Array.isArray(movie.credits?.cast)
        ? movie.credits.cast
            .slice(0, 3)
            .map((person) => person.name)
        : [];

    const directorText =
        directors.length > 0
            ? directors.join(", ")
            : "Not available";

    const castText =
        cast.length > 0
            ? cast.join(", ")
            : "Not available";

    return (
        <div className="min-h-screen bg-[#101418] text-[#e0e3e8]">
            <Navbar />

            <main className="w-full bg-[#101418] pt-16">
                <div className="flex w-full flex-col">

                    <section className="relative -mt-16 w-full overflow-hidden bg-[#0b0f12]">
                        <div className="absolute inset-0 z-0">
                            <div
                                className="h-full w-full scale-105 bg-cover bg-center opacity-30 blur-sm"
                                style={{
                                    backgroundImage:
                                        movie.backdrop_path
                                            ? `url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`
                                            : `url('${posterUrl}')`,
                                }}
                            />

                            <div className="absolute inset-0 bg-gradient-to-b from-[#101418]/60 via-[#0b0f12]/85 to-[#0b0f12]" />
                        </div>

                        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-28 md:px-10">

                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                                <div>
                                    <h1 className="mt-1 text-3xl font-bold leading-10 tracking-tight text-white md:text-[32px]">
                                        Draft Your Critical Review
                                    </h1>

                                    <p className="mt-1 max-w-xl text-sm leading-5 text-[#99AABB]">
                                        Pen your cinematic analysis, dissect craft and storytelling,
                                        and log your impression into the collective community archive.
                                    </p>
                                </div>
                            </div>

                            <div className="relative mt-8 overflow-hidden rounded-xl bg-[#181c20] p-4 shadow-xl md:p-6">

                                <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#ff8000]/10 blur-3xl" />

                                <div className="relative z-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">

                                    <div className="group relative aspect-[2/3] w-24 flex-shrink-0 overflow-hidden rounded-lg shadow-md sm:w-28">

                                        <img
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            alt={`${movie.title} poster`}
                                            src={posterUrl}
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    "https://via.placeholder.com/500x750?text=No+Poster";
                                            }}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0D0F]/30 opacity-0 transition-opacity group-hover:opacity-100">
                                            <span className="material-symbols-outlined text-[22px] text-white">
                                                visibility
                                            </span>
                                        </div>
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <div className="mb-1.5 flex flex-wrap items-center gap-2">

                                            {genres
                                                .slice(0, 4)
                                                .map((genre) => (
                                                    <span
                                                        key={genre.id}
                                                        className="rounded bg-[#2C3440] px-2 py-0.5 text-xs text-white"
                                                    >
                                                        {genre.name}
                                                    </span>
                                                ))}

                                            {movie.runtime && (
                                                <span className="ml-2 flex items-center gap-1 text-xs text-[#99AABB]">
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        schedule
                                                    </span>

                                                    {movie.runtime} mins
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline">

                                            <h2 className="text-xl font-bold leading-7 tracking-tight text-white">
                                                {movie.title}
                                            </h2>

                                            <span className="text-sm leading-5 text-[#99AABB]">
                                                {year} • Directed by{" "}
                                                <span className="font-medium text-[#e0e3e8]">
                                                    {directorText}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.06] pt-3 text-[13px] leading-[18px] text-[#99AABB]">

                                            <div>
                                                <span className="text-[#99AABB]/70">
                                                    Director:
                                                </span>{" "}
                                                <span className="text-[#e0e3e8]">
                                                    {directorText}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-[#99AABB]/70">
                                                    Original Language:
                                                </span>{" "}
                                                <span className="text-[#e0e3e8]">
                                                    {movie.original_language
                                                        ? movie.original_language.toUpperCase()
                                                        : "N/A"}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-[#99AABB]/70">
                                                    Starring:
                                                </span>{" "}
                                                <span className="text-[#e0e3e8]">
                                                    {castText}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-shrink-0 items-end gap-2 self-stretch pt-2 sm:self-center sm:pt-0">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/movies/${movieId}`
                                                )
                                            }
                                            className="flex items-center gap-1 text-[13px] text-[#43fe6d] hover:underline"
                                        >
                                            Film info

                                            <span className="material-symbols-outlined text-[14px]">
                                                open_in_new
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-10">

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

                            <div className="flex flex-col gap-6 lg:col-span-8">

                                <div className="rounded-xl bg-[#181c20] p-5 shadow-sm md:p-6">

                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-[#99AABB]">
                                                Your Critical Rating
                                            </label>

                                            <span className="text-sm leading-5 text-[#99AABB]">
                                                Score this motion picture on our Cinephile 🎬 scale
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 self-start rounded-xl bg-[#0B0D0F] px-4 py-2.5 sm:self-auto">

                                            <div className="flex items-center gap-1 text-[#FFCC00]">

                                                {[1, 2, 3, 4, 4.5].map(
                                                    (value) => (
                                                        <button
                                                            key={value}
                                                            type="button"
                                                            aria-label={`${value} star`}
                                                            onClick={() =>
                                                                handleRating(
                                                                    value
                                                                )
                                                            }
                                                            className={`transition-transform hover:scale-110 ${
                                                                value > rating
                                                                    ? "opacity-40"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span
                                                                className="material-symbols-outlined text-[26px]"
                                                                style={{
                                                                    fontVariationSettings:
                                                                        "'FILL' 1",
                                                                }}
                                                            >
                                                                {value === 4.5 &&
                                                                rating >= 4.5
                                                                    ? "star_half"
                                                                    : "star"}
                                                            </span>
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            <div className="flex items-baseline gap-1 pl-2 text-xl font-bold text-white">
                                                <span>
                                                    {rating.toFixed(1)}
                                                </span>

                                                <span className="text-xs font-normal tracking-wider text-[#99AABB]">
                                                    / 5.0
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5 rounded-xl bg-[#181c20] p-5 shadow-sm md:p-6">

                                    <div>
                                        <div className="mb-2 flex items-center justify-between">

                                            <label
                                                htmlFor="review-title"
                                                className="text-xs uppercase tracking-wider text-[#99AABB]"
                                            >
                                                Review Headline
                                            </label>

                                            <span className="text-xs tracking-wider text-[#99AABB]">
                                                {reviewTitle.length} / 120
                                            </span>
                                        </div>

                                        <input
                                            id="review-title"
                                            type="text"
                                            maxLength={120}
                                            value={reviewTitle}
                                            onChange={(e) =>
                                                setReviewTitle(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Give your review a compelling headline..."
                                            className="w-full rounded-lg bg-[#0B0D0F] px-4 py-3 text-base text-white placeholder:text-[#99AABB]/50 transition-all focus:bg-[#1c2024] focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col">

                                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg bg-[#0B0D0F] px-3 py-2">

                                            <div className="flex items-center gap-1">

                                                {[
                                                    ["format_bold", "Bold"],
                                                    ["format_italic", "Italic"],
                                                    ["format_quote", "Quote"],
                                                    ["title", "Heading"],
                                                    [
                                                        "format_list_bulleted",
                                                        "Bulleted List",
                                                    ],
                                                ].map(([icon, label]) => (
                                                    <button
                                                        key={label}
                                                        type="button"
                                                        aria-label={label}
                                                        className="rounded p-1.5 text-[#bacbb6] transition-colors hover:bg-[#1c2024] hover:text-white"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            {icon}
                                                        </span>
                                                    </button>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSpoilers(
                                                            !spoilers
                                                        )
                                                    }
                                                    className="flex items-center gap-1 rounded p-1.5 text-xs tracking-wider text-[#bacbb6] transition-colors hover:bg-[#1c2024] hover:text-white"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        visibility_off
                                                    </span>

                                                    <span className="hidden sm:inline">
                                                        Spoiler Tag
                                                    </span>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs tracking-wider text-[#99AABB]">

                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        edit_note
                                                    </span>

                                                    {wordCount} words
                                                </span>

                                                <span className="text-[#363a3e]">
                                                    |
                                                </span>

                                                <span className="flex items-center gap-1 text-[#43fe6d]">
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        markdown
                                                    </span>

                                                    Markdown Enabled
                                                </span>
                                            </div>
                                        </div>

                                        <textarea
                                            id="review-textarea"
                                            rows={12}
                                            value={reviewText}
                                            onChange={(e) =>
                                                setReviewText(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Write your long-form analysis, deconstructing composition, narrative pacing, score, and thematic underpinnings..."
                                            className="w-full resize-y rounded-b-lg bg-[#1c2024] p-4 text-base leading-relaxed text-[#e0e3e8] transition-all focus:bg-[#262a2f] focus:outline-none"
                                        />
                                    </div>

                                    <div>

                                        <div className="mb-2 flex items-center justify-between">

                                            <label className="text-xs uppercase tracking-wider text-[#99AABB]">
                                                Thematic Tags & Motifs
                                            </label>

                                            <span className="text-[13px] text-[#99AABB]">
                                                Categorize for community discovery
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#0B0D0F] p-3">

                                            {tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="flex items-center gap-1.5 rounded-full bg-[#262a2f] px-2.5 py-1 text-[13px] text-white"
                                                >
                                                    #{tag}

                                                    <button
                                                        type="button"
                                                        aria-label={`Remove ${tag}`}
                                                        onClick={() =>
                                                            removeTag(tag)
                                                        }
                                                        className="transition-colors hover:text-[#ffb4ab]"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">
                                                            close
                                                        </span>
                                                    </button>
                                                </span>
                                            ))}

                                            <div className="flex items-center gap-1">

                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={(e) =>
                                                        setTagInput(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={addTag}
                                                    placeholder="+ Add motif or keyword..."
                                                    className="bg-transparent px-2 py-0.5 text-[13px] text-white placeholder:text-[#99AABB]/60 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 lg:col-span-4">

                                <div className="flex flex-col gap-5 rounded-xl bg-[#181c20] p-5 shadow-sm md:p-6">

                                    <div className="flex items-center gap-2">

                                        <span className="material-symbols-outlined text-[20px] text-[#43fe6d]">
                                            calendar_clock
                                        </span>

                                        <h3 className="text-xl font-bold leading-7 text-white">
                                            Viewing Details
                                        </h3>
                                    </div>

                                    <div>

                                        <label className="mb-2 block text-xs uppercase tracking-wider text-[#99AABB]">
                                            Date Watched
                                        </label>

                                        <div className="relative">

                                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#bacbb6]">
                                                <span className="material-symbols-outlined text-[18px]">
                                                    event
                                                </span>
                                            </span>

                                            <input
                                                type="date"
                                                value={watchedDate}
                                                onChange={(e) =>
                                                    setWatchedDate(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full cursor-pointer rounded-lg bg-[#0B0D0F] py-2.5 pl-10 pr-4 text-sm text-[#e0e3e8] transition-all focus:bg-[#1c2024] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>

                                        <label className="mb-2 block text-xs uppercase tracking-wider text-[#99AABB]">
                                            Viewing Format & Venue
                                        </label>

                                        <div className="grid grid-cols-2 gap-2">

                                            {[
                                                ["imax", "IMAX 70mm"],
                                                ["dolby", "Dolby Cinema"],
                                                ["oled", "4K HDR OLED"],
                                                ["35mm", "35mm Print"],
                                            ].map(([value, label]) => (
                                                <label
                                                    key={value}
                                                    className="cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="format"
                                                        value={value}
                                                        checked={
                                                            viewingFormat ===
                                                            value
                                                        }
                                                        onChange={(e) =>
                                                            setViewingFormat(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="peer sr-only"
                                                    />

                                                    <div className="rounded-lg bg-[#0B0D0F] p-2.5 text-center text-[13px] text-[#99AABB] transition-all peer-checked:bg-[#31353a] peer-checked:text-[#43fe6d]">
                                                        {label}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2">

                                        <label className="flex cursor-pointer items-center justify-between rounded-lg bg-[#0B0D0F] p-3 transition-colors hover:bg-[#1c2024]">

                                            <div className="flex items-center gap-3">

                                                <span className="material-symbols-outlined text-[20px] text-[#ffb787]">
                                                    repeat
                                                </span>

                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        Rewatch
                                                    </div>

                                                    <div className="text-[13px] text-[#99AABB]">
                                                        I have watched this film before
                                                    </div>
                                                </div>
                                            </div>

                                            <input
                                                type="checkbox"
                                                checked={rewatch}
                                                onChange={(e) =>
                                                    setRewatch(
                                                        e.target.checked
                                                    )
                                                }
                                                className="h-4 w-4 cursor-pointer rounded accent-[#43fe6d]"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5 rounded-xl bg-[#181c20] p-5 shadow-sm md:p-6">

                                    <div className="flex items-center gap-2">

                                        <span className="material-symbols-outlined text-[20px] text-[#ffb787]">
                                            shield
                                        </span>

                                        <h3 className="text-xl font-bold leading-7 text-white">
                                            Safety & Visibility
                                        </h3>
                                    </div>

                                    <div className="flex flex-col gap-2 rounded-lg bg-[#0B0D0F] p-3.5">

                                        <div className="flex items-center justify-between">

                                            <div className="flex items-center gap-2">

                                                <span className="material-symbols-outlined text-[20px] text-[#ffb4ab]">
                                                    warning
                                                </span>

                                                <span className="text-sm font-medium text-white">
                                                    Contains Spoilers
                                                </span>
                                            </div>

                                            <label className="relative inline-flex cursor-pointer items-center">

                                                <input
                                                    type="checkbox"
                                                    checked={spoilers}
                                                    onChange={(e) =>
                                                        setSpoilers(
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="peer sr-only"
                                                />

                                                <div className="relative h-5 w-10 rounded-full bg-[#31353a] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#ff8000] peer-checked:after:translate-x-full" />
                                            </label>
                                        </div>

                                        <p className="text-[13px] leading-[18px] text-[#99AABB]">
                                            Applies a spoiler shield blur to protect community
                                            readers until toggled open.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs uppercase tracking-wider text-[#99AABB]">
                                            Visibility
                                        </label>

                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                ["public", "Public"],
                                                ["private", "Private"],
                                            ].map(([value, label]) => (
                                                <label
                                                    key={value}
                                                    className="cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        value={value}
                                                        checked={visibility === value}
                                                        onChange={(e) =>
                                                            setVisibility(e.target.value)
                                                        }
                                                        className="peer sr-only"
                                                    />

                                                    <div className="flex items-center justify-center gap-2 rounded-lg bg-[#0B0D0F] p-2.5 text-[13px] text-[#99AABB] transition-all peer-checked:bg-[#31353a] peer-checked:text-[#43fe6d]">
                    <span className="material-symbols-outlined text-[17px]">
                        {value === "public"
                            ? "public"
                            : "lock"}
                    </span>

                                                        {label}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#181c20] p-4 shadow-xl md:p-6 sm:flex-row">

                            <div className="w-full sm:w-auto">

                                <span className="hidden text-[13px] text-[#99AABB] md:inline">
                                    Ready to publish your review for{" "}
                                    <strong className="text-white">
                                        {movie.title}
                                    </strong>
                                </span>
                            </div>

                            <div className="flex w-full items-center gap-3 sm:w-auto">

                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    disabled={publishing}
                                    className="w-full rounded-lg border border-white/[0.08] bg-[#0B0D0F] px-5 py-3 text-sm font-bold text-[#e0e3e8] transition-colors hover:bg-[#262a2f] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePublishReview}
                                    disabled={publishing}
                                    className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-[#00e054] px-6 py-3 text-sm font-bold text-[#00390f] shadow-lg shadow-[#43fe6d]/20 transition-all hover:bg-[#43fe6d] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {publishing
                                            ? "progress_activity"
                                            : "publish"}
                                    </span>

                                    {publishing
                                        ? "Publishing..."
                                        : "Publish Review"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default WriteReview;