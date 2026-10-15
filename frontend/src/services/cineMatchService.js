import api from "./api";

export const createCineMatchRoom = async (filters = {}) => {
    const response = await api.post("/cinematch/create", filters);
    return response.data;
};

export const joinCineMatchRoom = async (roomCode) => {
    const response = await api.post(`/cinematch/join/${roomCode}`);
    return response.data;
};

export const getCineMatchRoomStatus = async (roomCode) => {
    const response = await api.get(`/cinematch/room/${roomCode}`);
    return response.data;
};

export const startCineMatchSwiping = async (roomCode) => {
    const response = await api.post(`/cinematch/room/${roomCode}/start`);
    return response.data;
};

export const swipeCineMatchMovie = async (roomCode, movieId, isLike) => {
    const response = await api.post(`/cinematch/room/${roomCode}/swipe`, {
        movieId,
        isLike
    });
    return response.data;
};

export const resetCineMatchRoom = async (roomCode) => {
    const response = await api.post(`/cinematch/room/${roomCode}/reset`);
    return response.data;
};
