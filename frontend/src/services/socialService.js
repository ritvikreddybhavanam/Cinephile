import api from "./api";

/**
 * Follow a user by ID
 */
export const followUser = async (userId) => {
    const response = await api.post(`/social/follow/${userId}`);
    return response.data;
};

/**
 * Unfollow a user by ID
 */
export const unfollowUser = async (userId) => {
    const response = await api.delete(`/social/follow/${userId}`);
    return response.data;
};

/**
 * Check if the logged-in user is following a user
 */
export const isFollowingUser = async (userId) => {
    const response = await api.get(`/social/is-following/${userId}`);
    return response.data?.isFollowing || false;
};

/**
 * Get followers list for a user
 */
export const getFollowers = async (userId) => {
    const response = await api.get(`/social/followers/${userId}`);
    return response.data;
};

/**
 * Get following list for a user
 */
export const getFollowing = async (userId) => {
    const response = await api.get(`/social/following/${userId}`);
    return response.data;
};

/**
 * Get follower & following counts
 */
export const getFollowCounts = async (userId) => {
    const response = await api.get(`/social/counts/${userId}`);
    return response.data;
};

/**
 * Get personalized friend activity feed
 */
export const getPersonalizedFeed = async () => {
    const response = await api.get("/social/feed");
    return response.data;
};

/**
 * Get global community feed
 */
export const getGlobalCommunityFeed = async () => {
    const response = await api.get("/social/community-feed");
    return response.data;
};

/**
 * Get suggested cinephiles to follow
 */
export const getSuggestedUsers = async (limit = 5) => {
    const response = await api.get(`/social/suggestions?limit=${limit}`);
    return response.data;
};

/**
 * Toggle like on a review
 */
export const toggleLikeReview = async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/like`);
    return response.data;
};

/**
 * Get like status and count for a review
 */
export const getReviewLikes = async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}/likes`);
    return response.data;
};

/**
 * Get comments for a review
 */
export const getReviewComments = async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}/comments`);
    return response.data;
};

/**
 * Add a comment or reply to a review
 */
export const addReviewComment = async (reviewId, content, parentId = null) => {
    const response = await api.post(`/reviews/${reviewId}/comments`, { content, parentId });
    return response.data;
};

/**
 * Delete a review comment
 */
export const deleteReviewComment = async (commentId) => {
    const response = await api.delete(`/reviews/comments/${commentId}`);
    return response.data;
};

