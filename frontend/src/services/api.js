import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {

        const publicEndpoints = [
            "/auth/login",
            "/auth/register",
            "/auth/verify-email"
        ];

        const isPublicEndpoint =
            publicEndpoints.some(
                (endpoint) =>
                    config.url?.includes(endpoint)
            );

        if (!isPublicEndpoint) {

            const token =
                localStorage.getItem("token");

            if (token) {
                config.headers.Authorization =
                    `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;