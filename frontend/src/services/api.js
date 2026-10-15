import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
const cleanApiUrl = rawApiUrl.trim().replace(/\/+$/, "");
export const API_BASE_URL = cleanApiUrl.endsWith("/api")
    ? cleanApiUrl
    : `${cleanApiUrl}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        const publicEndpoints = [
            "/auth/login",
            "/auth/register",
            "/auth/verify-email",
            "/tmdb/",
            "/prediction/"
        ];

        const isPublicEndpoint = publicEndpoints.some((endpoint) =>
            config.url?.includes(endpoint)
        );

        if (!isPublicEndpoint) {
            const token = localStorage.getItem("token");

            if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const currentToken = localStorage.getItem("token");
            if (currentToken) {
                console.warn("Session expired or token invalid. Clearing credentials.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        return Promise.reject(error);
    }
);

export default api;