import api from "./api";

/**
 * Fetch currently authenticated user's full profile
 */
export const getMyProfile = async () => {
    const response = await api.get("/users/profile");
    return response.data;
};

/**
 * Update authenticated user's profile
 */
export const updateMyProfile = async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
};

/**
 * Get public profile of a user by ID
 */
export const getPublicProfile = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};
