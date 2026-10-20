/// Represents an in-app notification.
class NotificationItem {
  final int id;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final int? referenceId;
  final String? actorName;
  final DateTime? createdAt;

  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.isRead = false,
    this.referenceId,
    this.actorName,
    this.createdAt,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    if (json['createdAt'] != null) {
      try {
        parsedDate = DateTime.parse(json['createdAt'].toString());
      } catch (_) {}
    }

    return NotificationItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      title: json['title'] as String? ?? 'Notification',
      message: json['message'] as String? ?? '',
      type: json['type'] as String? ?? 'GENERAL',
      isRead: json['read'] as bool? ?? json['isRead'] as bool? ?? false,
      referenceId: (json['referenceId'] as num?)?.toInt(),
      actorName: json['actor'] is Map ? json['actor']['username'] ?? json['actor']['firstname'] : null,
      createdAt: parsedDate,
    );
  }
}
