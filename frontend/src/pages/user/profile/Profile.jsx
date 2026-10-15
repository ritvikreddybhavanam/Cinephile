import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";
import { getMyProfile, updateMyProfile, getPublicProfile } from "../../../services/userService.js";
import { getWatchedMovies } from "../../../services/watchedMovieService.js";
import { getLikedMovies } from "../../../services/favoriteService.js";
import { getWatchlist } from "../../../services/watchlistService.js";
import { getMyReviews } from "../../../services/reviewService.js";
import { getMyDiary } from "../../../services/diaryService.js";
import { getMovieDetails, searchMovies, getMovieGenres } from "../../../services/movieService.js";
import { searchPeople } from "../../../services/personService.js";
import { getFollowCounts, getFollowers, getFollowing, isFollowingUser } from "../../../services/socialService.js";
import FollowButton from "../../../components/social/FollowButton.jsx";

const AVATAR_PRESETS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"
];

const BANNER_PRESETS = [
    "https://image.tmdb.org/t/p/original/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg", // The Godfather
    "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", // Inception
    "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg", // Interstellar
    "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg", // Fight Club
    "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg"  // Pulp Fiction
];

const formatPosterUrl = (poster) => {
    if (!poster) return null;
    if (poster.startsWith("http")) return poster;
    return `https://image.tmdb.org/t/p/w500${poster}`;
};

