import api from "./api";

export const runPrediction = async (predictionData) => {
    try {
        const response = await api.post(
            "/prediction/predict",
            predictionData
        );

        return response.data;
    } catch (error) {
        const status = error.response?.status;

        throw new Error(
            `Prediction request failed: ${status || "unknown error"}`, { cause: error }
        );
    }
};