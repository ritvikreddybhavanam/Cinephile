import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
} from "../../../services/notificationService";

function NotificationsPage() {
    useDocumentTitle("Notifications — Cinephile");

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // 'all' | 'unread'
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data || []);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await markNotificationAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to clear all notifications?")) return;
        try {
            await clearAllNotifications();
            setNotifications([]);
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
    };

    const handleClickNotification = async (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }

        if (notification.type === "FOLLOW" && notification.actorId) {
            navigate(`/profile/${notification.actorId}`);
        } else if (notification.targetMovieId) {
            navigate(`/movies/${notification.targetMovieId}`);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case "FOLLOW":
                return { icon: "person_add", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
            case "REVIEW_LIKE":
                return { icon: "favorite", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
            case "REVIEW_COMMENT":
                return { icon: "chat_bubble", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
            case "COMMENT_REPLY":
                return { icon: "reply", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
            default:
                return { icon: "notifications", color: "text-accent bg-accent/10 border-accent/20" };
        }
    };

    const formatTimestamp = (dateStr) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) return "Just now";
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
            return date.toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "unread") return !n.isRead;
        return true;
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text antialiased font-sans">
            <Navbar />

            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
                            <span className="material-symbols-outlined text-[24px]">notifications</span>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent text-bg font-bold">
                                        {unreadCount} new
                                    </span>
                                )}
                            </h1>
                            <p className="text-xs sm:text-sm text-text-3 mt-0.5">
                                Stay updated on followers, likes, comments, and replies
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-text-2 hover:text-accent hover:border-accent transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">done_all</span>
                                <span>Mark all as read</span>
                            </button>
                        )}

                        {notifications.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-text-3 hover:text-rose-400 hover:border-rose-400/40 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                                <span>Clear all</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 my-6">
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                            filter === "all"
                                ? "bg-accent text-bg border-accent"
                                : "bg-surface text-text-2 border-border hover:text-text"
                        }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("unread")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                            filter === "unread"
                                ? "bg-accent text-bg border-accent"
                                : "bg-surface text-text-2 border-border hover:text-text"
                        }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>

                {/* Notifications list */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-3">
                        <span className="material-symbols-outlined text-[32px] text-accent animate-spin">
                            progress_activity
                        </span>
                        <p className="text-sm">Loading notifications…</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-border/80 bg-surface/50 my-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-text-3 border border-border mb-3">
                            <span className="material-symbols-outlined text-[28px]">notifications_off</span>
                        </div>
                        <h3 className="text-base font-semibold text-text">No notifications found</h3>
                        <p className="text-xs sm:text-sm text-text-3 mt-1 max-w-sm">
                            {filter === "unread"
                                ? "You're all caught up! No unread notifications."
                                : "When users interact with your reviews, comments, or profile, they'll appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/60 rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
                        {filteredNotifications.map((notification) => {
                            const { icon, color } = getIconForType(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleClickNotification(notification)}
                                    className={`flex items-start gap-3.5 p-4 sm:p-5 transition-all duration-150 cursor-pointer group ${
                                        !notification.isRead
                                            ? "bg-accent/5 hover:bg-accent/10 border-l-4 border-l-accent"
                                            : "hover:bg-surface-2"
                                    }`}
                                >
                                    {/* Actor Avatar / Icon Badge */}
                                    <div className="relative shrink-0">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-surface-2 flex items-center justify-center font-bold text-xs text-text">
                                            {notification.actorAvatar ? (
                                                <img
                                                    src={notification.actorAvatar}
                                                    alt={notification.actorName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                notification.actorName?.substring(0, 2).toUpperCase() || "U"
                                            )}
                                        </div>
                                        <span
                                            className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border shadow-xs ${color}`}
                                        >
                                            <span className="material-symbols-outlined text-[11px]">{icon}</span>
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-semibold text-xs sm:text-sm text-text group-hover:text-accent transition-colors">
                                                {notification.actorName}
                                            </span>
                                            {notification.actorUsername && (
                                                <span className="text-[11px] text-text-3">
                                                    @{notification.actorUsername}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs sm:text-sm text-text-2 mt-0.5 leading-relaxed break-words">
                                            {notification.message}
                                        </p>

                                        {notification.targetMovieTitle && (
                                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-surface-2 text-[11px] font-medium text-accent border border-border/80">
                                                <span className="material-symbols-outlined text-[12px]">movie</span>
                                                <span className="truncate max-w-[200px] sm:max-w-xs">
                                                    {notification.targetMovieTitle}
                                                </span>
                                            </span>
                                        )}

                                        <div className="flex items-center gap-2 mt-2 text-[11px] text-text-3">
                                            <span>{formatTimestamp(notification.createdAt)}</span>
                                            {!notification.isRead && (
                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                        {!notification.isRead && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                title="Mark as read"
                                                className="p-1.5 rounded-lg text-text-3 hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">done</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={(e) => handleDelete(notification.id, e)}
                                            title="Delete notification"
                                            className="p-1.5 rounded-lg text-text-3 hover:text-rose-400 hover:bg-surface-2 transition-colors cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default NotificationsPage;
