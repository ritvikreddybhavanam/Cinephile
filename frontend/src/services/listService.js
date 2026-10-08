import api from "./api";

/**
 * Get all curated lists created by the logged-in user
 */
export const getMyLists = async () => {
    const response = await api.get("/lists/my");
    return response.data;
};

/**
 * Get all public curated lists from the community
 */
export const getPublicLists = async () => {
    const response = await api.get("/lists/public");
    return response.data;
};

/**
 * Get a specific list by ID with its movies
 */
export const getListById = async (listId) => {
    const response = await api.get(`/lists/${listId}`);
    return response.data;
};

/**
 * Create a new curated list (e.g. "Favorite Comedy Films")
 */
export const createList = async (listData) => {
    const response = await api.post("/lists", listData);
    return response.data;
};

/**
 * Update an existing list
 */
export const updateList = async (listId, listData) => {
    const response = await api.put(`/lists/${listId}`, listData);
    return response.data;
};

/**
 * Delete a list
 */
export const deleteList = async (listId) => {
    const response = await api.delete(`/lists/${listId}`);
    return response.data;
};

/**
 * Add a movie to a list
 */
export const addMovieToList = async (listId, movie) => {
    const response = await api.post(`/lists/${listId}/items`, {
        movieId: movie.id || movie.movieId,
        title: movie.title || movie.name,
        poster: movie.poster || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null),
        year: movie.year || (movie.release_date ? Number(movie.release_date.substring(0, 4)) : null),
        genre: movie.genre || (Array.isArray(movie.genres) ? movie.genres.map(g => g.name).join(", ") : null),
        rating: movie.rating || movie.vote_average || null,
        note: movie.note || null,
        position: movie.position || 0
    });
    return response.data;
};

/**
 * Remove a movie from a list
 */
export const removeMovieFromList = async (listId, movieId) => {
    const response = await api.delete(`/lists/${listId}/items/${movieId}`);
    return response.data;
};
