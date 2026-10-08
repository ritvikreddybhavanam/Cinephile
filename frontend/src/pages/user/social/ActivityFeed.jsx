import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";
import {
    getPersonalizedFeed,
    getGlobalCommunityFeed,
    getSuggestedUsers
} from "../../../services/socialService.js";
import ActivityFeedCard from "../../../components/social/ActivityFeedCard.jsx";
import FollowButton from "../../../components/social/FollowButton.jsx";

export default function ActivityFeed() {
    useDocumentTitle("Activity Feed & Social — Cinephile");

    const [activeTab, setActiveTab] = useState("friends"); // "friends" | "global"
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("ALL"); // "ALL" | "DIARY_LOG" | "REVIEW" | "LIST_CREATED"
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    useEffect(() => {
        loadFeed(activeTab);
        loadSuggestions();
    }, [activeTab]);

    const loadFeed = async (tab) => {
        try {
            setLoading(true);
            if (tab === "friends") {
                const data = await getPersonalizedFeed();
                setFeedItems(Array.isArray(data) ? data : []);
            } else {
                const data = await getGlobalCommunityFeed();
                setFeedItems(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Failed to load feed:", err);
            // Fallback to community if friends is empty or unauthorized
            if (tab === "friends") {
                try {
                    const globalData = await getGlobalCommunityFeed();
                    setFeedItems(Array.isArray(globalData) ? globalData : []);
                } catch {
                    setFeedItems([]);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const loadSuggestions = async () => {
        try {
            setSuggestionsLoading(true);
            const data = await getSuggestedUsers(5);
            setSuggestions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load suggestions:", err);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const filteredItems = feedItems.filter((item) => {
        if (filterType === "ALL") return true;
        return item.type === filterType;
    });

    return (
        <div className="min-h-screen bg-bg text-text antialiased font-sans flex flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 sm:px-6 py-8 sm:py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <span className="label-caps mb-1">Cinephile Social Network</span>
                        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text">
                            Activity Feed
                        </h1>
                        <p className="text-xs sm:text-sm text-text-3 mt-1">
                            Discover what your fellow cinephiles are watching, reviewing, and curating.
                        </p>
                    </div>

                    {/* Feed Tabs: Friends vs Global Community */}
                    <div className="flex rounded-xl border border-border bg-surface p-1 self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab("friends")}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                                activeTab === "friends"
                                    ? "bg-accent text-bg font-bold shadow-sm"
                                    : "text-text-2 hover:text-text"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">group</span>
                            <span>Friends Following</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("global")}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                                activeTab === "global"
                                    ? "bg-accent text-bg font-bold shadow-sm"
                                    : "text-text-2 hover:text-text"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">public</span>
                            <span>Explore Community</span>
                        </button>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
                    {[
                        { id: "ALL", label: "All Activity", icon: "dynamic_feed" },
                        { id: "DIARY_LOG", label: "Film Logs", icon: "edit_calendar" },
                        { id: "REVIEW", label: "Reviews", icon: "rate_review" },
                        { id: "LIST_CREATED", label: "Curated Lists", icon: "featured_play_list" }
                    ].map((pill) => (
                        <button
                            key={pill.id}
                            type="button"
                            onClick={() => setFilterType(pill.id)}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors shrink-0 cursor-pointer border ${
                                filterType === pill.id
                                    ? "bg-accent text-bg border-accent font-semibold"
                                    : "bg-surface text-text-2 border-border hover:bg-surface-2"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[15px]">{pill.icon}</span>
                            <span>{pill.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Layout with Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left / Center Feed Stream */}
                    <div className="lg:col-span-8 space-y-4">
                        {loading ? (
                            <div className="flex min-h-[40vh] items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-9 w-9 animate-spin rounded-full border-3 border-border border-t-accent" />
                                    <p className="text-xs text-text-3">Loading cinephile feed...</p>
                                </div>
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <div className="space-y-4">
                                {filteredItems.map((item) => (
                                    <ActivityFeedCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                                <span className="material-symbols-outlined text-5xl text-text-3 mb-3">
                                    rss_feed
                                </span>
                                <h3 className="font-serif text-lg font-bold text-text mb-1">
                                    {activeTab === "friends"
                                        ? "No recent activity from your followed friends"
                                        : "No activity records found"}
                                </h3>
                                <p className="text-xs text-text-3 max-w-sm mx-auto mb-6">
                                    {activeTab === "friends"
                                        ? "Follow other film lovers below or switch to the Global Community tab to discover what everyone is watching."
                                        : "Start by logging a film in your Diary or writing your first review!"}
                                </p>
                                {activeTab === "friends" ? (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("global")}
                                        className="btn-primary text-xs py-2 px-5 cursor-pointer"
                                    >
                                        Explore Global Feed
                                    </button>
                                ) : (
                                    <Link to="/movies" className="btn-primary text-xs py-2 px-5 no-underline">
                                        Browse Films
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar: Suggested Cinephiles & Quick Actions */}
                    <aside className="lg:col-span-4 space-y-6">
                        {/* Who to follow box */}
                        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif text-base font-bold text-text flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent text-lg">person_search</span>
                                    <span>Who to Follow</span>
                                </h3>
                                <span className="label-caps text-[9px]">Cinephiles</span>
                            </div>

                            {suggestionsLoading ? (
                                <div className="space-y-3 py-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-12 bg-surface-2 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : suggestions.length > 0 ? (
                                <div className="space-y-3.5">
                                    {suggestions.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-surface-2/60 hover:bg-surface-2 transition-colors"
                                        >
                                            <Link
                                                to={`/profile/${user.id}`}
                                                className="flex items-center gap-2.5 min-w-0 no-underline group"
                                            >
                                                <div className="h-9 w-9 shrink-0 rounded-full border border-border bg-surface overflow-hidden flex items-center justify-center font-bold text-accent text-xs">
                                                    {user.avatarUrl ? (
                                                        <img
                                                            src={user.avatarUrl}
                                                            alt={user.firstname}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{user.firstname?.charAt(0) || "C"}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                                                        {user.firstname} {user.lastname}
                                                    </p>
                                                    <p className="text-[10px] text-text-3 truncate">
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
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-text-3 py-2">
                                    You are following all active cinephiles!
                                </p>
                            )}
                        </div>

                        {/* Quick Action Box */}
                        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-3">
                            <h4 className="font-serif text-sm font-bold text-text">
                                Share with the Community
                            </h4>
                            <p className="text-xs text-text-3 leading-relaxed">
                                Keep your film journal up-to-date and share your thoughts with friends.
                            </p>
                            <div className="flex flex-col gap-2 pt-1">
                                <Link
                                    to="/diary"
                                    className="btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-2 no-underline"
                                >
                                    <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                                    <span>Log a Film to Diary</span>
                                </Link>
                                <Link
                                    to="/lists"
                                    className="btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-2 no-underline"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    <span>Create Curated List</span>
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}
