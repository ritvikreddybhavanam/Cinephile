import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";
import { searchMovies, getPosterUrl } from "../../services/movieService.js";

function Navbar() {
    const { token, user, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const profileMenuRef = useRef(null);
    const profileTimerRef = useRef(null);

    const handleMouseEnterProfile = () => {
        if (profileTimerRef.current) {
            clearTimeout(profileTimerRef.current);
        }
        setShowProfileMenu(true);
    };

    const handleMouseLeaveProfile = () => {
        profileTimerRef.current = setTimeout(() => {
            setShowProfileMenu(false);
        }, 200);
    };

    /* Detect scroll for shadow */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Cleanup profile timer on unmount */
    useEffect(() => {
        return () => {
            if (profileTimerRef.current) {
                clearTimeout(profileTimerRef.current);
            }
        };
    }, []);

    /* Fetch suggestions with debouncing */
    useEffect(() => {
        const query = search.trim();
        if (!query) {
            setSuggestions([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const results = await searchMovies(query);
                if (results?.results) {
                    setSuggestions(results.results.slice(0, 6));
                    setShowDropdown(true);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Failed to fetch search suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [search]);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handleClickOutside = (event) => {
            const inDesktop = desktopSearchRef.current?.contains(event.target);
            const inMobile = mobileSearchRef.current?.contains(event.target);
            if (!inDesktop && !inMobile) {
                setShowDropdown(false);
            }
            if (!profileMenuRef.current?.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* Reset state on navigation */
    useEffect(() => {
        setMenuOpen(false);
        setShowDropdown(false);
        setShowProfileMenu(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    const navLinkClass = ({ isActive }) =>
        `relative inline-flex items-center text-sm font-medium no-underline transition-colors duration-200 py-1 ${
            isActive
                ? "text-accent after:absolute after:left-0 after:right-0 after:-bottom-[18px] md:after:-bottom-[20px] after:h-[2px] after:bg-accent after:rounded-full"
                : "text-text-2 hover:text-text"
        }`;

    const mobileLinkClass = ({ isActive }) =>
        `block rounded-lg px-3.5 py-2.5 text-sm font-medium no-underline transition-colors ${
            isActive
                ? "bg-accent/10 text-accent font-semibold"
                : "text-text-2 hover:bg-surface-2 hover:text-text"
        }`;

    const handleLogout = () => {
        setMenuOpen(false);
        setShowProfileMenu(false);
        logout();
        navigate("/");
    };

    const handleSelectMovie = (movieId) => {
        navigate(`/movies/${movieId}`);
        setSearch("");
        setSuggestions([]);
        setShowDropdown(false);
        setMenuOpen(false);
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            const trimmed = search.trim();
            if (!trimmed) return;

            if (suggestions.length > 0) {
                handleSelectMovie(suggestions[0].id);
            } else {
                try {
                    const results = await searchMovies(trimmed);
                    if (results?.results?.length > 0) {
                        handleSelectMovie(results.results[0].id);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                }
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false);
        }
    };

    const clearSearch = () => {
        setSearch("");
        setSuggestions([]);
        setShowDropdown(false);
    };

    const navItems = [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/movies", label: "Films" },
        { to: "/new-releases", label: "New Releases" },
        { to: "/genres", label: "Genres" },
        { to: "/trending", label: "Trending" },
        { to: "/box-prediction", label: "Box Office" },
        { to: "/more", label: "More" },
        { to: "/favorites", label: "Favourites" },
        { to: "/watchlist", label: "Watchlist" },
    ];

    return (
        <nav
            className={`sticky top-0 z-[1000] w-full border-b border-border transition-shadow duration-200 navbar-blur ${
                scrolled ? "shadow-elevated" : ""
            }`}
        >
            <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:h-16">

                {/* Left section: Wordmark + Desktop Nav */}
                <div className="flex items-center gap-6 xl:gap-8">
                    {/* Wordmark */}
                    <Link
                        to="/"
                        className="shrink-0 font-serif text-xl font-semibold tracking-tight text-accent no-underline sm:text-2xl hover:opacity-95 transition-opacity"
                        aria-label="Cinephile home"
                    >
                        Cinephile
                    </Link>

                    {/* Desktop Main Nav */}
                    <div className="hidden items-center gap-5 lg:flex xl:gap-6 2xl:gap-7">
                        <NavLink to="/dashboard"     className={navLinkClass}>Dashboard</NavLink>
                        <NavLink to="/movies"        className={navLinkClass}>Films</NavLink>
                        <NavLink to="/genres"        className={navLinkClass}>Genres</NavLink>
                        <NavLink to="/trending"      className={navLinkClass}>Trending</NavLink>
                        <NavLink to="/box-prediction" className={navLinkClass}>Box Office</NavLink>
                        <NavLink to="/more"          className={navLinkClass}>More</NavLink>
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">

                    {/* Search (Desktop) */}
                    <div ref={desktopSearchRef} className="relative hidden xl:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-3 pointer-events-none">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            placeholder="Search films…"
                            aria-label="Search films"
                            className="h-9 w-[150px] 2xl:w-[180px] rounded-full border border-border bg-surface pl-9 pr-8 text-sm text-text outline-none transition-all duration-200 placeholder:text-text-3 focus:w-[220px] focus:border-accent focus:ring-2 focus:ring-accent/20"
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => { if (search.trim()) setShowDropdown(true); }}
                            onKeyDown={handleKeyDown}
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 hover:text-text cursor-pointer flex items-center justify-center p-0.5"
                                aria-label="Clear search"
                            >
                                <span className="material-symbols-outlined text-[15px]">close</span>
                            </button>
                        )}

                        {/* Desktop Suggestions Dropdown */}
                        {showDropdown && search.trim() && (
                            <div className="absolute right-0 top-full mt-2 w-[320px] max-h-[380px] overflow-y-auto rounded-xl border border-border bg-surface/95 backdrop-blur-md shadow-2xl z-[1100] py-1.5 divide-y divide-border/40">
                                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-text-3 uppercase flex items-center justify-between">
                                    <span>Suggestions</span>
                                    {isSearching && (
                                        <span className="material-symbols-outlined text-[13px] text-accent animate-spin">
                                            progress_activity
                                        </span>
                                    )}
                                </div>

                                {isSearching && suggestions.length === 0 ? (
                                    <div className="flex items-center justify-center gap-2 py-5 text-xs text-text-3">
                                        <span className="material-symbols-outlined text-[16px] text-accent animate-spin">
                                            progress_activity
                                        </span>
                                        <span>Searching films…</span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="py-1">
                                        {suggestions.map((movie) => {
                                            const year =
                                                movie.release_date?.substring(0, 4) ||
                                                movie.first_air_date?.substring(0, 4);
                                            const poster = getPosterUrl(movie.poster_path);

                                            return (
                                                <button
                                                    key={movie.id}
                                                    type="button"
                                                    onClick={() => handleSelectMovie(movie.id)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface-2 transition-colors group cursor-pointer"
                                                >
                                                    <div className="w-8 h-11 rounded bg-surface-2 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                                        {poster ? (
                                                            <img
                                                                src={poster}
                                                                alt={movie.title || movie.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-text-3 text-[16px]">
                                                                movie
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                                                            {movie.title || movie.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[11px] text-text-3 mt-0.5">
                                                            {year && <span>{year}</span>}
                                                            {movie.vote_average > 0 && (
                                                                <span className="flex items-center gap-0.5 text-accent font-medium">
                                                                    <span className="material-symbols-outlined text-[12px]">
                                                                        star
                                                                    </span>
                                                                    {Number(movie.vote_average).toFixed(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="px-3 py-4 text-center text-xs text-text-3">
                                        No films found for "{search.trim()}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Favourites + Watchlist (desktop) */}
                    <div className="hidden items-center gap-3.5 xl:gap-5 lg:flex">
                        <NavLink to="/favorites" className={navLinkClass}>Favourites</NavLink>
                        <NavLink to="/watchlist" className={navLinkClass}>Watchlist</NavLink>
                    </div>

                    {/* Subtle vertical separator on desktop */}
                    <div className="hidden h-4 w-[1px] bg-border lg:block mx-0.5" />

                    {/* Profile Menu (Desktop) */}
                    {token ? (
                        <div
                            ref={profileMenuRef}
                            className="relative hidden lg:block"
                            onMouseEnter={handleMouseEnterProfile}
                            onMouseLeave={handleMouseLeaveProfile}
                        >
                            <button
                                type="button"
                                onClick={() => setShowProfileMenu((prev) => !prev)}
                                title="Profile & Account"
                                aria-label="Profile and account menu"
                                aria-expanded={showProfileMenu}
                                className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-text-2 transition-all duration-200 hover:border-accent hover:text-accent focus:outline-none cursor-pointer"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
                                    <span className="material-symbols-outlined text-[18px]">
                                        person
                                    </span>
                                </span>
                                {user?.firstname && (
                                    <span className="max-w-[90px] truncate text-xs font-medium text-text">
                                        {user.firstname}
                                    </span>
                                )}
                                <span
                                    className={`material-symbols-outlined text-[16px] text-text-3 transition-transform duration-200 ${
                                        showProfileMenu ? "rotate-180" : ""
                                    }`}
                                >
                                    expand_more
                                </span>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface/95 backdrop-blur-md shadow-2xl z-[1100] py-2 divide-y divide-border/40">
                                    {/* User Info Header */}
                                    <div className="px-4 py-2.5">
                                        <p className="text-xs font-semibold text-text truncate">
                                            {user?.firstname
                                                ? `${user.firstname} ${user.lastname || ""}`.trim()
                                                : "Film Buff"}
                                        </p>
                                        <p className="text-[11px] text-text-3 truncate mt-0.5">
                                            {user?.emailaddress || "Cinephile Member"}
                                        </p>
                                    </div>

                                    {/* Features Links */}
                                    <div className="py-1">
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                dashboard
                                            </span>
                                            <span>Dashboard</span>
                                        </Link>
                                        <Link
                                            to="/favorites"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                favorite
                                            </span>
                                            <span>Favourites</span>
                                        </Link>
                                        <Link
                                            to="/watchlist"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                bookmark
                                            </span>
                                            <span>Watchlist</span>
                                        </Link>
                                        <Link
                                            to="/mywatchedfilms"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                visibility
                                            </span>
                                            <span>Watched Films</span>
                                        </Link>
                                        <Link
                                            to="/myreviews"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                rate_review
                                            </span>
                                            <span>My Reviews</span>
                                        </Link>
                                        <Link
                                            to="/box-prediction"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                trending_up
                                            </span>
                                            <span>Box Office</span>
                                        </Link>
                                        <Link
                                            to="/people"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                group
                                            </span>
                                            <span>People</span>
                                        </Link>
                                        <Link
                                            to="/more"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors no-underline"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                tune
                                            </span>
                                            <span>More Features</span>
                                        </Link>

                                        {/* Theme toggle row inside profile dropdown */}
                                        <button
                                            type="button"
                                            onClick={toggleTheme}
                                            className="w-full flex items-center justify-between px-4 py-2 text-left text-xs text-text-2 hover:bg-surface-2 hover:text-accent transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {isDark ? "light_mode" : "dark_mode"}
                                                </span>
                                                <span>Theme</span>
                                            </div>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-2 text-accent border border-border">
                                                {isDark ? "Dark" : "Light"}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Logout option at the very last */}
                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-xs font-medium text-[#C4646F] hover:bg-[#C4646F]/10 hover:text-[#e07b86] transition-colors cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                logout
                                            </span>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="hidden text-sm font-medium text-text-2 no-underline transition-colors duration-200 hover:text-accent lg:inline px-2 py-1"
                        >
                            Login
                        </Link>
                    )}

                    {/* Theme Toggle Button (Desktop & Mobile) */}
                    <ThemeToggle />

                    {/* Mobile hamburger */}
                    <button
                        type="button"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((o) => !o)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text lg:hidden ml-0.5"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {menuOpen ? "close" : "menu"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            {menuOpen && (
                <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-border bg-bg/95 backdrop-blur-md px-4 py-4 sm:px-6 lg:hidden space-y-3">
                    {/* Mobile search */}
                    <div ref={mobileSearchRef} className="relative mb-3">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-3 pointer-events-none">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            placeholder="Search films…"
                            aria-label="Search films"
                            className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-8 text-sm text-text outline-none placeholder:text-text-3 focus:border-accent focus:ring-2 focus:ring-accent/20"
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => { if (search.trim()) setShowDropdown(true); }}
                            onKeyDown={handleKeyDown}
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text cursor-pointer flex items-center justify-center p-0.5"
                                aria-label="Clear search"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        )}

                        {/* Mobile Suggestions Dropdown */}
                        {showDropdown && search.trim() && (
                            <div className="mt-2 w-full max-h-[280px] overflow-y-auto rounded-xl border border-border bg-surface shadow-lg py-1.5 divide-y divide-border/40">
                                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-text-3 uppercase flex items-center justify-between">
                                    <span>Suggestions</span>
                                    {isSearching && (
                                        <span className="material-symbols-outlined text-[13px] text-accent animate-spin">
                                            progress_activity
                                        </span>
                                    )}
                                </div>

                                {isSearching && suggestions.length === 0 ? (
                                    <div className="flex items-center justify-center gap-2 py-4 text-xs text-text-3">
                                        <span className="material-symbols-outlined text-[16px] text-accent animate-spin">
                                            progress_activity
                                        </span>
                                        <span>Searching films…</span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="py-1">
                                        {suggestions.map((movie) => {
                                            const year =
                                                movie.release_date?.substring(0, 4) ||
                                                movie.first_air_date?.substring(0, 4);
                                            const poster = getPosterUrl(movie.poster_path);

                                            return (
                                                <button
                                                    key={movie.id}
                                                    type="button"
                                                    onClick={() => handleSelectMovie(movie.id)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface-2 transition-colors group cursor-pointer"
                                                >
                                                    <div className="w-8 h-11 rounded bg-surface-2 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                                        {poster ? (
                                                            <img
                                                                src={poster}
                                                                alt={movie.title || movie.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-text-3 text-[16px]">
                                                                movie
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                                                            {movie.title || movie.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[11px] text-text-3 mt-0.5">
                                                            {year && <span>{year}</span>}
                                                            {movie.vote_average > 0 && (
                                                                <span className="flex items-center gap-0.5 text-accent font-medium">
                                                                    <span className="material-symbols-outlined text-[12px]">
                                                                        star
                                                                    </span>
                                                                    {Number(movie.vote_average).toFixed(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="px-3 py-3 text-center text-xs text-text-3">
                                        No films found for "{search.trim()}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={mobileLinkClass}
                                onClick={() => setMenuOpen(false)}
                            >
                                {item.label}
                            </NavLink>
                        ))}

                        <div className="my-2 border-t border-border" />

                        {/* Mobile Theme Toggle Button Item */}
                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border/60 mb-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-text">
                                <span className="material-symbols-outlined text-[18px] text-accent">
                                    {isDark ? "light_mode" : "dark_mode"}
                                </span>
                                <span>Appearance</span>
                            </div>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface text-xs font-semibold text-accent border border-border shadow-xs hover:border-accent transition-colors cursor-pointer"
                            >
                                <span>{isDark ? "Switch to Light" : "Switch to Dark"}</span>
                            </button>
                        </div>

                        {token ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-surface border border-border/60 mb-1">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
                                        <span className="material-symbols-outlined text-[18px]">
                                            person
                                        </span>
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-text truncate">
                                            {user?.firstname ? `${user.firstname} ${user.lastname || ""}`.trim() : "Film Buff"}
                                        </p>
                                        <p className="text-[11px] text-text-3 truncate">
                                            {user?.emailaddress || "Cinephile Member"}
                                        </p>
                                    </div>
                                </div>

                                <NavLink
                                    to="/mywatchedfilms"
                                    className={mobileLinkClass}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Watched Films
                                </NavLink>
                                <NavLink
                                    to="/myreviews"
                                    className={mobileLinkClass}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    My Reviews
                                </NavLink>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    aria-label="Logout"
                                    className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-sm text-[#C4646F] hover:bg-[#C4646F]/10 hover:text-[#e07b86] cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        logout
                                    </span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-text-2 no-underline hover:bg-surface-2 hover:text-accent"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
