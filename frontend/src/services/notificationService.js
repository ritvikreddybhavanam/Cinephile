import api from "./api";

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async () => {
    const response = await api.get("/notifications");
    return response.data;
};

/**
 * Get count of unread notifications
 */
export const getUnreadNotificationCount = async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data?.unreadCount || 0;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
    const response = await api.put("/notifications/read-all");
    return response.data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
    const response = await api.delete("/notifications/clear");
    return response.data;
};
