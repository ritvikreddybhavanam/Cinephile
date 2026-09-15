import api from "./api";

export const getWatchedMovies = async () => {
    const response = await api.get("/watched");
    return response.data;
};

export const addToWatched = async (movie) => {
    const response = await api.post("/watched", {
        movieId: movie.id,
        title: movie.title,
        poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
        year: movie.release_date
            ? Number(movie.release_date.substring(0, 4))
            : null,
        genre: movie.genres
            ? movie.genres.map((genre) => genre.name).join(", ")
            : movie.genre || null,
        service: movie.service || null,
        rating: movie.vote_average ?? null
    });

    return response.data;
};

export const removeFromWatched = async (movieId) => {
    const response = await api.delete(
        `/watched/${movieId}`
    );

    return response.data;
};

export const checkWatched = async (movieId) => {
    const response = await api.get(
        `/watched/check/${movieId}`
    );

    return response.data;
};