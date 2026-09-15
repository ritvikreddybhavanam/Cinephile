import api from "./api";

const parseResponse = (data) => {
    return typeof data === "string" ? JSON.parse(data) : data;
};

export const getPersonDetails = async (personId) => {
    const response = await api.get(`/tmdb/person/${personId}`);
    return parseResponse(response.data);
};

export const getPersonCredits = async (personId) => {
    const response = await api.get(
        `/tmdb/person/${personId}/credits`
    );

    return parseResponse(response.data);
};

export const getPersonImages = async (personId) => {
    const response = await api.get(
        `/tmdb/person/${personId}/images`
    );

    return parseResponse(response.data);
};

export const getPersonExternalIds = async (personId) => {
    const response = await api.get(
        `/tmdb/person/${personId}/external-ids`
    );

    return parseResponse(response.data);
};

export const getPopularPeople = async (page = 1) => {
    const response = await api.get(
        "/tmdb/people/popular",
        {
            params: {
                page
            }
        }
    );

    return parseResponse(response.data);
};

export const searchPeople = async (query, page = 1) => {
    const response = await api.get(
        "/tmdb/people/search",
        {
            params: {
                query,
                page
            }
        }
    );

    return parseResponse(response.data);
};