import api from "./api";

export const getTrendingMovies = async (page = 1) => {
    const response = await api.get("/tmdb/trending", {
        params: {
            page
        }
    });

    return response.data;
};

export const getPopularMovies = async () => {
    const response = await api.get("/tmdb/popular");
    return response.data;
};

export const getMovies = async ({
                                    page = 1,
                                    sortBy = "popularity.desc",
                                    year = "",
                                    genre = "",
                                    rating = "",
                                    language = "",
                                    fromDate = "",
                                    toDate = ""
                                } = {}) => {
    const response = await api.get("/tmdb/movies", {
        params: {
            page,
            sortBy,
            year: year || undefined,
            genre: genre || undefined,
            rating: rating || undefined,
            language: language || undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined
        }
    });

    return response.data;
};

export const getNewReleases = async ({
    page = 1,
    sortBy = "primary_release_date.desc",
    year = "",
    language = "",
    fromDate = "",
    toDate = "",
    genre = ""
} = {}) => {
    return getMovies({
        page,
        sortBy,
        year,
        language,
        genre,
        fromDate,
        toDate
    });
};

export const searchMovies = async (query, page = 1) => {
    const response = await api.get("/tmdb/search", {
        params: {
            query,
            page
        }
    });

    return response.data;
};

export const getMovieDetails = async (movieId) => {
    const response = await api.get(`/tmdb/movies/${movieId}`);
    return response.data;
};

export const getMovieVideos = async (movieId) => {
    const response = await api.get(
        `/tmdb/movies/${movieId}/videos`
    );

    return response.data;
};

export const getPosterUrl = (posterPath) => {
    if (!posterPath) {
        return null;
    }

    return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

export const getBackdropUrl = (backdropPath) => {
    if (!backdropPath) {
        return null;
    }

    return `https://image.tmdb.org/t/p/original${backdropPath}`;
};

export const getGenres = async () => {
    const response = await api.get("/tmdb/genres");
    return response.data;
};

export const getMovieCredits = async (movieId) => {
    const response = await api.get(
        `/tmdb/movies/${movieId}/credits`
    );

    return response.data;
};

export const getMovieReviews = async (movieId) => {
    const response = await api.get(
        `/tmdb/movies/${movieId}/reviews`
    );

    return response.data;
};

export const getMovieRecommendations = async (movieId) => {
    const response = await api.get(
        `/tmdb/movies/${movieId}/recommendations`
    );

    return response.data;
};

export const getSimilarMovies = async (movieId) => {
    const response = await api.get(
        `/tmdb/movies/${movieId}/similar`
    );

    return response.data;
};

export const getMovieWatchProviders = async (movieId) => {
    const response = await api.get(`/tmdb/movies/${movieId}/watch/providers`);
    return response.data;
};

export const getMovieImages = async (movieId) => {
    const response = await api.get(`/tmdb/movies/${movieId}/images`);
    return response.data;
};

export const getMovieKeywords = async (movieId) => {
    const response = await api.get(`/tmdb/movies/${movieId}/keywords`);
    return response.data;
};

export const getMovieReleaseDates = async (movieId) => {
    const response = await api.get(`/tmdb/movies/${movieId}/release_dates`);
    return response.data;
};

export const likeMovie = async (movieId) => {
    const response = await api.post(`/liked-movies/${movieId}`);
    return response.data;
};

export const unlikeMovie = async (movieId) => {
    const response = await api.delete(`/liked-movies/${movieId}`);
    return response.data;
};

export const getLikeStatus = async (movieId) => {
    const response = await api.get(`/liked-movies/${movieId}/status`);
    return response.data;
};

export const getLikedMovies = async () => {
    const response = await api.get("/liked-movies");
    return response.data;
};

export const getMovieGenres = async () => {
    const response = await api.get("/tmdb/genres");
    return response.data;
};

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

export const getTopMovieLanguage = async (language) => {
    const response = await api.get("/tmdb/movies/top", {
        params: {
            language: language
        }
    });
    

    return response.data;
};


export const getLanguages = async () => {
    const response = await api.get("/tmdb/languages");
    return response.data;
};