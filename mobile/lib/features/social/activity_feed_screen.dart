import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/social_activity.dart';
import '../../services/social_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';

/// Screen displaying the social community activity feed with Following and Global tabs.
class ActivityFeedScreen extends StatefulWidget {
  const ActivityFeedScreen({super.key});

  @override
  State<ActivityFeedScreen> createState() => _ActivityFeedScreenState();
}

class _ActivityFeedScreenState extends State<ActivityFeedScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<SocialActivity> _personalizedFeed = [];
  List<SocialActivity> _globalFeed = [];
  bool _isLoadingPersonal = false;
  bool _isLoadingGlobal = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadFeeds();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadFeeds() async {
    _loadPersonalFeed();
    _loadGlobalFeed();
  }

  Future<void> _loadPersonalFeed() async {
    setState(() => _isLoadingPersonal = true);
    try {
      final items = await context.read<SocialService>().fetchPersonalizedFeed();
      if (mounted) setState(() => _personalizedFeed = items);
    } catch (_) {}
    if (mounted) setState(() => _isLoadingPersonal = false);
  }

  Future<void> _loadGlobalFeed() async {
    setState(() => _isLoadingGlobal = true);
    try {
      final items = await context.read<SocialService>().fetchGlobalFeed();
      if (mounted) setState(() => _globalFeed = items);
    } catch (_) {}
    if (mounted) setState(() => _isLoadingGlobal = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CineAppBar(
        title: 'Community Feed',
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.accent,
          labelColor: AppColors.accent,
          unselectedLabelColor: AppColors.textMuted,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [
            Tab(text: 'Following'),
            Tab(text: 'Global Community'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // 1. Personalized Feed
          _buildFeedList(
            items: _personalizedFeed,
            isLoading: _isLoadingPersonal,
            onRefresh: _loadPersonalFeed,
            emptyTitle: 'No Activity From Friends Yet',
            emptySubtitle:
                'Follow friends and fellow cinephiles to see their movie ratings, logs, and reviews in real time.',
          ),

          // 2. Global Feed
          _buildFeedList(
            items: _globalFeed,
            isLoading: _isLoadingGlobal,
            onRefresh: _loadGlobalFeed,
            emptyTitle: 'No Community Activity Yet',
            emptySubtitle:
                'Check back soon as film enthusiasts around the globe log their screenings.',
          ),
        ],
      ),
    );
  }

  Widget _buildFeedList({
    required List<SocialActivity> items,
    required bool isLoading,
    required Future<void> Function() onRefresh,
    required String emptyTitle,
    required String emptySubtitle,
  }) {
    if (isLoading && items.isEmpty) {
      return const CineLoadingIndicator(message: 'Loading community feed...');
    }

    if (items.isEmpty) {
      return CineEmptyView(
        title: emptyTitle,
        subtitle: emptySubtitle,
        icon: Icons.people_outline_rounded,
        action: ElevatedButton(
          onPressed: () {
            Navigator.of(context).pushNamed(RouteNames.discover);
          },
          child: const Text('Discover Movies'),
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.accent,
      backgroundColor: AppColors.surfaceElevated,
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.all(AppSpacing.md),
        itemCount: items.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = items[index];
          return _buildActivityCard(item);
        },
      ),
    );
  }

  Widget _buildActivityCard(SocialActivity item) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Actor / User header
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.surfaceElevated,
                backgroundImage: item.userAvatar != null
                    ? NetworkImage(item.userAvatar!)
                    : null,
                child: item.userAvatar == null
                    ? Text(
                        item.username.isNotEmpty
                            ? item.username[0].toUpperCase()
                            : 'C',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                          color: AppColors.accent,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textPrimary,
                        ),
                        children: [
                          TextSpan(
                            text: item.username,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                          TextSpan(
                            text: ' ${item.actionDescription}',
                            style: const TextStyle(color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatDate(item.createdAt),
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Movie reference row
          GestureDetector(
            onTap: () {
              Navigator.of(context).pushNamed(
                RouteNames.movieDetails,
                arguments: item.movieId,
              );
            },
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.surfaceElevated,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.border, width: 0.8),
              ),
              child: Row(
                children: [
                  if (item.moviePoster != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: Image.network(
                        item.posterUrl!,
                        width: 36,
                        height: 54,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) =>
                            const Icon(Icons.movie, size: 20),
                      ),
                    ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.movieTitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (item.content != null && item.content!.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            '"${item.content!}"',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11,
                              fontStyle: FontStyle.italic,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.textMuted,
                    size: 18,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
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
