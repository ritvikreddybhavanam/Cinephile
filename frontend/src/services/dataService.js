import api, { API_BASE_URL } from "./api";

/**
 * Upload single or multiple CSV files or ZIP archive (Letterboxd / IMDb / Generic)
 */
export const importCsvFiles = async (files, type = null) => {
    const formData = new FormData();
    if (Array.isArray(files) || files instanceof FileList) {
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }
        if (files.length > 0) {
            formData.append("file", files[0]);
        }
    } else if (files) {
        formData.append("file", files);
        formData.append("files", files);
    }

    if (type) {
        formData.append("type", type);
    }

    const response = await api.post("/data/import/csv", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

export const importCsvFile = importCsvFiles;

/**
 * Batch import structured rows directly
 */
export const importBatchRows = async (rows) => {
    const response = await api.post("/data/import/batch", rows);
    return response.data;
};

/**
 * Export endpoints (trigger browser file download)
 */
export const downloadCsv = (endpoint, filename) => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/data/export/${endpoint}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((res) => {
            if (!res.ok) throw new Error("Export failed");
            return res.blob();
        })
        .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch((err) => {
            console.error("Download error:", err);
            throw err;
        });
};
