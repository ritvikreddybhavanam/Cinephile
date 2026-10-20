import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/notification_item.dart';
import '../../services/notification_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';

/// Screen displaying the user's notifications, badges, and read state management.
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationService>().fetchNotifications();
    });
  }

  Future<void> _handleTapNotification(NotificationItem item) async {
    if (!item.isRead) {
      await context.read<NotificationService>().markAsRead(item.id);
    }

    if (item.referenceId != null && item.referenceId! > 0 && mounted) {
      Navigator.of(context).pushNamed(
        RouteNames.movieDetails,
        arguments: item.referenceId!,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final notificationService = context.watch<NotificationService>();
    final items = notificationService.notifications;
    final isLoading = notificationService.isLoading && items.isEmpty;

    return Scaffold(
      appBar: CineAppBar(
        title: 'Notifications',
        actions: [
          if (items.any((n) => !n.isRead))
            TextButton(
              onPressed: () {
                context.read<NotificationService>().markAllAsRead();
              },
              child: const Text(
                'Mark All Read',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.accent,
                ),
              ),
            ),
        ],
      ),
      body: isLoading
          ? const CineLoadingIndicator(message: 'Loading notifications...')
          : items.isEmpty
              ? const CineEmptyView(
                  title: 'All Caught Up',
                  subtitle:
                      'You will receive notifications when friends follow you, like your reviews, or invite you to CineMatch.',
                  icon: Icons.notifications_none_rounded,
                )
              : RefreshIndicator(
                  color: AppColors.accent,
                  backgroundColor: AppColors.surfaceElevated,
                  onRefresh: () =>
                      context.read<NotificationService>().fetchNotifications(),
                  child: ListView.separated(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: items.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return _buildNotificationTile(item);
                    },
                  ),
                ),
    );
  }

  Widget _buildNotificationTile(NotificationItem item) {
    return Container(
      decoration: BoxDecoration(
        color: item.isRead ? AppColors.surface : AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: item.isRead
              ? AppColors.border
              : AppColors.accent.withValues(alpha: 0.4),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        leading: Stack(
          children: [
            CircleAvatar(
              backgroundColor: item.isRead
                  ? AppColors.surface2
                  : AppColors.accent.withValues(alpha: 0.15),
              child: Icon(
                _getIconForType(item.type),
                color: item.isRead ? AppColors.textMuted : AppColors.accent,
                size: 20,
              ),
            ),
            if (!item.isRead)
              Positioned(
                top: 0,
                right: 0,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.accent,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
        title: Text(
          item.title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: item.isRead ? FontWeight.w500 : FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 3),
            Text(
              item.message,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              item.createdAt != null ? _formatDate(item.createdAt!) : '',
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
        onTap: () => _handleTapNotification(item),
      ),
    );
  }

  IconData _getIconForType(String type) {
    switch (type.toLowerCase()) {
      case 'like':
        return Icons.favorite_rounded;
      case 'follow':
        return Icons.person_add_rounded;
      case 'review':
        return Icons.rate_review_rounded;
      case 'match':
        return Icons.celebration_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  String _formatDate(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else {
      return '${diff.inDays}d ago';
    }
  }
}
