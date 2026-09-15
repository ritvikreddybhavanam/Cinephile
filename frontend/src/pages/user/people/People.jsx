import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "/src/components/layout/Navbar.jsx";
import Footer from "/src/components/layout/Footer.jsx";

import {
    getPopularPeople,
    searchPeople
} from "/src/services/personService.js";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";


function People() {
    const navigate = useNavigate();
    const searchInputRef = useRef(null);

    const [people, setPeople] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const loadPopularPeople = async (pageNumber = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getPopularPeople(pageNumber);

            const results = data.results || [];

            setPeople((previousPeople) =>
                append
                    ? [...previousPeople, ...results]
                    : results
            );

            setTotalResults(data.total_results || 0);
            setPage(pageNumber);
        } catch (error) {
            console.error("Error loading people:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load people."
            );
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSearch = async (query) => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            setPage(1);
            loadPopularPeople(1, false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const data = await searchPeople(trimmedQuery, 1);

            setPeople(data.results || []);
            setTotalResults(data.total_results || 0);
            setPage(1);
        } catch (error) {
            console.error("Error searching people:", error);

            setError(
                error.response?.data?.message ||
                "Failed to search people."
            );

            setPeople([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPopularPeople(1, false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchQuery);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleKeyboard = (event) => {
            if (
                event.key === "/" &&
                document.activeElement !== searchInputRef.current
            ) {
                event.preventDefault();
                searchInputRef.current?.focus();
            }

            if (
                event.key === "Escape" &&
                document.activeElement === searchInputRef.current
            ) {
                searchInputRef.current.blur();
            }
        };

        window.addEventListener("keydown", handleKeyboard);

        return () => {
            window.removeEventListener("keydown", handleKeyboard);
        };
    }, []);

    const getPersonDepartment = (person) => {
        if (person.known_for_department) {
            return person.known_for_department;
        }

        if (person.department) {
            return person.department;
        }

        return "Unknown";
    };

    const matchesFilter = (person) => {
        if (activeFilter === "all") {
            return true;
        }

        const department = getPersonDepartment(person).toLowerCase();

        if (activeFilter === "director") {
            return department.includes("direct");
        }

        if (activeFilter === "actor") {
            return (
                department.includes("acting") ||
                department.includes("actor")
            );
        }

        if (activeFilter === "cinematographer") {
            return department.includes("camera");
        }

        if (activeFilter === "writer") {
            return department.includes("writing");
        }

        return true;
    };

    const filteredPeople = people.filter(matchesFilter);

    const handleLoadMore = async () => {
        if (loadingMore) {
            return;
        }

        if (page >= 500) {
            return;
        }

        const nextPage = page + 1;

        if (searchQuery.trim()) {
            try {
                setLoadingMore(true);

                const data = await searchPeople(
                    searchQuery.trim(),
                    nextPage
                );

                setPeople((previousPeople) => [
                    ...previousPeople,
                    ...(data.results || [])
                ]);

                setTotalResults(data.total_results || 0);
                setPage(nextPage);
            } catch (error) {
                console.error("Error loading more search results:", error);
            } finally {
                setLoadingMore(false);
            }

            return;
        }

        await loadPopularPeople(nextPage, true);
    };

    const handleReset = () => {
        setSearchQuery("");
        setActiveFilter("all");
    };

    const getImageUrl = (profilePath) => {
        if (!profilePath) {
            return null;
        }

        return `${TMDB_IMAGE_URL}${profilePath}`;
    };

    const getPersonRole = (person) => {
        const department = getPersonDepartment(person);

        if (department === "Acting") {
            return "Actor";
        }

        if (department === "Directing") {
            return "Director";
        }

        if (department === "Writing") {
            return "Writer";
        }

        if (department === "Camera") {
            return "Cinematography";
        }

        return department;
    };

    const handlePersonClick = (personId) => {
        navigate(`/person/${personId}`);
    };

    return (
        <>
            <Navbar />

            <main className="w-full pt-16 bg-[#101418] min-h-screen text-white">
                <section className="max-w-7xl mx-auto px-4 md:px-10 w-full pt-8 md:pt-14 pb-16">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">

                        <div className="space-y-2">

                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                                People
                            </h1>

                            <p className="text-base md:text-lg text-[#99AABB] max-w-xl">
                                Explore the auteurs, visionaries, and performers shaping global cinema.
                            </p>

                        </div>

                    </div>

                    {/* Search + Filters */}
                    <div className="flex flex-col gap-5 mb-10">

                        <div className="relative w-full group">

                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#99AABB] group-focus-within:text-[#43fe6d]">
                                <span className="material-symbols-outlined text-[24px]">
                                    search
                                </span>
                            </div>

                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search people"
                                className="w-full bg-[#181c20] text-white pl-14 pr-20 py-4 rounded-xl placeholder:text-[#99AABB]/60 focus:outline-none focus:bg-[#1c2024] transition-all"
                            />

                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-8 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 p-5 text-[#ffb4ab]">
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">

                            {Array.from({ length: 12 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="aspect-[3/4] rounded-xl bg-[#181c20] animate-pulse"
                                />
                            ))}

                        </div>
                    )}

                    {/* People Grid */}
                    {!loading && filteredPeople.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">

                            {filteredPeople.map((person) => {
                                const imageUrl = getImageUrl(
                                    person.profile_path
                                );

                                const role = getPersonRole(person);

                                return (
                                    <div
                                        key={person.id}
                                        onClick={() =>
                                            handlePersonClick(person.id)
                                        }
                                        className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[#0b0f12] cursor-pointer shadow-md transform transition-all duration-300 hover:-translate-y-1"
                                    >

                                        {/* Image */}
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={person.name}
                                                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                onError={(event) => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#181c20] to-[#0b0f12]">
                                                <span className="material-symbols-outlined text-6xl text-[#2C3440]">
                                                    person
                                                </span>
                                            </div>
                                        )}

                                        {/* Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                                        {/* Hover border */}
                                        <div className="absolute inset-0 rounded-xl pointer-events-none group-hover:ring-2 group-hover:ring-[#43fe6d] transition-all duration-300" />

                                        {/* Role */}
                                        <div className="absolute top-3.5 left-3.5">
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-[#2C3440]/90 text-[#43fe6d] font-semibold tracking-wider uppercase">
                                                {role}
                                            </span>
                                        </div>

                                        {/* Bookmark */}
                                        <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-8 h-8 rounded-full bg-[#0B0D0F]/80 backdrop-blur-md flex items-center justify-center text-[#43fe6d]">
                                                <span className="material-symbols-outlined text-[18px]">
                                                    bookmark_add
                                                </span>
                                            </div>
                                        </div>

                                        {/* Person information */}
                                        <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col gap-1">

                                            <h3 className="text-lg font-semibold text-white group-hover:text-[#43fe6d] transition-colors tracking-tight line-clamp-1">
                                                {person.name}
                                            </h3>

                                            <p className="text-xs text-[#99AABB] uppercase tracking-wider line-clamp-1">
                                                {role}
                                            </p>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                    {/* No Results */}
                    {!loading && filteredPeople.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-[#181c20]/50 rounded-2xl">

                            <span className="material-symbols-outlined text-[#99AABB] text-[48px]">
                                person_search
                            </span>

                            <div className="space-y-1">

                                <h4 className="text-xl font-semibold text-white">
                                    No film personalities found
                                </h4>

                                <p className="text-sm text-[#99AABB]">
                                    Try adjusting your search query or reset the active filters.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-5 py-2.5 rounded-lg bg-[#2C3440] hover:bg-[#262a2f] text-[#43fe6d] text-sm transition-colors"
                            >
                                Clear All Filters
                            </button>

                        </div>
                    )}

                    {/* Load More */}
                    {!loading &&
                        filteredPeople.length > 0 &&
                        people.length < totalResults && (
                            <div className="pt-10 flex flex-col items-center justify-center gap-4">

                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#181c20] hover:bg-[#1c2024] text-white transition-all disabled:opacity-50"
                                >

                                    {loadingMore ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[#43fe6d]">
                                                progress_activity
                                            </span>

                                            <span className="text-sm">
                                                Loading...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm font-medium tracking-wide">
                                                Load More People
                                            </span>

                                            <span className="material-symbols-outlined text-[#43fe6d] text-[18px] group-hover:translate-y-0.5 transition-transform">
                                                expand_more
                                            </span>
                                        </>
                                    )}

                                </button>

                                <span className="text-xs text-[#99AABB]/70 tracking-wider uppercase">
                                    SHOWING {filteredPeople.length} OF {totalResults.toLocaleString()} PEOPLE
                                </span>

                            </div>
                        )}

                </section>
            </main>

            <Footer />
        </>
    );
}

export default People;