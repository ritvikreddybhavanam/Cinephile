import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";
import { searchMovies, getPosterUrl } from "../../services/movieService.js";
import { searchPeople } from "../../services/personService.js";

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
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Refs
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);
    const moreMenuRef = useRef(null);
    const moreTimerRef = useRef(null);
    const profileMenuRef = useRef(null);
    const profileTimerRef = useRef(null);

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

    // Reset state on navigation
    useEffect(() => {
        setMenuOpen(false);
        setShowSuggestions(false);
        setShowMoreMenu(false);
        setShowProfileMenu(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

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

                {/* 1. Left Section: Logo + 2. "More" Dropdown Menu */}
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
                        <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-text group-hover:text-accent transition-colors">
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
                </div>

                {/* 2. Huge Global Search matching Theme */}
                <div ref={searchRef} className="relative flex-1 max-w-[540px] lg:max-w-[620px] mx-1 sm:mx-3">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="relative flex items-center w-full rounded-full border border-border bg-surface px-3.5 py-1.5 md:py-2 text-text transition-all duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 focus-within:bg-surface-2 shadow-inner"
                    >
                        {/* Magnifying Icon */}
                        <span className="material-symbols-outlined text-[19px] sm:text-[21px] text-accent shrink-0 mr-2">
                            search
                        </span>

                        {/* Search Input */}
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

                        {/* Loading / Clear icon */}
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

                        {/* Shortcut badge */}
                        <span className="hidden md:inline-flex items-center rounded border border-border/80 bg-surface-2/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-text-3 shrink-0 ml-1">
                            ⌘K
                        </span>
                    </form>

                    {/* Huge Search Live Suggestions Dropdown */}
                    {showSuggestions && searchQuery.trim() && (
                        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-border bg-surface/98 backdrop-blur-xl shadow-2xl z-[1200] max-h-[72vh] overflow-y-auto divide-y divide-border/50 animate-fadeIn">
                            {totalResultsCount === 0 && !isSearching ? (
                                <div className="p-4 text-center text-xs text-text-3">
                                    No results found for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                                </div>
                            ) : (
                                <>
                                    {/* Films results */}
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

                                    {/* People results */}
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

                {/* 3. Favorites & Watchlist + 4. Profile + 5. Theme Change */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">

                    {/* 3. Favorites / Watchlist */}
                    <div className="hidden md:flex items-center gap-1">
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

                    {/* 4. Profile Section */}
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

                    {/* 5. Theme Change Toggle */}
                    <ThemeToggle />

                    {/* Mobile Hamburger Drawer Button */}
                    <button
                        type="button"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        onClick={() => setMenuOpen((o) => !o)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text sm:hidden cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {menuOpen ? "close" : "menu"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {menuOpen && (
                <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-border bg-bg/98 backdrop-blur-xl px-4 py-4 sm:hidden space-y-4">
                    {/* Feature Categories for Mobile */}
                    {moreFeatureCategories.map((sec) => (
                        <div key={sec.category} className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-accent px-2">
                                {sec.category}
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {sec.links.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-text-2 bg-surface border border-border/60 hover:text-accent no-underline"
                                    >
                                        <span className="material-symbols-outlined text-[16px] text-accent">
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
