import api from "./api";

export const createReview = async (review) => {
    const response = await api.post("/reviews", review);
    return response.data;
};

export const getMyReviews = async () => {
    const response = await api.get("/reviews/my");
    return response.data;
};

export const getFilmBuffReviews = async (movieId) => {
    const response = await api.get(`/reviews/movie/${movieId}`);
    return response.data;
};

export const getReview = async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
};

export const updateReview = async (reviewId, review) => {
    const response = await api.put(`/reviews/${reviewId}`, review);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
};

// ==========================================
// INSTAGRAM-STYLE LIKES & COMMENTS API
// ==========================================

export const toggleReviewLike = async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/likes`);
    return response.data;
};

export const getReviewLikes = async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}/likes`);
    return response.data;
};

export const getReviewComments = async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}/comments`);
    return response.data;
};

export const addReviewComment = async (reviewId, { content, parentId = null }) => {
    const response = await api.post(`/reviews/${reviewId}/comments`, { content, parentId });
    return response.data;
};

export const deleteReviewComment = async (reviewId, commentId) => {
    const response = await api.delete(`/reviews/${reviewId}/comments/${commentId}`);
    return response.data;
};