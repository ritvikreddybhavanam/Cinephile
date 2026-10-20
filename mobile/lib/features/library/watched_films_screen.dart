import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/watched_movie.dart';
import '../../services/watched_service.dart';
import '../../widgets/cine_app_bar.dart';
import '../../widgets/empty_view.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/rating_badge.dart';

/// Screen displaying films marked as watched with rating, platform, and date.
class WatchedFilmsScreen extends StatefulWidget {
  const WatchedFilmsScreen({super.key});

  @override
  State<WatchedFilmsScreen> createState() => _WatchedFilmsScreenState();
}

class _WatchedFilmsScreenState extends State<WatchedFilmsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WatchedService>().fetchWatchedMovies();
    });
  }

  Future<void> _removeWatched(WatchedMovie item) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    try {
      await context.read<WatchedService>().removeFromWatched(item.movieId);
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Removed "${item.title}" from watched log'),
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final watchedService = context.watch<WatchedService>();
    final movies = watchedService.watchedMovies;
    final isLoading = watchedService.isLoading && movies.isEmpty;

    return Scaffold(
      appBar: const CineAppBar(title: 'Watched Films'),
      body: isLoading
          ? const CineLoadingIndicator(message: 'Loading watched history...')
          : movies.isEmpty
              ? CineEmptyView(
                  title: 'No Watched Films Yet',
                  subtitle:
                      'Keep track of every screening. Mark films as watched or log them in your diary.',
                  icon: Icons.check_circle_outline_rounded,
                  action: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pushNamed(RouteNames.discover);
                    },
                    child: const Text('Browse Cinema'),
                  ),
                )
              : Column(
                  children: [
                    // Stats banner
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.all(AppSpacing.md),
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.lg,
                        vertical: AppSpacing.md,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.movie_creation_outlined,
                              color: AppColors.accent,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${movies.length} Films Watched',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const Text(
                                'Personal viewing archive and history',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Grid
                    Expanded(
                      child: RefreshIndicator(
                        color: AppColors.accent,
                        backgroundColor: AppColors.surfaceElevated,
                        onRefresh: () =>
                            context.read<WatchedService>().fetchWatchedMovies(),
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            final crossAxisCount = constraints.maxWidth > 900
                                ? 5
                                : constraints.maxWidth > 600
                                    ? 3
                                    : 2;

                            return GridView.builder(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                              ),
                              physics: const AlwaysScrollableScrollPhysics(),
                              gridDelegate:
                                  SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: crossAxisCount,
                                childAspectRatio: 0.58,
                                crossAxisSpacing: AppSpacing.sm,
                                mainAxisSpacing: AppSpacing.md,
                              ),
                              itemCount: movies.length,
                              itemBuilder: (context, index) {
                                final item = movies[index];
                                return _buildWatchedCard(context, item);
                              },
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildWatchedCard(BuildContext context, WatchedMovie item) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pushNamed(
          RouteNames.movieDetails,
          arguments: item.movieId,
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (item.posterUrl != null)
                    Image.network(
                      item.posterUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AppColors.surfaceElevated,
                        child: const Icon(
                          Icons.movie_outlined,
                          color: AppColors.textMuted,
                          size: 32,
                        ),
                      ),
                    )
                  else
                    Container(
                      color: AppColors.surfaceElevated,
                      child: const Icon(
                        Icons.movie_outlined,
                        color: AppColors.textMuted,
                        size: 32,
                      ),
                    ),

                  // Rating Badge
                  if (item.rating != null && item.rating! > 0)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: RatingBadge(rating: item.rating!),
                    ),

                  // Service/Platform tag
                  if (item.service != null && item.service!.isNotEmpty)
                    Positioned(
                      bottom: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.background.withValues(alpha: 0.85),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppColors.border, width: 0.5),
                        ),
                        child: Text(
                          item.service!,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.accent,
                          ),
                        ),
                      ),
                    ),

                  // Delete button
                  Positioned(
                    top: 8,
                    left: 8,
                    child: GestureDetector(
                      onTap: () => _removeWatched(item),
                      child: Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: AppColors.background.withValues(alpha: 0.8),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close_rounded,
                          color: AppColors.textMuted,
                          size: 14,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      if (item.year != null) ...[
                        Text(
                          '${item.year}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Text('•', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                        const SizedBox(width: 4),
                      ],
                      Expanded(
                        child: Text(
                          item.watchedAt != null
                              ? _formatDate(item.watchedAt!)
                              : '',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
