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
        <div className="min-h-screen bg-bg text-text font-sans antialiased">
            <Navbar />

            <main className="w-full">
                <section className="page-container w-full pt-8 md:pt-12 pb-16">

                    {/* Header */}
                    <div className="section-header mb-8">
                        <div>
                            <p className="label-caps mb-1">Artists & Visionaries</p>
                            <h1 className="font-serif text-fluid-title font-bold text-text">
                                Film Personalities
                            </h1>
                            <p className="text-sm text-text-3 mt-1 max-w-xl">
                                Explore the auteurs, cinematographers, and performers shaping global cinema.
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full max-w-md mb-8">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3 text-[18px]">
                            search
                        </span>

                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            placeholder="Search directors, actors, cinematographers…"
                            className="mc-input pl-11 rounded-lg text-sm"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-8 rounded-lg bg-error/10 border border-error/30 p-4 text-error text-sm">
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="cast-grid-fluid gap-4">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="aspect-[3/4] rounded-lg skeleton"
                                />
                            ))}
                        </div>
                    )}

                    {/* People Grid */}
                    {!loading && filteredPeople.length > 0 && (
                        <div className="cast-grid-fluid gap-4">
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
                                        className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-surface border border-border cursor-pointer shadow-card transform transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover"
                                    >
                                        {/* Image */}
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={person.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                                onError={(event) => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-surface-2 text-text-3">
                                                <span className="material-symbols-outlined text-6xl opacity-30">
                                                    person
                                                </span>
                                            </div>
                                        )}

                                        {/* Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                                        {/* Role badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className="badge badge-accent text-[10px]">
                                                {role}
                                            </span>
                                        </div>

                                        {/* Person information */}
                                        <div className="absolute bottom-0 inset-x-0 p-3.5 flex flex-col gap-0.5">
                                            <h3 className="font-serif text-base font-semibold text-text group-hover:text-accent transition-colors tracking-tight line-clamp-1">
                                                {person.name}
                                            </h3>

                                            <p className="text-[11px] text-text-3 uppercase tracking-wider line-clamp-1">
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
                        <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-surface rounded-lg border border-border p-12">
                            <span className="material-symbols-outlined text-text-3 text-[48px] opacity-40">
                                person_search
                            </span>

                            <div className="space-y-1">
                                <h4 className="font-serif text-lg font-semibold text-text">
                                    No film artists found
                                </h4>

                                <p className="text-sm text-text-3">
                                    Try adjusting your search query.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="btn-secondary text-xs py-2 px-5"
                            >
                                Clear Search
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
                                    className="btn-secondary text-xs py-2.5 px-8"
                                >

                                    {loadingMore ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[#C9A86A]">
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

                                            <span className="material-symbols-outlined text-[#C9A86A] text-[18px] group-hover:translate-y-0.5 transition-transform">
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
        </div>
    );
}

export default People;