function Profile() {
    const navigate = useNavigate();
    const { id: urlUserId } = useParams();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Social follow states
    const [followCounts, setFollowCounts] = useState({ followersCount: 0, followingCount: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [followModalMode, setFollowModalMode] = useState(null); // 'followers' | 'following' | null
    const [followListUsers, setFollowListUsers] = useState([]);
    const [followListLoading, setFollowListLoading] = useState(false);

    // Associated data
    const [watchedList, setWatchedList] = useState([]);
    const [likedList, setLikedList] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [reviewsList, setReviewsList] = useState([]);
    const [diaryList, setDiaryList] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [favLoading, setFavLoading] = useState(false);

    // Edit modal state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTab, setEditTab] = useState("general");
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        firstname: "",
        lastname: "",
        username: "",
        tagline: "",
        pronouns: "",
        location: "",
        website: "",
        bio: "",
        avatarUrl: "",
        bannerUrl: "",
        letterboxd: "",
        imdb: "",
        tmdb: "",
        twitter: "",
        instagram: "",
        favoriteMovieIds: "",
        favoriteGenres: "",
        favoriteDirectors: "",
        favoriteActors: ""
    });

    // TMDB Search state inside Edit Modal for Favorite 4
    const [movieQuery, setMovieQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedFavIds, setSelectedFavIds] = useState([]);

    // TMDB Autocomplete states for Taste & Influences
    const [allGenresList, setAllGenresList] = useState([]);
    const [genreInput, setGenreInput] = useState("");
    const [directorInput, setDirectorInput] = useState("");
    const [directorSuggestions, setDirectorSuggestions] = useState([]);
    const [isSearchingDirectors, setIsSearchingDirectors] = useState(false);
    const [actorInput, setActorInput] = useState("");
    const [actorSuggestions, setActorSuggestions] = useState([]);
    const [isSearchingActors, setIsSearchingActors] = useState(false);

    const title = profile?.firstname
        ? `${profile.firstname} ${profile.lastname || ""} (@${profile.username || "cinephile"})`
        : "Cinephile Profile";
    useDocumentTitle(title);

    useEffect(() => {
        loadProfileData();
    }, [urlUserId]);

    const openFollowersModal = async () => {
        if (!profile?.id) return;
        setFollowModalMode("followers");
        setFollowListLoading(true);
        try {
            const list = await getFollowers(profile.id);
            setFollowListUsers(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Failed to load followers:", err);
            setFollowListUsers([]);
        } finally {
            setFollowListLoading(false);
        }
    };

    const openFollowingModal = async () => {
        if (!profile?.id) return;
        setFollowModalMode("following");
        setFollowListLoading(true);
        try {
            const list = await getFollowing(profile.id);
            setFollowListUsers(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Failed to load following:", err);
            setFollowListUsers([]);
        } finally {
            setFollowListLoading(false);
        }
    };

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token && !urlUserId) {
                navigate("/login");
                return;
            }

            const data = urlUserId
                ? await getPublicProfile(urlUserId)
                : await getMyProfile();

            setProfile(data);

            if (data?.id) {
                getFollowCounts(data.id)
                    .then((counts) => setFollowCounts(counts))
                    .catch(() => {});

                if (urlUserId) {
                    isFollowingUser(data.id)
                        .then((res) => setIsFollowing(res))
                        .catch(() => {});
                }
            }

            // Populate form
            setEditForm({
                firstname: data.firstname || "",
                lastname: data.lastname || "",
                username: data.username || "",
                tagline: data.tagline || "Cinephile Enthusiast",
                pronouns: data.pronouns || "",
                location: data.location || "",
                website: data.website || "",
                bio: data.bio || "",
                avatarUrl: data.avatarUrl || "",
                bannerUrl: data.bannerUrl || "",
                letterboxd: data.letterboxd || "",
                imdb: data.imdb || "",
                tmdb: data.tmdb || "",
                twitter: data.twitter || "",
                instagram: data.instagram || "",
                favoriteMovieIds: data.favoriteMovieIds || "",
                favoriteGenres: data.favoriteGenres || "",
                favoriteDirectors: data.favoriteDirectors || "",
                favoriteActors: data.favoriteActors || ""
            });

            const parsedFavIds = (data.favoriteMovieIds || "")
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean);
            setSelectedFavIds(parsedFavIds);

            // Fetch Favorite 4 details
            if (parsedFavIds.length > 0) {
                loadFavoriteMovies(parsedFavIds);
            } else {
                setFavoriteMovies([]);
            }

            // Load sub collections
            const [watched, liked, savedWatchlist, reviews, diaryLogs] = await Promise.allSettled([
                getWatchedMovies(),
                getLikedMovies(),
                getWatchlist(),
                getMyReviews(),
                getMyDiary()
            ]);

            if (watched.status === "fulfilled") {
                setWatchedList(Array.isArray(watched.value) ? watched.value : []);
            }
            if (diaryLogs.status === "fulfilled") {
                setDiaryList(Array.isArray(diaryLogs.value) ? diaryLogs.value : []);
            }
            if (liked.status === "fulfilled") {
                const rawLiked = Array.isArray(liked.value)
                    ? liked.value
                    : liked.value?.data || [];
                const parsedLiked = rawLiked
                    .map((item) => {
                        if (!item) return null;
                        if (typeof item === "string") {
                            try {
                                return JSON.parse(item);
                            } catch {
                                return null;
                            }
                        }
                        return item;
                    })
                    .filter((m) => m && (m.id || m.tmdbMovieId || m.movieId));
                setLikedList(parsedLiked);
            }
            if (savedWatchlist.status === "fulfilled") {
                setWatchlist(Array.isArray(savedWatchlist.value) ? savedWatchlist.value : []);
            }
            if (reviews.status === "fulfilled") {
                const rawReviews = Array.isArray(reviews.value) ? reviews.value : [];
                const enhancedReviews = await Promise.all(
                    rawReviews.map(async (rev) => {
                        let movieTitle = rev.movieTitle;
                        let poster = rev.poster;
                        let year = rev.year;

                        if ((!movieTitle || !poster) && rev.movieId) {
                            try {
                                const details = await getMovieDetails(rev.movieId);
                                if (details) {
                                    movieTitle = movieTitle || details.title;
                                    poster = poster || details.poster_path;
                                    year = year || (details.release_date ? new Date(details.release_date).getFullYear() : null);
                                }
                            } catch {
                                // Ignore
                            }
                        }

                        return {
                            ...rev,
                            movieTitle,
                            poster,
                            year
                        };
                    })
                );
                setReviewsList(enhancedReviews);
            }

        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadFavoriteMovies = async (ids) => {
        try {
            setFavLoading(true);
            const promises = ids.slice(0, 4).map((id) => getMovieDetails(id).catch(() => null));
            const results = await Promise.all(promises);
            setFavoriteMovies(results.filter(Boolean));
        } catch (err) {
            console.error("Failed to load favorite movies:", err);
        } finally {
            setFavLoading(false);
        }
    };

    // Load TMDB Genres when edit modal opens
    useEffect(() => {
        if (isEditOpen && allGenresList.length === 0) {
            getMovieGenres()
                .then((res) => {
                    const list = res?.genres || res || [];
                    setAllGenresList(Array.isArray(list) ? list : []);
                })
                .catch((err) => console.error("Failed to load genres:", err));
        }
    }, [isEditOpen]);

    // Helpers to parse tags
    const getGenreTags = () =>
        (editForm.favoriteGenres || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    const getDirectorTags = () =>
        (editForm.favoriteDirectors || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    const getActorTags = () =>
        (editForm.favoriteActors || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    const addTag = (field, tagValue) => {
        const clean = tagValue.trim();
        if (!clean) return;
        const current = (editForm[field] || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        if (!current.some((item) => item.toLowerCase() === clean.toLowerCase())) {
            const next = [...current, clean].join(", ");
            setEditForm((prev) => ({ ...prev, [field]: next }));
        }
    };

    const removeTag = (field, tagValue) => {
        const current = (editForm[field] || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const next = current.filter((item) => item.toLowerCase() !== tagValue.toLowerCase()).join(", ");
        setEditForm((prev) => ({ ...prev, [field]: next }));
    };

    // TMDB Director search autocomplete handler
    const handleDirectorSearchChange = async (e) => {
        const val = e.target.value;
        setDirectorInput(val);
        if (!val.trim()) {
            setDirectorSuggestions([]);
            return;
        }
        try {
            setIsSearchingDirectors(true);
            const res = await searchPeople(val.trim());
            const people = res?.results || [];
            // Sort to prioritize directing department
            people.sort((a, b) => {
                const aDir = a.known_for_department === "Directing" ? -1 : 1;
                const bDir = b.known_for_department === "Directing" ? -1 : 1;
                return aDir - bDir;
            });
            setDirectorSuggestions(people.slice(0, 6));
        } catch (err) {
            console.error("Failed to search directors:", err);
        } finally {
            setIsSearchingDirectors(false);
        }
    };

    // TMDB Actor search autocomplete handler
    const handleActorSearchChange = async (e) => {
        const val = e.target.value;
        setActorInput(val);
        if (!val.trim()) {
            setActorSuggestions([]);
            return;
        }
        try {
            setIsSearchingActors(true);
            const res = await searchPeople(val.trim());
            const people = res?.results || [];
            // Sort to prioritize acting department
            people.sort((a, b) => {
                const aAct = a.known_for_department === "Acting" ? -1 : 1;
                const bAct = b.known_for_department === "Acting" ? -1 : 1;
                return aAct - bAct;
            });
            setActorSuggestions(people.slice(0, 6));
        } catch (err) {
            console.error("Failed to search actors:", err);
        } finally {
            setIsSearchingActors(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const updated = await updateMyProfile({
                ...editForm,
                favoriteMovieIds: selectedFavIds.join(",")
            });
            setProfile(updated);
            setIsEditOpen(false);

            // Update user in localStorage for header display
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    parsed.firstname = updated.firstname;
                    parsed.lastname = updated.lastname;
                    localStorage.setItem("user", JSON.stringify(parsed));
                } catch {
                    // Ignore parse error
                }
            }

            // Reload favorite movies
            if (selectedFavIds.length > 0) {
                loadFavoriteMovies(selectedFavIds);
            } else {
                setFavoriteMovies([]);
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Error updating profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const copyProfileLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Profile link copied to clipboard!");
    };

    // Calculate rating distribution
    const ratingDistribution = useMemo(() => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsList.forEach((r) => {
            const rounded = Math.min(5, Math.max(1, Math.round(r.rating || 0)));
            dist[rounded] = (dist[rounded] || 0) + 1;
        });
        return dist;
    }, [reviewsList]);

    const maxRatingCount = Math.max(1, ...Object.values(ratingDistribution));

    const totalHoursWatched = useMemo(() => {
        const count = watchedList.length || profile?.totalFilmsWatched || 0;
        return Math.round((count * 115) / 60);
    }, [watchedList, profile]);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg text-text">
                <Navbar />
                <main className="flex min-h-[60vh] items-center justify-center pt-24">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
                        <p className="text-sm text-text-2">Loading Cinephile Profile...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const bannerBackground = profile?.bannerUrl || BANNER_PRESETS[1];
    const initials = `${profile?.firstname?.charAt(0) || "F"}${profile?.lastname?.charAt(0) || "B"}`.toUpperCase();

    return (
        <div className="min-h-screen bg-bg text-text antialiased">
            <Navbar />

            <main className="w-full pb-16">
                {/* HERO BANNER SECTION */}
                <section className="relative w-full overflow-hidden bg-surface-2">
                    {/* Backdrop image */}
                    <div
                        className="absolute inset-0 h-64 sm:h-80 w-full bg-cover bg-center opacity-30 blur-[1px]"
                        style={{ backgroundImage: `url('${bannerBackground}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-transparent to-bg/90" />

                    {/* Content Container */}
                    <div className="relative page-container pt-28 sm:pt-36 pb-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

                            {/* Avatar & Core Identity */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                                {/* Avatar */}
                                <div className="group relative h-28 w-28 sm:h-36 sm:w-36 flex-shrink-0 overflow-hidden rounded-full border-4 border-surface bg-surface shadow-2xl ring-2 ring-accent/30">
                                    {profile?.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.firstname}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-accent/20 text-3xl sm:text-4xl font-serif font-bold text-accent">
                                            {initials}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsEditOpen(true)}
                                        className="absolute inset-0 flex items-center justify-center bg-bg/60 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                                        title="Change avatar"
                                    >
                                        <span className="material-symbols-outlined text-white text-2xl">
                                            photo_camera
                                        </span>
                                    </button>
                                </div>

                                {/* Names & Badges */}
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="badge badge-accent text-[11px] font-semibold tracking-wider uppercase">
                                            {profile?.tagline || "Cinephile Patron"}
                                        </span>
                                        {profile?.pronouns && (
                                            <span className="text-xs text-text-3 font-medium">
                                                ({profile.pronouns})
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="text-2xl sm:text-4xl font-serif font-bold text-text tracking-tight flex items-center gap-2">
                                        <span>
                                            {profile?.firstname} {profile?.lastname || ""}
                                        </span>
                                    </h1>

                                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-2">
                                        <span className="font-mono text-accent font-medium">
                                            @{profile?.username || "cinephile_member"}
                                        </span>
                                        {profile?.location && (
                                            <span className="flex items-center gap-1 text-text-3">
                                                <span className="material-symbols-outlined text-[14px]">
                                                    location_on
                                                </span>
                                                {profile.location}
                                            </span>
                                        )}
                                        {profile?.website && (
                                            <a
                                                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1 text-accent hover:underline"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">
                                                    link
                                                </span>
                                                Website
                                            </a>
                                        )}
                                        <span className="flex items-center gap-1 text-text-3">
                                            <span className="material-symbols-outlined text-[14px]">
                                                calendar_today
                                            </span>
                                            Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "2026"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons & Socials */}
                            <div className="flex flex-col items-start sm:items-end gap-3 self-stretch md:self-end">
                                <div className="flex items-center gap-2.5">
                                    {urlUserId ? (
                                        <FollowButton
                                            targetUserId={profile.id}
                                            initialFollowing={isFollowing}
                                            onFollowChange={(f) => {
                                                setIsFollowing(f);
                                                setFollowCounts((prev) => ({
                                                    ...prev,
                                                    followersCount: f ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1)
                                                }));
                                            }}
                                            size="md"
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditOpen(true)}
                                            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">
                                                edit
                                            </span>
                                            <span>Edit Profile</span>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={copyProfileLink}
                                        className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer"
                                        title="Share profile link"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">
                                            share
                                        </span>
                                    </button>
                                </div>

                                {/* External Social Icons (Letterboxd, IMDb, TMDB, Twitter, Instagram) */}
                                <div className="flex items-center gap-2 pt-1">
                                    {profile?.letterboxd && (
                                        <a
                                            href={`https://letterboxd.com/${profile.letterboxd}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title={`Letterboxd: @${profile.letterboxd}`}
                                            className="h-8 px-2.5 rounded-lg bg-surface border border-border flex items-center gap-1 text-xs text-text-2 hover:text-accent hover:border-accent transition-colors"
                                        >
                                            <span className="font-bold text-[11px] text-accent tracking-tighter">LB</span>
                                            <span>{profile.letterboxd}</span>
                                        </a>
                                    )}

                                    {profile?.imdb && (
                                        <a
                                            href={profile.imdb.startsWith("http") ? profile.imdb : `https://www.imdb.com/name/${profile.imdb}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="IMDb Profile"
                                            className="h-8 px-2.5 rounded-lg bg-surface border border-border flex items-center gap-1 text-xs text-text-2 hover:text-accent hover:border-accent transition-colors"
                                        >
                                            <span className="font-extrabold text-[11px] text-[#F5C518]">IMDb</span>
                                        </a>
                                    )}

                                    {profile?.tmdb && (
                                        <a
                                            href={`https://www.themoviedb.org/u/${profile.tmdb}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title={`TMDB: @${profile.tmdb}`}
                                            className="h-8 px-2.5 rounded-lg bg-surface border border-border flex items-center gap-1 text-xs text-text-2 hover:text-accent hover:border-accent transition-colors"
                                        >
                                            <span className="font-bold text-[11px] text-[#01B4E4]">TMDB</span>
                                        </a>
                                    )}

                                    {profile?.twitter && (
                                        <a
                                            href={`https://x.com/${profile.twitter.replace("@", "")}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title={`X: @${profile.twitter}`}
                                            className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-2 hover:text-accent hover:border-accent transition-colors"
                                        >
                                            <span className="font-bold text-xs">𝕏</span>
                                        </a>
                                    )}

                                    {profile?.instagram && (
                                        <a
                                            href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title={`Instagram: @${profile.instagram}`}
                                            className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-2 hover:text-accent hover:border-accent transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">
                                                photo_camera
                                            </span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATS BAR */}
                <section className="border-y border-border bg-surface/50">
                    <div className="page-container py-4">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-border">
                            <div className="pt-2 sm:pt-0">
                                <span className="block text-2xl font-serif font-bold text-text">
                                    {watchedList.length || profile?.totalFilmsWatched || 0}
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                    Watched
                                </span>
                            </div>

                            <div className="pt-2 sm:pt-0">
                                <Link to="/diary" className="no-underline group">
                                    <span className="block text-2xl font-serif font-bold text-accent group-hover:underline">
                                        {diaryList.length || profile?.totalDiaryLogs || 0}
                                    </span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                        Diary Logs 📅
                                    </span>
                                </Link>
                            </div>

                            <div className="pt-2 sm:pt-0">
                                <span className="block text-2xl font-serif font-bold text-text">
                                    {likedList.length || profile?.totalFilmsLiked || 0}
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                    Liked
                                </span>
                            </div>

                            <div className="pt-2 sm:pt-0">
                                <span className="block text-2xl font-serif font-bold text-text">
                                    {watchlist.length || profile?.totalWatchlist || 0}
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                    Watchlist
                                </span>
                            </div>

                            <div className="pt-2 sm:pt-0">
                                <span className="block text-2xl font-serif font-bold text-text">
                                    {reviewsList.length || profile?.totalReviews || 0}
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                    Reviews
                                </span>
                            </div>

                            <div
                                onClick={openFollowersModal}
                                className="pt-2 sm:pt-0 cursor-pointer group hover:bg-surface-2/40 transition-colors rounded-lg"
                                title="View followers"
                            >
                                <span className="block text-2xl font-serif font-bold text-accent group-hover:underline">
                                    {followCounts.followersCount || 0}
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                    Followers 👥
                                </span>
                            </div>

                            <div
                                onClick={openFollowingModal}
                                className="pt-2 sm:pt-0 cursor-pointer group hover:bg-surface-2/40 transition-colors rounded-lg"
                                title="View following"
                            >
                                <span className="block text-2xl font-serif font-bold text-accent group-hover:underline">
                                    {followCounts.followingCount || 0}
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                    Following
                                </span>
                            </div>

                            <div className="col-span-2 sm:col-span-1 pt-2 sm:pt-0">
                                <span className="block text-2xl font-serif font-bold text-accent">
                                    {totalHoursWatched}h
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                    Screen Time
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MAIN CONTAINER */}
                <div className="page-container py-8">

                    {/* FAVORITE 4 SHOWCASE (Letterboxd Hallmark) */}
                    <section className="mb-10 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <span className="label-caps mb-0.5">Signature Selection</span>
                                <h2 className="font-serif text-xl font-bold text-text">
                                    Favorite 4 Films
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditTab("favorites");
                                    setIsEditOpen(true);
                                }}
                                className="text-xs font-semibold text-accent hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    tune
                                </span>
                                Edit 4
                            </button>
                        </div>

                        {favLoading ? (
                            <div className="flex h-44 items-center justify-center">
                                <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
                            </div>
                        ) : favoriteMovies.length > 0 ? (
                            <div className="movie-grid-fluid gap-4">
                                {favoriteMovies.map((movie) => (
                                    <Link
                                        key={movie.id}
                                        to={`/movies/${movie.id}`}
                                        className="group relative flex flex-col rounded-xl overflow-hidden border border-border bg-surface-2 transition-all duration-300 hover:border-accent hover:shadow-lg no-underline"
                                    >
                                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface">
                                            {movie.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                    alt={movie.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-text-3">
                                                    No Poster
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <span className="text-xs font-bold text-accent">
                                                    ★ {Number(movie.vote_average || 0).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-semibold text-xs text-text truncate group-hover:text-accent transition-colors">
                                                {movie.title}
                                            </h3>
                                            <p className="text-[11px] text-text-3 mt-0.5">
                                                {movie.release_date ? movie.release_date.substring(0, 4) : "N/A"}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-border p-8 text-center bg-surface-2/40">
                                <span className="material-symbols-outlined text-4xl text-accent/60 mb-2">
                                    movie
                                </span>
                                <h3 className="font-serif text-base font-semibold text-text">
                                    No Favorite 4 Selected
                                </h3>
                                <p className="text-xs text-text-3 mt-1 max-w-sm mx-auto">
                                    Showcase your all-time 4 favorite motion pictures on your profile.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditTab("favorites");
                                        setIsEditOpen(true);
                                    }}
                                    className="mt-4 btn-primary text-xs py-2 px-4 cursor-pointer"
                                >
                                    + Choose Favorite 4
                                </button>
                            </div>
                        )}
                    </section>

                    {/* TABS NAVIGATION */}
                    <div className="mb-6 flex border-b border-border overflow-x-auto">
                        {[
                            { id: "overview", label: "Overview", icon: "person" },
                            { id: "diary", label: `Diary (${diaryList.length || profile?.totalDiaryLogs || 0})`, icon: "edit_calendar" },
                            { id: "watched", label: `Watched (${watchedList.length || profile?.totalFilmsWatched || 0})`, icon: "visibility" },
                            { id: "reviews", label: `Reviews (${reviewsList.length || profile?.totalReviews || 0})`, icon: "rate_review" },
                            { id: "watchlist", label: `Watchlist (${watchlist.length || profile?.totalWatchlist || 0})`, icon: "bookmark" },
                            { id: "favorites", label: `Liked (${likedList.length || profile?.totalFilmsLiked || 0})`, icon: "favorite" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? "border-accent text-accent"
                                        : "border-transparent text-text-2 hover:text-text"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {tab.icon}
                                </span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* TAB CONTENTS */}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Bio, Taste, Preferences */}
                            <div className="lg:col-span-8 flex flex-col gap-6">

                                {/* Bio Section */}
                                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                    <h3 className="font-serif text-lg font-bold text-text mb-3">
                                        Cinephile Statement & Bio
                                    </h3>
                                    <p className="text-sm text-text-2 leading-relaxed whitespace-pre-line">
                                        {profile?.bio ||
                                            "Welcome to my Cinephile diary. I log, critique, and explore films from around the world."}
                                    </p>
                                </div>

                                {/* Cinephile Taste (Genres, Directors, Actors) */}
                                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                    <h3 className="font-serif text-lg font-bold text-text mb-4">
                                        Cinematic Taste & Influences
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Favorite Genres */}
                                        <div>
                                            <span className="block text-xs font-semibold uppercase tracking-wider text-text-3 mb-2">
                                                Favorite Genres
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {(profile?.favoriteGenres || "Psychological Thriller, Sci-Fi, Neo-Noir, Arthouse Drama")
                                                    .split(",")
                                                    .map((g, i) => (
                                                        <span key={i} className="badge badge-accent text-xs">
                                                            {g.trim()}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>

                                        {/* Favorite Directors */}
                                        <div>
                                            <span className="block text-xs font-semibold uppercase tracking-wider text-text-3 mb-2">
                                                Admired Directors
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {(profile?.favoriteDirectors || "Christopher Nolan, Denis Villeneuve, Stanley Kubrick, Akira Kurosawa")
                                                    .split(",")
                                                    .map((d, i) => (
                                                        <span key={i} className="rounded-lg bg-surface-2 border border-border px-3 py-1 text-xs text-text-2">
                                                            🎬 {d.trim()}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>

                                        {/* Favorite Actors */}
                                        <div>
                                            <span className="block text-xs font-semibold uppercase tracking-wider text-text-3 mb-2">
                                                Favorite Performers
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {(profile?.favoriteActors || "Christian Bale, Cillian Murphy, Florence Pugh, Leonardo DiCaprio")
                                                    .split(",")
                                                    .map((a, i) => (
                                                        <span key={i} className="rounded-lg bg-surface-2 border border-border px-3 py-1 text-xs text-text-2">
                                                            ⭐ {a.trim()}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity / Diary */}
                                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-serif text-lg font-bold text-text">
                                            Recent Film Activity
                                        </h3>
                                        <Link to="/mywatchedfilms" className="text-xs text-accent hover:underline">
                                            View Diary →
                                        </Link>
                                    </div>

                                    {watchedList.length > 0 ? (
                                        <div className="movie-grid-fluid gap-3">
                                            {watchedList.slice(0, 4).map((movie) => (
                                                <Link
                                                    key={movie.id}
                                                    to={`/movies/${movie.movieId || movie.id}`}
                                                    className="group rounded-lg overflow-hidden border border-border bg-surface-2 p-2 hover:border-accent transition-colors no-underline"
                                                >
                                                    <div className="aspect-[2/3] w-full rounded overflow-hidden bg-surface mb-2">
                                                        {movie.poster ? (
                                                            <img
                                                                src={movie.poster}
                                                                alt={movie.title}
                                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs text-text-3">
                                                                Poster
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-semibold text-text truncate group-hover:text-accent">
                                                        {movie.title}
                                                    </p>
                                                    <p className="text-[10px] text-text-3 mt-0.5">
                                                        {movie.year || "Watched"}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-text-3">No movies logged in your diary yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Rating Distribution & Quick Stats */}
                            <div className="lg:col-span-4 flex flex-col gap-6">

                                {/* Rating Histogram (Letterboxd Style) */}
                                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                    <h3 className="font-serif text-base font-bold text-text mb-4 flex items-center justify-between">
                                        <span>Rating Breakdown</span>
                                        <span className="text-xs text-accent">
                                            {reviewsList.length} Rated
                                        </span>
                                    </h3>

                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((stars) => {
                                            const count = ratingDistribution[stars] || 0;
                                            const percent = Math.round((count / maxRatingCount) * 100);
                                            return (
                                                <div key={stars} className="flex items-center gap-2 text-xs">
                                                    <span className="w-12 text-text-3 flex items-center gap-0.5">
                                                        {stars} ★
                                                    </span>
                                                    <div className="h-3 flex-1 rounded-full bg-surface-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-accent rounded-full transition-all duration-500"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                    <span className="w-6 text-right font-mono text-text-3 text-[11px]">
                                                        {count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Community Badges */}
                                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                    <h3 className="font-serif text-base font-bold text-text mb-3">
                                        Cinephile Badges
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="p-2.5 rounded-xl bg-surface-2 border border-border text-center">
                                            <span className="material-symbols-outlined text-accent text-2xl mb-1">
                                                verified
                                            </span>
                                            <p className="text-xs font-bold text-text">Film Critic</p>
                                            <p className="text-[10px] text-text-3">Active Reviewer</p>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-surface-2 border border-border text-center">
                                            <span className="material-symbols-outlined text-accent text-2xl mb-1">
                                                theaters
                                            </span>
                                            <p className="text-xs font-bold text-text">Auteur Club</p>
                                            <p className="text-[10px] text-text-3">Pro Cinephile</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DIARY TAB */}
                    {activeTab === "diary" && (
                        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-text">
                                        Personal Film Diary ({diaryList.length})
                                    </h3>
                                    <p className="text-xs text-text-3 mt-0.5">
                                        Your chronological watch history with dates, rewatch marks, and ratings.
                                    </p>
                                </div>
                                <Link
                                    to="/diary"
                                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                    <span>Full Diary & Stats</span>
                                </Link>
                            </div>

                            {diaryList.length > 0 ? (
                                <div className="divide-y divide-border/60">
                                    {diaryList.slice(0, 15).map((log) => {
                                        const d = log.watchedDate ? new Date(log.watchedDate) : new Date();
                                        return (
                                            <div
                                                key={log.id}
                                                className="flex items-center justify-between gap-4 py-3.5 hover:bg-surface-2/40 px-2 rounded-xl transition-colors"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <span className="text-xs font-mono font-bold text-accent shrink-0 w-24">
                                                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>

                                                    <Link
                                                        to={`/movies/${log.movieId}`}
                                                        className="h-12 w-8 shrink-0 rounded bg-surface border border-border overflow-hidden"
                                                    >
                                                        {log.poster ? (
                                                            <img src={log.poster} alt={log.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-[9px] text-text-3">Film</div>
                                                        )}
                                                    </Link>

                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Link
                                                                to={`/movies/${log.movieId}`}
                                                                className="font-serif text-sm font-semibold text-text hover:text-accent no-underline truncate"
                                                            >
                                                                {log.title}
                                                            </Link>
                                                            {log.year && (
                                                                <span className="text-xs text-text-3 font-mono">({log.year})</span>
                                                            )}
                                                            {log.isRewatch && (
                                                                <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                                                                    🔁 Rewatch
                                                                </span>
                                                            )}
                                                        </div>

                                                        {log.venueOrPlatform && (
                                                            <span className="text-[11px] text-text-3 mt-0.5 block">
                                                                📍 {log.venueOrPlatform}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {log.rating ? (
                                                        <span className="badge badge-accent text-xs">
                                                            ★ {Number(log.rating).toFixed(1)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-text-3 font-mono">—</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-text-3">
                                    <span className="material-symbols-outlined text-4xl text-accent/60 mb-2">
                                        edit_calendar
                                    </span>
                                    <p className="text-sm">No diary entries logged yet.</p>
                                    <Link to="/diary" className="mt-3 inline-block btn-primary text-xs py-2 px-4">
                                        Log First Film in Diary
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* WATCHED FILMS TAB */}
                    {activeTab === "watched" && (
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-serif text-xl font-bold text-text">
                                    Watched & Logged Films ({watchedList.length})
                                </h3>
                                <Link to="/movies" className="btn-secondary text-xs py-1.5 px-3">
                                    + Log More Films
                                </Link>
                            </div>

                            {watchedList.length > 0 ? (
                                <div className="movie-grid-fluid gap-4">
                                    {watchedList.map((movie) => (
                                        <Link
                                            key={movie.id}
                                            to={`/movies/${movie.movieId || movie.id}`}
                                            className="group rounded-xl overflow-hidden border border-border bg-surface-2 p-2 hover:border-accent transition-colors no-underline flex flex-col"
                                        >
                                            <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface mb-2">
                                                {formatPosterUrl(movie.poster || movie.poster_path) ? (
                                                    <img
                                                        src={formatPosterUrl(movie.poster || movie.poster_path)}
                                                        alt={movie.title}
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-text-3">
                                                        No Poster
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-xs font-semibold text-text truncate group-hover:text-accent">
                                                {movie.title}
                                            </h4>
                                            <span className="text-[10px] text-text-3">
                                                {movie.year || "Logged"}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-text-3">
                                    <span className="material-symbols-outlined text-4xl text-accent/60 mb-2">
                                        visibility
                                    </span>
                                    <p className="text-sm">No watched movies logged yet.</p>
                                    <Link to="/movies" className="mt-3 inline-block btn-primary text-xs py-2 px-4">
                                        Browse Films
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === "reviews" && (
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-serif text-xl font-bold text-text">
                                    Published Critical Reviews ({reviewsList.length})
                                </h3>
                                <Link to="/movies" className="btn-secondary text-xs py-1.5 px-3">
                                    + Draft New Review
                                </Link>
                            </div>

                            {reviewsList.length > 0 ? (
                                <div className="space-y-4">
                                    {reviewsList.map((review) => {
                                        const posterUrl = formatPosterUrl(review.poster);
                                        const filmTitle = review.movieTitle || "Film";
                                        return (
                                            <article
                                                key={review.id}
                                                className="rounded-xl border border-border bg-surface-2 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start transition-all hover:border-border/80"
                                            >
                                                {/* Movie Poster */}
                                                <Link
                                                    to={`/movies/${review.movieId}`}
                                                    className="group relative aspect-[2/3] w-16 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface border border-border shadow-sm"
                                                >
                                                    {posterUrl ? (
                                                        <img
                                                            src={posterUrl}
                                                            alt={filmTitle}
                                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[10px] text-text-3 text-center p-1">
                                                            No Poster
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Review Info */}
                                                <div className="space-y-2 flex-1 min-w-0">
                                                    <div>
                                                        <Link
                                                            to={`/movies/${review.movieId}`}
                                                            className="text-base font-serif font-bold text-text hover:text-accent transition-colors line-clamp-1 no-underline"
                                                        >
                                                            {filmTitle}
                                                            {review.year && (
                                                                <span className="ml-2 text-xs font-normal font-sans text-text-3">
                                                                    ({review.year})
                                                                </span>
                                                            )}
                                                        </Link>

                                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                                            <span className="badge badge-accent text-xs">
                                                                ★ {Number(review.rating || 0).toFixed(1)} / 5.0
                                                            </span>
                                                            {review.viewingFormat && (
                                                                <span className="rounded bg-surface border border-border px-1.5 py-0.5 text-[10px] font-mono text-text-3 uppercase">
                                                                    {review.viewingFormat}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-text-3">
                                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {review.title && review.title !== filmTitle && (
                                                        <h4 className="font-serif text-sm font-semibold text-text italic text-accent/90">
                                                            "{review.title}"
                                                        </h4>
                                                    )}

                                                    <p className="text-xs sm:text-sm text-text-2 leading-relaxed whitespace-pre-line">
                                                        {review.content}
                                                    </p>
                                                </div>

                                                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 flex-shrink-0">
                                                    <Link
                                                        to={`/movies/${review.movieId}`}
                                                        className="btn-secondary text-xs py-1.5 px-3"
                                                    >
                                                        View Film →
                                                    </Link>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-text-3">
                                    <span className="material-symbols-outlined text-4xl text-accent/60 mb-2">
                                        rate_review
                                    </span>
                                    <p className="text-sm">No reviews written yet.</p>
                                    <Link to="/movies" className="mt-3 inline-block btn-primary text-xs py-2 px-4">
                                        Explore Films & Review
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* WATCHLIST TAB */}
                    {activeTab === "watchlist" && (
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <h3 className="font-serif text-xl font-bold text-text mb-6">
                                Saved Watchlist ({watchlist.length})
                            </h3>
                            {watchlist.length > 0 ? (
                                <div className="movie-grid-fluid gap-4">
                                    {watchlist.map((movie) => (
                                        <Link
                                            key={movie.id}
                                            to={`/movies/${movie.movieId || movie.id}`}
                                            className="group rounded-xl overflow-hidden border border-border bg-surface-2 p-2 hover:border-accent transition-colors no-underline flex flex-col"
                                        >
                                            <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface mb-2">
                                                {formatPosterUrl(movie.poster || movie.poster_path) ? (
                                                    <img
                                                        src={formatPosterUrl(movie.poster || movie.poster_path)}
                                                        alt={movie.title}
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-text-3">
                                                        No Poster
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-xs font-semibold text-text truncate group-hover:text-accent">
                                                {movie.title}
                                            </h4>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-text-3">
                                    <span className="material-symbols-outlined text-4xl text-accent/60 mb-2">
                                        bookmark
                                    </span>
                                    <p className="text-sm">Your watchlist is currently empty.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* FAVORITES TAB */}
                    {activeTab === "favorites" && (
                        <div className="rounded-2xl border border-border bg-surface p-6">
                            <h3 className="font-serif text-xl font-bold text-text mb-6">
                                Liked Films ({likedList.length})
                            </h3>
                            {likedList.length > 0 ? (
                                <div className="movie-grid-fluid gap-4">
                                    {likedList.map((movie, idx) => {
                                        const movieId = movie.tmdbMovieId || movie.movieId || movie.id;
                                        const poster = movie.poster_path || movie.poster;
                                        return (
                                            <Link
                                                key={movieId || idx}
                                                to={`/movies/${movieId}`}
                                                className="group rounded-xl overflow-hidden border border-border bg-surface-2 p-2 hover:border-accent transition-colors no-underline flex flex-col"
                                            >
                                                <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface mb-2">
                                                    {formatPosterUrl(poster) ? (
                                                        <img
                                                             src={formatPosterUrl(poster)}
                                                             alt={movie.title || "Movie"}
                                                             className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs text-text-3">
                                                            No Poster
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className="text-xs font-semibold text-text truncate group-hover:text-accent">
                                                    {movie.title || "Untitled"}
                                                </h4>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-text-3">
                                    <span className="material-symbols-outlined text-4xl text-accent/60 mb-2">
                                        favorite
                                    </span>
                                    <p className="text-sm">No liked movies yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* EDIT PROFILE MODAL */}
            {isEditOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-2/60">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent text-2xl">
                                    tune
                                </span>
                                <h3 className="font-serif text-lg font-bold text-text">
                                    Edit Cinephile Profile
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="text-text-3 hover:text-text cursor-pointer p-1"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Modal Sub-Tabs */}
                        <div className="flex border-b border-border bg-surface-2 px-6 overflow-x-auto">
                            {[
                                { id: "general", label: "General & Bio" },
                                { id: "visuals", label: "Avatar & Banner" },
                                { id: "favorites", label: "Favorite 4 Films" },
                                { id: "taste", label: "Taste & Influences" },
                                { id: "socials", label: "Socials & Links" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setEditTab(tab.id)}
                                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                                        editTab === tab.id
                                            ? "border-accent text-accent"
                                            : "border-transparent text-text-3 hover:text-text"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-5">

                            {/* TAB 1: GENERAL */}
                            {editTab === "general" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.firstname}
                                                onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                                                className="mc-input w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.lastname}
                                                onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                                                className="mc-input w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                Username (@handle)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. film_critic_99"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                className="mc-input w-full font-mono text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                Cinephile Tagline / Badge
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 35mm Purist & Film Historian"
                                                value={editForm.tagline}
                                                onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                                                className="mc-input w-full text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                Pronouns
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. they/them"
                                                value={editForm.pronouns}
                                                onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })}
                                                className="mc-input w-full text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Los Angeles, CA"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className="mc-input w-full text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://myblog.com"
                                                value={editForm.website}
                                                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                                className="mc-input w-full text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                            Bio & Cinephile Philosophy
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder="Write your cinema philosophy, favorite genres, and why you love movies..."
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="mc-input w-full resize-none text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: VISUALS (AVATAR & BANNER) */}
                            {editTab === "visuals" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                            Avatar Image URL
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={editForm.avatarUrl}
                                            onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                                            className="mc-input w-full mb-3 text-sm"
                                        />
                                        <span className="block text-xs text-text-3 mb-2">Or choose a preset avatar:</span>
                                        <div className="flex gap-3 overflow-x-auto pb-1">
                                            {AVATAR_PRESETS.map((preset, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setEditForm({ ...editForm, avatarUrl: preset })}
                                                    className={`h-14 w-14 rounded-full overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                                                        editForm.avatarUrl === preset ? "border-accent ring-2 ring-accent/30 scale-105" : "border-border hover:border-text-3"
                                                    }`}
                                                >
                                                    <img src={preset} alt="preset" className="h-full w-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-4">
                                        <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                            Profile Banner / Backdrop Image URL
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={editForm.bannerUrl}
                                            onChange={(e) => setEditForm({ ...editForm, bannerUrl: e.target.value })}
                                            className="mc-input w-full mb-3 text-sm"
                                        />
                                        <span className="block text-xs text-text-3 mb-2">Or choose a cinematic banner preset:</span>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {BANNER_PRESETS.map((preset, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setEditForm({ ...editForm, bannerUrl: preset })}
                                                    className={`h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                                        editForm.bannerUrl === preset ? "border-accent ring-2 ring-accent/30 scale-[1.02]" : "border-border hover:border-text-3"
                                                    }`}
                                                >
                                                    <img src={preset} alt="banner preset" className="h-full w-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: FAVORITE 4 FILMS (LETTERBOXD STYLE) */}
                            {editTab === "favorites" && (
                                <div className="space-y-4">
                                    <div className="rounded-xl bg-accent/10 border border-accent/20 p-3.5 text-xs text-text-2">
                                        <span className="font-bold text-accent">Letterboxd Favorite 4:</span> Search films by title and select up to 4 movies to prominently showcase on your profile.
                                    </div>

                                    {/* Search TMDB */}
                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                            Search TMDB Film Database
                                        </label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-3 text-lg">
                                                search
                                            </span>
                                            <input
                                                type="text"
                                                value={movieQuery}
                                                onChange={handleSearchMovie}
                                                placeholder="Search film title (e.g. Interstellar, Pulp Fiction)..."
                                                className="mc-input w-full pl-10"
                                            />
                                        </div>

                                        {/* Search Results dropdown */}
                                        {searchResults.length > 0 && (
                                            <div className="mt-2 rounded-xl border border-border bg-surface-2 divide-y divide-border overflow-hidden">
                                                {searchResults.map((m) => {
                                                    const isSelected = selectedFavIds.includes(String(m.id));
                                                    return (
                                                        <div
                                                            key={m.id}
                                                            className="flex items-center justify-between p-2.5 hover:bg-surface transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {m.poster_path ? (
                                                                    <img
                                                                        src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                                                                        alt={m.title}
                                                                        className="h-10 w-7 rounded object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-7 rounded bg-surface border border-border" />
                                                                )}
                                                                <div>
                                                                    <p className="text-xs font-semibold text-text">{m.title}</p>
                                                                    <p className="text-[10px] text-text-3">
                                                                        {m.release_date ? m.release_date.substring(0, 4) : "N/A"} • ★ {Number(m.vote_average || 0).toFixed(1)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleFavoriteMovieId(m.id)}
                                                                className={`text-xs px-3 py-1 rounded-full font-semibold cursor-pointer ${
                                                                    isSelected
                                                                        ? "bg-accent text-bg"
                                                                        : "btn-secondary"
                                                                }`}
                                                            >
                                                                {isSelected ? "Selected ✓" : "+ Add"}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected 4 IDs summary */}
                                    <div>
                                        <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                            Currently Selected ({selectedFavIds.length} / 4)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedFavIds.map((id) => (
                                                <span
                                                    key={id}
                                                    className="flex items-center gap-1.5 rounded-full bg-surface-2 border border-border px-3 py-1 text-xs text-text"
                                                >
                                                    <span>Film ID: #{id}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleFavoriteMovieId(id)}
                                                        className="text-text-3 hover:text-red-400 cursor-pointer"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                            {selectedFavIds.length === 0 && (
                                                <span className="text-xs text-text-3">None selected yet.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: TASTE & INFLUENCES */}
                            {editTab === "taste" && (
                                <div className="space-y-6">
                                    {/* 1. FAVORITE GENRES */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-semibold text-text-3 uppercase">
                                                Favorite Genres
                                            </label>
                                            <span className="text-[11px] text-text-3">Click suggestions or press Enter</span>
                                        </div>
                                        
                                        {/* Selected Genre Chips */}
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {getGenreTags().map((genre) => (
                                                <span
                                                    key={genre}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-medium"
                                                >
                                                    <span>{genre}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag("favoriteGenres", genre)}
                                                        className="hover:text-red-400 cursor-pointer ml-0.5"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                            {getGenreTags().length === 0 && (
                                                <span className="text-xs text-text-3 italic">No genres selected yet.</span>
                                            )}
                                        </div>

                                        {/* Genre Input & Autocomplete Dropdown */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search or type a genre (e.g. Psychological Thriller, Sci-Fi)..."
                                                value={genreInput}
                                                onChange={(e) => setGenreInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === ",") {
                                                        e.preventDefault();
                                                        if (genreInput.trim()) {
                                                            addTag("favoriteGenres", genreInput);
                                                            setGenreInput("");
                                                        }
                                                    }
                                                }}
                                                className="mc-input w-full text-sm"
                                            />
                                            {genreInput.trim() && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        addTag("favoriteGenres", genreInput);
                                                        setGenreInput("");
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-accent text-bg font-semibold rounded hover:bg-accent/80 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>

                                        {/* Quick Select Genre Suggestions */}
                                        {allGenresList.length > 0 && (
                                            <div className="mt-2">
                                                <span className="text-[11px] text-text-3 block mb-1">Popular TMDB Genres:</span>
                                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                                    {allGenresList
                                                        .filter(
                                                            (g) =>
                                                                !genreInput.trim() ||
                                                                g.name.toLowerCase().includes(genreInput.trim().toLowerCase())
                                                        )
                                                        .slice(0, 14)
                                                        .map((g) => {
                                                            const isAdded = getGenreTags().some(
                                                                (t) => t.toLowerCase() === g.name.toLowerCase()
                                                            );
                                                            return (
                                                                <button
                                                                    key={g.id}
                                                                    type="button"
                                                                    disabled={isAdded}
                                                                    onClick={() => {
                                                                        addTag("favoriteGenres", g.name);
                                                                        setGenreInput("");
                                                                    }}
                                                                    className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                                                                        isAdded
                                                                            ? "border-border/40 text-text-3 opacity-40 cursor-not-allowed"
                                                                            : "border-border bg-surface-2 text-text hover:border-accent hover:text-accent cursor-pointer"
                                                                    }`}
                                                                >
                                                                    + {g.name}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. FAVORITE DIRECTORS */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-semibold text-text-3 uppercase">
                                                Favorite Directors
                                            </label>
                                            <span className="text-[11px] text-text-3">Search TMDB or press Enter</span>
                                        </div>

                                        {/* Selected Director Chips */}
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {getDirectorTags().map((director) => (
                                                <span
                                                    key={director}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-medium"
                                                >
                                                    <span>{director}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag("favoriteDirectors", director)}
                                                        className="hover:text-red-400 cursor-pointer ml-0.5"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                            {getDirectorTags().length === 0 && (
                                                <span className="text-xs text-text-3 italic">No directors selected yet.</span>
                                            )}
                                        </div>

                                        {/* Director Autocomplete Input */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search director (e.g. Christopher Nolan, Denis Villeneuve)..."
                                                value={directorInput}
                                                onChange={handleDirectorSearchChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === ",") {
                                                        e.preventDefault();
                                                        if (directorInput.trim()) {
                                                            addTag("favoriteDirectors", directorInput);
                                                            setDirectorInput("");
                                                            setDirectorSuggestions([]);
                                                        }
                                                    }
                                                }}
                                                className="mc-input w-full text-sm"
                                            />
                                            {isSearchingDirectors && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent animate-pulse">
                                                    Searching...
                                                </div>
                                            )}
                                            {directorInput.trim() && !isSearchingDirectors && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        addTag("favoriteDirectors", directorInput);
                                                        setDirectorInput("");
                                                        setDirectorSuggestions([]);
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-accent text-bg font-semibold rounded hover:bg-accent/80 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            )}

                                            {/* Director Suggestions Dropdown */}
                                            {directorSuggestions.length > 0 && (
                                                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#161922] border border-border rounded-xl shadow-2xl overflow-hidden divide-y divide-border/40">
                                                    {directorSuggestions.map((person) => {
                                                        const isAdded = getDirectorTags().some(
                                                            (t) => t.toLowerCase() === person.name.toLowerCase()
                                                        );
                                                        return (
                                                            <button
                                                                key={person.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    addTag("favoriteDirectors", person.name);
                                                                    setDirectorInput("");
                                                                    setDirectorSuggestions([]);
                                                                }}
                                                                className={`w-full flex items-center justify-between p-2.5 text-left transition-colors cursor-pointer ${
                                                                    isAdded
                                                                        ? "bg-surface-2/60 opacity-60"
                                                                        : "hover:bg-surface-2"
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    {person.profile_path ? (
                                                                        <img
                                                                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                                            alt={person.name}
                                                                            className="w-7 h-7 rounded-full object-cover border border-border/50"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-xs text-text-3 border border-border/50">
                                                                            👤
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div className="text-sm font-medium text-text">
                                                                            {person.name}
                                                                        </div>
                                                                        <div className="text-[11px] text-text-3">
                                                                            {person.known_for_department || "Crew"}
                                                                            {person.known_for && person.known_for.length > 0 && (
                                                                                <span> • Known for {person.known_for[0]?.title || person.known_for[0]?.name}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs text-accent font-medium">
                                                                    {isAdded ? "Added" : "+ Add"}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. FAVORITE PERFORMERS */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-semibold text-text-3 uppercase">
                                                Favorite Performers
                                            </label>
                                            <span className="text-[11px] text-text-3">Search TMDB or press Enter</span>
                                        </div>

                                        {/* Selected Performer Chips */}
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {getActorTags().map((actor) => (
                                                <span
                                                    key={actor}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
                                                >
                                                    <span>{actor}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag("favoriteActors", actor)}
                                                        className="hover:text-red-400 cursor-pointer ml-0.5"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                            {getActorTags().length === 0 && (
                                                <span className="text-xs text-text-3 italic">No performers selected yet.</span>
                                            )}
                                        </div>

                                        {/* Performer Autocomplete Input */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search performer (e.g. Christian Bale, Cillian Murphy, Florence Pugh)..."
                                                value={actorInput}
                                                onChange={handleActorSearchChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === ",") {
                                                        e.preventDefault();
                                                        if (actorInput.trim()) {
                                                            addTag("favoriteActors", actorInput);
                                                            setActorInput("");
                                                            setActorSuggestions([]);
                                                        }
                                                    }
                                                }}
                                                className="mc-input w-full text-sm"
                                            />
                                            {isSearchingActors && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent animate-pulse">
                                                    Searching...
                                                </div>
                                            )}
                                            {actorInput.trim() && !isSearchingActors && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        addTag("favoriteActors", actorInput);
                                                        setActorInput("");
                                                        setActorSuggestions([]);
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-accent text-bg font-semibold rounded hover:bg-accent/80 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            )}

                                            {/* Performer Suggestions Dropdown */}
                                            {actorSuggestions.length > 0 && (
                                                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#161922] border border-border rounded-xl shadow-2xl overflow-hidden divide-y divide-border/40">
                                                    {actorSuggestions.map((person) => {
                                                        const isAdded = getActorTags().some(
                                                            (t) => t.toLowerCase() === person.name.toLowerCase()
                                                        );
                                                        return (
                                                            <button
                                                                key={person.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    addTag("favoriteActors", person.name);
                                                                    setActorInput("");
                                                                    setActorSuggestions([]);
                                                                }}
                                                                className={`w-full flex items-center justify-between p-2.5 text-left transition-colors cursor-pointer ${
                                                                    isAdded
                                                                        ? "bg-surface-2/60 opacity-60"
                                                                        : "hover:bg-surface-2"
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    {person.profile_path ? (
                                                                        <img
                                                                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                                            alt={person.name}
                                                                            className="w-7 h-7 rounded-full object-cover border border-border/50"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-xs text-text-3 border border-border/50">
                                                                            👤
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div className="text-sm font-medium text-text">
                                                                            {person.name}
                                                                        </div>
                                                                        <div className="text-[11px] text-text-3">
                                                                            {person.known_for_department || "Acting"}
                                                                            {person.known_for && person.known_for.length > 0 && (
                                                                                <span> • Known for {person.known_for[0]?.title || person.known_for[0]?.name}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs text-accent font-medium">
                                                                    {isAdded ? "Added" : "+ Add"}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 5: SOCIALS & CINEPHILE PLATFORMS */}
                            {editTab === "socials" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                Letterboxd Username
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. tarantino"
                                                value={editForm.letterboxd}
                                                onChange={(e) => setEditForm({ ...editForm, letterboxd: e.target.value })}
                                                className="mc-input w-full text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                TMDB Username
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. tmdb_user"
                                                value={editForm.tmdb}
                                                onChange={(e) => setEditForm({ ...editForm, tmdb: e.target.value })}
                                                className="mc-input w-full text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                            IMDb Profile / Name URL
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://www.imdb.com/user/..."
                                            value={editForm.imdb}
                                            onChange={(e) => setEditForm({ ...editForm, imdb: e.target.value })}
                                            className="mc-input w-full text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                Twitter / X Handle
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="@username"
                                                value={editForm.twitter}
                                                onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                                                className="mc-input w-full text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-text-3 uppercase mb-1">
                                                Instagram Handle
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="@username"
                                                value={editForm.instagram}
                                                onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                                                className="mc-input w-full text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer Actions */}
                            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="btn-secondary text-xs py-2.5 px-4 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary text-xs py-2.5 px-6 cursor-pointer flex items-center gap-1.5"
                                >
                                    {saving ? (
                                        <>
                                            <span className="material-symbols-outlined text-[16px] animate-spin">
                                                progress_activity
                                            </span>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[16px]">
                                                check
                                            </span>
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Followers / Following List Modal */}
            {followModalMode && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setFollowModalMode(null)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
                            <h3 className="font-serif text-lg font-bold text-text capitalize flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent text-xl">
                                    {followModalMode === "followers" ? "group" : "person_add"}
                                </span>
                                <span>{followModalMode}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setFollowModalMode(null)}
                                className="rounded-lg p-1 text-text-3 hover:text-text hover:bg-surface transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 overflow-y-auto flex-1 divide-y divide-border/40">
                            {followListLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-text-3 text-xs">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                    <span>Loading {followModalMode}...</span>
                                </div>
                            ) : followListUsers.length > 0 ? (
                                followListUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-surface-2/50 transition-colors"
                                    >
                                        <Link
                                            to={`/profile/${user.id}`}
                                            onClick={() => setFollowModalMode(null)}
                                            className="flex items-center gap-3 min-w-0 no-underline group"
                                        >
                                            <div className="h-10 w-10 shrink-0 rounded-full border border-border bg-surface-2 overflow-hidden flex items-center justify-center font-bold text-accent text-sm">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.firstname} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span>{user.firstname?.charAt(0) || "C"}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                                                    {user.firstname} {user.lastname}
                                                </p>
                                                <p className="text-[11px] text-text-3 truncate">
                                                    @{user.username || `user${user.id}`}
                                                </p>
                                            </div>
                                        </Link>

                                        <FollowButton
                                            targetUserId={user.id}
                                            initialFollowing={user.isFollowing}
                                            size="sm"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-text-3 text-xs">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-40">person_off</span>
                                    <p>No {followModalMode} found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Profile;
