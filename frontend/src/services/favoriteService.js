import api from "./api";

export const likeMovie = async (movieId) => {
    const response = await api.post(`/liked-movies/${movieId}`);
    return response.data;
};

export const unlikeMovie = async (movieId) => {
    const response = await api.delete(`/liked-movies/${movieId}`);
    return response.data;
};

export const getLikeStatus = async (movieId) => {
    const response = await api.get(
        `/liked-movies/${movieId}/status`
    );

    return response.data;
};

export const getLikedMovies = async () => {
    const response = await api.get("/liked-movies");
    return response.data;
};