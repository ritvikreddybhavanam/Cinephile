import 'package:flutter/foundation.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/notification_item.dart';

/// Service managing in-app notifications and unread badges.
class NotificationService extends ChangeNotifier {
  final ApiClient _apiClient;
  List<NotificationItem> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;

  NotificationService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  List<NotificationItem> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  /// Fetch all notifications
  Future<List<NotificationItem>> fetchNotifications() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiEndpoints.notifications);
      if (response is List) {
        _notifications = response
            .whereType<Map<String, dynamic>>()
            .map((item) => NotificationItem.fromJson(item))
            .toList();
        _unreadCount = _notifications.where((n) => !n.isRead).length;
      }
      return _notifications;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetch unread badge count
  Future<int> fetchUnreadCount() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.notificationsUnreadCount);
      if (response is Map<String, dynamic>) {
        _unreadCount = (response['unreadCount'] as num?)?.toInt() ?? 0;
      } else if (response is num) {
        _unreadCount = response.toInt();
      }
      notifyListeners();
      return _unreadCount;
    } catch (_) {
      return _unreadCount;
    }
  }

  /// Mark single notification as read
  Future<void> markAsRead(int notificationId) async {
    final index = _notifications.indexWhere((n) => n.id == notificationId);
    if (index != -1 && !_notifications[index].isRead) {
      final old = _notifications[index];
      _notifications[index] = NotificationItem(
        id: old.id,
        title: old.title,
        message: old.message,
        type: old.type,
        isRead: true,
        referenceId: old.referenceId,
        actorName: old.actorName,
        createdAt: old.createdAt,
      );
      if (_unreadCount > 0) _unreadCount--;
      notifyListeners();
    }

    try {
      await _apiClient.put(ApiEndpoints.notificationRead(notificationId));
    } catch (_) {}
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    _notifications = _notifications
        .map((old) => NotificationItem(
              id: old.id,
              title: old.title,
              message: old.message,
              type: old.type,
              isRead: true,
              referenceId: old.referenceId,
              actorName: old.actorName,
              createdAt: old.createdAt,
            ))
        .toList();
    _unreadCount = 0;
    notifyListeners();

    try {
      await _apiClient.put(ApiEndpoints.notificationsReadAll);
    } catch (_) {}
  }

  /// Clear all notifications
  Future<void> clearAll() async {
    _notifications.clear();
    _unreadCount = 0;
    notifyListeners();

    try {
      await _apiClient.delete(ApiEndpoints.notificationsClear);
    } catch (_) {}
  }
}
