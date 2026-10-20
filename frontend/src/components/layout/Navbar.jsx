import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";
import { searchMovies, getPosterUrl } from "../../services/movieService.js";
import { searchPeople } from "../../services/personService.js";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../../services/notificationService.js";

function formatRelativeTime(dateStr) {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
        return dateStr;
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case "FOLLOW":
            return { icon: "person_add", color: "text-blue-400 bg-blue-500/15" };
        case "REVIEW_LIKE":
            return { icon: "favorite", color: "text-rose-400 bg-rose-500/15" };
        case "REVIEW_COMMENT":
            return { icon: "chat_bubble", color: "text-amber-400 bg-amber-500/15" };
        case "COMMENT_REPLY":
            return { icon: "reply", color: "text-emerald-400 bg-emerald-500/15" };
        default:
            return { icon: "notifications", color: "text-accent bg-accent/15" };
    }
}

function Navbar() {
    const { token, user, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState({ movies: [], people: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Dropdown States
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Notifications state
    const [unreadCount, setUnreadCount] = useState(0);
    const [quickNotifications, setQuickNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Refs
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);
    const moreMenuRef = useRef(null);
    const moreTimerRef = useRef(null);
    const profileMenuRef = useRef(null);
    const profileTimerRef = useRef(null);
    const notificationsRef = useRef(null);

    // More Hover Handlers
    const handleMouseEnterMore = () => {
        if (moreTimerRef.current) clearTimeout(moreTimerRef.current);
        setShowMoreMenu(true);
    };

    const handleMouseLeaveMore = () => {
        moreTimerRef.current = setTimeout(() => {
            setShowMoreMenu(false);
        }, 220);
    };

    // Profile Hover Handlers
    const handleMouseEnterProfile = () => {
        if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
        setShowProfileMenu(true);
    };

    const handleMouseLeaveProfile = () => {
        profileTimerRef.current = setTimeout(() => {
            setShowProfileMenu(false);
        }, 220);
    };

    // Scroll shadow effect
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Global click outside and Ctrl+K shortcut
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!searchRef.current?.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (!moreMenuRef.current?.contains(event.target)) {
                setShowMoreMenu(false);
            }
            if (!profileMenuRef.current?.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (!notificationsRef.current?.contains(event.target)) {
                setShowNotificationsMenu(false);
            }
        };

        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, []);

    // Reset dropdown states on navigation
    useEffect(() => {
        setMenuOpen(false);
        setShowSuggestions(false);
        setShowMoreMenu(false);
        setShowProfileMenu(false);
        setShowNotificationsMenu(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    // Fetch Unread Notification Count
    const fetchUnreadCount = async () => {
        if (!token) {
            setUnreadCount(0);
            return;
        }
        try {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count || 0);
        } catch {
            // Ignore failure silently
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [token, location.pathname]);

    // Fetch quick notifications preview on open
    const handleToggleNotifications = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        const nextState = !showNotificationsMenu;
        setShowNotificationsMenu(nextState);

        if (nextState) {
            try {
                setLoadingNotifications(true);
                const list = await getNotifications();
                setQuickNotifications(Array.isArray(list) ? list.slice(0, 6) : []);
            } catch (err) {
                console.error("Failed to load notifications:", err);
            } finally {
                setLoadingNotifications(false);
            }
        }
    };

    const handleNotificationClick = async (item) => {
        setShowNotificationsMenu(false);
        if (!item.isRead) {
            try {
                await markNotificationAsRead(item.id);
                setUnreadCount((c) => Math.max(0, c - 1));
            } catch (err) {
                console.error("Failed to mark read:", err);
            }
        }

        if (item.type === "FOLLOW" && item.actorId) {
            navigate(`/profile/${item.actorId}`);
        } else if (item.targetMovieId) {
            navigate(`/movies/${item.targetMovieId}`);
        } else {
            navigate("/notifications");
        }
    };

    const handleMarkAllRead = async (e) => {
        if (e) e.stopPropagation();
        try {
            await markAllNotificationsAsRead();
            setUnreadCount(0);
            setQuickNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    // Live search query debouncing
    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) {
            setSuggestions({ movies: [], people: [] });
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const [moviesRes, peopleRes] = await Promise.allSettled([
                    searchMovies(q),
                    searchPeople(q)
                ]);

                setSuggestions({
                    movies: moviesRes.status === "fulfilled" && moviesRes.value?.results ? moviesRes.value.results.slice(0, 6) : [],
                    people: peopleRes.status === "fulfilled" && peopleRes.value?.results ? peopleRes.value.results.slice(0, 4) : []
                });
                setShowSuggestions(true);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        setShowSuggestions(false);
        if (suggestions.movies.length > 0) {
            navigate(`/movies/${suggestions.movies[0].id}`);
        } else if (suggestions.people.length > 0) {
            navigate(`/person/${suggestions.people[0].id}`);
        } else {
            navigate(`/movies?search=${encodeURIComponent(trimmed)}`);
        }
    };

    const handleLogout = () => {
        setMenuOpen(false);
        setShowProfileMenu(false);
        setShowMoreMenu(false);
        setShowNotificationsMenu(false);
        logout();
        navigate("/");
    };

    const totalResultsCount = suggestions.movies.length + suggestions.people.length;

    // Categorized features for the "More" mega dropdown
    const moreFeatureCategories = [
        {
            category: "Movies & Discovery",
            icon: "theaters",
            links: [
                { to: "/streaming", label: "Streaming Guide", desc: "Discover films across Netflix, Prime, Disney+ & more", icon: "live_tv", badge: "OTT" },
                { to: "/what-to-watch", label: "What Should I Watch?", desc: "Context-aware movie matchmaker & AI pick", icon: "psychology", badge: "AI" },
                { to: "/movies", label: "Films Catalog", desc: "Top rated, popular & custom filters", icon: "stars" },
                { to: "/trending", label: "Trending", desc: "Most talked about films this week", icon: "local_fire_department" },
                { to: "/new-releases", label: "New Releases", desc: "In theaters & recent debuts", icon: "movie" },
                { to: "/genres", label: "Browse Genres", desc: "Action, Sci-Fi, Drama & more", icon: "category" },
                { to: "/movies-language", label: "Browse by Language", desc: "Explore regional & international cinema", icon: "translate" },
                { to: "/box-prediction", label: "Box Office Prediction", desc: "AI box office predictions & stats", icon: "analytics", badge: "AI" },
            ]
        },
        {
            category: "Community & Social",
            icon: "diversity_3",
            links: [
                { to: "/cinematch", label: "CineMatch (Movie Night)", desc: "Swipe with friends & instant match for movie night", icon: "favorite", badge: "Live" },
                { to: "/social", label: "Community Feed", desc: "See what friends are watching & reviewing", icon: "dynamic_feed" },
                { to: "/lists", label: "Curated Lists", desc: "Create, share & bookmark custom film lists", icon: "format_list_bulleted", badge: "New" },
                { to: "/myreviews", label: "Member Reviews", desc: "Detailed ratings, reviews & critiques", icon: "rate_review" },
                { to: "/people", label: "Stars & Filmmakers", desc: "Explore actors, directors & biographies", icon: "person_celebrate" },
                { to: "/community-guidelines", label: "Community Guidelines", desc: "Standards and respectful discourse", icon: "policy" },
            ]
        },
        {
            category: "Personal Cinema",
            icon: "auto_stories",
            links: [
                { to: "/wrapped", label: "Cinephile Wrapped", desc: "Infographics, viewing stats & shareable story cards", icon: "auto_awesome", badge: "Wrapped" },
                { to: "/diary", label: "Film Diary & Logs", desc: "Your chronological viewing diary & stats", icon: "book", badge: "Diary" },
                { to: "/mywatchedfilms", label: "Watched History", desc: "Archive of every movie you have seen", icon: "visibility" },
                { to: "/favorites", label: "Your Favourites", desc: "All the films you loved the most", icon: "favorite" },
                { to: "/watchlist", label: "Your Watchlist", desc: "Queue of films to watch next", icon: "bookmark" },
                { to: "/profile", label: "Your Public Profile", desc: "Bio, stats, favorite films & badges", icon: "account_circle" },
            ]
        },
        {
            category: "Tools & Settings",
            icon: "construction",
            links: [
                { to: "/data-migration", label: "Import / Export Data", desc: "Sync with Letterboxd CSV files", icon: "sync_alt", badge: "Sync" },
                { to: "/notifications", label: "Notifications", desc: "Follows, review likes & comments", icon: "notifications" },
                { to: "/settings/profile", label: "Account Settings", desc: "Update email, password & profile info", icon: "settings" },
                { to: "/about-us", label: "About Cinephile", desc: "The story and mission behind Cinephile", icon: "info" },
            ]
        }
    ];

    return (
        <nav
            className={`sticky top-0 z-[1000] w-full border-b border-border transition-all duration-200 navbar-blur ${
                scrolled ? "shadow-elevated bg-bg/95" : "bg-bg/85"
            }`}
        >
            <div className="mx-auto flex h-14 md:h-16 w-full max-w-[1340px] items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">

                {/* 1. Left Section: Logo + "More" Dropdown Menu */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {/* Cinephile Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 no-underline group"
                        aria-label="Cinephile Home"
                    >
                        <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-accent/15 border border-accent/30 text-accent group-hover:bg-accent group-hover:text-bg transition-all duration-200 shadow-sm">
                            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                                movie
                            </span>
                        </span>
                        <span className="hidden min-[380px]:inline font-serif text-lg sm:text-2xl font-bold tracking-tight text-text group-hover:text-accent transition-colors">
                            Cinephile
                        </span>
                    </Link>

                    {/* "More" Button with Mega Dropdown */}
                    <div
                        ref={moreMenuRef}
                        className="relative hidden sm:block"
                        onMouseEnter={handleMouseEnterMore}
                        onMouseLeave={handleMouseLeaveMore}
                    >
                        <button
                            type="button"
                            onClick={() => setShowMoreMenu((prev) => !prev)}
                            aria-expanded={showMoreMenu}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                showMoreMenu
                                    ? "bg-accent/15 text-accent border border-accent/40"
                                    : "bg-surface border border-border text-text-2 hover:border-accent/40 hover:text-accent hover:bg-surface-2"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[17px]">
                                grid_view
                            </span>
                            <span>More</span>
                            <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${showMoreMenu ? "rotate-180 text-accent" : "text-text-3"}`}>
                                expand_more
                            </span>
                        </button>

                        {/* Mega Menu Dropdown */}
                        {showMoreMenu && (
                            <div className="absolute left-0 top-full mt-2 w-[720px] lg:w-[860px] rounded-2xl border border-border bg-surface/98 backdrop-blur-xl shadow-2xl z-[1200] p-5 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y-0 animate-fadeIn">
                                {moreFeatureCategories.map((col) => (
                                    <div key={col.category} className="flex flex-col">
                                        {/* Column Header */}
                                        <div className="flex items-center gap-2 pb-2.5 mb-2 border-b border-border/60">
                                            <span className="material-symbols-outlined text-[18px] text-accent">
                                                {col.icon}
                                            </span>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-text">
                                                {col.category}
                                            </h4>
                                        </div>

                                        {/* Column Links */}
                                        <div className="flex flex-col gap-1">
                                            {col.links.map((link) => (
                                                <Link
                                                    key={link.to}
                                                    to={link.to}
                                                    onClick={() => setShowMoreMenu(false)}
                                                    className="group flex flex-col rounded-lg px-2.5 py-1.5 text-left text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-text group-hover:text-accent transition-colors">
                                                            {link.label}
                                                        </span>
                                                        {link.badge && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/25">
                                                                {link.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-text-3 group-hover:text-text-2 transition-colors line-clamp-1 mt-0.5">
                                                        {link.desc}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Primary Direct Navigation Links (Desktop) */}
                    <div className="hidden xl:flex items-center gap-1 pl-1">
                        <NavLink
                            to="/movies"
                            className={({ isActive }) =>
                                `px-2.5 py-1 rounded-full text-xs font-semibold transition-colors no-underline ${
                                    isActive
                                        ? "text-accent bg-accent/15"
                                        : "text-text-2 hover:text-accent hover:bg-surface-2"
                                }`
                            }
                        >
                            Movies
                        </NavLink>
                        <NavLink
                            to="/new-releases"
                            className={({ isActive }) =>
                                `px-2.5 py-1 rounded-full text-xs font-semibold transition-colors no-underline ${
                                    isActive
                                        ? "text-accent bg-accent/15"
                                        : "text-text-2 hover:text-accent hover:bg-surface-2"
                                }`
                            }
                        >
                            In Theaters
                        </NavLink>
                        <NavLink
                            to="/streaming"
                            className={({ isActive }) =>
                                `px-2.5 py-1 rounded-full text-xs font-semibold transition-colors no-underline ${
                                    isActive
                                        ? "text-accent bg-accent/15"
                                        : "text-text-2 hover:text-accent hover:bg-surface-2"
                                }`
                            }
                        >
                            Streaming
                        </NavLink>
                        <NavLink
                            to="/genres"
                            className={({ isActive }) =>
                                `px-2.5 py-1 rounded-full text-xs font-semibold transition-colors no-underline ${
                                    isActive
                                        ? "text-accent bg-accent/15"
                                        : "text-text-2 hover:text-accent hover:bg-surface-2"
                                }`
                            }
                        >
                            Genres
                        </NavLink>
                        <NavLink
                            to="/lists"
                            className={({ isActive }) =>
                                `px-2.5 py-1 rounded-full text-xs font-semibold transition-colors no-underline ${
                                    isActive
                                        ? "text-accent bg-accent/15"
                                        : "text-text-2 hover:text-accent hover:bg-surface-2"
                                }`
                            }
                        >
                            Lists
                        </NavLink>
                        <NavLink
                            to="/social"
                            className={({ isActive }) =>
                                `px-2.5 py-1 rounded-full text-xs font-semibold transition-colors no-underline ${
                                    isActive
                                        ? "text-accent bg-accent/15"
                                        : "text-text-2 hover:text-accent hover:bg-surface-2"
                                }`
                            }
                        >
                            Community
                        </NavLink>
                    </div>
                </div>

                {/* 2. Global Search Bar */}
                <div ref={searchRef} className="relative flex-1 max-w-[540px] lg:max-w-[620px] mx-1 sm:mx-3">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="relative flex items-center w-full rounded-full border border-border bg-surface px-3.5 py-1.5 md:py-2 text-text transition-all duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 focus-within:bg-surface-2 shadow-inner"
                    >
                        <span className="material-symbols-outlined text-[19px] sm:text-[21px] text-accent shrink-0 mr-2">
                            search
                        </span>

                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (totalResultsCount > 0) setShowSuggestions(true);
                            }}
                            placeholder="Search films, cast, crew, genres..."
                            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-text placeholder:text-text-3 focus:outline-none"
                            aria-label="Search Cinephile"
                        />

                        {isSearching ? (
                            <span className="material-symbols-outlined text-[17px] text-accent animate-spin shrink-0 mx-1">
                                progress_activity
                            </span>
                        ) : searchQuery ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSuggestions({ movies: [], people: [] });
                                }}
                                className="text-text-3 hover:text-text shrink-0 mx-1 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[17px]">close</span>
                            </button>
                        ) : null}

                        <span className="hidden md:inline-flex items-center rounded border border-border/80 bg-surface-2/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-text-3 shrink-0 ml-1">
                            ⌘K
                        </span>
                    </form>

                    {/* Search Live Suggestions */}
                    {showSuggestions && searchQuery.trim() && (
                        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-border bg-surface/98 backdrop-blur-xl shadow-2xl z-[1200] max-h-[72vh] overflow-y-auto divide-y divide-border/50 animate-fadeIn">
                            {totalResultsCount === 0 && !isSearching ? (
                                <div className="p-4 text-center text-xs text-text-3">
                                    No results found for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                                </div>
                            ) : (
                                <>
                                    {suggestions.movies.length > 0 && (
                                        <div className="py-2">
                                            <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                                                Films
                                            </div>
                                            {suggestions.movies.map((movie) => {
                                                const poster = getPosterUrl(movie.poster_path);
                                                const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
                                                return (
                                                    <div
                                                        key={movie.id}
                                                        onClick={() => {
                                                            navigate(`/movies/${movie.id}`);
                                                            setShowSuggestions(false);
                                                            setSearchQuery("");
                                                        }}
                                                        className="flex items-center gap-3 px-4 py-2 hover:bg-surface-2 cursor-pointer transition-colors"
                                                    >
                                                        <div className="h-12 w-8 shrink-0 rounded bg-surface-2 overflow-hidden border border-border">
                                                            {poster ? (
                                                                <img src={poster} alt={movie.title} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-text-3">
                                                                    <span className="material-symbols-outlined text-sm">movie</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs sm:text-sm font-semibold text-text truncate">{movie.title}</p>
                                                            <div className="flex items-center gap-2 text-[11px] text-text-3 mt-0.5">
                                                                {year && <span>{year}</span>}
                                                                {movie.vote_average > 0 && (
                                                                    <span className="flex items-center gap-0.5 text-accent font-medium">
                                                                        <span className="material-symbols-outlined text-[13px] fill-current">star</span>
                                                                        {movie.vote_average.toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {suggestions.people.length > 0 && (
                                        <div className="py-2">
                                            <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                                                Cast & Filmmakers
                                            </div>
                                            {suggestions.people.map((person) => {
                                                const photo = person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : null;
                                                const known = person.known_for?.map(k => k.title || k.name).filter(Boolean).slice(0, 2).join(", ");
                                                return (
                                                    <div
                                                        key={person.id}
                                                        onClick={() => {
                                                            navigate(`/person/${person.id}`);
                                                            setShowSuggestions(false);
                                                            setSearchQuery("");
                                                        }}
                                                        className="flex items-center gap-3 px-4 py-2 hover:bg-surface-2 cursor-pointer transition-colors"
                                                    >
                                                        <div className="h-9 w-9 shrink-0 rounded-full bg-surface-2 overflow-hidden border border-border">
                                                            {photo ? (
                                                                <img src={photo} alt={person.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-text-3">
                                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs sm:text-sm font-semibold text-text truncate">{person.name}</p>
                                                            <p className="text-[11px] text-text-3 truncate mt-0.5">{known || person.known_for_department || "Actor"}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div
                                        onClick={handleSearchSubmit}
                                        className="px-4 py-2.5 text-center text-xs font-semibold text-accent hover:bg-accent/10 cursor-pointer transition-colors"
                                    >
                                        See all results for &ldquo;{searchQuery}&rdquo; →
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. Action Group: Favourites/Watchlist + Notification Bell + Profile + Theme */}
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0">

                    {/* Favorites & Watchlist links */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink
                            to="/what-to-watch"
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all no-underline ${
                                    isActive
                                        ? "bg-accent text-white shadow-sm shadow-accent/20"
                                        : "bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20"
                                }`
                            }
                            title="What Should I Watch Tonight? (Decision AI)"
                        >
                            <span className="material-symbols-outlined text-[17px]">
                                psychology
                            </span>
                            <span className="hidden xl:inline">What to Watch</span>
                        </NavLink>

                        <NavLink
                            to="/favorites"
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors no-underline ${
                                    isActive
                                        ? "bg-accent/15 text-accent"
                                        : "text-text-2 hover:bg-surface-2 hover:text-accent"
                                }`
                            }
                            title="Your Favourites"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                favorite
                            </span>
                            <span className="hidden lg:inline">Favourites</span>
                        </NavLink>

                        <NavLink
                            to="/watchlist"
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors no-underline ${
                                    isActive
                                        ? "bg-accent/15 text-accent"
                                        : "text-text-2 hover:bg-surface-2 hover:text-accent"
                                }`
                            }
                            title="Your Watchlist"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                bookmark
                            </span>
                            <span className="hidden lg:inline">Watchlist</span>
                        </NavLink>
                    </div>

                    {/* Subtle separator */}
                    <div className="hidden md:block h-4 w-[1px] bg-border mx-0.5" />

                    {/* Notification Bell with interactive popover */}
                    {token && (
                        <div ref={notificationsRef} className="relative">
                            <button
                                type="button"
                                onClick={handleToggleNotifications}
                                aria-label="Notifications"
                                aria-expanded={showNotificationsMenu}
                                className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer ${
                                    showNotificationsMenu || location.pathname === "/notifications"
                                        ? "bg-accent/15 text-accent border-accent/40 shadow-sm"
                                        : "bg-surface border-border text-text-2 hover:border-accent/40 hover:text-accent hover:bg-surface-2"
                                }`}
                                title="Notifications"
                            >
                                <span className="material-symbols-outlined text-[19px] sm:text-[20px]">
                                    notifications
                                </span>

                                {/* Unread Counter Badge */}
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-md animate-pulse">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Popover Dropdown */}
                            {showNotificationsMenu && (
                                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-surface/98 backdrop-blur-xl shadow-2xl z-[1200] overflow-hidden animate-fadeIn">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-surface-2/50">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-accent">
                                                notifications
                                            </span>
                                            <span className="text-xs font-bold text-text uppercase tracking-wider">
                                                Notifications
                                            </span>
                                            {unreadCount > 0 && (
                                                <span className="px-1.5 py-0.2 rounded-full bg-accent/15 text-accent text-[10px] font-bold border border-accent/30 font-mono">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>

                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleMarkAllRead}
                                                className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    {/* Notifications List */}
                                    <div className="max-h-[340px] overflow-y-auto divide-y divide-border/40">
                                        {loadingNotifications ? (
                                            <div className="p-6 text-center text-xs text-text-3 space-y-2">
                                                <div className="h-8 w-full bg-surface-2 rounded-lg animate-pulse" />
                                                <div className="h-8 w-full bg-surface-2 rounded-lg animate-pulse" />
                                            </div>
                                        ) : quickNotifications.length === 0 ? (
                                            <div className="p-8 text-center text-xs text-text-3">
                                                <span className="material-symbols-outlined text-3xl opacity-40 mb-1 block">
                                                    notifications_none
                                                </span>
                                                You&apos;re all caught up! No notifications.
                                            </div>
                                        ) : (
                                            quickNotifications.map((item) => {
                                                const { icon, color } = getNotificationIcon(item.type);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleNotificationClick(item)}
                                                        className={`flex items-start gap-3 p-3 hover:bg-surface-2 cursor-pointer transition-colors ${
                                                            !item.isRead ? "bg-accent/5" : ""
                                                        }`}
                                                    >
                                                        {/* Icon / Actor Avatar */}
                                                        <div className="relative shrink-0 mt-0.5">
                                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center border border-border text-xs font-bold overflow-hidden bg-surface-2`}>
                                                                {item.actorAvatar ? (
                                                                    <img src={item.actorAvatar} alt={item.actorName} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <span>{item.actorName?.charAt(0)?.toUpperCase() || "C"}</span>
                                                                )}
                                                            </div>
                                                            <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[10px] border border-surface shadow-xs ${color}`}>
                                                                <span className="material-symbols-outlined text-[10px]">
                                                                    {icon}
                                                                </span>
                                                            </span>
                                                        </div>

                                                        {/* Text content */}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-text leading-snug break-words">
                                                                {item.message}
                                                            </p>
                                                            <span className="text-[10px] text-text-3 font-mono mt-1 block">
                                                                {formatRelativeTime(item.createdAt)}
                                                            </span>
                                                        </div>

                                                        {/* Unread indicator */}
                                                        {!item.isRead && (
                                                            <span className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Footer Link */}
                                    <div className="p-2.5 border-t border-border/70 bg-surface-2/40 text-center">
                                        <Link
                                            to="/notifications"
                                            onClick={() => setShowNotificationsMenu(false)}
                                            className="text-xs font-semibold text-accent hover:underline no-underline block py-1"
                                        >
                                            View all activity feed →
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Section */}
                    {token ? (
                        <div
                            ref={profileMenuRef}
                            className="relative"
                            onMouseEnter={handleMouseEnterProfile}
                            onMouseLeave={handleMouseLeaveProfile}
                        >
                            <button
                                type="button"
                                onClick={() => setShowProfileMenu((prev) => !prev)}
                                aria-label="Profile and account menu"
                                aria-expanded={showProfileMenu}
                                className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-surface px-2 sm:px-2.5 py-1 text-text-2 transition-all duration-200 hover:border-accent hover:text-accent focus:outline-none cursor-pointer"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
                                    <span className="material-symbols-outlined text-[18px]">
                                        person
                                    </span>
                                </span>
                                {user?.firstname && (
                                    <span className="hidden sm:inline max-w-[80px] truncate text-xs font-semibold text-text">
                                        {user.firstname}
                                    </span>
                                )}
                                <span
                                    className={`material-symbols-outlined text-[16px] text-text-3 transition-transform duration-200 ${
                                        showProfileMenu ? "rotate-180 text-accent" : ""
                                    }`}
                                >
                                    expand_more
                                </span>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-surface/98 backdrop-blur-xl shadow-2xl z-[1200] py-2 divide-y divide-border/50 animate-fadeIn">
                                    <div className="px-4 py-2.5">
                                        <p className="text-xs font-bold text-text truncate">
                                            {user?.firstname
                                                ? `${user.firstname} ${user.lastname || ""}`.trim()
                                                : "Film Buff"}
                                        </p>
                                        <p className="text-[11px] text-text-3 truncate mt-0.5">
                                            {user?.emailaddress || "Cinephile Member"}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            to="/wrapped"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-accent hover:bg-surface-2 transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                            <span>Cinephile Wrapped</span>
                                        </Link>
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">account_circle</span>
                                            <span>My Profile</span>
                                        </Link>
                                        <Link
                                            to="/diary"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                                            <span>Film Diary</span>
                                        </Link>
                                        <Link
                                            to="/lists"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                                            <span>My Lists</span>
                                        </Link>
                                        <Link
                                            to="/mywatchedfilms"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            <span>Watched Films</span>
                                        </Link>
                                        <Link
                                            to="/notifications"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">notifications</span>
                                            <div className="flex items-center justify-between flex-1">
                                                <span>Notifications</span>
                                                {unreadCount > 0 && (
                                                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                        <Link
                                            to="/data-migration"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-accent font-semibold hover:bg-surface-2 transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                                            <span>Import / Export Data</span>
                                        </Link>
                                        <Link
                                            to="/settings/profile"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">settings</span>
                                            <span>Account Settings</span>
                                        </Link>
                                    </div>

                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-xs font-semibold text-[#C4646F] hover:bg-[#C4646F]/10 hover:text-[#e07b86] transition-colors cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="text-xs sm:text-sm font-semibold text-text-2 hover:text-accent no-underline px-2.5 py-1.5 transition-colors"
                        >
                            Login
                        </Link>
                    )}

                    {/* Theme Toggle Button */}
                    <ThemeToggle />

                    {/* Mobile Hamburger Drawer Button */}
                    <button
                        type="button"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        onClick={() => setMenuOpen((o) => !o)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text sm:hidden cursor-pointer relative"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {menuOpen ? "close" : "menu"}
                        </span>
                        {unreadCount > 0 && !menuOpen && (
                            <span className="absolute 1 top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {menuOpen && (
                <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-border bg-bg/98 backdrop-blur-xl px-4 py-4 sm:hidden space-y-4">
                    {/* Quick Notifications Mobile Row if logged in */}
                    {token && (
                        <Link
                            to="/notifications"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-accent/30 text-accent font-semibold text-xs no-underline"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-[20px]">notifications</span>
                                <span>Notifications Feed</span>
                            </div>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                    {unreadCount} unread
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Feature Categories for Mobile */}
                    {moreFeatureCategories.map((sec) => (
                        <div key={sec.category} className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-accent px-2">
                                {sec.category}
                            </p>
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5">
                                {sec.links.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 min-h-[44px] text-xs font-medium text-text-2 bg-surface border border-border/60 hover:text-accent hover:border-accent/30 active:scale-[0.98] transition-all no-underline"
                                    >
                                        <span className="material-symbols-outlined text-[18px] text-accent shrink-0">
                                            {link.icon}
                                        </span>
                                        <span className="truncate">{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="border-t border-border pt-3">
                        {token ? (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-[#C4646F] bg-surface border border-border cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                <span>Sign Out</span>
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="w-full flex items-center justify-center rounded-lg px-3.5 py-2 text-xs font-bold text-bg bg-accent no-underline"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
