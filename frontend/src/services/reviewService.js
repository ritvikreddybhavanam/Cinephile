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
    const response = await api.get(
        `/reviews/movie/${movieId}`
    );

    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(
        `/reviews/${reviewId}`
    );

    return response.data;
};