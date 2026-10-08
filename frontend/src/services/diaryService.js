import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/diary";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMyDiary = async () => {
    const response = await axios.get(`${API_BASE_URL}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const getDiaryByMonth = async (year, month) => {
    const response = await axios.get(`${API_BASE_URL}/month`, {
        params: { year, month },
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const logFilm = async (logData) => {
    const response = await axios.post(`${API_BASE_URL}`, logData, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const updateLog = async (logId, logData) => {
    const response = await axios.put(`${API_BASE_URL}/${logId}`, logData, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const deleteLog = async (logId) => {
    const response = await axios.delete(`${API_BASE_URL}/${logId}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const getAvailableDiaryYears = async () => {
    const response = await axios.get(`${API_BASE_URL}/years`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const getDiaryStats = async (year) => {
    const params = year ? { year } : {};
    const response = await axios.get(`${API_BASE_URL}/stats`, {
        params,
        headers: getAuthHeaders(),
    });
    return response.data;
};
