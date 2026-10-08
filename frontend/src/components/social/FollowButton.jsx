import { useState, useEffect } from "react";
import { followUser, unfollowUser, isFollowingUser } from "../../services/socialService";
import { useToast } from "../../context/ToastContext";

export default function FollowButton({ targetUserId, initialFollowing = false, onFollowChange, size = "md", className = "" }) {
    const { success, error, info } = useToast();
    const [following, setFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFollowing(initialFollowing);
    }, [initialFollowing]);

    useEffect(() => {
        if (targetUserId && initialFollowing === undefined) {
            isFollowingUser(targetUserId)
                .then((res) => setFollowing(res))
                .catch(() => {});
        }
    }, [targetUserId, initialFollowing]);

    const handleToggle = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            info("Please log in to follow other cinephiles.");
            return;
        }

        try {
            setLoading(true);
            if (following) {
                await unfollowUser(targetUserId);
                setFollowing(false);
                info("Unfollowed user.");
                if (onFollowChange) onFollowChange(false);
            } else {
                await followUser(targetUserId);
                setFollowing(true);
                success("Following user!");
                if (onFollowChange) onFollowChange(true);
            }
        } catch (err) {
            console.error("Follow error:", err);
            error("Failed to update follow status.");
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = {
        sm: "text-xs py-1 px-3",
        md: "text-xs py-1.5 px-4",
        lg: "text-sm py-2 px-5"
    }[size] || "text-xs py-1.5 px-4";

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={loading}
            className={`rounded-full font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${sizeClasses} ${
                following
                    ? "bg-surface-2 border border-border text-text-2 hover:border-danger hover:text-danger hover:bg-danger/10"
                    : "bg-accent text-primary border border-accent hover:opacity-90 shadow-sm"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
            {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : following ? (
                <>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    <span>Following</span>
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined text-[14px]">person_add</span>
                    <span>Follow</span>
                </>
            )}
        </button>
    );
}
