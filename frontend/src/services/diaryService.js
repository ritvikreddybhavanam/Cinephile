import api from "./api";

export const getMyDiary = async () => {
    const response = await api.get("/diary");
    return response.data;
};

export const getDiaryByMonth = async (year, month) => {
    const response = await api.get("/diary/month", {
        params: { year, month },
    });
    return response.data;
};

export const logFilm = async (logData) => {
    const response = await api.post("/diary", logData);
    return response.data;
};

export const updateLog = async (logId, logData) => {
    const response = await api.put(`/diary/${logId}`, logData);
    return response.data;
};

export const deleteLog = async (logId) => {
    const response = await api.delete(`/diary/${logId}`);
    return response.data;
};

export const getAvailableDiaryYears = async () => {
    const response = await api.get("/diary/years");
    return response.data;
};

export const getDiaryStats = async (year) => {
    const params = year ? { year } : {};
    const response = await api.get("/diary/stats", { params });
    return response.data;
};

