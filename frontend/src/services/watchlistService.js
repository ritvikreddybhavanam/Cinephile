import api from "./api";

export const getWatchlist = async () => {
    const response = await api.get("/watchlist");
    return response.data;
};

export const addToWatchlist = async (movie) => {
    const response = await api.post("/watchlist", {
        movieId: movie.id,
        title: movie.title,
        poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null
    });

    return response.data;
};

export const removeFromWatchlist = async (movieId) => {
    const response = await api.delete(
        `/watchlist/${movieId}`
    );

    return response.data;
};

export const checkWatchlist = async (movieId) => {
    const response = await api.get(
        `/watchlist/check/${movieId}`
    );

    return response.data;
};